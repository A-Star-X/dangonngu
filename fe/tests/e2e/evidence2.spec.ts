// Ảnh bằng chứng cho các mục acceptance [claude] của đợt 2 (T2, T3, T4, S5, S8 và phần còn lại của APP, FND).
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  npm run evidence
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { seed, settings } from './helpers';

test.skip(!process.env.EVIDENCE, 'Chỉ chạy khi EVIDENCE=1');
test.describe.configure({ mode: 'parallel' });
// Chặn service worker để mỗi lần mở trang đọc thẳng bản build và để giả lập mạng chậm được.
test.use({ serviceWorkers: 'block' });

const OUT = 'docs/evidence';
const THEMES = ['light', 'dark'] as const;
const NOW = new Date('2026-10-08T10:00:00+07:00');
const DAY = 86400000;
const progress30 = JSON.parse(readFileSync('fe/fixtures/progress/fluency-en-30-ngay.json', 'utf8'));

const shot = async (page: Page, ac: string, name: string, opts: { full?: boolean; el?: string } = {}) => {
  mkdirSync(`${OUT}/${ac}`, { recursive: true });
  const path = `${OUT}/${ac}/${name}.jpg`;
  await page.waitForTimeout(250);
  if (opts.el) await page.locator(opts.el).first().screenshot({ path, type: 'jpeg', quality: 82 });
  else await page.screenshot({ path, type: 'jpeg', quality: 82, fullPage: opts.full ?? false });
};
const note = (ac: string, name: string, data: unknown) => {
  mkdirSync(`${OUT}/${ac}`, { recursive: true });
  writeFileSync(`${OUT}/${ac}/${name}.json`, JSON.stringify(data, null, 2) + '\n');
};

/** Mở route bằng một lần tải trang mới. */
async function go(page: Page, hash: string) {
  await page.goto('about:blank');
  await page.goto(hash);
}

const fluency = () => settings({ packByLang: { en: 'fluency' } });
const global = () => settings({ packByLang: { en: 'global' } });

/** Tiến độ Global English: mọi câu trước id `upTo` đã học; vài câu cần ôn để có đủ 3 trạng thái. */
function globalProgress(upTo: number) {
  const now = NOW.getTime();
  const items: Record<string, unknown> = {};
  for (let id = 1; id < upTo; id++) items[id] = { status: 'da-hoc', streak: 2, due: now + 3 * DAY, lastAt: now - 2 * DAY };
  for (const id of [3, 5, 3011, 3013]) items[id] = { status: 'da-hoc', streak: 0, due: now - DAY, lastAt: now - DAY };
  return { schema: 1, sessions: [], attempts: [], items };
}

