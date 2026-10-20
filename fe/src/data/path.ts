// @spec DATA-11, S3-01, T1-03, S5-09
// Lộ trình học và cách chọn nhóm câu cho phiên.
import { dueItemIds, startOfDay } from './review';
import { searchItems } from './search';
import type { Nguon, Progress } from './progress';
import type { LanguageData } from './types';

export const GROUP_SIZE = 8;

const learned = (p: Progress, id: number) => p.items[id]?.status === 'da-hoc';

/** Unit đầu tiên còn câu chưa qua bước ghi nhớ. null khi đã học hết lộ trình. */
export function nextUnitIndex(data: LanguageData, p: Progress): number | null {
  const i = data.units.findIndex((u) => u.ids.some((id) => !learned(p, id)));
  return i < 0 ? null : i;
}

/** Câu tiếp theo trên T1: câu chưa học đầu tiên của unit đầu tiên còn câu chưa học. */
export function nextItemId(data: LanguageData, p: Progress): number | null {
  const ui = nextUnitIndex(data, p);
  if (ui === null) return null;
  return data.units[ui].ids.find((id) => !learned(p, id)) ?? null;
}

export interface GroupResult {
  itemIds: number[];
  /** Tổng số nhóm (chỉ với tu-khoa). */
  groupCount?: number;
}

export function sessionGroup(nguon: Nguon, params: Record<string, string>, data: LanguageData, p: Progress, now: number): GroupResult {
  switch (nguon) {
    case 'lo-trinh': {
      const ui = nextUnitIndex(data, p);
      return { itemIds: ui === null ? [] : data.units[ui].ids.slice(0, GROUP_SIZE) };
    }
    case 'on-tap':
      return { itemIds: dueItemIds(p, now, (id) => data.byId.has(id)).slice(0, GROUP_SIZE) };
    case 'tu-khoa': {
      const results = params.q ? searchItems(data, params.q) : [];
      const k = Math.max(1, Number(params.nhom) || 1);
      return {
        itemIds: results.slice((k - 1) * GROUP_SIZE, k * GROUP_SIZE).map((i) => i.id),
        groupCount: Math.ceil(results.length / GROUP_SIZE),
      };
    }
    case 'cau': {
      const ui = data.unitIndexOf.get(Number(params.id));
      return { itemIds: ui === undefined ? [] : data.units[ui].ids.slice(0, GROUP_SIZE) };
    }
    // S3-01: nguồn unit, từ nút "Học unit này" ở S10.
    case 'unit': {
      const u = data.units.find((x) => x.number === Number(params.so));
      return { itemIds: u ? u.ids.slice(0, GROUP_SIZE) : [] };
    }
    default:
      return { itemIds: [] };
  }
}

/** Số phiên hoàn tất trong 7 ngày gần nhất, tính cả hôm nay. */
export function sessionsInLast7Days(p: Progress, now: number): number {
  const d = new Date(startOfDay(now));
  d.setDate(d.getDate() - 6);
  const from = d.getTime();
  return p.sessions.filter((s) => s.completedAt !== undefined && s.completedAt >= from && s.completedAt <= now).length;
}

/** Phiên dở (S3-08): phiên chưa hoàn tất, chưa bị thay. Tối đa một. */
export function openSession(p: Progress) {
  for (let i = p.sessions.length - 1; i >= 0; i--) {
    const s = p.sessions[i];
    if (s.completedAt === undefined && s.abandonedAt === undefined && s.nguon !== 'kiem-tra') return s;
  }
  return undefined;
}

/** S5-09: bài kiểm tra dở (tối đa một mỗi ngôn ngữ). */
export function openTest(p: Progress) {
  for (let i = p.sessions.length - 1; i >= 0; i--) {
    const s = p.sessions[i];
    if (s.completedAt === undefined && s.abandonedAt === undefined && s.nguon === 'kiem-tra') return s;
  }
  return undefined;
}
