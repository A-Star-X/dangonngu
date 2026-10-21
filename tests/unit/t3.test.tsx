import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { SEARCH_DEBOUNCE_MS } from '@/hooks/use-debounced-value';
import { PROGRESS_30, dialogs, here, progressSeed, publicSource, renderApp, settingsSeed, settle } from './helpers';
import { routerCalls } from './router-mock';
import { GLOBAL, chooseOption, drainHistory, optionsOf } from './page-helpers';

afterEach(drainHistory);

const rows = () => [...document.querySelectorAll<HTMLButtonElement>('ul button[data-id]')];
const rowIds = () => rows().map((r) => Number(r.dataset.id));
const search = () => screen.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' }) as HTMLInputElement;
const count = () => screen.getByTestId('t3-count').textContent;
async function type(value: string) {
  fireEvent.change(search(), { target: { value } });
  await settle(SEARCH_DEBOUNCE_MS + 20);
}

describe('T3 Thư viện', () => {
  // @ac T3-AC01
  it('trang 1 tối đa 32 dòng; mỗi dòng có id 4 chữ số, câu gốc, nghĩa và biểu tượng trạng thái đúng', async () => {
    // Tiến độ mẫu, bỏ 5 câu unit 4 để có đủ 3 trạng thái.
    const p = structuredClone(PROGRESS_30) as typeof PROGRESS_30 & { items: Record<string, unknown> };
    for (const id of [4, 263, 264, 781, 782]) delete p.items[id];
    await renderApp('/thu-vien?xem=cau', { seed: { ...settingsSeed(), ...progressSeed(p) } });
    expect(rows().length).toBe(29);
    expect(rows().length).toBeLessThanOrEqual(32);
    expect(count()).toBe('29 câu');
    const expected = (id: number) => ([3, 1793].includes(id) ? 'Cần ôn' : [4, 263, 264, 781, 782].includes(id) ? 'Chưa học' : 'Đã nhớ');
    for (const r of rows()) {
      const id = Number(r.dataset.id);
      expect(r.querySelector('span.num')!.textContent).toBe(String(id).padStart(4, '0'));
      const src = r.querySelector('span.src')!;
      expect(src.textContent!.length).toBeGreaterThan(0);
      expect(src).toHaveAttribute('lang', 'en');
      expect(r.querySelector('span.vi')).toHaveAttribute('lang', 'vi');
      expect(r.querySelector('[data-status] .sr-only')!.textContent).toBe(expected(id));
    }
    expect(new Set(rows().map((r) => r.querySelector('[data-status]')!.getAttribute('data-status')))).toEqual(new Set(['da-nho', 'can-on', 'chua-hoc']));
    expect(rowIds()).toEqual([...rowIds()].sort((a, b) => a - b));
  });

  // @ac T3-AC03
  it('gõ BOOK: hiện câu chứa book, route có q, tải lại giữ từ khóa, nút xóa hiện lại toàn bộ', async () => {
    const r = await renderApp('/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    expect(rows().length).toBe(24);
    await type('BOOK');
    expect(rows().length).toBe(3);
    for (const row of rows()) expect(row.textContent!.toLowerCase()).toContain('book');
    expect(here()).toBe('/thu-vien?xem=cau&q=BOOK');
    r.unmount();
    await renderApp('/thu-vien?xem=cau&q=BOOK', { seed: settingsSeed(GLOBAL) });
    expect(search().value).toBe('BOOK');
    expect(rows().length).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa từ khóa' }));
    await settle(SEARCH_DEBOUNCE_MS + 20);
    expect(search().value).toBe('');
    expect(rows().length).toBe(24);
    expect(here()).toBe('/thu-vien?xem=cau');
  });

  // @ac T3-AC04
  it('lọc Unit 2 và Chưa học, thêm từ khóa thì thu hẹp tiếp; nhãn bộ lọc hiện giá trị', async () => {
    const learned = { status: 'da-hoc', streak: 1, due: Date.UTC(2026, 9, 20), lastAt: Date.UTC(2026, 9, 7) };
    const p = { schema: 1, sessions: [], attempts: [], items: { 2: learned, 259: learned } };
    await renderApp('/thu-vien?xem=cau', { seed: { ...settingsSeed(), ...progressSeed(p) } });
    await chooseOption(/^Unit/, /^Unit 2:/);
    expect(rowIds()).toEqual([2, 259, 260, 773, 774, 775, 776, 1794]);
    expect(here()).toBe('/thu-vien?xem=cau&unit=2');
    await chooseOption(/^Trạng thái/, 'Chưa học');
    expect(rowIds()).toEqual([260, 773, 774, 775, 776, 1794]);
    await type('ask');
    expect(rowIds()).toEqual([773, 774]);
    expect(screen.getByRole('combobox', { name: /^Unit/ })).toHaveTextContent("Unit 2: I'd like to...");
    expect(screen.getByRole('combobox', { name: /^Trạng thái/ })).toHaveTextContent('Chưa học');
  });

  // @ac T3-AC05
  it('phân trang: Trước khóa ở trang 1, Sau khóa ở trang cuối, đổi bộ lọc về trang 1, một trang thì không có phân trang', async () => {
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed(), source: await publicSource() });
    const pager = () => screen.getByRole('navigation', { name: 'Phân trang' });
    expect(rows().length).toBe(32);
    expect(within(pager()).getByText('Trang 1/128')).toBeInTheDocument();
    expect(within(pager()).getByRole('button', { name: 'Trước' })).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(within(pager()).getByRole('button', { name: 'Sau' }));
    await settle();
    expect(within(pager()).getByText('Trang 2/128')).toBeInTheDocument();
    expect(here()).toBe('/thu-vien?xem=cau&trang=2');
    expect(rowIds()[0]).toBe(33);
    await chooseOption(/^Trạng thái/, 'Chưa học');
    expect(within(pager()).getByText('Trang 1/128')).toBeInTheDocument();
    expect(here()).toBe('/thu-vien?xem=cau');
    await type('help');
    expect(within(pager()).getByText('Trang 1/3')).toBeInTheDocument();
    fireEvent.click(within(pager()).getByRole('button', { name: 'Sau' }));
    await settle();
    fireEvent.click(within(pager()).getByRole('button', { name: 'Sau' }));
    await settle();
    expect(within(pager()).getByText('Trang 3/3')).toBeInTheDocument();
    expect(rows().length).toBe(83 - 64);
    expect(within(pager()).getByRole('button', { name: 'Sau' })).toHaveAttribute('aria-disabled', 'true');
    await type('home');
    expect(rows().length).toBeLessThanOrEqual(32);
    expect(screen.queryByRole('navigation', { name: 'Phân trang' })).toBeNull();
  });

  // @ac T3-AC06
  it('chạm dòng 257: sheet Câu 0257 có thẻ câu, unit, trạng thái, lần học gần nhất; Học câu này mở phiên một câu', async () => {
    await renderApp('/thu-vien?xem=cau', { seed: { ...settingsSeed(), ...progressSeed() } });
    fireEvent.click(document.querySelector('button[data-id="257"]')!);
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Câu 0257' });
    const card = within(dialog).getByTestId('sentence-card');
    expect(within(card).getByText('muốn biết...')).toHaveAttribute('lang', 'vi');
    expect(within(card).getByText('want to know...')).toHaveAttribute('lang', 'en');
    expect(dialog).toHaveTextContent('Unit 1: I want to...');
    const status = within(dialog).getByTestId('detail-status');
    expect(status).toHaveTextContent('Đã nhớ');
    expect(status).toHaveTextContent('Học lần cuối: 2 ngày trước');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Học câu này' }));
    await settle(50);
    expect(routerCalls.at(-1)).toMatchObject({ kind: 'push', href: '/phien-hoc?nguon=cau&id=257' });
    expect(dialogs()).toHaveLength(0);
    expect(screen.getByText('Câu 1/8')).toBeInTheDocument();
  });

  // @ac T3-AC07
  it('không có kết quả: đúng câu thông báo; Xóa tìm kiếm và bộ lọc đưa về danh sách đầy đủ', async () => {
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed() });
    await chooseOption(/^Trạng thái/, 'Đã nhớ');
    await type('xyzxyz');
    expect(screen.getByText('Không có câu nào khớp với tìm kiếm và bộ lọc hiện tại.')).toBeInTheDocument();
    expect(rows()).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tìm kiếm và bộ lọc' }));
    await settle(SEARCH_DEBOUNCE_MS + 20);
    expect(rows().length).toBe(29);
    expect(search().value).toBe('');
    expect(screen.getByRole('combobox', { name: /^Trạng thái/ })).toHaveTextContent('Tất cả');
    expect(here()).toBe('/thu-vien?xem=cau');
  });

  // @ac T3-AC09
  it('Global English có bộ lọc Chủ đề; English Fluency thì không', async () => {
    const r = await renderApp('/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    await chooseOption(/^Chủ đề/, /^Trường học/);
    expect(rows().length).toBe(8);
    expect(rowIds()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(screen.getByRole('combobox', { name: /^Chủ đề/ })).toHaveTextContent('Trường học');
    r.unmount();
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed() });
    expect(screen.queryByRole('combobox', { name: /^Chủ đề/ })).toBeNull();
    expect(screen.queryByRole('combobox', { name: /^Trình độ/ })).toBeNull();
  });

  // @ac T3-AC10
  it('Trình độ có A1 và B2; chọn B2 còn 8 câu của B2-89; danh sách Chủ đề có ô tìm và số câu', async () => {
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    const levels = await optionsOf(/^Trình độ/);
    expect(levels).toEqual(['Tất cả', 'A1', 'B2']);
    expect(levels).not.toContain('A2');
    await chooseOption(/^Trình độ/, 'B2');
    expect(rows().length).toBe(8);
    expect(rowIds()[0]).toBe(3009);
    fireEvent.click(screen.getByRole('combobox', { name: /^Chủ đề/ }));
    await settle();
    const list = screen.getByRole('listbox');
    const find = screen.getByRole('searchbox', { name: 'Tìm chủ đề' });
    expect(document.activeElement).toBe(find);
    expect(within(list).getAllByText('8 câu')).toHaveLength(3);
    fireEvent.change(find, { target: { value: 'trường' } });
    await settle();
    expect(within(screen.getByRole('listbox')).getAllByText('8 câu')).toHaveLength(1);
    // Bàn phím: Enter chọn lựa chọn đang trỏ.
    fireEvent.keyDown(find, { key: 'Enter' });
    await settle();
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('combobox', { name: /^Chủ đề/ })).toHaveTextContent('Trường học');
  });
});

