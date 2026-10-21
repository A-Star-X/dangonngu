'use client';
// @spec APP-15
// Đổi ngôn ngữ giao diện. Lưu bằng cookie (next-intl), URL giữ nguyên, không có tiền tố ngôn ngữ.
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type AppLocale } from '@/i18n/routing';

export function LocaleSwitcher({ size = 'sm', className, id }: { size?: 'sm' | 'md'; className?: string; id?: string }) {
  const t = useTranslations('locale');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, start] = useTransition();
  return (
    <DropdownSelect
      id={id}
      size={size}
      align="end"
      className={className}
      ariaLabel={t('label')}
      value={locale}
      options={routing.locales.map((l) => ({ value: l, label: t(`name.${l}`), lang: l }))}
      onValueChange={(next) => {
        if (next === locale) return;
        start(() => {
          router.replace(`${pathname}${window.location.search}`, { locale: next as AppLocale });
          router.refresh();
        });
      }}
      renderValue={(o) => <span lang={o?.value}>{size === 'sm' ? (o?.value ?? '').toUpperCase() : o?.label}</span>}
    />
  );
}
