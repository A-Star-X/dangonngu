import type { Page } from '@playwright/test';

export const settings = (extra: Record<string, unknown> = {}) => ({
  schema: 1,
  lang: 'en',
  packByLang: { en: 'global' },
  theme: 'system',
  voiceByLang: {},
  rate: 1,
  weeklyGoal: 5,
  guideSeen: true,
  ...extra,
});

/** Ghi localStorage trước khi app chạy. */
export async function seed(page: Page, values: Record<string, unknown>) {
  await page.addInitScript((v) => {
    if (sessionStorage.getItem('__seeded')) return;
    sessionStorage.setItem('__seeded', '1');
    for (const [k, val] of Object.entries(v)) localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
  }, values);
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
  await page.locator('.choice[data-correct="true"]').click();
}
