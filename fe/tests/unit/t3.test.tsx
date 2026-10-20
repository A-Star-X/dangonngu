import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { PROGRESS_30, dialogs, hash, progressSeed, publicSource, renderApp, settingsSeed, settle } from './helpers';

const rows = () => [...document.querySelectorAll<HTMLElement>('.lib-row')];
const rowIds = () => rows().map((r) => Number(r.dataset.id));
const search = () => screen.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' }) as HTMLInputElement;
async function type(value: string) {
  fireEvent.change(search(), { target: { value } });
  await settle(320);
}
async function pick(filter: string, option: string) {
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${filter}`) }));
  await settle();
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: new RegExp(`^${option.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }));
  await settle();
}
const GLOBAL = { packByLang: { en: 'global' } };

describe('T3 Thư viện', () => {
  // @ac T3-AC01
  it('trang 1 tối đa 32 dòng; mỗi dòng có id 4 chữ số, câu gốc, nghĩa và biểu tượng trạng thái đúng', async () => {
    // Tiến độ mẫu, bỏ 5 câu unit 4 để có đủ 3 trạng thái.
    const p = structuredClone(PROGRESS_30) as typeof PROGRESS_30 & { items: Record<string, unknown> };
    for (const id of [4, 263, 264, 781, 782]) delete p.items[id];
    await renderApp('#/thu-vien?xem=cau', { seed: { ...settingsSeed(), ...progressSeed(p) } });
    expect(rows().length).toBe(29);
    expect(rows().length).toBeLessThanOrEqual(32);
    expect(screen.getByText('29 câu')).toBeInTheDocument();
    const expected = (id: number) => ([3, 1793].includes(id) ? 'Cần ôn' : [4, 263, 264, 781, 782].includes(id) ? 'Chưa học' : 'Đã nhớ');
    for (const r of rows()) {
      const id = Number(r.dataset.id);
      expect(r.querySelector('.lib-row__id')!.textContent).toBe(String(id).padStart(4, '0'));
      expect(r.querySelector('.lib-row__src')!.textContent!.length).toBeGreaterThan(0);
      expect(r.querySelector('.lib-row__src')).toHaveAttribute('lang', 'en');
      expect(r.querySelector('.lib-row__vi')).toHaveAttribute('lang', 'vi');
      expect(r.querySelector('.lib-status .sr-only')!.textContent).toBe(expected(id));
    }
    expect(rowIds()).toEqual([...rowIds()].sort((a, b) => a - b));
  });

  // @ac T3-AC03
  it('gõ BOOK: hiện câu chứa book, route có q, tải lại giữ từ khóa, nút xóa hiện lại toàn bộ', async () => {
    const r = await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    expect(rows().length).toBe(24);
    await type('BOOK');
    expect(rows().length).toBe(3);
    for (const row of rows()) expect(row.textContent!.toLowerCase()).toContain('book');
    expect(hash()).toBe('#/thu-vien?xem=cau&q=BOOK');
    r.unmount();
    await renderApp('#/thu-vien?xem=cau&q=BOOK', { seed: settingsSeed(GLOBAL) });
    expect(search().value).toBe('BOOK');
    expect(rows().length).toBe(3);
    fireEvent.click(screen.getByRole('button', { name: 'Xóa từ khóa' }));
    await settle(320);
    expect(search().value).toBe('');
    expect(rows().length).toBe(24);
    expect(hash()).toBe('#/thu-vien?xem=cau');
  });

  // @ac T3-AC04
  it('lọc Unit 2 và Chưa học, thêm từ khóa thì thu hẹp tiếp; nhãn bộ lọc hiện giá trị', async () => {
    const learned = { status: 'da-hoc', streak: 1, due: Date.UTC(2026, 9, 20), lastAt: Date.UTC(2026, 9, 7) };
    const p = { schema: 1, sessions: [], attempts: [], items: { 2: learned, 259: learned } };
    await renderApp('#/thu-vien?xem=cau', { seed: { ...settingsSeed(), ...progressSeed(p) } });
    await pick('Unit', 'Unit 2');
    expect(rowIds()).toEqual([2, 259, 260, 773, 774, 775, 776, 1794]);
    expect(hash()).toBe('#/thu-vien?xem=cau&unit=2');
    await pick('Trạng thái', 'Chưa học');
    expect(rowIds()).toEqual([260, 773, 774, 775, 776, 1794]);
    await type('ask');
    expect(rowIds()).toEqual([773, 774]);
    expect(screen.getByRole('button', { name: /^Unit: Unit 2: I'd like to/ })).toHaveTextContent("Unit 2: I'd like to...");
    expect(screen.getByRole('button', { name: 'Trạng thái: Chưa học' })).toHaveTextContent('Chưa học');
  });

  // @ac T3-AC05
  it('phân trang: Trước khóa ở trang 1, Sau khóa ở trang cuối, đổi bộ lọc về trang 1, một trang thì không có phân trang', async () => {
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed(), source: await publicSource() });
    expect(rows().length).toBe(32);
    expect(screen.getByText('Trang 1/128')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Trước' })).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    await settle();
    expect(screen.getByText('Trang 2/128')).toBeInTheDocument();
    expect(rowIds()[0]).toBe(33);
    await pick('Trạng thái', 'Chưa học');
    expect(screen.getByText('Trang 1/128')).toBeInTheDocument();
    await type('help');
    expect(screen.getByText('Trang 1/3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Sau' }));
    await settle();
    expect(screen.getByText('Trang 3/3')).toBeInTheDocument();
    expect(rows().length).toBe(83 - 64);
    expect(screen.getByRole('button', { name: 'Sau' })).toHaveAttribute('aria-disabled', 'true');
    await type('home');
    expect(rows().length).toBe(32);
    expect(screen.queryByRole('navigation', { name: 'Phân trang' })).toBeNull();
  });

  // @ac T3-AC06
  it('chạm dòng 257: sheet Câu 0257 có thẻ câu, unit, trạng thái, lần học gần nhất; Học câu này mở phiên một câu', async () => {
    await renderApp('#/thu-vien?xem=cau', { seed: { ...settingsSeed(), ...progressSeed() } });
    fireEvent.click(document.querySelector('.lib-row[data-id="257"]')!);
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Câu 0257' });
    expect(within(dialog).getByText('muốn biết...')).toBeInTheDocument();
    expect(dialog.querySelector('.card')).not.toBeNull();
    expect(within(dialog).getByText('want to know...')).toBeInTheDocument();
    expect(dialog).toHaveTextContent("Unit 1: I want to...");
    expect(dialog).toHaveTextContent('Đã nhớ · Học lần cuối: 2 ngày trước');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Học câu này' }));
    expect(hash()).toBe('#/phien-hoc?nguon=cau&id=257');
    await settle(50);
    expect(dialogs()).toHaveLength(0);
    expect(screen.getByText('Câu 1/8')).toBeInTheDocument();
  });

  // @ac T3-AC07
  it('không có kết quả: đúng câu thông báo; Xóa tìm kiếm và bộ lọc đưa về danh sách đầy đủ', async () => {
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed() });
    await pick('Trạng thái', 'Đã nhớ');
    await type('xyzxyz');
    expect(screen.getByText('Không có câu nào khớp với tìm kiếm và bộ lọc hiện tại.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tìm kiếm và bộ lọc' }));
    await settle(320);
    expect(rows().length).toBe(29);
    expect(search().value).toBe('');
    expect(screen.getByRole('button', { name: 'Trạng thái' })).toBeInTheDocument();
  });

  // @ac T3-AC09
  it('Global English có bộ lọc Chủ đề; English Fluency thì không', async () => {
    const r = await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    await pick('Chủ đề', 'Trường học');
    expect(rows().length).toBe(8);
    expect(rowIds()).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    r.unmount();
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed() });
    expect(screen.queryByRole('button', { name: /^Chủ đề/ })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Trình độ/ })).toBeNull();
  });

  // @ac T3-AC10
  it('Trình độ có A1 và B2; chọn B2 còn 8 câu của B2-89; danh sách Chủ đề có ô tìm và số câu', async () => {
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    fireEvent.click(screen.getByRole('button', { name: 'Trình độ' }));
    await settle();
    const opts = within(screen.getByRole('dialog')).getAllByRole('button', { pressed: false }).concat(within(screen.getByRole('dialog')).getAllByRole('button', { pressed: true }));
    const labels = opts.map((b) => b.textContent).filter((t) => t && t !== '');
    expect(labels).toEqual(expect.arrayContaining(['Tất cả', 'A1', 'B2']));
    expect(labels).not.toContain('A2');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'B2' }));
    await settle();
    expect(rows().length).toBe(8);
    expect(rowIds()[0]).toBe(3009);
    fireEvent.click(screen.getByRole('button', { name: 'Chủ đề' }));
    await settle();
    const dlg = screen.getByRole('dialog', { name: 'Chủ đề' });
    expect(within(dlg).getByRole('searchbox', { name: 'Tìm chủ đề' })).toBeInTheDocument();
    expect(within(dlg).getAllByText('8 câu')).toHaveLength(3);
    fireEvent.change(within(dlg).getByRole('searchbox', { name: 'Tìm chủ đề' }), { target: { value: 'trường' } });
    await settle();
    expect(within(dlg).getAllByText('8 câu')).toHaveLength(1);
  });
});

