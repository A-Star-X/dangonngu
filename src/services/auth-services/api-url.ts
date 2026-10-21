// @spec AU-06
// Địa chỉ dịch vụ đăng nhập. Đặt trong .env.local (xem .env.example); để trống thì dùng chế độ trên máy.
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim();
export const SUPABASE_ANON_KEY = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim();

export const supabaseConfigured = () => SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';

/** Khóa localStorage của chế độ trên máy. */
export const LOCAL_SESSION_KEY = 'vitasr2.auth';
export const LOCAL_USERS_KEY = 'vitasr2.local-users';