for (const theme of THEMES) {
  test(`T2 ${theme}`, async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    await page.emulateMedia({ colorScheme: theme });
    await seed(page, { 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      await go(page, './#/luyen-tap');
      await expect(page.getByRole('heading', { name: 'Luyện tập' })).toBeVisible();
      await shot(page, 'T2-AC01', `${w}-${theme}`);
      if (w === 375 || w === 1280) await shot(page, 'APP-AC03', `T2-${w}-${theme}`);
    }
  });

  test(`T2 sheet từ khóa ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await seed(page, { 'vitasr2.settings': global() });
    // 375 x 667: màn thấp để nội dung sheet dài hơn khung và phải cuộn trong sheet (C6-04).
    for (const [w, h] of [
      [375, 812],
      [375, 667],
    ]) {
      await page.setViewportSize({ width: w, height: h });
      await go(page, './#/luyen-tap');
      await page.getByRole('button', { name: /Học theo từ khóa/ }).click();
      await page.getByRole('searchbox', { name: 'Từ khóa' }).fill('bus');
      await expect(page.getByText('Tìm thấy 40 câu')).toBeVisible();
      await shot(page, 'T2-AC06', `${w}x${h}-${theme}-40-ket-qua`);
      if (h === 667) {
        const body = page.locator('.sheet__body');
        const m = await body.evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
        await body.evaluate((el) => el.scrollTo(0, el.scrollHeight));
        await shot(page, 'C6-AC05', `${w}x${h}-${theme}-cuon-xuong`);
        const after = await page.evaluate(() => ({
          pageScrollY: window.scrollY,
          headTop: document.querySelector('.sheet__head')!.getBoundingClientRect().top,
          footBottom: document.querySelector('.sheet__foot')!.getBoundingClientRect().bottom,
          viewport: window.innerHeight,
          bodyOverflow: document.body.style.overflow,
        }));
        note('C6-AC05', `${w}x${h}-${theme}`, { ...m, ...after });
      }
      await page.getByRole('searchbox', { name: 'Từ khóa' }).fill('xyzxyz');
      await expect(page.getByText(/Không có câu nào chứa/)).toBeVisible();
      await shot(page, 'T2-AC06', `${w}x${h}-${theme}-0-ket-qua`);
    }
  });

  test(`T3 ${theme}`, async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    await page.emulateMedia({ colorScheme: theme });
    await seed(page, { 'vitasr2.settings': global(), 'vitasr2.progress.global.en': globalProgress(3012) });
    for (const w of [320, 375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      // Unit 377 có câu tiếng Anh dài nhất bộ (id 3010) và đủ 3 trạng thái.
      await go(page, './#/thu-vien?xem=cau&unit=377');
      await expect(page.locator('.lib-row').first()).toBeVisible();
      await shot(page, 'T3-AC02', `${w}-${theme}-cau-dai`, { full: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      note('T3-AC02', `${w}-${theme}`, { horizontalOverflow: overflow });
      if (w !== 1280) {
        await go(page, './#/thu-vien?xem=cau');
        await expect(page.locator('.lib-row').first()).toBeVisible();
        await shot(page, 'T3-AC02', `${w}-${theme}-trang-1`);
        await page.locator('.lib-row').nth(2).click();
        await shot(page, 'T3-AC02', `${w}-${theme}-sheet-chi-tiet`);
      } else {
        await go(page, './#/thu-vien?xem=cau');
        await expect(page.locator('.t3__detail-col')).toBeVisible();
        await shot(page, 'T3-AC08', `${w}-${theme}-cau-dau`);
        const m1 = await page.evaluate(() => ({
          listWidth: document.querySelector('.t3__list-col')!.getBoundingClientRect().width,
          detail: document.querySelector('.t3__detail-title')!.textContent,
          dialogs: document.querySelectorAll('[role="dialog"]').length,
        }));
        await page.locator('.lib-row').nth(4).click();
        await shot(page, 'T3-AC08', `${w}-${theme}-cau-thu-5`);
        const m2 = await page.evaluate(() => ({
          detail: document.querySelector('.t3__detail-title')!.textContent,
          dialogs: document.querySelectorAll('[role="dialog"]').length,
        }));
        note('T3-AC08', `${w}-${theme}`, { truoc: m1, sauKhiCham: m2 });
        await shot(page, 'APP-AC03', `T3-${w}-${theme}`);
      }
      if (w === 375) await shot(page, 'APP-AC03', `T3-${w}-${theme}`);
    }
  });

  test(`T4 ${theme}`, async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    await page.emulateMedia({ colorScheme: theme });
    await seed(page, { 'vitasr2.settings': fluency(), 'vitasr2.progress.fluency.en': progress30 });
    for (const w of [320, 375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      for (const k of ['7', '30']) {
        await go(page, `./#/tien-bo?khoang=${k}`);
        await expect(page.getByTestId('t4-chart')).toBeVisible();
        if (w !== 375) await shot(page, 'T4-AC05', `${w}-${theme}-${k}-ngay`, { el: '.t4__block:has([data-testid="t4-chart"])' });
        if (w !== 375 && k === '7') await shot(page, 'T4-AC05', `${w}-${theme}-toan-man`, { full: true });
        if (k === '7' && w !== 320) await shot(page, 'APP-AC03', `T4-${w}-${theme}`);
      }
    }
    await go(page, './#/tien-bo');
    await page.getByRole('button', { name: /^Thứ Năm, 8\/10/ }).click();
    await shot(page, 'T4-AC05', `1280-${theme}-sheet-ngay`);
  });

  test(`S5 ${theme}`, async ({ page }) => {
    test.setTimeout(180000);
    await page.emulateMedia({ colorScheme: theme });
    await seed(page, { 'vitasr2.settings': global() });
    for (const w of [320, 375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      // Unit 377 có câu dài nhất bộ: kiểm cách xuống dòng của các cụm và nghĩa dài trong lựa chọn.
      await go(page, './#/kiem-tra?unit=377');
      await expect(page.getByRole('button', { name: 'Làm cả 3 bước' })).toBeVisible();
      await shot(page, 'S5-AC09', `${w}-${theme}-1-bat-dau`, { full: true });
      await page.getByRole('button', { name: 'Làm cả 3 bước' }).click();
      // S5-03: lựa chọn chỉ hiện sau khi biết thiết bị có giọng hay không (tối đa 1,5 giây).
      await expect(page.locator('.choice').first()).toBeVisible();
      await shot(page, 'S5-AC09', `${w}-${theme}-2-nghe-chon`, { full: true });
      await page.locator('.choice:not([data-correct])').first().click();
      await page.locator('.choice[data-correct="true"]').click();
      await shot(page, 'S5-AC09', `${w}-${theme}-3-nghe-chon-dung`, { full: true });
      if (w === 1280) await shot(page, 'FND-AC03', `S5-sai-roi-dung-${theme}`, { full: true });
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      // Câu 3010: nghĩa dài 154 ký tự.
      if (w === 320) await shot(page, 'C4-AC01', `320-${theme}-nghia-dai`, { full: true });
      if (w === 1280) await shot(page, 'C4-AC01', `1280-${theme}-co-so-thu-tu`);
      for (let i = 1; i < 8; i++) {
        await page.locator('.choice[data-correct="true"]').click();
        await page.getByRole('button', { name: 'Câu tiếp' }).click();
      }
      await expect(page.locator('.s5__bar-step')).toHaveText('Nghe theo cụm');
      await page.getByRole('button', { name: 'Câu tiếp' }).waitFor({ state: 'detached' });
      // Câu 3010 là câu thứ 2 của bước.
      await page.locator('.chunk--covered').first().click();
      await shot(page, 'S5-AC09', `${w}-${theme}-4-nghe-cum`, { full: true });
      if (w === 375) await shot(page, 'S5-AC06', `375-${theme}-buoc-2`, { full: true });
      while (await page.locator('.chunk--covered').count()) await page.locator('.chunk--covered').first().click();
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      await page.locator('.chunk--covered').first().click();
      while (await page.locator('.chunk--covered').count()) await page.locator('.chunk--covered').first().click();
      await shot(page, 'S5-AC09', `${w}-${theme}-5-nghe-cum-cau-dai`, { full: true });
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
      for (let i = 2; i < 8; i++) {
        while (await page.locator('.chunk--covered').count()) await page.locator('.chunk--covered').first().click();
        await page.getByRole('button', { name: 'Câu tiếp' }).click();
      }
      await expect(page.locator('.s5__bar-step')).toHaveText('Sắp xếp câu');
      // Xếp sai câu đầu: xếp theo thứ tự đang xáo.
      for (let n = await page.locator('[data-testid="s5-pool"] .chunk').count(); n > 0; n--) await page.locator('[data-testid="s5-pool"] .chunk').first().click();
      await page.getByRole('button', { name: 'Kiểm tra' }).click();
      await shot(page, 'S5-AC09', `${w}-${theme}-6-sap-xep-sai`, { full: true });
      if (w === 375) await shot(page, 'S5-AC06', `375-${theme}-buoc-3`, { full: true });
      if (w === 1280) await shot(page, 'FND-AC03', `S5-sap-xep-sai-${theme}`, { full: true });
      await page.getByRole('button', { name: 'Thoát' }).click();
      await shot(page, 'S5-AC09', `${w}-${theme}-7-sheet-dung`);
      await page.getByRole('dialog').getByRole('button', { name: 'Dừng' }).click();
      await go(page, './#/kiem-tra?unit=377');
      await page.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }).click();
      for (let i = 0; i < 8; i++) {
        if (i === 2) await page.locator('.choice:not([data-correct])').first().click();
        await page.locator('.choice[data-correct="true"]').click();
        await page.getByRole('button', { name: 'Câu tiếp' }).click();
      }
      await expect(page.getByText('Xong kiểm tra')).toBeVisible();
      await shot(page, 'S5-AC09', `${w}-${theme}-8-ket-qua`, { full: true });
    }
  });

  test(`S8 ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
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
    await seed(page, { 'vitasr2.settings': global() });
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      await go(page, './#/cai-dat');
      await expect(page.getByRole('heading', { name: 'Cài đặt' })).toBeVisible();
      await shot(page, 'S8-AC09', `${w}-${theme}-cai-dat`, { full: true });
      await page.getByRole('button', { name: /Giọng đọc/ }).click();
      await shot(page, 'S8-AC09', `${w}-${theme}-sheet-giong-doc`);
      await page.keyboard.press('Escape');
      await page.getByRole('button', { name: 'Xóa tiến độ tiếng Anh' }).click();
      await page.getByRole('textbox', { name: 'Tên ngôn ngữ' }).fill('Tiếng Anh');
      await shot(page, 'S8-AC09', `${w}-${theme}-sheet-xoa`);
      await page.keyboard.press('Escape');
    }
  });

  test(`T1 thanh trên cùng ${theme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme });
    await seed(page, { 'vitasr2.settings': global() });
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      await go(page, './#/hoc');
      await expect(page.locator('.card')).toBeVisible();
      await shot(page, 'APP-AC03', `T1-${w}-${theme}`);
    }
  });
}

