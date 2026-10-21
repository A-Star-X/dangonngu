// Ảnh và số đo bằng chứng cho C1-AC12 (tô sáng chữ đang đọc, C1-09).
// Không phải test nghiệm thu; chỉ chạy khi EVIDENCE=1:  npm run evidence  (cần build trước).
// Giọng đọc giả: trình duyệt trong test không đọc thật, nên báo vị trí chữ bằng tay qua `onboundary` của câu vừa đọc.
import { expect, test, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { animationsDone, go, seed, settings } from './helpers';

test.skip(!process.env.EVIDENCE, 'Chỉ chạy khi EVIDENCE=1');
test.use({ serviceWorkers: 'block' });

const OUT = 'docs/evidence/C1-AC12';

async function fakeSpeech(page: Page) {
  await page.addInitScript(() => {
    const voice = { name: 'English (US)', lang: 'en-US', voiceURI: 'en-us', localService: true, default: true };
    const w = window as unknown as Record<string, unknown>;
    const fake = {
      speaking: false,
      getVoices: () => [voice],
      speak: () => undefined,
      cancel: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
    };
    Object.defineProperty(window, 'speechSynthesis', { value: fake, configurable: true });
    // Giữ câu vừa tạo để báo vị trí chữ qua onboundary của chính câu đó.
    const Orig = window.SpeechSynthesisUtterance;
    // Giọng giả không phải SpeechSynthesisVoice thật: cho phép gán vào `voice` như trình duyệt có giọng.
    Object.defineProperty(Orig.prototype, 'voice', {
      configurable: true,
      get() {
        return (this as unknown as { _voice: unknown })._voice ?? null;
      },
      set(v: unknown) {
        (this as unknown as { _voice: unknown })._voice = v;
      },
    });
    window.SpeechSynthesisUtterance = class extends Orig {
      constructor(text?: string) {
        super(text);
        w.__utter = this;
      }
    };
  });
}

/** Vị trí chữ thứ hai của câu gốc và khung của từng chữ, để so trước và sau khi tô. */
const measure = (page: Page) =>
  page.evaluate(() => {
    const p = document.querySelector('[data-testid="sentence-card"] [data-testid="source-text"]')!;
    const r = document.createRange();
    const boxes: { x: number; y: number }[] = [];
    const walk = document.createTreeWalker(p, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      for (let i = 0; i < (n.textContent ?? '').length; i++) {
        r.setStart(n, i);
        r.setEnd(n, i + 1);
        const b = r.getBoundingClientRect();
        boxes.push({ x: Math.round(b.x * 10) / 10, y: Math.round(b.y * 10) / 10 });
      }
    }
    const pb = p.getBoundingClientRect();
    return { text: p.textContent, w: Math.round(pb.width), h: Math.round(pb.height), boxes };
  });

for (const theme of ['light', 'dark'] as const) {
  test(`C1-09 tô sáng ${theme}`, async ({ page }) => {
    await fakeSpeech(page);
    await seed(page, { 'vitasr2.theme': theme, 'vitasr2.settings': settings() });
    const out: Record<string, unknown> = {};
    for (const w of [375, 1280]) {
      await page.setViewportSize({ width: w, height: w < 768 ? 812 : 800 });
      await go(page, '/hoc');
      const card = page.getByTestId('sentence-card');
      await expect(card).toBeVisible();
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      // Đo sau khi hiệu ứng hiện câu gốc chạy xong, để chỉ thấy khác biệt do tô sáng.
      await animationsDone(page);
      const before = await measure(page);
      await card.getByRole('button', { name: /^Nghe$/ }).click();
      const word = await page.evaluate(() => {
        const u = (window as unknown as { __utter: { text: string; onboundary: (e: unknown) => void } }).__utter;
        const m = /\S+\s+(\S+)/.exec(u.text)!;
        const start = m.index + m[0].length - m[1].length;
        u.onboundary({ name: 'word', charIndex: start, charLength: m[1].replace(/[.,!?]$/, '').length });
        return u.text.slice(start, start + m[1].replace(/[.,!?]$/, '').length);
      });
      await expect(card.locator('mark')).toHaveText(word);
      await page.mouse.move(0, 0);
      const after = await measure(page);
      mkdirSync(OUT, { recursive: true });
      await card.screenshot({ path: `${OUT}/${w}-${theme}-dang-to.jpg`, type: 'jpeg', quality: 70 });
      const lech = before.boxes.map((b, i) => ({ dx: Math.round((after.boxes[i].x - b.x) * 10) / 10, dy: Math.round((after.boxes[i].y - b.y) * 10) / 10 }));
      const moved = lech.filter((d) => d.dx !== 0 || d.dy !== 0).length;
      const mark = await card.locator('mark').evaluate((m) => {
        const s = getComputedStyle(m);
        return { nen: s.backgroundColor, chu: s.color, coChu: s.fontSize, doDam: s.fontWeight, gachChan: `${s.textDecorationLine} ${s.textDecorationThickness} ${s.textDecorationColor}` };
      });
      out[w] = { cau: before.text, chuDangTo: word, khungTruoc: { w: before.w, h: before.h }, khungSau: { w: after.w, h: after.h }, soKyTuXeDich: moved, lechMoiKyTu: [...new Set(lech.map((d) => `${d.dx},${d.dy}`))], mark };
    }
    writeFileSync(`${OUT}/do-dac-${theme}.json`, JSON.stringify(out, null, 2) + '\n');
  });
}
