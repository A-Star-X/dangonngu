import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { NOW, PROGRESS_30, here, progressSeed, renderApp, settingsSeed, settle } from './helpers';
import { routerCalls } from './router-mock';
import { DAY, GLOBAL, KEY, drainHistory, finishSession, savedProgress, stripStates } from './page-helpers';

// Thư viện cách xem Unit (T3-08 đến T3-10), S10 Chi tiết Unit và T1 nối tới Unit.

afterEach(drainHistory);

const U1 = [1, 257, 769, 770, 258, 771, 772, 1793];
const U2 = [2, 259, 773, 774, 260, 775, 776, 1794];
const known = { status: 'da-hoc', streak: 1, due: NOW + 5 * DAY, lastAt: NOW - DAY };
const due = { status: 'da-hoc', streak: 0, due: NOW - DAY, lastAt: NOW - DAY };
/** Unit 2 đang học dở: 2 câu đã nhớ, 1 câu cần ôn, 5 câu chưa học. */
const partial = { schema: 1, sessions: [], attempts: [], items: { 2: known, 259: known, 773: due } };

const unitCards = () => [...document.querySelectorAll<HTMLAnchorElement>('[data-testid="unit-card"]')];
const card = (so: number) => document.querySelector<HTMLAnchorElement>(`[data-testid="unit-card"][data-so="${so}"]`)!;
const cellsOf = (el: Element) => [...el.querySelectorAll('li[data-state]')].map((c) => c.getAttribute('data-state'));
const unitHref = (so: number) => `/thu-vien/unit?so=${so}`;

