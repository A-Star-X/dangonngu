import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { searchItems } from '@/domain';
import { hintParts } from '@/views/phien-hoc/utils/hint';
import { NOW, here, query, renderApp, settingsSeed, settle } from './helpers';
import { DAY, GLOBAL, KEY, browserBack, drainHistory, correctChoice, doSentence, finishSession, fixtureData, positionLabel, prog, rateCurrent, savedProgress, stripStates, wrongChoice } from './page-helpers';

const U1 = [1, 257, 769, 770, 258, 771, 772, 1793];
const ALL = [1, 257, 769, 770, 258, 771, 772, 1793, 2, 259, 773, 774, 260, 775, 776, 1794, 3, 261, 777, 778, 262, 779, 780, 1795, 4, 263, 781, 782, 264];
const learned = (ids: number[]) => Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 2, due: NOW + 3 * DAY, lastAt: NOW }]));
afterEach(drainHistory);

const meaning = (text: string) => within(screen.getByTestId('sentence-card')).getByText(text, { selector: 'p.vi' });

describe('S3 Phiên học', () => {
  // @ac S3-AC01
  it('nhóm câu theo nguồn; ôn tập rỗng thì quay lại màn trước và báo', async () => {
    const a = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    expect(positionLabel()).toBe('Câu 1/8');
    expect(meaning('Tôi muốn...')).toBeInTheDocument();
    // Route ghi id phiên để tải lại mở đúng phiên.
    expect(query().phien).toBeTruthy();
    expect(savedProgress(a.mem).sessions[0].itemIds).toEqual(U1);
    a.unmount();
    const due = Object.fromEntries([2, 259].map((id, i) => [id, { status: 'da-hoc', streak: 0, due: NOW - (2 - i) * DAY, lastAt: NOW - DAY }]));
    const b = await renderApp('/phien-hoc?nguon=on-tap', { seed: { ...settingsSeed(), ...prog({ items: due }) } });
    expect(positionLabel()).toBe('Câu 1/2');
    expect(savedProgress(b.mem).sessions[0].itemIds).toEqual([2, 259]);
    b.unmount();
    const c = await renderApp('/phien-hoc?nguon=tu-khoa&q=want&nhom=1', { seed: settingsSeed() });
    const d = await fixtureData();
    const wantIds = searchItems(d, 'want').map((x) => x.id).slice(0, 8);
    expect(savedProgress(c.mem).sessions[0].itemIds).toEqual(wantIds);
    expect(positionLabel()).toBe(`Câu 1/${wantIds.length}`);
    c.unmount();
    const e = await renderApp('/phien-hoc?nguon=cau&id=258', { seed: settingsSeed() });
    expect(positionLabel()).toBe('Câu 1/8');
    expect(meaning('Tôi muốn...')).toBeInTheDocument();
    expect(savedProgress(e.mem).sessions[0].itemIds).toEqual(U1);
    e.unmount();
    await renderApp('/phien-hoc?nguon=on-tap', { seed: settingsSeed() });
    await settle(30);
    expect(screen.getByText('Không có câu nào để học trong nhóm này.')).toBeInTheDocument();
    expect(here()).toBe('/hoc');
  });

  // @ac S3-AC02, S3-AC03
  it('thứ tự S3a, S3b cho từng câu rồi S3c; cặp nút khóa tới khi hiện câu gốc; Cần ôn lại ghi can-on', async () => {
    const { mem } = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    const steps: string[] = [];
    for (let i = 0; i < 8; i++) {
      expect(positionLabel()).toBe(`Câu ${i + 1}/8`);
      const known = screen.getByRole('button', { name: /Tôi nhớ/ });
      expect(known).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByRole('button', { name: /Cần ôn lại/ })).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(known);
      await settle();
      // Nút khóa không chấm: vẫn ở S3a.
      expect(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' })).toBeInTheDocument();
      steps.push('a');
      fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
      expect(screen.getByRole('button', { name: /Tôi nhớ/ })).not.toHaveAttribute('aria-disabled');
      fireEvent.click(screen.getByRole('button', { name: i === 0 ? /Cần ôn lại/ : /Tôi nhớ/ }));
      await settle();
      expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
      steps.push('b');
      expect(stripStates()[i]).toBe('dang');
      fireEvent.click(correctChoice());
      fireEvent.click(screen.getByRole('button', { name: i === 7 ? 'Xem tổng kết' : 'Câu tiếp' }));
      await settle();
      if (i < 7) expect(stripStates()[i]).toBe(i === 0 ? 'can-on' : 'nho');
    }
    expect(screen.getByRole('heading', { level: 1, name: 'Xong phiên học' })).toBeInTheDocument();
    expect(steps.join('')).toBe('ab'.repeat(8));
    const p = savedProgress(mem);
    expect(p.attempts.find((x: { itemId: number; kind: string }) => x.itemId === 1 && x.kind === 'ghi-nho').outcome).toBe('can-on');
    expect(p.items[1].streak).toBe(0);
    expect(p.items[1].due).toBeLessThanOrEqual(NOW);
  });

  // @ac S3-AC04
  it('chọn đúng thì có nút Câu tiếp; chọn sai trước thì câu bị ghi sai', async () => {
    const { mem } = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    await rateCurrent();
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    fireEvent.click(wrongChoice());
    await settle();
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    expect(document.querySelector('button[data-state="wrong"]')).not.toBeNull();
    fireEvent.click(correctChoice());
    await settle();
    expect(screen.getByRole('button', { name: 'Câu tiếp' })).toBeInTheDocument();
    const p = savedProgress(mem);
    const att = p.attempts.filter((x: { itemId: number; kind: string }) => x.itemId === 1 && x.kind === 'trac-nghiem');
    expect(att).toHaveLength(1);
    expect(att[0].outcome).toBe('sai');
    expect(p.items[1].streak).toBe(0);
  });

  // @ac S3-AC05
  it('gợi ý: chữ đầu và số từ; nút biến mất; ghi hinted', async () => {
    expect(hintParts('Tôi muốn đặt một bàn cho hai người.')).toEqual({ first: 'T', words: 8 });
    const { mem } = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    await rateCurrent();
    fireEvent.click(screen.getByRole('button', { name: 'Xem gợi ý' }));
    await settle();
    const hint = screen.getByText('Nghĩa bắt đầu bằng "T…", gồm 2 từ.');
    expect(hint).toHaveAttribute('lang', 'vi');
    expect(hint).toHaveAttribute('role', 'status');
    expect(screen.queryByRole('button', { name: 'Xem gợi ý' })).toBeNull();
    fireEvent.click(correctChoice());
    await settle();
    const p = savedProgress(mem);
    expect(p.attempts.find((x: { kind: string }) => x.kind === 'trac-nghiem').hinted).toBe(true);
    expect(p.items[1].streak).toBe(0);
  });

  // @ac S3-AC06
  it('tổng kết: x/N, danh sách Cần ôn, nút Học tiếp và Nhóm tiếp', async () => {
    const a = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    await finishSession({ hint: [2, 5], wrong: [7] });
    expect(screen.getByText('5/8')).toBeInTheDocument();
    expect(screen.getByText('câu nhớ được không cần gợi ý')).toBeInTheDocument();
    const review = screen.getByRole('region', { name: 'Cần ôn lại' });
    expect(within(review).getAllByRole('listitem')).toHaveLength(3);
    for (const li of within(review).getAllByRole('listitem')) expect(li).toHaveAttribute('lang', 'en');
    expect(screen.getByRole('button', { name: 'Học tiếp 8 câu' })).toBeInTheDocument();
    a.unmount();
    // Đã học hết lộ trình: không có nút Học tiếp.
    const b = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: { ...settingsSeed(), ...prog({ items: learned(ALL.filter((id) => !U1.includes(id))) }) } });
    await finishSession();
    expect(screen.getByText('8/8')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Cần ôn lại' })).toBeNull();
    expect(screen.queryByRole('button', { name: /Học tiếp/ })).toBeNull();
    b.unmount();
    // Học theo từ khóa: nhóm đầu có Nhóm tiếp mở nhom=2, nhóm cuối thì không.
    const q = 't';
    const groups = Math.ceil(searchItems(await fixtureData(), q).length / 8);
    expect(groups).toBeGreaterThanOrEqual(3);
    const seed = { ...settingsSeed(), ...prog({ items: learned(ALL) }) };
    const c = await renderApp(`/phien-hoc?nguon=tu-khoa&q=${q}&nhom=1`, { seed });
    await finishSession();
    fireEvent.click(screen.getByRole('button', { name: 'Nhóm tiếp' }));
    await settle(30);
    expect(query()).toMatchObject({ nguon: 'tu-khoa', q, nhom: '2' });
    expect(positionLabel()).toBe('Câu 1/8');
    c.unmount();
    await renderApp(`/phien-hoc?nguon=tu-khoa&q=${q}&nhom=${groups}`, { seed });
    await finishSession();
    expect(screen.queryByRole('button', { name: 'Nhóm tiếp' })).toBeNull();
  });

  // @ac S3-AC09
  it('dừng ở S3b câu 4, tải lại, tiếp tục từ T1 vào đúng S3b câu 4; phiên mới thay phiên dở', async () => {
    const a = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    for (let i = 0; i < 3; i++) await doSentence();
    await rateCurrent();
    expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    expect(screen.getByText('Bạn đã học 3/8 câu. Kết quả các câu này vẫn được lưu.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    await settle(30);
    const saved = { 'vitasr2.settings': a.mem.get('vitasr2.settings')!, [KEY]: a.mem.get(KEY)! };
    a.unmount();
    const b = await renderApp('/hoc', { seed: saved });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' }));
    await settle(30);
    expect(positionLabel()).toBe('Câu 4/8');
    expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
    const oldId = savedProgress(b.mem).sessions[0].id;
    expect(query().phien).toBe(oldId);
    b.unmount();
    // Tải lại đúng địa chỉ phiên: vẫn là câu 4 ở bước kiểm tra.
    const r = await renderApp(`/phien-hoc?nguon=lo-trinh&phien=${oldId}`, { seed: saved });
    expect(positionLabel()).toBe('Câu 4/8');
    expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
    r.unmount();
    const c = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: saved });
    expect(positionLabel()).toBe('Câu 1/8');
    const sessions = savedProgress(c.mem).sessions as { id: string; abandonedAt?: number; completedAt?: number }[];
    expect(sessions.find((x) => x.id === oldId)!.abandonedAt).toBeDefined();
    expect(sessions.filter((x) => x.abandonedAt === undefined && x.completedAt === undefined)).toHaveLength(1);
  });

  // @ac S3-AC08
  it('Thoát ở câu 4: sheet đúng chữ; Học tiếp giữ câu 4; Dừng về màn trước; Back của trình duyệt cũng hỏi', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    for (let i = 0; i < 3; i++) await doSentence();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    const dialog = screen.getByRole('dialog', { name: 'Dừng phiên học?' });
    expect(within(dialog).getByText('Bạn đã học 3/8 câu. Kết quả các câu này vẫn được lưu.')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Học tiếp' }));
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(positionLabel()).toBe('Câu 4/8');
    // Nút Back của trình duyệt: màn không đổi, sheet xác nhận mở.
    const at = here();
    await browserBack();
    expect(here()).toBe(at);
    expect(screen.getByRole('dialog', { name: 'Dừng phiên học?' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Học tiếp' }));
    await settle();
    expect(positionLabel()).toBe('Câu 4/8');
    // Esc cũng mở sheet; liên kết trên thanh bên cũng hỏi trước.
    fireEvent.keyDown(window, { key: 'Escape' });
    await settle();
    expect(screen.getByRole('dialog', { name: 'Dừng phiên học?' })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    fireEvent.click(screen.getByRole('link', { name: 'Thư viện' }));
    await settle(30);
    expect(here()).toBe(at);
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Dừng phiên học?' })).getByRole('button', { name: 'Dừng' }));
    await settle(30);
    expect(here()).toBe('/hoc');
    expect(screen.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' })).toBeInTheDocument();
    // Dừng thay mục của phiên bằng màn trước: Back sau đó không mở lại phiên, không mở sheet xác nhận.
    await browserBack();
    expect(here()).not.toMatch(/^\/phien-hoc/);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // @ac S3-AC10
  it('đi hết phiên chỉ bằng bàn phím; vuốt và phím mũi tên trên thẻ không đổi câu', async () => {
    await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    const card = screen.getByTestId('sentence-card');
    fireEvent.touchStart(card, { touches: [{ clientX: 300, clientY: 100 }] });
    fireEvent.touchMove(card, { touches: [{ clientX: 40, clientY: 100 }] });
    fireEvent.touchEnd(card, { changedTouches: [{ clientX: 40, clientY: 100 }] });
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    await settle();
    expect(positionLabel()).toBe('Câu 1/8');
    expect(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' })).toBeInTheDocument();
    for (let i = 0; i < 8; i++) {
      expect(document.activeElement).toBe(screen.getByTestId('sentence-card'));
      fireEvent.keyDown(window, { key: ' ' });
      await settle();
      fireEvent.keyDown(window, { key: '2' });
      await settle();
      const correct = [...document.querySelectorAll('ul[aria-labelledby="s3-q"] button')].findIndex((c) => c.getAttribute('data-correct') === 'true');
      fireEvent.keyDown(window, { key: String(correct + 1) });
      await settle();
      fireEvent.keyDown(document.body, { key: 'Enter' });
      await settle();
    }
    expect(screen.getByText('Xong phiên học')).toBeInTheDocument();
    expect(screen.getByText('8/8')).toBeInTheDocument();
  });
});

describe('DATA tiến độ qua giao diện', () => {
  // @ac DATA-AC06
  it('hoàn tất một phiên: chỉ khóa vitasr2., đúng cấu trúc, khóa bản cũ không bị đụng', async () => {
    const old = { 'vitasr.progress': '{"x":1}', 'vitasr.settings': 'cu' };
    const { mem } = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: { ...settingsSeed(), ...old } });
    await finishSession();
    const keys = [...mem.keys()].filter((k) => !(k in old));
    expect(keys.length).toBeGreaterThan(0);
    expect(keys.every((k) => k.startsWith('vitasr2.'))).toBe(true);
    expect(mem.get('vitasr.progress')).toBe('{"x":1}');
    expect(mem.get('vitasr.settings')).toBe('cu');
    const p = savedProgress(mem);
    expect(p.schema).toBe(1);
    const s = p.sessions[0];
    for (const k of ['id', 'nguon', 'itemIds', 'startedAt', 'completedAt', 'position']) expect(s).toHaveProperty(k);
    for (const a of p.attempts) for (const k of ['sessionId', 'itemId', 'at', 'kind', 'outcome', 'hinted']) expect(a).toHaveProperty(k);
    for (const st of Object.values(p.items) as Record<string, unknown>[]) for (const k of ['status', 'streak', 'due', 'lastAt']) expect(st).toHaveProperty(k);
  });

  // @ac DATA-AC17
  it('học Global rồi Fluency: hai khóa độc lập, đổi lại thì tiến độ cũ còn nguyên', async () => {
    const a = await renderApp('/phien-hoc?nguon=lo-trinh', { seed: settingsSeed(GLOBAL) });
    await finishSession();
    const g1 = a.mem.get('vitasr2.progress.global.en')!;
    expect(g1).toBeTruthy();
    fireEvent.click(screen.getByRole('link', { name: 'Xong' }));
    await settle(30);
    expect(here()).toBe('/hoc');
    const langButton = () => screen.getByTestId('language-button');
    fireEvent.click(langButton());
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Đổi ngôn ngữ hoặc bộ nội dung' })).getByText('Tiếng Anh, English Fluency'));
    await waitFor(() => expect(langButton()).toHaveTextContent('English Fluency'));
    await settle(30);
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    await finishSession();
    expect(a.mem.get('vitasr2.progress.fluency.en')).toBeTruthy();
    expect(a.mem.get('vitasr2.progress.global.en')).toBe(g1);
    fireEvent.click(screen.getByRole('link', { name: 'Xong' }));
    await settle(30);
    fireEvent.click(langButton());
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Anh, Global English'));
    await waitFor(() => expect(langButton()).toHaveTextContent('Global English'));
    await settle(30);
    expect(screen.getByText('Unit 2 · A1')).toBeInTheDocument();
  });
});
