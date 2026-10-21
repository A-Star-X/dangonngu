'use client';
import { useLearning, type LearningState } from '@/providers/learning-provider';
import type { CatalogLanguage, LanguageData, PackId } from '@/domain';

export type ReadyLearning = LearningState & { d: LanguageData; language: CatalogLanguage; pack: PackId };

/** Dữ liệu của ngôn ngữ đang học, khi đã tải xong (khung khu học chỉ hiện trang khi đã có). */
export function useLearningData(): ReadyLearning | null {
  const app = useLearning();
  if (app.data?.status !== 'ready' || !app.language || !app.pack) return null;
  return { ...app, d: app.data.value, language: app.language, pack: app.pack };
}
