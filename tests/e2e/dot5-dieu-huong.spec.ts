import { expect, test, type Page } from '@playwright/test';
import { go, mainNav, seed, settings } from './helpers';

// Trạng thái màn trong route, tải lại, Back và Forward, đường dẫn.

const global = () => settings({ packByLang: { en: 'global' } });

async function reloadKeeps(page: Page, check: () => Promise<void>) {
  await check();
  const url = page.url();
  await page.reload();
  await expect(page).toHaveURL(url);
  await check();
}

// @ac APP-AC21
test('tải lại ở mọi route giữ đúng màn và trạng thái trong route', async ({ page }) => {
  test.setTimeout(120000);
  await seed(page, { 'vitasr2.settings': global() });
  const cases: [string, () => Promise<void>][] = [
    ['/hoc', () => expect(page.getByTestId('sentence-card')).toBeVisible()],
    ['/luyen-tap', () => expect(page.getByRole('heading', { level: 1, name: 'Luyện tập' })).toBeVisible()],
    [
      '/thu-vien?xem=unit&trinh-do=B2&trang=1',
      async () => {
        await expect(page.getByRole('group', { name: 'Trình độ' }).getByRole('button', { name: 'B2' })).toHaveAttribute('aria-pressed', 'true');
        await expect(page.getByTestId('unit-card').first()).toContainText('B2');
      },
    ],
    ['/thu-vien?xem=cau&q=book&trang=1', () => expect(page.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' })).toHaveValue('book')],
    ['/thu-vien/unit?so=2', () => expect(page.getByRole('navigation', { name: 'Đường dẫn' })).toContainText('Unit 2')],
    ['/tien-do?khoang=30', () => expect(page.getByRole('button', { name: '30 ngày' })).toHaveAttribute('aria-pressed', 'true')],
    ['/cai-dat', () => expect(page.getByRole('heading', { level: 1, name: 'Cài đặt' })).toBeVisible()],
    ['/kiem-tra?unit=2', () => expect(page.getByText(/Kiểm tra nhanh · Unit 2\b/)).toBeVisible()],
  ];
  for (const [path, check] of cases) {
    await go(page, path);
    await reloadKeeps(page, check);
  }
  // S3: route có id phiên sau khi tạo; tải lại mở lại đúng phiên.
  await go(page, '/phien-hoc?nguon=lo-trinh');
  await expect(page).toHaveURL(/phien=/);
  await reloadKeeps(page, () => expect(page.getByText('Câu 1/8')).toBeVisible());
  // T3 sang trang 2 thì route có trang=2, tải lại vẫn ở trang 2.
  for (const xem of ['unit', 'cau']) {
    await go(page, `/thu-vien?xem=${xem}`);
    await page.getByRole('button', { name: 'Sau', exact: true }).click();
    await expect(page).toHaveURL(/trang=2/);
    await reloadKeeps(page, () => expect(page.getByText(/^Trang 2\//)).toBeVisible());
  }
});

// @ac APP-AC22
test('Back, Forward và đường dẫn giữ đúng trang Thư viện qua S10 và S3', async ({ page }) => {
  await seed(page, { 'vitasr2.settings': global() });
  await go(page, '/hoc');
  await mainNav(page).getByRole('link', { name: 'Thư viện', exact: true }).click();
  await expect(page.getByTestId('unit-card').first()).toBeVisible();
  await page.getByRole('button', { name: 'Sau', exact: true }).click();
  await expect(page).toHaveURL(/\/thu-vien\?.*trang=2/);
  const t3 = page.url();
  await page.getByTestId('unit-card').first().click();
  await expect(page).toHaveURL(/\/thu-vien\/unit\?so=\d+/);
  const s10 = page.url();
  await page.goBack();
  await expect(page).toHaveURL(t3);
  await expect(page.getByText(/^Trang 2\//)).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(s10);
  await page.getByRole('button', { name: 'Học unit này' }).click();
  await expect(page).toHaveURL(/nguon=unit/);
  await page.getByRole('button', { name: 'Thoát' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Dừng' }).click();
  await expect(page).toHaveURL(s10);
  await page.getByRole('navigation', { name: 'Đường dẫn' }).getByRole('link', { name: 'Thư viện' }).click();
  await expect(page).toHaveURL(t3);
  await expect(page.getByText(/^Trang 2\//)).toBeVisible();
});
