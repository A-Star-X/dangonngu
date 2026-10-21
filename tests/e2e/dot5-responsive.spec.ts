import { expect, test } from '@playwright/test';
import { go, progress30, seed, settings } from './helpers';

// Bố cục theo khổ màn hình (APP-07) và vùng chạm (FND-14) trên các màn chính.

const WIDTHS = [320, 375, 768, 1024, 1280, 1440];
const ROUTES: [string, string][] = [
  ['T1', '/hoc'],
  ['T2', '/luyen-tap'],
  ['T3 Unit', '/thu-vien'],
  ['T3 Câu', '/thu-vien?xem=cau'],
  ['T4', '/tien-do?khoang=30'],
  ['S8', '/cai-dat'],
  ['S10', '/thu-vien/unit?so=2'],
];

// @ac APP-AC25
test('không cuộn ngang, vùng chạm từ 40 px (trừ ngoại lệ FND-14), nội dung không vượt khung 1024 px', async ({ page }) => {
  test.setTimeout(240000);
  await seed(page, { 'vitasr2.settings': settings({ packByLang: { en: 'fluency' } }), 'vitasr2.progress.fluency.en': progress30 });
  const bad: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 800 });
    for (const [name, path] of ROUTES) {
      await go(page, path);
      await expect(page.locator('main h1').first()).toBeAttached();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        const out = { scroll: document.documentElement.scrollWidth > document.documentElement.clientWidth, small: [] as string[], content: 0 };
        const seen = (el: Element) => {
          const b = el.getBoundingClientRect();
          return b.width > 0 && b.height > 0 && !el.closest('.sr-only, [aria-hidden="true"], [inert]') && getComputedStyle(el).visibility !== 'hidden';
        };
        // FND-14: ngoại lệ là liên kết trong dòng chữ (C1-05), cột biểu đồ 30 ngày (T4-04) và ô 36 px trên header (C5-05).
        for (const el of document.querySelectorAll('a[href], button, input:not([type="radio"]):not([type="checkbox"]):not([type="file"]), select, [role="combobox"]')) {
          if (!seen(el) || el.closest('[data-inline-link], [data-testid="t4-chart"], header')) continue;
          const b = el.getBoundingClientRect();
          if (Math.round(b.height) < 40 || Math.round(b.width) < 40) out.small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(b.width)}x${Math.round(b.height)}`);
        }
        // Ô 36 px trên header vẫn phải từ 36 px.
        for (const el of document.querySelectorAll('header a[href], header button, header [role="combobox"]')) {
          if (!seen(el)) continue;
          const b = el.getBoundingClientRect();
          if (Math.round(b.height) < 36 || Math.round(b.width) < 36) out.small.push(`header ${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(b.width)}x${Math.round(b.height)}`);
        }
        const content = document.querySelector('main#main > div');
        out.content = content ? content.getBoundingClientRect().width : 0;
        return out;
      });
      if (r.scroll) bad.push(`${name} ${w}: cuộn ngang`);
      for (const s of r.small) bad.push(`${name} ${w}: vùng chạm nhỏ ${s}`);
      if (r.content > 1024) bad.push(`${name} ${w}: khung nội dung rộng ${Math.round(r.content)} px`);
    }
  }
  expect(bad).toEqual([]);
});
