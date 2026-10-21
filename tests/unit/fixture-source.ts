/// <reference types="vite/client" />
// Nguồn dữ liệu đọc bộ dữ liệu nhỏ trong fixtures/data (chỉ dùng trong test đơn vị).
import { DataLoadError, checkFile, type DataSource, type PackId } from '@/domain';

export class FixtureSource implements DataSource {
  private static readonly files = import.meta.glob('../../fixtures/data/**/*.json', { import: 'default' });

  private async get(pack: PackId, file: string, optional: boolean): Promise<unknown | null> {
    const key = `../../fixtures/data/${pack}/${checkFile(file)}`;
    const loader = FixtureSource.files[key];
    if (!loader) {
      if (optional) return null;
      throw new DataLoadError(`Fixture không có ${pack}/${file}`);
    }
    // Trả bản sao để người dùng dữ liệu không sửa được fixture dùng chung.
    return structuredClone(await loader());
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
