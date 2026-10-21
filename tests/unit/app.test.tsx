// Test cấp app: S1, khung app (APP), T1 và hướng dẫn S9, chạy qua đường dẫn thật của khu học.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, configure, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type { DataSource, PackId } from '@/domain';
import { ClientBoot } from '@/components/layout/client-boot';
import { StaticFileSource } from '@/services/content-services/api';
import UnknownRoute from '@/app/[locale]/[...rest]/page';
import { FixtureSource, NOW, here, renderApp, settingsSeed, settle } from './helpers';
import { browserBack, drainHistory, finishSession } from './page-helpers';
import { routerCalls } from './router-mock';

// Máy chạy test bận (nhiều file chạy song song) thì việc băm mật khẩu, nạp dữ liệu chậm hơn: chờ tối đa 3 giây.
configure({ asyncUtilTimeout: 3000 });
vi.setConfig({ testTimeout: 20000 });

const DAY = 86400000;
const DATA_FAILED = 'Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.';
const LANG_NAMES = ['Tiếng Anh', 'Tiếng Nga', 'Tiếng Nhật', 'Tiếng Thái'];
const FIRST_UNIT = [1, 257, 769, 770, 258, 771, 772, 1793];

afterEach(drainHistory);

/** Nguồn bọc FixtureSource, có thể làm lỗi hoặc treo theo ý muốn. */
class ControlledSource implements DataSource {
  inner = new FixtureSource();
  fail = false;
  hang = false;
  dropSourceIndex = false;
  private gate<T>(p: Promise<T>): Promise<T> {
    if (this.hang) return new Promise(() => {});
    if (this.fail) return Promise.reject(new Error('mạng lỗi'));
    return p;
  }
  getManifest(pack: PackId) {
    return this.gate(this.inner.getManifest(pack));
  }
  getSourceIndex(pack: PackId) {
    return this.dropSourceIndex ? Promise.resolve(null) : this.gate(this.inner.getSourceIndex(pack));
  }
  getLanguageFile(pack: PackId, f: string) {
    return this.gate(this.inner.getLanguageFile(pack, f));
  }
  getUnitFile(pack: PackId, f: string) {
    return this.gate(this.inner.getUnitFile(pack, f));
  }
}

const main = () => screen.getByRole('main');
/** Các dòng ngôn ngữ của S1, theo thứ tự hiện. */
const langRows = () => within(main()).getAllByRole('button');
const rowNames = () => langRows().map((b) => LANG_NAMES.find((n) => b.textContent?.startsWith(n)));
const rowOf = (name: string) => langRows().find((b) => b.textContent?.startsWith(name))!;
const languageButton = () => screen.getByTestId('language-button');
const sourceText = () => screen.getByTestId('source-text');
/** So tên trợ năng, bỏ khoảng trắng mà jsdom chèn giữa các thẻ span trước dấu phẩy. */
const accName = (want: string) => (name: string) => name.replace(/\s+,/g, ',').trim() === want;
const progressSeed = (p: Record<string, unknown>, key = 'vitasr2.progress.fluency.en') => ({ [key]: { schema: 1, sessions: [], attempts: [], items: {}, ...p } });

