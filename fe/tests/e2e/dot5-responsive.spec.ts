import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { seed, settings } from './helpers';

// Đợt 5 việc 6: bố cục theo khổ màn hình (APP-07) và vùng chạm (FND-14) trên các màn chính.

const progress30 = JSON.parse(readFileSync('fe/fixtures/progress/fluency-en-30-ngay.json', 'utf8'));
const WIDTHS = [320, 375, 768, 1024, 1280, 1440];
const ROUTES: [string, string, boolean][] = [
  ['T1', '#/hoc', true],
  ['T2', '#/luyen-tap', true],
  ['T3 Unit', '#/thu-vien', true],
  ['T3 Câu', '#/thu-vien?xem=cau', true],
  ['T4', '#/tien-bo?khoang=30', true],
  ['S8', '#/cai-dat', true],
  ['S10', '#/unit?so=2', false],
];

// @ac APP-AC25
test('không cuộn ngang, vùng chạm từ 44 px, nội dung ở 1440 px trải từ 80% vùng nội dung', async ({ page }) => {
  test.setTimeout(180000);
  await seed(page, { 'vitasr2.settings': settings({ packByLang: { en: 'fluency' } }), 'vitasr2.progress.fluency.en': progress30 });
  const bad: string[] = [];
  for (const w of WIDTHS) {
    await page.setViewportSize({ width: w, height: 800 });
    for (const [name, hash, wide] of ROUTES) {
      await page.goto('about:blank');
      await page.goto(`./${hash}`);
      await expect(page.locator('main h1, .shell__content h1').first()).toBeAttached();
      await page.waitForTimeout(150);
      const r = await page.evaluate(() => {
        const out = { scroll: document.documentElement.scrollWidth > document.documentElement.clientWidth, small: [] as string[], spread: 1 };
        const seen = (el: Element) => {
          const b = el.getBoundingClientRect();
          return b.width > 0 && b.height > 0 && !el.closest('.sr-only, [aria-hidden="true"]') && getComputedStyle(el).visibility !== 'hidden';
        };
        // FND-14: ngoại lệ là liên kết trong dòng chữ (C1-05) và cột biểu đồ 30 ngày (T4-04).
        for (const el of document.querySelectorAll('a[href], button, input:not([type="radio"]):not([type="checkbox"]), select')) {
          if (!seen(el) || el.closest('.card__link, .chart__hit')) continue;
          const b = el.getBoundingClientRect();
          if (Math.round(b.height) < 44 || Math.round(b.width) < 44) out.small.push(`${el.tagName.toLowerCase()} "${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}" ${Math.round(b.width)}x${Math.round(b.height)}`);
        }
        const content = document.querySelector('.shell__content')!;
        const cs = getComputedStyle(content);
        const inner = content.getBoundingClientRect().width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        let left = Infinity;
        let right = -Infinity;
        for (const el of content.querySelectorAll('*')) {
          const leaf = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()) || el.matches('svg, .strip__cell, .chart__bar, .t4__bar, .t1__bar');
          if (!leaf || !seen(el)) continue;
          const b = el.getBoundingClientRect();
          left = Math.min(left, b.left);
          right = Math.max(right, b.right);
        }
        out.spread = (right - left) / Math.min(inner, 1120);
        return out;
      });
      if (r.scroll) bad.push(`${name} ${w}: cuộn ngang`);
      for (const s of r.small) bad.push(`${name} ${w}: vùng chạm nhỏ ${s}`);
      if (w === 1440 && wide && r.spread < 0.8) bad.push(`${name} 1440: nội dung chỉ trải ${Math.round(r.spread * 100)}%`);
    }
  }
  expect(bad).toEqual([]);
});
