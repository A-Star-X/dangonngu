'use client';
import { useTranslations } from 'next-intl';

/** Khung xương một giá trị nhỏ (số liệu đang tính). */
export function ValueLoading() {
  const t = useTranslations('statusDisplay');
  return (
    <span className="inline-block h-[1em] w-10 rounded-dropdown bg-muted align-middle motion-safe:animate-pulse" aria-label={t('loading')} role="status" />
  );
}

/** Giá trị không có: "--". */
export function NAValue() {
  const t = useTranslations('statusDisplay');
  return <span aria-label={t('na')}>--</span>;
}
