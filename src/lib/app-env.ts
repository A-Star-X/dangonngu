// @spec APP-17, AU-08
// Môi trường của bản build (NEXT_PUBLIC_APP_ENV): production, staging hoặc demo. Trống hay giá trị khác là production.
// Đọc lại mỗi lần gọi (Next vẫn thay giá trị lúc build) để test đổi được môi trường.

export type AppEnv = 'production' | 'staging' | 'demo';

export function appEnv(): AppEnv {
  const v = (process.env.NEXT_PUBLIC_APP_ENV ?? '').trim();
  return v === 'staging' || v === 'demo' ? v : 'production';
}

/** Bản dùng thử: không có đăng nhập, không dùng Supabase (AU-08). */
export const isDemo = () => appEnv() === 'demo';

/** Chỉ production cho máy tìm kiếm index (APP-17). */
export const indexable = () => appEnv() === 'production';
