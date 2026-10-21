// Ảnh và số đo bằng chứng cho các mục acceptance [claude] trên bản Next.js (Đợt 6).
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  npm run evidence  (cần build trước).
// Ảnh ghi vào docs/evidence/<mã mục>/d6-<khổ>-<giao diện>-<nội dung>.jpg, số đo vào file .json cùng tên.
import { expect as baseExpect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { answerCorrect, go, progress30, revealAndKnow, seed, settings } from './helpers';

test.skip(!process.env.EVIDENCE, 'Chỉ chạy khi EVIDENCE=1');
// Nhiều trang chụp song song: dữ liệu câu tải chậm hơn bình thường, nên chờ lâu hơn mặc định 5 giây.
const expect = baseExpect.configure({ timeout: 20000 });
test.describe.configure({ mode: 'parallel' });
// Chặn service worker để mỗi lần mở trang đọc thẳng bản build và để giả lập mạng chậm được.
test.use({ serviceWorkers: 'block' });

const OUT = 'docs/evidence';
const THEMES = ['light', 'dark'] as const;
type Theme = (typeof THEMES)[number];
const NOW = new Date('2026-10-08T10:00:00+07:00');
const DAY = 86400000;

// ---------- ghi ảnh, số đo ----------

const shot = async (page: Page, ac: string, name: string, opts: { full?: boolean; el?: string | Locator; quality?: number; clip?: { x: number; y: number; width: number; height: number } } = {}) => {
  mkdirSync(`${OUT}/${ac}`, { recursive: true });
  const path = `${OUT}/${ac}/d6-${name}.jpg`;
  // Con trỏ còn đứng chỗ vừa bấm thì phần tử dưới nó hiện trạng thái hover giả: đưa con trỏ ra góc.
  await page.mouse.move(0, 0);
  // Chờ font tải xong (Literata, Noto) để ảnh không chụp chữ bằng font dự phòng.
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  // Ảnh cả trang chụp khi trang đã cuộn thì header cố định bị vẽ giữa trang: cuộn về đầu trước.
  if (opts.full) await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(250);
  // Ảnh cả trang nén mạnh hơn để giữ tổng dung lượng bằng chứng nhỏ; ảnh một phần tử giữ nét hơn.
  const o = { path, type: 'jpeg' as const, quality: opts.quality ?? (opts.full ? 50 : 60) };
  if (opts.el) await (typeof opts.el === 'string' ? page.locator(opts.el) : opts.el).first().screenshot(o);
  else await page.screenshot({ ...o, fullPage: opts.full ?? false, clip: opts.clip });
};
const note = (ac: string, name: string, data: unknown) => {
  mkdirSync(`${OUT}/${ac}`, { recursive: true });
  writeFileSync(`${OUT}/${ac}/d6-${name}.json`, JSON.stringify(data, null, 2) + '\n');
};
const view = (page: Page, w: number, h?: number) => page.setViewportSize({ width: w, height: h ?? (w < 768 ? 812 : 800) });

// ---------- dữ liệu mẫu ----------

const fluency = () => settings({ packByLang: { en: 'fluency' } });
const global = () => settings({ packByLang: { en: 'global' } });

/** Global English: mọi câu trước id `upTo` đã học, vài câu cần ôn để có đủ trạng thái. */
function globalProgress(upTo: number, due: number[] = [3, 5, 3011, 3013]) {
  const now = NOW.getTime();
  const items: Record<string, unknown> = {};
  for (let id = 1; id < upTo; id++) items[id] = { status: 'da-hoc', streak: 2, due: now + 3 * DAY, lastAt: now - 2 * DAY };
  for (const id of due) items[id] = { status: 'da-hoc', streak: 0, due: now - DAY, lastAt: now - DAY };
  return { schema: 1, sessions: [], attempts: [], items };
}

/** Global English: unit 1 đến 3 đã học (vài câu cần ôn), unit 4 đang học dở. */
const unitProgress = () => globalProgress(30, [3, 12, 27]);

const base = (theme: Theme, extra: Record<string, unknown> = {}) => ({ 'vitasr2.theme': theme, 'vitasr2.settings': global(), ...extra });

/** Ghi thêm localStorage trên trang đang mở rồi mở lại route. */
async function put(page: Page, values: Record<string, unknown>, path: string) {
  await page.evaluate((v) => {
    for (const [k, val] of Object.entries(v)) {
      if (val === null) localStorage.removeItem(k);
      else localStorage.setItem(k, typeof val === 'string' ? val : JSON.stringify(val));
    }
  }, values);
  await go(page, path);
}

// ---------- công cụ đo trong trang ----------

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}
interface Tools {
  box(sel: string | Element | null): Box | null;
  layout(): Record<string, unknown>;
  primaries(): string[];
  blocks(): Record<string, unknown>;
}

/** Cài `window.__ev` trước khi app chạy: đo hộp, bố cục khung, nút nền primary, khoảng cách giữa các khối. */
function installTools() {
  const box = (sel: string | Element | null) => {
    const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  };
  const visible = (e: Element) => {
    const b = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    return b.width > 0 && b.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && !e.closest('[inert]') && !e.closest('.sr-only');
  };
  const primaries = () =>
    [...document.querySelectorAll('a, button')]
      .filter((e) => /(^|\s)bg-primary(\s|$)/.test(e.getAttribute('class') || '') && visible(e))
      .map((e) => (e.textContent || e.getAttribute('aria-label') || '').trim());
  const layout = () => {
    const header = document.querySelector('header');
    const sidebar = document.getElementById('app-sidebar');
    const content = document.querySelector('main#main > div') ?? document.querySelector('main#main');
    const cs = content ? getComputedStyle(content) : null;
    const h1 = document.querySelector('main h1');
    const sb = sidebar?.getBoundingClientRect();
    return {
      viewport: window.innerWidth,
      cuonNgang: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      header: box(header),
      sidebar: box(sidebar),
      sidebarHienRa: sb ? sb.right > 1 && !sidebar!.hasAttribute('inert') : null,
      content: box(content),
      contentPadding: cs ? { left: cs.paddingLeft, right: cs.paddingRight, top: cs.paddingTop } : null,
      h1: h1 ? { text: (h1.textContent || '').trim(), fontSize: getComputedStyle(h1).fontSize, srOnly: h1.classList.contains('sr-only') } : null,
      nutPrimary: primaries(),
    };
  };
  /** Khoảng cách dọc giữa các khối con liền nhau của vùng nội dung, và giữa mỗi tiêu đề section (h2) với phần ngay sau. */
  const blocks = () => {
    // Đi xuống tới khối có nhiều con: vùng nội dung thường chỉ bọc một phần tử gốc của trang.
    let root: Element | null = document.querySelector('main#main > div');
    while (root && [...root.children].filter(visible).length === 1) root = [...root.children].filter(visible)[0];
    // Xếp theo vị trí trên màn (lưới có thể đổi thứ tự hiển thị bằng order).
    const kids = root ? [...root.children].filter(visible).sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top) : [];
    const gaps: { tu: string; den: string; px: number }[] = [];
    const tag = (e: Element) => `${e.tagName.toLowerCase()}${e.id ? '#' + e.id : ''}${e.querySelector('h1,h2') ? ' "' + (e.querySelector('h1,h2')!.textContent || '').trim().slice(0, 30) + '"' : ''}`;
    for (let i = 1; i < kids.length; i++) {
      const a = kids[i - 1].getBoundingClientRect();
      const b = kids[i].getBoundingClientRect();
      if (b.top >= a.bottom - 1) gaps.push({ tu: tag(kids[i - 1]), den: tag(kids[i]), px: Math.round(b.top - a.bottom) });
    }
    const titles = [...document.querySelectorAll('main h2')].filter(visible).map((h) => {
      const next = h.nextElementSibling;
      const hb = h.getBoundingClientRect();
      return {
        text: (h.textContent || '').trim().slice(0, 40),
        fontSize: getComputedStyle(h).fontSize,
        denPhanSau: next && visible(next) ? Math.round(next.getBoundingClientRect().top - hb.bottom) : null,
      };
    });
    const header = document.querySelector('main header');
    const afterHeader = header && header.nextElementSibling ? Math.round(header.nextElementSibling.getBoundingClientRect().top - header.getBoundingClientRect().bottom) : null;
    return { khoiGoc: root ? `${root.tagName.toLowerCase()}.${[...root.classList].filter((c) => /^(gap|flex|grid)/.test(c)).join('.')}` : null, khoangGiuaKhoi: gaps, tieuDeSection: titles, tieuDeManDenNoiDung: afterHeader };
  };
  (window as unknown as { __ev: unknown }).__ev = { box, layout, primaries, blocks };
}

const tools = async (page: Page) => page.addInitScript(installTools);
const layout = (page: Page) => page.evaluate(() => (window as unknown as { __ev: Tools }).__ev.layout());
const blocks = (page: Page) => page.evaluate(() => (window as unknown as { __ev: Tools }).__ev.blocks());

async function openMenu(page: Page) {
  await page.getByTestId('menu-button').click();
  await expect(page.locator('#app-sidebar[data-open]')).toBeVisible();
  await page.waitForTimeout(300);
}

async function waitShell(page: Page) {
  await expect(page.locator('main#main')).toBeVisible();
  await expect(page.locator('main h1').first()).toBeAttached();
}

// ---------- S1 Chọn ngôn ngữ ----------

for (const theme of THEMES) {
  test(`S1 ${theme}`, async ({ page }) => {
    await tools(page);
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': settings({ lang: undefined }) });
    const out: Record<string, unknown> = {};
    for (const w of [320, 375, 1280]) {
      await view(page, w);
      await go(page, '/chon-ngon-ngu');
      await expect(page.getByRole('heading', { level: 1, name: 'Bạn muốn học ngôn ngữ nào?' })).toBeVisible();
      await expect(page.getByRole('button', { name: /Tiếng Nhật/ })).toBeVisible();
      await shot(page, 'S1-AC02', `${w}-${theme}-danh-sach`, { full: true });
      out[w] = {
        ...(await layout(page)),
        dongTiengAnh: await page.getByRole('button', { name: /Tiếng Anh/ }).first().innerText(),
        dongTiengNhat: await page.getByRole('button', { name: /Tiếng Nhật/ }).first().innerText(),
      };
      await page.getByRole('button', { name: /Tiếng Anh/ }).first().click();
      await expect(page.getByRole('button', { name: /Global English/ })).toBeVisible();
      await shot(page, 'S1-AC08', `${w}-${theme}-chon-bo`, { full: true });
    }
    note('S1-AC02', `do-dac-${theme}`, out);
  });
}

