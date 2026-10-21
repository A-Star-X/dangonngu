'use client';
// @spec S5-04, S5-07
import { useCallback } from 'react';
import { speak } from '@/lib/speech';
import { useLearning } from '@/providers/learning-provider';

/** Đọc một đoạn bằng giọng và tốc độ đã chọn cho ngôn ngữ đó. */
export function useSay() {
  const { settings } = useLearning();
  return useCallback(
    (text: string, lang: string, locale?: string, voiceURI?: string) =>
      speak({ text, lang, locale, voiceURI: voiceURI ?? settings.voiceByLang[lang], rate: settings.rate }),
    [settings],
  );
}
