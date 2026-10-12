import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
import { animationsDone, seed, settings } from './helpers';

const progress30 = JSON.parse(readFileSync('fe/fixtures/progress/fluency-en-30-ngay.json', 'utf8'));
const NOW = new Date('2026-10-08T10:00:00+07:00');

/** Mở route bằng một lần tải trang mới (đổi hash trong cùng trang không đổi màn khi đang ở cùng route). */
async function go(page: Page, hash: string) {
  await page.goto('about:blank');
  await page.goto(hash);
}

async function axe(page: Page, where: string) {
  await animationsDone(page);
  const r = await new AxeBuilder({ page }).analyze();
  return r.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${where}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('Đợt 2: các màn còn lại', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [375, 1280]) {
      // @ac FND-AC15
      test(`axe-core không có lỗi serious hoặc critical ở T2, T3, T4, S5, S8 và các sheet (${scheme}, ${width})`, async ({ page }) => {
        test.setTimeout(240000);
        await page.clock.setFixedTime(NOW);
        await seed(page, { 'vitasr2.settings': settings({ packByLang: { en: 'fluency' } }), 'vitasr2.progress.fluency.en': progress30 });
        const bad: string[] = [];
        const tag = `${scheme} ${width}`;
        await page.emulateMedia({ colorScheme: scheme });
        await page.setViewportSize({ width, height: 800 });

        await go(page, './#/luyen-tap');
        await expect(page.getByRole('heading', { name: 'Luyện tập' })).toBeVisible();
        bad.push(...(await axe(page, `T2 ${tag}`)));
        await page.getByRole('button', { name: /Học theo từ khóa/ }).click();
        await page.getByRole('searchbox', { name: 'Từ khóa' }).fill('airport');
        await expect(page.getByText(/^Tìm thấy/)).toBeVisible();
        bad.push(...(await axe(page, `T2 sheet từ khóa ${tag}`)));
        await page.keyboard.press('Escape');

        await go(page, './#/thu-vien');
        await expect(page.locator('.lib-row').first()).toBeVisible();
        bad.push(...(await axe(page, `T3 ${tag}`)));
        await page.locator('.lib-row').nth(2).click();
        if (width < 900) {
          await expect(page.getByRole('dialog')).toBeVisible();
          bad.push(...(await axe(page, `T3 sheet chi tiết ${tag}`)));
          await page.keyboard.press('Escape');
        }
        await page.getByRole('button', { name: 'Trạng thái' }).click();
        bad.push(...(await axe(page, `T3 sheet bộ lọc ${tag}`)));
        await page.keyboard.press('Escape');

        for (const k of ['1', '7', '30']) {
          await go(page, `./#/tien-bo?khoang=${k}`);
          await expect(page.getByRole('heading', { name: 'Tiến bộ' })).toBeVisible();
          bad.push(...(await axe(page, `T4 ${k} ngày ${tag}`)));
        }
        await page.getByRole('button', { name: /^Thứ Năm, 8\/10/ }).click();
        bad.push(...(await axe(page, `T4 sheet ngày ${tag}`)));
        await page.keyboard.press('Escape');

        await go(page, './#/kiem-tra?unit=1');
        await expect(page.getByRole('button', { name: 'Làm cả 3 bước' })).toBeVisible();
        bad.push(...(await axe(page, `S5 bắt đầu ${tag}`)));
        await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
        bad.push(...(await axe(page, `S5 bước 1 ${tag}`)));
        await page.locator('.choice[data-correct="true"]').click();
        await page.getByRole('button', { name: 'Thoát' }).click();
        bad.push(...(await axe(page, `S5 sheet dừng ${tag}`)));
        await page.getByRole('dialog').getByRole('button', { name: 'Dừng' }).click();
        await go(page, './#/kiem-tra?unit=1');
        await page.getByRole('button', { name: 'Chỉ nghe theo cụm' }).click();
        await page.locator('.chunk--covered').first().click();
        bad.push(...(await axe(page, `S5 bước 2 ${tag}`)));
        await go(page, './#/kiem-tra?unit=4');
        await page.getByRole('button', { name: 'Chỉ sắp xếp câu' }).click();
        await page.locator('[data-testid="s5-pool"] .chunk').first().click();
        bad.push(...(await axe(page, `S5 bước 3 ${tag}`)));

        await go(page, './#/cai-dat');
        await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
        bad.push(...(await axe(page, `S8 ${tag}`)));
        await page.getByRole('button', { name: /Giọng đọc/ }).click();
        bad.push(...(await axe(page, `S8 sheet giọng ${tag}`)));
        await page.keyboard.press('Escape');
        await page.getByRole('button', { name: 'Xóa tiến độ Tiếng Anh' }).click();
        bad.push(...(await axe(page, `S8 sheet xóa ${tag}`)));
        await page.keyboard.press('Escape');
        expect(bad).toEqual([]);
      });
    }
  }

  // @ac DATA-AC13
  test('luồng T2 → S5 → T3 → S8 chỉ gọi mạng tới origin của app', async ({ page, baseURL }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/luyen-tap');
    await page.getByRole('button', { name: /Kiểm tra nhanh/ }).click();
    await page.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }).click();
    await page.locator('.choice[data-correct="true"]').click();
    await page.getByRole('button', { name: 'Thoát' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Dừng' }).click();
    await page.getByRole('link', { name: 'Thư viện', exact: true }).click();
    await page.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' }).fill('book');
    await page.getByRole('link', { name: 'Cài đặt' }).click();
    await page.getByRole('button', { name: /Giọng đọc/ }).click();
    const origin = new URL(baseURL!).origin;
    expect(urls.filter((u) => !u.startsWith(origin))).toEqual([]);
    expect(urls.filter((u) => /\/api\/|get-data/.test(u))).toEqual([]);
  });

  // @ac T3-AC08
  // @ac APP-AC09
  for (const width of [900, 1000, 1100, 1280]) {
    test(`T3 hai cột không cuộn ngang và cột chi tiết đủ rộng (${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await seed(page, { 'vitasr2.settings': settings() });
      await go(page, './#/thu-vien');
      await expect(page.locator('.t3__detail-col')).toBeVisible();
      const m = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        detail: document.querySelector('.t3__detail-col')!.getBoundingClientRect().width,
      }));
      expect(m.scroll).toBeLessThanOrEqual(m.client);
      expect(m.detail).toBeGreaterThanOrEqual(240);
    });
  }
});
