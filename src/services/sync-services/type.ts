// @spec DATA-14
import type { PackId, Progress, Settings } from '@/domain';

export interface RemoteProgressRow {
  pack: PackId;
  lang: string;
  data: Progress;
}

/** Đọc, ghi dữ liệu học trên tài khoản. Không có máy chủ (chế độ trên máy) thì không đồng bộ. */
export interface SyncApi {
  fetchSettings(userId: string): Promise<Partial<Settings> | null>;
  saveSettings(userId: string, s: Settings): Promise<void>;
  fetchAllProgress(userId: string): Promise<RemoteProgressRow[]>;
  fetchProgress(userId: string, pack: PackId, lang: string): Promise<Progress | null>;
  saveProgress(userId: string, pack: PackId, lang: string, p: Progress): Promise<void>;
}
