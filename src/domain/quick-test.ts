// @spec S5-01, S5-04, S5-05, S5-09, T2-04
// Bài kiểm tra nhanh của một unit: các bước, câu tham gia mỗi bước, bài làm dở.
import { chunkSentence } from './chunks';
import { nextUnitIndex } from './path';
import type { Progress, Session } from './progress';
import type { Item, LanguageData } from './types';

export type StepId = 'nghe-chon' | 'nghe-cum' | 'sap-xep';
export const ALL_STEPS: StepId[] = ['nghe-chon', 'nghe-cum', 'sap-xep'];
export const isStepId = (v: string): v is StepId => (ALL_STEPS as string[]).includes(v);

/** S5-01: unit theo tham số `unit` (số unit), mặc định unit đang học; học hết lộ trình thì unit cuối. */
export function resolveUnit(d: LanguageData, p: Progress, param?: string): number {
  const byParam = param ? d.units.findIndex((u) => u.number === Number(param)) : -1;
  if (byParam >= 0) return byParam;
  return nextUnitIndex(d, p) ?? d.units.length - 1;
}

/** Câu tham gia một bước: bước 2 và 3 bỏ câu chỉ có 1 cụm (S5-04, S5-05). */
export function stepEligible(d: LanguageData, items: Item[], step: StepId): Item[] {
  return step === 'nghe-chon' ? items : items.filter((it) => chunkSentence(it.en, d.lang).length >= 2);
}

export interface PausedTest {
  unit: number;
  step: StepId;
  /** Câu đang làm, đếm từ 1. */
  at: number;
  total: number;
}

/** S5-09: thông tin bài dở để T2 hiện dòng "Đang làm dở". */
export function pausedTestInfo(d: LanguageData, s: Session): PausedTest | null {
  const u = d.units.find((x) => String(x.number) === s.params?.unit);
  if (!u) return null;
  const items = u.ids.map((id) => d.byId.get(id)).filter((x): x is Item => !!x);
  const step = (s.params?.buoc ?? '').split(',')[Number(s.params?.buocSo) || 0];
  if (!step || !isStepId(step)) return null;
  const n = stepEligible(d, items, step).length;
  return { unit: u.number, step, at: Math.min(s.position, n - 1) + 1, total: n };
}
