import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { sentenceSize } from '../../src/foundation/typography';

const SRC = path.resolve(process.cwd(), 'fe/src');
function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const p = path.join(dir, e);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(css|tsx|ts)$/.test(e)) out.push(p);
  }
  return out;
}
const files = walk(SRC);
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

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
function contrast(a: string, b: string) {
  const [l1, l2] = [lum(hexToRgb(a)), lum(hexToRgb(b))].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
function readTokens(block: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const m of block.matchAll(/--([a-z-]+):\s*(#[0-9A-Fa-f]{6})/g)) out[m[1]] = m[2];
  return out;
}

describe('FND', () => {
  // @ac FND-AC01
  it('ngoài file token không có mã màu hay gradient', () => {
    const bad: string[] = [];
    for (const f of files) {
      if (f.endsWith(path.join('foundation', 'tokens.css'))) continue;
      const s = strip(readFileSync(f, 'utf8'));
      if (/#[0-9a-fA-F]{3,8}\b(?![\w-])/.test(s.replace(/(href|id|aria-labelledby)=[^ >]*/g, '')) && /\.css$/.test(f)) bad.push(`${f}: hex`);
      if (/\b(rgb|rgba|hsl|hsla)\(/.test(s)) bad.push(`${f}: rgb/hsl`);
      if (/(linear|radial|conic)-gradient/.test(s)) bad.push(`${f}: gradient`);
    }
    expect(bad).toEqual([]);
  });

  // @ac FND-AC02
  it('các cặp chữ và nền đạt tương phản', () => {
    const css = readFileSync(path.join(SRC, 'foundation/tokens.css'), 'utf8');
    const light = readTokens(css.slice(css.indexOf(':root {'), css.indexOf("}", css.indexOf(':root {'))));
    const darkStart = css.indexOf(":root[data-theme='dark']");
    const dark = readTokens(css.slice(darkStart, css.indexOf('}', darkStart)));
    // [chữ, nền, ngưỡng]: chữ thường 4.5, chữ từ 24 px (câu trên thẻ, số tổng kết) 3.
    const pairs: [string, string, number][] = [
      ['ink', 'paper', 4.5],
      ['ink', 'surface', 4.5],
      ['muted', 'paper', 4.5],
      ['muted', 'surface', 4.5],
      ['ink', 'line', 4.5],
      ['on-brand', 'brand', 4.5],
      // Chữ "Đúng" cạnh lựa chọn đúng (C4-02) và dòng kết quả S5-05 là chữ nhỏ trên --surface hoặc --paper.
      ['known', 'surface', 4.5],
      ['known', 'paper', 4.5],
      ['review', 'surface', 4.5],
      ['review', 'paper', 4.5],
      ['surface', 'known', 4.5],
      ['surface', 'review', 4.5],
      ['paper', 'ink', 4.5],
      // Trả lời chưa đúng (FND-02): chữ và icon --wrong trên --surface, --paper và nền nhạt --wrong-soft; câu trên nền --wrong-soft.
      ['wrong', 'surface', 4.5],
      ['wrong', 'paper', 4.5],
      ['wrong', 'wrong-soft', 4.5],
      ['ink', 'wrong-soft', 4.5],
    ];
    for (const [name, t] of [['sáng', light], ['tối', dark]] as const) {
      const tok = { ...light, ...t };
      // Nút Tôi nhớ: chữ --surface (sáng) hoặc --paper (tối) trên nền --known.
      const onKnown = name === 'sáng' ? tok.surface : tok.paper;
      expect(contrast(onKnown, tok.known), `${name}: chữ trên nút Tôi nhớ`).toBeGreaterThanOrEqual(4.5);
      for (const [fg, bg, min] of pairs) {
        if (name === 'tối' && fg === 'surface' && bg === 'known') continue;
        expect(contrast(tok[fg], tok[bg]), `${name}: ${fg} trên ${bg}`).toBeGreaterThanOrEqual(min);
      }
    }
  });

  // @ac FND-AC06
  it('mọi font-size dùng token --t-*', () => {
    const bad: string[] = [];
    for (const f of files.filter((x) => x.endsWith('.css'))) {
      for (const m of strip(readFileSync(f, 'utf8')).matchAll(/font-size\s*:\s*([^;}]+)/g)) {
        if (!/^var\(--t-(sm|body|lg|xl|2xl|3xl)\)$/.test(m[1].trim())) bad.push(`${f}: ${m[1]}`);
      }
    }
    expect(bad).toEqual([]);
  });

  // @ac FND-AC07
  it('chọn cỡ câu theo độ dài', () => {
    expect(sentenceSize('x'.repeat(39))).toBe('t-2xl');
    expect(sentenceSize('x'.repeat(40))).toBe('t-xl');
    expect(sentenceSize('x'.repeat(90))).toBe('t-xl');
    expect(sentenceSize('x'.repeat(91))).toBe('t-lg');
  });
});
