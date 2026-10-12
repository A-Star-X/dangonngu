import { expect, test } from '@playwright/test';
import { seed, settings } from './helpers';

// Tắt trace cho cả file này: ghi trace chen vào service worker khi giả lập ngoại tuyến, khiến test lúc đạt lúc hỏng dù app chạy đúng.
test.use({ trace: 'off' });

test('APP-10: sau lần mở đầu tiên có mạng, tắt mạng rồi tải lại vẫn học được', async ({ page, context }) => {
  await seed(page, { 'vitasr2.settings': settings() });
  await page.goto('./#/hoc');
  await expect(page.locator('.card')).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, { timeout: 20000 });
  // Chờ service worker nạp xong dữ liệu đã tải vào bộ nhớ ngoại tuyến.
  await page.waitForFunction(
    async () => {
      const keys = await caches.keys();
      for (const k of keys) {
        const c = await caches.open(k);
        const reqs = await c.keys();
        if (reqs.some((r) => r.url.includes('/data/global/en.json'))) return true;
      }
      return false;
    },
    undefined,
    { timeout: 20000 },
  );
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.card')).toBeVisible();
  await expect(page.getByText('Đang ngoại tuyến. Tiến độ vẫn được lưu trên máy.')).toBeVisible();
  await page.getByRole('button', { name: 'Học 8 câu' }).click();
  await expect(page.getByText('Câu 1/8')).toBeVisible();
  await context.setOffline(false);
});
