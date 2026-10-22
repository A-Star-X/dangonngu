// Tên sản phẩm "Đa ngôn ngữ" (APP-18, QD-12): không còn chữ VITASR ở chỗ người dùng thấy; khóa lưu trên trình duyệt giữ nguyên.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { baseMetadata, pageMetadata, SITE_NAME } from '@/lib/seo';
import { renderApp, settingsSeed } from './helpers';

const SRC = path.join(process.cwd(), 'src');
function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? files(full) : /\.(tsx?|json)$/.test(name) ? [full] : [];
  });
}

describe('APP-18 Tên sản phẩm', () => {
  // @ac APP-AC33
  it('không file mã nguồn hay file ngôn ngữ nào còn chữ VITASR; khóa lưu trên trình duyệt vẫn là vitasr2.*', () => {
    const left = files(SRC).filter((f) => readFileSync(f, 'utf8').includes('VITASR'));
    expect(left.map((f) => path.relative(process.cwd(), f))).toEqual([]);
    expect(SITE_NAME).toBe('Đa ngôn ngữ');
    const all = files(SRC).map((f) => readFileSync(f, 'utf8')).join('\n');
    expect(all).toContain("'vitasr2.settings'");
    expect(all).toContain('vitasr2.progress.');
  });

  // @ac APP-AC33
  it('tiêu đề trang dạng "... | Đa ngôn ngữ"; ảnh chia sẻ có alt là tên sản phẩm', () => {
    expect((baseMetadata('mô tả', 'vi').title as { template: string }).template).toBe('%s | Đa ngôn ngữ');
    const og = pageMetadata({ title: 'Học', path: '/hoc', index: false }).openGraph as { images: { alt: string }[] };
    expect(og.images[0].alt).toBe('Đa ngôn ngữ');
  });

  // @ac APP-AC33
  it('logo ở thanh bên và header khu học là chữ "Đa ngôn ngữ", không có ô biểu tượng, cả khi giao diện tiếng Anh', async () => {
    for (const locale of ['vi', 'en'] as const) {
      const a = await renderApp('/hoc', { seed: settingsSeed(), locale });
      const sidebar = document.getElementById('app-sidebar')!;
      const label = locale === 'vi' ? 'Đa ngôn ngữ, về trang Học' : 'Đa ngôn ngữ, go to Learn';
      const logos = [within(sidebar).getByRole('link', { name: label }), screen.getAllByRole('link', { name: label }).find((l) => l.closest('header'))!];
      for (const logo of logos) {
        expect(logo).toHaveTextContent(/^Đa ngôn ngữ$/);
        expect(logo.querySelector('svg')).toBeNull();
        expect(logo.querySelector('[lang="vi"]')).toHaveTextContent('Đa ngôn ngữ');
      }
      expect(document.body.textContent).not.toContain('VITASR');
      a.unmount();
    }
  });
});
