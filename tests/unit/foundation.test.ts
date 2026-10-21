import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { sentenceSize } from '@/lib/typography';
import { themeScript } from '@/providers/theme-provider';
import { THEME_KEY } from '@/domain';

const SRC = path.resolve(process.cwd(), 'src');

function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lum([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const x = c / 255;
    return x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function contrastRgb(a: [number, number, number], b: [number, number, number]) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
const contrast = (a: string, b: string) => contrastRgb(hexToRgb(a), hexToRgb(b));
/** Màu `fg` độ mờ `alpha` phủ lên nền `bg` (ví dụ `bg-success/12` trên thẻ). */
function blend(fg: string, alpha: number, bg: string): string {
  const [a, b] = [hexToRgb(fg), hexToRgb(bg)];
  const c = a.map((x, i) => Math.round(x * alpha + b[i] * (1 - alpha)));
  return '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('');
}
function readTokens(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) out[m[1]] = m[2];
  return out;
}

describe('FND', () => {
  // @ac FND-AC02
  it('các cặp chữ và nền dùng trong giao diện đạt tương phản (sáng và tối)', () => {
    const css = readFileSync(path.join(SRC, 'styles/theme.css'), 'utf8');
    const rootStart = css.indexOf(':root {');
    const light = readTokens(css.slice(rootStart, css.indexOf('}', rootStart)));
    const darkStart = css.indexOf('.dark {');
    const dark = readTokens(css.slice(darkStart, css.indexOf('}', darkStart)));
    // [chữ, nền, ngưỡng]: chữ thường 4.5.
    const pairs: [string, string, number][] = [
      ['foreground', 'background', 4.5],
      ['foreground', 'card', 4.5],
      ['foreground', 'muted', 4.5],
      ['foreground', 'sidebar', 4.5],
      ['sidebar-accent-foreground', 'sidebar-accent', 4.5],
      ['foreground', 'warning-soft', 4.5],
      ['foreground', 'danger-soft', 4.5],
      ['muted-foreground', 'background', 4.5],
      ['muted-foreground', 'card', 4.5],
      ['muted-foreground', 'sidebar', 4.5],
      ['muted-foreground', 'neutral-soft', 4.5],
      ['primary-foreground', 'primary', 4.5],
      ['primary', 'background', 4.5],
      ['primary', 'card', 4.5],
      ['success', 'card', 4.5],
      ['success', 'background', 4.5],
      ['success-foreground', 'success', 4.5],
      ['warning', 'card', 4.5],
      ['warning', 'background', 4.5],
      ['warning', 'warning-soft', 4.5],
      // Trả lời chưa đúng (FND-02): chữ và icon `danger` trên thẻ, nền trang và nền nhạt `danger-soft`.
      ['danger', 'card', 4.5],
      ['danger', 'background', 4.5],
      ['danger', 'danger-soft', 4.5],
      // Nút xóa (FND-02): chữ trên nền `danger`.
      ['danger-foreground', 'danger', 4.5],
      ['info', 'info-soft', 4.5],
    ];
    for (const [name, t] of [
      ['sáng', light],
      ['tối', dark],
    ] as const) {
      const tok = { ...light, ...t };
      for (const [fg, bg, min] of pairs) {
        expect(tok[fg], `${name}: thiếu token ${fg}`).toBeDefined();
        expect(tok[bg], `${name}: thiếu token ${bg}`).toBeDefined();
        expect(contrast(tok[fg], tok[bg]), `${name}: ${fg} trên ${bg}`).toBeGreaterThanOrEqual(min);
      }
      // Badge "Đã nhớ" (statusBadgeClass success): chữ `success` trên nền `success` độ mờ 12% phủ lên thẻ.
      expect(contrast(tok.success, blend(tok.success, 0.12, tok.card)), `${name}: badge success`).toBeGreaterThanOrEqual(4.5);
    }
  });

  // @ac FND-AC07
  it('chọn cỡ câu theo độ dài', () => {
    expect(sentenceSize('x'.repeat(39))).toBe('text-display-lg');
    expect(sentenceSize('x'.repeat(40))).toBe('text-2xl');
    expect(sentenceSize('x'.repeat(90))).toBe('text-2xl');
    expect(sentenceSize('x'.repeat(91))).toBe('text-xl');
    // Đếm theo ký tự, không theo đơn vị UTF-16 (chữ ngoài BMP).
    expect(sentenceSize('𠀀'.repeat(39))).toBe('text-display-lg');
  });
});

describe('FND-03 sáng tối trước khung hình đầu', () => {
  const html = document.documentElement;
  const realMatchMedia = window.matchMedia;
  const setSystemDark = (dark: boolean) => {
    window.matchMedia = ((q: string) => ({ matches: dark && q.includes('dark'), media: q, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  };
  // Chạy đúng đoạn mã đặt ở đầu body của layout gốc.
  const runScript = () => new Function(themeScript)();
  afterEach(() => {
    window.matchMedia = realMatchMedia;
    html.classList.remove('dark');
    html.style.colorScheme = '';
    localStorage.clear();
  });

  // @ac FND-AC04
  it('hệ thống tối và "Theo thiết bị": có class dark; chọn Sáng thì không có class dark trước khi React chạy', () => {
    setSystemDark(true);
    runScript();
    expect(html.classList.contains('dark')).toBe(true);
    expect(html.style.colorScheme).toBe('dark');

    html.classList.remove('dark');
    localStorage.setItem(THEME_KEY, 'light');
    runScript();
    expect(html.classList.contains('dark')).toBe(false);
    expect(html.style.colorScheme).toBe('light');

    setSystemDark(false);
    localStorage.setItem(THEME_KEY, 'dark');
    runScript();
    expect(html.classList.contains('dark')).toBe(true);
  });

  // @ac FND-AC04
  it('bản cũ lưu giao diện trong vitasr2.settings vẫn được đọc', () => {
    setSystemDark(false);
    localStorage.setItem('vitasr2.settings', JSON.stringify({ schema: 1, theme: 'dark' }));
    runScript();
    expect(html.classList.contains('dark')).toBe(true);
  });
});
