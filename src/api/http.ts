export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpHeaders = Record<string, string>;

export interface HttpRequestConfig<D = unknown> {
  url?: string;
  method?: HttpMethod;
  baseURL?: string;
  headers?: HttpHeaders;
  params?: object;
  data?: D;
  timeout?: number;
  signal?: AbortSignal;
  responseType?: "json" | "text" | "blob";
  withCredentials?: boolean;
}

export interface HttpResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  config: HttpRequestConfig;
}

export type HttpAdapter = (config: ResolvedHttpRequestConfig) => Promise<HttpResponse>;

export interface ResolvedHttpRequestConfig<D = unknown> extends HttpRequestConfig<D> {
  url: string;
  method: HttpMethod;
  headers: HttpHeaders;
}

type Fulfilled<T> = (value: T) => T | Promise<T>;
type Rejected = (error: unknown) => unknown;

interface Interceptor<T> {
  fulfilled?: Fulfilled<T>;
  rejected?: Rejected;
}

class InterceptorManager<T> {
  private readonly handlers: Array<Interceptor<T> | null> = [];

  use(fulfilled?: Fulfilled<T>, rejected?: Rejected): number {
    this.handlers.push({ fulfilled, rejected });
    return this.handlers.length - 1;
  }

  eject(id: number): void {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  }

  forEach(fn: (interceptor: Interceptor<T>) => void): void {
    for (const handler of this.handlers) {
      if (handler) {
        fn(handler);
      }
    }
  }
}

export class HttpError<T = unknown> extends Error {
  readonly config: HttpRequestConfig;
  readonly status?: number;
  readonly data?: T;
  readonly response?: HttpResponse<T>;
  readonly code: string;

  constructor(options: {
    message: string;
    config: HttpRequestConfig;
    code?: string;
    status?: number;
    data?: T;
    response?: HttpResponse<T>;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "HttpError";
    this.config = options.config;
    this.code = options.code ?? "ERR_GENERIC";
    this.status = options.status;
    this.data = options.data;
    this.response = options.response;
  }
}

export function isHttpError(error: unknown): error is HttpError {
  return error instanceof HttpError;
}

function joinURL(baseURL: string, url: string): string {
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  if (!baseURL) {
    return url;
  }
  return `${baseURL.replace(/\/+$/, "")}/${url.replace(/^\/+/, "")}`;
}

function serializeParams(params: object | undefined): string {
  if (!params) {
    return "";
  }
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        search.append(key, String(item));
      }
      continue;
    }
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

function mergeHeaders(...list: Array<HttpHeaders | undefined>): HttpHeaders {
  const headers: HttpHeaders = {};
  for (const item of list) {
    if (!item) {
      continue;
    }
    for (const [key, value] of Object.entries(item)) {
      headers[key] = value;
    }
  }
  return headers;
}

async function parseBody(
  response: Response,
  responseType: HttpRequestConfig["responseType"],
): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }
  if (responseType === "blob") {
    return response.blob();
  }
  if (responseType === "text") {
    return response.text();
  }
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

const nativeAdapter: HttpAdapter = async (config) => {
  const controller = new AbortController();
  const timer =
    config.timeout && config.timeout > 0
      ? setTimeout(() => controller.abort(), config.timeout)
      : undefined;

  if (config.signal) {
    if (config.signal.aborted) {
      controller.abort();
    } else {
      config.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }
  }

  const url = `${joinURL(config.baseURL ?? "", config.url)}${serializeParams(config.params)}`;
  const headers = { ...config.headers };
  let body: BodyInit | undefined;

  if (config.data !== undefined && config.method !== "GET") {
    if (config.data instanceof FormData || config.data instanceof Blob) {
      body = config.data;
      delete headers["Content-Type"];
    } else if (typeof config.data === "string") {
      body = config.data;
    } else {
      body = JSON.stringify(config.data);
      headers["Content-Type"] ??= "application/json";
    }
  }

  try {
    const response = await fetch(url, {
      method: config.method,
      headers,
      body,
      signal: controller.signal,
      credentials: config.withCredentials ? "include" : "same-origin",
    });
    const data = await parseBody(response, config.responseType);
    const httpResponse: HttpResponse = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config,
    };

    if (response.status < 200 || response.status >= 300) {
      throw new HttpError({
        message: `Request failed with status ${response.status}`,
        config,
        code: "ERR_BAD_RESPONSE",
        status: response.status,
        data,
        response: httpResponse,
      });
    }

    return httpResponse;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new HttpError({
        message: config.signal?.aborted ? "Request canceled" : "Request timeout",
        config,
        code: config.signal?.aborted ? "ERR_CANCELED" : "ERR_TIMEOUT",
        cause: error,
      });
    }
    throw new HttpError({
      message: error instanceof Error ? error.message : "Network Error",
      config,
      code: "ERR_NETWORK",
      cause: error,
    });
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
};

