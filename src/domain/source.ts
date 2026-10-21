// @spec DATA-05, DATA-10
// Hợp đồng nguồn dữ liệu câu. Cài đặt đọc file tĩnh nằm ở src/services/content-services (chỉ nơi đó gọi fetch).
import type { PackId } from './types';

export interface DataSource {
  /** Manifest của một bộ nội dung. null khi bộ không có (ví dụ nguồn chỉ có một bộ). */
  getManifest(pack: PackId): Promise<unknown | null>;
  /** source-index.json của bộ (nếu có), dùng cho tên gốc của ngôn ngữ (S1-02). */
  getSourceIndex(pack: PackId): Promise<unknown | null>;
  /** File ngôn ngữ theo tên file ghi trong manifest. */
  getLanguageFile(pack: PackId, file: string): Promise<unknown>;
  /** File unit theo tên file ghi trong manifest. */
  getUnitFile(pack: PackId, file: string): Promise<unknown>;
}

export class DataLoadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataLoadError';
  }
}

const SAFE_FILE = /^[A-Za-z0-9._-]+\.json$/;

/** Tên file lấy từ manifest; chỉ chấp nhận tên file đơn giản để không đọc ra ngoài thư mục bộ. */
export function checkFile(file: string): string {
  if (!SAFE_FILE.test(file)) throw new DataLoadError(`Tên file không hợp lệ: ${file}`);
  return file;
}
