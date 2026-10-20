import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { NOW, PROGRESS_30, hash, progressSeed, renderApp, settingsSeed, settle } from './helpers';
import { finishSession } from './app.test';

// Đợt 5 việc 3: Thư viện cách xem Unit (T3-08 đến T3-10) và S10 Chi tiết Unit.

const DAY = 86400000;
const GLOBAL = { packByLang: { en: 'global' } };
const U2 = [2, 259, 773, 774, 260, 775, 776, 1794];
const known = { status: 'da-hoc', streak: 1, due: NOW + 5 * DAY, lastAt: NOW - DAY };
const due = { status: 'da-hoc', streak: 0, due: NOW - DAY, lastAt: NOW - DAY };
/** Unit 2 đang học dở: 2 câu đã nhớ, 1 câu cần ôn, 5 câu chưa học. */
const partial = { schema: 1, sessions: [], attempts: [], items: { 2: known, 259: known, 773: due } };

const unitRows = () => [...document.querySelectorAll<HTMLAnchorElement>('.unit-row')];
const row = (so: number) => document.querySelector<HTMLAnchorElement>(`.unit-row[data-so="${so}"]`)!;
const cellsOf = (el: Element) => [...el.querySelectorAll('.strip__cell')].map((c) => c.className.replace(/.*strip__cell--/, ''));