describe('FND-16 chờ ngừng gõ ở T3', () => {
  // @ac FND-AC20
  it('chữ trong ô đổi ngay khi gõ; danh sách, số kết quả và route chỉ đổi sau 300 ms ngừng gõ', async () => {
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    expect(count()).toBe('24 câu');
    fireEvent.change(search(), { target: { value: 'BOO' } });
    expect(search().value).toBe('BOO');
    await settle(200);
    fireEvent.change(search(), { target: { value: 'BOOK' } });
    expect(search().value).toBe('BOOK');
    await settle(200);
    // 400 ms từ lần gõ đầu nhưng chỉ 200 ms từ lần gõ cuối: chưa lọc.
    expect(count()).toBe('24 câu');
    expect(rows()).toHaveLength(24);
    expect(here()).toBe('/thu-vien?xem=cau');
    await settle(150);
    expect(count()).toBe('3 câu');
    expect(rows()).toHaveLength(3);
    expect(here()).toBe('/thu-vien?xem=cau&q=BOOK');
  });
});

describe('APP và DATA qua Thư viện', () => {
  // @ac APP-AC16
  it('mở sheet Chi tiết câu rồi mở sheet Đổi ngôn ngữ: lúc nào cũng chỉ có một sheet', async () => {
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed() });
    let max = 0;
    const obs = new MutationObserver(() => (max = Math.max(max, dialogs().length)));
    obs.observe(document.body, { childList: true, subtree: true });
    fireEvent.click(rows()[0]);
    await settle();
    expect(screen.getByRole('dialog')).toHaveAccessibleName(/^Câu /);
    fireEvent.click(screen.getByTestId('language-button'));
    await settle();
    obs.disconnect();
    expect(dialogs()).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Đổi ngôn ngữ hoặc bộ nội dung');
    expect(max).toBe(1);
  });

  // @ac DATA-AC18
  it('Global English: Cách dùng, tình huống, mã trình độ, bộ lọc Chủ đề', async () => {
    const g = await renderApp('/hoc', { seed: settingsSeed(GLOBAL) });
    const card = screen.getByTestId('sentence-card');
    expect(within(card).getByRole('link', { name: 'Unit 1 · A1' })).toBeInTheDocument();
    expect(within(card).getByText('Bạn mới đến trường và hỏi một bạn học về phòng học tiếng Anh.')).toHaveAttribute('lang', 'vi');
    expect(within(card).getByText(/^Cách dùng: /)).toBeInTheDocument();
    g.unmount();
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    expect(screen.getByRole('combobox', { name: /^Chủ đề/ })).toBeInTheDocument();
    fireEvent.click(rows()[0]);
    await settle();
    expect(within(screen.getByRole('dialog')).getByText(/^Cách dùng: /)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Unit 1 · A1: Find your classroom');
  });

  // @ac DATA-AC18
  it('English Fluency không có Cách dùng, tình huống, mã trình độ, bộ lọc Chủ đề', async () => {
    const f = await renderApp('/hoc', { seed: settingsSeed() });
    const card = screen.getByTestId('sentence-card');
    expect(within(card).getByRole('link', { name: 'Unit 1' })).toBeInTheDocument();
    // Đầu thẻ chỉ có tên unit, title và translation; không có dòng tình huống.
    expect(card.querySelectorAll('.border-b p.vi')).toHaveLength(1);
    expect(screen.queryByText(/^Cách dùng: /)).toBeNull();
    f.unmount();
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed() });
    expect(screen.queryByRole('combobox', { name: /^Chủ đề/ })).toBeNull();
    fireEvent.click(rows()[0]);
    await settle();
    expect(within(screen.getByRole('dialog')).queryByText(/^Cách dùng: /)).toBeNull();
    expect(screen.getByRole('dialog')).toHaveTextContent('Unit 1: I want to...');
    expect(screen.getByRole('dialog')).not.toHaveTextContent(/Unit 1 · /);
  });
});

describe('T3 ô tìm theo route', () => {
  // @ac T3-AC03
  it('route đổi từ chỗ khác thì ô tìm theo route', async () => {
    await renderApp('/thu-vien?xem=cau&q=book', { seed: settingsSeed(GLOBAL) });
    expect(rows().length).toBe(3);
    window.history.pushState(null, '', '/thu-vien?xem=cau');
    await settle(50);
    expect(search().value).toBe('');
    await settle(SEARCH_DEBOUNCE_MS + 20);
    expect(rows().length).toBe(24);
    expect(here()).toBe('/thu-vien?xem=cau');
  });
});
