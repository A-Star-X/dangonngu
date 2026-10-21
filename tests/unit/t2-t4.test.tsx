import { afterEach, describe, expect, it } from 'vitest';
import { act, fireEvent, renderHook, screen, within } from '@testing-library/react';
import { loadCatalog, loadLanguageData, searchItems } from '@/domain';
import { DEFAULT_DEBOUNCE_MS, SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value';
import { parseHref } from '@/lib/routes';
import { NOW, SO_LIEU_30, here, progressSeed, publicSource, query, renderApp, settingsSeed, settle } from './helpers';
import { routerCalls } from './router-mock';
import { GLOBAL, chooseOption, drainHistory, fixtureData } from './page-helpers';

afterEach(drainHistory);

const due = (ids: number[]) => ({
  schema: 1,
  sessions: [],
  attempts: [],
  items: Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 0, due: NOW - 3600000, lastAt: NOW - 3600000 }])),
});
const U1 = [1, 257, 769, 770, 258, 771, 772, 1793];
const U2 = [2, 259, 773, 774, 260, 775, 776, 1794];

/** Lần chuyển màn gần nhất bằng router (đường dẫn khác), trước khi màn mới tự thay route. */
const lastPush = () => parseHref(routerCalls.filter((c) => c.kind === 'push').at(-1)?.href ?? '/');

async function openKeyword() {
  fireEvent.click(screen.getByTestId('t2-tu-khoa'));
  await settle();
  return screen.getByRole('dialog', { name: 'Học theo từ khóa' });
}
const keywordBox = (dialog: HTMLElement) => within(dialog).getByRole('searchbox', { name: 'Từ khóa' }) as HTMLInputElement;
const learnButton = (dialog: HTMLElement) => within(dialog).getByRole('button', { name: /^Học (8 câu đầu|\d+ câu)$/ });