describe('T3 cách xem Unit', () => {
  // @ac T3-AC11
  it('mặc định là cách xem Unit; chọn Câu thì route có xem=cau; tải lại giữ cách xem', async () => {
    const r = await renderApp('#/thu-vien', { seed: settingsSeed() });
    expect(screen.getByRole('heading', { level: 1, name: 'Thư viện' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xem theo unit' })).toHaveAttribute('aria-pressed', 'true');
    expect(unitRows().length).toBe(4);
    expect(document.querySelector('.lib-row')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Xem theo câu' }));
    await settle();
    expect(hash()).toBe('#/thu-vien?xem=cau');
    expect(document.querySelectorAll('.lib-row').length).toBeGreaterThan(0);
    r.unmount();
    await renderApp('#/thu-vien?xem=cau', { seed: settingsSeed() });
    expect(screen.getByRole('button', { name: 'Xem theo câu' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('searchbox', { name: 'Tìm câu hoặc nghĩa' })).toBeInTheDocument();
  });

  // @ac T3-AC12
  it('dòng unit có dải 8 ô và số câu đã nhớ đúng tiến độ; unit chưa học không có số; dòng là liên kết tới S10', async () => {
    await renderApp('#/thu-vien', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(unitRows().length).toBeLessThanOrEqual(24);
    expect(cellsOf(row(2))).toEqual(['nho', 'nho', 'can-on', 'chua', 'chua', 'chua', 'chua', 'chua']);
    expect(row(2).querySelector('.unit-row__count')!.textContent).toBe('2/8 câu đã nhớ');
    expect(row(1).querySelector('.unit-row__count')).toBeNull();
    expect(cellsOf(row(1))).toEqual(Array(8).fill('chua'));
    expect(row(2)).toHaveAttribute('href', '#/unit?so=2');
    expect(within(row(2)).getByText("I'd like to...")).toHaveAttribute('lang', 'en');
  });

  // @ac T3-AC13
  it('dòng tổng quan đúng số; Global English có nút trình độ, mặc định trình độ đang học, chọn B2 chỉ còn unit B2', async () => {
    const r = await renderApp('#/thu-vien', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(screen.getByTestId('t3-unit-summary').textContent).toBe('4 unit · đã học 0 · đang học dở 1');
    expect(screen.queryByRole('group', { name: 'Trình độ' })).toBeNull();
    r.unmount();
    await renderApp('#/thu-vien', { seed: settingsSeed(GLOBAL) });
    const levels = screen.getByRole('group', { name: 'Trình độ' });
    expect(within(levels).getAllByRole('button').map((b) => b.textContent)).toEqual(['A1', 'B2']);
    expect(within(levels).getByRole('button', { name: 'A1' })).toHaveAttribute('aria-pressed', 'true');
    expect(unitRows().map((a) => Number(a.dataset.so))).toEqual([1, 2]);
    fireEvent.click(within(levels).getByRole('button', { name: 'B2' }));
    await settle();
    expect(hash()).toBe('#/thu-vien?xem=unit&trinh-do=B2');
    expect(unitRows().map((a) => Number(a.dataset.so))).toEqual([377]);
    expect(screen.getByTestId('t3-unit-summary').textContent).toBe('1 unit · đã học 0 · đang học dở 0');
  });
});

describe('S10 Chi tiết Unit', () => {
  // @ac S10-AC01
  it('thuộc khu Thư viện; liên kết Thư viện về cách xem Unit; số unit sai thì về Thư viện', async () => {
    const r = await renderApp('#/unit?so=2', { seed: settingsSeed() });
    expect(screen.getAllByRole('link', { name: /Thư viện/ }).some((a) => a.getAttribute('aria-current') === 'page')).toBe(true);
    expect(screen.getByRole('link', { name: 'Thư viện', current: false })).toHaveAttribute('href', '#/thu-vien?xem=unit');
    r.unmount();
    await renderApp('#/unit?so=9999', { seed: settingsSeed() });
    await settle();
    expect(hash()).toBe('#/thu-vien');
  });

  // @ac S10-AC02
  it('Global English: Unit n · trình độ, tiêu đề màn là title có lang, translation và situation', async () => {
    await renderApp('#/unit?so=1', { seed: settingsSeed(GLOBAL) });
    expect(screen.getByText('Unit 1 · A1')).toBeInTheDocument();
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Find your classroom');
    expect(h1).toHaveAttribute('lang', 'en');
    expect(screen.getByText('Tìm đúng phòng học')).toBeInTheDocument();
    expect(screen.getByText('Bạn mới đến trường và hỏi một bạn học về phòng học tiếng Anh.')).toBeInTheDocument();
  });

  // @ac S10-AC03
  it('dải 8 ô và dòng đếm đúng trạng thái; bỏ phần có số 0', async () => {
    const r = await renderApp('#/unit?so=2', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(screen.getByTestId('s10-counts').textContent).toBe('Đã nhớ 2 · Cần ôn 1 · Chưa học 5');
    expect(cellsOf(document.querySelector('.s10__progress')!)).toEqual(['nho', 'nho', 'can-on', 'chua', 'chua', 'chua', 'chua', 'chua']);
    r.unmount();
    await renderApp('#/unit?so=1', { seed: { ...settingsSeed(), ...progressSeed(partial) } });
    expect(screen.getByTestId('s10-counts').textContent).toBe('Chưa học 8');
  });

  // @ac S10-AC04
  it('Học unit này mở phiên nguon=unit đúng các câu; thoát thì về S10; nhớ hết thì Ôn lại; Kiểm tra nhanh mở đúng unit', async () => {
    const r = await renderApp('#/unit?so=2', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học unit này' }));
    await settle();
    expect(hash()).toMatch(/^#\/phien-hoc\?nguon=unit&so=2&phien=/);
    const s = JSON.parse(r.mem.get('vitasr2.progress.fluency.en')!).sessions.at(-1);
    expect(s.nguon).toBe('unit');
    expect(s.itemIds).toEqual(U2);
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dừng' }));
    await settle();
    expect(hash()).toBe('#/unit?so=2');
    r.unmount();
    const all = { schema: 1, sessions: [], attempts: [], items: Object.fromEntries(U2.map((id) => [id, known])) };
    await renderApp('#/unit?so=2', { seed: { ...settingsSeed(), ...progressSeed(all) } });
    expect(screen.getByRole('button', { name: 'Ôn lại unit này' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra nhanh unit này' }));
    await settle();
    expect(hash()).toBe('#/kiem-tra?unit=2');
  });

  // @ac S10-AC05
  it('danh sách đúng các câu của unit; chạm dòng mở sheet Câu [id]', async () => {
    await renderApp('#/unit?so=2', { seed: settingsSeed() });
    const ids = [...document.querySelectorAll<HTMLElement>('.s10 .lib-row')].map((b) => Number(b.dataset.id));
    expect(ids).toEqual(U2);
    fireEvent.click(document.querySelector<HTMLElement>('.s10 .lib-row[data-id="259"]')!);
    await settle();
    expect(screen.getByRole('dialog', { name: 'Câu 0259' })).toBeInTheDocument();
  });

  // @ac S10-AC06
  it('unit đầu không có liên kết trước, unit cuối không có liên kết sau', async () => {
    const r = await renderApp('#/unit?so=1', { seed: settingsSeed() });
    const nav = () => screen.getByRole('navigation', { name: 'Unit trước và sau' });
    expect(within(nav()).getAllByRole('link').map((a) => a.textContent)).toEqual(['Unit 2']);
    expect(within(nav()).getByRole('link', { name: 'Unit 2' })).toHaveAttribute('href', '#/unit?so=2');
    r.unmount();
    await renderApp('#/unit?so=4', { seed: settingsSeed() });
    expect(within(nav()).getAllByRole('link').map((a) => a.textContent)).toEqual(['Unit 3']);
  });

  // @ac S10-AC07
  it('hoàn tất phiên nguon=unit thì T4 ghi nguồn Học theo unit', async () => {
    const r = await renderApp('#/phien-hoc?nguon=unit&so=3', { seed: { ...settingsSeed(), ...progressSeed(PROGRESS_30) } });
    await finishSession();
    expect(screen.getByText('Xong phiên học')).toBeInTheDocument();
    const saved = r.mem.get('vitasr2.progress.fluency.en')!;
    r.unmount();
    await renderApp('#/tien-bo?khoang=1', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': JSON.parse(saved) } });
    expect(screen.getAllByText('Học theo unit').length).toBeGreaterThan(0);
  });
});