test('APP-AC09 bố cục theo khổ', async ({ page }) => {
  test.setTimeout(120000);
  await seed(page, { 'vitasr2.settings': global() });
  const out: Record<string, unknown> = {};
  for (const w of [1440, 1280, 768, 375, 320]) {
    await page.setViewportSize({ width: w, height: 900 });
    for (const [name, hash, sel] of [
      ['T1', './#/hoc', '.card'],
      ['T3', './#/thu-vien?xem=cau', '.lib-row'],
      ['S3', './#/phien-hoc?nguon=lo-trinh', '.card'],
    ] as const) {
      await go(page, hash);
      await expect(page.locator(sel).first()).toBeVisible();
      await shot(page, 'APP-AC09', `${name}-${w}`, { full: true });
      out[`${name}-${w}`] = await page.evaluate((n) => {
        const r = (q: string) => document.querySelector(q)?.getBoundingClientRect();
        const content = n === 'S3' ? r('.s3__body') : r('.shell__content');
        const style = (q: string) => {
          const el = document.querySelector(q);
          if (!el) return null;
          const s = getComputedStyle(el);
          return { paddingLeft: s.paddingLeft, paddingRight: s.paddingRight };
        };
        const firstChild = n === 'S3' ? null : document.querySelector('.shell__content > *')?.getBoundingClientRect();
        return {
          horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          contentWidth: content ? Math.round(content.width) : null,
          contentPadding: n === 'S3' ? style('.s3__body') : style('.shell__content'),
          firstBlockWidth: firstChild ? Math.round(firstChild.width) : null,
          nav: r('.tabbar') ? { width: Math.round(r('.tabbar')!.width), height: Math.round(r('.tabbar')!.height) } : null,
        };
      }, name);
    }
  }
  note('APP-AC09', 'do-dac', out);
});

