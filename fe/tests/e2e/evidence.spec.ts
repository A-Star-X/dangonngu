// Sinh ảnh bằng chứng cho các mục acceptance [claude] vào docs/evidence/.
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  EVIDENCE=1 npx playwright test evidence
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { answerCorrect, revealAndKnow, seed, settings } from './helpers';

test.skip(!process.env.EVIDENCE, 'Chỉ chạy khi EVIDENCE=1');
test.describe.configure({ mode: 'parallel' });

const OUT = 'docs/evidence';
const shot = async (page: Page, ac: string, name: string, opts: { full?: boolean; el?: string } = {}) => {
  mkdirSync(`${OUT}/${ac}`, { recursive: true });
  const path = `${OUT}/${ac}/${name}.jpg`;
  await page.waitForTimeout(250);
  if (opts.el) await page.locator(opts.el).first().screenshot({ path, type: 'jpeg', quality: 82 });
  else await page.screenshot({ path, type: 'jpeg', quality: 82, fullPage: opts.full ?? false });
};
const THEMES = ['light', 'dark'] as const;
const DAY = 86400000;
const learned = (ids: number[], streak = 1) =>
  Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak, due: Date.now() + 3 * DAY, lastAt: Date.now() }]));

/** Mở route và tải lại trang để app đọc lại localStorage. */
async function open(page: Page, hash: string) {
  await page.goto('about:blank');
  await page.goto(hash);
}

async function reset(page: Page, s: Record<string, unknown>, progress?: Record<string, unknown>) {
  await page.goto('./');
  await page.evaluate(
    ([st, p]) => {
      localStorage.clear();
      localStorage.setItem('vitasr2.settings', JSON.stringify(st));
      if (p) localStorage.setItem('vitasr2.progress.global.en', JSON.stringify({ schema: 1, sessions: [], attempts: [], items: p }));
    },
    [s, progress] as const,
  );
}

for (const theme of THEMES) {
  test(`S1 ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const w of [320, 375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      await open(page, './#/chon-ngon-ngu');
      await expect(page.getByText('Bạn muốn học ngôn ngữ nào?')).toBeVisible();
      await shot(page, 'S1-AC02', `${w}-${theme}`, { full: true });
      await page.getByRole('button', { name: /Tiếng Anh/ }).click();
      await shot(page, 'S1-AC08', `${w}-${theme}`, { full: true });
    }
  });

  test(`T1 ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    // Câu tiếng Anh dài nhất bộ Global (138 ký tự, id 3010) nằm ở unit 377: coi như đã học mọi câu trước nó.
    const longPath = learned([...Array(3009)].map((_, i) => i + 1));
    for (const [kind, prog] of [
      ['cau-ngan', undefined],
      ['cau-dai', longPath],
    ] as const) {
      await reset(page, settings(), prog);
      for (const w of [320, 375, 768, 1280]) {
        await page.setViewportSize({ width: w, height: 900 });
        await open(page, './#/hoc');
        await expect(page.locator('.card')).toBeVisible();
        await shot(page, 'T1-AC02', `${w}-${theme}-${kind}`, { full: true });
        if (w === 1280 && kind === 'cau-ngan') {
          await shot(page, 'T1-AC07', `1280-${theme}`);
          await shot(page, 'APP-AC01', `1280-${theme}`);
          await shot(page, 'C1-AC01', `1280-${theme}-co-dai`, { el: '.card' });
        }
        if (w === 375 && kind === 'cau-ngan') await shot(page, 'APP-AC01', `375-${theme}`);
        if ((w === 320 || w === 375) && kind === 'cau-ngan') await shot(page, 'C1-AC01', `${w}-${theme}-co-dai`, { el: '.card' });
      }
    }
  });

  test(`S3 ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.emulateMedia({ colorScheme: theme });
    for (const w of [320, 375, 1280]) {
      await reset(page, settings());
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      await open(page, './#/phien-hoc?nguon=lo-trinh');
      await expect(page.getByText('Câu 1/8')).toBeVisible();
      await shot(page, 'S3-AC07', `${w}-${theme}-1-S3a-truoc`, { full: true });
      if (w !== 1280) await shot(page, 'C3-AC02', `${w}-${theme}-khoa`, { el: '.rate-pair' });
      await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
      await shot(page, 'S3-AC07', `${w}-${theme}-2-S3a-sau`, { full: true });
      if (w !== 1280) {
        await shot(page, 'C3-AC02', `${w}-${theme}-mo`, { el: '.rate-pair' });
        await shot(page, 'C1-AC01', `${w}-${theme}-khong-dai`, { el: '.card' });
      }
      await page.getByRole('button', { name: /Tôi nhớ/ }).click();
      await shot(page, 'S3-AC07', `${w}-${theme}-3-S3b-truoc`, { full: true });
      await page.locator('.choice:not([data-correct])').first().click();
      await shot(page, 'S3-AC07', `${w}-${theme}-4-S3b-sai`, { full: true });
      await answerCorrect(page);
      await shot(page, 'S3-AC07', `${w}-${theme}-5-S3b-dung`, { full: true });
      await page.getByRole('button', { name: 'Thoát' }).click();
      if (w !== 320) await shot(page, 'C3-AC01', `${w}-${theme}`);
      await page.getByRole('dialog').getByRole('button', { name: 'Học tiếp' }).click();
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      for (let i = 1; i < 8; i++) {
        if (i === 3) {
          await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
          await page.getByRole('button', { name: /Cần ôn lại/ }).click();
        } else await revealAndKnow(page);
        await answerCorrect(page);
        await page.getByRole('button', { name: /Câu tiếp|Xem tổng kết/ }).click();
      }
      await expect(page.getByText('Xong phiên học')).toBeVisible();
      await shot(page, 'S3-AC07', `${w}-${theme}-6-S3c`, { full: true });
    }
  });

  test(`sheet và hướng dẫn ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    for (const w of [320, 375, 1280]) {
      await reset(page, settings({ guideSeen: false }));
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      await open(page, './#/hoc');
      for (let s = 1; s <= 3; s++) {
        await expect(page.getByText(`Bước ${s}/3`)).toBeVisible();
        await shot(page, 'S9-AC02', `${w}-${theme}-buoc-${s}`);
        if (s < 3) await page.getByRole('button', { name: 'Tiếp' }).click();
      }
      await page.getByRole('button', { name: 'Bỏ qua' }).click();
      if (w !== 320) {
        await page.getByRole('button', { name: /Tiếng Anh/ }).click();
        await shot(page, 'C6-AC01', `${w}-${theme}`);
      }
    }
  });
}

