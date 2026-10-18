// Các lỗi tìm thấy khi rà soát code đợt 4 (18/10/2026): mỗi test hỏng trên code trước khi sửa.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { useState } from 'react';
import { SentenceCard } from '../../src/components/C1-the-cau/SentenceCard';
import { applyMemorize, displayStatus, fold, parseImport, sessionsInLast7Days, emptyProgress, type Progress } from '../../src/data';
import { NOW, fakeSpeech, hash, removeFakeSpeech, renderApp, settingsSeed, settle, withProviders } from './helpers';

const DAY = 86400000;
const KEY = 'vitasr2.progress.fluency.en';
const item = (due: number) => ({ status: 'da-hoc', streak: 0, due, lastAt: due });

describe('DATA-06 nhiều tab và tiến độ hỏng', () => {
  // @ac DATA-AC20
  it('tab khác ghi tiến độ hay cài đặt thì tab này nạp lại; tab này ghi tiếp không làm mất phần của tab kia', async () => {
    const r = await renderApp('#/hoc', { seed: settingsSeed() });
    expect(screen.queryByText(/câu cần ôn hôm nay/)).toBeNull();
    r.mem.set(KEY, JSON.stringify({ schema: 1, sessions: [], attempts: [], items: { 2: item(NOW - DAY) } }));
    act(() => void window.dispatchEvent(new StorageEvent('storage', { key: KEY })));
    expect(screen.getByText('1 câu cần ôn hôm nay')).toBeInTheDocument();

    const s = JSON.parse(r.mem.get('vitasr2.settings')!);
    r.mem.set('vitasr2.settings', JSON.stringify({ ...s, weeklyGoal: 9 }));
    act(() => void window.dispatchEvent(new StorageEvent('storage', { key: 'vitasr2.settings' })));
    expect(screen.getByText('Tuần này: 0/9 phiên')).toBeInTheDocument();

    // Tab kia ghi thêm một câu, sự kiện chưa kịp tới; tab này bắt đầu phiên học.
    r.mem.set(KEY, JSON.stringify({ schema: 1, sessions: [], attempts: [], items: { 2: item(NOW - DAY), 3: item(NOW - DAY) } }));
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(20);
    const saved = JSON.parse(r.mem.get(KEY)!);
    expect(Object.keys(saved.items).sort()).toEqual(['2', '3']);
    expect(saved.sessions).toHaveLength(1);
  });

  // @ac DATA-AC20
  it('tiến độ đã lưu có phần tử hỏng: bỏ phần đó, app vẫn mở và giữ phần còn lại', async () => {
    const bad = { schema: 1, sessions: [{ id: 'x', nguon: 'lo-trinh', itemIds: [1], startedAt: NOW, position: -3, step: 'ghi-nho' }], attempts: [null], items: { 1: null, 2: item(NOW - DAY), 5: { status: 'da-hoc', streak: 1.5, due: NOW, lastAt: NOW } } };
    await renderApp('#/hoc', { seed: { ...settingsSeed(), [KEY]: bad } });
    expect(screen.getByText('1 câu cần ôn hôm nay')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Học 8 câu' })).toBeInTheDocument();
  });
});

describe('DATA-07, DATA-12 ngày theo lịch và bỏ dấu', () => {
  const tz = process.env.TZ;
  afterEach(() => {
    process.env.TZ = tz;
  });

  // @ac DATA-AC21
  it('máy ở nơi có giờ mùa hè: câu vừa nhớ không thành Cần ôn trong ngày; tuần 7 ngày tính theo ngày lịch', () => {
    process.env.TZ = 'Europe/Berlin';
    // 25/10/2026 ở Berlin dài 25 giờ (hết giờ mùa hè).
    const at = new Date(2026, 9, 25, 0, 30).getTime();
    const st = applyMemorize(undefined, 'nho', at);
    expect(displayStatus(st, at)).toBe('da-nho');
    expect(new Date(st.due).getDate()).toBe(26);
    expect(new Date(st.due).getHours()).toBe(0);
    const p: Progress = { ...emptyProgress(), sessions: [{ id: 's', nguon: 'lo-trinh', itemIds: [1], startedAt: at, completedAt: new Date(2026, 9, 24, 0, 30).getTime(), position: 1, step: 'ghi-nho' }] };
    expect(sessionsInLast7Days(p, new Date(2026, 9, 30, 10, 0).getTime())).toBe(1);
  });

  // @ac DATA-AC21
  it('chỉ bỏ dấu trên chữ Latinh; dấu của kana, Devanagari, Thái, Kirin giữ nguyên', () => {
    expect(fold('Đặt phòng')).toBe('dat phong');
    expect(fold('Müller')).toBe('muller');
    expect(fold('が')).not.toBe(fold('か'));
    expect(fold('के')).not.toBe(fold('का'));
    expect(fold('ที่')).not.toBe(fold('ท'));
    expect(fold('й')).not.toBe(fold('и'));
  });
});

describe('S8-05 nhập tiến độ', () => {
  const file = (progress: unknown) => JSON.stringify({ app: 'vitasr2', kind: 'tien-do', pack: 'fluency', lang: 'en', exportedAt: '', settings: {}, progress });
  const session = { id: 's', nguon: 'lo-trinh', itemIds: [1, 2], startedAt: NOW, position: 1, step: 'ghi-nho' };
  // @ac S8-AC13
  it('từ chối tệp có vị trí ngoài phạm vi, streak không nguyên, thiếu bước, hoặc quá lớn', () => {
    expect(parseImport(file({ schema: 1, sessions: [session], attempts: [], items: {} }), 'fluency', 'en')).not.toBeNull();
    expect(parseImport(file({ schema: 1, sessions: [{ ...session, position: -1 }], attempts: [], items: {} }), 'fluency', 'en')).toBeNull();
    expect(parseImport(file({ schema: 1, sessions: [{ ...session, position: 3 }], attempts: [], items: {} }), 'fluency', 'en')).toBeNull();
    expect(parseImport(file({ schema: 1, sessions: [{ ...session, step: undefined }], attempts: [], items: {} }), 'fluency', 'en')).toBeNull();
    expect(parseImport(file({ schema: 1, sessions: [], attempts: [], items: { 1: { status: 'da-hoc', streak: 1.5, due: NOW, lastAt: NOW } } }), 'fluency', 'en')).toBeNull();
    expect(parseImport(file({ schema: 1, sessions: [], attempts: [], items: {} }) + ' '.repeat(8 * 1024 * 1024), 'fluency', 'en')).toBeNull();
  });
});

describe('S3 gợi ý và phím giữ', () => {
  // @ac S3-AC12
  it('mở gợi ý rồi tải lại trang: trả lời đúng vẫn ghi là có dùng gợi ý', async () => {
    const a = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
    fireEvent.click(screen.getByRole('button', { name: /Tôi nhớ/ }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Xem gợi ý' }));
    await settle();
    const at = hash();
    const saved = Object.fromEntries(a.mem);
    a.unmount();
    const b = await renderApp(at, { seed: saved });
    // Gợi ý vẫn hiện sau khi tải lại, nút Xem gợi ý không còn.
    expect(screen.queryByRole('button', { name: 'Xem gợi ý' })).toBeNull();
    expect(document.querySelector('.s3__hint')?.textContent).toMatch(/^Nghĩa bắt đầu bằng "/);
    fireEvent.click(document.querySelector<HTMLButtonElement>('.choice[data-correct="true"]')!);
    await settle();
    const attempts = JSON.parse(b.mem.get(KEY)!).attempts as { kind: string; hinted: boolean }[];
    expect(attempts.find((x) => x.kind === 'trac-nghiem')?.hinted).toBe(true);
  });

  // @ac S3-AC13
  it('giữ phím 2 ở bước ghi nhớ: lần lặp không chọn đáp án ở bước kiểm tra', async () => {
    const r = await renderApp('#/phien-hoc?nguon=lo-trinh', { seed: settingsSeed() });
    fireEvent.keyDown(window, { key: ' ' });
    await settle();
    fireEvent.keyDown(window, { key: '2' });
    await settle();
    expect(screen.getByText('Câu này nghĩa là gì?')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: '2', repeat: true });
    fireEvent.keyDown(window, { key: '1', repeat: true });
    await settle();
    const p = JSON.parse(r.mem.get(KEY)!);
    expect(p.attempts.map((x: { kind: string }) => x.kind)).toEqual(['ghi-nho']);
    expect(document.querySelector('.choice--wrong, .choice--right')).toBeNull();
  });
});

describe('C1 nút Nghe và focus', () => {
  afterEach(() => removeFakeSpeech());
  const voices = [{ lang: 'en-US', voiceURI: 'us', name: 'US' }];
  type U = { onend: (() => void) | null };

  // @ac C1-AC09
  it('đổi Nghe sang Nghe lặp khi đang đọc chỉ có một vòng lặp; đổi câu thì nút về Nghe', async () => {
    vi.useFakeTimers();
    try {
      const synth = fakeSpeech(voices);
      const it1 = { id: 1, en: 'Hello there', vi: 'Xin chào' } as never;
      const it2 = { id: 2, en: 'Good bye', vi: 'Tạm biệt' } as never;
      let setItem: (x: never) => void = () => undefined;
      const Wrap = () => {
        const [it, set] = useState<never>(it1);
        setItem = set;
        return <SentenceCard item={it} lang="en" locale="en-US" langName="Tiếng Anh" />;
      };
      withProviders(<Wrap />);
      await act(async () => void vi.advanceTimersByTime(1600));
      fireEvent.click(screen.getByRole('button', { name: 'Nghe' }));
      fireEvent.click(screen.getByRole('button', { name: 'Nghe lặp' }));
      const [u1, u2] = synth.speak.mock.calls.map((c) => c[0] as U);
      // Trình duyệt báo câu bị hủy đã "xong" sau khi lượt mới bắt đầu.
      act(() => u1.onend?.());
      act(() => u2.onend?.());
      await act(async () => void vi.advanceTimersByTime(1600));
      expect(synth.speak).toHaveBeenCalledTimes(3);
      expect(screen.getAllByRole('button', { name: 'Dừng' })).toHaveLength(1);
      act(() => setItem(it2));
      expect(screen.queryByRole('button', { name: 'Dừng' })).toBeNull();
      expect(screen.getByRole('button', { name: 'Nghe lặp' })).toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  // @ac C1-AC10
  it('hiện câu gốc bằng bàn phím: focus chuyển sang câu vừa hiện, không rơi về đầu trang', async () => {
    fakeSpeech(voices);
    const it1 = { id: 1, en: 'Hello there', vi: 'Xin chào' } as never;
    const Wrap = () => {
      const [covered, setCovered] = useState(true);
      return <SentenceCard item={it1} lang="en" langName="Tiếng Anh" covered={covered} onReveal={() => setCovered(false)} autoFocus />;
    };
    withProviders(<Wrap />);
    expect(document.activeElement).toHaveClass('card');
    fireEvent.keyDown(document.activeElement!, { key: ' ' });
    await settle();
    expect(document.activeElement).toHaveAttribute('data-testid', 'card-source');
  });
});

describe('S8-02 giọng Tự động theo bộ đang học', () => {
  afterEach(() => removeFakeSpeech());
  // @ac S8-AC11
  it('Cài đặt hiện đúng giọng mà thẻ câu dùng: Global English en-GB, English Fluency en-US', async () => {
    fakeSpeech([
      { lang: 'en-US', voiceURI: 'gus', name: 'Google US English' },
      { lang: 'en-GB', voiceURI: 'guk', name: 'Google UK English Female' },
    ]);
    const a = await renderApp('#/cai-dat', { seed: settingsSeed({ packByLang: { en: 'global' } }) });
    expect(screen.getByRole('button', { name: /Giọng đọc/ })).toHaveTextContent('Tự động (Google UK English Female)');
    a.unmount();
    await renderApp('#/cai-dat', { seed: settingsSeed() });
    expect(screen.getByRole('button', { name: /Giọng đọc/ })).toHaveTextContent('Tự động (Google US English)');
  });
});

describe('C6 đổi màn khi sheet đang mở', () => {
  // @ac C6-AC06
  it('Back hay đổi route khi sheet đang mở thì sheet đóng', async () => {
    await renderApp('#/thu-vien', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: /Tiếng Anh/ }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    window.location.hash = '#/tien-bo';
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
  });
});

describe('S5 xếp cụm bằng bàn phím', () => {
  // @ac S5-AC11
  it('nhấn một cụm đang có focus: focus sang cụm kế bên, xếp hết thì sang nút Kiểm tra', async () => {
    await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    const pool = () => [...document.querySelectorAll<HTMLElement>('[data-testid="s5-pool"] .chunk')];
    const n = pool().length;
    expect(n).toBeGreaterThan(1);
    for (let i = 0; i < n; i++) {
      const b = pool()[0];
      b.focus();
      fireEvent.click(b);
      await settle();
      if (i < n - 1) expect(pool()).toContain(document.activeElement);
    }
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Kiểm tra' }));
  });
});
