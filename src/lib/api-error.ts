// @spec AU-04
// Lỗi từ máy chủ (đăng nhập, đồng bộ) quy về một mã, để giao diện hiện câu báo theo ngôn ngữ giao diện (showApiError).
export type ApiErrorCode =
  | 'invalid-credentials'
  | 'email-taken'
  | 'weak-password'
  | 'email-not-confirmed'
  | 'rate-limit'
  | 'network'
  | 'sync-failed'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = 'ApiError';
  }
}

export function toApiError(e: unknown, fallback: ApiErrorCode = 'unknown'): ApiError {
  if (e instanceof ApiError) return e;
  if (e instanceof TypeError) return new ApiError('network', e.message);
  return new ApiError(fallback, e instanceof Error ? e.message : String(e));
}
