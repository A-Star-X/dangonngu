import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';

/** Người học dùng trong test: tài khoản chế độ trên máy (AU-06), đã đăng nhập sẵn. */
export const E2E_USER = { id: 'e2e-user', email: 'e2e@vitasr.test' };
export const E2E_SESSION = { token: 'local.e2e', user: E2E_USER };

/** Tiến độ mẫu 30 ngày (DATA-09), cặp English Fluency tiếng Anh. */
export const progress30 = JSON.parse(readFileSync('fixtures/progress/fluency-en-30-ngay.json', 'utf8'));

export const settings = (extra: Record<string, unknown> = {}) => ({
  schema: 1,
  lang: 'en',
  packByLang: { en: 'global' },
  voiceByLang: {},
  rate: 1,
  weeklyGoal: 5,
  guideSeen: true,
  ...extra,
});

/**
 * Ghi localStorage trước khi app chạy (một lần mỗi tab). Mặc định kèm phiên đăng nhập chế độ trên máy
 * và chủ dữ liệu là người đó, để vào thẳng khu học; `signedIn: false` để thử trang công khai và cổng đăng nhập.
 */
export async function seed(page: Page, values: Record<string, unknown>, opts: { signedIn?: boolean } = {}) {
  const all: Record<string, unknown> = opts.signedIn === false ? { ...values } : { 'vitasr2.auth': E2E_SESSION, 'vitasr2.owner': E2E_USER.id, ...values };
  await page.addInitScript((v) => {
    if (sessionStorage.getItem('__seeded')) return;
    sessionStorage.setItem('__seeded', '1');
    for (const [k, val] of Object.entries(v)) localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
  }, all);
}

/** Mở route bằng một lần tải trang mới. */
export async function go(page: Page, path: string) {
  await page.goto('about:blank');
  await page.goto(path);
}

/**
 * Chờ mọi chuyển động có điểm dừng chạy xong (hiện câu gốc, mở sheet, lớp phủ hướng dẫn) trước khi axe-core đo tương phản:
 * đo giữa lúc đang mờ dần sẽ ra tương phản thấp giả.
 */
export async function animationsDone(page: Page) {
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== 'running' || a.effect?.getComputedTiming().iterations === Infinity),
  );
}

export async function revealAndKnow(page: Page) {
  await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
  await page.getByRole('button', { name: /Tôi nhớ/ }).click();
}

export async function answerCorrect(page: Page) {
  await page.locator('button[data-correct="true"]').click();
}

/** Thanh bên (từ md) hoặc menu trượt (dưới md): vùng điều hướng chính. */
export const mainNav = (page: Page) => page.getByRole('navigation', { name: 'Điều hướng chính' });

/** Thẻ câu đã hiện (dữ liệu đã tải xong). */
export async function cardShown(page: Page) {
  await expect(page.getByTestId('sentence-card').first()).toBeVisible();
}
