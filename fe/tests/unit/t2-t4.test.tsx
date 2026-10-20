import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { parseHash } from '../../src/app/router';
import { FixtureSource, loadCatalog, loadLanguageData, searchItems } from '../../src/data';
import { NOW, SO_LIEU_30, hash, progressSeed, publicSource, renderApp, settingsSeed, settle } from './helpers';

const GLOBAL = { packByLang: { en: 'global' } };
const due = (ids: number[]) => ({
  schema: 1,
  sessions: [],
  attempts: [],
  items: Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 0, due: NOW - 3600000, lastAt: NOW - 3600000 }])),
});
const U1 = [1, 257, 769, 770, 258, 771, 772, 1793];
const U2 = [2, 259, 773, 774, 260, 775, 776, 1794];

async function openKeyword() {
  fireEvent.click(screen.getByRole('button', { name: /Học theo từ khóa/ }));
  await settle();
  return screen.getByRole('dialog', { name: 'Học theo từ khóa' });
}

describe('T2 Luyện tập', () => {
  // @ac T2-AC02
  it('12 câu cần ôn: mục hiện 12, chạm mở ôn tập; 0 câu: khóa và đổi mô tả', async () => {
    const r = await renderApp('#/luyen-tap', { seed: { ...settingsSeed(), ...progressSeed(due([...U1, ...U2.slice(0, 4)])) } });
    const row = screen.getByTestId('t2-on-tap');
    expect(row).toHaveTextContent('Ôn tập hôm nay');
    expect(within(row).getByText('12')).toBeInTheDocument();
    expect(row).not.toHaveAttribute('aria-disabled');
    fireEvent.click(row);
    expect(hash()).toBe('#/phien-hoc?nguon=on-tap');
    r.unmount();
    await renderApp('#/luyen-tap', { seed: settingsSeed() });
    const empty = screen.getByTestId('t2-on-tap');
    expect(empty).toHaveAttribute('aria-disabled', 'true');
    expect(empty).toHaveTextContent('Hôm nay không có câu nào cần ôn.');
    fireEvent.click(empty);
    expect(hash()).toBe('#/luyen-tap');
  });

  // @ac T2-AC03
  it('gõ "dat phong": sau 250 ms hiện số câu theo DATA-12 và tối đa 5 câu; chip điền ô tìm; Học 8 câu đầu mở đúng route', async () => {
    const source = await publicSource();
    const d = await loadLanguageData(source, await loadCatalog(source), 'en', 'global');
    const expected = searchItems(d, 'dat phong').length;
    expect(expected).toBeGreaterThan(5);
    await renderApp('#/luyen-tap', { seed: settingsSeed(GLOBAL), source });
    const dialog = await openKeyword();
    const input = within(dialog).getByRole('searchbox', { name: 'Từ khóa' });
    expect(input).toHaveAttribute('placeholder', 'Ví dụ: đặt phòng, sân bay');
    fireEvent.change(input, { target: { value: 'dat phong' } });
    await settle(120);
    expect(within(dialog).queryByText(/^Tìm thấy/)).toBeNull();
    await settle(200);
    expect(within(dialog).getByText(`Tìm thấy ${expected} câu`)).toBeInTheDocument();
    expect(dialog.querySelectorAll('.kw__preview > li')).toHaveLength(5);
    fireEvent.click(within(dialog).getByRole('button', { name: 'Học 8 câu đầu' }));
    const r = parseHash(hash());
    expect(r.name).toBe('phien-hoc');
    expect(r.params).toEqual({ nguon: 'tu-khoa', q: 'dat phong', nhom: '1' });
  });

  // @ac T2-AC03
  it('từ khóa chỉ khớp 1 đến 7 câu: nút là "Học N câu" và mở đúng route', async () => {
    const source = new FixtureSource();
    const d = await loadLanguageData(source, await loadCatalog(source), 'en', 'fluency');
    const n = searchItems(d, 'rather').length;
    expect(n).toBeGreaterThanOrEqual(1);
    expect(n).toBeLessThanOrEqual(7);
    await renderApp('#/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    fireEvent.change(within(dialog).getByRole('searchbox', { name: 'Từ khóa' }), { target: { value: 'rather' } });
    await settle(320);
    expect(within(dialog).getByText(`Tìm thấy ${n} câu`)).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Học 8 câu đầu' })).toBeNull();
    fireEvent.click(within(dialog).getByRole('button', { name: `Học ${n} câu` }));
    expect(parseHash(hash()).params).toEqual({ nguon: 'tu-khoa', q: 'rather', nhom: '1' });
  });

  // @ac T2-AC03
  it('chạm chip "sân bay" điền vào ô tìm', async () => {
    await renderApp('#/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    fireEvent.click(within(dialog).getByRole('button', { name: 'sân bay' }));
    await settle();
    expect(within(dialog).getByRole('searchbox', { name: 'Từ khóa' })).toHaveValue('sân bay');
  });

  // @ac T2-AC04
  it('Kiểm tra nhanh mở #/kiem-tra với unit đang học', async () => {
    const r = await renderApp('#/luyen-tap', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra nhanh/ }));
    expect(hash()).toBe('#/kiem-tra?unit=1');
    r.unmount();
    const learned = Object.fromEntries(U1.map((id) => [id, { status: 'da-hoc', streak: 1, due: NOW + 86400000, lastAt: NOW }]));
    await renderApp('#/luyen-tap', { seed: { ...settingsSeed(), ...progressSeed({ schema: 1, sessions: [], attempts: [], items: learned }) } });
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra nhanh/ }));
    expect(hash()).toBe('#/kiem-tra?unit=2');
    await settle();
    expect(screen.getByText(/Unit 2/)).toBeInTheDocument();
  });

  // @ac T2-AC05
  it('không có kết quả: đúng câu thông báo và nút Học 8 câu đầu bị khóa', async () => {
    await renderApp('#/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    fireEvent.change(within(dialog).getByRole('searchbox', { name: 'Từ khóa' }), { target: { value: 'xyzxyz' } });
    await settle(320);
    expect(within(dialog).getByText('Không có câu nào chứa "xyzxyz". Thử từ khác bằng tiếng Việt hoặc tiếng Anh.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Học 8 câu đầu' })).toHaveAttribute('aria-disabled', 'true');
  });

  // @ac T2-AC07
  it('Global English: chip là chủ đề theo số câu giảm dần, tối đa 6; English Fluency: 4 chip cố định', async () => {
    const src = new FixtureSource();
    const g = await loadLanguageData(src, await loadCatalog(src), 'en', 'global');
    const counts = new Map<string, number>();
    for (const it of g.items) counts.set(it.topic!, (counts.get(it.topic!) ?? 0) + 1);
    const expected = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi')).slice(0, 6).map((e) => e[0]);
    const r = await renderApp('#/luyen-tap', { seed: settingsSeed(GLOBAL) });
    let dialog = await openKeyword();
    const chips = () => [...dialog.querySelectorAll('.kw__chips button')].map((b) => b.textContent);
    expect(chips()).toEqual(expected);
    r.unmount();
    await renderApp('#/luyen-tap', { seed: settingsSeed() });
    dialog = await openKeyword();
    expect(chips()).toEqual(['đặt phòng', 'ăn uống', 'sân bay', 'mua sắm']);
  });
});

