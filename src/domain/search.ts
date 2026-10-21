// @spec DATA-12
import { fold } from './text';
import type { Item, LanguageData } from './types';

const cache = new WeakMap<Item, string>();

function haystack(it: Item): string {
  let h = cache.get(it);
  if (h === undefined) {
    h = fold([it.en, it.vi, it.noteVi, it.topic, it.situation].filter(Boolean).join('\n'));
    cache.set(it, h);
  }
  return h;
}

/** Tìm trên câu gốc, nghĩa, noteVi, topic, situation; không phân biệt hoa thường và dấu; giữ thứ tự id. */
export function searchItems(data: Pick<LanguageData, 'items'>, query: string): Item[] {
  const q = fold(query);
  const sorted = [...data.items].sort((a, b) => a.id - b.id);
  if (!q) return sorted;
  return sorted.filter((it) => haystack(it).includes(q));
}