describe('T3 cách xem Unit', () => {
  // @ac T3-AC11
  it('mặc định là cách xem Unit; chọn Câu thì route có xem=cau; tải lại giữ cách xem', async () => {
    const r = await renderApp('/thu-vien', { seed: settingsSeed() });
    expect(screen.getByRole('heading', { level: 1, name: 'Thư viện' })).toBeInTheDocument();
    const views = () => screen.getByRole('group', { name: 'Cách xem' });
    expect(within(views()).getByRole('button', { name: 'Xem theo unit' })).toHaveAttribute('aria-pressed', 'true');
    expect(unitCards().length).toBe(4);
    expect(document.querySelector('button[data-id]')).toBeNull();
    fireEvent.click(within(views()).getByRole('button', { name: 'Xem theo câu' }));
    await settle();
    expect(here()).toBe('/thu-vien?xem=cau');
    expect(document.querySelectorAll('button[data-id]').length).toBeGreaterThan(0);
    expect(unitCards()).toHaveLength(0);
    r.unmount();
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed() });
    expect(within(views()).getByRole('button', { name: 'Xem theo câu' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' })).toBeInTheDocument();
  });

  // @ac T3-AC12
  it('dòng unit có dải 8 ô và số câu đã nhớ đúng tiến độ; unit chưa học không có số; dòng là liên kết tới S10', async () => {
    await renderApp('/thu-vien', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(unitCards().length).toBeLessThanOrEqual(24);
    expect(cellsOf(card(2))).toEqual(['nho', 'nho', 'can-on', 'chua', 'chua', 'chua', 'chua', 'chua']);
    expect(card(2).querySelector('span.num')!.textContent).toBe('2/8 câu đã nhớ');
    expect(card(1).querySelector('span.num')!.textContent).toBe('8 câu');
    expect(card(1).textContent).not.toMatch(/\d+\/\d+/);
    expect(cellsOf(card(1))).toEqual(Array(8).fill('chua'));
    expect(card(2)).toHaveAttribute('href', unitHref(2));
    expect(within(card(2)).getByText("I'd like to...")).toHaveAttribute('lang', 'en');
    fireEvent.click(card(2));
    await settle(30);
    expect(here()).toBe(unitHref(2));
    expect(screen.getByTestId('s10-counts')).toBeInTheDocument();
  });

  // @ac T3-AC13
  it('dòng tổng quan đúng số; Global English có nút trình độ, mặc định trình độ đang học, chọn B2 chỉ còn unit B2', async () => {
    const r = await renderApp('/thu-vien', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(screen.getByTestId('t3-unit-summary').textContent).toBe('4 unit · đã học 0 · đang học dở 1');
    expect(screen.queryByRole('group', { name: 'Trình độ' })).toBeNull();
    r.unmount();
    const learnedU1 = Object.fromEntries(U1.map((id) => [id, known]));
    const g = await renderApp('/thu-vien', { seed: { ...settingsSeed(GLOBAL), ...progressSeed({ schema: 1, sessions: [], attempts: [], items: learnedU1 }, 'global') } });
    expect(screen.getByTestId('t3-unit-summary').textContent).toMatch(/^2 unit · đã học \d+ · đang học dở \d+$/);
    g.unmount();
    await renderApp('/thu-vien', { seed: settingsSeed(GLOBAL) });
    const levels = screen.getByRole('group', { name: 'Trình độ' });
    expect(within(levels).getAllByRole('button').map((b) => b.textContent)).toEqual(['A1', 'B2']);
    expect(within(levels).getByRole('button', { name: 'A1' })).toHaveAttribute('aria-pressed', 'true');
    expect(unitCards().map((a) => Number(a.dataset.so))).toEqual([1, 2]);
    fireEvent.click(within(levels).getByRole('button', { name: 'B2' }));
    await settle();
    expect(here()).toBe('/thu-vien?xem=unit&trinh-do=B2');
    expect(unitCards().map((a) => Number(a.dataset.so))).toEqual([377]);
    expect(screen.getByTestId('t3-unit-summary').textContent).toBe('1 unit · đã học 0 · đang học dở 0');
  });
});

describe('S10 Chi tiết Unit', () => {
  // @ac S10-AC01
  it('thuộc khu Thư viện; liên kết Thư viện về cách xem Unit; số unit sai thì về Thư viện', async () => {
    const r = await renderApp('/thu-vien', { seed: settingsSeed() });
    fireEvent.click(card(2));
    await settle(30);
    expect(here()).toBe(unitHref(2));
    expect(screen.getByRole('navigation', { name: 'Điều hướng chính' }).querySelector('a[data-nav="thu-vien"]')).toHaveAttribute('aria-current', 'page');
    const crumbs = screen.getByRole('navigation', { name: 'Đường dẫn' });
    expect(within(crumbs).getByRole('link', { name: 'Thư viện' })).toHaveAttribute('href', '/thu-vien');
    expect(within(crumbs).getByText('Unit 2')).toHaveAttribute('aria-current', 'page');
    fireEvent.click(within(crumbs).getByRole('link', { name: 'Thư viện' }));
    await settle(30);
    expect(here()).toBe('/thu-vien');
    expect(screen.getByRole('button', { name: 'Xem theo unit' })).toHaveAttribute('aria-pressed', 'true');
    r.unmount();
    routerCalls.length = 0;
    await renderApp('/thu-vien/unit?so=9999', { seed: settingsSeed() });
    await settle(30);
    expect(here()).toBe('/thu-vien');
    // Thay route, không thêm mục lịch sử.
    expect(routerCalls.filter((c) => c.kind === 'push')).toHaveLength(0);
  });

  // @ac S10-AC02
  it('Global English: Unit n · trình độ, tiêu đề màn là title có lang, translation và situation', async () => {
    await renderApp('/thu-vien/unit?so=1', { seed: settingsSeed(GLOBAL) });
    const crumbs = screen.getByRole('navigation', { name: 'Đường dẫn' });
    expect(within(crumbs).getByText('Unit 1 · A1')).toHaveAttribute('aria-current', 'page');
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Find your classroom');
    expect(h1).toHaveAttribute('lang', 'en');
    expect(screen.getByText('Tìm đúng phòng học')).toHaveAttribute('lang', 'vi');
    expect(screen.getByText('Bạn mới đến trường và hỏi một bạn học về phòng học tiếng Anh.')).toBeInTheDocument();
  });

  // @ac S10-AC03
  it('dải 8 ô và dòng đếm đúng trạng thái; bỏ phần có số 0', async () => {
    const r = await renderApp('/thu-vien/unit?so=2', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(screen.getByTestId('s10-counts').textContent).toBe('Đã nhớ 2 · Cần ôn 1 · Chưa học 5');
    expect(stripStates()).toEqual(['nho', 'nho', 'can-on', 'chua', 'chua', 'chua', 'chua', 'chua']);
    r.unmount();
    await renderApp('/thu-vien/unit?so=1', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(screen.getByTestId('s10-counts').textContent).toBe('Chưa học 8');
  });

  // @ac S10-AC04
  it('Học unit này mở phiên nguon=unit đúng các câu; thoát thì về S10; nhớ hết thì Ôn lại; Kiểm tra nhanh mở đúng unit', async () => {
    const r = await renderApp('/thu-vien/unit?so=2', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học unit này' }));
    await settle(30);
    expect(routerCalls.at(-1)).toMatchObject({ kind: 'push', href: '/phien-hoc?nguon=unit&so=2' });
    expect(here()).toMatch(/^\/phien-hoc\?nguon=unit&so=2&phien=/);
    const s = savedProgress(r.mem).sessions.at(-1);
    expect(s.nguon).toBe('unit');
    expect(s.itemIds).toEqual(U2);
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dừng' }));
    await settle(30);
    expect(here()).toBe(unitHref(2));
    r.unmount();
    await drainHistory();
    const all = { schema: 1, sessions: [], attempts: [], items: Object.fromEntries(U2.map((id) => [id, known])) };
    await renderApp('/thu-vien/unit?so=2', { seed: { ...settingsSeed(), ...progressSeed(all) } });
    expect(screen.getByRole('button', { name: 'Ôn lại unit này' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Học unit này' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra nhanh unit này' }));
    await settle(30);
    expect(here()).toBe('/kiem-tra?unit=2');
  });

  // @ac S10-AC05
  it('danh sách đúng các câu của unit; chạm dòng mở sheet Câu [id]', async () => {
    await renderApp('/thu-vien/unit?so=2', { seed: settingsSeed() });
    const list = screen.getByRole('region', { name: 'Các câu trong unit (8)' });
    const ids = [...list.querySelectorAll<HTMLElement>('button[data-id]')].map((b) => Number(b.dataset.id));
    expect(ids).toEqual(U2);
    fireEvent.click(list.querySelector<HTMLElement>('button[data-id="259"]')!);
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Câu 0259' });
    expect(within(dialog).getByTestId('sentence-card')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Học câu này' })).toBeInTheDocument();
  });

  // @ac S10-AC06
  it('unit đầu không có liên kết trước, unit cuối không có liên kết sau', async () => {
    const r = await renderApp('/thu-vien/unit?so=1', { seed: settingsSeed() });
    const nav = () => screen.getByRole('navigation', { name: 'Unit trước và sau' });
    expect(within(nav()).getAllByRole('link').map((a) => a.textContent)).toEqual(['Unit 2']);
    expect(within(nav()).getByRole('link', { name: 'Unit 2' })).toHaveAttribute('href', unitHref(2));
    fireEvent.click(within(nav()).getByRole('link', { name: 'Unit 2' }));
    await settle(30);
    expect(here()).toBe(unitHref(2));
    expect(within(nav()).getAllByRole('link').map((a) => a.textContent)).toEqual(['Unit 1', 'Unit 3']);
    r.unmount();
    await renderApp('/thu-vien/unit?so=4', { seed: settingsSeed() });
    expect(within(nav()).getAllByRole('link').map((a) => a.textContent)).toEqual(['Unit 3']);
  });

  // @ac S10-AC07
  it('hoàn tất phiên nguon=unit thì T4 ghi nguồn Học theo unit', async () => {
    const r = await renderApp('/phien-hoc?nguon=unit&so=3', { seed: { ...settingsSeed(), ...progressSeed(PROGRESS_30) } });
    await finishSession();
    expect(screen.getByText('Xong phiên học')).toBeInTheDocument();
    const saved = savedProgress(r.mem);
    expect(saved.sessions.at(-1)).toMatchObject({ nguon: 'unit' });
    r.unmount();
    await drainHistory();
    await renderApp('/tien-do?khoang=1', { seed: { ...settingsSeed(), [KEY]: saved } });
    const first = screen.getAllByTestId('t4-session')[0];
    expect(first.querySelectorAll('td')[1]).toHaveTextContent('Học theo unit');
  });
});

describe('T1 nối tới Unit', () => {
  /** Đã học hết unit 1, đang học unit 2. */
  const onUnit2 = { schema: 1, sessions: [], attempts: [], items: Object.fromEntries(U1.map((id) => [id, known])) };

  // @ac T1-AC11
  it('dòng Unit n trên thẻ là liên kết tới Chi tiết Unit của unit đang học', async () => {
    await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed(onUnit2) } });
    const link = within(screen.getByTestId('sentence-card')).getByRole('link', { name: 'Unit 2' });
    expect(link).toHaveAttribute('href', unitHref(2));
    fireEvent.click(link);
    await settle(30);
    expect(here()).toBe(unitHref(2));
  });

  // @ac T1-AC12
  it('Unit tiếp theo có đúng các unit sau unit đang học; Xem tất cả unit mở Thư viện; unit cuối thì không có khối', async () => {
    const r = await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed(onUnit2) } });
    const block = screen.getByRole('region', { name: 'Unit tiếp theo' });
    expect([...block.querySelectorAll<HTMLAnchorElement>('[data-testid="unit-card"]')].map((a) => a.getAttribute('href'))).toEqual([unitHref(3), unitHref(4)]);
    expect(within(block).getByRole('link', { name: 'Xem tất cả unit' })).toHaveAttribute('href', '/thu-vien');
    r.unmount();
    const upTo3 = { schema: 1, sessions: [], attempts: [], items: Object.fromEntries([...U1, ...U2, 3, 261, 777, 778, 262, 779, 780, 1795].map((id) => [id, known])) };
    await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed(upTo3) } });
    expect(within(screen.getByTestId('sentence-card')).getByRole('link', { name: 'Unit 4' })).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Unit tiếp theo' })).toBeNull();
  });

  // @ac T1-AC13
  it('Tiến độ của bạn đúng số câu, thanh và số unit; có cả khi đã học hết lộ trình', async () => {
    const r = await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed(onUnit2) } });
    const block = screen.getByRole('region', { name: 'Tiến độ của bạn' });
    expect(within(block).getByTestId('t1-learned').textContent).toBe('8/29 câu');
    const bar = within(block).getByRole('progressbar', { name: 'Số câu đã học' });
    expect(bar).toHaveAttribute('aria-valuenow', '8');
    expect(bar).toHaveAttribute('aria-valuemax', '29');
    expect((bar.firstElementChild as HTMLElement).style.width).toBe(`${(8 / 29) * 100}%`);
    expect(within(block).getByTestId('t1-units').textContent).toBe('1 unit đã học');
    expect(within(block).getByRole('link', { name: 'Xem tiến độ' })).toHaveAttribute('href', '/tien-do');
    r.unmount();
    await renderApp('/hoc', { seed: { ...settingsSeed(), ...progressSeed(PROGRESS_30) } });
    expect(screen.getByRole('button', { name: 'Mở Luyện tập' })).toBeInTheDocument();
    expect(screen.getByTestId('t1-learned').textContent).toBe('29/29 câu');
    expect(screen.getByTestId('t1-units').textContent).toBe('4 unit đã học');
  });
});

describe('APP-13 không dùng liên kết neo', () => {
  // @ac APP-AC23
  it('mã nguồn src không có href bắt đầu bằng #', async () => {
    const { readdirSync, readFileSync, statSync } = await import('node:fs');
    const { join } = await import('node:path');
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.(tsx?|html)$/.test(f)) files.push(p);
      }
    };
    walk('src');
    const bad = files.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/href=\{?\s*["'`]#[^"'`]*["'`]/g)].map((m) => `${f}: ${m[0]}`));
    expect(files.length).toBeGreaterThan(20);
    expect(bad).toEqual([]);
  });
});
