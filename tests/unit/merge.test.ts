// DATA-14: gộp tiến độ và cài đặt giữa máy này và tài khoản.
import { describe, expect, it } from 'vitest';
import {
  defaultSettings,
  emptyProgress,
  mergeProgress,
  mergeSettings,
  parseImport,
  makeExport,
  recordCheck,
  recordMemorize,
  sameProgress,
  startSession,
  completeSession,
  moveTo,
  type Progress,
  type Session,
  newSessionId,
} from '@/domain';
import { NOW, PROGRESS_30 } from './helpers';

const H = 3600000;

/** Học vài câu trong một phiên mới, bắt đầu lúc `t`. */
function learn(p: Progress, ids: number[], t: number, outcome: 'nho' | 'can-on' = 'nho'): { p: Progress; s: Session } {
  const r = startSession(p, 'lo-trinh', ids, {}, t);
  let q = r.progress;
  ids.forEach((id, i) => {
    q = recordMemorize(q, r.session.id, id, outcome, t + i * 1000);
    q = moveTo(q, r.session.id, i, 'kiem-tra');
  });
  return { p: q, s: r.session };
}

describe('DATA-14 gộp tiến độ', () => {
  // @ac DATA-AC22
  it('gộp hai bản khác nhau không mất phiên, lượt, trạng thái câu nào', () => {
    const a = learn(emptyProgress(), [1, 2], NOW - 5 * H).p;
    const b = learn(emptyProgress(), [3, 4], NOW - 2 * H, 'can-on').p;
    const m = mergeProgress(a, b);
    expect(m.sessions.map((s) => s.id).sort()).toEqual([...a.sessions, ...b.sessions].map((s) => s.id).sort());
    expect(m.attempts).toHaveLength(a.attempts.length + b.attempts.length);
    expect(Object.keys(m.items).sort()).toEqual(['1', '2', '3', '4']);
    expect(m.items['3'].streak).toBe(0);
    expect(m.items['1'].streak).toBe(1);
  });

  // @ac DATA-AC22
  it('không phụ thuộc thứ tự hai bản; gộp nhiều lần vẫn như nhau', () => {
    const a = PROGRESS_30 as unknown as Progress;
    const b = learn(emptyProgress(), [1, 2, 3], NOW - H).p;
    const ab = mergeProgress(a, b);
    const ba = mergeProgress(b, a);
    expect(ab).toEqual(ba);
    expect(mergeProgress(ab, b)).toEqual(ab);
    expect(mergeProgress(ab, a)).toEqual(ab);
    expect(mergeProgress(ab, ab)).toEqual(ab);
    expect(sameProgress(mergeProgress(a, a), mergeProgress(mergeProgress(a, a), a))).toBe(true);
  });

  // @ac DATA-AC22
  it('phiên trùng id lấy bản đi xa hơn; câu trùng lấy bản có lastAt mới hơn', () => {
    const base = learn(emptyProgress(), [1, 2, 3], NOW - 3 * H);
    const id = base.s.id;
    // Máy A: vị trí 1; máy B: đã xong phiên.
    const onA = moveTo(base.p, id, 1, 'ghi-nho');
    const onB = completeSession(moveTo(base.p, id, 2, 'kiem-tra'), id, NOW - 2 * H);
    const m1 = mergeProgress(onA, onB);
    const s1 = m1.sessions.find((s) => s.id === id)!;
    expect(s1.completedAt).toBe(NOW - 2 * H);
    expect(mergeProgress(onB, onA)).toEqual(m1);
    // Cùng chưa xong: vị trí lớn hơn thắng; cùng vị trí: bước kiểm tra thắng bước ghi nhớ.
    const far = moveTo(base.p, id, 2, 'ghi-nho');
    const near = moveTo(base.p, id, 1, 'kiem-tra');
    expect(mergeProgress(near, far).sessions.find((s) => s.id === id)!.position).toBe(2);
    const step = moveTo(base.p, id, 1, 'kiem-tra');
    const mem = moveTo(base.p, id, 1, 'ghi-nho');
    expect(mergeProgress(mem, step).sessions.find((s) => s.id === id)!.step).toBe('kiem-tra');

    // Câu 1: máy A học lại sau (lastAt mới hơn) và chọn Cần ôn lại.
    const later = recordMemorize(base.p, id, 1, 'can-on', NOW - H);
    const m2 = mergeProgress(base.p, later);
    expect(m2.items['1'].lastAt).toBe(NOW - H);
    expect(m2.items['1'].streak).toBe(0);
    expect(mergeProgress(later, base.p)).toEqual(m2);
  });

  // @ac DATA-AC22
  it('lượt trả lời trùng (cùng phiên, câu, loại, thời điểm) chỉ giữ một', () => {
    const { p, s } = learn(emptyProgress(), [1], NOW - H);
    const checked = recordCheck(p, s.id, 1, true, false, NOW - H + 5000);
    const m = mergeProgress(checked, checked);
    expect(m.attempts).toHaveLength(checked.attempts.length);
  });

  // @ac DATA-AC23
  it('xóa tiến độ (baseAt) rồi gộp với bản cũ: phần cũ không quay lại, phần học sau mốc vẫn giữ', () => {
    const old = learn(emptyProgress(), [1, 2], NOW - 10 * H).p;
    const cleared: Progress = { ...emptyProgress(), baseAt: NOW - 5 * H };
    // Máy khác học thêm sau khi xóa.
    const otherAfter = learn(old, [3], NOW - 2 * H).p;
    const m = mergeProgress(cleared, otherAfter);
    expect(m.baseAt).toBe(NOW - 5 * H);
    expect(Object.keys(m.items)).toEqual(['3']);
    expect(m.sessions).toHaveLength(1);
    expect(m.attempts.every((a) => a.at > NOW - 5 * H)).toBe(true);
    expect(mergeProgress(otherAfter, cleared)).toEqual(m);
    // Gộp lại với bản cũ trên tài khoản lần nữa: vẫn không quay lại.
    expect(mergeProgress(m, old)).toEqual(m);
  });

  // @ac DATA-AC23
  it('nhập tệp tiến độ rồi gộp với bản cũ: giữ đúng nội dung tệp', () => {
    const fromFile = learn(emptyProgress(), [7, 8], NOW - 48 * H).p;
    const text = JSON.stringify(makeExport('fluency', 'en', defaultSettings(), fromFile, NOW));
    const parsed = parseImport(text, 'fluency', 'en')!;
    const imported: Progress = { ...parsed, baseAt: NOW };
    const remoteOld = learn(emptyProgress(), [1, 2, 3], NOW - 3 * H).p;
    const m = mergeProgress(imported, remoteOld);
    expect(Object.keys(m.items).sort()).toEqual(['7', '8']);
    expect(m.sessions).toEqual(fromFile.sessions);
    expect(m.attempts).toEqual(fromFile.attempts);
    expect(mergeProgress(remoteOld, imported)).toEqual(m);
  });
});

