// Ảnh bằng chứng cho các mục acceptance [claude] của Đợt 5.
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  npm run evidence
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { seed, settings } from './helpers';

test.skip(!process.env.EVIDENCE, 'Chỉ chạy khi EVIDENCE=1');
test.describe.configure({ mode: 'parallel' });
test.use({ serviceWorkers: 'block' });

const OUT = 'docs/evidence';
const THEMES = ['light', 'dark'] as const;
const NOW = new Date('2026-10-08T10:00:00+07:00');
const DAY = 86400000;

const shot = async (page: Page, ac: string, name: string, full = false) => {
  mkdirSync(`${OUT}/${ac}`, { recursive: true });
  await page.waitForTimeout(250);
  await page.screenshot({ path: `${OUT}/${ac}/${name}.jpg`, type: 'jpeg', quality: 82, fullPage: full });
};
const note = (ac: string, name: string, data: unknown) => {
  mkdirSync(`${OUT}/${ac}`, { recursive: true });
  writeFileSync(`${OUT}/${ac}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
};
async function go(page: Page, hash: string) {
  await page.goto('about:blank');
  await page.goto(hash);
}

/** Global English: unit 1 đến 3 đã học (vài câu cần ôn), unit 4 đang học dở. */
function progress() {
  const now = NOW.getTime();
  const items: Record<string, unknown> = {};
  for (let id = 1; id < 30; id++) items[id] = { status: 'da-hoc', streak: 2, due: now + 3 * DAY, lastAt: now - 2 * DAY };
  for (const id of [3, 12, 27]) items[id] = { status: 'da-hoc', streak: 0, due: now - DAY, lastAt: now - DAY };
  return { schema: 1, sessions: [], attempts: [], items };
}

for (const theme of THEMES) {
  test(`T3 cách xem Unit và S10 ${theme}`, async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    await seed(page, { 'vitasr2.settings': settings({ packByLang: { en: 'global' }, theme }), 'vitasr2.progress.global.en': progress() });
    for (const w of [375, 1280, 1440]) {
      await page.setViewportSize({ width: w, height: w === 375 ? 812 : 900 });
      await go(page, './#/thu-vien');
      await expect(page.locator('.unit-row').first()).toBeVisible();
      await shot(page, 'T3-AC14', `${w}-${theme}`);
      note('T3-AC14', `${w}-${theme}`, await page.evaluate(() => {
        const rows = [...document.querySelectorAll('.unit-row')].map((r) => r.getBoundingClientRect().left);
        return {
          cuonNgang: document.documentElement.scrollWidth > innerWidth,
          soCot: new Set(rows.map((x) => Math.round(x))).size,
          khungThe: getComputedStyle(document.querySelector('.unit-row')!).borderStyle !== 'none',
        };
      }));
      if (w === 1440) continue;
      await go(page, './#/unit?so=4');
      await expect(page.getByRole('button', { name: 'Học unit này' })).toBeVisible();
      await shot(page, 'S10-AC08', `${w}-${theme}`, true);
      note('S10-AC08', `${w}-${theme}`, await page.evaluate(() => ({
        cuonNgang: document.documentElement.scrollWidth > innerWidth,
        nutChinh: document.querySelectorAll('.btn--primary').length,
        h1: getComputedStyle(document.querySelector('h1')!).fontSize,
        h2: [...document.querySelectorAll('h2')].map((h) => getComputedStyle(h).fontSize),
      })));
    }
  });
}

const progress30 = JSON.parse(readFileSync('fe/fixtures/progress/fluency-en-30-ngay.json', 'utf8'));
const fluency = (theme: string) => settings({ packByLang: { en: 'fluency' }, theme });
const noScroll = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);

for (const theme of THEMES) {
  test(`Bố cục theo khổ màn hình ${theme}`, async ({ page }) => {
    test.setTimeout(240000);
    await page.clock.setFixedTime(NOW);
    await seed(page, { 'vitasr2.settings': fluency(theme), 'vitasr2.progress.fluency.en': progress30 });
    const routes: [string, string][] = [
      ['T1', './#/hoc'],
      ['T2', './#/luyen-tap'],
      ['T3', './#/thu-vien'],
      ['T4', './#/tien-bo?khoang=30'],
      ['S8', './#/cai-dat'],
      ['S10', './#/unit?so=2'],
    ];
    const notes: Record<string, boolean> = {};
    for (const w of [320, 375, 768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width: w, height: w < 600 ? 812 : 900 });
      for (const [name, hash] of routes) {
        await go(page, hash);
        await expect(page.locator('main h1').first()).toBeAttached();
        await shot(page, 'APP-AC26', `${name}-${w}-${theme}`);
        notes[`${name}-${w}`] = await noScroll(page);
        if (name === 'T1' && [375, 1024, 1280, 1440].includes(w)) await shot(page, 'T1-AC07', `${w}-${theme}`);
        if (name === 'T2' && w >= 1024) await shot(page, 'T2-AC08', `${w}-${theme}`);
        if (name === 'T4' && w >= 1024) await shot(page, 'T4-AC11', `${w}-${theme}`, true);
        if (name === 'S8' && w >= 1024) await shot(page, 'S8-AC14', `${w}-${theme}`);
        if (name === 'S10' && [375, 1280].includes(w)) await shot(page, 'APP-AC24', `${w}-${theme}`);
      }
      if (w === 1024) {
        await go(page, './#/thu-vien?xem=cau');
        await page.locator('.lib-row').nth(1).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await shot(page, 'T3-AC08', `1024-${theme}-mot-cot-sheet`);
      }
    }
    note('APP-AC26', `khong-cuon-ngang-${theme}`, notes);
  });

  test(`Kiểm tra nhanh tạm dừng và câu cần xem lại ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.clock.setFixedTime(NOW);
    await seed(page, { 'vitasr2.settings': fluency(theme) });
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w < 600 ? 812 : 900 });
      await go(page, './#/kiem-tra?unit=2');
      await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
      await page.locator('.choice[data-correct="true"]').click();
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      await page.getByRole('button', { name: 'Thoát' }).click();
      await expect(page.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).toBeVisible();
      await shot(page, 'S5-AC15', `${w}-${theme}-1-sheet-tam-dung`);
      await page.getByRole('dialog').getByRole('button', { name: 'Tạm dừng' }).click();
      await expect(page.getByText(/^Đang làm dở:/)).toBeVisible();
      await shot(page, 'S5-AC15', `${w}-${theme}-2-T2-dong-lam-do`);
      await go(page, './#/kiem-tra?unit=2');
      await expect(page.getByRole('button', { name: 'Làm tiếp' })).toBeVisible();
      await shot(page, 'S5-AC15', `${w}-${theme}-3-man-bat-dau-lam-tiep`);
      await page.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }).click();
      for (let i = 0; i < 8; i++) {
        if (i === 1 || i === 4) await page.locator('.choice:not([data-correct])').first().click();
        await page.locator('.choice[data-correct="true"]').click();
        await page.getByRole('button', { name: /^(Câu tiếp|Xem kết quả)$/ }).click();
      }
      await expect(page.getByRole('region', { name: 'Câu cần xem lại' })).toBeVisible();
      await shot(page, 'S5-AC15', `${w}-${theme}-4-cau-can-xem-lai`, true);
    }
  });
}
