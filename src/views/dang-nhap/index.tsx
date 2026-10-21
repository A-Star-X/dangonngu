'use client';
// @spec AU-01, AU-03, AU-04, AU-05
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { AuthCard, Field } from '@/components/layout/auth-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from '@/i18n/navigation';
import { useLeaveWhenSignedIn, useNextPath } from '@/hooks/use-after-auth';
import { PUBLIC_PATH } from '@/lib/routes';
import { showApiError } from '@/lib/toast';
import { useSignIn } from './hooks/mutation/use-sign-in';
import { signInSchema, type SignInValues } from './utils/schema';

export function DangNhapView() {
  const t = useTranslations('auth');
  const tErr = useTranslations('apiError');
  const next = useNextPath();
  useLeaveWhenSignedIn();
  const signIn = useSignIn();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: '', password: '' } });
  const err = (k?: string) => (k ? t(`errors.${k}`) : undefined);

  const onSubmit = handleSubmit(async (v) => {
    try {
      await signIn.mutateAsync(v);
      // Chuyển trang do useLeaveWhenSignedIn khi phiên đã có.
    } catch (e) {
      showApiError(e, (c) => tErr(c));
    }
  });

  return (
    <AuthCard
      title={t('signInTitle')}
      description={t('signInDesc')}
      footer={t.rich('noAccount', { link: (c) => <Link href={`${PUBLIC_PATH.register}${next !== '/hoc' ? `?tiep=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-foreground underline underline-offset-4">{c}</Link> })}
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <Field id="email" label={t('email')} error={err(errors.email?.message)}>
          <Input id="email" type="email" autoComplete="email" inputMode="email" invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} {...register('email')} />
        </Field>
        <Field id="password" label={t('password')} error={err(errors.password?.message)}>
          <Input id="password" type="password" autoComplete="current-password" invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} {...register('password')} />
        </Field>
        <Button tone="primary" type="submit" busy={isSubmitting} className="mt-2 w-full">
          {t('signIn')}
        </Button>
      </form>
    </AuthCard>
  );
}
