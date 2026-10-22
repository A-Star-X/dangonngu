// Ảnh và số đo bằng chứng cho APP-AC34 (tên sản phẩm "Đa ngôn ngữ", APP-18).
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  npm run evidence  (cần build trước).
import { expect, test, type Locator, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { animationsDone, go, seed, settings } from './helpers';

test.skip(!process.env.EVIDENCE || Boolean(process.env.DEMO_SHOT), 'Chỉ chạy khi EVIDENCE=1 trên bản build thường');
test.use({ serviceWorkers: 'block' });

const OUT = 'docs/evidence/APP-AC34';

/** Logo chữ trong một vùng: khung chữ, số dòng, khoảng cách tới phần tử bấm được gần nhất bên phải. */
const measure = (area: Locator) =>
  area.evaluate((root) => {
    const logo = [...root.querySelectorAll('a[aria-label] > span[lang="vi"]')].find((e) => (e as HTMLElement).offsetParent !== null)!;
    const r = logo.getBoundingClientRect();
    const row = (logo.closest('header') ?? logo.closest('div'))!.getBoundingClientRect();
    const lineH = parseFloat(getComputedStyle(logo).lineHeight);
    const right = [...root.querySelectorAll('a, button, [data-testid="partner-logos"]')]
      .map((e) => e.getBoundingClientRect())
      .filter((b) => b.width > 0 && b.left >= r.right - 1 && Math.abs(b.top + b.height / 2 - (r.top + r.height / 2)) < 20)
      .sort((a, b) => a.left - b.left)[0];
    return {
      chu: logo.textContent,
      font: `${getComputedStyle(logo).fontWeight} ${getComputedStyle(logo).fontSize}`,
      cao: Math.round(r.height),
      soDong: Math.round(r.height / lineH),
      giuaLogo: Math.round(r.top + r.height / 2),
      giuaHang: Math.round(row.top + Math.min(row.height, 56) / 2),
      cachPhanTuBenPhai: right ? Math.round(right.left - r.right) : null,
      coO: logo.parentElement!.querySelector('svg') !== null,
    };
  });

async function ready(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await animationsDone(page);
  await page.mouse.move(0, 0);
}

for (const theme of ['light', 'dark'] as const) {
  test(`APP-18 logo ${theme}`, async ({ page }) => {
    mkdirSync(OUT, { recursive: true });
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': settings() });
    const out: Record<string, unknown> = {};
    for (const w of [1280, 375]) {
      await page.setViewportSize({ width: w, height: w < 768 ? 812 : 800 });
      await go(page, '/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await ready(page);
      await page.locator('header').first().screenshot({ path: `${OUT}/${w}-${theme}-header-cong-khai.jpg`, type: 'jpeg', quality: 75 });
      out[`cong-khai-${w}`] = await measure(page.locator('header').first());

      await go(page, '/hoc');
      await expect(page.getByTestId('sentence-card')).toBeVisible();
      await ready(page);
      if (w === 1280) {
        await page.screenshot({ path: `${OUT}/${w}-${theme}-dau-thanh-ben.jpg`, type: 'jpeg', quality: 75, clip: { x: 0, y: 0, width: 480, height: 140 } });
        out[`thanh-ben-${w}`] = await measure(page.locator('#app-sidebar'));
      } else {
        await page.locator('header').first().screenshot({ path: `${OUT}/${w}-${theme}-header-khu-hoc.jpg`, type: 'jpeg', quality: 75 });
        out[`header-khu-hoc-${w}`] = await measure(page.locator('header').first());
      }
    }
    writeFileSync(`${OUT}/do-dac-${theme}.json`, JSON.stringify(out, null, 2) + '\n');
  });
}

test('APP-18 icon và ảnh chia sẻ', async ({ request }) => {
  mkdirSync(OUT, { recursive: true });
  for (const [path, file] of [['/icon', 'icon.png'], ['/apple-icon', 'apple-icon.png'], ['/opengraph-image', 'anh-chia-se.png']]) {
    const res = await request.get(path);
    expect(res.ok(), path).toBe(true);
    writeFileSync(`${OUT}/${file}`, await res.body());
  }
});