describe('T2 Luyện tập', () => {
  // @ac T2-AC02
  it('12 câu cần ôn: mục hiện 12, chạm mở ôn tập; 0 câu: khóa và đổi mô tả', async () => {
    const r = await renderApp('/luyen-tap', { seed: { ...settingsSeed(), ...progressSeed(due([...U1, ...U2.slice(0, 4)])) } });
    const row = screen.getByTestId('t2-on-tap');
    expect(row).toHaveTextContent('Ôn tập hôm nay');
    expect(within(row).getByText('12')).toBeInTheDocument();
    expect(row).not.toHaveAttribute('aria-disabled');
    fireEvent.click(row);
    await settle(30);
    expect(lastPush()).toMatchObject({ name: 'phien-hoc', params: { nguon: 'on-tap' } });
    expect(window.location.pathname).toBe('/phien-hoc');
    expect(screen.getByText('Câu 1/8')).toBeInTheDocument();
    r.unmount();
    await drainHistory();
    routerCalls.length = 0;
    await renderApp('/luyen-tap', { seed: settingsSeed() });
    const empty = screen.getByTestId('t2-on-tap');
    expect(empty).toHaveAttribute('aria-disabled', 'true');
    expect(empty).toHaveTextContent('Hôm nay không có câu nào cần ôn.');
    fireEvent.click(empty);
    await settle(30);
    expect(here()).toBe('/luyen-tap');
    expect(routerCalls).toHaveLength(0);
  });

  // @ac T2-AC03
  it('gõ "dat phong": sau 300 ms hiện số câu theo DATA-12 và tối đa 5 câu; Học 8 câu đầu mở đúng route', async () => {
    const source = await publicSource();
    const d = await loadLanguageData(source, await loadCatalog(source), 'en', 'global');
    const expected = searchItems(d, 'dat phong').length;
    expect(expected).toBeGreaterThan(5);
    await renderApp('/luyen-tap', { seed: settingsSeed(GLOBAL), source });
    const dialog = await openKeyword();
    const input = keywordBox(dialog);
    expect(input).toHaveAttribute('placeholder', 'Ví dụ: đặt phòng, sân bay');
    fireEvent.change(input, { target: { value: 'dat phong' } });
    await settle(150);
    expect(within(dialog).queryByText(/^Tìm thấy/)).toBeNull();
    await settle(200);
    expect(within(dialog).getByText(`Tìm thấy ${expected} câu`)).toBeInTheDocument();
    const preview = [...dialog.querySelectorAll('li > span.src')];
    expect(preview).toHaveLength(5);
    expect(preview.map((s) => s.textContent)).toEqual(searchItems(d, 'dat phong').slice(0, 5).map((x) => x.en));
    for (const s of preview) expect(s).toHaveAttribute('lang', 'en');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Học 8 câu đầu' }));
    await settle(30);
    expect(lastPush()).toMatchObject({ name: 'phien-hoc', params: { nguon: 'tu-khoa', q: 'dat phong', nhom: '1' } });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(query()).toMatchObject({ nguon: 'tu-khoa', q: 'dat phong', nhom: '1' });
  });

  // @ac T2-AC03
  it('từ khóa chỉ khớp 1 đến 7 câu: nút là "Học N câu" và mở đúng route', async () => {
    const d = await fixtureData();
    const n = searchItems(d, 'rather').length;
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(7);
    await renderApp('/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    fireEvent.change(keywordBox(dialog), { target: { value: 'rather' } });
    await settle(320);
    expect(within(dialog).getByText(`Tìm thấy ${n} câu`)).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Học 8 câu đầu' })).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: `Học ${n} câu` }));
    await settle(30);
    expect(lastPush().params).toEqual({ nguon: 'tu-khoa', q: 'rather', nhom: '1' });
  });

  // @ac T2-AC03
  it('chạm chip "sân bay" điền vào ô tìm', async () => {
    await renderApp('/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    fireEvent.click(within(within(dialog).getByRole('list', { name: 'Gợi ý' })).getByRole('button', { name: 'sân bay' }));
    await settle();
    expect(keywordBox(dialog)).toHaveValue('sân bay');
  });

  // @ac T2-AC04
  it('Kiểm tra nhanh mở /kiem-tra với unit đang học', async () => {
    const r = await renderApp('/luyen-tap', { seed: settingsSeed() });
    fireEvent.click(screen.getByTestId('t2-kiem-tra'));
    await settle(30);
    expect(here()).toBe('/kiem-tra?unit=1');
    r.unmount();
    await drainHistory();
    const learned = Object.fromEntries(U1.map((id) => [id, { status: 'da-hoc', streak: 1, due: NOW + 86400000, lastAt: NOW }]));
    await renderApp('/luyen-tap', { seed: { ...settingsSeed(), ...progressSeed({ schema: 1, sessions: [], attempts: [], items: learned }) } });
    fireEvent.click(screen.getByTestId('t2-kiem-tra'));
    await settle(30);
    expect(here()).toBe('/kiem-tra?unit=2');
    expect(screen.getByText('Kiểm tra nhanh · Unit 2')).toBeInTheDocument();
  });

  // @ac T2-AC05
  it('không có kết quả: đúng câu thông báo và nút Học 8 câu đầu bị khóa', async () => {
    await renderApp('/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    fireEvent.change(keywordBox(dialog), { target: { value: 'xyzxyz' } });
    await settle(320);
    expect(within(dialog).getByText('Không có câu nào chứa "xyzxyz". Thử từ khác bằng tiếng Việt hoặc tiếng Anh.')).toBeInTheDocument();
    const btn = within(dialog).getByRole('button', { name: 'Học 8 câu đầu' });
    expect(btn).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(btn);
    await settle(30);
    expect(here()).toBe('/luyen-tap');
    expect(screen.getByRole('dialog', { name: 'Học theo từ khóa' })).toBeInTheDocument();
  });

  // @ac T2-AC07
  it('Global English: chip là chủ đề theo số câu giảm dần, tối đa 6; English Fluency: 4 chip cố định', async () => {
    const g = await fixtureData('global');
    const counts = new Map<string, number>();
    for (const it of g.items) counts.set(it.topic!, (counts.get(it.topic!) ?? 0) + 1);
    const expected = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi')).slice(0, 6).map((e) => e[0]);
    const r = await renderApp('/luyen-tap', { seed: settingsSeed(GLOBAL) });
    let dialog = await openKeyword();
    const chips = () => within(within(dialog).getByRole('list', { name: 'Gợi ý' })).getAllByRole('button').map((b) => b.textContent);
    expect(chips()).toEqual(expected);
    expect(chips().length).toBeLessThanOrEqual(6);
    r.unmount();
    await renderApp('/luyen-tap', { seed: settingsSeed() });
    dialog = await openKeyword();
    expect(chips()).toEqual(['đặt phòng', 'ăn uống', 'sân bay', 'mua sắm']);
  });
});

describe('FND-16 chờ ngừng gõ ở T2', () => {
  // @ac FND-AC20
  it('chữ trong ô đổi ngay; số kết quả chỉ đổi sau 300 ms ngừng gõ; nút Học khóa trong lúc chờ', async () => {
    const d = await fixtureData();
    const want = searchItems(d, 'want').length;
    const rather = searchItems(d, 'rather').length;
    expect(want).not.toBe(rather);
    await renderApp('/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    const input = keywordBox(dialog);
    fireEvent.change(input, { target: { value: 'want' } });
    expect(input).toHaveValue('want');
    expect(learnButton(dialog)).toHaveAttribute('aria-disabled', 'true');
    await settle(SEARCH_DEBOUNCE_MS + 20);
    expect(within(dialog).getByText(`Tìm thấy ${want} câu`)).toBeInTheDocument();
    expect(learnButton(dialog)).not.toHaveAttribute('aria-disabled');
    // Gõ tiếp: ô đổi ngay, số kết quả còn là của từ cũ, nút khóa; bấm thì không mở phiên bằng từ cũ.
    fireEvent.change(input, { target: { value: 'rather' } });
    expect(input).toHaveValue('rather');
    await settle(150);
    expect(within(dialog).getByText(`Tìm thấy ${want} câu`)).toBeInTheDocument();
    expect(learnButton(dialog)).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(learnButton(dialog));
    await settle();
    expect(here()).toBe('/luyen-tap');
    expect(routerCalls).toHaveLength(0);
    // Gõ thêm trong lúc chờ thì đếm lại từ đầu.
    fireEvent.change(input, { target: { value: 'rathe' } });
    await settle(200);
    fireEvent.change(input, { target: { value: 'rather' } });
    await settle(200);
    expect(within(dialog).getByText(`Tìm thấy ${want} câu`)).toBeInTheDocument();
    await settle(150);
    expect(within(dialog).getByText(`Tìm thấy ${rather} câu`)).toBeInTheDocument();
    expect(learnButton(dialog)).toHaveAccessibleName(`Học ${rather} câu`);
    expect(learnButton(dialog)).not.toHaveAttribute('aria-disabled');
    fireEvent.click(learnButton(dialog));
    await settle(30);
    expect(lastPush().params).toEqual({ nguon: 'tu-khoa', q: 'rather', nhom: '1' });
  });

  // @ac FND-AC20
  it('useDebouncedValue không truyền thời gian thì chờ 3000 ms', async () => {
    expect(DEFAULT_DEBOUNCE_MS).toBe(3000);
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v), { initialProps: { v: 'a' } });
    rerender({ v: 'b' });
    await act(async () => void (await new Promise((r) => setTimeout(r, 400))));
    expect(result.current).toBe('a');
  });
});

const stat = (id: string) => screen.getByTestId(id).textContent;

describe('T4 Tiến độ với tiến độ mẫu 30 ngày', () => {
  const seed = { ...settingsSeed(), ...progressSeed() };

  // @ac T4-AC01
  it('mặc định 7 ngày; chọn 30 ngày thì route có khoang=30 và số liệu đổi; tải lại giữ lựa chọn', async () => {
    const r = await renderApp('/tien-do', { seed });
    const range = () => screen.getByRole('group', { name: 'Khoảng thời gian' });
    expect(within(range()).getAllByRole('button').map((b) => b.textContent)).toEqual(['1 ngày', '7 ngày', '30 ngày']);
    expect(within(range()).getByRole('button', { name: '7 ngày' })).toHaveAttribute('aria-pressed', 'true');
    expect(stat('t4-sessions')).toBe(String(SO_LIEU_30.ranges['7'].sessions));
    fireEvent.click(within(range()).getByRole('button', { name: '30 ngày' }));
    await settle();
    expect(here()).toBe('/tien-do?khoang=30');
    expect(stat('t4-sessions')).toBe(String(SO_LIEU_30.ranges['30'].sessions));
    r.unmount();
    await renderApp('/tien-do?khoang=30', { seed });
    expect(within(range()).getByRole('button', { name: '30 ngày' })).toHaveAttribute('aria-pressed', 'true');
    expect(stat('t4-sessions')).toBe(String(SO_LIEU_30.ranges['30'].sessions));
  });

  // @ac T4-AC02
  it('ba chỉ số khớp số liệu tính tay ở cả 3 khoảng; số cần ôn bằng nhau và bằng T1', async () => {
    for (const k of ['1', '7', '30'] as const) {
      const r = await renderApp(`/tien-do?khoang=${k}`, { seed });
      expect([stat('t4-sessions'), stat('t4-items'), stat('t4-due')]).toEqual([
        String(SO_LIEU_30.ranges[k].sessions),
        String(SO_LIEU_30.ranges[k].items),
        String(SO_LIEU_30.dueToday),
      ]);
      r.unmount();
    }
    await renderApp('/hoc', { seed });
    expect(screen.getByText(`${SO_LIEU_30.dueToday} câu cần ôn hôm nay`)).toBeInTheDocument();
  });

  // @ac T4-AC03
  it('mục tiêu tuần giống T1 ở mọi khoảng; đạt mục tiêu thì thanh màu --known', async () => {
    const g = SO_LIEU_30.weeklyGoal;
    const bar = () => screen.getByRole('progressbar', { name: 'Mục tiêu mỗi tuần' });
    for (const k of ['1', '7', '30']) {
      const r = await renderApp(`/tien-do?khoang=${k}`, { seed });
      expect(stat('t4-goal')).toBe(`${g.done}/${g.goal} phiên`);
      expect(bar()).toHaveAttribute('data-reached', 'true');
      expect(bar().firstElementChild).toHaveClass('bg-success');
      r.unmount();
    }
    const t1 = await renderApp('/hoc', { seed });
    expect(screen.getByText(`Tuần này: đã đạt mục tiêu ${g.done}/${g.goal} phiên`)).toBeInTheDocument();
    t1.unmount();
    await renderApp('/tien-do', { seed: { ...settingsSeed({ weeklyGoal: 10 }), ...progressSeed() } });
    expect(stat('t4-goal')).toBe(`${g.done}/10 phiên`);
    expect(bar()).not.toHaveAttribute('data-reached');
    expect(bar().firstElementChild).not.toHaveClass('bg-success');
  });

  // @ac T4-AC04
  it('7 ngày 7 cột, 30 ngày 30 cột, 1 ngày không có biểu đồ; bảng ẩn đúng giá trị', async () => {
    for (const k of ['7', '30'] as const) {
      const r = await renderApp(`/tien-do?khoang=${k}`, { seed });
      const cols = screen.getAllByTestId('t4-col');
      expect(cols).toHaveLength(Number(k));
      const table = screen.getByTestId('t4-table');
      expect(table).toHaveClass('sr-only');
      const cells = [...table.querySelectorAll('tbody td')].map((td) => Number(td.textContent));
      expect(cells).toEqual(SO_LIEU_30.ranges[k].chart);
      const labels = cols.map((c) => c.lastElementChild!.textContent).filter(Boolean);
      expect(labels).toEqual(k === '7' ? SO_LIEU_30.ranges['7'].axis : SO_LIEU_30.ranges['30'].axisEvery5);
      // Cột hôm nay là cột cuối, khác màu.
      const today = [...screen.getByTestId('t4-chart').querySelectorAll('button[data-today]')];
      expect(today).toHaveLength(1);
      expect(today[0]).toHaveAccessibleName('Thứ Năm, 8/10: 5 câu');
      expect(today[0].firstElementChild).toHaveClass('bg-primary');
      expect(cols.at(-1)!.contains(today[0])).toBe(true);
      r.unmount();
    }
    await renderApp('/tien-do?khoang=1', { seed });
    expect(screen.queryByTestId('t4-chart')).toBeNull();
    expect(screen.queryByTestId('t4-table')).toBeNull();
  });

  // @ac T4-AC06
  it('lịch ôn khớp giá trị tính tay; câu quá hạn tính vào Hôm nay', async () => {
    await renderApp('/tien-do', { seed });
    expect([stat('t4-today'), stat('t4-tomorrow'), stat('t4-next7')]).toEqual([
      `${SO_LIEU_30.schedule.today} câu`,
      `${SO_LIEU_30.schedule.tomorrow} câu`,
      `${SO_LIEU_30.schedule.next7} câu`,
    ]);
  });

  // @ac T4-AC07
  it('danh sách phiên mới nhất trước, đúng nhãn nguồn, 20 dòng rồi Xem thêm', async () => {
    await renderApp('/tien-do?khoang=30', { seed });
    const rows = () => [...screen.getByTestId('t4-session-list').querySelectorAll<HTMLElement>('[data-testid="t4-session"]')];
    // Cột đầu có giờ và (chỉ hiện dưới sm) cách học; lấy phần giờ.
    const col = (row: HTMLElement, i: number) => (i === 0 ? row.querySelector('td')!.firstElementChild!.textContent : row.querySelectorAll('td')[i].textContent);
    expect(rows()).toHaveLength(20);
    expect(rows().map((r) => col(r, 1))).toEqual(SO_LIEU_30.sessionList30.labelsInOrder.slice(0, 20));
    expect(col(rows()[0], 0)).toBe(SO_LIEU_30.sessionList30.first.time);
    expect(col(rows()[1], 0)).toBe(SO_LIEU_30.sessionList30.second.time);
    expect(col(rows()[2], 0)).toBe('19:00, 7/10');
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }));
    await settle();
    expect(rows()).toHaveLength(SO_LIEU_30.sessionList30.total);
    expect(rows().map((r) => col(r, 1))).toEqual(SO_LIEU_30.sessionList30.labelsInOrder);
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
  });

  // @ac T4-AC08
  it('chạm cột ngày có 2 phiên: sheet đúng thứ và ngày, 2 phiên, đúng danh sách câu', async () => {
    const d = await fixtureData();
    await renderApp('/tien-do', { seed });
    fireEvent.click(screen.getByRole('button', { name: 'Thứ Năm, 8/10: 5 câu' }));
    await settle();
    const dialog = screen.getByRole('dialog', { name: SO_LIEU_30.dayToday.title });
    expect(dialog.querySelectorAll('[data-testid="t4-session"]')).toHaveLength(SO_LIEU_30.dayToday.sessions);
    const texts = [...within(dialog).getByTestId('t4-day-items').querySelectorAll('li span.src')].map((s) => s.textContent);
    expect(texts).toEqual(SO_LIEU_30.dayToday.itemIds.map((id) => d.byId.get(id)!.en));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: /^Thứ Sáu, 2\/10/ }));
    await settle();
    const oct2 = screen.getByRole('dialog', { name: SO_LIEU_30.dayOct2.title });
    expect(oct2.querySelectorAll('[data-testid="t4-session"]')).toHaveLength(SO_LIEU_30.dayOct2.sessions);
    expect(within(oct2).getByTestId('t4-day-items').querySelectorAll('li')).toHaveLength(SO_LIEU_30.dayOct2.itemCount);
  });

  // @ac T4-AC09
  it('tiến độ trống: chỉ có bộ chọn khoảng, đoạn thông báo và nút Học 8 câu', async () => {
    await renderApp('/tien-do', { seed: settingsSeed() });
    expect(screen.getByRole('group', { name: 'Khoảng thời gian' })).toBeInTheDocument();
    expect(screen.getByText('Bạn chưa hoàn thành phiên học nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến độ.')).toBeInTheDocument();
    expect(screen.queryByTestId('t4-sessions')).toBeNull();
    expect(screen.queryByText('Lịch ôn tập')).toBeNull();
    expect(screen.queryByText(/Mục tiêu mỗi tuần/)).toBeNull();
    expect(screen.queryByTestId('t4-chart')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    expect(lastPush()).toMatchObject({ name: 'phien-hoc', params: { nguon: 'lo-trinh' } });
  });
});

