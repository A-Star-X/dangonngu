// Khung khu học C5 (thanh bên, header, menu trượt) và các phần của khung app đi kèm (APP-02, APP-12, APP-15).
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { NOW, TEST_USER, fakeAuth, here, renderApp, settingsSeed, settle } from './helpers';
import { routerCalls } from './router-mock';

const DAY = 86400000;
const FIRST_UNIT = [1, 257, 769, 770, 258, 771, 772, 1793];

const sidebar = () => document.getElementById('app-sidebar')!;
const menuButton = () => screen.getByTestId('menu-button');
const overlay = () => screen.queryByTestId('menu-overlay');
const navItem = (name: string) => sidebar().querySelector<HTMLElement>(`[data-nav="${name}"]`)!;
const isOpen = () => !sidebar().hasAttribute('inert') && sidebar().hasAttribute('data-open');
/** So tên trợ năng, bỏ khoảng trắng mà jsdom chèn giữa các thẻ span trước dấu phẩy. */
const accName = (want: string) => (name: string) => name.replace(/\s+,/g, ',').trim() === want;

let restoreMatchMedia: (() => void) | null = null;
/** Giả lập màn rộng từ md (768 px): useMediaQuery('(min-width: 768px)') khớp. */
function desktopViewport() {
  const w = window as unknown as Record<string, unknown>;
  const had = 'matchMedia' in w;
  const old = w.matchMedia;
  w.matchMedia = (q: string) => ({
    matches: /min-width:\s*768px/.test(q),
    media: q,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  });
  restoreMatchMedia = () => {
    if (had) w.matchMedia = old;
    else delete w.matchMedia;
  };
}

afterEach(() => {
  restoreMatchMedia?.();
  restoreMatchMedia = null;
});

