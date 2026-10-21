// @spec S3-05
/** Gợi ý: chữ đầu tiên của nghĩa và số từ. Câu hiển thị lấy từ file ngôn ngữ giao diện (s3.hint). */
export function hintParts(vi: string): { first: string; words: number } {
  const first = [...vi.trim()].find((ch) => /[\p{L}\p{N}]/u.test(ch)) ?? vi.trim().charAt(0);
  const words = vi.trim().split(/\s+/).filter(Boolean).length;
  return { first, words };
}
