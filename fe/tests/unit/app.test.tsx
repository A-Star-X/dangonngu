import { describe, expect, it } from 'vitest';
import { act, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { FixtureSource, StaticFileSource, type DataSource, type PackId } from '../../src/data';
import { HOST_URL } from '../../src/app/HostBack';
import { NOW, hash, renderApp, settingsSeed, settle } from './helpers';

const DAY = 86400000;

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

const rowNames = () => screen.getAllByRole('button').map((b) => b.querySelector('.lang-row__name')?.textContent).filter(Boolean) as string[];

describe('S1 Chọn ngôn ngữ', () => {
  // @ac S1-AC01
  it('Tiếng Anh đầu tiên, còn lại theo tên tiếng Việt', async () => {
    await renderApp('#/chon-ngon-ngu');
    const names = rowNames();
    expect(names[0]).toBe('Tiếng Anh');
    const rest = names.slice(1);
    expect(rest).toEqual([...rest].sort((a, b) => a.localeCompare(b, 'vi')));
    expect(rest).toEqual(['Tiếng Nga', 'Tiếng Nhật', 'Tiếng Thái']);
  });

  // @ac S1-AC03
  it('tên gốc từ source-index; không có nguồn tên gốc thì bỏ dòng, không lỗi', async () => {
    const { unmount } = await renderApp('#/chon-ngon-ngu');
    expect(screen.getByText('日本語')).toBeInTheDocument();
    expect(screen.getByText('Русский')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    unmount();
    const src = new ControlledSource();
    src.dropSourceIndex = true;
    const intl = Intl as unknown as Record<string, unknown>;
    const DN = intl.DisplayNames;
    // Giả lập trình duyệt không có Intl.DisplayNames.
    delete intl.DisplayNames;
    try {
      const r = await renderApp('#/chon-ngon-ngu', { source: src });
      expect(r.container.querySelectorAll('.lang-row__native')).toHaveLength(0);
      expect(screen.getByText('Tiếng Nhật')).toBeInTheDocument();
    } finally {
      intl.DisplayNames = DN;
    }
  });

  // @ac S1-AC04
  it('chạm Tiếng Nhật: lưu ngôn ngữ, vào #/hoc; trong lúc tải các dòng khác khóa', async () => {
    const src = new ControlledSource();
    await renderApp('#/chon-ngon-ngu', { source: src });
    src.hang = true;
    fireEvent.click(screen.getByText('Tiếng Nhật'));
    await settle();
    const ja = screen.getByText('Tiếng Nhật').closest('button')!;
    expect(ja).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Tiếng Nga').closest('button')).toHaveAttribute('aria-disabled', 'true');
    expect(hash()).toBe('#/chon-ngon-ngu');
  });

  it('chọn xong thì lưu và chuyển', async () => {
    const { mem } = await renderApp('#/chon-ngon-ngu');
    fireEvent.click(screen.getByText('Tiếng Nhật'));
    await waitFor(() => expect(hash()).toBe('#/hoc'));
    expect(JSON.parse(mem.get('vitasr2.settings')!).lang).toBe('ja');
  });

  // @ac S1-AC05
  it('manifest đang tải có 6 dòng khung xương; lỗi thì hiện trạng thái lỗi', async () => {
    const src = new ControlledSource();
    src.hang = true;
    const a = await renderApp('#/chon-ngon-ngu', { source: src, wait: false });
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(6);
    a.unmount();
    const bad = new ControlledSource();
    bad.fail = true;
    await renderApp('#/chon-ngon-ngu', { source: bad });
    expect(screen.getByText('Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.')).toBeInTheDocument();
  });

  // @ac S1-AC07
  it('Tiếng Anh qua bước chọn bộ; Tiếng Nhật vào thẳng', async () => {
    const { mem } = await renderApp('#/chon-ngon-ngu');
    fireEvent.click(screen.getByText('Tiếng Anh'));
    expect(screen.getByText('Học tiếng Anh với bộ nào?')).toBeInTheDocument();
    const packs = screen.getAllByRole('button').map((b) => b.querySelector('.s1__pack-name')?.textContent).filter(Boolean);
    expect(packs).toEqual(['Global English', 'English Fluency']);
    expect(screen.getByText(/Câu theo chủ đề và tình huống, có giải thích cách dùng/)).toBeInTheDocument();
    expect(screen.getByText('Câu luyện nói theo mẫu câu.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Quay lại/ }));
    expect(screen.getByText('Bạn muốn học ngôn ngữ nào?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Tiếng Anh'));
    fireEvent.click(screen.getByText('Global English'));
    await waitFor(() => expect(hash()).toBe('#/hoc'));
    const s = JSON.parse(mem.get('vitasr2.settings')!);
    expect(s.lang).toBe('en');
    expect(s.packByLang.en).toBe('global');
  });
});

describe('APP Khung app', () => {
  // @ac APP-AC04
  it('màn toàn trang không có thanh tab và thanh trên cùng; S3 có nút Thoát', async () => {
    const a = await renderApp('#/chon-ngon-ngu');
    expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).toBeNull();
    expect(a.container.querySelector('.topbar')).toBeNull();
    a.unmount();
    const b = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    await settle();
    expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).toBeNull();
    expect(b.container.querySelector('.topbar')).toBeNull();
    expect(screen.getByRole('button', { name: 'Thoát' })).toBeInTheDocument();
    b.unmount();
    const c = await renderApp('#/kiem-tra', { seed: settingsSeed() });
    expect(screen.queryByRole('navigation', { name: 'Điều hướng chính' })).toBeNull();
    expect(c.container.querySelector('.topbar')).toBeNull();
  });

  // @ac APP-AC18
  it('nút Quay lại trang học: có ở T1 đến T4 và S1 bước 1, không có ở S1 bước 2, S3, S5, S8; bấm khi có phiên dở không hỏi', async () => {
    const link = () => screen.queryByRole('link', { name: 'Quay lại trang học' });
    expect(HOST_URL).toBe('https://language.pomaskhoahocnaobo.com/');
    for (const h of ['#/hoc', '#/luyen-tap', '#/thu-vien', '#/tien-bo']) {
      const r = await renderApp(h, { seed: settingsSeed() });
      expect(link()).toHaveAttribute('href', HOST_URL);
      r.unmount();
    }
    const s1 = await renderApp('#/chon-ngon-ngu');
    expect(link()).toHaveAttribute('href', HOST_URL);
    fireEvent.click(screen.getByText('Tiếng Anh'));
    expect(screen.getByText('Học tiếng Anh với bộ nào?')).toBeInTheDocument();
    expect(link()).toBeNull();
    s1.unmount();
    for (const h of ['#/phien-hoc?nguon=lo-trinh', '#/kiem-tra', '#/cai-dat']) {
      const r = await renderApp(h, { seed: settingsSeed() });
      await settle();
      expect(link()).toBeNull();
      r.unmount();
    }
    // Có phiên dở: bấm liên kết là rời app ngay, không có sheet xác nhận nào.
    const open = { id: 'sx', nguon: 'lo-trinh', itemIds: [1, 257, 769, 770, 258, 771, 772, 1793], startedAt: NOW, position: 3, step: 'ghi-nho', params: {} };
    await renderApp('#/hoc', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [open], attempts: [], items: {} } } });
    expect(screen.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' })).toBeInTheDocument();
    const stop = (e: Event) => e.preventDefault();
    document.addEventListener('click', stop);
    const clicked = fireEvent.click(link()!);
    document.removeEventListener('click', stop);
    await settle();
    expect(clicked).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(hash()).toBe('#/hoc');
  });

  // @ac APP-AC05
  it('route không hợp lệ chuyển về #/hoc hoặc #/chon-ngon-ngu', async () => {
    const a = await renderApp('#/khong-co');
    expect(hash()).toBe('#/chon-ngon-ngu');
    a.unmount();
    await renderApp('#/khong-co', { seed: settingsSeed() });
    expect(hash()).toBe('#/hoc');
  });

  // @ac APP-AC06
  it('localStorage trống mở vào S1; đã chọn ngôn ngữ thì mở thẳng T1', async () => {
    const a = await renderApp('');
    expect(hash()).toBe('#/chon-ngon-ngu');
    expect(screen.getByText('Bạn muốn học ngôn ngữ nào?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Tiếng Nhật'));
    await waitFor(() => expect(hash()).toBe('#/hoc'));
    const saved = a.mem.get('vitasr2.settings')!;
    a.unmount();
    await renderApp('', { seed: { 'vitasr2.settings': saved } });
    expect(hash()).toBe('#/hoc');
    expect(screen.getByRole('button', { name: /Tiếng Nhật/ })).toBeInTheDocument();
  });

  // @ac APP-AC08, APP-AC17
  it('sheet Đổi ngôn ngữ: hai dòng cho Tiếng Anh, đổi bộ về #/hoc, tiến độ cũ còn nguyên', async () => {
    const { mem } = await renderApp('#/hoc', { seed: settingsSeed({ packByLang: { en: 'global' } }) });
    await settle();
    expect(screen.getByRole('button', { name: /Tiếng Anh/ })).toHaveTextContent('Global English');
    mem.set('vitasr2.progress.global.en', JSON.stringify({ schema: 1, sessions: [], attempts: [], items: { 1: { status: 'da-hoc', streak: 2, due: NOW + 3 * DAY, lastAt: NOW } } }));
    // Mở sheet từ một khu khác T1 để kiểm chọn bộ thì về #/hoc.
    window.location.hash = '#/thu-vien';
    await settle();
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Anh/ }));
    const dialog = screen.getByRole('dialog', { name: 'Đổi ngôn ngữ hoặc bộ nội dung' });
    expect(within(dialog).getByText('Tiếng Anh, Global English')).toBeInTheDocument();
    expect(within(dialog).getByText('Tiếng Anh, English Fluency')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByText('Tiếng Anh, English Fluency'));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(hash()).toBe('#/hoc');
    expect(screen.getByRole('button', { name: /Tiếng Anh/ })).toHaveTextContent('English Fluency');
    expect(screen.getByText('I want to...', { selector: '.card__source' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Anh/ }));
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Nhật'));
    await waitFor(() => expect(screen.getByRole('button', { name: /Tiếng Nhật/ })).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Tiếng Nhật/ })).not.toHaveTextContent('English Fluency');
    expect(JSON.parse(mem.get('vitasr2.progress.global.en')!).items[1].streak).toBe(2);
  });

  // @ac APP-AC10
  it('nguồn lỗi hiện câu lỗi và nút Thử lại; Thử lại khi nguồn ổn thì hiện dữ liệu', async () => {
    const src = new ControlledSource();
    src.fail = true;
    await renderApp('#/hoc', { source: src, seed: settingsSeed() });
    expect(screen.getByText('Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.')).toBeInTheDocument();
    src.fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Thử lại' }));
    await waitFor(() => expect(screen.getByText('I want to...', { selector: '.card__source' })).toBeInTheDocument());
  });

  // @ac APP-AC11
  it('dải ngoại tuyến hiện khi mất mạng và ẩn khi có mạng lại', async () => {
    await renderApp('#/hoc', { seed: settingsSeed() });
    act(() => void window.dispatchEvent(new Event('offline')));
    expect(screen.getByText('Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy.')).toBeInTheDocument();
    act(() => void window.dispatchEvent(new Event('online')));
    expect(screen.queryByText('Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy.')).toBeNull();
  });

  // @ac APP-AC11, DATA-AC07
  it('bộ nhớ trình duyệt bị chặn: có dải cảnh báo và vẫn học hết một phiên', async () => {
    const throwing = {
      getItem: () => null,
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {},
    } as unknown as Storage;
    await renderApp('#/chon-ngon-ngu', { backend: throwing });
    expect(
      screen.getByText('Trình duyệt đang chặn lưu tiến độ, tiến độ sẽ mất khi đóng app. Cho phép trang này lưu trên máy trong cài đặt trình duyệt rồi mở lại app.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText('Tiếng Nhật'));
    await waitFor(() => expect(hash()).toBe('#/hoc'));
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
    await renderApp('#/hoc', { source: new BadSource(), seed: settingsSeed() });
    expect(screen.getByText('Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  // @ac DATA-AC05
  it('nguồn tĩnh trỏ tới thư mục fixture chạy giống nguồn fixture', async () => {
    const { readFileSync } = await import('node:fs');
    const path = await import('node:path');
    const root = path.resolve(process.cwd(), 'fe/fixtures');
    const fetchImpl = (async (url: string) => {
      try {
        return new Response(readFileSync(path.join(root, url.replace(/^\.\//, ''))), { status: 200 });
      } catch {
        return new Response('', { status: 404 });
      }
    }) as unknown as typeof fetch;
    await renderApp('#/hoc', { source: new StaticFileSource('./data', fetchImpl), seed: settingsSeed() });
    await waitFor(() => expect(screen.getByText('I want to...', { selector: '.card__source' })).toBeInTheDocument());
  });
});

/** Đi hết phiên hiện tại: hiện câu, Tôi nhớ, chọn đúng ngay. */
export async function finishSession(opts: { review?: number[]; wrong?: number[]; hint?: number[] } = {}) {
  for (let i = 0; i < 80; i++) {
    if (screen.queryByText('Xong phiên học')) return;
    const cover = screen.queryByRole('button', { name: 'Nhấn để hiện câu gốc' });
    const pos = Number(screen.queryByText(/^Câu \d+\/\d+$/)?.textContent?.match(/Câu (\d+)/)?.[1] ?? 0);
    if (cover) {
      fireEvent.click(cover);
      fireEvent.click(screen.getByRole('button', { name: opts.review?.includes(pos) ? /Cần ôn lại/ : /Tôi nhớ/ }));
      await settle();
      continue;
    }
    const next = screen.queryByRole('button', { name: /^(Câu tiếp|Xem tổng kết)$/ });
    if (next) {
      fireEvent.click(next);
      await settle();
      continue;
    }
    if (opts.hint?.includes(pos) && screen.queryByRole('button', { name: 'Xem gợi ý' })) fireEvent.click(screen.getByRole('button', { name: 'Xem gợi ý' }));
    const choices = [...document.querySelectorAll<HTMLButtonElement>('.choice')];
    const meaning = choices.find((c) => c.dataset.correct === 'true');
    if (opts.wrong?.includes(pos)) fireEvent.click(choices.find((c) => c.dataset.correct !== 'true')!);
    fireEvent.click(meaning!);
    await settle();
  }
}

describe('T1 Học', () => {
  // @ac T1-AC01
  it('tiến độ trống: câu đầu của unit 1, có tên unit, ô đầu Đang học', async () => {
    const { container } = await renderApp('#/hoc', { seed: settingsSeed() });
    expect(screen.getByText('I want to...', { selector: '.card__source' })).toBeInTheDocument();
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByText('I want to...', { selector: '.t1__unit .src' })).toBeInTheDocument();
    expect(screen.getAllByText('Tôi muốn...').length).toBeGreaterThan(0);
    const cells = container.querySelectorAll('.strip__cell');
    expect(cells[0]).toHaveClass('strip__cell--dang');
    expect(screen.queryByText('Nhấn để hiện câu gốc')).toBeNull();
  });

  // @ac T1-AC03
  it('nút chính: Học 8 câu, Học 5 câu, Tiếp tục khi có phiên dở', async () => {
    const a = await renderApp('#/hoc', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle();
    expect(hash()).toMatch(/^#\/phien-hoc\?nguon=lo-trinh/);
    a.unmount();
    // Đã học hết 3 unit đầu: unit 4 còn 5 câu.
    const ids = [1, 257, 769, 770, 258, 771, 772, 1793, 2, 259, 773, 774, 260, 775, 776, 1794, 3, 261, 777, 778, 262, 779, 780, 1795];
    const items = Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 1, due: NOW + DAY, lastAt: NOW }]));
    const b = await renderApp('#/hoc', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [], attempts: [], items } } });
    expect(screen.getByRole('button', { name: 'Học 5 câu' })).toBeInTheDocument();
    b.unmount();
    const open = { id: 'sx', nguon: 'lo-trinh', itemIds: ids.slice(0, 8), startedAt: NOW, position: 3, step: 'ghi-nho', params: {} };
    await renderApp('#/hoc', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [open], attempts: [], items: {} } } });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' }));
    await settle();
    expect(screen.getByText('Câu 4/8')).toBeInTheDocument();
  });

  // @ac T1-AC04
  it('mục tiêu tuần tính phiên hoàn tất trong 7 ngày', async () => {
    const mk = (n: number, daysAgo: number) => Array.from({ length: n }, (_, i) => ({ id: `s${daysAgo}${i}`, nguon: 'lo-trinh', itemIds: [1], startedAt: NOW - daysAgo * DAY, completedAt: NOW - daysAgo * DAY, position: 1, step: 'ghi-nho' }));
    const a = await renderApp('#/hoc', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [...mk(3, 2), ...mk(2, 8)], attempts: [], items: {} } } });
    expect(screen.getByText('Tuần này: 3/5 phiên')).toBeInTheDocument();
    a.unmount();
    await renderApp('#/hoc', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [...mk(4, 1), ...mk(1, 6)], attempts: [], items: {} } } });
    expect(screen.getByText('Tuần này: đã đạt mục tiêu 5/5 phiên')).toBeInTheDocument();
  });

  // @ac T1-AC05, DATA-AC09
  it('dòng câu cần ôn chỉ hiện khi N > 0; chạm mở phiên ôn tập', async () => {
    const a = await renderApp('#/hoc', { seed: settingsSeed() });
    expect(screen.queryByText(/câu cần ôn hôm nay/)).toBeNull();
    a.unmount();
    const ids = [1, 257, 769, 770, 258, 771, 772, 1793, 2, 259, 773, 774];
    const items = Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 0, due: NOW - DAY, lastAt: NOW - DAY }]));
    await renderApp('#/hoc', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [], attempts: [], items } } });
    const link = screen.getByText('12 câu cần ôn hôm nay').closest('a')!;
    expect(screen.getByRole('link', { name: 'Luyện tập, 12 câu cần ôn' })).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe('#/phien-hoc?nguon=on-tap');
  });

  // @ac T1-AC06
  it('học hết lộ trình: đoạn thông báo và nút Mở Luyện tập', async () => {
    const all = (await new FixtureSource().getLanguageFile('fluency', 'en.json')) as { items: { id: number }[] };
    const items = Object.fromEntries(all.items.map((i) => [i.id, { status: 'da-hoc', streak: 3, due: NOW + 7 * DAY, lastAt: NOW }]));
    const { container } = await renderApp('#/hoc', { seed: { ...settingsSeed({ guideSeen: false }), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [], attempts: [], items } } });
    expect(container.querySelector('.card')).toBeNull();
    expect(screen.getByText('Bạn đã học hết 29 câu tiếng Anh. Vào Luyện tập để ôn lại.')).toBeInTheDocument();
    expect(screen.queryByText(/Bước 1\/3/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Mở Luyện tập' }));
    await settle();
    expect(hash()).toBe('#/luyen-tap');
  });

  // @ac T1-AC08
  it('vuốt và phím mũi tên không đổi câu', async () => {
    const { container } = await renderApp('#/hoc', { seed: settingsSeed() });
    const card = container.querySelector('.card')!;
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(card, { key: 'ArrowLeft' });
    fireEvent.pointerDown(card, { clientX: 300 });
    fireEvent.pointerMove(card, { clientX: 20 });
    fireEvent.pointerUp(card, { clientX: 20 });
    fireEvent.touchStart(card, { touches: [{ clientX: 300, clientY: 10 }] });
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 10, clientY: 10 }] });
    expect(screen.getByText('I want to...', { selector: '.card__source' })).toBeInTheDocument();
  });

  // @ac T1-AC10, DATA-AC18
  it('Global English có mã trình độ và tình huống; Fluency thì không', async () => {
    const a = await renderApp('#/hoc', { seed: settingsSeed({ packByLang: { en: 'global' } }) });
    expect(screen.getByText('Unit 1 · A1')).toBeInTheDocument();
    expect(screen.getByText('Find your classroom')).toBeInTheDocument();
    expect(a.container.querySelector('.t1__situation')).not.toBeNull();
    expect(screen.getByText(/^Cách dùng: /)).toBeInTheDocument();
    a.unmount();
    const b = await renderApp('#/hoc', { seed: settingsSeed() });
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(b.container.querySelector('.t1__situation')).toBeNull();
    expect(screen.queryByText(/^Cách dùng: /)).toBeNull();
  });
});

