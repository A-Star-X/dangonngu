import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { animationsDone, answerCorrect, revealAndKnow, seed, settings } from './helpers';

test.describe('khung và luồng chính', () => {
  // @ac S3-AC08
  test('nút Back của trình duyệt giữa phiên mở sheet xác nhận', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/hoc');
    await page.getByRole('button', { name: 'Học 8 câu' }).click();
    await expect(page).toHaveURL(/phien-hoc/);
    for (let i = 0; i < 3; i++) {
      await revealAndKnow(page);
      await answerCorrect(page);
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
    }
    await page.goBack();
    const dialog = page.getByRole('dialog', { name: 'Dừng phiên học?' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Bạn đã học 3/8 câu. Kết quả các câu này vẫn được lưu.');
    await expect(page).toHaveURL(/phien-hoc/);
    await dialog.getByRole('button', { name: 'Học tiếp' }).click();
    await expect(page.getByText('Câu 4/8')).toBeVisible();
    await page.getByRole('button', { name: 'Thoát' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Dừng' }).click();
    await expect(page).toHaveURL(/#\/hoc$/);
    await expect(page.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' })).toBeVisible();
  });

  // @ac C2-AC01
  test('ô của dải 10 x 10 px, cách nhau 4 px', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/hoc');
    const cells = page.locator('.card .strip__cell');
    await expect(cells).toHaveCount(8);
    const boxes = await cells.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, w: r.width, h: r.height })));
    for (const b of boxes) {
      expect(b.w).toBe(10);
      expect(b.h).toBe(10);
    }
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].x - (boxes[i - 1].x + boxes[i - 1].w)).toBe(4);
  });

  // @ac C3-AC04
  test('mọi nút và liên kết có vùng chạm tối thiểu 44 x 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await seed(page, { 'vitasr2.settings': settings() });
    const small = async (where: string) =>
      (
        await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('button, a[href]')]
            .filter((e) => e.offsetParent !== null && !e.closest('.card__novoice'))
            .map((e) => ({ t: (e.textContent || e.getAttribute('aria-label') || '').trim(), r: e.getBoundingClientRect() }))
            .filter((x) => x.r.width < 44 || x.r.height < 44)
            .map((x) => `${x.t} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`),
        )
      ).map((x) => `${where}: ${x}`);
    await page.goto('./#/hoc');
    await expect(page.locator('.card')).toBeVisible();
    const bad = [...(await small('T1'))];
    await page.getByRole('button', { name: 'Học 8 câu' }).click();
    bad.push(...(await small('S3a')));
    await revealAndKnow(page);
    bad.push(...(await small('S3b')));
    await page.getByRole('button', { name: 'Thoát' }).click();
    bad.push(...(await small('sheet')));
    expect(bad).toEqual([]);
  });

  // @ac FND-AC04
  test('giao diện tối theo hệ thống; chọn Sáng thì mở bằng bảng sáng ngay khung đầu', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/hoc');
    await expect(page.locator('.card')).toBeVisible();
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await bg()).toBe('rgb(13, 20, 36)');
    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('vitasr2.settings')!);
      s.theme = 'light';
      localStorage.setItem('vitasr2.settings', JSON.stringify(s));
    });
    // Đọc màu nền ở khung đầu tiên, trước khi mã app chạy.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        (window as unknown as { __firstBg: string }).__firstBg = getComputedStyle(document.body).backgroundColor;
      });
    });
    await page.reload();
    expect(await page.evaluate(() => (window as unknown as { __firstBg: string }).__firstBg)).toBe('rgb(244, 246, 249)');
  });

  // @ac FND-AC10
  test('giảm chuyển động: không có thời lượng chuyển động lớn hơn 0', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/phien-hoc?nguon=lo-trinh');
    await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
    await page.getByRole('button', { name: 'Thoát' }).click();
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((e) => getComputedStyle(e))
        .filter((s) => s.transitionDuration.split(',').some((d) => parseFloat(d) > 0) || s.animationDuration.split(',').some((d) => parseFloat(d) > 0)).length,
    );
    expect(bad).toBe(0);
  });

  // @ac APP-AC02
  test('bấm 4 mục điều hướng thì hash đổi đúng', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/hoc');
    for (const [label, h] of [
      ['Luyện tập', '#/luyen-tap'],
      ['Thư viện', '#/thu-vien'],
      ['Tiến độ', '#/tien-bo'],
      ['Học', '#/hoc'],
    ]) {
      await page.getByRole('navigation', { name: 'Điều hướng chính' }).getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(h.replace('/', '\\/') + '$'));
      await expect(page.getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
    }
  });

  // @ac APP-AC05
  test('Back sau chuỗi T1 → T3 → T4 về T3 rồi T1', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/hoc');
    await page.getByRole('link', { name: 'Thư viện', exact: true }).click();
    await page.getByRole('link', { name: 'Tiến độ', exact: true }).click();
    await page.goBack();
    await expect(page).toHaveURL(/#\/thu-vien$/);
    await page.goBack();
    await expect(page).toHaveURL(/#\/hoc$/);
  });

  // @ac DATA-AC13
  test('chỉ gọi mạng tới origin của app', async ({ page, baseURL }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('./#/hoc');
    await page.getByRole('button', { name: 'Học 8 câu' }).click();
    for (let i = 0; i < 8; i++) {
      await revealAndKnow(page);
      await answerCorrect(page);
      await page.getByRole('button', { name: /Câu tiếp|Xem tổng kết/ }).click();
    }
    await page.getByRole('link', { name: 'Xong' }).click();
    for (const l of ['Thư viện', 'Tiến độ']) await page.getByRole('link', { name: l, exact: true }).click();
    await page.getByRole('link', { name: 'Cài đặt' }).click();
    const origin = new URL(baseURL!).origin;
    expect(urls.filter((u) => !u.startsWith(origin))).toEqual([]);
    expect(urls.filter((u) => /\/api\/|get-data/.test(u))).toEqual([]);
  });

  // @ac FND-AC15
  test('axe-core không có lỗi serious hoặc critical trên các màn đã làm', async ({ page }) => {
    test.setTimeout(240000);
    for (const scheme of ['light', 'dark'] as const) {
      for (const width of [375, 1280]) {
        await page.emulateMedia({ colorScheme: scheme });
        await page.setViewportSize({ width, height: 800 });
        await page.goto('./#/chon-ngon-ngu');
        await page.evaluate(() => localStorage.clear());
        await page.reload();
        await expect(page.getByText('Bạn muốn học ngôn ngữ nào?')).toBeVisible();
        const check = async (where: string) => {
          await animationsDone(page);
          const r = await new AxeBuilder({ page }).analyze();
          const bad = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
          expect(bad.map((v) => `${where} ${scheme} ${width}: ${v.id} ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
        };
        await check('S1');
        await page.getByRole('button', { name: /Tiếng Anh/ }).click();
        await check('S1 bộ');
        await page.getByRole('button', { name: /Global English/ }).click();
        await expect(page.getByText('Bước 1/3')).toBeVisible();
        await check('S9');
        await page.getByRole('button', { name: 'Bỏ qua' }).click();
        await check('T1');
        await page.getByRole('button', { name: 'Học 8 câu' }).click();
        await check('S3a');
        await revealAndKnow(page);
        await check('S3b');
        await answerCorrect(page);
        await page.getByRole('button', { name: 'Thoát' }).click();
        await check('S3 sheet');
      }
    }
  });

  // @ac C1-AC06
  test('câu báo thiếu giọng hiện ra không đẩy các nút bên dưới đi chỗ khác (T1, S3 bước kiểm tra)', async ({ page }) => {
    // Thiết bị không có giọng nào: app chờ nạp giọng 1,5 giây rồi mới hiện câu báo (useVoices).
    // Dừng đồng hồ của trang để đo được trước và sau đúng mốc đó, không phụ thuộc máy chạy test nhanh hay chậm.
    await page.addInitScript(() => Object.defineProperty(window.speechSynthesis, 'getVoices', { value: () => [] }));
    await page.clock.install({ time: new Date('2026-10-08T10:00:00+07:00') });
    await page.clock.pauseAt(new Date('2026-10-08T10:00:01+07:00'));
    await seed(page, { 'vitasr2.settings': settings() });
    const boxes = (sel: string) =>
      page.evaluate((s) => {
        const r = (e: Element) => e.getBoundingClientRect();
        return {
          pending: document.querySelectorAll('.card__novoice--pending').length,
          shown: document.querySelectorAll('.card__novoice:not(.card__novoice--pending)').length,
          y: [...document.querySelectorAll(s)].map((e) => Math.round(r(e).y)),
        };
      }, sel);

    await page.goto('./#/hoc');
    await expect(page.locator('.card')).toBeVisible();
    const t1Before = await boxes('.card__audio, .t1 .btn--primary');
    expect(t1Before.pending).toBe(1);
    await page.clock.runFor(1600);
    await expect(page.locator('.card .card__novoice:not(.card__novoice--pending)')).toBeVisible();
    const t1After = await boxes('.card__audio, .t1 .btn--primary');
    expect(t1After.pending).toBe(0);
    expect(t1After.y).toEqual(t1Before.y);

    // Mở thẳng S3 rồi tới bước kiểm tra trước mốc 1,5 giây.
    await page.goto('about:blank');
    await page.goto('./#/phien-hoc?nguon=lo-trinh');
    await revealAndKnow(page);
    await answerCorrect(page);
    await expect(page.getByRole('button', { name: 'Câu tiếp' })).toBeVisible();
    const s3Before = await boxes('.choice, .s3__check-actions .btn');
    expect(s3Before.pending).toBe(1);
    await page.clock.runFor(1600);
    await expect(page.locator('.s3__source .card__novoice:not(.card__novoice--pending)')).toBeVisible();
    const s3After = await boxes('.choice, .s3__check-actions .btn');
    expect(s3After.pending).toBe(0);
    expect(s3After.y).toEqual(s3Before.y);
    await page.getByRole('button', { name: 'Câu tiếp' }).click();
    await expect(page.getByText('Câu 2/8')).toBeVisible();
  });
});
