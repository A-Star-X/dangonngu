import { expect, test } from '@playwright/test';
import { animationsDone, cardShown, progress30, seed, settings } from './helpers';

// Chạy bằng SHOTS=1: chụp màn Học thật (đã đăng nhập, có tiến độ) cho ảnh trên landing (LP-01),
// ghi đè public/landing/hoc-light.png, hoc-dark.png và bản giao diện tiếng Anh hoc-en-light.png, hoc-en-dark.png.
// Ảnh trong public chỉ được phục vụ nếu có trước lúc build. Email thử và dòng chế độ thử ở chân thanh bên được ẩn.

const NOW = new Date('2026-10-08T10:00:00+07:00');

for (const [ui, prefix] of [['vi', ''], ['en', 'en-']] as const)
for (const theme of ['light', 'dark'] as const) {
  test(`ảnh màn Học cho landing (${ui}, ${theme})`, async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: 'NEXT_LOCALE', value: ui, url: baseURL! }]);
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.clock.setFixedTime(NOW);
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await seed(page, {
      'vitasr2.settings': settings({ packByLang: { en: 'fluency' }, guideSeen: true }),
      'vitasr2.progress.fluency.en': progress30,
      'vitasr2.theme': theme,
    });
    await page.goto('/hoc');
    await cardShown(page);
    await expect(page.locator('html')).toHaveClass(theme === 'dark' ? /\bdark\b/ : /^(?!.*\bdark\b)/);
    await page.evaluate(() => document.fonts.ready);
    await animationsDone(page);
    // Thông báo ngắn (nếu có) không vào ảnh.
    await page.addStyleTag({ content: '.Toastify{display:none!important} [data-testid="user-email"],[data-testid="local-mode"]{visibility:hidden!important}' });
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `public/landing/hoc-${prefix}${theme}.png` });
  });
}
