// @spec S8-05, DATA-06
// Xuất và nhập tiến độ của một cặp (bộ nội dung, ngôn ngữ) dưới dạng file JSON.
import { isProgress, validAttempt, validItem, validSession, type Progress, type Settings } from './progress';
import type { PackId } from './types';

export interface ProgressFile {
  app: 'vitasr2';
  kind: 'tien-do';
  pack: PackId;
  lang: string;
  exportedAt: string;
  settings: Settings;
  progress: Progress;
}

const two = (n: number) => String(n).padStart(2, '0');

/** `vitasr-tien-do-[mã ngôn ngữ]-[yyyy-mm-dd].json`, ngày theo giờ của máy. */
export function exportFileName(lang: string, now: number): string {
  const d = new Date(now);
  return `vitasr-tien-do-${lang}-${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}.json`;
}

export function makeExport(pack: PackId, lang: string, settings: Settings, progress: Progress, now: number): ProgressFile {
  return { app: 'vitasr2', kind: 'tien-do', pack, lang, exportedAt: new Date(now).toISOString(), settings, progress };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** File nhập phải đúng hoàn toàn: một phần tử sai là từ chối cả file (S8-05). */
function validProgress(v: unknown): v is Progress {
  if (!isProgress(v)) return false;
  return v.sessions.every(validSession) && v.attempts.every(validAttempt) && Object.entries(v.items).every(([id, s]) => validItem(id, s));
}

/** Tệp tiến độ lớn hơn mức này chắc chắn không phải tệp do app xuất (vài trăm KB với người học lâu năm). */
export const MAX_IMPORT_BYTES = 8 * 1024 * 1024;

/**
 * Đọc file nhập. Trả về tiến độ khi file đúng cấu trúc DATA-06 và đúng cặp (bộ, ngôn ngữ) đang học;
 * ngược lại trả về null và không thay đổi gì.
 */
export function parseImport(text: string, pack: PackId, lang: string): Progress | null {
  let raw: unknown;
  if (text.length > MAX_IMPORT_BYTES) return null;
  try {
    raw = JSON.parse(text);
  } catch {
    return null;
  }
  if (!isObj(raw) || raw.app !== 'vitasr2' || raw.kind !== 'tien-do' || raw.lang !== lang || raw.pack !== pack) return null;
  return validProgress(raw.progress) ? raw.progress : null;
}