test('C5-AC02 thanh dọc 1280', async ({ page }) => {
  await seed(page, { 'vitasr2.settings': global() });
  await page.setViewportSize({ width: 1280, height: 800 });
  await go(page, './#/hoc');
  await expect(page.locator('.card')).toBeVisible();
  await shot(page, 'C5-AC02', '1280-light', { el: '.tabbar' });
  note(
    'C5-AC02',
    'do-dac',
    await page.evaluate(() => ({
      navWidth: document.querySelector('.tabbar')!.getBoundingClientRect().width,
      items: [...document.querySelectorAll('.tabbar__link')].map((a) => ({
        text: a.textContent,
        height: a.getBoundingClientRect().height,
        justify: getComputedStyle(a).justifyContent,
        textAlign: getComputedStyle(a).textAlign,
      })),
    })),
  );
});

test('APP-AC07 mạng chậm: khung xương', async ({ page }) => {
  await seed(page, { 'vitasr2.settings': global() });
  await page.route('**/data/**', async (route) => {
    await new Promise((r) => setTimeout(r, 2500));
    await route.continue();
  });
  for (const w of [375, 1280]) {
    await page.setViewportSize({ width: w, height: 800 });
    await page.goto('about:blank');
    await page.goto('./#/hoc');
    await page.waitForTimeout(400);
    await shot(page, 'APP-AC07', `${w}-dang-tai-T1`);
    await page.goto('about:blank');
    await page.goto('./#/thu-vien');
    await page.waitForTimeout(400);
    await shot(page, 'APP-AC07', `${w}-dang-tai-T3`);
  }
});