test.describe('phóng to', () => {
  test.use({ deviceScaleFactor: 6 });
  for (const theme of THEMES) {
    test(`dải 8 ô ${theme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: theme });
      const items = {
        1: { status: 'da-hoc', streak: 1, due: Date.now() + 3 * DAY, lastAt: Date.now() },
        2: { status: 'da-hoc', streak: 0, due: Date.now() - DAY, lastAt: Date.now() - DAY },
      };
      await seed(page, { 'vitasr2.settings': settings(), 'vitasr2.progress.global.en': { schema: 1, sessions: [], attempts: [], items } });
      await page.goto('./#/hoc');
      await expect(page.locator('.card .strip')).toBeVisible();
      await shot(page, 'C2-AC02', theme, { el: '.card .strip' });
    });
  }
});

test('iframe', async ({ browser, baseURL }) => {
  test.setTimeout(120000);
  for (const [w, h] of [
    [400, 700],
    [1100, 700],
  ]) {
    // Trang chứa là một tài liệu khác origin (about:blank), giống trang học chính nhúng mini app.
    const ctx = await browser.newContext({ viewport: { width: w + 40, height: h + 40 } });
    const page = await ctx.newPage();
    await page.setContent(
      `<body style="margin:20px;background:#ccc"><iframe src="${baseURL}#/chon-ngon-ngu" width="${w}" height="${h}" style="border:0"></iframe></body>`,
    );
    const f = page.frameLocator('iframe');
    await f.getByRole('button', { name: /Tiếng Anh/ }).click();
    await f.getByRole('button', { name: /English Fluency/ }).click();
    await f.getByRole('button', { name: 'Bỏ qua' }).click();
    await f.getByRole('button', { name: 'Học 8 câu' }).click();
    for (let i = 0; i < 8; i++) {
      await f.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
      await f.getByRole('button', { name: /Tôi nhớ/ }).click();
      await f.locator('.choice[data-correct="true"]').click();
      await f.getByRole('button', { name: /Câu tiếp|Xem tổng kết/ }).click();
    }
    await expect(f.getByText('Xong phiên học')).toBeVisible();
    await shot(page, 'APP-AC12', `iframe-${w}x${h}`);
    await ctx.close();
  }
});
