// @spec FND-04
// Chép CSS và file woff2 của các font Noto (chữ không phải Latinh) từ @fontsource vào public/fonts,
// để app nạp theo ngôn ngữ đang học (src/lib/script-fonts.ts). Chạy trước `dev` và `build`. Thư mục đích không đưa lên git.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const out = join(root, 'public', 'fonts');
const SETS = {
  'noto-sans-jp': ['400.css', '600.css'],
  'noto-sans-sc': ['400.css', '600.css'],
  'noto-sans-kr': ['400.css', '600.css'],
  'noto-sans-thai': ['400.css', '600.css'],
  'noto-sans-lao': ['400.css', '600.css'],
  'noto-sans-devanagari': ['400.css', '600.css'],
  'noto-sans-tamil': ['400.css', '600.css'],
  'noto-sans': ['cyrillic-400.css', 'cyrillic-600.css'],
};

rmSync(out, { recursive: true, force: true });
let files = 0;
for (const [pkg, cssList] of Object.entries(SETS)) {
  const src = join(root, 'node_modules', '@fontsource', pkg);
  if (!existsSync(src)) {
    console.warn(`copy-fonts: thiếu @fontsource/${pkg}, bỏ qua`);
    continue;
  }
  const dst = join(out, pkg);
  mkdirSync(join(dst, 'files'), { recursive: true });
  const need = new Set();
  for (const css of cssList) {
    // Chỉ giữ woff2 (mọi trình duyệt app hỗ trợ đều đọc được), bỏ đường dẫn woff để không gọi file không có.
    const text = readFileSync(join(src, css), 'utf8').replace(/,\s*url\(\.\/files\/[^)]+\.woff\) format\('woff'\)/g, '');
    for (const m of text.matchAll(/url\(\.\/files\/([^)]+\.woff2)\)/g)) need.add(m[1]);
    writeFileSync(join(dst, css), text);
  }
  for (const f of readdirSync(join(src, 'files'))) {
    if (!need.has(f)) continue;
    cpSync(join(src, 'files', f), join(dst, 'files', f));
    files++;
  }
}
console.log(`copy-fonts: đã chép ${files} file font vào public/fonts`);
