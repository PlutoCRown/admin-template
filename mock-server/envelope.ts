import { ApiError, ErrorCode } from "./codes";

export function ok<T>(data: T, message = "ok") {
  return { code: ErrorCode.OK, message, data };
}

export function fail(code: number, message: string) {
  return { code, message, data: null };
}

export function paginate<T>(list: T[], page = 1, pageSize = 10) {
  const current = Math.max(1, Number(page) || 1);
  const size = Math.max(1, Number(pageSize) || 10);
  const start = (current - 1) * size;
  return {
    list: list.slice(start, start + size),
    total: list.length,
    page: current,
    pageSize: size,
  };
}

export { ApiError, ErrorCode };
