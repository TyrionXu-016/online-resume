export const ERROR_CODES = [
  "AUTH_REQUIRED",
  "EMAIL_NOT_VERIFIED",
  "FORBIDDEN",
  "RESOURCE_NOT_FOUND",
  "VALIDATION_ERROR",
  "RESUME_NOT_FOUND",
  "RESUME_VERSION_CONFLICT",
  "RESUME_SLUG_TAKEN",
  "PUBLISH_VALIDATION_FAILED",
  "ASSET_INVALID_TYPE",
  "ASSET_TOO_LARGE",
  "ASSET_UPLOAD_FAILED",
  "ASSET_NOT_READY",
  "RATE_LIMITED",
  "INTERNAL_ERROR",
  "NOT_IMPLEMENTED",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string, status = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export type ApiErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
    requestId: string;
  };
};

export function jsonError(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, unknown>,
) {
  const body: ApiErrorBody = {
    error: {
      code,
      message,
      details,
      requestId: crypto.randomUUID(),
    },
  };

  return Response.json(body, { status });
}

export function notImplemented(capability: string) {
  return jsonError("NOT_IMPLEMENTED", `${capability} 尚未实现`, 501);
}
