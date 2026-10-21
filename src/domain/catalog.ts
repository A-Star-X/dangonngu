// @spec DATA-01, DATA-13, S1-01, S1-02, S1-03
// Danh mục ngôn ngữ và bộ nội dung, tính từ các manifest.
import { parseManifest, parseSourceIndex, buildLanguageData } from './contract';
import type { DataSource } from './source';
import type { LanguageData, Manifest, ManifestLanguage, PackId } from './types';

export interface PackInfo {
  id: PackId;
  /** Tên bộ là tên sản phẩm, không dịch. Mô tả ngắn nằm trong file ngôn ngữ giao diện (packs.<id>.description). */
  name: string;
}

/** DATA-13. Thứ tự trong mảng là thứ tự hiển thị (S1-07). */
export const PACKS: PackInfo[] = [
  { id: 'global', name: 'Global English' },
  { id: 'fluency', name: 'English Fluency' },
];

export const packInfo = (id: PackId) => PACKS.find((p) => p.id === id)!;

export interface CatalogLanguage {
  id: string;
  name: string;
  nativeName?: string;
  locale: string;
  /** Các bộ có ngôn ngữ này, theo thứ tự PACKS. */
  packs: PackId[];
  /** Số câu từ `count` của manifest (chỉ khi ngôn ngữ có một bộ). */
  count?: number;
  entries: Partial<Record<PackId, ManifestLanguage>>;
}

export interface Catalog {
  languages: CatalogLanguage[];
  manifests: Partial<Record<PackId, Manifest>>;
}

function displayNative(locale: string, id: string): string | undefined {
  try {
    if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') return undefined;
    const tag = locale || id;
    const dn = new Intl.DisplayNames([tag], { type: 'language' });
    const name = dn.of(id);
    if (!name || name === id) return undefined;
    return name.charAt(0).toLocaleUpperCase(tag) + name.slice(1);
  } catch {
    return undefined;
  }
}

/** S1-01: Tiếng Anh đầu tiên, còn lại theo tên tiếng Việt A đến Z. */
export function sortLanguages(list: CatalogLanguage[]): CatalogLanguage[] {
  const collator = new Intl.Collator('vi');
  return [...list].sort((a, b) => {
    if (a.id === 'en') return -1;
    if (b.id === 'en') return 1;
    return collator.compare(a.name, b.name);
  });
}

export async function loadCatalog(source: DataSource): Promise<Catalog> {
  const manifests: Partial<Record<PackId, Manifest>> = {};
  const raws = await Promise.all(PACKS.map((p) => source.getManifest(p.id)));
  PACKS.forEach((p, i) => {
    if (raws[i] != null) manifests[p.id] = parseManifest(p.id, raws[i]);
  });
  if (!manifests.global && !manifests.fluency) throw new Error('Không có manifest nào');

  const native = new Map<string, string>();
  for (const p of PACKS) {
    if (!manifests[p.id]) continue;
    const idx = parseSourceIndex(await source.getSourceIndex(p.id).catch(() => null));
    for (const e of idx) if (e.nativeName && !native.has(e.languageId)) native.set(e.languageId, e.nativeName);
  }

  const byId = new Map<string, CatalogLanguage>();
  for (const p of PACKS) {
    const m = manifests[p.id];
    if (!m) continue;
    for (const l of m.languages) {
      let c = byId.get(l.id);
      if (!c) {
        c = { id: l.id, name: l.name, locale: l.locale, packs: [], entries: {} };
        byId.set(l.id, c);
      }
      c.packs.push(p.id);
      c.entries[p.id] = l;
    }
  }
  for (const c of byId.values()) {
    c.nativeName = native.get(c.id) ?? displayNative(c.locale, c.id);
    if (c.packs.length === 1) {
      const m = manifests[c.packs[0]]!;
      c.count = c.entries[c.packs[0]]!.count ?? m.count;
    }
  }
  return { languages: sortLanguages([...byId.values()]), manifests };
}

export async function loadLanguageData(source: DataSource, catalog: Catalog, lang: string, pack: PackId): Promise<LanguageData> {
  const entry = catalog.languages.find((l) => l.id === lang)?.entries[pack];
  if (!entry) throw new Error(`Không có ${lang} trong bộ ${pack}`);
  const [items, units] = await Promise.all([source.getLanguageFile(pack, entry.file), source.getUnitFile(pack, entry.units)]);
  return buildLanguageData(pack, entry, items, units);
}

/** Định dạng số kiểu Việt Nam: 4096 -> "4.096". */
