// Ảnh và số đo bằng chứng cho C5-AC08 (logo đơn vị đồng hành, C5-08, LP-01).
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  npm run evidence  (cần build trước).
// Ảnh bản dùng thử (AU-08) chỉ chụp khi DEMO_SHOT=1, trên bản build có NEXT_PUBLIC_APP_ENV=demo.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { animationsDone, go, seed, settings } from './helpers';

test.skip(!process.env.EVIDENCE, 'Chỉ chạy khi EVIDENCE=1');
test.use({ serviceWorkers: 'block' });

const OUT = 'docs/evidence/C5-AC08';

/** Khung của logo VITASR và hai logo đối tác đang hiện, để so chiều cao, khoảng cách, căn giữa theo chiều dọc. */
const measure = (page: Page) =>
  page.evaluate(() => {
    const box = (e: Element | null) => {
      if (!e) return null;
      const r = e.getBoundingClientRect();
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), giua: Math.round(r.y + r.height / 2) };
    };
    const visible = (e: Element) => (e as HTMLElement).offsetParent !== null && e.getBoundingClientRect().width > 0;
    const logo = [...document.querySelectorAll('svg')].find((s) => s.closest('a[aria-label]') && visible(s)) ?? null;
    const groups = [...document.querySelectorAll('[data-testid="partner-logos"]')].filter(visible);
    const khung = groups.map((g) => [...g.querySelectorAll('[data-testid="partner-frame"]')].map((f) => box(f)));
    return {
      vitasr: box(logo),
      doiTac: groups.map((g) => [...g.querySelectorAll('img')].filter(visible).map((i) => ({ alt: i.getAttribute('alt'), src: i.getAttribute('src')?.replace(/.*url=([^&]+).*/, (_, u) => decodeURIComponent(u)), ...box(i) }))),
      khung,
      tranNgang: document.documentElement.scrollWidth > window.innerWidth,
    };
  });

async function shot(page: Page, name: string, full = false) {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // Chỉ chờ ảnh đang hiện: ảnh ẩn (bản tối khi đang sáng, bản của khổ khác) tải lười nên không bao giờ xong.
  await page.waitForFunction(() => [...document.images].filter((i) => i.offsetParent !== null).every((i) => i.complete && i.naturalWidth > 0));
  await animationsDone(page);
  await page.mouse.move(0, 0);
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: 'jpeg', quality: full ? 50 : 70, fullPage: full });
}

for (const theme of ['light', 'dark'] as const) {
  test(`C5-08 logo ${theme}`, async ({ page }) => {
    test.skip(Boolean(process.env.DEMO_SHOT), 'Bản build demo: chỉ chụp ảnh bản dùng thử');
    mkdirSync(OUT, { recursive: true });
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': settings() });
    const out: Record<string, unknown> = {};

    await page.setViewportSize({ width: 1280, height: 800 });
    await go(page, '/hoc');
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    await shot(page, `1280-${theme}-khu-hoc`);
    out['khu-hoc-1280'] = await measure(page);

    await page.setViewportSize({ width: 375, height: 812 });
    await go(page, '/hoc');
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    await page.getByTestId('menu-button').click();
    await expect(page.locator('#app-sidebar [data-testid="partner-logos"]')).toBeVisible();
    await shot(page, `375-${theme}-khu-hoc-menu-mo`);
    out['khu-hoc-375-menu-mo'] = await measure(page);

    for (const w of [1280, 375]) {
      await page.setViewportSize({ width: w, height: w < 768 ? 812 : 800 });
      await go(page, '/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await shot(page, `${w}-${theme}-landing`, true);
      if (w === 1280) await shot(page, `${w}-${theme}-landing-header`);
      out[`landing-${w}`] = await measure(page);
    }
    writeFileSync(`${OUT}/do-dac-${theme}.json`, JSON.stringify(out, null, 2) + '\n');
  });
}

// Bản dùng thử: chân thanh bên chỉ có "Trang chủ" và logo, không có dòng báo chế độ (AU-08, C5-08).
for (const theme of ['light', 'dark'] as const) {
  test(`C5-08 logo bản dùng thử ${theme}`, async ({ page }) => {
    test.skip(!process.env.DEMO_SHOT, 'Chỉ chạy khi DEMO_SHOT=1 trên bản build demo');
    mkdirSync(OUT, { recursive: true });
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': settings() }, { signedIn: false });
    const out: Record<string, unknown> = {};
    for (const w of [1280, 375]) {
      await page.setViewportSize({ width: w, height: w < 768 ? 812 : 800 });
      await go(page, '/hoc');
      await expect(page.getByTestId('sentence-card')).toBeVisible();
      if (w < 768) await page.getByTestId('menu-button').click();
      await expect(page.locator('#app-sidebar [data-testid="partner-logos"]')).toBeVisible();
      await shot(page, `${w}-${theme}-demo-khu-hoc`);
      out[`demo-${w}`] = { ...(await measure(page)), chanThanhBen: await page.locator('#app-sidebar > div').last().innerText() };
    }
    writeFileSync(`${OUT}/do-dac-demo-${theme}.json`, JSON.stringify(out, null, 2) + '\n');
  });
}