describe('S1 Chọn ngôn ngữ', () => {
  // @ac S1-AC01
  it('Tiếng Anh đầu tiên, còn lại theo tên tiếng Việt', async () => {
    await renderApp('/chon-ngon-ngu');
    const names = rowNames();
    expect(names[0]).toBe('Tiếng Anh');
    const rest = names.slice(1) as string[];
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b, 'vi')));
    expect(rest).toEqual(['Tiếng Nga', 'Tiếng Nhật', 'Tiếng Thái']);
  });

  // @ac S1-AC03
  it('tên gốc từ source-index; không có nguồn tên gốc thì bỏ dòng, không lỗi', async () => {
    const { unmount } = await renderApp('/chon-ngon-ngu');
    expect(screen.getByText('日本語')).toHaveAttribute('lang', 'ja');
    expect(screen.getByText('Русский')).toHaveAttribute('lang', 'ru');
    expect(screen.getByText('English')).toHaveAttribute('lang', 'en');
    unmount();
    const src = new ControlledSource();
    src.dropSourceIndex = true;
    const intl = Intl as unknown as Record<string, unknown>;
    const DN = intl.DisplayNames;
    // Giả lập trình duyệt không có Intl.DisplayNames.
    delete intl.DisplayNames;
    try {
      await renderApp('/chon-ngon-ngu', { source: src });
      expect(rowOf('Tiếng Nhật')).toBeInTheDocument();
      for (const b of langRows()) expect(b.querySelector('[lang]')).toBeNull();
    } finally {
      intl.DisplayNames = DN;
    }
  });

  // @ac S1-AC04
  it('chạm Tiếng Nhật: trong lúc tải dòng đó báo đang tải, các dòng khác khóa, chưa chuyển màn', async () => {
    const src = new ControlledSource();
    await renderApp('/chon-ngon-ngu', { source: src });
    src.hang = true;
    fireEvent.click(rowOf('Tiếng Nhật'));
    await settle();
    expect(rowOf('Tiếng Nhật')).toHaveAttribute('aria-busy', 'true');
    expect(rowOf('Tiếng Nga')).toHaveAttribute('aria-disabled', 'true');
    expect(here()).toBe('/chon-ngon-ngu');
  });

  // @ac S1-AC04
  it('chọn xong thì lưu vào vitasr2.settings và vào /hoc', async () => {
    const { mem } = await renderApp('/chon-ngon-ngu');
    fireEvent.click(rowOf('Tiếng Nhật'));
    await waitFor(() => expect(here()).toBe('/hoc'));
    expect(JSON.parse(mem.get('vitasr2.settings')!).lang).toBe('ja');
  });

  // @ac S1-AC05
  it('danh mục đang tải có 6 dòng khung xương; lỗi thì hiện trạng thái lỗi', async () => {
    const src = new ControlledSource();
    src.hang = true;
    const a = await renderApp('/chon-ngon-ngu', { source: src, wait: false });
    const skeleton = screen.getByTestId('skeleton');
    expect([...skeleton.children].filter((c) => c.tagName === 'DIV')).toHaveLength(6);
    a.unmount();
    const bad = new ControlledSource();
    bad.fail = true;
    await renderApp('/chon-ngon-ngu', { source: bad });
    expect(screen.getByRole('alert')).toHaveTextContent(DATA_FAILED);
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  // @ac S1-AC07
  it('Tiếng Anh qua bước chọn bộ; Tiếng Nhật vào thẳng', async () => {
    const { mem, unmount } = await renderApp('/chon-ngon-ngu');
    fireEvent.click(rowOf('Tiếng Anh'));
    expect(screen.getByRole('heading', { name: 'Học tiếng Anh với bộ nào?' })).toBeInTheDocument();
    const packs = within(main())
      .getAllByRole('button')
      .map((b) => b.textContent ?? '')
      .filter((t) => /Global English|English Fluency/.test(t));
    expect(packs).toHaveLength(2);
    expect(packs[0]).toMatch(/^Global English/);
    expect(packs[1]).toMatch(/^English Fluency/);
    expect(screen.getByText('Câu theo chủ đề và tình huống, có giải thích cách dùng; 6 trình độ A1 đến C2.')).toBeInTheDocument();
    expect(screen.getByText('Câu luyện nói theo mẫu câu.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Quay lại/ }));
    expect(screen.getByRole('heading', { name: 'Bạn muốn học ngôn ngữ nào?' })).toBeInTheDocument();
    fireEvent.click(rowOf('Tiếng Anh'));
    fireEvent.click(screen.getByText('Global English'));
    await waitFor(() => expect(here()).toBe('/hoc'));
    const s = JSON.parse(mem.get('vitasr2.settings')!);
    expect(s.lang).toBe('en');
    expect(s.packByLang.en).toBe('global');
    unmount();
    await renderApp('/chon-ngon-ngu');
    fireEvent.click(rowOf('Tiếng Nhật'));
    expect(screen.queryByText(/với bộ nào\?/)).toBeNull();
    await waitFor(() => expect(here()).toBe('/hoc'));
  });
});

describe('APP Khung app', () => {
  // @ac APP-AC04
  it('S1, S3 và S5 nằm trong khung khu học (thanh bên, header); S3 và S5 có nút Thoát', async () => {
    const shell = () => {
      expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument();
      expect(screen.getByTestId('menu-button').closest('header')).not.toBeNull();
    };
    const a = await renderApp('/chon-ngon-ngu');
    shell();
    a.unmount();
    for (const url of ['/phien-hoc?nguon=lo-trinh', '/kiem-tra']) {
      const r = await renderApp(url, { seed: settingsSeed() });
      await settle();
      shell();
      expect(screen.getByRole('button', { name: 'Thoát' })).toBeInTheDocument();
      r.unmount();
    }
  });

  // @ac APP-AC05
  it('đường dẫn không có trong bảng route: về /hoc, chưa chọn ngôn ngữ thì tiếp sang /chon-ngon-ngu', async () => {
    await expect(UnknownRoute({ params: Promise.resolve({ locale: 'vi' }) })).rejects.toThrow('redirect /hoc');
    const a = await renderApp('/hoc');
    expect(here()).toBe('/chon-ngon-ngu');
    a.unmount();
    await renderApp('/hoc', { seed: settingsSeed() });
    expect(here()).toBe('/hoc');
  });

  // @ac APP-AC05
  it('liên kết kiểu cũ có dấu # mở đúng đường dẫn mới', async () => {
    window.history.replaceState(null, '', '/#/thu-vien?xem=cau');
    const a = render(<ClientBoot />);
    await settle();
    expect(here()).toBe('/thu-vien?xem=cau');
    expect(window.location.hash).toBe('');
    a.unmount();
    window.history.replaceState(null, '', '/#/tien-bo');
    render(<ClientBoot />);
    await settle();
    expect(here()).toBe('/tien-do');
  });

  // @ac APP-AC05
  it('nút Back của trình duyệt sau T1 → T3 → T4 về T3 rồi T1', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    const go = async (nav: string) => {
      fireEvent.click(screen.getByTestId('menu-button'));
      fireEvent.click(document.querySelector(`[data-nav="${nav}"]`)!);
      await settle();
    };
    await go('thu-vien');
    await go('tien-do');
    expect(here()).toBe('/tien-do');
    await browserBack();
    expect(here()).toBe('/thu-vien');
    expect(screen.getByRole('link', { current: 'page' })).toHaveAttribute('data-nav', 'thu-vien');
    await browserBack();
    expect(here()).toBe('/hoc');
    expect(sourceText()).toHaveTextContent('I want to...');
  });

  // @ac APP-AC06
  it('đã đăng nhập, chưa có ngôn ngữ: mở vào S1; chọn rồi tải lại thì mở thẳng T1', async () => {
    const a = await renderApp('/hoc');
    expect(here()).toBe('/chon-ngon-ngu');
    expect(screen.getByRole('heading', { name: 'Bạn muốn học ngôn ngữ nào?' })).toBeInTheDocument();
    fireEvent.click(rowOf('Tiếng Nhật'));
    await waitFor(() => expect(here()).toBe('/hoc'));
    const saved = a.mem.get('vitasr2.settings')!;
    a.unmount();
    routerCalls.length = 0;
    await renderApp('/hoc', { seed: { 'vitasr2.settings': saved } });
    expect(here()).toBe('/hoc');
    expect(routerCalls).toEqual([]);
    expect(languageButton()).toHaveTextContent('Tiếng Nhật');
    expect(screen.getByTestId('sentence-card')).toBeInTheDocument();
  });

  // @ac APP-AC08, APP-AC17
  it('sheet Đổi ngôn ngữ: hai dòng cho Tiếng Anh, đổi bộ về /hoc, tên trên nút đổi, tiến độ cũ còn nguyên', async () => {
    const { mem } = await renderApp('/thu-vien', { seed: settingsSeed({ packByLang: { en: 'global' } }) });
    expect(languageButton()).toHaveTextContent('Tiếng Anh');
    expect(languageButton()).toHaveTextContent('Global English');
    mem.set('vitasr2.progress.global.en', JSON.stringify({ schema: 1, sessions: [], attempts: [], items: { 1: { status: 'da-hoc', streak: 2, due: NOW + 3 * DAY, lastAt: NOW } } }));
    fireEvent.click(languageButton());
    const dialog = screen.getByRole('dialog', { name: 'Đổi ngôn ngữ hoặc bộ nội dung' });
    expect(within(dialog).getByText('Tiếng Anh, Global English').closest('button')).toHaveAttribute('aria-current', 'true');
    fireEvent.click(within(dialog).getByText('Tiếng Anh, English Fluency'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(here()).toBe('/hoc');
    expect(languageButton()).toHaveTextContent('English Fluency');
    expect(sourceText()).toHaveTextContent('I want to...');
    fireEvent.click(languageButton());
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Nhật'));
    await waitFor(() => expect(languageButton()).toHaveTextContent('Tiếng Nhật'));
    expect(languageButton()).not.toHaveTextContent(/Global English|English Fluency/);
    expect(JSON.parse(mem.get('vitasr2.progress.global.en')!).items[1].streak).toBe(2);
    // Quay lại bộ cũ: tiến độ của bộ đó vẫn còn, tiến độ hai bộ giữ riêng.
    fireEvent.click(languageButton());
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Anh, Global English'));
    await waitFor(() => expect(languageButton()).toHaveTextContent('Global English'));
    expect(screen.getByTestId('t1-learned')).toHaveTextContent(/^1\//);
    expect(mem.get('vitasr2.progress.fluency.en') ?? null).toBeNull();
  });

  // @ac APP-AC10
  it('nguồn lỗi hiện câu lỗi và nút Thử lại; Thử lại khi nguồn ổn thì hiện dữ liệu', async () => {
    const src = new ControlledSource();
    src.fail = true;
    await renderApp('/hoc', { source: src, seed: settingsSeed() });
    expect(screen.getByRole('alert')).toHaveTextContent(DATA_FAILED);
    src.fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    await waitFor(() => expect(sourceText()).toHaveTextContent('I want to...'));
  });

  // @ac APP-AC11
  it('dải ngoại tuyến hiện khi mất mạng và ẩn khi có mạng lại', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    const text = 'Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy.';
    expect(screen.queryByText(text)).toBeNull();
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false });
    try {
      act(() => void window.dispatchEvent(new Event('offline')));
      expect(screen.getByText(text)).toBeInTheDocument();
    } finally {
      delete (navigator as unknown as Record<string, unknown>).onLine;
    }
    act(() => void window.dispatchEvent(new Event('online')));
    expect(screen.queryByText(text)).toBeNull();
  });

  // @ac APP-AC11, DATA-AC07
  it('bộ nhớ trình duyệt bị chặn: có dải cảnh báo và vẫn học hết một phiên', async () => {
    const throwing = {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {},
      key: () => null,
      length: 0,
    } as unknown as Storage;
    await renderApp('/chon-ngon-ngu', { backend: throwing });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Trình duyệt đang chặn lưu tiến độ, tiến độ sẽ mất khi đóng app. Cho phép trang này lưu trên máy trong cài đặt trình duyệt rồi mở lại app.',
    );
    fireEvent.click(rowOf('Tiếng Nhật'));
    await waitFor(() => expect(here()).toBe('/hoc'));
    fireEvent.click(screen.getByRole('button', { name: /^Học \d câu$/ }));
    await settle();
    await finishSession();
    expect(screen.getByText('Xong phiên học')).toBeInTheDocument();
  });

  // @ac DATA-AC02
  it('dữ liệu sai hợp đồng hiện trạng thái lỗi, không làm trắng màn', async () => {
    class BadSource extends ControlledSource {
      async getLanguageFile(pack: PackId, f: string) {
        const raw = (await this.inner.getLanguageFile(pack, f)) as { items: Record<string, unknown>[] };
        delete raw.items[0].vi;
        return raw;
      }
    }
    await renderApp('/hoc', { source: new BadSource(), seed: settingsSeed() });
    expect(screen.getByRole('alert')).toHaveTextContent(DATA_FAILED);
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính' })).toBeInTheDocument();
  });

  // Hỗ trợ DATA-AC05 (mục kiểm bằng Claude): nguồn tĩnh đọc qua fetch chạy giống nguồn fixture.
  it('nguồn tĩnh trỏ tới thư mục fixture chạy giống nguồn fixture', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const root = path.resolve(process.cwd(), 'fixtures');
    const fetchImpl = (async (url: string) => {
      try {
        return new Response(readFileSync(path.join(root, url.replace(/^\//, ''))), { status: 200 });
      } catch {
        return new Response('', { status: 404 });
      }
    }) as unknown as typeof fetch;
    await renderApp('/hoc', { source: new StaticFileSource(fetchImpl), seed: settingsSeed() });
    await waitFor(() => expect(sourceText()).toHaveTextContent('I want to...'));
  });
});

describe('T1 Học', () => {
  // @ac T1-AC01
  it('tiến độ trống: câu đầu của unit 1, có Unit 1, tên và nghĩa của unit, ô đầu Đang học', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    expect(sourceText()).toHaveTextContent('I want to...');
    expect(screen.getByRole('link', { name: 'Unit 1' })).toBeInTheDocument();
    // Tên unit trên đầu thẻ và câu gốc trong thẻ.
    expect(screen.getAllByText('I want to...').length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText('Tôi muốn...').length).toBeGreaterThan(0);
    const cells = within(screen.getByTestId('sentence-card')).getAllByRole('listitem');
    expect(cells[0]).toHaveAttribute('data-state', 'dang');
    expect(cells.slice(1).every((c) => c.getAttribute('data-state') === 'chua')).toBe(true);
    expect(screen.queryByText('Nhấn để hiện câu gốc')).toBeNull();
  });

  // @ac T1-AC03
  it('nút chính: Học 8 câu, Học 5 câu, Tiếp tục khi có phiên dở', async () => {
    const a = await renderApp('/hoc', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle();
    expect(here()).toMatch(/^\/phien-hoc\?nguon=lo-trinh/);
    a.unmount();
    // Đã học hết 3 unit đầu: unit 4 còn 5 câu.
    const ids = [...FIRST_UNIT, 2, 259, 773, 774, 260, 775, 776, 1794, 3, 261, 777, 778, 262, 779, 780, 1795];
    const items = Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 1, due: NOW + DAY, lastAt: NOW }]));
    const b = await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed({ items }) } });
    expect(screen.getByRole('button', { name: 'Học 5 câu' })).toBeInTheDocument();
    b.unmount();
    const open = { id: 'sx', nguon: 'lo-trinh', itemIds: FIRST_UNIT, startedAt: NOW, position: 3, step: 'ghi-nho', params: {} };
    await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed({ sessions: [open] }) } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' }));
    await settle();
    expect(here()).toMatch(/^\/phien-hoc\?/);
    expect(screen.getByText('Câu 4/8')).toBeInTheDocument();
  });

  // @ac T1-AC04
  it('mục tiêu tuần tính phiên hoàn tất trong 7 ngày', async () => {
    const mk = (n: number, daysAgo: number) =>
      Array.from({ length: n }, (_, i) => ({ id: `s${daysAgo}${i}`, nguon: 'lo-trinh', itemIds: [1], startedAt: NOW - daysAgo * DAY, completedAt: NOW - daysAgo * DAY, position: 1, step: 'ghi-nho' }));
    const a = await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed({ sessions: [...mk(3, 2), ...mk(2, 8)] }) } });
    expect(screen.getByTestId('t1-goal')).toHaveTextContent('Tuần này: 3/5 phiên');
    a.unmount();
    await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed({ sessions: [...mk(4, 1), ...mk(1, 6)] }) } });
    expect(screen.getByTestId('t1-goal')).toHaveTextContent('Tuần này: đã đạt mục tiêu 5/5 phiên');
  });

  // @ac T1-AC05, DATA-AC09
  it('dòng câu cần ôn chỉ hiện khi N > 0, cùng số với thanh bên; chạm mở phiên ôn tập', async () => {
    const a = await renderApp('/hoc', { seed: settingsSeed() });
    expect(screen.queryByTestId('t1-review')).toBeNull();
    expect(screen.queryByText(/câu cần ôn hôm nay/)).toBeNull();
    a.unmount();
    const ids = [...FIRST_UNIT, 2, 259, 773, 774];
    const items = Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 0, due: NOW - DAY, lastAt: NOW - DAY }]));
    await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed({ items }) } });
    const link = screen.getByTestId('t1-review');
    expect(link).toHaveTextContent('12 câu cần ôn hôm nay');
    expect(link).toHaveAttribute('href', '/phien-hoc?nguon=on-tap');
    expect(screen.getByRole('link', { name: accName('Luyện tập, 12 câu cần ôn') })).toBeInTheDocument();
    fireEvent.click(link);
    await settle();
    expect(here()).toMatch(/^\/phien-hoc\?nguon=on-tap(&|$)/);
  });

  // @ac T1-AC06, S9-AC01
  it('học hết lộ trình: không có thẻ, có đoạn thông báo và nút Mở Luyện tập; không hiện hướng dẫn', async () => {
    const all = (await new FixtureSource().getLanguageFile('fluency', 'en.json')) as { items: { id: number }[] };
    const items = Object.fromEntries(all.items.map((i) => [i.id, { status: 'da-hoc', streak: 3, due: NOW + 7 * DAY, lastAt: NOW }]));
    await renderApp('/hoc', { seed: { ...settingsSeed({ guideSeen: false }), ...progressSeed({ items }) } });
    expect(screen.queryByTestId('sentence-card')).toBeNull();
    expect(screen.getByText('Bạn đã học hết 29 câu tiếng Anh. Vào Luyện tập để ôn lại.')).toBeInTheDocument();
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mở Luyện tập' }));
    await settle();
    expect(here()).toBe('/luyen-tap');
  });

  // @ac T1-AC08
  it('vuốt và phím mũi tên không đổi câu', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    const card = screen.getByTestId('sentence-card');
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(card, { key: 'ArrowLeft' });
    fireEvent.pointerDown(card, { clientX: 300 });
    fireEvent.pointerMove(card, { clientX: 20 });
    fireEvent.pointerUp(card, { clientX: 20 });
    fireEvent.touchStart(card, { touches: [{ clientX: 300, clientY: 10 }] });
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 10, clientY: 10 }] });
    await settle();
    expect(sourceText()).toHaveTextContent('I want to...');
    expect(here()).toBe('/hoc');
  });

  // @ac T1-AC10, DATA-AC18
  it('Global English có mã trình độ, tên unit và tình huống; Fluency thì không', async () => {
    const a = await renderApp('/hoc', { seed: settingsSeed({ packByLang: { en: 'global' } }) });
    expect(screen.getByRole('link', { name: 'Unit 1 · A1' })).toBeInTheDocument();
    expect(screen.getByText('Find your classroom')).toBeInTheDocument();
    expect(screen.getByText('Bạn mới đến trường và hỏi một bạn học về phòng học tiếng Anh.')).toBeInTheDocument();
    expect(screen.getByText(/^Cách dùng: /)).toBeInTheDocument();
    a.unmount();
    await renderApp('/hoc', { seed: settingsSeed() });
    expect(screen.getByRole('link', { name: 'Unit 1' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Unit 1 · / })).toBeNull();
    expect(screen.queryByText('Bạn mới đến trường và hỏi một bạn học về phòng học tiếng Anh.')).toBeNull();
    expect(screen.queryByText(/^Cách dùng: /)).toBeNull();
  });
});

