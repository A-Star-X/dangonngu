import { describe, expect, it } from 'vitest';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { hintText } from '../../src/pages/S3-phien-hoc/S3PhienHoc';
import { NOW, hash, renderApp, settingsSeed, settle } from './helpers';
import { finishSession } from './app.test';

const DAY = 86400000;
const U1 = [1, 257, 769, 770, 258, 771, 772, 1793];
const progressKey = 'vitasr2.progress.fluency.en';
const prog = (p: Record<string, unknown>) => ({ [progressKey]: { schema: 1, sessions: [], attempts: [], items: {}, ...p } });
const label = () => screen.getByText(/^Câu \d+\/\d+$/).textContent;

describe('S3 Phiên học', () => {
  // @ac S3-AC01
  it('nhóm câu theo nguồn; ôn tập rỗng thì quay lại và báo', async () => {
    const a = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    expect(label()).toBe('Câu 1/8');
    expect(screen.getByText('Tôi muốn...', { selector: '.card__meaning' })).toBeInTheDocument();
    a.unmount();
    const due = Object.fromEntries([2, 259].map((id, i) => [id, { status: 'da-hoc', streak: 0, due: NOW - (2 - i) * DAY, lastAt: NOW - DAY }]));
    const b = await renderApp('#/phien-hoc?nguon=on-tap', { seed: { ...settingsSeed(), ...prog({ items: due }) } });
    expect(label()).toBe('Câu 1/2');
    b.unmount();
    const c = await renderApp('#/phien-hoc?nguon=tu-khoa&q=want&nhom=1', { seed: settingsSeed() });
    expect(label()).toMatch(/^Câu 1\/\d$/);
    c.unmount();
    const d = await renderApp('#/phien-hoc?nguon=cau&id=258', { seed: settingsSeed() });
    expect(label()).toBe('Câu 1/8');
    expect(screen.getByText('Tôi muốn...', { selector: '.card__meaning' })).toBeInTheDocument();
    d.unmount();
    window.history.replaceState(null, '', '/#/hoc');
    await renderApp('#/phien-hoc?nguon=on-tap', { seed: settingsSeed() });
    await settle(30);
    expect(screen.getByText('Không có câu nào để học trong nhóm này.')).toBeInTheDocument();
    expect(hash()).toBe('#/hoc');
  });

  // @ac S3-AC02, S3-AC03
  it('thứ tự S3a, S3b cho từng câu rồi S3c; cặp nút khóa tới khi hiện câu gốc; Cần ôn lại ghi can-on', async () => {
    const { container, mem } = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    const steps: string[] = [];
    for (let i = 0; i < 8; i++) {
      expect(label()).toBe(`Câu ${i + 1}/8`);
      const known = screen.getByRole('button', { name: /Tôi nhớ/ });
      expect(known).toHaveAttribute('aria-disabled', 'true');
      fireEvent.click(known);
      expect(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' })).toBeInTheDocument();
      steps.push('a');
      fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
      expect(screen.getByRole('button', { name: /Tôi nhớ/ })).not.toHaveAttribute('aria-disabled');
      fireEvent.click(screen.getByRole('button', { name: i === 0 ? /Cần ôn lại/ : /Tôi nhớ/ }));
      await settle();
      expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
      steps.push('b');
      const cells = container.querySelectorAll('.strip__cell');
      expect(cells[i]).toHaveClass('strip__cell--dang');
      fireEvent.click(container.querySelector<HTMLElement>('.choice[data-correct="true"]')!);
      fireEvent.click(screen.getByRole('button', { name: i === 7 ? 'Xem tổng kết' : 'Câu tiếp' }));
      await settle();
      if (i < 7) expect(container.querySelectorAll('.strip__cell')[i]).toHaveClass(i === 0 ? 'strip__cell--can-on' : 'strip__cell--nho');
    }
    expect(screen.getByText('Xong phiên học')).toBeInTheDocument();
    expect(steps.join('')).toBe('ab'.repeat(8));
    const p = JSON.parse(mem.get(progressKey)!);
    expect(p.attempts.find((x: { itemId: number; kind: string }) => x.itemId === 1 && x.kind === 'ghi-nho').outcome).toBe('can-on');
    expect(p.items[1].streak).toBe(0);
    expect(p.items[1].due).toBeLessThanOrEqual(NOW);
  });

  // @ac S3-AC04
  it('chọn đúng thì có nút Câu tiếp; chọn sai trước thì câu bị ghi sai', async () => {
    const { container, mem } = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
    fireEvent.click(screen.getByRole('button', { name: /Tôi nhớ/ }));
    await settle();
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    fireEvent.click(container.querySelector<HTMLElement>('.choice:not([data-correct])')!);
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    fireEvent.click(container.querySelector<HTMLElement>('.choice[data-correct="true"]')!);
    expect(screen.getByRole('button', { name: 'Câu tiếp' })).toBeInTheDocument();
    const p = JSON.parse(mem.get(progressKey)!);
    const att = p.attempts.filter((x: { itemId: number; kind: string }) => x.itemId === 1 && x.kind === 'trac-nghiem');
    expect(att).toHaveLength(1);
    expect(att[0].outcome).toBe('sai');
    expect(p.items[1].streak).toBe(0);
  });

  // @ac S3-AC05
  it('gợi ý: chữ đầu và số từ; nút biến mất; ghi hinted', async () => {
    expect(hintText('Tôi muốn đặt một bàn cho hai người.')).toBe('Nghĩa bắt đầu bằng "T…", gồm 8 từ.');
    const { container, mem } = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
    fireEvent.click(screen.getByRole('button', { name: /Tôi nhớ/ }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Xem gợi ý' }));
    expect(screen.getByText('Nghĩa bắt đầu bằng "T…", gồm 2 từ.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xem gợi ý' })).toBeNull();
    fireEvent.click(container.querySelector<HTMLElement>('.choice[data-correct="true"]')!);
    const p = JSON.parse(mem.get(progressKey)!);
    expect(p.attempts.find((x: { kind: string }) => x.kind === 'trac-nghiem').hinted).toBe(true);
    expect(p.items[1].streak).toBe(0);
  });

  // @ac S3-AC06
  it('tổng kết: x/N, danh sách Cần ôn, nút Học tiếp và Nhóm tiếp', async () => {
    const a = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    await finishSession({ hint: [2, 5], wrong: [7] });
    expect(screen.getByText('5/8')).toBeInTheDocument();
    expect(screen.getByText('câu nhớ được không cần gợi ý')).toBeInTheDocument();
    const list = screen.getByText('Cần ôn lại:').parentElement!;
    expect(within(list).getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('button', { name: 'Học tiếp 8 câu' })).toBeInTheDocument();
    a.unmount();
    // Đã học hết lộ trình: không có nút Học tiếp.
    const all = [1, 257, 769, 770, 258, 771, 772, 1793, 2, 259, 773, 774, 260, 775, 776, 1794, 3, 261, 777, 778, 262, 779, 780, 1795, 4, 263, 781, 782, 264];
    const items = Object.fromEntries(all.filter((id) => !U1.includes(id)).map((id) => [id, { status: 'da-hoc', streak: 2, due: NOW + 3 * DAY, lastAt: NOW }]));
    const b = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: { ...settingsSeed(), ...prog({ items }) } });
    await finishSession();
    expect(screen.queryByRole('button', { name: /Học tiếp/ })).toBeNull();
    b.unmount();
    // Tìm theo từ khóa có 3 nhóm: nhóm 1 có Nhóm tiếp, nhóm 3 thì không.
    const c = await renderApp('#/phien-hoc?nguon=tu-khoa&q=t&nhom=1', { seed: { ...settingsSeed(), ...prog({ items: Object.fromEntries(all.map((id) => [id, { status: 'da-hoc', streak: 2, due: NOW + 3 * DAY, lastAt: NOW }])) }) } });
    await finishSession();
    fireEvent.click(screen.getByRole('button', { name: 'Nhóm tiếp' }));
    await settle(30);
    expect(hash()).toContain('nhom=2');
    c.unmount();
    await renderApp('#/phien-hoc?nguon=tu-khoa&q=t&nhom=4', { seed: { ...settingsSeed(), ...prog({ items: Object.fromEntries(all.map((id) => [id, { status: 'da-hoc', streak: 2, due: NOW + 3 * DAY, lastAt: NOW }])) }) } });
    await finishSession();
    expect(screen.queryByRole('button', { name: 'Nhóm tiếp' })).toBeNull();
  });

  // @ac S3-AC09
  it('dừng ở S3b câu 4, tải lại, tiếp tục từ T1 vào đúng S3b câu 4; phiên mới thay phiên dở', async () => {
    const a = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
      fireEvent.click(screen.getByRole('button', { name: /Tôi nhớ/ }));
      await settle();
      fireEvent.click(document.querySelector<HTMLElement>('.choice[data-correct="true"]')!);
      fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
      await settle();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
    fireEvent.click(screen.getByRole('button', { name: /Tôi nhớ/ }));
    await settle();
    expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    expect(screen.getByText('Bạn đã học 3/8 câu. Kết quả các câu này vẫn được lưu.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    await settle();
    const saved = { 'vitasr2.settings': a.mem.get('vitasr2.settings')!, [progressKey]: a.mem.get(progressKey)! };
    a.unmount();
    const b = await renderApp('#/hoc', { seed: saved });
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' }));
    await settle(30);
    expect(label()).toBe('Câu 4/8');
    expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
    const oldId = JSON.parse(b.mem.get(progressKey)!).sessions[0].id;
    b.unmount();
    const c = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: saved });
    expect(label()).toBe('Câu 1/8');
    const sessions = JSON.parse(c.mem.get(progressKey)!).sessions as { id: string; abandonedAt?: number; completedAt?: number }[];
    expect(sessions.find((x) => x.id === oldId)!.abandonedAt).toBeDefined();
    expect(sessions.filter((x) => x.abandonedAt === undefined && x.completedAt === undefined)).toHaveLength(1);
  });

  // @ac S3-AC08
  it('Thoát ở câu 4: sheet đúng chữ; Học tiếp giữ câu 4; Dừng về màn trước', async () => {
    window.history.replaceState(null, '', '/#/hoc');
    await renderApp('#/hoc', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    for (let i = 0; i < 3; i++) {
      fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
      fireEvent.click(screen.getByRole('button', { name: /Tôi nhớ/ }));
      await settle();
      fireEvent.click(document.querySelector<HTMLElement>('.choice[data-correct="true"]')!);
      fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
      await settle();
    }
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    const dialog = screen.getByRole('dialog', { name: 'Dừng phiên học?' });
    expect(within(dialog).getByText('Bạn đã học 3/8 câu. Kết quả các câu này vẫn được lưu.')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Học tiếp' }));
    expect(label()).toBe('Câu 4/8');
    fireEvent.keyDown(window, { key: 'Escape' });
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dừng' }));
    await settle(30);
    expect(hash()).toBe('#/hoc');
    expect(screen.getByRole('button', { name: 'Tiếp tục: 5 câu còn lại' })).toBeInTheDocument();
  });

  // @ac S3-AC10
  it('đi hết phiên chỉ bằng bàn phím', async () => {
    const { container } = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    for (let i = 0; i < 8; i++) {
      const card = container.querySelector<HTMLElement>('.card')!;
      expect(document.activeElement).toBe(card);
      fireEvent.keyDown(window, { key: ' ' });
      fireEvent.keyDown(window, { key: '2' });
      await settle();
      const correct = [...container.querySelectorAll('.choice')].findIndex((c) => c.getAttribute('data-correct') === 'true');
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
    const { mem } = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: { ...settingsSeed(), ...old } });
    await finishSession();
    const keys = [...mem.keys()].filter((k) => !(k in old));
    expect(keys.every((k) => k.startsWith('vitasr2.'))).toBe(true);
    expect(mem.get('vitasr.progress')).toBe('{"x":1}');
    expect(mem.get('vitasr.settings')).toBe('cu');
    const p = JSON.parse(mem.get(progressKey)!);
    expect(p.schema).toBe(1);
    const s = p.sessions[0];
    for (const k of ['id', 'nguon', 'itemIds', 'startedAt', 'completedAt', 'position']) expect(s).toHaveProperty(k);
    for (const a of p.attempts) for (const k of ['sessionId', 'itemId', 'at', 'kind', 'outcome', 'hinted']) expect(a).toHaveProperty(k);
    for (const st of Object.values(p.items) as Record<string, unknown>[]) for (const k of ['status', 'streak', 'due', 'lastAt']) expect(st).toHaveProperty(k);
  });

  // @ac DATA-AC17
  it('học Global rồi Fluency: hai khóa độc lập, đổi lại thì tiến độ cũ còn nguyên', async () => {
    const a = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed({ packByLang: { en: 'global' } }) });
    await finishSession();
    const g1 = a.mem.get('vitasr2.progress.global.en')!;
    fireEvent.click(screen.getByRole('link', { name: 'Xong' }));
    await settle(30);
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Anh/ }));
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Anh, English Fluency'));
    await waitFor(() => expect(screen.getByRole('button', { name: /Tiếng Anh/ })).toHaveTextContent('English Fluency'));
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    await finishSession();
    expect(a.mem.get('vitasr2.progress.fluency.en')).toBeTruthy();
    expect(a.mem.get('vitasr2.progress.global.en')).toBe(g1);
    fireEvent.click(screen.getByRole('link', { name: 'Xong' }));
    await settle(30);
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Anh/ }));
    fireEvent.click(within(screen.getByRole('dialog')).getByText('Tiếng Anh, Global English'));
    await waitFor(() => expect(screen.getByRole('button', { name: /Tiếng Anh/ })).toHaveTextContent('Global English'));
    expect(screen.getByText('Unit 2 · A1')).toBeInTheDocument();
  });
});
