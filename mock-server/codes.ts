export const ErrorCode = {
  OK: 0,
  BAD_REQUEST: 40000,
  UNAUTHORIZED: 40100,
  NOT_FOUND: 40400,
  INTERNAL: 50000,
} as const;

export type ErrorCodeValue = (typeof ErrorCode)[keyof typeof ErrorCode];

export class ApiError extends Error {
  readonly code: number;
  readonly status: number;

  constructor(code: number, message: string, status = Math.trunc(code / 100)) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}
