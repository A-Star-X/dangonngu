// @spec DATA-06, DATA-07, S3-03, S3-04, S3-05, S3-06, S3-08, S5-07, S5-08, S5-09
// Thao tác thuần trên Progress cho một phiên học. Mỗi hàm trả về Progress mới.
import { applyCheck, applyMemorize } from './review';
import { newSessionId, type Attempt, type Nguon, type Progress, type Session, type SessionStep } from './progress';

export function startSession(p: Progress, nguon: Nguon, itemIds: number[], params: Record<string, string>, now: number): { progress: Progress; session: Session } {
  let id = newSessionId(now);
  while (p.sessions.some((s) => s.id === id)) id = newSessionId(now);
  const session: Session = { id, nguon, itemIds, startedAt: now, position: 0, step: 'ghi-nho', params };
  // S3-08, S5-09: tối đa một phiên học dở và một bài kiểm tra dở mỗi ngôn ngữ; bắt đầu phiên mới cùng loại thì phiên dở cũ coi như kết thúc.
  const isTest = nguon === 'kiem-tra';
  const sessions = p.sessions.map((s) =>
    s.completedAt === undefined && s.abandonedAt === undefined && (s.nguon === 'kiem-tra') === isTest ? { ...s, abandonedAt: now } : s,
  );
  return { progress: { ...p, sessions: [...sessions, session] }, session };
}

const patchSession = (p: Progress, id: string, patch: Partial<Session>): Progress => ({
  ...p,
  sessions: p.sessions.map((s) => (s.id === id ? { ...s, ...patch } : s)),
});

export function moveTo(p: Progress, sessionId: string, position: number, step: SessionStep): Progress {
  return patchSession(p, sessionId, { position, step, hintedItemId: undefined });
}

/** S3-05: ghi ngay khi mở gợi ý, để thoát hay tải lại trang rồi làm tiếp vẫn tính là đã dùng gợi ý. */
export function markHinted(p: Progress, sessionId: string, itemId: number): Progress {
  return patchSession(p, sessionId, { hintedItemId: itemId });
}

export function recordMemorize(p: Progress, sessionId: string, itemId: number, outcome: 'nho' | 'can-on', now: number): Progress {
  const attempt: Attempt = { sessionId, itemId, at: now, kind: 'ghi-nho', outcome, hinted: false };
  return {
    ...p,
    attempts: [...p.attempts, attempt],
    items: { ...p.items, [itemId]: applyMemorize(p.items[itemId], outcome, now) },
  };
}

/** Ghi kết quả một câu trắc nghiệm hoặc kiểm tra. Chỉ ghi một lần mỗi câu mỗi phiên (lần sai đầu tiên hoặc lần đúng). */
export function recordCheck(
  p: Progress,
  sessionId: string,
  itemId: number,
  correct: boolean,
  hinted: boolean,
  now: number,
  kind: Attempt['kind'] = 'trac-nghiem',
): Progress {
  if (p.attempts.some((a) => a.sessionId === sessionId && a.itemId === itemId && a.kind === kind)) return p;
  const attempt: Attempt = { sessionId, itemId, at: now, kind, outcome: correct ? 'dung' : 'sai', hinted };
  const next = applyCheck(p.items[itemId], correct, hinted, now);
  const items = { ...p.items };
  if (next) items[itemId] = next;
  return { ...p, attempts: [...p.attempts, attempt], items };
}

/** S5-09: lưu bước và câu đang làm của bài kiểm tra. */
export function moveTest(p: Progress, sessionId: string, stepIndex: number, position: number): Progress {
  const s = p.sessions.find((x) => x.id === sessionId);
  if (!s) return p;
  return patchSession(p, sessionId, { position, params: { ...(s.params ?? {}), buocSo: String(stepIndex) } });
}

/** Bỏ dở một phiên: không mở lại được để làm tiếp. Kết quả các câu đã làm vẫn giữ. */
export function abandonSession(p: Progress, sessionId: string, now: number): Progress {
  const s = p.sessions.find((x) => x.id === sessionId);
  if (!s || s.completedAt !== undefined || s.abandonedAt !== undefined) return p;
  return patchSession(p, sessionId, { abandonedAt: now });
}

export function completeSession(p: Progress, sessionId: string, now: number): Progress {
  const s = p.sessions.find((x) => x.id === sessionId);
  return patchSession(p, sessionId, { completedAt: now, position: s?.itemIds.length ?? 0 });
}

export type ItemResult = 'chua' | 'nho' | 'can-on';

/** Kết quả của từng câu trong phiên, dùng cho dải ô (C2) và tổng kết (S3-06). */
export function sessionResults(p: Progress, session: Session): { perItem: Map<number, ItemResult>; cleanCount: number; reviewIds: number[] } {
  const perItem = new Map<number, ItemResult>();
  let cleanCount = 0;
  const reviewIds: number[] = [];
  for (const id of session.itemIds) {
    const atts = p.attempts.filter((a) => a.sessionId === session.id && a.itemId === id);
    const mem = atts.find((a) => a.kind === 'ghi-nho');
    // Phiên kiểm tra (S5) có thể có hai lượt mỗi câu: nghe-chon và sap-xep.
    const checks = atts.filter((a) => a.kind !== 'ghi-nho');
    if (!mem && checks.length === 0) {
      perItem.set(id, 'chua');
      continue;
    }
    const badCheck = checks.some((a) => a.outcome === 'sai' || a.hinted);
    const bad = mem?.outcome === 'can-on' || badCheck;
    if (checks.length > 0 && !badCheck) cleanCount++;
    perItem.set(id, bad ? 'can-on' : 'nho');
    if (bad) reviewIds.push(id);
  }
  return { perItem, cleanCount, reviewIds };
}