describe('S9 Hướng dẫn', () => {
  // @ac S9-AC01
  it('chọn ngôn ngữ lần đầu thì T1 hiện bước 1/3', async () => {
    await renderApp('#/chon-ngon-ngu');
    fireEvent.click(screen.getByText('Tiếng Nhật'));
    await waitFor(() => expect(screen.getByText('Bước 1/3')).toBeInTheDocument());
    expect(screen.getByText('Đây là câu bạn sẽ học. Nút Nghe sẽ đọc to câu này cho bạn.')).toBeInTheDocument();
  });

  // @ac S9-AC03
  it('Tiếp, Bỏ qua, Esc, Bắt đầu học', async () => {
    const a = await renderApp('#/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(screen.getByText('Bước 2/3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
    a.unmount();
    const b = await renderApp('#/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
    b.unmount();
    await renderApp('#/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(screen.getByText('Ôn tập và kiểm tra nằm ở mục Luyện tập. Kết quả học nằm ở mục Tiến độ.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu học' }));
    await settle();
    expect(hash()).toMatch(/^#\/phien-hoc\?nguon=lo-trinh/);
  });

  // @ac S9-AC04
  it('đã bỏ qua thì không hiện lại, kể cả khi tải lại và đổi ngôn ngữ', async () => {
    const a = await renderApp('#/hoc', { seed: settingsSeed({ guideSeen: false }) });
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ qua' }));
    const saved = a.mem.get('vitasr2.settings')!;
    a.unmount();
    await renderApp('#/hoc', { seed: { 'vitasr2.settings': saved } });
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Anh/ }));
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Nhật'));
    await waitFor(() => expect(screen.getByRole('button', { name: /Tiếng Nhật/ })).toBeInTheDocument());
    expect(screen.queryByText(/Bước \d\/3/)).toBeNull();
  });
});
