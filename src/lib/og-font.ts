// Font Lexend (chữ Latinh và tiếng Việt) cho ảnh chia sẻ và icon dựng bằng ImageResponse.
// Hai phần chữ đặt hai tên khác nhau và khai báo fontFamily 'Lexend, Lexend VN' để chữ có dấu lấy từ phần tiếng Việt.
export const OG_FONT_FAMILY = 'Lexend, "Lexend VN"';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = () => join(process.cwd(), 'node_modules', '@fontsource', 'lexend', 'files');

export async function lexendFonts() {
  const load = (f: string) => readFile(join(dir(), f));
  const [latin700, viet700, latin400, viet400] = await Promise.all([
    load('lexend-latin-700-normal.woff'),
    load('lexend-vietnamese-700-normal.woff'),
    load('lexend-latin-400-normal.woff'),
    load('lexend-vietnamese-400-normal.woff'),
  ]);
  return [
    { name: 'Lexend', data: latin700, weight: 700 as const, style: 'normal' as const },
    { name: 'Lexend VN', data: viet700, weight: 700 as const, style: 'normal' as const },
    { name: 'Lexend', data: latin400, weight: 400 as const, style: 'normal' as const },
    { name: 'Lexend VN', data: viet400, weight: 400 as const, style: 'normal' as const },
  ];
}
