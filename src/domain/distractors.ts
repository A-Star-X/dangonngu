// @spec DATA-08
import { hashString, normalizeMeaning, rng } from './text';
import type { Item, LanguageData } from './types';

export interface Choice {
  itemId: number;
  text: string;
  correct: boolean;
}

/**
 * 4 lựa chọn: nghĩa đúng và 3 nghĩa nhiễu khác nhau sau chuẩn hóa, ưu tiên từ unit khác.
 * Tất định theo id câu (và ngôn ngữ, bộ), kể cả thứ tự hiển thị.
 */
export function buildChoices(data: LanguageData, item: Item): Choice[] {
  const rand = rng(hashString(`${data.pack}:${data.lang}:${item.id}`));
  const seen = new Set([normalizeMeaning(item.vi)]);
  const picked: Item[] = [];
  const myUnit = data.unitIndexOf.get(item.id);
  const n = data.items.length;

  const tryAdd = (cand: Item) => {
    if (cand.id === item.id) return;
    const key = normalizeMeaning(cand.vi);
    if (seen.has(key)) return;
    seen.add(key);
    picked.push(cand);
  };

  // Lượt 1: lấy ngẫu nhiên (tất định) từ unit khác.
  for (let tries = 0; picked.length < 3 && tries < 200 && n > 1; tries++) {
    const cand = data.items[Math.floor(rand() * n)];
    if (myUnit !== undefined && data.unitIndexOf.get(cand.id) === myUnit) continue;
    tryAdd(cand);
  }
  // Lượt 2: quét tuần tự từ một điểm bắt đầu tất định, chấp nhận cả cùng unit.
  if (picked.length < 3) {
    const start = Math.floor(rand() * n);
    for (let k = 0; k < n && picked.length < 3; k++) tryAdd(data.items[(start + k) % n]);
  }

  const choices: Choice[] = [
    { itemId: item.id, text: item.vi, correct: true },
    ...picked.map((c) => ({ itemId: c.id, text: c.vi, correct: false })),
  ];
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}