describe('C5 Khung khu học', () => {
  // @ac C5-AC02
  it('dưới md: thanh bên ẩn (inert); nút menu mở thanh bên và lớp phủ; lớp phủ, chọn mục, Escape đều đóng', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    expect(sidebar()).toHaveAttribute('inert');
    expect(overlay()).toBeNull();
    expect(menuButton()).toHaveAttribute('aria-expanded', 'false');
    expect(menuButton()).toHaveAttribute('aria-controls', 'app-sidebar');

    fireEvent.click(menuButton());
    expect(isOpen()).toBe(true);
    expect(overlay()).not.toBeNull();
    expect(menuButton()).toHaveAttribute('aria-expanded', 'true');
    expect(sidebar().contains(document.activeElement)).toBe(true);
    fireEvent.click(overlay()!);
    expect(isOpen()).toBe(false);
    expect(sidebar()).toHaveAttribute('inert');
    expect(overlay()).toBeNull();

    fireEvent.click(menuButton());
    fireEvent.click(navItem('thu-vien'));
    await settle();
    expect(here()).toBe('/thu-vien');
    expect(isOpen()).toBe(false);
    expect(sidebar()).toHaveAttribute('inert');

    fireEvent.click(menuButton());
    expect(isOpen()).toBe(true);
    // Menu mở: header và nội dung phía sau không nhận focus (C5-02).
    expect(document.querySelector('header')).toHaveAttribute('inert');
    expect(document.querySelector('main')).toHaveAttribute('inert');
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(isOpen()).toBe(false);
    expect(overlay()).toBeNull();
    expect(document.querySelector('header')).not.toHaveAttribute('inert');
    // Focus về nút menu sau khi header hết inert.
    await settle();
    expect(document.activeElement).toBe(menuButton());

    // Nút đóng trong thanh bên.
    fireEvent.click(menuButton());
    fireEvent.click(within(sidebar()).getByRole('button', { name: 'Đóng menu' }));
    expect(isOpen()).toBe(false);
  });

  // @ac C5-AC02
  it('từ md: thanh bên luôn hiện, không inert, không có lớp phủ', async () => {
    desktopViewport();
    await renderApp('/hoc', { seed: settingsSeed() });
    expect(sidebar()).not.toHaveAttribute('inert');
    fireEvent.click(menuButton());
    expect(overlay()).toBeNull();
    expect(sidebar()).not.toHaveAttribute('inert');
    expect(within(sidebar()).getByRole('link', { current: 'page' })).toHaveAttribute('data-nav', 'hoc');
  });

  // @ac C5-AC03
  it('ở T1 đến T4 và S10 đúng một mục aria-current="page", là mục tương ứng (S10 là Thư viện)', async () => {
    desktopViewport();
    const cases: [string, string][] = [
      ['/hoc', 'hoc'],
      ['/luyen-tap', 'luyen-tap'],
      ['/thu-vien', 'thu-vien'],
      ['/tien-do', 'tien-do'],
      ['/thu-vien/unit?so=2', 'thu-vien'],
      ['/cai-dat', 'cai-dat'],
    ];
    for (const [url, nav] of cases) {
      const r = await renderApp(url, { seed: settingsSeed() });
      const current = sidebar().querySelectorAll('[aria-current="page"]');
      expect(current, url).toHaveLength(1);
      expect(current[0], url).toHaveAttribute('data-nav', nav);
      r.unmount();
    }
  });

  // @ac C5-AC04
  it('12 câu cần ôn: mục Luyện tập hiện "12" và có nhãn trợ năng; 0 câu thì không có số', async () => {
    desktopViewport();
    const ids = [...FIRST_UNIT, 2, 259, 773, 774];
    const items = Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 0, due: NOW - DAY, lastAt: NOW - DAY }]));
    const a = await renderApp('/thu-vien', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [], attempts: [], items } } });
    const link = within(sidebar()).getByRole('link', { name: accName('Luyện tập, 12 câu cần ôn') });
    expect(link).toHaveAttribute('data-nav', 'luyen-tap');
    expect(within(link).getByText('12')).toHaveAttribute('aria-hidden', 'true');
    a.unmount();
    await renderApp('/thu-vien', { seed: settingsSeed() });
    const plain = within(sidebar()).getByRole('link', { name: 'Luyện tập' });
    expect(plain).toHaveTextContent(/^Luyện tập$/);
  });

  // @ac C5-AC06, APP-AC18
  it('chân thanh bên: liên kết Trang chủ về Landing, email người đang đăng nhập, dòng chế độ thử', async () => {
    const a = await renderApp('/hoc', { seed: settingsSeed() });
    const home = within(sidebar()).getByRole('link', { name: 'Trang chủ' });
    expect(home).toHaveAttribute('href', '/');
    expect(home).toHaveAttribute('data-testid', 'home-link');
    expect(document.querySelector('a[href*="pomaskhoahocnaobo"]')).toBeNull();
    expect(within(sidebar()).getByTestId('user-email')).toHaveTextContent(TEST_USER.email);
    expect(within(sidebar()).getByTestId('local-mode')).toHaveTextContent('Chế độ thử: tài khoản và tiến độ chỉ lưu trên máy này.');
    a.unmount();
    await renderApp('/hoc', { seed: settingsSeed(), auth: { ...fakeAuth(), mode: 'supabase' } });
    expect(within(sidebar()).queryByTestId('local-mode')).toBeNull();
    expect(within(sidebar()).getByTestId('user-email')).toHaveTextContent(TEST_USER.email);
  });

  // @ac APP-AC18
  it('bấm Trang chủ giữa phiên học thì hỏi trước; ngoài phiên thì về Landing', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    const at = here();
    expect(at).toMatch(/^\/phien-hoc/);
    fireEvent.click(within(sidebar()).getByRole('link', { name: 'Trang chủ' }));
    await settle(30);
    expect(here()).toBe(at);
    // Dừng về màn đã mở phiên (S3-07); bấm Trang chủ lần nữa thì về Landing.
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Dừng phiên học?' })).getByRole('button', { name: 'Dừng' }));
    await settle(30);
    expect(here()).toBe('/hoc');
    fireEvent.click(within(sidebar()).getByRole('link', { name: 'Trang chủ' }));
    await settle(30);
    expect(here()).toBe('/');
  });
});

