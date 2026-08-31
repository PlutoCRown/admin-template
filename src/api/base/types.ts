export interface ApiEnvelope<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export class BizError extends Error {
  readonly code: number;
  readonly payload?: unknown;

  constructor(message: string, code: number, payload?: unknown) {
    super(message);
    this.name = "BizError";
    this.code = code;
    this.payload = payload;
  }
}
