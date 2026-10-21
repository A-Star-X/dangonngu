import { useCallback } from 'react';
import { useLocale } from 'next-intl';
import type { CatalogLanguage } from '@/domain';
import { inSentence, languageName } from '@/lib/language-name';

/** Tên ngôn ngữ đang học theo ngôn ngữ giao diện; `mid` để đặt giữa câu. */
export function useLanguageName() {
  const locale = useLocale();
  return useCallback(
    (lang: Pick<CatalogLanguage, 'id' | 'name'> | undefined, mid = false) => {
      if (!lang) return '';
      const n = languageName(lang, locale);
      return mid ? inSentence(n, locale) : n;
    },
    [locale],
  );
}