describe('DATA-14 gộp cài đặt', () => {
  // @ac DATA-AC22
  it('giá trị của tài khoản thắng; bộ và giọng theo ngôn ngữ gộp lại; đã xem hướng dẫn ở một nơi là đã xem', () => {
    const local = { ...defaultSettings(), lang: 'ja', packByLang: { ja: 'fluency' as const }, voiceByLang: { ja: 'v-ja' }, weeklyGoal: 3, guideSeen: true };
    const remote = { lang: 'en', packByLang: { en: 'global' as const }, voiceByLang: { en: 'v-en' }, weeklyGoal: 9, rate: 1.25, guideSeen: false };
    const m = mergeSettings(local, remote);
    expect(m.lang).toBe('en');
    expect(m.packByLang).toEqual({ ja: 'fluency', en: 'global' });
    expect(m.voiceByLang).toEqual({ ja: 'v-ja', en: 'v-en' });
    expect(m.weeklyGoal).toBe(9);
    expect(m.rate).toBe(1.25);
    expect(m.guideSeen).toBe(true);
    expect(mergeSettings(local, null)).toBe(local);
    // Tài khoản chưa chọn ngôn ngữ: giữ ngôn ngữ trên máy.
    expect(mergeSettings(local, { weeklyGoal: 4 }).lang).toBe('ja');
  });

  // @ac DATA-AC22
  it('bản trên tài khoản sai kiểu (bản app khác ghi): bỏ giá trị sai, giữ giá trị trên máy', () => {
    const local = { ...defaultSettings(), lang: 'ja', packByLang: { ja: 'fluency' as const }, weeklyGoal: 3, rate: 0.75 };
    const bad = { lang: 'Tiếng Nhật', packByLang: { en: 'khong-co' }, voiceByLang: { en: 42 }, weeklyGoal: 999, rate: 'nhanh' } as unknown as Partial<typeof local>;
    const m = mergeSettings(local, bad);
    expect(m.lang).toBe('ja');
    expect(m.packByLang).toEqual({ ja: 'fluency' });
    expect(m.voiceByLang).toEqual({});
    expect(m.weeklyGoal).toBe(5);
    expect(m.rate).toBe(1);
    expect(mergeSettings(local, 'hỏng' as unknown as Partial<typeof local>)).toBe(local);
  });
});

describe('DATA-14 mã phiên không trùng giữa các máy', () => {
  // @ac DATA-AC22
  it('hai phiên bắt đầu cùng một mili giây (hai tab, hai máy) có mã khác nhau; gộp không nhập hai phiên làm một', () => {
    const now = Date.UTC(2026, 9, 8, 3);
    const ids = new Set(Array.from({ length: 200 }, () => newSessionId(now)));
    expect(ids.size).toBe(200);
    const a = startSession(emptyProgress(), 'lo-trinh', [1, 2], {}, now);
    const b = startSession(emptyProgress(), 'lo-trinh', [3, 4], {}, now);
    expect(a.session.id).not.toBe(b.session.id);
    const m = mergeProgress(a.progress, b.progress);
    expect(m.sessions.map((x) => x.itemIds)).toEqual(expect.arrayContaining([[1, 2], [3, 4]]));
  });
});