test('FND-AC05 dấu tiếng Việt khó', async ({ page }) => {
  // Thay nghĩa của câu đầu tiên bằng câu có đủ dấu khó, chỉ trong lần chụp này.
  await page.route('**/data/fluency/en.json', async (route) => {
    const res = await route.fetch();
    const json = await res.json();
    json.items[0].vi = 'Tôi muốn đặt một bàn cho hai người, được không ạ?';
    await route.fulfill({ response: res, json });
  });
  await seed(page, { 'vitasr2.settings': fluency() });
  for (const w of [375, 1280]) {
    await page.setViewportSize({ width: w, height: 800 });
    await go(page, './#/hoc');
    await expect(page.getByText('Tôi muốn đặt một bàn cho hai người, được không ạ?').first()).toBeVisible();
    await shot(page, 'FND-AC05', `${w}-the-cau`, { el: '.card' });
    await page.evaluate(() => {
      const box = document.createElement('div');
      box.id = 'thang-chu';
      box.style.cssText = 'position:fixed;inset:0;z-index:99;background:var(--paper);padding:16px;overflow:auto';
      for (const t of ['t-sm', 't-body', 't-lg', 't-xl', 't-2xl', 't-3xl']) {
        const p = document.createElement('p');
        p.className = `vi ${t}`;
        p.lang = 'vi';
        p.textContent = `${t}: Tôi muốn đặt một bàn cho hai người, được không ạ? Ỷ ỹ Ữ ữ Ặ ặ`;
        box.appendChild(p);
      }
      document.body.appendChild(box);
    });
    await shot(page, 'FND-AC05', `${w}-thang-chu`, { el: '#thang-chu' });
  }
});

test('FND-AC16 chỉ dùng bàn phím: T1 → S3 → tổng kết → T4', async ({ page }) => {
  test.setTimeout(120000);
  await seed(page, { 'vitasr2.settings': global() });
  await page.setViewportSize({ width: 1280, height: 800 });
  await go(page, './#/hoc');
  await expect(page.locator('.card')).toBeVisible();
  const focusTo = async (name: RegExp | string, max = 40) => {
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
  // Nút về trang học chính (APP-12) trên thanh trên cùng.
  await focusTo('Quay lại trang học');
  await shot(page, 'FND-AC16', '00-T1-focus-ve-trang-hoc');
  await focusTo(/Thư viện/);
  await shot(page, 'FND-AC16', '01-T1-focus-thanh-dieu-huong');
  await focusTo('Học 8 câu');
  await shot(page, 'FND-AC16', '02-T1-focus-nut-chinh');
  await page.keyboard.press('Enter');
  await expect(page.getByText('Câu 1/8')).toBeVisible();
  await shot(page, 'FND-AC16', '03-S3a-focus-the-cau');
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press(' ');
    if (i === 0) await shot(page, 'FND-AC16', '04-S3a-sau-khi-hien');
    await page.keyboard.press('2');
    // Chờ bước kiểm tra hiện hẳn rồi mới bấm phím, để phím không rơi vào lúc màn đang đổi (chạy song song dễ chậm).
    await expect(page.getByText('Câu này nghĩa là gì?')).toBeVisible();
    const right = await page.locator('.choice').evaluateAll((els) => els.findIndex((e) => e.getAttribute('data-correct') === 'true'));
    // Bộ nghe phím của bước kiểm tra gắn sau khi màn vẽ xong; chờ ngắn để phím không rơi vào khoảng đó.
    await page.waitForTimeout(150);
    await page.keyboard.press(String(right + 1));
    await expect(page.locator('.choice--right')).toBeVisible();
    if (i === 0) await shot(page, 'FND-AC16', '05-S3b-focus-cau-tiep');
    await page.keyboard.press('Enter');
    // Chờ câu sau hiện hẳn rồi mới bấm Space, để phím không rơi vào lúc màn đang đổi.
    if (i < 7) await expect(page.getByText(`Câu ${i + 2}/8`)).toBeVisible();
  }
  await expect(page.getByText('Xong phiên học')).toBeVisible();
  await focusTo('Xem tiến độ');
  await shot(page, 'FND-AC16', '06-S3c-focus-xem-tien-do');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Tiến độ' })).toBeVisible();
  await focusTo('30 ngày');
  await shot(page, 'FND-AC16', '07-T4-focus-khoang');
  await page.keyboard.press('Enter');
  await focusTo(/: \d+ câu$/);
  await shot(page, 'FND-AC16', '08-T4-focus-cot-ngay');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await shot(page, 'FND-AC16', '09-T4-sheet-ngay');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await shot(page, 'FND-AC16', '10-T4-focus-tra-ve');
});

