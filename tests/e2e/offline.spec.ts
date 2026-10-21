import { expect, test } from '@playwright/test';
import { cardShown, seed, settings } from './helpers';

// Tắt trace cho cả file này: ghi trace chen vào service worker khi giả lập ngoại tuyến, khiến test lúc đạt lúc hỏng dù app chạy đúng.
test.use({ trace: 'off' });

// APP-10 (bản tự động của APP-AC14, máy thật vẫn cần người thử): sau lần mở đầu tiên có mạng, tắt mạng rồi tải lại vẫn học được.
test('APP-10: sau lần mở đầu tiên có mạng, tắt mạng rồi tải lại vẫn học được', async ({ page, context }) => {
  await seed(page, { 'vitasr2.settings': settings() });
  await page.goto('/hoc');
  await cardShown(page);
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, undefined, { timeout: 30000 });
  // Chờ service worker lưu xong khung trang và dữ liệu đã tải vào bộ nhớ ngoại tuyến.
  await page.waitForFunction(
    async () => {
      const found = { data: false, page: false };
      for (const k of await caches.keys()) {
        const reqs = await (await caches.open(k)).keys();
        if (reqs.some((r) => r.url.includes('/data/global/en.json'))) found.data = true;
        if (reqs.some((r) => new URL(r.url).pathname === '/hoc')) found.page = true;
      }
      return found.data && found.page;
    },
    undefined,
    { timeout: 30000 },
  );
  await context.setOffline(true);
  await page.reload();
  await cardShown(page);
  await expect(page.getByText('Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy.')).toBeVisible();
  await page.getByRole('button', { name: 'Học 8 câu' }).click();
  await expect(page.getByText('Câu 1/8')).toBeVisible();
  await context.setOffline(false);
});
