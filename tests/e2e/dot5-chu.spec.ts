import { expect, test } from '@playwright/test';
import { animationsDone, go, progress30, seed, settings } from './helpers';

// Thứ bậc chữ FND-15 đo trên bản build, ở các màn chính và hai khổ màn hình.

const fluency = () => settings({ packByLang: { en: 'fluency' } });

const routes: [string, string, boolean][] = [
  ['S1', '/chon-ngon-ngu', true],
  ['T1', '/hoc', true],
  ['T2', '/luyen-tap', true],
  ['T3', '/thu-vien', true],
  ['T4', '/tien-do?khoang=30', true],
  ['S8', '/cai-dat', true],
  ['S3', '/phien-hoc?nguon=lo-trinh', true],
  ['S5', '/kiem-tra', true],
  ['Landing', '/', false],
  ['Đăng nhập', '/dang-nhap', false],
];

for (const width of [375, 1280]) {
  for (const [name, path, signedIn] of routes) {
    // @ac FND-AC18
    test(`FND-15 thứ bậc chữ ở ${name}, ${width} px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await seed(page, signedIn ? { 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 } : {}, { signedIn });
      await go(page, path);
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
        return {
          // Câu ngôn ngữ đích làm tiêu đề (S5) theo FND-06, không theo bảng FND-15.
          h1: shown(h1) && !h1.classList.contains('src') ? style(h1) : null,
          h2: [...document.querySelectorAll('h2')].filter(shown).map((h) => `${(h.textContent || '').trim().slice(0, 30)}: ${style(h)}`),
        };
      });

      if (r.h1) expect(r.h1).toBe('24px 700');
      for (const h2 of r.h2) expect(h2).toMatch(/: 14px \d+$/);
    });
  }
}

// @ac FND-AC18
test('FND-15 S5 đang làm bài vẫn có đúng một tiêu đề màn', async ({ page }) => {
  await seed(page, { 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
  await page.goto('/kiem-tra');
  await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
  await expect(page.getByText('Nghe và chọn nghĩa').first()).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
});