const stat = (id: string) => screen.getByTestId(id).textContent;

describe('T4 Tiến độ với tiến độ mẫu 30 ngày', () => {
  const seed = { ...settingsSeed(), ...progressSeed() };

  // @ac T4-AC01
  it('mặc định 7 ngày; chọn 30 ngày thì route có khoang=30 và số liệu đổi; tải lại giữ lựa chọn', async () => {
    const r = await renderApp('#/tien-bo', { seed });
    expect(screen.getByRole('button', { name: '7 ngày' })).toHaveAttribute('aria-pressed', 'true');
    expect(stat('t4-sessions')).toBe(String(SO_LIEU_30.ranges['7'].sessions));
    fireEvent.click(screen.getByRole('button', { name: '30 ngày' }));
    await settle();
    expect(hash()).toBe('#/tien-bo?khoang=30');
    expect(stat('t4-sessions')).toBe(String(SO_LIEU_30.ranges['30'].sessions));
    r.unmount();
    await renderApp('#/tien-bo?khoang=30', { seed });
    expect(screen.getByRole('button', { name: '30 ngày' })).toHaveAttribute('aria-pressed', 'true');
    expect(stat('t4-sessions')).toBe(String(SO_LIEU_30.ranges['30'].sessions));
  });

  // @ac T4-AC02
  it('ba chỉ số khớp số liệu tính tay ở cả 3 khoảng; số cần ôn bằng nhau và bằng T1', async () => {
    for (const k of ['1', '7', '30'] as const) {
      const r = await renderApp(`#/tien-bo?khoang=${k}`, { seed });
      expect([stat('t4-sessions'), stat('t4-items'), stat('t4-due')]).toEqual([
        String(SO_LIEU_30.ranges[k].sessions),
        String(SO_LIEU_30.ranges[k].items),
        String(SO_LIEU_30.dueToday),
      ]);
      r.unmount();
    }
    await renderApp('#/hoc', { seed });
    expect(screen.getByText(`${SO_LIEU_30.dueToday} câu cần ôn hôm nay`)).toBeInTheDocument();
  });

  // @ac T4-AC03
  it('mục tiêu tuần giống T1 ở mọi khoảng; đạt mục tiêu thì thanh màu --known', async () => {
    const g = SO_LIEU_30.weeklyGoal;
    for (const k of ['1', '7', '30']) {
      const r = await renderApp(`#/tien-bo?khoang=${k}`, { seed });
      expect(stat('t4-goal')).toBe(`${g.done}/${g.goal} phiên`);
      expect(document.querySelector('.t4__bar')).toHaveClass('t4__bar--reached');
      r.unmount();
    }
    const t1 = await renderApp('#/hoc', { seed });
    expect(screen.getByText(`Tuần này: đã đạt mục tiêu ${g.done}/${g.goal} phiên`)).toBeInTheDocument();
    t1.unmount();
    await renderApp('#/tien-bo', { seed: { ...settingsSeed({ weeklyGoal: 10 }), ...progressSeed() } });
    expect(stat('t4-goal')).toBe(`${g.done}/10 phiên`);
    expect(document.querySelector('.t4__bar')).not.toHaveClass('t4__bar--reached');
  });

  // @ac T4-AC04
  it('7 ngày 7 cột, 30 ngày 30 cột, 1 ngày không có biểu đồ; bảng ẩn đúng giá trị', async () => {
    for (const k of ['7', '30'] as const) {
      const r = await renderApp(`#/tien-bo?khoang=${k}`, { seed });
      expect(screen.getAllByTestId('t4-col')).toHaveLength(Number(k));
      const cells = [...screen.getByTestId('t4-table').querySelectorAll('tbody td')].map((td) => Number(td.textContent));
      expect(cells).toEqual(SO_LIEU_30.ranges[k].chart);
      const labels = [...document.querySelectorAll('.chart__label')].map((l) => l.textContent).filter(Boolean);
      expect(labels).toEqual(k === '7' ? SO_LIEU_30.ranges['7'].axis : SO_LIEU_30.ranges['30'].axisEvery5);
      // Cột hôm nay là cột cuối, khác màu.
      const today = [...document.querySelectorAll('.chart__hit')].filter((b) => b.classList.contains('is-today'));
      expect(today).toHaveLength(1);
      expect(today[0]).toHaveAccessibleName('Thứ Năm, 8/10: 5 câu');
      r.unmount();
    }
    await renderApp('#/tien-bo?khoang=1', { seed });
    expect(screen.queryByTestId('t4-chart')).toBeNull();
    expect(screen.queryByTestId('t4-table')).toBeNull();
  });

  // @ac T4-AC06
  it('lịch ôn khớp giá trị tính tay; câu quá hạn tính vào Hôm nay', async () => {
    await renderApp('#/tien-bo', { seed });
    expect([stat('t4-today'), stat('t4-tomorrow'), stat('t4-next7')]).toEqual([
      `${SO_LIEU_30.schedule.today} câu`,
      `${SO_LIEU_30.schedule.tomorrow} câu`,
      `${SO_LIEU_30.schedule.next7} câu`,
    ]);
  });

  // @ac T4-AC07
  it('danh sách phiên mới nhất trước, đúng nhãn nguồn, 20 dòng rồi Xem thêm', async () => {
    await renderApp('#/tien-bo?khoang=30', { seed });
    const items = () => [...screen.getByTestId('t4-session-list').querySelectorAll(':scope > li')];
    expect(items()).toHaveLength(20);
    expect(items().map((li) => li.querySelector('.t4__session-src')!.textContent)).toEqual(SO_LIEU_30.sessionList30.labelsInOrder.slice(0, 20));
    expect(items()[0].querySelector('.t4__session-time')!.textContent).toBe(SO_LIEU_30.sessionList30.first.time);
    expect(items()[1].querySelector('.t4__session-time')!.textContent).toBe(SO_LIEU_30.sessionList30.second.time);
    expect(items()[2].querySelector('.t4__session-time')!.textContent).toBe('19:00, 7/10');
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }));
    await settle();
    expect(items()).toHaveLength(SO_LIEU_30.sessionList30.total);
    expect(items().map((li) => li.querySelector('.t4__session-src')!.textContent)).toEqual(SO_LIEU_30.sessionList30.labelsInOrder);
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
  });

  // @ac T4-AC08
  it('chạm cột ngày có 2 phiên: sheet đúng thứ và ngày, 2 phiên, đúng danh sách câu', async () => {
    const src = new FixtureSource();
    const d = await loadLanguageData(src, await loadCatalog(src), 'en', 'fluency');
    await renderApp('#/tien-bo', { seed });
    fireEvent.click(screen.getByRole('button', { name: 'Thứ Năm, 8/10: 5 câu' }));
    await settle();
    const dialog = screen.getByRole('dialog', { name: SO_LIEU_30.dayToday.title });
    expect(dialog.querySelectorAll('.t4__session')).toHaveLength(SO_LIEU_30.dayToday.sessions);
    const texts = [...within(dialog).getByTestId('t4-day-items').querySelectorAll('li .src')].map((s) => s.textContent);
    expect(texts).toEqual(SO_LIEU_30.dayToday.itemIds.map((id) => d.byId.get(id)!.en));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: /^Thứ Sáu, 2\/10/ }));
    await settle();
    const oct2 = screen.getByRole('dialog', { name: SO_LIEU_30.dayOct2.title });
    expect(oct2.querySelectorAll('.t4__session')).toHaveLength(SO_LIEU_30.dayOct2.sessions);
    expect(within(oct2).getByTestId('t4-day-items').querySelectorAll('li')).toHaveLength(SO_LIEU_30.dayOct2.itemCount);
  });

  // @ac T4-AC09
  it('tiến độ trống: chỉ có bộ chọn khoảng, đoạn thông báo và nút Học 8 câu', async () => {
    await renderApp('#/tien-bo', { seed: settingsSeed() });
    expect(screen.getByRole('group', { name: 'Khoảng thời gian' })).toBeInTheDocument();
    expect(screen.getByText('Bạn chưa hoàn thành phiên học nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến độ.')).toBeInTheDocument();
    expect(screen.queryByTestId('t4-sessions')).toBeNull();
    expect(screen.queryByText('Lịch ôn tập')).toBeNull();
    expect(screen.queryByText(/Mục tiêu mỗi tuần/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    expect(hash()).toBe('#/phien-hoc?nguon=lo-trinh');
  });
});

