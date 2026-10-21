// @spec DATA-14
// Đồng bộ cài đặt và tiến độ với tài khoản trên Supabase.
import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeProgress, type PackId } from '@/domain';
import { ApiError } from '@/lib/api-error';
import { getSupabase } from '@/lib/supabase';
import { PROGRESS_TABLE, SETTINGS_TABLE } from './api-url';
import type { RemoteProgressRow, SyncApi } from './type';

const fail = (e: { message?: string } | null) => {
  if (e) throw new ApiError('sync-failed', e.message);
};
const PACKS: PackId[] = ['global', 'fluency'];

export function supabaseSyncApi(sb: SupabaseClient): SyncApi {
  return {
    async fetchSettings(userId) {
      const { data, error } = await sb.from(SETTINGS_TABLE).select('data').eq('user_id', userId).maybeSingle();
      fail(error);
      return (data?.data as Record<string, unknown> | undefined) ?? null;
    },
    async saveSettings(userId, s) {
      const { error } = await sb.from(SETTINGS_TABLE).upsert({ user_id: userId, data: s, updated_at: new Date().toISOString() });
      fail(error);
    },
    async fetchAllProgress(userId) {
      const { data, error } = await sb.from(PROGRESS_TABLE).select('pack, lang, data').eq('user_id', userId);
      fail(error);
      const rows: RemoteProgressRow[] = [];
      for (const r of (data ?? []) as { pack: string; lang: string; data: unknown }[]) {
        const p = sanitizeProgress(r.data);
        if (p && PACKS.includes(r.pack as PackId) && /^[a-z]{2,3}$/.test(r.lang)) rows.push({ pack: r.pack as PackId, lang: r.lang, data: p });
      }
      return rows;
    },
    async fetchProgress(userId, pack, lang) {
      const { data, error } = await sb.from(PROGRESS_TABLE).select('data').eq('user_id', userId).eq('pack', pack).eq('lang', lang).maybeSingle();
      fail(error);
      return data ? sanitizeProgress(data.data) : null;
    },
    async saveProgress(userId, pack, lang, p) {
      const { error } = await sb.from(PROGRESS_TABLE).upsert({ user_id: userId, pack, lang, data: p, updated_at: new Date().toISOString() });
      fail(error);
    },
  };
}

/** null khi chưa cấu hình Supabase: chế độ trên máy không đồng bộ. */
export function createSyncApi(): SyncApi | null {
  const sb = getSupabase();
  return sb ? supabaseSyncApi(sb) : null;
}