// ---------- T1 Học, thẻ câu ----------

for (const theme of THEMES) {
  test(`T1 ${theme}`, async ({ page }) => {
    test.setTimeout(180000);
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, base(theme));
    const out: Record<string, unknown> = {};
    // Câu tiếng Anh dài nhất bộ Global (138 ký tự, id 3010) ở unit 377: coi như đã học mọi câu trước nó.
    for (const [kind, prog] of [
      ['cau-ngan', null],
      ['cau-dai', globalProgress(3010, [])],
    ] as const) {
      await go(page, '/hoc');
      await put(page, { 'vitasr2.progress.global.en': prog }, '/hoc');
      for (const w of [320, 375, 768, 1280]) {
        await view(page, w);
        await go(page, '/hoc');
        await expect(page.getByTestId('sentence-card').first()).toBeVisible();
        await shot(page, 'T1-AC02', `${w}-${theme}-${kind}`, { full: true });
        out[`${kind}-${w}`] = {
          ...(await layout(page)),
          cauGoc: await page.getByTestId('source-text').first().evaluate((e) => ({
            text: e.textContent,
            soKyTu: (e.textContent || '').length,
            fontSize: getComputedStyle(e).fontSize,
            lopCo: [...e.classList].filter((c) => /^text-(xs|sm|base|lg|xl|2xl|display)/.test(c)),
            tran: e.scrollWidth > e.clientWidth,
          })),
        };
        if (kind === 'cau-ngan' && (w === 320 || w === 375)) await shot(page, 'C1-AC01', `${w}-${theme}-co-dai-8-o`, { el: '[data-testid="sentence-card"]' });
      }
    }
    note('T1-AC02', `do-dac-${theme}`, out);
  });
}

// ---------- S3 Phiên học, nút ----------

for (const theme of THEMES) {
  test(`S3 ${theme}`, async ({ page }) => {
    test.setTimeout(240000);
    await tools(page);
    await seed(page, base(theme));
    const out: Record<string, unknown> = {};
    for (const w of [320, 375, 1280]) {
      await view(page, w);
      await go(page, '/hoc');
      await put(page, { 'vitasr2.progress.global.en': null }, '/phien-hoc?nguon=lo-trinh');
      await expect(page.getByText('Câu 1/8')).toBeVisible();
      await shot(page, 'S3-AC07', `${w}-${theme}-1-S3a-truoc`, { full: true });
      const rate = page.getByRole('button', { name: /Tôi nhớ/ }).locator('xpath=..');
      const ratePair = async () =>
        rate.evaluate((el) => {
          const [a, b] = [...el.querySelectorAll('button')].map((x) => x.getBoundingClientRect());
          const s = [...el.querySelectorAll('button')].map((x) => ({ text: (x.textContent || '').trim(), opacity: getComputedStyle(x).opacity, svg: !!x.querySelector('svg') }));
          return { trai: { w: Math.round(a.width), h: Math.round(a.height) }, phai: { w: Math.round(b.width), h: Math.round(b.height) }, khoangCach: Math.round(b.left - a.right), nut: s };
        });
      const truocKhiHien = await ratePair();
      if (w !== 1280) await shot(page, 'C3-AC02', `${w}-${theme}-khoa`, { el: rate });
      await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
      await shot(page, 'S3-AC07', `${w}-${theme}-2-S3a-sau`, { full: true });
      const sauKhiHien = await ratePair();
      if (w !== 1280) {
        await shot(page, 'C3-AC02', `${w}-${theme}-mo`, { el: rate });
        await shot(page, 'C1-AC01', `${w}-${theme}-khong-dai`, { el: '[data-testid="sentence-card"]' });
      }
      out[`danh-gia-${w}`] = { truocKhiHien, sauKhiHien };
      await page.getByRole('button', { name: /Tôi nhớ/ }).click();
      await expect(page.getByText('Câu này nghĩa là gì?')).toBeVisible();
      await shot(page, 'S3-AC07', `${w}-${theme}-3-S3b-truoc`, { full: true });
      await page.locator('button[data-correct="true"]').locator('xpath=ancestor::ul[1]//button[not(@data-correct)]').first().click();
      await shot(page, 'S3-AC07', `${w}-${theme}-4-S3b-sai`, { full: true });
      const sai = await page.locator('button[data-state="wrong"]').evaluate((e) => {
        const s = getComputedStyle(e);
        const root = getComputedStyle(document.documentElement);
        return { border: s.borderColor, background: s.backgroundColor, text: (e.textContent || '').trim(), danger: root.getPropertyValue('--danger').trim(), dangerSoft: root.getPropertyValue('--danger-soft').trim(), primary: root.getPropertyValue('--primary').trim() };
      });
      if (w === 1280) {
        await shot(page, 'FND-AC03', `1280-${theme}-S3b-sai`, { full: true });
        note('FND-AC03', `S3b-sai-${theme}`, sai);
      }
      await answerCorrect(page);
      await shot(page, 'S3-AC07', `${w}-${theme}-5-S3b-dung`, { full: true });
      await page.getByRole('button', { name: 'Thoát' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      if (w === 375) await shot(page, 'S3-AC07', `${w}-${theme}-sheet-thoat`);
      await page.getByRole('dialog').getByRole('button', { name: 'Học tiếp' }).click();
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      for (let i = 1; i < 8; i++) {
        await expect(page.getByText(`Câu ${i + 1}/8`)).toBeVisible();
        if (i === 3) {
          await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
          await page.getByRole('button', { name: /Cần ôn lại/ }).click();
        } else await revealAndKnow(page);
        await answerCorrect(page);
        await page.getByRole('button', { name: /^(Câu tiếp|Xem tổng kết)$/ }).click();
      }
      await expect(page.getByText('Xong phiên học')).toBeVisible();
      await shot(page, 'S3-AC07', `${w}-${theme}-6-S3c`, { full: true });
      out[`tong-ket-${w}`] = await layout(page);
    }
    note('S3-AC07', `do-dac-${theme}`, out);
    note('C3-AC02', `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith('danh-gia'))));
  });
}

// ---------- C3 nút chính và nút phụ ----------

for (const theme of THEMES) {
  test(`C3 nút ${theme}`, async ({ page }) => {
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, base(theme, { 'vitasr2.progress.global.en': unitProgress() }));
    const out: Record<string, unknown> = {};
    const measure = (sel: string) =>
      page.locator(sel).evaluateAll((els) =>
        els.map((e) => {
          const b = e.getBoundingClientRect();
          const s = getComputedStyle(e);
          const parent = e.parentElement!.getBoundingClientRect();
          return {
            text: (e.textContent || '').trim(),
            w: Math.round(b.width),
            h: Math.round(b.height),
            rongKhoiCha: Math.round(parent.width),
            nen: s.backgroundColor,
            chu: s.color,
            vien: `${s.borderTopWidth} ${s.borderTopColor}`,
            boGoc: s.borderRadius,
            coChu: s.fontSize,
            dam: s.fontWeight,
          };
        }),
      );
    for (const w of [375, 1280]) {
      await view(page, w);
      await go(page, '/hoc');
      await expect(page.getByTestId('sentence-card')).toBeVisible();
      await shot(page, 'C3-AC01', `${w}-${theme}-T1-nut-chinh`);
      out[`T1-${w}`] = await measure('main [data-guide="start"] [class*="rounded-button"]');
      await go(page, '/thu-vien/unit?so=4');
      await expect(page.getByRole('button', { name: /unit này$/ }).first()).toBeVisible();
      await shot(page, 'C3-AC01', `${w}-${theme}-S10-nut-chinh-nut-phu`, { full: true });
      out[`S10-${w}`] = await measure('main [class*="rounded-button"]');
    }
    note('C3-AC01', `do-dac-${theme}`, out);
  });
}

// ---------- S9 hướng dẫn, C6 sheet ----------

for (const theme of THEMES) {
  test(`S9 và C6 ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await tools(page);
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': settings({ guideSeen: false }) });
    const out: Record<string, unknown> = {};
    for (const w of [320, 375, 1280]) {
      await view(page, w);
      await go(page, '/hoc');
      await put(page, { 'vitasr2.settings': settings({ guideSeen: false }) }, '/hoc');
      for (let s = 1; s <= 3; s++) {
        await expect(page.getByText(`Bước ${s}/3`)).toBeVisible();
        await page.waitForTimeout(400);
        await shot(page, 'S9-AC02', `${w}-${theme}-buoc-${s}`);
        out[`${w}-buoc-${s}`] = await page.evaluate((step) => {
          const key = ['card', 'start', 'nav'][step - 1];
          const target = [...document.querySelectorAll(`[data-guide="${key}"]`)].find((e) => {
            const b = e.getBoundingClientRect();
            return b.width > 0 && b.height > 0 && b.right > 0;
          });
          const bubble = document.getElementById('guide-text')!.parentElement!;
          const t = target?.getBoundingClientRect();
          const b = bubble.getBoundingClientRect();
          const r = (x: DOMRect | undefined) => (x ? { x: Math.round(x.x), y: Math.round(x.y), w: Math.round(x.width), h: Math.round(x.height) } : null);
          const overlap = t ? !(b.right <= t.left || b.left >= t.right || b.bottom <= t.top || b.top >= t.bottom) : null;
          return { phanTu: key, phanTuHop: r(t), bongBong: r(b), chongLen: overlap, tranKhung: b.left < 0 || b.right > window.innerWidth || b.top < 0 || b.bottom > window.innerHeight };
        }, s);
        if (s < 3) await page.getByRole('button', { name: 'Tiếp', exact: true }).click();
      }
      await page.getByRole('button', { name: 'Bỏ qua' }).click();
      await expect(page.getByTestId('guide')).toHaveCount(0);
      if (w !== 320) {
        if (w < 768) await openMenu(page);
        await page.getByTestId('language-button').click();
        const dlg = page.getByRole('dialog');
        await expect(dlg).toBeVisible();
        await page.waitForTimeout(500);
        await shot(page, 'C6-AC01', `${w}-${theme}-sheet-doi-ngon-ngu`);
        out[`sheet-${w}`] = await dlg.evaluate((e) => {
          const b = e.getBoundingClientRect();
          const scrim = document.querySelector('[data-testid="sheet-scrim"]')!;
          const handle = e.querySelector('[aria-hidden="true"].cursor-grab');
          return {
            sheet: { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) },
            viewport: { w: window.innerWidth, h: window.innerHeight },
            caoToiDa90: b.height <= window.innerHeight * 0.9 + 1,
            satDay: Math.round(window.innerHeight - b.bottom),
            tayNam: handle ? getComputedStyle(handle).display !== 'none' : false,
            nenLop: getComputedStyle(scrim).backgroundColor,
            bongDo: getComputedStyle(e).boxShadow !== 'none',
          };
        });
        await page.keyboard.press('Escape');
        await expect(dlg).toHaveCount(0);
      }
    }
    note('S9-AC02', `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => !k.startsWith('sheet'))));
    note('C6-AC01', `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith('sheet'))));
  });
}