describe('DATA-07 một khái niệm cần ôn', () => {
  // @ac DATA-AC09
  it('số câu cần ôn hôm nay ở T1, T2, T4 bằng nhau và bằng số câu Cần ôn ở T3', async () => {
    const seed = { ...settingsSeed(), ...progressSeed() };
    const n = SO_LIEU_30.dueToday;
    let r = await renderApp('#/hoc', { seed });
    expect(screen.getByText(`${n} câu cần ôn hôm nay`)).toBeInTheDocument();
    r.unmount();
    r = await renderApp('#/luyen-tap', { seed });
    expect(within(screen.getByTestId('t2-on-tap')).getByText(String(n))).toBeInTheDocument();
    r.unmount();
    r = await renderApp('#/tien-bo', { seed });
    expect(stat('t4-due')).toBe(String(n));
    expect(stat('t4-today')).toBe(`${n} câu`);
    r.unmount();
    await renderApp('#/thu-vien?xem=cau', { seed });
    fireEvent.click(screen.getByRole('button', { name: 'Trạng thái' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Cần ôn' }));
    await settle();
    expect(screen.getByText(`${n} câu`)).toBeInTheDocument();
    expect([...document.querySelectorAll<HTMLElement>('.lib-row')].map((r) => Number(r.dataset.id))).toEqual(SO_LIEU_30.library.canOnIds);
  });
});

describe('T2 bấm ngay sau khi gõ', () => {
  // @ac T2-AC03
  it('bấm Học 8 câu đầu trước khi hết 250 ms thì dùng từ khóa đang có trong ô', async () => {
    await renderApp('#/luyen-tap', { seed: settingsSeed() });
    const dialog = await openKeyword();
    const input = within(dialog).getByRole('searchbox', { name: 'Từ khóa' });
    fireEvent.change(input, { target: { value: 'want' } });
    await settle(320);
    fireEvent.change(input, { target: { value: 'hope' } });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Học 8 câu đầu' }));
    expect(parseHash(hash()).params).toEqual({ nguon: 'tu-khoa', q: 'hope', nhom: '1' });
  });
});
