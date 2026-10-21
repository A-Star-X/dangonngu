// @spec DATA-14
// Gộp tiến độ của cùng một cặp (bộ, ngôn ngữ) từ hai nơi (máy này và tài khoản trên máy chủ).
// Gộp không làm mất phần nào: phiên theo id, lượt trả lời theo (phiên, câu, loại, thời điểm), trạng thái câu lấy bản mới hơn.
// Kết quả không phụ thuộc thứ tự hai bản, gộp lại nhiều lần vẫn ra cùng kết quả.
import { defaultSettings, sanitizeSettings, type Attempt, type ItemState, type Progress, type Session, type Settings } from './progress';

/** Phiên nào đi xa hơn: đã xong hoặc đã bỏ, rồi vị trí lớn hơn, rồi đã sang bước kiểm tra. */
function further(a: Session, b: Session): Session {
  const doneA = a.completedAt !== undefined || a.abandonedAt !== undefined;
  const doneB = b.completedAt !== undefined || b.abandonedAt !== undefined;
  if (doneA !== doneB) return doneA ? a : b;
  if (a.position !== b.position) return a.position > b.position ? a : b;
  if (a.step !== b.step) return a.step === 'kiem-tra' ? a : b;
  if ((a.hintedItemId !== undefined) !== (b.hintedItemId !== undefined)) return a.hintedItemId !== undefined ? a : b;
  return JSON.stringify(a) >= JSON.stringify(b) ? a : b;
}

function newerItem(a: ItemState, b: ItemState): ItemState {
  if (a.lastAt !== b.lastAt) return a.lastAt > b.lastAt ? a : b;
  if (a.streak !== b.streak) return a.streak > b.streak ? a : b;
  if (a.status !== b.status) return a.status === 'da-hoc' ? a : b;
  return a.due >= b.due ? a : b;
}

const attemptKey = (x: Attempt) => `${x.sessionId}|${x.itemId}|${x.kind}|${x.at}`;

/** Bỏ phần cũ hơn mốc `since` (mốc xóa hay nhập của bản kia). */
function after(p: Progress, since: number): Progress {
  const items: Record<string, ItemState> = {};
  for (const [id, s] of Object.entries(p.items)) if (s.lastAt > since) items[id] = s;
  return {
    schema: 1,
    sessions: p.sessions.filter((s) => s.startedAt > since),
    attempts: p.attempts.filter((a) => a.at > since),
    items,
  };
}

export function mergeProgress(a: Progress, b: Progress): Progress {
  const baseA = a.baseAt ?? -Infinity;
  const baseB = b.baseAt ?? -Infinity;
  // Bản có mốc mới hơn là nền; bản kia chỉ góp phần mới hơn mốc đó.
  let x = a;
  let y = b;
  if (baseB > baseA) {
    x = b;
    y = a;
  }
  const base = x.baseAt;
  if (base !== undefined && base !== (y.baseAt ?? undefined)) y = after(y, base);

  const sessions = new Map<string, Session>();
  for (const s of [...x.sessions, ...y.sessions]) {
    const cur = sessions.get(s.id);
    sessions.set(s.id, cur ? further(cur, s) : s);
  }
  const attempts = new Map<string, Attempt>();
  for (const at of [...x.attempts, ...y.attempts]) if (!attempts.has(attemptKey(at))) attempts.set(attemptKey(at), at);
  const items: Record<string, ItemState> = { ...x.items };
  for (const [id, s] of Object.entries(y.items)) items[id] = items[id] ? newerItem(items[id], s) : s;

  const out: Progress = {
    schema: 1,
    sessions: [...sessions.values()].sort((p, q) => p.startedAt - q.startedAt || (p.id < q.id ? -1 : p.id > q.id ? 1 : 0)),
    attempts: [...attempts.values()].sort((p, q) => p.at - q.at || (attemptKey(p) < attemptKey(q) ? -1 : 1)),
    items: Object.fromEntries(Object.entries(items).sort(([p], [q]) => Number(p) - Number(q))),
  };
  if (base !== undefined) out.baseAt = base;
  return out;
}

export function sameProgress(a: Progress, b: Progress): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

/**
 * Cài đặt lấy từ tài khoản khi đăng nhập trên máy khác: giá trị của tài khoản thắng; bộ đã chọn và giọng đã chọn
 * của từng ngôn ngữ gộp lại; đã xem hướng dẫn ở một nơi thì coi như đã xem.
 */
export function mergeSettings(local: Settings, remote: Partial<Settings> | null | undefined): Settings {
  if (!remote) return local;
  // Bản trên tài khoản có thể do bản app khác ghi: kiểm như bản trên máy trước khi gộp.
  const r = typeof remote === 'object' && !Array.isArray(remote) ? sanitizeSettings(remote) : null;
  if (!r) return local;
  remote = {
    lang: r.lang,
    packByLang: r.packByLang,
    voiceByLang: r.voiceByLang,
    rate: 'rate' in remote ? r.rate : undefined,
    weeklyGoal: 'weeklyGoal' in remote ? r.weeklyGoal : undefined,
    guideSeen: r.guideSeen,
  };
  const base = defaultSettings();
  return {
    ...base,
    ...local,
    lang: remote.lang ?? local.lang,
    packByLang: { ...local.packByLang, ...(remote.packByLang ?? {}) },
    voiceByLang: { ...local.voiceByLang, ...(remote.voiceByLang ?? {}) },
    rate: remote.rate ?? local.rate,
    weeklyGoal: remote.weeklyGoal ?? local.weeklyGoal,
    guideSeen: Boolean(local.guideSeen || remote.guideSeen),
    schema: 1,
  };
}
