// @spec DATA-07
// Quy tắc câu cần ôn. Một khái niệm "cần ôn" duy nhất cho toàn app.
import type { ItemState, Outcome, Progress } from './progress';

export const DAY = 24 * 60 * 60 * 1000;
/** Khoảng ôn theo streak 1, 2, 3, 4, từ 5 trở lên (ngày). streak 0: đến hạn ngay. */
export const INTERVAL_DAYS = [1, 3, 7, 14, 30];

export type DisplayStatus = 'chua-hoc' | 'da-nho' | 'can-on';

export function dueAfter(streak: number, at: number): number {
  if (streak <= 0) return at;
  // Cộng theo ngày lịch (giữ giờ trên đồng hồ), để máy ở nơi có giờ mùa hè không lệch một giờ thành đến hạn sớm.
  const d = new Date(at);
  d.setDate(d.getDate() + INTERVAL_DAYS[Math.min(streak, INTERVAL_DAYS.length) - 1]);
  return d.getTime();
}

/** Sau bước ghi nhớ: "Tôi nhớ" tăng streak, "Cần ôn lại" về 0. */
export function applyMemorize(prev: ItemState | undefined, outcome: Extract<Outcome, 'nho' | 'can-on'>, at: number): ItemState {
  const streak = outcome === 'nho' ? (prev?.streak ?? 0) + 1 : 0;
  return { status: 'da-hoc', streak, due: dueAfter(streak, at), lastAt: at };
}

/** Sau bước trắc nghiệm hoặc kiểm tra: sai hoặc dùng gợi ý thì streak về 0; đúng không gợi ý thì giữ nguyên. */
export function applyCheck(prev: ItemState | undefined, correct: boolean, hinted: boolean, at: number): ItemState | undefined {
  if (correct && !hinted) return prev;
  return { status: prev?.status ?? 'kiem-tra', streak: 0, due: at, lastAt: at };
}

export function endOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export function startOfDay(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function displayStatus(state: ItemState | undefined, now: number): DisplayStatus {
  if (!state) return 'chua-hoc';
  return state.due <= endOfDay(now) ? 'can-on' : 'da-nho';
}

/** Các câu Cần ôn trong ngày, sắp theo due sớm nhất rồi theo id. */
export function dueItemIds(progress: Progress, now: number, validIds?: (id: number) => boolean): number[] {
  const limit = endOfDay(now);
  return Object.entries(progress.items)
    .filter(([id, s]) => s.due <= limit && (!validIds || validIds(Number(id))))
    .sort((a, b) => a[1].due - b[1].due || Number(a[0]) - Number(b[0]))
    .map(([id]) => Number(id));
}
