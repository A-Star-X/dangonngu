import { expect, test, type Page } from '@playwright/test';
import { go, mainNav, seed, settings } from './helpers';

// Đợt 6: bản website (Next.js): ngôn ngữ giao diện, SEO, landing, đăng nhập.

const PASSWORD = 'mat-khau-thu-1';

async function register(page: Page, email: string, path = '/dang-ky') {
  await go(page, path);
  await expect(page.getByTestId('local-mode')).toBeVisible();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(PASSWORD);
  await page.getByLabel('Nhập lại mật khẩu').fill(PASSWORD);
  await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
}

async function signIn(page: Page, email: string, password = PASSWORD) {
  await expect(page.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeVisible();
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Mật khẩu', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

async function signOut(page: Page) {
  await page.getByTestId('sign-out').click();
  await expect(page).toHaveURL(/\/dang-nhap$/);
}

test.describe('ngôn ngữ giao diện', () => {
  // @ac APP-AC27
  test('đổi sang tiếng Anh ở S8: route giữ nguyên, cookie NEXT_LOCALE=en, html lang="en", tải lại vẫn tiếng Anh', async ({ page, context }) => {
    await seed(page, { 'vitasr2.settings': settings({ lang: 'ja', packByLang: { ja: 'fluency' } }) });
    await go(page, '/cai-dat');
    await expect(page.getByRole('heading', { level: 1, name: 'Cài đặt' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page.getByRole('button', { name: /Ngôn ngữ đang học/ })).toContainText('Tiếng Nhật');
    await page.locator('#s8-locale').click();
    await page.getByRole('option', { name: 'English' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await expect(page).toHaveURL(/\/cai-dat$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('button', { name: /Language you are learning/ })).toContainText('Japanese');
    const cookie = (await context.cookies()).find((c) => c.name === 'NEXT_LOCALE');
    expect(cookie?.value).toBe('en');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1, name: 'Settings' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    // Thanh bên cũng đổi theo.
    await expect(page.locator('#app-sidebar').getByRole('link', { name: 'Library', exact: true })).toBeVisible();
    // Đổi lại tiếng Việt.
    await page.locator('#s8-locale').click();
    await page.getByRole('option', { name: 'Tiếng Việt' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Cài đặt' })).toBeVisible();
    expect((await context.cookies()).find((c) => c.name === 'NEXT_LOCALE')?.value).toBe('vi');
  });

  // @ac APP-AC27
  test('chưa có cookie thì giao diện tiếng Việt dù trình duyệt đặt tiếng Anh', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ locale: 'en-US', baseURL, extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' } });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page.getByTestId('lp-start')).toHaveText('Bắt đầu học');
    await page.goto('/dang-nhap');
    await expect(page.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeVisible();
    await context.close();
  });
});

test.describe('SEO', () => {
  // @ac APP-AC29
  test('robots.txt và sitemap.xml chỉ mở trang công khai', async ({ request }) => {
    const robots = await (await request.get('/robots.txt')).text();
    expect(robots).toMatch(/^Allow: \/$/m);
    expect(robots).toMatch(/^Allow: \/dang-ky$/m);
    for (const p of ['/hoc', '/luyen-tap', '/thu-vien', '/tien-do', '/cai-dat', '/phien-hoc', '/kiem-tra', '/chon-ngon-ngu', '/dang-nhap']) expect(robots).toContain(`Disallow: ${p}\n`);
    expect(robots).toMatch(/^Sitemap: \S+\/sitemap\.xml$/m);
    const sitemap = await (await request.get('/sitemap.xml')).text();
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
    expect(locs).toEqual(['/', '/dang-ky']);
  });

  // @ac APP-AC29
  test('trang chủ có canonical, og:image 1200 × 630 và tiêu đề "... | Đa ngôn ngữ"; đăng nhập và Học có noindex', async ({ page, request }) => {
    await seed(page, {}, { signedIn: false });
    await page.goto('/');
    await expect(page).toHaveTitle(/ \| Đa ngôn ngữ$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
    const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
    expect(og).toBeTruthy();
    await expect(page.locator('meta[property="og:image:width"]').first()).toHaveAttribute('content', '1200');
    await expect(page.locator('meta[property="og:image:height"]').first()).toHaveAttribute('content', '630');
    // Ảnh tải được từ chính website và đúng kích thước.
    const img = await request.get(new URL(og!).pathname + new URL(og!).search);
    expect(img.ok()).toBe(true);
    expect(img.headers()['content-type']).toContain('image/png');
    const buf = await img.body();
    expect([buf.readUInt32BE(16), buf.readUInt32BE(20)]).toEqual([1200, 630]);

    for (const path of ['/dang-nhap', '/hoc']) {
      const html = await (await request.get(path)).text();
      expect(html, path).toMatch(/<meta name="robots" content="noindex/);
      expect(html, path).toMatch(/<title>[^<]+ \| Đa ngôn ngữ<\/title>/);
    }
  });
});

test.describe('landing', () => {
  // @ac LP-AC01
  test('một h1, hai lời mời và liên kết đăng nhập trỏ đúng, không có liên kết #', async ({ page }) => {
    await seed(page, {}, { signedIn: false });
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.getByTestId('lp-start')).toHaveText('Bắt đầu học');
    await expect(page.getByTestId('lp-start')).toHaveAttribute('href', '/dang-ky');
    await expect(page.getByTestId('lp-explore')).toHaveText('Khám phá các bộ câu');
    await expect(page.getByTestId('lp-explore')).toHaveAttribute('href', '/thu-vien');
    await expect(page.locator('main').getByRole('link', { name: 'Đăng nhập', exact: true }).first()).toHaveAttribute('href', '/dang-nhap');
    const hashLinks = await page.locator('a[href^="#"], a[href=""]').count();
    expect(hashLinks).toBe(0);
    // Khám phá khi chưa đăng nhập thì qua đăng nhập (AU-05).
    await page.getByTestId('lp-explore').click();
    await expect(page).toHaveURL(/\/dang-nhap\?tiep=%2Fthu-vien$/);
  });
});

test.describe('tài khoản (chế độ thử, không cấu hình Supabase)', () => {
  // @ac AU-AC06
  // @ac AU-AC05
  test('đăng ký, đăng xuất, đăng nhập lại; sai mật khẩu báo lỗi; không lưu mật khẩu dạng chữ thường', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() }, { signedIn: false });
    await register(page, 'nguoi.hoc@vi.du');
    await expect(page).toHaveURL(/\/hoc$/);
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    const stored = await page.evaluate(() => ({ users: localStorage.getItem('vitasr2.local-users') ?? '', auth: localStorage.getItem('vitasr2.auth') ?? '' }));
    expect(stored.users).toContain('nguoi.hoc@vi.du');
    expect(stored.users).not.toContain(PASSWORD);
    expect(stored.auth).not.toContain(PASSWORD);

    // Đã đăng nhập mà mở trang đăng nhập hoặc đăng ký thì vào /hoc.
    await go(page, '/dang-nhap');
    await expect(page).toHaveURL(/\/hoc$/);
    await go(page, '/dang-ky');
    await expect(page).toHaveURL(/\/hoc$/);

    await signOut(page);
    await expect(page.getByTestId('local-mode')).toBeVisible();
    await signIn(page, 'nguoi.hoc@vi.du', 'sai-mat-khau-1');
    await expect(page.getByRole('alert').filter({ hasText: 'Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi đăng nhập.' })).toBeVisible();
    await expect(page).toHaveURL(/\/dang-nhap$/);
    await expect(page.getByLabel('Email')).toHaveValue('nguoi.hoc@vi.du');
    await page.getByLabel('Mật khẩu', { exact: true }).fill(PASSWORD);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page).toHaveURL(/\/hoc$/);
    await expect(page.getByTestId('sentence-card')).toBeVisible();
  });

  // @ac AU-AC01
  test('chưa đăng nhập mở khu học thì qua đăng nhập rồi về đúng địa chỉ; tiep ra ngoài website bị bỏ qua', async ({ page }) => {
    await seed(page, { 'vitasr2.settings': settings() }, { signedIn: false });
    await register(page, 'quay.lai@vi.du');
    await expect(page).toHaveURL(/\/hoc$/);
    await signOut(page);

    await go(page, '/thu-vien?xem=cau');
    await expect(page).toHaveURL(/\/dang-nhap\?tiep=%2Fthu-vien%3Fxem%3Dcau$/);
    await signIn(page, 'quay.lai@vi.du');
    await expect(page).toHaveURL(/\/thu-vien\?xem=cau$/);
    await expect(page.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' })).toBeVisible();

    await signOut(page);
    await go(page, '/dang-nhap?tiep=//vi.du');
    await signIn(page, 'quay.lai@vi.du');
    await expect(page).toHaveURL(/\/hoc$/);
  });

  // @ac AU-AC02
  test('bấm Đăng nhập với ô trống báo lỗi dưới ô, ô có aria-invalid', async ({ page }) => {
    await seed(page, {}, { signedIn: false });
    await page.goto('/dang-nhap');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page.getByText('Nhập email.')).toBeVisible();
    await expect(page.getByText('Nhập mật khẩu.')).toBeVisible();
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Mật khẩu', { exact: true })).toHaveAttribute('aria-invalid', 'true');
    await page.getByLabel('Email').fill('abc');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page.getByText('Email chưa đúng dạng, ví dụ ten@gmail.com.')).toBeVisible();
  });
});

test.describe('khung app', () => {
  // @ac C5-AC02
  test('dưới md: thanh bên ẩn và inert; menu mở thanh bên và lớp phủ; lớp phủ, chọn mục, Escape đều đóng', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await seed(page, { 'vitasr2.settings': settings() });
    await page.goto('/hoc');
    await expect(page.getByTestId('sentence-card')).toBeVisible();
    const inert = () => page.evaluate(() => (document.getElementById('app-sidebar') as HTMLElement & { inert: boolean }).inert);
    // Thanh bên đóng nằm ngoài khung hình và có inert.
    const offscreen = () => page.evaluate(() => document.getElementById('app-sidebar')!.getBoundingClientRect().right <= 0);
    expect(await inert()).toBe(true);
    await expect.poll(offscreen).toBe(true);

    await page.getByTestId('menu-button').click();
    await expect(page.getByTestId('menu-overlay')).toBeVisible();
    await expect.poll(offscreen).toBe(false);
    expect(await inert()).toBe(false);
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('menu-overlay')).toBeHidden();
    expect(await inert()).toBe(true);

    await page.getByTestId('menu-button').click();
    await page.getByTestId('menu-overlay').click({ position: { x: 360, y: 400 } });
    await expect(page.getByTestId('menu-overlay')).toBeHidden();

    await page.getByTestId('menu-button').click();
    await mainNav(page).getByRole('link', { name: 'Thư viện', exact: true }).click();
    await expect(page).toHaveURL(/\/thu-vien$/);
    await expect(page.getByTestId('menu-overlay')).toBeHidden();
    expect(await inert()).toBe(true);
    await expect.poll(offscreen).toBe(true);
  });
});
