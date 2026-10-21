'use client';
// @spec LP-01, AU-01
// Header của trang công khai: logo trái, hành động phải, viền dưới (rule giao diện: trang không có sidebar).
import { useTranslations } from 'next-intl';
import { buttonClass } from '@/components/ui/button-class';
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/providers/auth-provider';
import { PUBLIC_PATH, ROUTE_PATH } from '@/lib/routes';
import { Brand } from './brand';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

export function PublicHeader() {
  const t = useTranslations('public');
  const { status } = useAuth();
  const path = usePathname();
  // Đang ở trang Đăng nhập thì nút dẫn sang Đăng ký (và ngược lại), không có nút dẫn tới chính trang đang mở.
  const authLink = path === PUBLIC_PATH.login ? { href: PUBLIC_PATH.register, label: t('register') } : { href: PUBLIC_PATH.login, label: t('login') };
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4">
        <Link href={PUBLIC_PATH.home} className="rounded-dropdown" aria-label={t('home')}>
          <Brand />
        </Link>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
          {status === 'signed-in' ? (
            <Link href={ROUTE_PATH.hoc} className={buttonClass({ tone: 'outline', className: 'whitespace-nowrap' })}>
              {t('openApp')}
            </Link>
          ) : (
            <Link href={authLink.href} className={buttonClass({ tone: 'ghost', className: 'whitespace-nowrap' })} data-testid="public-auth-link">
              {authLink.label}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
