// @spec T3-05, T4-06, T4-07
// Định dạng ngày giờ theo ngôn ngữ giao diện. Mốc ngày là ngày lịch theo giờ của máy (DATA-07).
import { startOfDay } from '@/domain/review';

const tag = (locale: string) => (locale === 'en' ? 'en-US' : 'vi-VN');
const lowerFirst = (s: string, locale: string) => s.charAt(0).toLocaleLowerCase(tag(locale)) + s.slice(1);

/** T4-07: "[Thứ], [ngày]/[tháng]", ví dụ "Thứ Năm, 8/10" (en: "Thursday, 10/8"). */
export function formatDayTitle(day: number, locale: string): string {
  return new Intl.DateTimeFormat(tag(locale), { weekday: 'long', day: 'numeric', month: 'numeric' }).format(new Date(day));
}

const WEEKDAY_SHORT_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** T4-04: thứ viết tắt dưới cột biểu đồ 7 ngày: "T2" ... "CN" (en: "Mon" ... "Sun"). */
export function formatWeekdayShort(day: number, locale: string): string {
  if (locale !== 'en') return WEEKDAY_SHORT_VI[new Date(day).getDay()];
  return new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(new Date(day));
}

/** "[ngày]/[tháng]" theo ngôn ngữ. */
export function formatDayMonth(at: number, locale: string): string {
  return new Intl.DateTimeFormat(tag(locale), { day: 'numeric', month: 'numeric' }).format(new Date(at));
}

/** Giờ:phút 24 giờ. */
export function formatTime(at: number, locale: string): string {
  return new Intl.DateTimeFormat(tag(locale), { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(at));
}

/** T4-06: giờ, kèm ngày khi khác hôm nay: "14:05" hoặc "14:05, 8/10". */
export function formatSessionTime(at: number, now: number, locale: string): string {
  const hm = formatTime(at, locale);
  return startOfDay(at) === startOfDay(now) ? hm : `${hm}, ${formatDayMonth(at, locale)}`;
}

/** T3-05: "hôm nay", "hôm qua" hoặc "N ngày trước" theo ngày lịch (en: "today", "yesterday", "N days ago"). */
export function formatDaysAgo(at: number, now: number, locale: string): string {
  const n = Math.max(0, Math.round((startOfDay(now) - startOfDay(at)) / 86400000));
  // Chỉ dùng chữ ("hôm nay", "hôm qua") cho 0 và 1 ngày; tiếng Việt của Intl còn có "hôm kia" cho 2 ngày, spec dùng "N ngày trước".
  return lowerFirst(new Intl.RelativeTimeFormat(tag(locale), { numeric: n <= 1 ? 'auto' : 'always' }).format(-n, 'day'), locale);
}

/** Tên file xuất tiến độ dùng ngày theo giờ của máy: yyyy-mm-dd. */
export function isoDate(at: number): string {
  const d = new Date(at);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}
