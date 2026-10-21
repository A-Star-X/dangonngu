// @spec DATA-01, DATA-02, DATA-03, DATA-04, DATA-13
// Kiểu dữ liệu sau khi đã kiểm hợp đồng và chuẩn hóa.

export type PackId = 'global' | 'fluency';

export interface ManifestLanguage {
  id: string;
  name: string;
  locale: string;
  file: string;
  units: string;
  count?: number;
}

export interface Manifest {
  pack: PackId;
  count?: number;
  version?: string;
  languages: ManifestLanguage[];
}

export interface SourceIndexEntry {
  languageId: string;
  name?: string;
  shortName?: string;
  nativeName?: string;
  locale?: string;
  itemCount?: number;
}

/** Một đoạn furigana: [chữ] hoặc [chữ, cách đọc]. */
export type FuriganaSegment = [string] | [string, string];

export interface Item {
  id: number;
  /** Câu gốc. Trường luôn tên `en`, kể cả với ngôn ngữ không phải tiếng Anh (DATA-02). */
  en: string;
  /** Nghĩa tiếng Việt. */
  vi: string;
  noteVi?: string;
  topic?: string;
  situation?: string;
  unitId?: string;
  reading?: string;
  furigana?: FuriganaSegment[];
}

export interface Unit {
  /** Số thứ tự hiển thị ("Unit n"). */
  number: number;
  title?: string;
  translation?: string;
  ids: number[];
}

/** Dữ liệu của một cặp (bộ, ngôn ngữ) đã tải. */
export interface LanguageData {
  pack: PackId;
  lang: string;
  locale: string;
  items: Item[];
  byId: Map<number, Item>;
  units: Unit[];
  /** id câu -> chỉ số unit trong `units`. */
  unitIndexOf: Map<number, number>;
  hasTopic: boolean;
  hasLevel: boolean;
}