describe('APP và DATA qua Thư viện', () => {
  // @ac APP-AC16
  it('mở sheet Chi tiết câu rồi mở sheet Đổi ngôn ngữ: lúc nào cũng chỉ có một sheet', async () => {
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed() });
    let max = 0;
    const obs = new MutationObserver(() => (max = Math.max(max, dialogs().length)));
    obs.observe(document.body, { childList: true, subtree: true });
    fireEvent.click(document.querySelector('.lib-row')!);
    await settle();
    expect(screen.getByRole('dialog')).toHaveAccessibleName(/^Câu /);
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Anh/, hidden: true }));
    await settle();
    obs.disconnect();
    expect(dialogs()).toHaveLength(1);
    expect(screen.getByRole('dialog')).toHaveAccessibleName('Đổi ngôn ngữ hoặc bộ nội dung');
    expect(max).toBe(1);
  });

  // @ac DATA-AC18
  it('Global English: Cách dùng, tình huống, mã trình độ, bộ lọc Chủ đề; English Fluency: không có và không lỗi', async () => {
    const g = await renderApp('#/hoc', { seed: settingsSeed(GLOBAL) });
    expect(screen.getByText('Unit 1 · A1')).toBeInTheDocument();
    expect(document.querySelector('.t1__situation')).not.toBeNull();
    expect(screen.getByText(/^Cách dùng: /)).toBeInTheDocument();
    g.unmount();
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed(GLOBAL) });
    expect(screen.getByRole('button', { name: 'Chủ đề' })).toBeInTheDocument();
    fireEvent.click(rows()[0]);
    await settle();
    expect(within(screen.getByRole('dialog')).getByText(/^Cách dùng: /)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveTextContent('Unit 1 · A1: Find your classroom');
  });

  // @ac DATA-AC18
  it('English Fluency không có Cách dùng, tình huống, mã trình độ, bộ lọc Chủ đề', async () => {
    const f = await renderApp('#/hoc', { seed: settingsSeed() });
    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(document.querySelector('.t1__situation')).toBeNull();
    expect(screen.queryByText(/^Cách dùng: /)).toBeNull();
    f.unmount();
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed() });
    expect(screen.queryByRole('button', { name: 'Chủ đề' })).toBeNull();
    fireEvent.click(rows()[0]);
    await settle();
    expect(within(screen.getByRole('dialog')).queryByText(/^Cách dùng: /)).toBeNull();
    expect(screen.getByRole('dialog')).toHaveTextContent('Unit 1: I want to...');
  });
});

describe('T3 ô tìm theo route', () => {
  // @ac T3-AC03
  it('route đổi từ chỗ khác (chạm lại tab Thư viện) thì ô tìm theo route', async () => {
    await renderApp('#/thu-vien?xem=cau&q=book', { seed: settingsSeed(GLOBAL) });
    expect(rows().length).toBe(3);
    window.location.hash = '#/thu-vien?xem=cau';
    await settle(50);
    expect(search().value).toBe('');
    await settle(320);
    expect(rows().length).toBe(24);
  });
});