test('FND-AC05 tiếng Nhật, Nga, Tamil và font Noto chỉ tải khi cần', async ({ page }) => {
  const fonts: string[] = [];
  page.on('request', (r) => {
    if (/\.woff2?$/.test(r.url())) fonts.push(new URL(r.url()).pathname.split('/').pop()!);
  });
  await page.setViewportSize({ width: 375, height: 812 });
  const result: Record<string, string[]> = {};
  for (const lang of ['en', 'ja', 'ru', 'ta']) {
    fonts.length = 0;
    // Mở một file tĩnh cùng origin (không chạy app) để đổi cài đặt trước khi app khởi động.
    await page.goto('./data/fluency/manifest.json');
    await page.evaluate((l) => {
      localStorage.clear();
      localStorage.setItem(
        'vitasr2.settings',
        JSON.stringify({ schema: 1, lang: l, packByLang: { [l]: 'fluency' }, theme: 'system', voiceByLang: {}, rate: 1, weeklyGoal: 5, guideSeen: true }),
      );
    }, lang);
    await go(page, './#/hoc');
    await expect(page.locator('.card')).toBeVisible();
    await page.waitForTimeout(600);
    await shot(page, 'FND-AC05', `375-the-cau-${lang}`, { el: '.card' });
    result[lang] = [...new Set(fonts.map((f) => f.replace(/-[A-Za-z0-9_-]{8}\.woff2?$/, '')))].sort();
  }
  note('FND-AC05', 'font-da-tai', result);
});

test('C7-AC01 thông báo ngắn ở T1 và S3', async ({ page }) => {
  await seed(page, { 'vitasr2.settings': global() });
  for (const w of [375, 1280]) {
    await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
    await go(page, './#/hoc');
    await expect(page.locator('.card')).toBeVisible();
    // Ôn tập khi chưa có câu cần ôn: quay lại T1 kèm thông báo (S3-01).
    await page.evaluate(() => (window.location.hash = '#/phien-hoc?nguon=on-tap'));
    await expect(page.getByText('Không có câu nào để học trong nhóm này.')).toBeVisible();
    await shot(page, 'C7-AC01', `${w}-T1-co-thanh-tab`);
    const t1 = await page.evaluate(() => {
      const t = document.querySelector('.toast')!.getBoundingClientRect();
      const tab = document.querySelector('.tabbar')!.getBoundingClientRect();
      return { toastWidth: t.width, toastBottom: t.bottom, tabbarTop: tab.top, viewport: window.innerHeight };
    });
    // Thông báo vẫn còn khi vào S3 ngay sau đó: kiểm vị trí khi không có thanh tab.
    await page.getByRole('button', { name: /^(Học 8 câu|Tiếp tục)/ }).click();
    await expect(page.getByText(/^Câu \d\/8$/)).toBeVisible();
    await shot(page, 'C7-AC01', `${w}-S3-khong-thanh-tab`);
    const s3 = await page.evaluate(() => {
      const t = document.querySelector('.toast')?.getBoundingClientRect();
      return t ? { toastWidth: t.width, gapToBottom: window.innerHeight - t.bottom } : null;
    });
    note('C7-AC01', `${w}`, { T1: t1, S3: s3 });
  }
});