// ---------- C2 dải 8 ô phóng to ----------

test.describe('phóng to', () => {
  test.use({ deviceScaleFactor: 6 });
  for (const theme of THEMES) {
    test(`dải 8 ô ${theme}`, async ({ page }) => {
      await page.clock.setFixedTime(NOW);
      const now = NOW.getTime();
      const items = {
        1: { status: 'da-hoc', streak: 1, due: now + 3 * DAY, lastAt: now },
        2: { status: 'da-hoc', streak: 0, due: now - DAY, lastAt: now - DAY },
      };
      await seed(page, base(theme, { 'vitasr2.progress.global.en': { schema: 1, sessions: [], attempts: [], items } }));
      await view(page, 375);
      await go(page, '/hoc');
      const strip = '[data-testid="sentence-card"] ol';
      await expect(page.locator(strip)).toBeVisible();
      await shot(page, 'C2-AC02', `${theme}-dai-8-o`, { el: strip, quality: 90 });
      await page.locator(strip).evaluate((e) => ((e as HTMLElement).style.filter = 'grayscale(1)'));
      await shot(page, 'C2-AC02', `${theme}-dai-8-o-thang-xam`, { el: strip, quality: 90 });
      note(
        'C2-AC02',
        `o-${theme}`,
        await page.locator(`${strip} li`).evaluateAll((els) =>
          els.map((e) => {
            const s = getComputedStyle(e);
            const after = getComputedStyle(e, '::after');
            return { state: e.getAttribute('data-state'), label: e.getAttribute('aria-label'), nen: s.backgroundColor, vien: s.borderColor, vachCheo: after.content !== 'none' ? { mau: after.backgroundColor, xoay: after.transform } : null, w: e.getBoundingClientRect().width };
          }),
        ),
      );
    });
  }
});

// ---------- T2 Luyện tập ----------

for (const theme of THEMES) {
  test(`T2 ${theme}`, async ({ page }) => {
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
    const out: Record<string, unknown> = {};
    for (const w of [375, 1280]) {
      await view(page, w);
      await go(page, '/luyen-tap');
      await expect(page.getByRole('heading', { level: 1, name: 'Luyện tập' })).toBeVisible();
      await shot(page, 'T2-AC01', `${w}-${theme}`);
      out[w] = {
        ...(await layout(page)),
        muc: await page.locator('main ul > li').evaluateAll((els) =>
          els.map((li) => {
            const el = (li.firstElementChild as HTMLElement) ?? li;
            const s = getComputedStyle(el);
            return { text: (el.textContent || '').trim().slice(0, 60), vien: `${s.borderTopWidth} ${s.borderTopStyle}`, boGoc: s.borderRadius, icon: !!el.querySelector('svg') };
          }),
        ),
      };
    }
    note('T2-AC01', `do-dac-${theme}`, out);
  });

  test(`T2 sheet từ khóa ${theme}`, async ({ page }) => {
    await tools(page);
    await seed(page, base(theme));
    // 375 x 667: màn thấp để nội dung sheet dài hơn khung và phải cuộn trong sheet (C6-04).
    for (const [w, h] of [
      [375, 812],
      [375, 667],
    ]) {
      await view(page, w, h);
      await go(page, '/luyen-tap');
      await page.getByRole('button', { name: /Học theo từ khóa/ }).click();
      await page.getByRole('searchbox', { name: 'Từ khóa' }).fill('bus');
      await expect(page.getByText('Tìm thấy 40 câu')).toBeVisible();
      await page.waitForTimeout(400);
      await shot(page, 'T2-AC06', `${w}x${h}-${theme}-40-ket-qua`);
      await page.getByRole('searchbox', { name: 'Từ khóa' }).fill('xyzxyz');
      await expect(page.getByText(/Không có câu nào chứa/)).toBeVisible();
      // Sheet giữ vị trí cuộn của lần xem trước: cuộn nội dung sheet về đầu rồi mới chụp.
      await page.getByRole('dialog').locator('div.overflow-y-auto').first().evaluate((el) => el.scrollTo(0, 0));
      await page.waitForTimeout(300);
      await shot(page, 'T2-AC06', `${w}x${h}-${theme}-0-ket-qua`);
    }
  });

  // C6-AC05: sheet Đổi ngôn ngữ (16 dòng) ở 375 x 667, nội dung dài hơn khung nên phải cuộn trong sheet.
  test(`C6 cuộn trong sheet Đổi ngôn ngữ ${theme}`, async ({ page }) => {
    await seed(page, base(theme));
    const [w, h] = [375, 667];
    await view(page, w, h);
    await go(page, '/hoc');
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    await openMenu(page);
    await page.getByTestId('language-button').click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Tiếng Nhật/ })).toBeVisible();
    await page.waitForTimeout(400);
    const body = dialog.locator('div.overflow-y-auto').first();
    const read = () =>
      page.evaluate(() => {
        const d = document.querySelector('[role="dialog"]')!;
        const b = d.querySelector('div.overflow-y-auto')!;
        return {
          scrollHeight: b.scrollHeight,
          clientHeight: b.clientHeight,
          scrollTop: Math.round(b.scrollTop),
          tieuDeTop: Math.round(d.querySelector('h2')!.getBoundingClientRect().top),
          soDong: d.querySelectorAll('div.overflow-y-auto button').length,
          windowScrollY: window.scrollY,
          viewport: window.innerHeight,
          bodyOverflow: getComputedStyle(document.body).overflow,
          htmlOverflow: getComputedStyle(document.documentElement).overflow,
        };
      });
    const before = await read();
    await shot(page, 'C6-AC05', `${w}x${h}-${theme}-truoc-khi-cuon`);
    // Cuộn bằng con lăn trên nội dung sheet tới dòng cuối; trang phía sau không được cuộn theo.
    const bb = await body.boundingBox();
    await page.mouse.move(bb!.x + bb!.width / 2, bb!.y + bb!.height / 2);
    for (let i = 0; i < 12; i++) await page.mouse.wheel(0, 400);
    await body.evaluate((el) => el.scrollTo(0, el.scrollHeight));
    await page.waitForTimeout(400);
    const after = await read();
    await shot(page, 'C6-AC05', `${w}x${h}-${theme}-cuon-den-cuoi`);
    note('C6-AC05', `${w}x${h}-${theme}`, { truoc: before, sau: after, dongCuoiHien: await dialog.locator('div.overflow-y-auto button').last().isVisible() });
  });
}

// ---------- T3 Thư viện, S10 Chi tiết Unit ----------

