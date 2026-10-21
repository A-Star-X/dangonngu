'use client';
// @spec AU-02, AU-03, AU-04, AU-05
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AuthCard, Field } from '@/components/layout/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { useLeaveWhenSignedIn, useNextPath } from '@/hooks/use-after-auth';
import { PUBLIC_PATH } from '@/lib/routes';
import { useAuth } from '@/providers/auth-provider';
import { showApiError } from '@/lib/toast';
import { statusBadgeClass } from '@/utils/status-badge-colors';
import { cn } from '@/lib/utils';
import { PASSWORD_MIN } from '@/views/dang-nhap/utils/schema';
import { useSignUp } from './hooks/mutation/use-sign-up';
import { signUpSchema, type SignUpValues } from './utils/schema';

export function DangKyView() {
  const t = useTranslations('auth');
  const tErr = useTranslations('apiError');
  const next = useNextPath();
  useLeaveWhenSignedIn();
  const { mode } = useAuth();
  const signUp = useSignUp();
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema), defaultValues: { email: '', password: '', confirm: '' } });
  const err = (k?: string) => (k ? t(`errors.${k}`, { min: PASSWORD_MIN }) : undefined);

  const onSubmit = handleSubmit(async (v) => {
    try {
      const r = await signUp.mutateAsync(v);
      // AU-02: máy chủ bật xác nhận email thì chưa có phiên; báo người dùng mở email.
      if (r.needsConfirm) setConfirmEmail(v.email.trim());
    } catch (e) {
      showApiError(e, (c) => tErr(c));
    }
  });

  const loginHref = `${PUBLIC_PATH.login}${next !== '/hoc' ? `?tiep=${encodeURIComponent(next)}` : ''}`;
  return (
    <AuthCard
      title={t('signUpTitle')}
      description={mode === 'local' ? t('signUpDescLocal') : t('signUpDesc')}
      footer={t.rich('haveAccount', { link: (c) => <Link href={loginHref} className="font-semibold text-foreground underline underline-offset-4">{c}</Link> })}
    >
      {confirmEmail ? (
        <p className={cn('flex items-start gap-2 rounded-card border px-3 py-3 text-data', statusBadgeClass('success'))} role="status" data-testid="confirm-email">
          <MailCheck className="mt-1 size-4 flex-none" aria-hidden />
          {t('checkEmail', { email: confirmEmail })}
        </p>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <Field id="email" label={t('email')} error={err(errors.email?.message)}>
            <Input id="email" type="email" autoComplete="email" inputMode="email" invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
          </Field>
          <Field id="password" label={t('password')} error={err(errors.password?.message)} hint={t('passwordHint', { min: PASSWORD_MIN })}>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              invalid={!!errors.password}
              aria-describedby={errors.password ? 'password-error' : 'password-hint'}
              {...register('password')}
            />
          </Field>
          <Field id="confirm" label={t('confirm')} error={err(errors.confirm?.message)}>
            <Input id="confirm" type="password" autoComplete="new-password" invalid={!!errors.confirm} aria-describedby={errors.confirm ? 'confirm-error' : undefined} {...register('confirm')} />
          </Field>
          <Button tone="primary" type="submit" busy={isSubmitting} className="mt-2 w-full">
            {t('signUp')}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
