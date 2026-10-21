// @spec LP-06, APP-12
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PUBLIC_PATH } from '@/lib/routes';
import { HOST_URL } from '@/lib/host-url';

export async function PublicFooter() {
  const t = await getTranslations('public');
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>{t('footer', { year: new Date().getFullYear() })}</p>
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
            {HOST_URL && (
              <li>
                {/* APP-12: liên kết về trang học chính có icon mũi tên trái, như ở chân thanh bên. */}
                <a className="inline-flex min-h-11 items-center gap-1.5 hover:text-foreground hover:underline" href={HOST_URL}>
                  <ArrowLeft className="size-4 flex-none" aria-hidden />
                  {t('hostLink')}
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
