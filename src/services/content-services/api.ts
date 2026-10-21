// @spec DATA-05, DATA-10, APP-10
// Đọc bộ dữ liệu câu từ file JSON tĩnh. Chỉ file này gọi fetch tới dữ liệu câu.
import { DataLoadError } from '@/domain/source';
import { contentFileUrl } from './api-url';
import type { DataSource, PackId } from './type';

export class StaticFileSource implements DataSource {
  /** Các URL đã tải thành công, để nạp lại vào bộ nhớ ngoại tuyến khi service worker vừa nhận quản lý trang (APP-10). */
  private readonly loaded = new Set<string>();

  constructor(private readonly fetchImpl: typeof fetch = (...args) => fetch(...args)) {}

  /** Tải lại các file đã tải, qua service worker, để mở lại được khi ngoại tuyến. Lỗi bỏ qua. */
  async warm(): Promise<void> {
    await Promise.all([...this.loaded].map((u) => this.fetchImpl(u).catch(() => undefined)));
  }

  private async get(pack: PackId, file: string, optional: boolean): Promise<unknown | null> {
    const url = contentFileUrl(pack, file);
    let res: Response;
    try {
      res = await this.fetchImpl(url);
    } catch (e) {
      throw new DataLoadError(`Không tải được ${pack}/${file}: ${(e as Error).message}`);
    }
    if (!res.ok) {
      // Không đọc thân trả lời lỗi thì trình duyệt giữ kết nối mở mãi (trang không bao giờ hết tải mạng); hủy cho xong.
      void res.body?.cancel().catch(() => undefined);
      if (optional && res.status === 404) return null;
      throw new DataLoadError(`Không tải được ${pack}/${file}: HTTP ${res.status}`);
    }
    this.loaded.add(url);
    try {
      return await res.json();
    } catch {
      if (optional) return null;
      throw new DataLoadError(`${pack}/${file} không phải JSON`);
    }
  }

  getManifest(pack: PackId) {
    return this.get(pack, 'manifest.json', true);
  }
  getSourceIndex(pack: PackId) {
    return this.get(pack, 'source-index.json', true);
  }
  getLanguageFile(pack: PackId, file: string) {
    return this.get(pack, file, false);
  }
  getUnitFile(pack: PackId, file: string) {
    return this.get(pack, file, false);
  }
}

export function createDataSource(): DataSource {
  return new StaticFileSource();
}