for (const theme of THEMES) {
  test(`T3 cách xem Câu ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, base(theme, { 'vitasr2.progress.global.en': globalProgress(3012) }));
    const out: Record<string, unknown> = {};
    for (const w of [320, 375, 1024, 1280]) {
      await view(page, w);
      if (w !== 1024) {
        // Unit 377 có câu tiếng Anh dài nhất bộ (id 3010) và đủ 3 trạng thái.
        await go(page, '/thu-vien?xem=cau&unit=377');
        await expect(page.locator('main button[data-id]').first()).toBeVisible();
        await shot(page, 'T3-AC02', `${w}-${theme}-cau-dai`, { full: true });
        out[`cau-dai-${w}`] = {
          cuonNgang: await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth),
          dong: await page.locator('main button[data-id]').evaluateAll((els) =>
            els.slice(0, 3).map((b) => {
              const src = b.querySelector('.src') as HTMLElement;
              const vi = b.querySelector('.vi') as HTMLElement;
              const lh = parseFloat(getComputedStyle(src).lineHeight);
              return { id: b.getAttribute('data-id'), soDongCauGoc: Math.round(src.getBoundingClientRect().height / lh), catCauGoc: src.scrollHeight > src.clientHeight + 1, catNghia: vi.scrollWidth > vi.clientWidth };
            }),
          ),
        };
        if (w === 375) {
          await page.locator('main').evaluate((e) => ((e as HTMLElement).style.filter = 'grayscale(1)'));
          await shot(page, 'T3-AC02', `${w}-${theme}-cau-dai-thang-xam`, { full: true });
        }
      }
      await go(page, '/thu-vien?xem=cau');
      await expect(page.locator('main button[data-id]').first()).toBeVisible();
      if (w < 1200) {
        await shot(page, 'T3-AC02', `${w}-${theme}-trang-1`);
        await page.locator('main button[data-id]').nth(2).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.waitForTimeout(400);
        await shot(page, w === 1024 ? 'T3-AC08' : 'T3-AC02', `${w}-${theme}-sheet-chi-tiet`);
        if (w === 1024) out['1024'] = { ...(await layout(page)), coSheet: true, cotPhai: await page.locator('aside[aria-label="Chi tiết câu"]').count() };
      } else {
        const detail = page.locator('aside[aria-label="Chi tiết câu"]');
        await expect(detail).toBeVisible();
        await shot(page, 'T3-AC08', `${w}-${theme}-cau-dau`);
        const m = async () =>
          page.evaluate(() => {
            const list = document.querySelector('main button[data-id]')!.closest('ul')!.getBoundingClientRect();
            const aside = document.querySelector('aside[aria-label="Chi tiết câu"]')!;
            return { rongDanhSach: Math.round(list.width), cotPhai: Math.round(aside.getBoundingClientRect().left), tieuDeChiTiet: aside.querySelector('h2')?.textContent, soHopThoai: document.querySelectorAll('[role="dialog"]').length };
          });
        const truoc = await m();
        await page.locator('main button[data-id]').nth(4).click();
        await page.waitForTimeout(300);
        await shot(page, 'T3-AC08', `${w}-${theme}-cau-thu-5`);
        out[`${w}`] = { truoc, sauKhiCham: await m() };
      }
    }
    note('T3-AC02', `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith('cau-dai'))));
    note('T3-AC08', `do-dac-${theme}`, { '1024': out['1024'], '1280': out['1280'] });
  });

  test(`T3 cách xem Unit và S10 ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, base(theme, { 'vitasr2.progress.global.en': unitProgress() }));
    const out: Record<string, unknown> = {};
    for (const w of [375, 1280, 1440]) {
      await view(page, w);
      await go(page, '/thu-vien');
      await expect(page.getByTestId('unit-card').first()).toBeVisible();
      await shot(page, 'T3-AC14', `${w}-${theme}`);
      out[`T3-${w}`] = {
        ...(await layout(page)),
        ...(await page.evaluate(() => {
          const cards = [...document.querySelectorAll('[data-testid="unit-card"]')];
          const s = getComputedStyle(cards[0]);
          return { soCot: new Set(cards.map((c) => Math.round(c.getBoundingClientRect().left))).size, vienThe: `${s.borderTopWidth} ${s.borderTopStyle}`, nenThe: s.backgroundColor, soDong: cards.length };
        })),
      };
      if (w === 1440) continue;
      await go(page, '/thu-vien/unit?so=4');
      await expect(page.getByRole('button', { name: /unit này$/ }).first()).toBeVisible();
      await shot(page, 'S10-AC08', `${w}-${theme}`, { full: true });
      await shot(page, 'APP-AC24', `${w}-${theme}`);
      const s10 = await page.evaluate(() => ({
        duongDan: document.querySelector('nav[aria-label="Đường dẫn"]')?.textContent,
        mucThuVienDangChon: document.querySelector('#app-sidebar a[aria-current="page"]')?.textContent,
        h1: getComputedStyle(document.querySelector('main h1')!).fontSize,
        h2: [...document.querySelectorAll('main h2')].map((h) => `${(h.textContent || '').trim().slice(0, 30)}: ${getComputedStyle(h).fontSize}`),
      }));
      out[`S10-${w}`] = { ...(await layout(page)), ...s10 };
      if (w < 768) {
        await openMenu(page);
        await shot(page, 'APP-AC24', `${w}-${theme}-menu-mo`);
      }
    }
    note('T3-AC14', `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith('T3'))));
    note('S10-AC08', `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith('S10'))));
    note('APP-AC24', `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith('S10'))));
  });
}

// ---------- T4 Tiến độ ----------

