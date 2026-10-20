import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { seed, settings, animationsDone } from './helpers';

// Thứ bậc chữ FND-15 đo trên bản build, ở các màn chính và hai khổ màn hình.

const progress30 = JSON.parse(readFileSync('fe/fixtures/progress/fluency-en-30-ngay.json', 'utf8'));
const fluency = () => settings({ packByLang: { en: 'fluency' } });

const routes: [string, string][] = [
  ['S1', '#/chon-ngon-ngu'],
  ['T1', '#/hoc'],
  ['T2', '#/luyen-tap'],
  ['T3', '#/thu-vien'],
  ['T4', '#/tien-bo?khoang=30'],
  ['S8', '#/cai-dat'],
  ['S3', '#/phien-hoc?nguon=lo-trinh'],
  ['S5', '#/kiem-tra'],
];

for (const width of [375, 1280]) {
  for (const [name, hash] of routes) {
    // @ac FND-AC18
    test(`FND-15 thứ bậc chữ ở ${name}, ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await seed(page, { 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
      await page.goto(hash);
      await page.waitForLoadState('networkidle');
      await expect(page.locator('h1')).toHaveCount(1);
      await animationsDone(page);

      const r = await page.evaluate(() => {
        const shown = (el: Element) => {
          const b = el.getBoundingClientRect();
          return b.width > 1 && b.height > 1 && !el.closest('.sr-only') && getComputedStyle(el).visibility !== 'hidden';
        };
        const style = (el: Element) => {
          const cs = getComputedStyle(el);
          return `${cs.fontSize} ${cs.fontWeight}`;
        };
        const h1 = document.querySelector('h1')!;
        const weights = new Set<string>();
        for (const el of document.querySelectorAll('body *')) {
          const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim());
          if (own && shown(el)) weights.add(getComputedStyle(el).fontWeight);
        }
        return {
          // Câu ngôn ngữ đích làm tiêu đề (S5) theo FND-06, không theo bảng FND-15.
          h1: shown(h1) && !h1.classList.contains('src') ? style(h1) : null,
          h2: [...document.querySelectorAll('h2')].filter(shown).map(style),
          weights: [...weights].sort(),
        };
      });

      if (r.h1) expect(r.h1).toBe('25px 600');
      for (const h2 of r.h2) expect(h2).toBe('20px 600');
      expect(r.weights.every((w) => w === '400' || w === '600'), `độ đậm: ${r.weights.join(', ')}`).toBe(true);
    });
  }
}

// @ac FND-AC18
test('FND-15 S5 đang làm bài vẫn có đúng một tiêu đề màn', async ({ page }) => {
  await seed(page, { 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
  await page.goto('#/kiem-tra');
  await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
  await expect(page.getByText('Nghe và chọn nghĩa').first()).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
});
