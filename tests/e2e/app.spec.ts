import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { animationsDone, answerCorrect, cardShown, mainNav, revealAndKnow, seed, settings } from './helpers';

test.describe('khung và luồng chính', () => {
  // @ac S3-AC08
  test('nút Back của trình duyệt giữa phiên mở sheet xác nhận', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/hoc');
    await page.getByRole('button', { name: 'Học 8 câu' }).click();
    await expect(page).toHaveURL(/phien-hoc/);
    for (let i = 0; i < 3; i++) {
      await revealAndKnow(page);
      await answerCorrect(page);
      await page.getByRole('button', { name: 'Câu tiếp' }).click();
    }
    await expect(page.getByText('Câu 4/8')).toBeVisible();
    await page.goBack();
    const dialog = page.getByRole('dialog', { name: 'Dừng phiên học?' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Bạn đã học 3/8 câu. Kết quả các câu này vẫn được lưu.');
    await expect(page).toHaveURL(/phien-hoc/);
    await dialog.getByRole('button', { name: 'Học tiếp' }).click();
    await expect(page.getByText('Câu 4/8')).toBeVisible();
    // Back lần nữa vẫn bị chặn (mục lịch sử trùng được thêm lại).
    await page.goBack();
    await expect(page.getByRole('dialog', { name: 'Dừng phiên học?' })).toBeVisible();
    await page.getByRole('dialog').getByRole('button', { name: 'Học tiếp' }).click();
    // Liên kết trên thanh bên cũng hỏi trước.
    await mainNav(page).getByRole('link', { name: 'Thư viện', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Dừng phiên học?' })).toBeVisible();
    await expect(page).toHaveURL(/phien-hoc/);
    await page.getByRole('dialog').getByRole('button', { name: 'Học tiếp' }).click();
    await page.getByRole('button', { name: 'Thoát' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Dừng' }).click();
    await expect(page).toHaveURL(/\/hoc$/);
    await expect(page.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' })).toBeVisible();
  });

  // @ac C2-AC01
  test('ô của dải 10 x 10 px, cách nhau 4 px', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/hoc');
    const cells = page.getByTestId('sentence-card').locator('ol > li');
    await expect(cells).toHaveCount(8);
    const boxes = await cells.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ x: r.x, w: r.width, h: r.height })));
    for (const b of boxes) {
      expect(b.w).toBe(10);
      expect(b.h).toBe(10);
    }
    for (let i = 1; i < boxes.length; i++) expect(boxes[i].x - (boxes[i - 1].x + boxes[i - 1].w)).toBe(4);
  });

  // @ac C3-AC04
  test('nút và liên kết trong vùng nội dung và sheet có vùng chạm tối thiểu 44 x 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await seed(page, { 'vitasr2.settings': settings() });
    // Vùng nội dung và sheet; header và thanh bên theo APP-AC25 (40 px, ô 36 px trên header là ngoại lệ FND-14).
    const small = async (where: string) =>
      (
        await page.evaluate(() =>
          [...document.querySelectorAll<HTMLElement>('main button, main a[href], [role="dialog"] button, [role="dialog"] a[href]')]
            .filter((e) => e.offsetParent !== null && !e.closest('[data-testid="no-voice"]') && !e.hasAttribute('data-inline-link'))
            .map((e) => ({ t: (e.textContent || e.getAttribute('aria-label') || '').trim(), r: e.getBoundingClientRect() }))
            .filter((x) => Math.round(x.r.width) < 44 || Math.round(x.r.height) < 44)
            .map((x) => `${x.t} ${Math.round(x.r.width)}x${Math.round(x.r.height)}`),
        )
      ).map((x) => `${where}: ${x}`);
    await page.goto('/hoc');
    await cardShown(page);
    const bad = [...(await small('T1'))];
    await page.getByRole('button', { name: 'Học 8 câu' }).click();
    await expect(page.getByRole('button', { name: 'Nhấn để hiện câu gốc' })).toBeVisible();
    bad.push(...(await small('S3a')));
    await revealAndKnow(page);
    await expect(page.getByText('Câu này nghĩa là gì?')).toBeVisible();
    bad.push(...(await small('S3b')));
    await page.getByRole('button', { name: 'Thoát' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    bad.push(...(await small('sheet')));
    expect(bad).toEqual([]);
  });

  // @ac FND-AC04
  test('giao diện tối theo hệ thống; chọn Sáng thì mở bằng bảng sáng ngay khung đầu', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/hoc');
    await cardShown(page);
    const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(true);
    expect(await bg()).toBe('rgb(13, 20, 36)');
    // Nút sáng tối trên header: đang tối thì chuyển sang sáng (lưu ở vitasr2.theme).
    await page.getByTestId('theme-toggle').click();
    expect(await page.evaluate(() => localStorage.getItem('vitasr2.theme'))).toBe('light');
    await expect.poll(bg).toBe('rgb(244, 246, 249)');
    // Đọc lớp và màu nền ở khung đầu tiên, trước khi mã React chạy.
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        const w = window as unknown as { __first: { dark: boolean; bg: string } };
        w.__first = { dark: document.documentElement.classList.contains('dark'), bg: getComputedStyle(document.body).backgroundColor };
      });
    });
    await page.reload();
    const first = await page.evaluate(() => (window as unknown as { __first: { dark: boolean; bg: string } }).__first);
    expect(first.dark).toBe(false);
    expect(first.bg).toBe('rgb(244, 246, 249)');
    // Chọn lại "Theo thiết bị" ở S8 thì về tối.
    await page.goto('/cai-dat');
    await page.locator('#s8-theme ~ *').getByRole('combobox').or(page.getByRole('combobox', { name: /Sáng, tối/ })).first().click();
    await page.getByRole('option', { name: 'Theo thiết bị' }).click();
    await expect.poll(bg).toBe('rgb(13, 20, 36)');
  });

  // @ac FND-AC10
  test('giảm chuyển động: không có thời lượng chuyển động lớn hơn 0; thông báo ngắn vẫn tự ẩn', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/phien-hoc?nguon=lo-trinh');
    await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
    await page.getByRole('button', { name: 'Thoát' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const bad = await page.evaluate(() =>
      [...document.querySelectorAll('*')]
        .map((e) => ({ e, s: getComputedStyle(e) }))
        .filter(({ s }) => s.transitionDuration.split(',').some((d) => parseFloat(d) > 0) || s.animationDuration.split(',').some((d) => parseFloat(d) > 0))
        .map(({ e }) => `${e.tagName.toLowerCase()}.${String(e.getAttribute('class')).slice(0, 60)}`),
    );
    expect(bad).toEqual([]);
    // Ôn tập khi không có câu cần ôn: thông báo ngắn rồi về màn trước; thông báo tự ẩn sau khoảng 3 giây.
    await page.goto('/phien-hoc?nguon=on-tap');
    const toast = page.getByText('Không có câu nào để học trong nhóm này.');
    await expect(toast).toBeVisible();
    await expect(page).toHaveURL(/\/hoc$/);
    await expect(toast).toBeHidden({ timeout: 5000 });
  });

  // @ac APP-AC02
  // @ac C5-AC03
  test('bấm 4 mục trên thanh bên thì địa chỉ đổi đúng, đúng một mục đang chọn', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/hoc');
    await cardShown(page);
    for (const [label, path, heading] of [
      ['Luyện tập', '/luyen-tap', 'Luyện tập'],
      ['Thư viện', '/thu-vien', 'Thư viện'],
      ['Tiến độ', '/tien-do', 'Tiến độ'],
      ['Học', '/hoc', 'Học'],
    ]) {
      await mainNav(page).getByRole('link', { name: label, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeAttached();
      await expect(mainNav(page).getByRole('link', { name: label, exact: true })).toHaveAttribute('aria-current', 'page');
      await expect(mainNav(page).locator('[aria-current="page"]')).toHaveCount(1);
    }
    // S10 thuộc Thư viện.
    await page.goto('/thu-vien/unit?so=2');
    await expect(mainNav(page).getByRole('link', { name: 'Thư viện', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  // @ac APP-AC05
  test('đường dẫn lạ về /hoc, liên kết kiểu cũ có dấu # mở đúng màn, Back sau chuỗi T1 → T3 → T4', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/khong-co-trang-nay');
    await expect(page).toHaveURL(/\/hoc$/);
    await page.goto('/#/thu-vien?xem=cau');
    await expect(page).toHaveURL(/\/thu-vien\?xem=cau$/);
    await expect(page.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' })).toBeVisible();
    await page.goto('/#/tien-bo');
    await expect(page).toHaveURL(/\/tien-do$/);
    await page.goto('/hoc');
    await cardShown(page);
    await mainNav(page).getByRole('link', { name: 'Thư viện', exact: true }).click();
    await expect(page).toHaveURL(/\/thu-vien$/);
    await mainNav(page).getByRole('link', { name: 'Tiến độ', exact: true }).click();
    await expect(page).toHaveURL(/\/tien-do$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/thu-vien$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/hoc$/);
  });

  // @ac APP-AC05
  test('chưa chọn ngôn ngữ thì đường dẫn lạ và route khu học về /chon-ngon-ngu', async ({ page }) => {
    await seed(page, {});
    await page.goto('/khong-co-trang-nay');
    await expect(page).toHaveURL(/\/chon-ngon-ngu$/);
    await page.goto('/thu-vien');
    await expect(page).toHaveURL(/\/chon-ngon-ngu$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Bạn muốn học ngôn ngữ nào?' })).toBeVisible();
  });

  // @ac DATA-AC13
  test('chỉ gọi mạng tới origin của website', async ({ page, baseURL }) => {
    const urls: string[] = [];
    page.on('request', (r) => urls.push(r.url()));
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/hoc');
    await page.getByRole('button', { name: 'Học 8 câu' }).click();
    for (let i = 0; i < 8; i++) {
      await revealAndKnow(page);
      await answerCorrect(page);
      await page.getByRole('button', { name: /Câu tiếp|Xem tổng kết/ }).click();
    }
    await page.getByRole('link', { name: 'Xong' }).click();
    for (const l of ['Thư viện', 'Tiến độ', 'Cài đặt']) {
      await mainNav(page).getByRole('link', { name: l, exact: true }).click();
      await expect(page.getByRole('heading', { level: 1, name: l })).toBeVisible();
    }
    const origin = new URL(baseURL!).origin;
    expect(urls.filter((u) => !u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:'))).toEqual([]);
    expect(urls.filter((u) => /\/api\/|get-data/.test(u))).toEqual([]);
  });

  // @ac FND-AC15
  test('axe-core không có lỗi serious hoặc critical trên S1, S9, T1, S3 và sheet', async ({ page }) => {
    test.setTimeout(240000);
    await seed(page, {});
    for (const scheme of ['light', 'dark'] as const) {
      for (const width of [375, 1280]) {
        await page.emulateMedia({ colorScheme: scheme });
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/chon-ngon-ngu');
        // Xóa dữ liệu học, giữ phiên đăng nhập.
        await page.evaluate(() => Object.keys(localStorage).filter((k) => /^vitasr2\.(settings|progress)/.test(k)).forEach((k) => localStorage.removeItem(k)));
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
        await cardShown(page);
        await check('T1');
        if (width < 768) {
          await page.getByTestId('menu-button').click();
          await expect(page.getByTestId('menu-overlay')).toBeVisible();
          await check('menu trượt');
          await page.keyboard.press('Escape');
        }
        await page.getByRole('button', { name: 'Học 8 câu' }).click();
        await expect(page.getByRole('button', { name: 'Nhấn để hiện câu gốc' })).toBeVisible();
        await check('S3a');
        await revealAndKnow(page);
        await check('S3b');
        await answerCorrect(page);
        await page.getByRole('button', { name: 'Thoát' }).click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await check('S3 sheet');
        await page.getByRole('dialog').getByRole('button', { name: 'Dừng' }).click();
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
    const state = (sel: string) =>
      page.evaluate((s) => {
        const r = (e: Element) => e.getBoundingClientRect();
        return {
          pending: document.querySelectorAll('[data-testid="no-voice"][data-pending]').length,
          shown: document.querySelectorAll('[data-testid="no-voice"]:not([data-pending])').length,
          y: [...document.querySelectorAll(s)].map((e) => Math.round(r(e).y)),
        };
      }, sel);
    const T1 = '[data-testid="sentence-card"] button:not([data-inline-link]), [data-guide="start"] button';
    // react-query báo kết quả qua setTimeout(0): nhích đồng hồ từng bước nhỏ (tổng < 1,5 giây) cho tới khi thứ cần chờ hiện ra.
    const tickUntil = async (sel: string) => {
      for (let i = 0; i < 40; i++) {
        if (await page.locator(sel).first().isVisible()) return;
        await page.clock.runFor(20);
        await page.waitForTimeout(50);
      }
      throw new Error(`không thấy ${sel}`);
    };

    await page.goto('/hoc');
    await tickUntil('[data-testid="sentence-card"]');
    const t1Before = await state(T1);
    expect(t1Before.pending).toBe(1);
    await page.clock.runFor(1600);
    await expect(page.locator('[data-testid="no-voice"]:not([data-pending])')).toBeVisible();
    const t1After = await state(T1);
    expect(t1After.pending).toBe(0);
    // Hàng nút Nghe và nút chính giữ nguyên vị trí (liên kết trong câu báo không tính).
    expect(t1After.y).toEqual(t1Before.y);
    // Nút nghe bị khóa, câu thông báo đúng chữ, liên kết mở sheet Giọng đọc.
    await expect(page.getByTestId('no-voice')).toHaveText('Thiết bị chưa có giọng tiếng Anh. Mở Cài đặt > Giọng đọc.');
    await expect(page.getByTestId('sentence-card').getByRole('button', { name: 'Nghe', exact: true })).toBeDisabled();
    await page.getByTestId('no-voice').getByRole('button', { name: 'Cài đặt > Giọng đọc' }).click();
    await tickUntil('[role="dialog"]');
    await expect(page.getByRole('dialog')).toContainText('Giọng đọc');

    // Mở thẳng S3 rồi tới bước kiểm tra trước mốc 1,5 giây.
    await page.goto('about:blank');
    await page.goto('/phien-hoc?nguon=lo-trinh');
    await tickUntil('button:has-text("Nhấn để hiện câu gốc")');
    await page.getByRole('button', { name: 'Nhấn để hiện câu gốc' }).click();
    await tickUntil('button:has-text("Tôi nhớ")');
    await page.getByRole('button', { name: /Tôi nhớ/ }).click();
    await tickUntil('button[data-correct="true"]');
    await answerCorrect(page);
    await tickUntil('button:has-text("Câu tiếp")');
    const S3 = 'main button:not([data-inline-link])';
    const s3Before = await state(S3);
    expect(s3Before.pending).toBe(1);
    await page.clock.runFor(1600);
    await expect(page.locator('[data-testid="no-voice"]:not([data-pending])')).toBeVisible();
    const s3After = await state(S3);
    expect(s3After.pending).toBe(0);
    expect(s3After.y).toEqual(s3Before.y);
    await page.getByRole('button', { name: 'Câu tiếp' }).click();
    await expect(page.getByText('Câu 2/8')).toBeVisible();
  });
});