for (const theme of THEMES) {
  test(`T4 ${theme}`, async ({ page }) => {
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
    const out: Record<string, unknown> = {};
    for (const w of [320, 1280]) {
      await view(page, w);
      for (const k of ['7', '30']) {
        await go(page, `/tien-do?khoang=${k}`);
        await expect(page.getByTestId('t4-chart')).toBeVisible();
        await shot(page, 'T4-AC05', `${w}-${theme}-${k}-ngay`, { el: 'section[aria-labelledby="t4-chart"]' });
        if (k === '7') await shot(page, 'T4-AC05', `${w}-${theme}-toan-man`, { full: true });
        out[`${w}-${k}`] = await page.evaluate(() => {
          const cols = [...document.querySelectorAll('[data-testid="t4-col"]')];
          const labels = cols.map((c) => c.querySelector('span[aria-hidden="true"].num')!).filter((l) => (l.textContent || '').trim());
          let chong = false;
          for (let i = 1; i < labels.length; i++) {
            const a = labels[i - 1].getBoundingClientRect();
            const b = labels[i].getBoundingClientRect();
            const ra = a.left + ((a.width - (labels[i - 1] as HTMLElement).scrollWidth) / 2) + (labels[i - 1] as HTMLElement).scrollWidth;
            const lb = b.left + (b.width - (labels[i] as HTMLElement).scrollWidth) / 2;
            if (lb < ra) chong = true;
          }
          const bars = [...document.querySelectorAll('[data-testid="t4-col"] button')].map((b) => {
            const bar = b.querySelector('span')!;
            return { nhan: b.getAttribute('aria-label'), homNay: b.hasAttribute('data-today'), cao: Math.round(bar.getBoundingClientRect().height), mau: getComputedStyle(bar).backgroundColor };
          });
          return { soCot: cols.length, nhanChongNhau: chong, cot: bars, primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(), cuonNgang: document.documentElement.scrollWidth > document.documentElement.clientWidth };
        });
      }
    }
    await view(page, 1280);
    await go(page, '/tien-do');
    await page.getByRole('button', { name: /^Thứ Năm, 8\/10/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.waitForTimeout(400);
    await shot(page, 'T4-AC05', `1280-${theme}-sheet-ngay`);
    note('T4-AC05', `do-dac-${theme}`, out);
  });
}

// ---------- S5 Kiểm tra nhanh, C4 lựa chọn ----------

const wrongChoice = (page: Page) => page.locator('button[data-correct="true"]').locator('xpath=ancestor::ul[1]//button[not(@data-correct)]').first();

for (const theme of THEMES) {
  test(`S5 ${theme}`, async ({ page }) => {
    test.setTimeout(300000);
    await tools(page);
    await seed(page, base(theme));
    const out: Record<string, unknown> = {};
    for (const w of [320, 375, 1280]) {
      await view(page, w);
      // Unit 377 có câu dài nhất bộ: kiểm cách xuống dòng của các cụm và nghĩa dài trong lựa chọn.
      await go(page, '/kiem-tra?unit=377');
      await expect(page.getByRole('button', { name: 'Làm cả 3 bước' })).toBeVisible();
      await shot(page, 'S5-AC09', `${w}-${theme}-1-bat-dau`, { full: true });
      await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
      // S5-03: lựa chọn chỉ hiện sau khi biết thiết bị có giọng hay không (tối đa 1,5 giây).
      await expect(page.locator('button[data-correct="true"]')).toBeVisible();
      await shot(page, 'S5-AC09', `${w}-${theme}-2-nghe-chon`, { full: true });
      await wrongChoice(page).click();
      await page.locator('button[data-correct="true"]').click();
      if (w === 1280) {
        await shot(page, 'S5-AC09', `${w}-${theme}-3-nghe-chon-sai-roi-dung`, { full: true });
        await shot(page, 'FND-AC03', `1280-${theme}-S5-sai-roi-dung`, { full: true });
        note(
          'FND-AC03',
          `S5-sai-${theme}`,
          await page.locator('button[data-state="wrong"]').evaluate((e) => {
            const s = getComputedStyle(e);
            const nutChinh = document.querySelector('main button.bg-primary');
            return { vien: s.borderColor, nen: s.backgroundColor, chu: (e.textContent || '').trim(), nutChinh: nutChinh ? getComputedStyle(nutChinh).backgroundColor : null };
          }),
        );
      }
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      // Câu thứ 2 (id 3010): nghĩa dài.
      await expect(page.getByText('Câu 2/8')).toBeVisible();
      if (w === 320) await shot(page, 'C4-AC01', `320-${theme}-nghia-dai`, { full: true });
      if (w === 1280) await shot(page, 'C4-AC01', `1280-${theme}-co-so-thu-tu`);
      out[`lua-chon-${w}`] = await page.locator('button[data-correct]').locator('xpath=ancestor::ul[1]/li/button').evaluateAll((els) =>
        els.map((b) => {
          const num = b.querySelector('.num') as HTMLElement | null;
          const vi = b.querySelector('.vi') as HTMLElement;
          return { soThuTuHien: num ? getComputedStyle(num).display !== 'none' : false, soKyTu: (vi.textContent || '').length, biCat: vi.scrollWidth > vi.clientWidth || vi.scrollHeight > vi.clientHeight + 1 };
        }),
      );
      for (let i = 1; i < 8; i++) {
        await page.locator('button[data-correct="true"]').click();
        await page.getByRole('button', { name: 'Câu tiếp' }).click();
      }
      await expect(page.getByTestId('s5-step-name')).toHaveText('Nghe theo cụm');
      await page.locator('main button[data-state="covered"]').first().click();
      if (w === 375) await shot(page, 'S5-AC06', `375-${theme}-buoc-2`, { full: true });
      else await shot(page, 'S5-AC09', `${w}-${theme}-4-nghe-cum`, { full: true });
      const openAll = async () => {
        while (await page.locator('main button[data-state="covered"]').count()) await page.locator('main button[data-state="covered"]').first().click();
      };
      await openAll();
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      await openAll();
      await shot(page, 'S5-AC09', `${w}-${theme}-5-nghe-cum-cau-dai`, { full: true });
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      for (let i = 2; i < 8; i++) {
        await openAll();
        await page.getByRole('button', { name: 'Câu tiếp' }).click();
      }
      await expect(page.getByTestId('s5-step-name')).toHaveText('Sắp xếp câu');
      // Xếp sai câu đầu: xếp theo thứ tự đang xáo.
      for (let n = await page.locator('[data-testid="s5-pool"] button').count(); n > 0; n--) await page.locator('[data-testid="s5-pool"] button').first().click();
      await page.getByRole('button', { name: 'Kiểm tra' }).click();
      await shot(page, 'S5-AC09', `${w}-${theme}-6-sap-xep-sai`, { full: true });
      if (w === 375) await shot(page, 'S5-AC06', `375-${theme}-buoc-3`, { full: true });
      if (w === 1280) await shot(page, 'FND-AC03', `1280-${theme}-S5-sap-xep-sai`, { full: true });
      await page.getByRole('button', { name: 'Thoát' }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.waitForTimeout(300);
      if (w === 375) await shot(page, 'S5-AC09', `${w}-${theme}-7-sheet-thoat`);
      await page.getByRole('dialog').getByRole('button', { name: 'Tạm dừng' }).click();
      await go(page, '/kiem-tra?unit=377');
      await page.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }).click();
      for (let i = 0; i < 8; i++) {
        await expect(page.locator('button[data-correct="true"]')).toBeVisible();
        if (i === 2) await wrongChoice(page).click();
        await page.locator('button[data-correct="true"]').click();
        await page.getByRole('button', { name: /^(Câu tiếp|Xem kết quả)$/ }).click();
      }
      await expect(page.getByText('Xong kiểm tra')).toBeVisible();
      await shot(page, 'S5-AC09', `${w}-${theme}-8-ket-qua`, { full: true });
      out[`ket-qua-${w}`] = await layout(page);
    }
    note('S5-AC09', `do-dac-${theme}`, out);
    note('C4-AC01', `do-dac-${theme}`, { '320': out['lua-chon-320'], '1280': out['lua-chon-1280'] });
  });

  test(`S5 tạm dừng và câu cần xem lại ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await page.clock.setFixedTime(NOW);
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': fluency() });
    for (const w of [375, 1280]) {
      await view(page, w);
      await go(page, '/luyen-tap');
      await put(page, { 'vitasr2.progress.fluency.en': null }, '/kiem-tra?unit=2');
      await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
      await page.locator('button[data-correct="true"]').click();
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      await page.getByRole('button', { name: 'Thoát' }).click();
      await expect(page.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).toBeVisible();
      await page.waitForTimeout(300);
      await shot(page, 'S5-AC15', `${w}-${theme}-1-sheet-tam-dung`);
      await page.getByRole('dialog').getByRole('button', { name: 'Tạm dừng' }).click();
      await expect(page.getByText(/^Đang làm dở:/)).toBeVisible();
      await shot(page, 'S5-AC15', `${w}-${theme}-2-T2-dong-lam-do`);
      await go(page, '/kiem-tra?unit=2');
      await expect(page.getByRole('button', { name: 'Làm tiếp' })).toBeVisible();
      await shot(page, 'S5-AC15', `${w}-${theme}-3-man-bat-dau-lam-tiep`);
      await page.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }).click();
      for (let i = 0; i < 8; i++) {
        await expect(page.locator('button[data-correct="true"]')).toBeVisible();
        if (i === 1 || i === 4) await wrongChoice(page).click();
        await page.locator('button[data-correct="true"]').click();
        await page.getByRole('button', { name: /^(Câu tiếp|Xem kết quả)$/ }).click();
      }
      await expect(page.getByRole('heading', { name: 'Câu cần xem lại' })).toBeVisible();
      await shot(page, 'S5-AC15', `${w}-${theme}-4-cau-can-xem-lai`, { full: true });
    }
  });
}

// ---------- S8 Cài đặt, C8 ô chọn ----------

async function fakeVoices(page: Page) {
  // Danh sách giọng giống Chrome trên Windows, để thấy "Tự động" chọn giọng Google (S8-02).
  await page.addInitScript(() => {
    const mk = (name: string, lang: string, localService: boolean, isDefault = false) => ({ name, lang, voiceURI: name, localService, default: isDefault });
    const list = [
      mk('Microsoft David - English (United States)', 'en-US', true, true),
      mk('Microsoft Hazel - English (United Kingdom)', 'en-GB', true),
      mk('Google US English', 'en-US', false),
      mk('Google UK English Female', 'en-GB', false),
      mk('Google UK English Male', 'en-GB', false),
      mk('Microsoft An - Vietnamese (Vietnam)', 'vi-VN', true),
    ];
    Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => list });
  });
}

for (const theme of THEMES) {
  test(`S8 ${theme}`, async ({ page }) => {
    await tools(page);
    await fakeVoices(page);
    await seed(page, base(theme));
    const out: Record<string, unknown> = {};
    for (const w of [375, 1280]) {
      await view(page, w);
      await go(page, '/cai-dat');
      await expect(page.getByRole('heading', { level: 1, name: 'Cài đặt' })).toBeVisible();
      await shot(page, 'S8-AC09', `${w}-${theme}-cai-dat`, { full: true });
      out[w] = {
        ...(await layout(page)),
        nhom: await page.locator('main section').evaluateAll((els) =>
          els.map((s) => {
            const st = getComputedStyle(s.querySelector('h2 + *') ?? s);
            return { tieuDe: s.querySelector('h2')?.textContent, muc: [...s.querySelectorAll('h2 ~ * li, h2 ~ * > div')].length, vienPanel: `${st.borderTopWidth} ${st.borderTopStyle}`, nenPanel: st.backgroundColor };
          }),
        ),
      };
      await page.getByTestId('s8-voice-row').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.waitForTimeout(400);
      await shot(page, 'S8-AC09', `${w}-${theme}-sheet-giong-doc`);
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.getByRole('button', { name: /^Xóa tiến độ/ }).click();
      await page.getByRole('textbox', { name: 'Tên ngôn ngữ' }).fill('Tiếng Anh');
      await page.waitForTimeout(300);
      await shot(page, 'S8-AC09', `${w}-${theme}-sheet-xoa`);
      await page.keyboard.press('Escape');
      // C8: ô chọn ngôn ngữ giao diện đang mở.
      await page.locator('#s8-locale').click();
      await expect(page.getByRole('listbox')).toBeVisible();
      await page.waitForTimeout(200);
      const c8 = await page.evaluate(() => {
        const trig = document.getElementById('s8-locale')!;
        const list = document.querySelector('[role="listbox"]')!;
        const sel = list.querySelector('[aria-selected="true"]');
        const ts = getComputedStyle(trig);
        return {
          nutBoGoc: ts.borderRadius,
          nutVien: ts.borderTopColor,
          primary: getComputedStyle(document.documentElement).getPropertyValue('--primary').trim(),
          danhSachBoGoc: getComputedStyle(list.parentElement!).borderRadius,
          danhSachBongDo: getComputedStyle(list.parentElement!).boxShadow !== 'none',
          luaChonDangChon: sel?.textContent,
          coDauTich: !!sel?.querySelector('svg'),
        };
      });
      const r = await page.evaluate(() => {
        const a = document.getElementById('s8-locale')!.getBoundingClientRect();
        const b = document.querySelector('[role="listbox"]')!.parentElement!.getBoundingClientRect();
        const x = Math.max(0, Math.min(a.left, b.left) - 16);
        const y = Math.max(0, Math.min(a.top, b.top) - 16);
        return { x, y, width: Math.min(window.innerWidth - x, Math.max(a.right, b.right) - x + 16), height: Math.max(a.bottom, b.bottom) - y + 16 };
      });
      await shot(page, 'C8-AC03', `${w}-${theme}-o-chon-dang-mo`, { clip: r, quality: 88 });
      note('C8-AC03', `${w}-${theme}`, c8);
      await page.keyboard.press('Escape');
    }
    note('S8-AC09', `do-dac-${theme}`, out);
  });
}

// ---------- Bố cục theo khổ màn hình (APP-07) ----------

for (const theme of THEMES) {
  test(`bố cục theo khổ ${theme}`, async ({ page }) => {
    test.setTimeout(300000);
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
    const routes: [string, string][] = [
      ['T1', '/hoc'],
      ['T2', '/luyen-tap'],
      ['T3', '/thu-vien'],
      ['T4', '/tien-do?khoang=30'],
      ['S8', '/cai-dat'],
      ['S10', '/thu-vien/unit?so=2'],
    ];
    const out: Record<string, unknown> = {};
    const primaries: Record<string, string[]> = {};
    for (const w of [375, 768, 1024, 1280, 1440]) {
      await view(page, w);
      for (const [name, path] of routes) {
        await go(page, path);
        await waitShell(page);
        await expect(page.getByTestId('skeleton')).toHaveCount(0);
        await page.waitForTimeout(200);
        // Cả trang: người duyệt cần thấy cả các khối phía dưới (khối hẹp giữa vùng trắng thường nằm ở đó).
        if (w !== 1024) await shot(page, 'APP-AC26', `${name}-${w}-${theme}`, { full: true, quality: 35 });
        const m = await layout(page);
        const cols = await page.evaluate((n) => {
          const sel: Record<string, string> = { T1: 'main section.grid > *', T2: 'main ul.grid > li', T4: 'main section', S8: 'main section', T3: '[data-testid="unit-card"]', S10: 'main section' };
          const els = [...document.querySelectorAll(sel[n] ?? 'main section')].filter((e) => e.getBoundingClientRect().width > 0);
          return {
            soCot: new Set(els.map((e) => Math.round(e.getBoundingClientRect().left))).size,
            khoi: els.slice(0, 12).map((e) => {
              const b = e.getBoundingClientRect();
              return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), ten: (e.querySelector('h2')?.textContent || e.getAttribute('data-guide') || e.tagName).trim().slice(0, 30) };
            }),
          };
        }, name);
        out[`${name}-${w}`] = { cuonNgang: m.cuonNgang, content: m.content, cot: cols };
        primaries[`${name}-${w}`] = m.nutPrimary as string[];
        if (name === 'T1' && [375, 1024, 1280, 1440].includes(w)) await shot(page, 'T1-AC07', `${w}-${theme}`, { full: true });
        if (name === 'T2' && (w === 375 || w >= 1024)) await shot(page, 'T2-AC08', `${w}-${theme}`, { full: w === 375 });
        if (name === 'T4' && (w === 375 || w >= 1024)) await shot(page, 'T4-AC11', `${w}-${theme}`, { full: true });
        if (name === 'S8' && w >= 768) await shot(page, 'S8-AC14', `${w}-${theme}`, { full: true });
      }
    }
    note('APP-AC26', `do-dac-${theme}`, out);
    note('FND-AC03', `nut-primary-moi-man-${theme}`, primaries);
    for (const [ac, n] of [
      ['T1-AC07', 'T1'],
      ['T2-AC08', 'T2'],
      ['T4-AC11', 'T4'],
      ['S8-AC14', 'S8'],
    ] as const)
      note(ac, `do-dac-${theme}`, Object.fromEntries(Object.entries(out).filter(([k]) => k.startsWith(`${n}-`))));
  });
}

test('APP-AC09 vùng nội dung theo khổ', async ({ page }) => {
  test.setTimeout(180000);
  await tools(page);
  await seed(page, base('light'));
  const out: Record<string, unknown> = {};
  for (const w of [1440, 1280, 768, 375, 320]) {
    await view(page, w);
    for (const [name, path] of [
      ['T1', '/hoc'],
      ['T3', '/thu-vien?xem=cau'],
      ['S3', '/phien-hoc?nguon=lo-trinh'],
    ] as const) {
      await go(page, path);
      await expect(page.getByTestId('sentence-card').or(page.locator('main button[data-id]')).first()).toBeVisible();
      await shot(page, 'APP-AC09', `${name}-${w}`, { full: true, quality: 45 });
      out[`${name}-${w}`] = {
        ...(await layout(page)),
        khoiS3: name === 'S3' ? await page.locator('main div.max-w-2xl').first().evaluate((e) => Math.round(e.getBoundingClientRect().width)) : null,
      };
    }
  }
  note('APP-AC09', 'do-dac', out);
});

// ---------- C5 khung khu học, APP-01, APP-02, APP-12 ----------

for (const theme of THEMES) {
  test(`khung C5 ${theme}`, async ({ page }) => {
    test.setTimeout(180000);
    await tools(page);
    await page.clock.setFixedTime(NOW);
    await seed(page, base(theme, { 'vitasr2.progress.global.en': unitProgress() }));
    const out: Record<string, unknown> = {};
    // 1280: thanh bên cố định.
    await view(page, 1280);
    await go(page, '/hoc');
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    await shot(page, 'C5-AC01', `1280-${theme}`);
    await shot(page, 'APP-AC01', `1280-${theme}`);
    out['1280'] = {
      ...(await layout(page)),
      ...(await page.evaluate(() => {
        const sb = document.getElementById('app-sidebar')!;
        const top = sb.firstElementChild!.getBoundingClientRect();
        const logo = sb.querySelector('svg')!.getBoundingClientRect();
        const labels = [...sb.querySelectorAll('nav p')].map((p) => ({ text: p.textContent, fontSize: getComputedStyle(p).fontSize, transform: getComputedStyle(p).textTransform }));
        const items = [...sb.querySelectorAll('nav a, nav button[data-testid="sign-out"]')].map((a) => ({ text: (a.textContent || '').trim(), h: Math.round(a.getBoundingClientRect().height), current: a.getAttribute('aria-current') }));
        const header = document.querySelector('header')!.getBoundingClientRect();
        return { hangLogo: Math.round(top.height), logoCao: Math.round(logo.height), nhanNhom: labels, muc: items, headerTrai: Math.round(header.left), headerZ: getComputedStyle(document.querySelector('header')!).zIndex, sidebarZ: getComputedStyle(sb).zIndex };
      })),
    };
    for (const [tab, route] of [
      ['T1', '/hoc'],
      ['T2', '/luyen-tap'],
      ['T3', '/thu-vien'],
      ['T4', '/tien-do'],
    ] as const) {
      await go(page, route);
      await waitShell(page);
      await page.waitForTimeout(300);
      await shot(page, 'APP-AC03', `${tab}-1280-${theme}`);
    }
    await shot(page, 'APP-AC19', `1280-${theme}-chan-thanh-ben`, { el: '#app-sidebar' });
    out['chan-1280'] = await page.evaluate(() => {
      const a = document.querySelector('[data-testid="host-link"]')!;
      const sb = document.getElementById('app-sidebar')!;
      return { text: a.textContent, href: a.getAttribute('href'), h: Math.round(a.getBoundingClientRect().height), icon: a.querySelector('svg')?.getAttribute('class'), email: document.querySelector('[data-testid="user-email"]')?.textContent, chanThanhBen: (sb.lastElementChild as HTMLElement).innerText };
    });
    // 375: header và menu trượt.
    await view(page, 375);
    await go(page, '/hoc');
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    await shot(page, 'C5-AC05', `375-${theme}-dong`);
    await shot(page, 'APP-AC01', `375-${theme}-menu-dong`);
    const header375 = await page.evaluate(() => {
      const b = (s: string) => {
        const e = document.querySelector(s);
        if (!e) return null;
        const r = e.getBoundingClientRect();
        return { x: Math.round(r.x), w: Math.round(r.width), h: Math.round(r.height) };
      };
      return { header: b('header'), nutMenu: b('[data-testid="menu-button"]'), logo: b('header a[aria-label]'), chonNgonNgu: b('header [role="combobox"]'), sangToi: b('[data-testid="theme-toggle"]') };
    });
    await openMenu(page);
    await shot(page, 'C5-AC05', `375-${theme}-menu-mo`);
    await shot(page, 'APP-AC01', `375-${theme}-menu-mo`);
    await shot(page, 'APP-AC19', `375-${theme}-chan-thanh-ben`, { el: '#app-sidebar' });
    out['375'] = {
      ...(await layout(page)),
      header: header375,
      lopPhu: await page.getByTestId('menu-overlay').evaluate((e) => ({ nen: getComputedStyle(e).backgroundColor, z: getComputedStyle(e).zIndex })),
      muc: await page.locator('#app-sidebar nav a').evaluateAll((els) => els.map((a) => (a.textContent || '').trim())),
      chan: await page.evaluate(() => Math.round(document.querySelector('[data-testid="host-link"]')!.getBoundingClientRect().height)),
    };
    for (const [tab, route] of [
      ['T1', '/hoc'],
      ['T2', '/luyen-tap'],
      ['T3', '/thu-vien'],
      ['T4', '/tien-do'],
    ] as const) {
      await go(page, route);
      await waitShell(page);
      await page.waitForTimeout(300);
      await shot(page, 'APP-AC03', `${tab}-375-${theme}`);
      if (tab === 'T1') {
        await openMenu(page);
        await shot(page, 'APP-AC03', `${tab}-375-${theme}-menu-mo`);
      }
    }
    note('C5-AC01', `do-dac-${theme}`, out['1280']);
    note('C5-AC05', `do-dac-${theme}`, out['375']);
    note('APP-AC19', `do-dac-${theme}`, { '1280': out['chan-1280'], '375': (out['375'] as Record<string, unknown>).chan });
    note('APP-AC03', `do-dac-${theme}`, { '1280': { header: (out['1280'] as Record<string, unknown>).header, muc: (out['1280'] as Record<string, unknown>).muc }, '375': header375 });
  });
}

// ---------- APP-AC07 mạng chậm: khung xương ----------

/** Slow 3G (thông số DevTools): trễ 400 ms, khoảng 400 kbit/s mỗi chiều, áp cho mọi request của trang. */
const SLOW_3G = { offline: false, latency: 400, downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8 };
const NO_THROTTLE = { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 };

test('APP-AC07 mạng chậm (Slow 3G): khung xương', async ({ page }) => {
  test.setTimeout(600000);
  await seed(page, base('light'));
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  // Số đo tại thời điểm chụp: có vòng xoay không, khung xương gồm những khối nào, có khung khu học (thanh trên, thanh bên) chưa.
  const measure = () =>
    page.evaluate(() => {
      const r = (e: Element | null) => {
        if (!e) return null;
        const b = e.getBoundingClientRect();
        return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
      };
      const fixedTop = [...document.querySelectorAll('header, div.fixed')].find((e) => {
        const b = e.getBoundingClientRect();
        return b.top === 0 && Math.round(b.height) === 56;
      });
      const side = [...document.querySelectorAll('#app-sidebar, div.fixed')].find((e) => {
        const b = e.getBoundingClientRect();
        return b.left === 0 && Math.round(b.width) === 240 && b.height > 200;
      });
      return {
        daChayJs: !!document.getElementById('app-sidebar'),
        coVongXoay: !!document.querySelector('.animate-spin'),
        soKhungXuong: document.querySelectorAll('[data-testid="skeleton"]').length,
        khoiKhungXuong: [...document.querySelectorAll('[data-testid="skeleton"] .skeleton')].map(r),
        thanhTren: r(fixedTop ?? null),
        thanhBen: r(side ?? null),
        noiDung: !!document.querySelector('[data-testid="sentence-card"], [data-testid="unit-card"]'),
        manTrang: document.body.innerText.trim().length === 0 && document.querySelectorAll('[data-testid="skeleton"]').length === 0,
      };
    });
  const out: Record<string, unknown> = {};
  for (const w of [375, 1280]) {
    await view(page, w, 800);
    for (const [name, path] of [
      ['T1', '/hoc'],
      ['T3', '/thu-vien'],
    ] as const) {
      await cdp.send('Network.emulateNetworkConditions', NO_THROTTLE);
      await page.goto('about:blank');
      await cdp.send('Network.emulateNetworkConditions', SLOW_3G);
      const t0 = Date.now();
      await page.goto(path, { waitUntil: 'commit', timeout: 120000 });
      // 1. Lần vẽ đầu: HTML từ máy chủ đã có CSS, JS chưa chạy xong (đang đọc phiên đăng nhập).
      await page.waitForFunction(
        () => {
          const s = document.querySelector('[data-testid="skeleton"]');
          return !!s && s.getBoundingClientRect().height > 0 && getComputedStyle(document.body).backgroundColor !== 'rgba(0, 0, 0, 0)';
        },
        null,
        { timeout: 180000, polling: 100 },
      );
      await shot(page, 'APP-AC07', `${w}-khoi-dong-${name}`);
      out[`${name}-${w}-khoi-dong`] = { ...(await measure()), msTuLucMo: Date.now() - t0 };
      // 2. Đã vào khu học (khung C5 do JS dựng), dữ liệu câu còn đang tải.
      await page.waitForFunction(() => !!document.getElementById('app-sidebar') && !!document.querySelector('main [data-testid="skeleton"]'), null, { timeout: 300000, polling: 100 });
      await shot(page, 'APP-AC07', `${w}-dang-tai-${name}`);
      out[`${name}-${w}-dang-tai`] = { ...(await measure()), msTuLucMo: Date.now() - t0 };
    }
  }
  await cdp.send('Network.emulateNetworkConditions', NO_THROTTLE);
  note('APP-AC07', 'do-dac', { mang: 'Slow 3G: trễ 400 ms, 400 kbit/s mỗi chiều (Network.emulateNetworkConditions), áp cho mọi request', ...out });
});

// ---------- FND-AC05 chữ ----------

test('FND-AC05 dấu tiếng Việt khó và thang chữ', async ({ page }) => {
  await page.route('**/data/fluency/en.json', async (route) => {
    const res = await route.fetch();
    const json = await res.json();
    json.items[0].vi = 'Tôi muốn đặt một bàn cho hai người, được không ạ?';
    await route.fulfill({ response: res, json });
  });
  await seed(page, { 'vitasr2.theme': 'light', 'vitasr2.settings': fluency() });
  for (const w of [375, 1280]) {
    await view(page, w, 800);
    await go(page, '/hoc');
    await expect(page.getByText('Tôi muốn đặt một bàn cho hai người, được không ạ?').first()).toBeVisible();
    await shot(page, 'FND-AC05', `${w}-the-cau-dau-kho`, { el: '[data-testid="sentence-card"]', quality: 88 });
    await page.evaluate(() => {
      const box = document.createElement('div');
      box.id = 'thang-chu';
      // Khối đặt tuyệt đối, cao theo nội dung (không cắt theo khung nhìn), để ảnh ở 375 px có đủ cả thang tới text-display-lg.
      box.style.cssText = 'position:absolute;top:0;left:0;right:0;z-index:99;background:var(--background);color:var(--foreground);padding:16px';
      window.scrollTo(0, 0);
      for (const t of ['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-display-lg']) {
        for (const font of ['vi', 'src']) {
          const p = document.createElement('p');
          p.className = `${font} ${t}`;
          p.lang = font === 'vi' ? 'vi' : 'en';
          p.textContent = `${t} ${font === 'vi' ? '(nghĩa)' : '(giao diện)'}: Tôi muốn đặt một bàn cho hai người, được không ạ? Ỷ ỹ Ữ ữ Ặ ặ`;
          box.appendChild(p);
        }
      }
      document.body.appendChild(box);
    });
    await shot(page, 'FND-AC05', `${w}-thang-chu`, { el: '#thang-chu', quality: 88 });
    note(
      'FND-AC05',
      `${w}-thang-chu`,
      await page.locator('#thang-chu p').evaluateAll((els) => els.map((p) => ({ lop: p.className, font: getComputedStyle(p).fontFamily, size: getComputedStyle(p).fontSize, lineHeight: getComputedStyle(p).lineHeight }))),
    );
  }
});

test('FND-AC05 tiếng Nhật, Nga, Tamil: font Noto đúng hệ chữ', async ({ page }) => {
  const fonts: string[] = [];
  page.on('request', (r) => {
    if (/\.woff2?$/.test(r.url())) fonts.push(new URL(r.url()).pathname);
  });
  await seed(page, { 'vitasr2.theme': 'light', 'vitasr2.settings': fluency() });
  await view(page, 375);
  await go(page, '/hoc');
  const result: Record<string, unknown> = {};
  for (const lang of ['en', 'ja', 'ru', 'ta']) {
    fonts.length = 0;
    await put(page, { 'vitasr2.settings': settings({ lang, packByLang: { [lang]: 'fluency' } }) }, '/hoc');
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    await page.waitForTimeout(1200);
    await shot(page, 'FND-AC05', `375-the-cau-${lang}`, { el: '[data-testid="sentence-card"]', quality: 88 });
    result[lang] = {
      fontDaTai: [...new Set(fonts.map((f) => f.split('/').slice(-2).join('/')))].sort().slice(0, 12),
      ...(await page.getByTestId('source-text').evaluate(async (e) => {
        await document.fonts.ready;
        const fam = getComputedStyle(e).fontFamily;
        const loaded = [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, ''));
        return { fontFamily: fam, fontDaNap: [...new Set(loaded)].sort(), lang: e.getAttribute('lang') };
      })),
    };
  }
  note('FND-AC05', 'font-theo-he-chu', result);
});

// ---------- FND-AC16 chỉ dùng bàn phím ----------

test('FND-AC16 chỉ dùng bàn phím: T1 → S3 → tổng kết → T4', async ({ page }) => {
  test.setTimeout(180000);
  await seed(page, base('light'));
  await view(page, 1280, 800);
  await go(page, '/hoc');
  await expect(page.getByTestId('sentence-card')).toBeVisible();
  const focusTo = async (name: RegExp | string, max = 60) => {
    for (let i = 0; i < max; i++) {
      await page.keyboard.press('Tab');
      const label = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        return el ? (el.getAttribute('aria-label') || el.textContent || '').trim() : '';
      });
      if (typeof name === 'string' ? label === name : name.test(label)) return;
    }
    throw new Error(`Không tab tới được ${name}`);
  };
  const ring = () =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const s = getComputedStyle(el);
      return { phanTu: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), outline: `${s.outlineWidth} ${s.outlineStyle} ${s.outlineColor}`, offset: s.outlineOffset, focusVisible: el.matches(':focus-visible') };
    });
  const log: Record<string, unknown> = {};
  await focusTo(/^Chuyển sang giao diện/);
  await shot(page, 'FND-AC16', '00-T1-focus-nut-sang-toi');
  log['00'] = await ring();
  await focusTo('Thư viện');
  await shot(page, 'FND-AC16', '01-T1-focus-thanh-ben');
  log['01'] = await ring();
  await focusTo('Trang học chính');
  await shot(page, 'FND-AC16', '02-T1-focus-trang-hoc-chinh');
  log['02'] = await ring();
  await focusTo(/^Học \d câu$/);
  await shot(page, 'FND-AC16', '03-T1-focus-nut-chinh');
  log['03'] = await ring();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Câu 1/8')).toBeVisible();
  // Thẻ đang che tự nhận focus (S3-09); chờ focus tới thẻ rồi mới nhấn phím.
  const cardFocused = () => page.waitForFunction(() => document.activeElement?.getAttribute('data-testid') === 'sentence-card');
  await cardFocused();
  await page.waitForTimeout(300);
  await shot(page, 'FND-AC16', '04-S3a-focus-the-cau');
  log['04'] = await ring();
  for (let i = 0; i < 8; i++) {
    await cardFocused();
    await page.keyboard.press(' ');
    if (i === 0) await shot(page, 'FND-AC16', '05-S3a-sau-khi-hien');
    await page.keyboard.press('2');
    await expect(page.getByText('Câu này nghĩa là gì?')).toBeVisible();
    const right = await page.locator('button[data-correct]').locator('xpath=ancestor::ul[1]/li/button').evaluateAll((els) => els.findIndex((e) => e.getAttribute('data-correct') === 'true'));
    await page.waitForTimeout(150);
    await page.keyboard.press(String(right + 1));
    await expect(page.locator('button[data-state="right"]')).toBeVisible();
    if (i === 0) {
      await shot(page, 'FND-AC16', '06-S3b-focus-cau-tiep');
      log['06'] = await ring();
    }
    await page.keyboard.press('Enter');
    if (i < 7) await expect(page.getByText(`Câu ${i + 2}/8`)).toBeVisible();
  }
  await expect(page.getByText('Xong phiên học')).toBeVisible();
  await focusTo('Xem tiến độ');
  await shot(page, 'FND-AC16', '07-S3c-focus-xem-tien-do');
  log['07'] = await ring();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1, name: 'Tiến độ' })).toBeVisible();
  await focusTo('30 ngày');
  await shot(page, 'FND-AC16', '08-T4-focus-khoang');
  log['08'] = await ring();
  await page.keyboard.press('Enter');
  await focusTo(/: \d+ câu$/);
  await shot(page, 'FND-AC16', '09-T4-focus-cot-ngay');
  log['09'] = await ring();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.waitForTimeout(300);
  await shot(page, 'FND-AC16', '10-T4-sheet-ngay');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await shot(page, 'FND-AC16', '11-T4-focus-tra-ve');
  log['11'] = await ring();
  note('FND-AC16', 'vien-focus', log);
});

// ---------- C7 thông báo ngắn ----------

for (const theme of THEMES) {
  test(`C7-AC01 thông báo ở T1 và S3 ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await seed(page, base(theme));
    // Dữ liệu tiếng Nhật không tải được: đổi ngôn ngữ ở S3 hiện thông báo lỗi có nút Thử lại.
    await page.route('**/data/fluency/ja.json', (route) => route.abort());
    const toast = () =>
      page.evaluate(() => {
        const t = document.querySelector('.Toastify__toast')!;
        const b = t.getBoundingClientRect();
        const s = getComputedStyle(t);
        // Chữ của thông báo: phần tử chữ đầu tiên trong thân thông báo (Body ở src/lib/toast.tsx).
        const text = (t.querySelector('span') ?? t) as HTMLElement;
        const ts = getComputedStyle(text);
        const btn = t.querySelector('button');
        return {
          rong: Math.round(b.width),
          cachDay: Math.round(window.innerHeight - b.bottom),
          trai: Math.round(b.left),
          phai: Math.round(window.innerWidth - b.right),
          nen: s.backgroundColor,
          vienTrai: `${s.borderLeftWidth} ${s.borderLeftColor}`,
          boGoc: s.borderRadius,
          role: t.getAttribute('role'),
          chu: (t.textContent || '').trim(),
          fontChu: ts.fontFamily,
          coChu: ts.fontSize,
          mauChu: ts.color,
          fontNut: btn ? getComputedStyle(btn).fontFamily : null,
          foreground: getComputedStyle(document.documentElement).getPropertyValue('--foreground').trim(),
        };
      });
    const out: Record<string, unknown> = {};
    for (const w of [375, 1280]) {
      await view(page, w);
      await go(page, '/hoc');
      await put(page, { 'vitasr2.progress.global.en': null }, '/phien-hoc?nguon=on-tap');
      // Ôn tập khi chưa có câu cần ôn: quay lại T1 kèm thông báo (S3-01).
      await expect(page.getByText('Không có câu nào để học trong nhóm này.')).toBeVisible();
      await expect(page).toHaveURL(/\/hoc$/);
      await shot(page, 'C7-AC01', `${w}-${theme}-T1`);
      const t1 = await toast();
      await go(page, '/phien-hoc?nguon=lo-trinh');
      await expect(page.getByText('Câu 1/8')).toBeVisible();
      if (w < 768) await openMenu(page);
      await page.getByTestId('language-button').click();
      await page.getByRole('dialog').getByRole('button', { name: /Tiếng Nhật/ }).click();
      await expect(page.getByText('Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await page.waitForTimeout(300);
      await shot(page, 'C7-AC01', `${w}-${theme}-S3-loi`);
      out[w] = { T1: t1, S3: await toast() };
    }
    note('C7-AC01', `do-dac-${theme}`, out);
  });
}

// ---------- Trang công khai: Landing, Đăng nhập, Đăng ký ----------

for (const theme of THEMES) {
  test(`Landing ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await seed(page, { 'vitasr2.theme': theme }, { signedIn: false });
    const out: Record<string, unknown> = {};
    for (const w of [375, 1280]) {
      await view(page, w);
      await go(page, '/');
      await expect(page.getByTestId('lp-start')).toBeVisible();
      await page.evaluate(async () => {
        window.scrollTo(0, document.body.scrollHeight);
        const wait = (img: HTMLImageElement) => (img.complete ? Promise.resolve() : Promise.race([new Promise((r) => img.addEventListener('load', r, { once: true })), new Promise((r) => setTimeout(r, 5000))]));
        await Promise.all([...document.images].map(wait));
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(300);
      await shot(page, 'LP-AC03', `${w}-${theme}`, { full: true });
      out[w] = await page.evaluate(() => {
        const main = document.querySelector('main')!.getBoundingClientRect();
        return {
          cuonNgang: document.documentElement.scrollWidth > document.documentElement.clientWidth,
          rongNoiDung: Math.round(main.width),
          phan: [...document.querySelectorAll('main section')].map((s) => {
            const b = s.getBoundingClientRect();
            return { tieuDe: (s.querySelector('h1,h2')?.textContent || '').trim(), x: Math.round(b.x), w: Math.round(b.width), h: Math.round(b.height) };
          }),
          coChuDoiTac: /đối tác|partner/i.test(document.body.innerText),
          anh: [...document.images].filter((i) => i.getBoundingClientRect().width > 0).map((i) => ({ src: i.currentSrc.split('?')[0].slice(-60), daTai: i.complete && i.naturalWidth > 0, w: Math.round(i.getBoundingClientRect().width) })),
          soNgonNgu: document.querySelector('[data-testid="lp-languages"]')?.textContent,
        };
      });
    }
    note('LP-AC03', `do-dac-${theme}`, out);
  });

  test(`Đăng nhập, Đăng ký ${theme}`, async ({ page }) => {
    test.setTimeout(120000);
    await seed(page, { 'vitasr2.theme': theme }, { signedIn: false });
    const out: Record<string, unknown> = {};
    const cols = () =>
      page.evaluate(() => {
        const secs = [...document.querySelectorAll('main section')].map((s) => {
          const b = s.getBoundingClientRect();
          return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
        });
        return { cuonNgang: document.documentElement.scrollWidth > document.documentElement.clientWidth, khoi: secs, soCot: new Set(secs.map((s) => s.x)).size, loi: [...document.querySelectorAll('main [id$="-error"], main [role="alert"], main p.text-danger')].map((e) => (e.textContent || '').trim()) };
      });
    for (const w of [375, 1280]) {
      await view(page, w);
      await go(page, '/dang-nhap');
      await expect(page.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeVisible();
      await shot(page, 'AU-AC08', `${w}-${theme}-dang-nhap`, { full: true });
      out[`dang-nhap-${w}`] = await cols();
      await page.getByLabel('Email').fill('ten@');
      await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
      await expect(page.getByText('Email chưa đúng dạng, ví dụ ten@gmail.com.')).toBeVisible();
      await shot(page, 'AU-AC08', `${w}-${theme}-dang-nhap-loi`, { full: true });
      out[`dang-nhap-loi-${w}`] = await cols();
      await go(page, '/dang-ky');
      await expect(page.getByRole('heading', { level: 1, name: 'Tạo tài khoản' })).toBeVisible();
      await shot(page, 'AU-AC08', `${w}-${theme}-dang-ky`, { full: true });
      out[`dang-ky-${w}`] = await cols();
      await page.getByLabel('Email').fill('nguoi-hoc@vitasr.test');
      await page.getByLabel('Mật khẩu', { exact: true }).fill('ngan');
      await page.getByLabel('Nhập lại mật khẩu').fill('khac');
      await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
      await expect(page.getByText(/Mật khẩu cần ít nhất \d+ ký tự\./)).toBeVisible();
      await shot(page, 'AU-AC08', `${w}-${theme}-dang-ky-loi`, { full: true });
      out[`dang-ky-loi-${w}`] = await cols();
    }
    note('AU-AC08', `do-dac-${theme}`, out);
  });
}

// ---------- APP-AC30 giao diện tiếng Anh ----------

/** Chữ có dấu tiếng Việt nằm ngoài phần nội dung tiếng Việt (lang="vi"): dấu hiệu câu giao diện chưa dịch. */
const vietnameseLeaks = (page: Page) =>
  page.evaluate(() => {
    const re = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
    const leaks: string[] = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent || '').trim();
      if (!text || !re.test(text)) continue;
      const el = n.parentElement!;
      if (el.closest('[lang="vi"], script, style, [aria-hidden="true"]')) continue;
      const b = el.getBoundingClientRect();
      if (b.width === 0 || b.height === 0) continue;
      leaks.push(text.slice(0, 80));
    }
    const overflow = [...document.querySelectorAll('main *')]
      .filter((e) => {
        const s = getComputedStyle(e);
        return e.children.length === 0 && s.overflow === 'visible' && e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0;
      })
      .map((e) => (e.textContent || '').trim().slice(0, 40))
      .slice(0, 10);
    return { chuTiengViet: leaks, phanTuTranNgang: overflow, cuonNgang: document.documentElement.scrollWidth > document.documentElement.clientWidth, htmlLang: document.documentElement.lang };
  });

async function englishContext(browser: Browser, baseURL: string | undefined, w: number) {
  const ctx = await browser.newContext({ baseURL, viewport: { width: w, height: w < 768 ? 812 : 900 }, serviceWorkers: 'block', timezoneId: 'Asia/Ho_Chi_Minh', locale: 'en-US' });
  await ctx.addCookies([{ name: 'NEXT_LOCALE', value: 'en', url: baseURL! }]);
  return ctx;
}

test('APP-AC30 giao diện tiếng Anh', async ({ browser, baseURL }) => {
  test.setTimeout(180000);
  const out: Record<string, unknown> = {};
  for (const w of [375, 1280]) {
    for (const theme of THEMES) {
      const ctx = await englishContext(browser, baseURL, w);
      const page = await ctx.newPage();
      await page.clock.setFixedTime(NOW);
      await seed(page, base(theme, { 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 }));
      await go(page, '/hoc');
      await expect(page.getByTestId('sentence-card')).toBeVisible();
      await shot(page, 'APP-AC30', `${w}-${theme}-T1`, { full: true });
      out[`T1-${w}-${theme}`] = await vietnameseLeaks(page);
      if (w < 768) {
        await openMenu(page);
        await shot(page, 'APP-AC30', `${w}-${theme}-T1-menu-mo`);
        out[`T1-menu-${w}-${theme}`] = await vietnameseLeaks(page);
      }
      await go(page, '/cai-dat');
      await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
      await shot(page, 'APP-AC30', `${w}-${theme}-S8`, { full: true });
      out[`S8-${w}-${theme}`] = await vietnameseLeaks(page);
      await ctx.close();
      const pub = await englishContext(browser, baseURL, w);
      const lp = await pub.newPage();
      await seed(lp, { 'vitasr2.theme': theme }, { signedIn: false });
      await go(lp, '/');
      await expect(lp.getByTestId('lp-start')).toBeVisible();
      await lp.waitForTimeout(500);
      await shot(lp, 'APP-AC30', `${w}-${theme}-landing`, { full: true });
      out[`landing-${w}-${theme}`] = await vietnameseLeaks(lp);
      await pub.close();
    }
  }
  note('APP-AC30', 'do-dac', out);
});

// ---------- FND-AC19 nhịp khoảng cách ----------

test('FND-AC19 khoảng cách 8 màn', async ({ page }) => {
  test.setTimeout(420000);
  await tools(page);
  await page.clock.setFixedTime(NOW);
  await seed(page, { 'vitasr2.theme': 'light', 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
  const out: Record<string, unknown> = {};
  for (const w of [1440, 375]) {
    await view(page, w);
    // 8 màn theo docs/theo-doi/ra-soat-ui-dot5.md (S1, T1, T2, T3, T4, S8, S3, S5), thêm T3 cách xem Câu và S10.
    for (const [name, path] of [
      ['S1', '/chon-ngon-ngu'],
      ['T1', '/hoc'],
      ['T2', '/luyen-tap'],
      ['T3', '/thu-vien'],
      ['T3-cau', '/thu-vien?xem=cau'],
      ['T4', '/tien-do'],
      ['S8', '/cai-dat'],
      ['S10', '/thu-vien/unit?so=2'],
      ['S3', '/phien-hoc?nguon=lo-trinh'],
      ['S5', '/kiem-tra?unit=2'],
    ] as const) {
      await go(page, path);
      await expect(page.locator('main#main')).toBeVisible();
      await expect(page.getByTestId('skeleton')).toHaveCount(0);
      // T1 cũng có thẻ câu: chờ đúng S3 (đường dẫn đã có mã phiên, đầu màn có nút Thoát).
      if (name === 'S3') {
        await expect(page).toHaveURL(/\/phien-hoc\?.*phien=/);
        await expect(page.getByRole('button', { name: 'Thoát' })).toBeVisible();
        await expect(page.getByTestId('sentence-card')).toBeVisible();
      }
      else await expect(page.locator('main h1').first()).toBeAttached();
      await page.waitForTimeout(300);
      // Cả trang, cả hai khổ: người duyệt xem được mọi khối và dấu tiếng Việt.
      await shot(page, 'FND-AC19', `${name}-${w}`, { full: true, quality: 45 });
      out[`${name}-${w}`] = await blocks(page);
    }
  }
  note('FND-AC19', 'do-dac', out);
});

// ---------- APP-AC12 bỏ qua tham số lạ ----------

test('APP-AC12 tham số URL lạ', async ({ page }) => {
  await seed(page, base('light'));
  await view(page, 1280);
  await go(page, '/hoc?abc=1&token=xyz');
  await expect(page.getByTestId('sentence-card')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Học' })).toBeAttached();
  await shot(page, 'APP-AC12', '1280-hoc-tham-so-la');
  note('APP-AC12', 'tham-so-la', { url: page.url(), coTheCau: true });
});
