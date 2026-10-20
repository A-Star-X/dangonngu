// Ảnh bằng chứng cho các mục acceptance [claude] của Đợt 5.
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  npm run evidence
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
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
