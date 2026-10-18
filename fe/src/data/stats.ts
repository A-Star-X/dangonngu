// @spec T4-01, T4-02, T4-03, T4-04, T4-05, T4-06, T4-07, T3-05, DATA-07
// Số liệu tiến độ tính từ tiến độ đã lưu. Ngày là ngày lịch theo giờ của máy.
import { dueItemIds, endOfDay, startOfDay } from './review';
import type { Nguon, Progress, Session } from './progress';

export type RangeDays = 1 | 7 | 30;
export const RANGES: RangeDays[] = [1, 7, 30];

/** T4-01: mặc định 7 ngày. */
export function parseRange(v: string | undefined): RangeDays {
  return v === '1' ? 1 : v === '30' ? 30 : 7;
}

/** Đầu ngày của ngày cách `day` một số ngày lịch (an toàn khi đổi giờ mùa hè). */
export function addDays(day: number, n: number): number {
  const d = new Date(day);
  d.setDate(d.getDate() + n);
  return startOfDay(d.getTime());
}

/** Các ngày của khoảng k ngày kết thúc hôm nay, cũ trước (mốc đầu ngày). */
export function rangeDays(now: number, k: RangeDays): number[] {
  const today = startOfDay(now);
  return Array.from({ length: k }, (_, i) => addDays(today, i - (k - 1)));
}

export const dayEndOf = (day: number) => addDays(day, 1) - 1;

/** Phiên hoàn tất trong [from, to], mới nhất trước. */
export function completedSessions(p: Progress, from: number, to: number): Session[] {
  return p.sessions
    .filter((s) => s.completedAt !== undefined && s.completedAt >= from && s.completedAt <= to)
    .sort((a, b) => b.completedAt! - a.completedAt!);
}

/** Các câu khác nhau có ít nhất một lượt làm trong [from, to], theo id tăng dần. */
export function itemsLearned(p: Progress, from: number, to: number, valid?: (id: number) => boolean): number[] {
  const ids = new Set<number>();
  for (const a of p.attempts) if (a.at >= from && a.at <= to && (!valid || valid(a.itemId))) ids.add(a.itemId);
  return [...ids].sort((a, b) => a - b);
}

export interface RangeStats {
  sessions: number;
  items: number;
  dueToday: number;
}

/** T4-02: ba chỉ số. Số câu cần ôn không phụ thuộc khoảng. */
export function rangeStats(p: Progress, now: number, k: RangeDays, valid?: (id: number) => boolean): RangeStats {
  const days = rangeDays(now, k);
  const from = days[0];
  const to = endOfDay(now);
  return {
    sessions: completedSessions(p, from, to).length,
    items: itemsLearned(p, from, to, valid).length,
    dueToday: dueItemIds(p, now, valid).length,
  };
}

export interface DayCount {
  day: number;
  count: number;
}

/** T4-04: số câu khác nhau đã học mỗi ngày trong khoảng, cũ trước. */
export function dailyCounts(p: Progress, now: number, k: RangeDays, valid?: (id: number) => boolean): DayCount[] {
  return rangeDays(now, k).map((day) => ({ day, count: itemsLearned(p, day, dayEndOf(day), valid).length }));
}

export interface ReviewSchedule {
  today: number;
  tomorrow: number;
  next7: number;
}

/**
 * T4-05: Hôm nay gồm cả câu quá hạn (DATA-07). Ngày mai là các câu đến hạn trong ngày mai.
 * 7 ngày tới là các câu đến hạn từ ngày mai tới hết ngày thứ 7 tính từ hôm nay (gồm cả ngày mai).
 */
export function reviewSchedule(p: Progress, now: number, valid?: (id: number) => boolean): ReviewSchedule {
  const endToday = endOfDay(now);
  const today0 = startOfDay(now);
  const endTomorrow = dayEndOf(addDays(today0, 1));
  const end7 = dayEndOf(addDays(today0, 7));
  let tomorrow = 0;
  let next7 = 0;
  for (const [id, s] of Object.entries(p.items)) {
    if (valid && !valid(Number(id))) continue;
    if (s.due > endToday && s.due <= endTomorrow) tomorrow++;
    if (s.due > endToday && s.due <= end7) next7++;
  }
  return { today: dueItemIds(p, now, valid).length, tomorrow, next7 };
}

/** T4-08: đã có ít nhất một phiên hoàn tất. */
export const hasCompletedSession = (p: Progress) => p.sessions.some((s) => s.completedAt !== undefined);

/** T4-06: nhãn nguồn của phiên. */
export const NGUON_LABEL: Record<Nguon, string> = {
  'lo-trinh': 'Học theo lộ trình',
  'on-tap': 'Ôn tập',
  'tu-khoa': 'Học theo từ khóa',
  cau: 'Học một câu',
  'kiem-tra': 'Kiểm tra nhanh',
};

const WEEKDAY_LONG = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const weekdayShort = (day: number) => WEEKDAY_SHORT[new Date(day).getDay()];

/** T4-07: "[Thứ], [ngày]/[tháng]", ví dụ "Thứ Năm, 8/10". */
export function dayTitle(day: number): string {
  const d = new Date(day);
  return `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}`;
}

const two = (n: number) => String(n).padStart(2, '0');

/** T4-06: giờ, kèm ngày khi khác hôm nay. */
export function sessionTime(at: number, now: number): string {
  const d = new Date(at);
  const hm = `${two(d.getHours())}:${two(d.getMinutes())}`;
  return startOfDay(at) === startOfDay(now) ? hm : `${hm}, ${d.getDate()}/${d.getMonth() + 1}`;
}

/** T3-05: "hôm nay", "hôm qua" hoặc "N ngày trước" theo ngày lịch. */
export function daysAgoText(at: number, now: number): string {
  const n = Math.round((startOfDay(now) - startOfDay(at)) / 86400000);
  if (n <= 0) return 'hôm nay';
  if (n === 1) return 'hôm qua';
  return `${n} ngày trước`;
}
