'use client';
// @spec AU-01, AU-02, AU-06
// Khung trang đăng nhập, đăng ký: một cột trên mobile; từ md chia hai cột (giới thiệu ngắn và form) để không có
// khối nhỏ giữa vùng trắng (rule giao diện: trang công khai, panel lớn).
import type { ReactNode } from 'react';
import { Check, HardDrive } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/providers/auth-provider';
import { statusBadgeClass } from '@/utils/status-badge-colors';
import { cn } from '@/lib/utils';

export function AuthCard({ title, description, children, footer }: { title: string; description: string; children: ReactNode; footer: ReactNode }) {
  const t = useTranslations('auth');
  const { mode } = useAuth();
  return (
    <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2 md:gap-10">
      <section className="flex flex-col gap-4 rounded-card bg-muted p-6 max-md:order-2">
        <h2 className="text-description font-medium">{t('asideTitle')}</h2>
        <ul className="flex flex-col gap-3">
          {(['a', 'b', mode === 'local' ? 'cLocal' : 'c'] as const).map((k) => (
            <li key={k} className="flex items-start gap-2 text-data">
              <Check className="mt-1 size-4 flex-none text-primary" aria-hidden />
              {t(`aside.${k}`)}
            </li>
          ))}
        </ul>
      </section>
      <section className="flex flex-col gap-5 rounded-card bg-card p-6 md:max-w-lg" aria-labelledby="auth-title">
        <header className="flex flex-col gap-1">
          <h1 id="auth-title" className="text-2xl font-bold">
            {title}
          </h1>
          <p className="text-description">{description}</p>
        </header>
        {mode === 'local' && (
          <p className={cn('flex items-start gap-2 rounded-card border px-3 py-2 text-sm', statusBadgeClass('neutral'))} data-testid="local-mode">
            <HardDrive className="mt-0.5 size-4 flex-none" aria-hidden />
            {t('localMode')}
          </p>
        )}
        {children}
        <div className="border-t border-border pt-4 text-description">{footer}</div>
      </section>
    </div>
  );
}

/** Ô nhập có nhãn và lỗi ngay dưới ô (rule form: lỗi field hiện inline). */
export function Field({ id, label, error, children, hint }: { id: string; label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-label">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="text-description">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