test('C5-AC01 thanh tab với vùng an toàn đáy kiểu iPhone', async ({ page }) => {
  await seed(page, { 'vitasr2.settings': global() });
  const cdp = await page.context().newCDPSession(page);
  // Giả lập vùng an toàn đáy 34 px như iPhone có Face ID (Chromium hỗ trợ qua CDP).
  await cdp.send('Emulation.setSafeAreaInsetsOverride' as never, { insets: { top: 47, bottom: 34 } } as never);
  const out: Record<string, unknown> = {};
  for (const w of [375, 320]) {
    await page.setViewportSize({ width: w, height: 812 });
    await go(page, './#/hoc');
    await expect(page.locator('.card')).toBeVisible();
    await shot(page, 'C5-AC01', `${w}-vung-an-toan-34`);
    out[w] = await page.evaluate(() => {
      const nav = document.querySelector('.tabbar')!.getBoundingClientRect();
      const items = [...document.querySelectorAll('.tabbar__link')].map((a) => {
        const r = a.getBoundingClientRect();
        const label = a.querySelector('.tabbar__label') as HTMLElement;
        return { width: Math.round(r.width), labelClipped: label.scrollWidth > label.clientWidth };
      });
      return { navHeight: Math.round(nav.height), navBottom: Math.round(nav.bottom), viewport: window.innerHeight, items };
    });
  }
  note('C5-AC01', 'do-dac', out);
});

// APP-AC19 (APP-02, APP-12): nút về trang học chính trên thanh trên cùng. Chụp lại luôn APP-AC03 vì APP-02 có thêm nút này.
for (const theme of THEMES) {
  test(`APP-AC19 nút về trang học ${theme}`, async ({ page }) => {
    await page.clock.setFixedTime(NOW);
    await page.emulateMedia({ colorScheme: theme });
    await seed(page, { 'vitasr2.settings': global(), 'vitasr2.progress.global.en': globalProgress(9) });
    const rows: unknown[] = [];
    for (const w of [320, 375, 600, 1280]) {
      await page.setViewportSize({ width: w, height: w === 1280 ? 800 : 812 });
      await go(page, './#/hoc');
      await expect(page.locator('.card')).toBeVisible();
      const m = await page.evaluate(() => {
        const box = (s: string) => {
          const e = document.querySelector(s);
          if (!e) return null;
          const b = e.getBoundingClientRect();
          return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
        };
        const text = document.querySelector('.topbar .host-back__text');
        return {
          hostBack: box('.topbar .host-back'),
          lang: box('.topbar__lang'),
          settings: box('.topbar__settings'),
          chuTrangHoc: text ? getComputedStyle(text).display !== 'none' : false,
          href: document.querySelector('.topbar .host-back')?.getAttribute('href'),
          cuonNgang: document.documentElement.scrollWidth > window.innerWidth,
        };
      });
      const hb = m.hostBack!, lang = m.lang!, st = m.settings!;
      expect(hb.w).toBeGreaterThanOrEqual(44);
      expect(hb.h).toBeGreaterThanOrEqual(44);
      expect(hb.x).toBeGreaterThanOrEqual(0);
      expect(hb.x + hb.w).toBeLessThanOrEqual(lang.x);
      expect(lang.x + lang.w).toBeLessThanOrEqual(st.x);
      expect(m.chuTrangHoc).toBe(w >= 600);
      expect(m.cuonNgang).toBe(false);
      rows.push({ rong: w, ...m });
      await shot(page, 'APP-AC19', `${w}-${theme}`, { el: '.topbar' });
      if (w === 375 || w === 1280) {
        await shot(page, 'APP-AC19', `${w}-${theme}-man-T1`);
        await shot(page, 'APP-AC03', `T1-${w}-${theme}`);
        for (const [tab, route] of [['T2', './#/luyen-tap'], ['T3', './#/thu-vien'], ['T4', './#/tien-bo']] as const) {
          await go(page, route);
          await expect(page.locator('.topbar .host-back')).toBeVisible();
          await page.waitForTimeout(300);
          await shot(page, 'APP-AC03', `${tab}-${w}-${theme}`);
        }
      }
    }
    note('APP-AC19', `do-dac-${theme}`, rows);
    for (const w of [320, 1280]) {
      await page.setViewportSize({ width: w, height: 812 });
      await go(page, './#/chon-ngon-ngu');
      await expect(page.getByText('Bạn muốn học ngôn ngữ nào?')).toBeVisible();
      await shot(page, 'APP-AC19', `S1-${w}-${theme}`);
    }
  });
}
