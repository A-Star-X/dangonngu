// @spec FND-04
// Font Noto cho ngôn ngữ không dùng chữ Latinh: chỉ nạp khi ngôn ngữ đang học cần (QD-05).
// File CSS và font được chép từ @fontsource vào public/fonts lúc build (scripts/copy-fonts.mjs).
const FONT_CSS: Record<string, string[]> = {
  ja: ['noto-sans-jp/400.css', 'noto-sans-jp/600.css'],
  zh: ['noto-sans-sc/400.css', 'noto-sans-sc/600.css'],
  ko: ['noto-sans-kr/400.css', 'noto-sans-kr/600.css'],
  th: ['noto-sans-thai/400.css', 'noto-sans-thai/600.css'],
  lo: ['noto-sans-lao/400.css', 'noto-sans-lao/600.css'],
  hi: ['noto-sans-devanagari/400.css', 'noto-sans-devanagari/600.css'],
  ta: ['noto-sans-tamil/400.css', 'noto-sans-tamil/600.css'],
  ru: ['noto-sans/cyrillic-400.css', 'noto-sans/cyrillic-600.css'],
};

const loaded = new Set<string>();

export function scriptFontFiles(lang: string): string[] {
  return FONT_CSS[lang] ?? [];
}

export function ensureScriptFont(lang: string): void {
  if (typeof document === 'undefined' || loaded.has(lang)) return;
  const files = FONT_CSS[lang];
  if (!files) return;
  loaded.add(lang);
  for (const f of files) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/fonts/${f}`;
    link.dataset.scriptFont = lang;
    link.onerror = () => loaded.delete(lang);
    document.head.appendChild(link);
  }
}
