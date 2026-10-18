// @spec DATA-08, DATA-12
// Chuẩn hóa chuỗi dùng chung.

/**
 * Bỏ dấu tiếng Việt và dấu phụ của chữ Latinh, chữ thường. "Đặt phòng" -> "dat phong".
 * Dấu của chữ khác (kana Nhật, Devanagari, Thái, Kirin "й") giữ nguyên, vì bỏ đi sẽ thành chữ khác (DATA-12).
 */
export function fold(s: string): string {
  return s
    .normalize('NFD')
    .replace(/([A-Za-z])\p{M}+/gu, '$1')
    .normalize('NFC')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Chuẩn hóa để so trùng nghĩa (DATA-08): bỏ khoảng trắng thừa, không phân biệt hoa thường, bỏ dấu câu cuối. */
export function normalizeMeaning(s: string): string {
  return s.replace(/\s+/g, ' ').trim().toLocaleLowerCase('vi').replace(/[\s.!?…,;:。！？]+$/u, '');
}

/**
 * Tên ngôn ngữ đứng giữa câu viết thường chữ đầu: "Tiếng Anh" thành "tiếng Anh" (FND-12).
 * Nhãn, tiêu đề hay lựa chọn đứng một mình thì giữ nguyên tên.
 */
// @spec FND-12
export function lowerFirst(s: string): string {
  return s.charAt(0).toLocaleLowerCase('vi') + s.slice(1);
}

/** Bộ sinh số giả ngẫu nhiên có hạt giống (mulberry32), để kết quả tất định. */
export function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
