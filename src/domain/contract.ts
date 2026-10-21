// @spec DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
// Kiểm hợp đồng dữ liệu và chuẩn hóa. Dữ liệu sai hợp đồng ném DataContractError,
// lớp trên coi là lỗi tải (APP-08), không làm trắng màn.
import type { FuriganaSegment, Item, LanguageData, Manifest, ManifestLanguage, PackId, SourceIndexEntry, Unit } from './types';

export class DataContractError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DataContractError';
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const optStr = (v: unknown): string | undefined => (isStr(v) && v.trim() !== '' ? v : undefined);

export function parseManifest(pack: PackId, raw: unknown): Manifest {
  if (!isObj(raw) || !Array.isArray(raw.languages)) throw new DataContractError(`Manifest ${pack}: thiếu languages`);
  const languages: ManifestLanguage[] = raw.languages.map((l, i) => {
    if (!isObj(l) || !isStr(l.id) || !isStr(l.name) || !isStr(l.file) || !isStr(l.units)) {
      throw new DataContractError(`Manifest ${pack}: ngôn ngữ thứ ${i + 1} thiếu id, name, file hoặc units`);
    }
    return {
      id: l.id,
      name: l.name,
      locale: isStr(l.locale) ? l.locale : l.id,
      file: l.file,
      units: l.units,
      count: typeof l.count === 'number' ? l.count : undefined,
    };
  });
  return {
    pack,
    languages,
    count: typeof raw.count === 'number' ? raw.count : undefined,
    version: isStr(raw.version) ? raw.version : undefined,
  };
}

export function parseSourceIndex(raw: unknown): SourceIndexEntry[] {
  if (!isObj(raw) || !Array.isArray(raw.languages)) return [];
  return raw.languages.filter(isObj).filter((l) => isStr(l.languageId)).map((l) => ({
    languageId: l.languageId as string,
    name: optStr(l.name),
    shortName: optStr(l.shortName),
    nativeName: optStr(l.nativeName),
    locale: optStr(l.locale),
    itemCount: typeof l.itemCount === 'number' ? l.itemCount : undefined,
  }));
}

/** id dạng số, hoặc chuỗi chỉ gồm chữ số ("0001"). Chuỗi chữ là sai hợp đồng. */
export function toId(v: unknown): number | null {
  if (typeof v === 'number' && Number.isInteger(v) && v >= 0) return v;
  if (isStr(v) && /^\d+$/.test(v)) return Number(v);
  return null;
}

function parseFurigana(v: unknown): FuriganaSegment[] | undefined {
  if (!Array.isArray(v) || v.length === 0) return undefined;
  const out: FuriganaSegment[] = [];
  for (const seg of v) {
    if (!Array.isArray(seg) || !isStr(seg[0])) return undefined;
    out.push(isStr(seg[1]) && seg[1] !== '' ? [seg[0], seg[1]] : [seg[0]]);
  }
  return out;
}

export function parseItems(raw: unknown, where: string): { items: Item[]; locale?: string } {
  if (!isObj(raw) || !Array.isArray(raw.items)) throw new DataContractError(`${where}: thiếu items`);
  const items = raw.items.map((it, i) => {
    if (!isObj(it)) throw new DataContractError(`${where}: câu thứ ${i + 1} không phải object`);
    const id = typeof it.id === 'number' ? toId(it.id) : null;
    if (id === null) throw new DataContractError(`${where}: câu thứ ${i + 1} có id không hợp lệ`);
    if (!isStr(it.en) || it.en.trim() === '') throw new DataContractError(`${where}: câu ${id} thiếu en`);
    if (!isStr(it.vi) || it.vi.trim() === '') throw new DataContractError(`${where}: câu ${id} thiếu vi`);
    const item: Item = { id, en: it.en, vi: it.vi };
    const noteVi = optStr(it.noteVi);
    if (noteVi) item.noteVi = noteVi;
    const topic = optStr(it.topic);
    if (topic) item.topic = topic;
    const situation = optStr(it.situation);
    if (situation) item.situation = situation;
    const unitId = optStr(it.unitId);
    if (unitId) item.unitId = unitId;
    const reading = optStr(it.reading);
    if (reading) item.reading = reading;
    const furigana = parseFurigana(it.furigana);
    if (furigana) item.furigana = furigana;
    return item;
  });
  return { items, locale: optStr(raw.locale) };
}

export function parseUnits(raw: unknown, where: string): Unit[] {
  if (!isObj(raw) || !Array.isArray(raw.units)) throw new DataContractError(`${where}: thiếu units`);
  return raw.units.map((u, i) => {
    if (!isObj(u) || !Array.isArray(u.ids)) throw new DataContractError(`${where}: unit thứ ${i + 1} thiếu ids`);
    const ids = u.ids.map((v) => {
      const id = toId(v);
      if (id === null) throw new DataContractError(`${where}: unit thứ ${i + 1} có id không hợp lệ`);
      return id;
    });
    return {
      number: typeof u.number === 'number' ? u.number : i + 1,
      title: optStr(u.title),
      translation: optStr(u.translation),
      ids,
    };
  });
}

/** Ghép file ngôn ngữ và file unit; kiểm mọi id trong unit khớp một câu. */
export function buildLanguageData(pack: PackId, lang: ManifestLanguage, rawItems: unknown, rawUnits: unknown): LanguageData {
  const { items, locale } = parseItems(rawItems, `${pack}/${lang.file}`);
  const units = parseUnits(rawUnits, `${pack}/${lang.units}`);
  const byId = new Map<number, Item>();
  for (const it of items) byId.set(it.id, it);
  const unitIndexOf = new Map<number, number>();
  units.forEach((u, ui) => {
    for (const id of u.ids) {
      if (!byId.has(id)) throw new DataContractError(`${pack}/${lang.units}: id ${id} không có trong ${lang.file}`);
      if (!unitIndexOf.has(id)) unitIndexOf.set(id, ui);
    }
  });
  return {
    pack,
    lang: lang.id,
    locale: locale ?? lang.locale,
    items,
    byId,
    units,
    unitIndexOf,
    hasTopic: items.some((i) => i.topic),
    hasLevel: items.some((i) => i.unitId),
  };
}

/** Mã trình độ từ unitId ("A1-01" -> "A1"). */
export function levelOf(item: Item | undefined): string | undefined {
  const m = item?.unitId?.match(/^([ABC][12])-/);
  return m ? m[1] : undefined;
}
