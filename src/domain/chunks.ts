// @spec S5-04, S5-05
// Chia câu gốc thành cụm theo số từ và xáo cụm tất định cho bài Kiểm tra nhanh.
import { hashString, rng } from './text';

/** S5-04: tối đa 1 từ thì 1 cụm; 2 đến 3 từ thì 2; 4 đến 7 từ thì 3; từ 8 từ thì 4. */
export function chunkCount(words: number): number {
  if (words <= 1) return 1;
  if (words <= 3) return 2;
  if (words <= 7) return 3;
  return 4;
}

interface Seg {
  text: string;
  word: boolean;
}

function segments(text: string, lang: string): Seg[] {
  const Seg = (Intl as unknown as { Segmenter?: new (l: string, o: { granularity: 'word' }) => { segment: (t: string) => Iterable<{ segment: string; isWordLike?: boolean }> } }).Segmenter;
  if (typeof Seg === 'function') {
    try {
      return [...new Seg(lang, { granularity: 'word' }).segment(text)].map((s) => ({ text: s.segment, word: s.isWordLike === true }));
    } catch {
      // ngôn ngữ không hợp lệ: dùng cách dự phòng bên dưới
    }
  }
  // Trình duyệt chưa có Intl.Segmenter: tách theo khoảng trắng.
  return (text.match(/\s+|\S+/g) ?? []).map((t) => ({ text: t, word: !/^\s+$/.test(t) }));
}

/** Số từ của câu theo Intl.Segmenter. */
export function wordCount(text: string, lang: string): number {
  return segments(text, lang).filter((s) => s.word).length;
}

/**
 * Chia câu thành cụm. Số từ chia đều, phần dư dồn vào các cụm đầu. Dấu câu và khoảng trắng đi theo
 * cụm đứng trước (dấu ở đầu câu đi theo cụm đầu), nên ghép các cụm lại được đúng câu gốc.
 */
export function chunkSentence(text: string, lang: string): string[] {
  const segs = segments(text, lang);
  const words = segs.filter((s) => s.word).length;
  const k = chunkCount(words);
  const base = Math.floor(words / k);
  const extra = words % k;
  const sizes = Array.from({ length: k }, (_, i) => base + (i < extra ? 1 : 0));
  const chunks = [''];
  let ci = 0;
  let inChunk = 0;
  for (const s of segs) {
    if (s.word) {
      if (inChunk === sizes[ci] && ci < k - 1) {
        ci++;
        chunks.push('');
        inChunk = 0;
      }
      inChunk++;
    }
    chunks[ci] += s.text;
  }
  return chunks;
}

/** Chữ hiển thị của một cụm (bỏ khoảng trắng hai đầu). */
export const chunkLabel = (c: string) => c.trim();

/**
 * S5-05: thứ tự xáo của các cụm (mảng chỉ số), tất định theo khóa (bộ, ngôn ngữ, id câu)
 * và không trùng thứ tự đúng khi các cụm khác nhau.
 */
export function shuffleOrder(chunks: string[], key: string): number[] {
  const order = chunks.map((_, i) => i);
  const rand = rng(hashString(`${key}:sap-xep`));
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const same = (o: number[]) => o.every((idx, pos) => chunkLabel(chunks[idx]) === chunkLabel(chunks[pos]));
  if (order.length > 1 && same(order)) {
    order.push(order.shift()!);
  }
  return order;
}
