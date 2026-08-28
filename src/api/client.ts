import { createHttp, isHttpError, type HttpRequestConfig, type HttpResponse } from "./http";
import { useUserStore } from "#stores/user";
import { notifyRequestError } from "./notify";
import { BizError, type ApiEnvelope } from "./types";

export const http = createHttp({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 15_000,
});

http.interceptors.request.use((config) => {
  const token = useUserStore.getState().token;
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isHttpError(error)) {
      const isLoginRequest = (error.config.url ?? "").includes("/auth/login");
      if (error.status === 401 && !isLoginRequest) {
        useUserStore.getState().clearAuth();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign("/login");
        }
      }
      if (!error.config.skipErrorNotify && error.code !== "ERR_CANCELED") {
        notifyRequestError(getErrorMessage(error));
      }
    }
    throw error;
  },
);

async function unwrap<T>(
  promise: Promise<HttpResponse<ApiEnvelope<T>>>,
  skipErrorNotify?: boolean,
): Promise<T> {
  const response = await promise;
  const envelope = response.data;
  if (!envelope || typeof envelope !== "object" || !("code" in envelope)) {
    const error = new BizError("响应结构异常", -1, envelope);
    if (!skipErrorNotify) {
      notifyRequestError(error.message);
    }
    throw error;
  }
  if (envelope.code !== 0) {
    const error = new BizError(envelope.message || "请求失败", envelope.code, envelope);
    if (!skipErrorNotify) {
      notifyRequestError(error.message);
    }
    throw error;
  }
  return envelope.data;
}

export const request = {
  get: <T>(url: string, params?: object, config?: HttpRequestConfig) =>
    unwrap<T>(http.get<ApiEnvelope<T>>(url, { ...config, params }), config?.skipErrorNotify),
  delete: <T>(url: string, params?: object, config?: HttpRequestConfig) =>
    unwrap<T>(http.delete<ApiEnvelope<T>>(url, { ...config, params }), config?.skipErrorNotify),
  post: <T, D = unknown>(url: string, data?: D, config?: HttpRequestConfig<D>) =>
    unwrap<T>(http.post<ApiEnvelope<T>, D>(url, data, config), config?.skipErrorNotify),
  put: <T, D = unknown>(url: string, data?: D, config?: HttpRequestConfig<D>) =>
    unwrap<T>(http.put<ApiEnvelope<T>, D>(url, data, config), config?.skipErrorNotify),
  patch: <T, D = unknown>(url: string, data?: D, config?: HttpRequestConfig<D>) =>
    unwrap<T>(http.patch<ApiEnvelope<T>, D>(url, data, config), config?.skipErrorNotify),
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof BizError) {
    return error.message;
  }
  if (isHttpError(error)) {
    const payload = error.data as ApiEnvelope | undefined;
    return payload?.message || error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "未知错误";
}
