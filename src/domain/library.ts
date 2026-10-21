// @spec T3-02, T3-03, T3-04, T2-03, DATA-04, DATA-07, DATA-12
// Lọc và phân trang danh sách câu của Thư viện; chủ đề và trình độ có trong dữ liệu.
import { levelOf } from './contract';
import { displayStatus, type DisplayStatus } from './review';
import { searchItems } from './search';
import type { Progress } from './progress';
import type { Item, LanguageData } from './types';

export const PAGE_SIZE = 32;
export const UNIT_PAGE_SIZE = 24;
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type StatusFilter = 'all' | DisplayStatus;

export interface LibraryFilter {
  q: string;
  unit: number | null;
  status: StatusFilter;
  topic: string | null;
  level: string | null;
}

export const emptyFilter = (): LibraryFilter => ({ q: '', unit: null, status: 'all', topic: null, level: null });

/** Tìm kiếm và bộ lọc kết hợp với nhau; kết quả giữ thứ tự id. */
export function filterLibrary(d: LanguageData, p: Progress, now: number, f: LibraryFilter): Item[] {
  let list = searchItems(d, f.q);
  if (f.unit !== null) {
    const ids = new Set(d.units.find((u) => u.number === f.unit)?.ids ?? []);
    list = list.filter((it) => ids.has(it.id));
  }
  if (f.status !== 'all') list = list.filter((it) => displayStatus(p.items[it.id], now) === f.status);
  if (f.topic) list = list.filter((it) => it.topic === f.topic);
  if (f.level) list = list.filter((it) => levelOf(it) === f.level);
  return list;
}

export interface TopicCount {
  topic: string;
  count: number;
}

const collator = () => new Intl.Collator('vi');

/** Các chủ đề kèm số câu, theo thứ tự chữ cái (T3-03). */
export function topicsAlphabetical(d: LanguageData): TopicCount[] {
  const m = new Map<string, number>();
  for (const it of d.items) if (it.topic) m.set(it.topic, (m.get(it.topic) ?? 0) + 1);
  const c = collator();
  return [...m.entries()].map(([topic, count]) => ({ topic, count })).sort((a, b) => c.compare(a.topic, b.topic));
}

/** Các chủ đề có nhiều câu nhất trước; bằng nhau thì theo chữ cái (T2-03). */
export function topicsByCount(d: LanguageData): TopicCount[] {
  const c = collator();
  return topicsAlphabetical(d).sort((a, b) => b.count - a.count || c.compare(a.topic, b.topic));
}

/** Các trình độ có trong dữ liệu, theo thứ tự A1 đến C2. */
export function levelsIn(d: LanguageData): string[] {
  const have = new Set(d.items.map((it) => levelOf(it)).filter(Boolean));
  return LEVELS.filter((l) => have.has(l));
}

export const pad4 = (id: number) => String(id).padStart(4, '0');

export function pageCount(total: number, size = PAGE_SIZE): number {
  return Math.max(1, Math.ceil(total / size));
}