describe('DATA-07 một khái niệm cần ôn', () => {
  // @ac DATA-AC09
  it('số câu cần ôn hôm nay ở T1, T2, T4 bằng nhau và bằng số câu Cần ôn ở T3', async () => {
    const seed = { ...settingsSeed(), ...progressSeed() };
    const n = SO_LIEU_30.dueToday;
    let r = await renderApp('/hoc', { seed });
    expect(screen.getByText(`${n} câu cần ôn hôm nay`)).toBeInTheDocument();
    // Thanh bên ghi cùng số trên mục Luyện tập.
    expect(screen.getByRole('link', { name: new RegExp(`^Luyện tập\\s*,\\s*${n} câu cần ôn$`) })).toBeInTheDocument();
    r.unmount();
    r = await renderApp('/luyen-tap', { seed });
    expect(within(screen.getByTestId('t2-on-tap')).getByText(String(n))).toBeInTheDocument();
    r.unmount();
    r = await renderApp('/tien-do', { seed });
    expect(stat('t4-due')).toBe(String(n));
    expect(stat('t4-today')).toBe(`${n} câu`);
    r.unmount();
    await renderApp('/thu-vien?xem=cau', { seed });
    await chooseOption(/^Trạng thái/, 'Cần ôn');
    expect(screen.getByTestId('t3-count')).toHaveTextContent(`${n} câu`);
    expect([...document.querySelectorAll<HTMLElement>('button[data-id]')].map((b) => Number(b.dataset.id))).toEqual(SO_LIEU_30.library.canOnIds);
  });
});