describe('S9 Hướng dẫn', () => {
  // @ac S9-AC01
  it('chọn ngôn ngữ lần đầu thì T1 hiện bước 1/3', async () => {
    await renderApp('/chon-ngon-ngu');
    fireEvent.click(rowOf('Tiếng Nhật'));
    await waitFor(() => expect(screen.getByText('Bước 1/3')).toBeInTheDocument());
    expect(screen.getByText('Đây là câu bạn sẽ học. Nút Nghe sẽ đọc to câu này cho bạn.')).toBeInTheDocument();
  });

  // @ac S9-AC03
  it('Tiếp, Bỏ qua, Esc, Bắt đầu học', async () => {
    const a = await renderApp('/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(screen.getByText('Bước 2/3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
    a.unmount();
    const b = await renderApp('/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
    b.unmount();
    await renderApp('/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(screen.getByText('Ôn tập và kiểm tra nằm ở mục Luyện tập. Kết quả học nằm ở mục Tiến độ.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu học' }));
    await settle();
    expect(here()).toMatch(/^\/phien-hoc\?nguon=lo-trinh/);
  });

  // @ac S9-AC04
  it('đã bỏ qua thì không hiện lại, kể cả khi tải lại và đổi ngôn ngữ', async () => {
    const a = await renderApp('/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    const saved = a.mem.get('vitasr2.settings')!;
    a.unmount();
    await renderApp('/hoc', { seed: { 'vitasr2.settings': saved } });
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
    fireEvent.click(languageButton());
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Nhật'));
    await waitFor(() => expect(languageButton()).toHaveTextContent('Tiếng Nhật'));
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
  });
});
