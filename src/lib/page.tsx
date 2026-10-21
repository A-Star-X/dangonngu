// @spec APP-16
// Route trong src/app chỉ ghép metadata và view (rule công nghệ: route mỏng, UI trong src/views).
import { Suspense, type ComponentType } from 'react';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { pageMetadata } from './seo';

type LocaleParams = { params: Promise<{ locale: string }> };

export function makeMetadata(key: string, path: string, index: boolean, withDescription = false) {
  return async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: 'meta' });
    return pageMetadata({ title: t(`pages.${key}`), description: withDescription ? t('description') : undefined, path, index, locale });
  };
}

/** Trang dùng useSearchParams phải nằm trong Suspense để Next dựng sẵn được phần còn lại. */
export function makePage(View: ComponentType) {
  return async function Page({ params }: LocaleParams) {
    const { locale } = await params;
    setRequestLocale(locale);
    return (
      <Suspense fallback={null}>
        <View />
      </Suspense>
    );
  };
}
