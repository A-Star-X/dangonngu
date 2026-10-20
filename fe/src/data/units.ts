// @spec T3-09, T3-10, S10-03, DATA-07
// Số liệu theo unit cho Thư viện cách xem Unit và Chi tiết Unit.
import { levelOf } from './contract';
import { nextUnitIndex } from './path';
import type { Progress } from './progress';
import { displayStatus, type DisplayStatus } from './review';
import type { LanguageData, Unit } from './types';

/** Trạng thái hiển thị của từng câu trong unit, theo thứ tự câu. */
export function unitStatuses(unit: Unit, p: Progress, now: number): DisplayStatus[] {
  return unit.ids.map((id) => displayStatus(p.items[id], now));
}

export interface UnitCounts {
  daNho: number;
  canOn: number;
  chuaHoc: number;
}

export function unitCounts(unit: Unit, p: Progress, now: number): UnitCounts {
  const c: UnitCounts = { daNho: 0, canOn: 0, chuaHoc: 0 };
  for (const st of unitStatuses(unit, p, now)) {
    if (st === 'da-nho') c.daNho++;
    else if (st === 'can-on') c.canOn++;
    else c.chuaHoc++;
  }
  return c;
}

/** T3-10: đã học là mọi câu đã qua bước ghi nhớ; đang học dở là có ít nhất một câu nhưng chưa đủ. */
export function unitLearnState(unit: Unit, p: Progress): 'da-hoc' | 'dang-hoc' | 'chua' {
  const n = unit.ids.filter((id) => p.items[id]?.status === 'da-hoc').length;
  if (n === 0) return 'chua';
  return n === unit.ids.length ? 'da-hoc' : 'dang-hoc';
}

/** Mã trình độ của unit, lấy từ câu đầu (DATA-04). */
export function unitLevel(d: LanguageData, unit: Unit): string | undefined {
  return levelOf(d.byId.get(unit.ids[0]));
}

/** T3-10: trình độ mặc định là trình độ của unit đang học; học hết lộ trình thì là trình độ đầu. */
export function defaultLevel(d: LanguageData, p: Progress, levels: string[]): string | undefined {
  const ui = nextUnitIndex(d, p);
  const lv = ui === null ? undefined : unitLevel(d, d.units[ui]);
  return lv && levels.includes(lv) ? lv : levels[0];
}
