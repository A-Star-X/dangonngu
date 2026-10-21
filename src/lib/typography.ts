// @spec FND-06
export type SentenceSize = 'text-display-lg' | 'text-2xl' | 'text-xl';

/** Cỡ câu ngôn ngữ đích theo số ký tự: dưới 40 → 32 px; 40 đến 90 → 24 px; trên 90 → 20 px. */
export function sentenceSize(text: string): SentenceSize {
  const n = [...text].length;
  if (n < 40) return 'text-display-lg';
  if (n <= 90) return 'text-2xl';
  return 'text-xl';
}
