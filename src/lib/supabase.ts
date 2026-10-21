// @spec AU-01, AU-06, DATA-14
// Kết nối Supabase (QD-06). Chỉ tạo khi đã cấu hình NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY;
// chưa cấu hình thì app chạy chế độ trên máy (AU-06). Phiên đăng nhập lưu trên localStorage (token và user).
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from '@/services/auth-services/api-url';

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (typeof window === 'undefined') return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: 'vitasr2.auth.supabase' },
    });
  }
  return client;
}