describe('APP Khung app: thanh bên', () => {
  // @ac APP-AC02
  it('bấm lần lượt 4 mục trên thanh bên: địa chỉ đổi và đúng màn hiện ra', async () => {
    desktopViewport();
    await renderApp('/cai-dat', { seed: settingsSeed() });
    const order = [...sidebar().querySelectorAll('[data-nav]')].map((e) => e.getAttribute('data-nav'));
    expect(order).toEqual(['hoc', 'luyen-tap', 'thu-vien', 'tien-do', 'cai-dat']);
    const cases: [string, string, () => void][] = [
      ['hoc', '/hoc', () => expect(screen.getByTestId('sentence-card')).toBeInTheDocument()],
      ['luyen-tap', '/luyen-tap', () => expect(screen.getByRole('heading', { level: 1, name: 'Luyện tập' })).toBeInTheDocument()],
      ['thu-vien', '/thu-vien', () => expect(screen.getByRole('heading', { level: 1, name: 'Thư viện' })).toBeInTheDocument()],
      ['tien-do', '/tien-do', () => expect(screen.getByRole('heading', { level: 1, name: 'Tiến độ' })).toBeInTheDocument()],
    ];
    for (const [nav, path, shown] of cases) {
      fireEvent.click(navItem(nav));
      await settle();
      expect(here()).toBe(path);
      shown();
      expect(navItem(nav)).toHaveAttribute('aria-current', 'page');
    }
  });

  // @ac APP-AC27
  it('đổi ngôn ngữ giao diện ở header: router.replace giữ nguyên route với locale en; giao diện tiếng Anh gọi tên ngôn ngữ đang học bằng tiếng Anh', async () => {
    const a = await renderApp('/thu-vien?xem=cau', { seed: settingsSeed({ lang: 'ja' }) });
    const box = screen.getByRole('combobox', { name: 'Ngôn ngữ giao diện' });
    expect(box).toHaveTextContent('VI');
    fireEvent.click(box);
    fireEvent.click(screen.getByRole('option', { name: 'English' }));
    await settle();
    expect(routerCalls).toContainEqual({ kind: 'replace', href: '/thu-vien?xem=cau', locale: 'en' });
    expect(here()).toBe('/thu-vien?xem=cau');
    a.unmount();
    await renderApp('/hoc', { seed: settingsSeed({ lang: 'ja' }), locale: 'en' });
    expect(screen.getByTestId('language-button')).toHaveTextContent('Japanese');
    expect(screen.getByRole('combobox', { name: 'Interface language' })).toHaveTextContent('EN');
    expect(navItem('hoc')).toHaveTextContent('Learn');
  });
});

describe('C5-08 Logo đơn vị đồng hành', () => {
  const ALTS = ['A-STAR', 'A-STAR', 'Pháp Luật & Kinh tế – Quốc tế'];
  /**
   * Ảnh logo trong từng nhóm: A-STAR trước, mỗi logo trong một khung, không nằm trong liên kết;
   * A-STAR có bản thường (ẩn khi tối) và bản chữ trắng (chỉ hiện khi tối).
   */
  function check(group: HTMLElement) {
    const imgs = [...group.querySelectorAll('img')];
    expect(imgs.map((i) => i.getAttribute('alt'))).toEqual(ALTS);
    for (const i of imgs) expect(i.closest('a')).toBeNull();
    const frames = [...group.querySelectorAll('[data-testid="partner-frame"]')];
    expect(frames).toHaveLength(2);
    expect(frames[0]).toContainElement(imgs[0]);
    expect(frames[1]).toContainElement(imgs[2]);
    for (const f of frames) expect(f).toHaveClass('rounded-card', 'border', 'border-border');
    expect(decodeURIComponent(imgs[0].getAttribute('src')!)).toContain('/partners/a-star.png');
    expect(imgs[0]).toHaveClass('dark:hidden');
    expect(decodeURIComponent(imgs[1].getAttribute('src')!)).toContain('/partners/a-star-trang.png');
    expect(imgs[1]).toHaveClass('hidden', 'dark:block');
  }

  // @ac C5-AC07
  it('khung khu học: logo ở chân thanh bên, ngay dưới Trang chủ; header không có logo', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    const groups = screen.getAllByTestId('partner-logos');
    expect(groups).toHaveLength(1);
    const [inSidebar] = groups;
    expect(sidebar()).toContainElement(inSidebar);
    expect(document.querySelector('header [data-testid="partner-logos"]')).toBeNull();
    // Hiện ở mọi khổ (không ẩn theo md), ngay sau "Trang chủ", trước email.
    expect(inSidebar.className).not.toMatch(/hidden/);
    expect(inSidebar.previousElementSibling).toBe(within(sidebar()).getByRole('link', { name: 'Trang chủ' }));
    expect(inSidebar.nextElementSibling).toBe(within(sidebar()).getByTestId('user-email'));
    check(inSidebar);
  });
});
