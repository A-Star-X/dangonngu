// @spec LP-06, AU-08, C5-08
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PUBLIC_PATH } from '@/lib/routes';
import { isDemo } from '@/lib/app-env';
import { PartnerLogos } from './partner-logos';

export async function PublicFooter() {
  const t = await getTranslations('public');
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        {/* C5-08: dưới sm header không đủ chỗ, logo đơn vị đồng hành nằm ở chân trang, trên dòng bản quyền. */}
        <PartnerLogos size="sm" className="sm:hidden" />
        <p>{t('footer', { year: new Date().getFullYear() })}</p>
        {/* AU-08: bản dùng thử không có tài khoản nên không có liên kết Đăng nhập, Đăng ký. */}
        {!isDemo() && (
          <nav aria-label={t('footerNav')}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              <li>
                <Link className="inline-flex min-h-11 items-center hover:text-foreground hover:underline" href={PUBLIC_PATH.login}>
                  {t('login')}
                </Link>
              </li>
              <li>
                <Link className="inline-flex min-h-11 items-center hover:text-foreground hover:underline" href={PUBLIC_PATH.register}>
                  {t('register')}
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </footer>
  );
}
