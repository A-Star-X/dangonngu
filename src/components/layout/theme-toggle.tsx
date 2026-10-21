'use client';
// @spec FND-03, APP-02
// Nút đổi sáng, tối trên header: ô 36 px, bo góc dropdown, viền, nền card (rule giao diện).
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const t = useTranslations('shell');
  const { resolved, setTheme } = useTheme();
  const dark = resolved === 'dark';
  return (
    <button
      type="button"
      className="inline-flex size-9 flex-none items-center justify-center rounded-dropdown border border-border bg-card text-foreground hover:border-primary"
      aria-label={dark ? t('toLight') : t('toDark')}
      title={dark ? t('toLight') : t('toDark')}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      data-testid="theme-toggle"
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
    </button>
  );
}
