// Kiểm tra tĩnh trên mã nguồn src: màu chỉ lấy từ token (FND-01), cỡ chữ chỉ theo thang (FND-05),
// không có liên kết # (APP-13), file ngôn ngữ khớp nhau (APP-15), không chạm cửa sổ khác (APP-09).
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(tsx?|css|mjs|js)$/.test(name)) out.push(full);
  }
  return out;
}

const FILES = walk(SRC).map((full) => ({
  rel: path.relative(ROOT, full).split(path.sep).join('/'),
  lines: readFileSync(full, 'utf8').split('\n'),
}));

type Hit = string;
function scan(re: RegExp, skip: (rel: string) => boolean = () => false, allowLine: (rel: string, line: string) => boolean = () => false): Hit[] {
  const hits: Hit[] = [];
  for (const f of FILES) {
    if (skip(f.rel)) continue;
    f.lines.forEach((line, i) => {
      if (re.test(line) && !allowLine(f.rel, line)) hits.push(`${f.rel}:${i + 1}: ${line.trim().slice(0, 140)}`);
    });
  }
  return hits;
}

/** Ảnh dựng bằng ImageResponse (next/og): không dùng được class hay biến CSS, màu và cỡ chữ phải ghi thẳng. */
const isImageRoute = (rel: string) => /^src\/app\/([a-z-]+-image|icon|apple-icon)\.tsx$/.test(rel);
const THEME = 'src/styles/theme.css';
const TOKEN_CSS = new Set([THEME, 'src/styles/typography.css']);
/** Thẻ meta theme-color của trình duyệt chỉ nhận mã màu; giá trị phải bằng --background (kiểm ở test dưới). */
const LAYOUT = 'src/app/[locale]/layout.tsx';
const isThemeColorLine = (rel: string, line: string) =>
  rel === LAYOUT && /^\s*\{ media: '\(prefers-color-scheme: (light|dark)\)', color: '#[0-9a-f]{6}' \},?\s*$/.test(line);

describe('FND-01 màu chỉ lấy từ token', () => {
  it('quét được mã nguồn', () => {
    expect(FILES.length).toBeGreaterThan(50);
    expect(FILES.some((f) => f.rel === THEME)).toBe(true);
  });

  // @ac FND-AC01
  it('ngoài theme.css và ảnh ImageResponse không có hex, rgb(, hsl(, gradient', () => {
    const color = /(?<![\w&])#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b|\b(?:rgba?|hsla?)\(|\b(?:linear|radial|conic)-gradient\b|(?<![\w-])bg-(?:gradient|linear|radial|conic)-(?:to-|\d)/;
    expect(scan(color, (rel) => rel === THEME || isImageRoute(rel), isThemeColorLine)).toEqual([]);
  });

  // @ac FND-AC01
  it('theme-color của trình duyệt bằng --background sáng và tối', () => {
    const css = readFileSync(path.join(ROOT, THEME), 'utf8');
    const block = (sel: string) => css.slice(css.indexOf(`${sel} {`), css.indexOf('}', css.indexOf(`${sel} {`)));
    const bg = (sel: string) => /--background:\s*(#[0-9a-f]{6})/.exec(block(sel))?.[1];
    const layout = readFileSync(path.join(ROOT, LAYOUT), 'utf8');
    const meta = (scheme: string) => new RegExp(`prefers-color-scheme: ${scheme}\\)', color: '(#[0-9a-f]{6})'`).exec(layout)?.[1];
    expect(meta('light')).toBe(bg(':root'));
    expect(meta('dark')).toBe(bg('.dark'));
  });

  // @ac FND-AC01
  it('không có class màu có sẵn của Tailwind (bg-red-500, text-white...)', () => {
    const palette =
      /(?<![\w-])(?:bg|text|border(?:-[trblxy])?|ring(?:-offset)?|fill|stroke|from|via|to|outline|decoration|divide|placeholder|caret|accent|shadow)-(?:(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|black|white)(?![\w-])/;
    expect(scan(palette, (rel) => TOKEN_CSS.has(rel))).toEqual([]);
  });
});

describe('FND-05 cỡ chữ theo thang', () => {
  // @ac FND-AC06
  it('không có class cỡ chữ ngoài thang và không có text-[..px]', () => {
    const offScale = /(?<![\w-])text-(?:[3-9]xl|\[(?:length:)?[\d.]+(?:px|rem|em|pt|vw|%)\])(?![\w-])/;
    expect(scan(offScale)).toEqual([]);
  });

  // @ac FND-AC06
  it('không có fontSize trong style (trừ ảnh ImageResponse) và không có font-size ngoài file token', () => {
    expect(scan(/\bfontSize\b/, isImageRoute)).toEqual([]);
    // Cả chuỗi style trong .ts/.tsx lẫn file .css; theme.css và typography.css là file token (kiểm ở test dưới).
    expect(scan(/font-size\s*:/, (rel) => TOKEN_CSS.has(rel))).toEqual([]);
  });

  // @ac FND-AC06
  it('file token chỉ đặt cỡ chữ bằng biến của thang', () => {
    const typo = readFileSync(path.join(ROOT, 'src/styles/typography.css'), 'utf8');
    const sizes = [...typo.matchAll(/font-size:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(sizes.length).toBeGreaterThan(0);
    for (const s of sizes) expect(s).toMatch(/^var\(--text-(xs|sm|base|lg|xl|2xl|display-lg)\)$/);
  });
});

describe('APP-09, APP-13 liên kết và cửa sổ', () => {
  // @ac APP-AC23
  it('không có href bắt đầu bằng #', () => {
    expect(scan(/\bhref\s*[=:]\s*\{?\s*[`'"]#/)).toEqual([]);
  });

  // @ac APP-AC12
  it('không dùng window.top, window.parent, window.opener, postMessage', () => {
    expect(scan(/\bwindow\s*\.\s*(?:top|parent|opener)\b|\bpostMessage\b/)).toEqual([]);
  });
});

describe('APP-15 file ngôn ngữ', () => {
  // @ac APP-AC28
  it('npm run messages:check thoát mã 0', () => {
    const r = spawnSync(process.execPath, ['scripts/check-messages.mjs'], { cwd: ROOT, encoding: 'utf8' });
    expect(r.status, `${r.stdout}\n${r.stderr}`).toBe(0);
  });
});
