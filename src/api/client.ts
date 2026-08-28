import { createHttp, isHttpError, type HttpResponse } from "./http";
import { mockAdapter } from "#mocks/adapter";
import { useUserStore } from "#stores/user";
import { BizError, type ApiEnvelope } from "./types";

const useMock = import.meta.env.VITE_USE_MOCK !== "false";

export const http = createHttp({
  baseURL: import.meta.env.VITE_API_BASE || "/api",
  timeout: 15_000,
  adapter: useMock ? mockAdapter : undefined,
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
    if (isHttpError(error) && error.status === 401) {
      useUserStore.getState().clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login");
      }
    }
    throw error;
  },
);

async function unwrap<T>(promise: Promise<HttpResponse<ApiEnvelope<T>>>): Promise<T> {
  const response = await promise;
  const envelope = response.data;
  if (!envelope || typeof envelope !== "object" || !("code" in envelope)) {
    throw new BizError("响应结构异常", -1, envelope);
  }
  if (envelope.code !== 0) {
    throw new BizError(envelope.message || "请求失败", envelope.code, envelope);
  }
  return envelope.data;
}

export const request = {
  get: <T>(url: string, params?: object) => unwrap<T>(http.get<ApiEnvelope<T>>(url, { params })),
  delete: <T>(url: string, params?: object) =>
    unwrap<T>(http.delete<ApiEnvelope<T>>(url, { params })),
  post: <T, D = unknown>(url: string, data?: D) =>
    unwrap<T>(http.post<ApiEnvelope<T>, D>(url, data)),
  put: <T, D = unknown>(url: string, data?: D) => unwrap<T>(http.put<ApiEnvelope<T>, D>(url, data)),
  patch: <T, D = unknown>(url: string, data?: D) =>
    unwrap<T>(http.patch<ApiEnvelope<T>, D>(url, data)),
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
