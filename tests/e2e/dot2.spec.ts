import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { animationsDone, answerCorrect, go, mainNav, progress30, seed, settings } from './helpers';

const NOW = new Date('2026-10-08T10:00:00+07:00');

async function axe(page: Page, where: string) {
  await animationsDone(page);
  const r = await new AxeBuilder({ page }).analyze();
  return r.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${where}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test.describe('các màn còn lại', () => {
  for (const scheme of ['light', 'dark'] as const) {
    for (const width of [375, 1280]) {
      // @ac FND-AC15
      test(`axe-core không có lỗi serious hoặc critical ở T2, T3, S10, T4, S5, S8 và các sheet (${scheme}, ${width})`, async ({ page }) => {
        test.setTimeout(240000);
        await page.clock.setFixedTime(NOW);
        await seed(page, { 'vitasr2.settings': settings({ packByLang: { en: 'fluency' } }), 'vitasr2.progress.fluency.en': progress30 });
        const bad: string[] = [];
        const tag = `${scheme} ${width}`;
        await page.emulateMedia({ colorScheme: scheme });
        await page.setViewportSize({ width, height: 800 });

        await go(page, '/luyen-tap');
        await expect(page.getByRole('heading', { level: 1, name: 'Luyện tập' })).toBeVisible();
        bad.push(...(await axe(page, `T2 ${tag}`)));
        await page.getByRole('button', { name: /Học theo từ khóa/ }).click();
        await page.getByRole('searchbox', { name: 'Từ khóa' }).fill('airport');
        await expect(page.getByText(/^Tìm thấy/)).toBeVisible();
        bad.push(...(await axe(page, `T2 sheet từ khóa ${tag}`)));
        await page.keyboard.press('Escape');

        await go(page, '/thu-vien');
        await expect(page.getByTestId('unit-card').first()).toBeVisible();
        bad.push(...(await axe(page, `T3 cách xem Unit ${tag}`)));
        await go(page, '/thu-vien/unit?so=2');
        await expect(page.getByRole('button', { name: /unit này$/ }).first()).toBeVisible();
        bad.push(...(await axe(page, `S10 ${tag}`)));

        await go(page, '/thu-vien?xem=cau');
        const rows = page.locator('main button[data-id]');
        await expect(rows.first()).toBeVisible();
        bad.push(...(await axe(page, `T3 ${tag}`)));
        await rows.nth(2).click();
        if (width < 1200) {
          await expect(page.getByRole('dialog')).toBeVisible();
          bad.push(...(await axe(page, `T3 sheet chi tiết ${tag}`)));
          await page.keyboard.press('Escape');
          await expect(page.getByRole('dialog')).toBeHidden();
        }
        await page.getByRole('combobox', { name: /Trạng thái/ }).click();
        await expect(page.getByRole('listbox')).toBeVisible();
        bad.push(...(await axe(page, `T3 danh sách lọc trạng thái ${tag}`)));
        await page.keyboard.press('Escape');

        for (const k of ['1', '7', '30']) {
          await go(page, `/tien-do?khoang=${k}`);
          await expect(page.getByRole('heading', { level: 1, name: 'Tiến độ' })).toBeVisible();
          bad.push(...(await axe(page, `T4 ${k} ngày ${tag}`)));
        }
        await page.getByRole('button', { name: /^Thứ Năm, 8\/10/ }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        bad.push(...(await axe(page, `T4 sheet ngày ${tag}`)));
        await page.keyboard.press('Escape');

        await go(page, '/kiem-tra?unit=1');
        await expect(page.getByRole('button', { name: 'Làm cả 3 bước' })).toBeVisible();
        bad.push(...(await axe(page, `S5 bắt đầu ${tag}`)));
        await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
        await expect(page.locator('button[data-correct="true"]')).toBeVisible();
        bad.push(...(await axe(page, `S5 bước 1 ${tag}`)));
        await answerCorrect(page);
        await page.getByRole('button', { name: 'Thoát' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        bad.push(...(await axe(page, `S5 sheet dừng ${tag}`)));
        await page.getByRole('dialog').getByRole('button', { name: 'Tạm dừng' }).click();
        await go(page, '/kiem-tra?unit=1');
        await page.getByRole('button', { name: 'Chỉ nghe theo cụm' }).click();
        await page.locator('main button[data-state="covered"]').first().click();
        bad.push(...(await axe(page, `S5 bước 2 ${tag}`)));
        await go(page, '/kiem-tra?unit=4');
        await page.getByRole('button', { name: 'Chỉ sắp xếp câu' }).click();
        await page.locator('[data-testid="s5-pool"] button').first().click();
        bad.push(...(await axe(page, `S5 bước 3 ${tag}`)));

        await go(page, '/cai-dat');
        await expect(page.getByRole('heading', { level: 1, name: 'Cài đặt' })).toBeVisible();
        bad.push(...(await axe(page, `S8 ${tag}`)));
        await page.getByTestId('s8-voice-row').click();
        await expect(page.getByRole('dialog')).toBeVisible();
        bad.push(...(await axe(page, `S8 sheet giọng ${tag}`)));
        await page.keyboard.press('Escape');
        await expect(page.getByRole('dialog')).toBeHidden();
        await page.getByRole('button', { name: /^Xóa tiến độ/ }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        bad.push(...(await axe(page, `S8 sheet xóa ${tag}`)));
        await page.keyboard.press('Escape');
        expect(bad).toEqual([]);
      });

      // @ac FND-AC15
      test(`axe-core không có lỗi serious hoặc critical ở Landing, Đăng nhập, Đăng ký (${scheme}, ${width})`, async ({ page }) => {
        await seed(page, {}, { signedIn: false });
        await page.emulateMedia({ colorScheme: scheme });
        await page.setViewportSize({ width, height: 800 });
        const bad: string[] = [];
        for (const [name, path] of [
          ['Landing', '/'],
          ['Đăng nhập', '/dang-nhap'],
          ['Đăng ký', '/dang-ky'],
        ]) {
          await go(page, path);
          await expect(page.locator('h1')).toHaveCount(1);
          bad.push(...(await axe(page, `${name} ${scheme} ${width}`)));
        }
        // Lỗi kiểm tra ô nhập (AU-03) cũng được quét.
        await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
        await expect(page.getByText('Nhập email.')).toBeVisible();
        bad.push(...(await axe(page, `Đăng ký có lỗi ${scheme} ${width}`)));
        expect(bad).toEqual([]);
      });
    }
  }

  // @ac DATA-AC13
  test('luồng T2 → S5 → T3 → S8 chỉ gọi mạng tới origin của website', async ({ page, baseURL }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/luyen-tap');
    await page.getByRole('button', { name: /Kiểm tra nhanh/ }).click();
    await page.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }).click();
    await answerCorrect(page);
    await page.getByRole('button', { name: 'Thoát' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Tạm dừng' }).click();
    await mainNav(page).getByRole('link', { name: 'Thư viện', exact: true }).click();
    await page.getByRole('button', { name: 'Xem theo câu' }).click();
    await page.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' }).fill('book');
    await expect(page.getByTestId('t3-count')).not.toHaveText(/^0 câu/);
    await mainNav(page).getByRole('link', { name: 'Cài đặt', exact: true }).click();
    await page.getByTestId('s8-voice-row').click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const origin = new URL(baseURL!).origin;
    expect(urls.filter((u) => !u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:'))).toEqual([]);
    expect(urls.filter((u) => /\/api\/|get-data/.test(u))).toEqual([]);
  });

  // @ac T3-AC08
  // @ac APP-AC09
  // T3-07: hai cột từ 1200 px; dưới 1200 px một cột, chạm dòng mở sheet.
  for (const width of [900, 1024]) {
    test(`T3 cách xem Câu một cột dưới 1200 px (${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await seed(page, { 'vitasr2.settings': settings() });
      await go(page, '/thu-vien?xem=cau');
      const rows = page.locator('main button[data-id]');
      await expect(rows.first()).toBeVisible();
      await expect(page.locator('aside[aria-label="Chi tiết câu"]')).toHaveCount(0);
      await rows.nth(1).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    });
  }
  for (const width of [1200, 1280, 1440]) {
    test(`T3 hai cột không cuộn ngang và cột chi tiết đủ rộng (${width})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await seed(page, { 'vitasr2.settings': settings() });
      await go(page, '/thu-vien?xem=cau');
      const detail = page.locator('aside[aria-label="Chi tiết câu"]');
      await expect(detail).toBeVisible();
      const m = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        list: document.querySelector('main button[data-id]')!.closest('ul')!.getBoundingClientRect().width,
        detail: document.querySelector('aside[aria-label="Chi tiết câu"]')!.getBoundingClientRect().width,
      }));
      expect(m.scroll).toBeLessThanOrEqual(m.client);
      expect(m.list).toBeLessThanOrEqual(480);
      expect(m.detail).toBeGreaterThanOrEqual(240);
      // Chạm dòng khác thì cột phải đổi, không mở sheet.
      await page.locator('main button[data-id]').nth(4).click();
      await expect(detail.getByRole('heading', { name: 'Câu 0005' })).toBeVisible();
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });
  }
});