export interface HttpInstance {
  defaults: HttpRequestConfig;
  interceptors: {
    request: InterceptorManager<HttpRequestConfig>;
    response: InterceptorManager<HttpResponse>;
  };
  request<T = unknown, D = unknown>(config: HttpRequestConfig<D>): Promise<HttpResponse<T>>;
  get<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  delete<T = unknown>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>;
  post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: HttpRequestConfig<D>,
  ): Promise<HttpResponse<T>>;
  put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: HttpRequestConfig<D>,
  ): Promise<HttpResponse<T>>;
  patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: HttpRequestConfig<D>,
  ): Promise<HttpResponse<T>>;
}

export interface CreateHttpOptions extends HttpRequestConfig {
  adapter?: HttpAdapter;
}

export function createHttp(instanceConfig: CreateHttpOptions = {}): HttpInstance {
  const { adapter = nativeAdapter, ...defaults } = instanceConfig;
  const interceptors = {
    request: new InterceptorManager<HttpRequestConfig>(),
    response: new InterceptorManager<HttpResponse>(),
  };

  async function request<T = unknown, D = unknown>(
    config: HttpRequestConfig<D>,
  ): Promise<HttpResponse<T>> {
    let merged: HttpRequestConfig = {
      method: "GET",
      timeout: 10_000,
      ...defaults,
      ...config,
    };
    merged.headers = mergeHeaders({ Accept: "application/json" }, defaults.headers, config.headers);

    const requestInterceptors: Interceptor<HttpRequestConfig>[] = [];
    interceptors.request.forEach((item) => requestInterceptors.push(item));

    try {
      for (const interceptor of requestInterceptors) {
        if (interceptor.fulfilled) {
          merged = await interceptor.fulfilled(merged);
        }
      }

      const resolved: ResolvedHttpRequestConfig = {
        ...merged,
        url: merged.url ?? "",
        method: merged.method ?? "GET",
        headers: merged.headers ?? {},
      };

      let response = await adapter(resolved);
      const responseInterceptors: Interceptor<HttpResponse>[] = [];
      interceptors.response.forEach((item) => responseInterceptors.push(item));

      for (const interceptor of responseInterceptors) {
        if (interceptor.fulfilled) {
          response = await interceptor.fulfilled(response);
        }
      }

      return response as HttpResponse<T>;
    } catch (error) {
      let nextError = error;
      interceptors.response.forEach((interceptor) => {
        if (interceptor.rejected) {
          nextError = interceptor.rejected(nextError);
        }
      });
      throw await nextError;
    }
  }

  return {
    defaults,
    interceptors,
    request,
    get: (url, config) => request({ ...config, url, method: "GET" }),
    delete: (url, config) => request({ ...config, url, method: "DELETE" }),
    post: (url, data, config) => request({ ...config, url, data, method: "POST" }),
    put: (url, data, config) => request({ ...config, url, data, method: "PUT" }),
    patch: (url, data, config) => request({ ...config, url, data, method: "PATCH" }),
  };
}

export function buildMockResponse<T>(
  config: HttpRequestConfig,
  body: T,
  status = 200,
  statusText = "OK",
): HttpResponse<T> {
  const headers = new Headers({ "Content-Type": "application/json" });
  return {
    data: body,
    status,
    statusText,
    headers,
    config,
  };
}
