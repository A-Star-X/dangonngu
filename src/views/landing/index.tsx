// @spec LP-01, LP-02, LP-03, LP-04, LP-05, LP-06, AU-08
// Landing cho khách: giới thiệu sản phẩm, người dùng hướng tới, giá trị và tính năng thật, lời mời bắt đầu.
// Trang máy chủ (không chạy JS phía trình duyệt ngoài header), số liệu đọc từ dữ liệu thật lúc build.
import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { BookOpen, CalendarCheck, ChartLine, Headphones, Library, ListChecks, type LucideIcon } from 'lucide-react';
import { buttonClass } from '@/components/ui/button-class';
import { Link } from '@/i18n/navigation';
import { PUBLIC_PATH, ROUTE_PATH } from '@/lib/routes';
import { isDemo } from '@/lib/app-env';
import { languageName } from '@/lib/language-name';
import { formatCount } from '@/utils/format-number';
import { contentStats } from './utils/content-stats';

const FEATURES: { key: string; Icon: LucideIcon }[] = [
  { key: 'session', Icon: BookOpen },
  { key: 'listen', Icon: Headphones },
  { key: 'review', Icon: CalendarCheck },
  { key: 'test', Icon: ListChecks },
  { key: 'library', Icon: Library },
  { key: 'progress', Icon: ChartLine },
];


export async function LandingView() {
  const t = await getTranslations('landing');
  const locale = await getLocale();
  const stats = contentStats();
  // AU-08: bản dùng thử không có tài khoản, lời mời dẫn thẳng vào khu học.
  const demo = isDemo();
  const startHref = demo ? ROUTE_PATH.hoc : PUBLIC_PATH.register;
  const fluency = stats.packs.find((p) => p.id === 'fluency');
  const global = stats.packs.find((p) => p.id === 'global');
  const n = (v: number) => formatCount(v, locale);
  // Ảnh chụp app theo ngôn ngữ giao diện (APP-15): tiếng Anh dùng ảnh chụp giao diện tiếng Anh.
  const shotLocale = locale === 'en' ? 'en-' : '';
  const names = stats.list.map((l) => languageName(l, locale));

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* LP-01: phần mở đầu và lời mời chính */}
      <section className="flex flex-col gap-8" aria-labelledby="lp-title">
        <div className="flex flex-col gap-5 md:max-w-2xl">
          <p className="text-label text-muted-foreground">{t('eyebrow')}</p>
          <h1 id="lp-title" className="text-2xl font-bold text-foreground">
            {t('title')}
          </h1>
          <p className="text-lg text-muted-foreground">{t('lead', { languages: stats.languages })}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={startHref} className={buttonClass({ tone: 'primary', size: 'lg', className: 'whitespace-nowrap' })} data-testid="lp-start">
              {t('ctaStart')}
            </Link>
            <Link href={ROUTE_PATH['thu-vien']} className={buttonClass({ tone: 'outline', size: 'lg', className: 'whitespace-nowrap' })} data-testid="lp-explore">
              {t('ctaExplore')}
            </Link>
          </div>
          {!demo && (
            <p className="text-description">
              {t.rich('haveAccount', { link: (c) => <Link href={PUBLIC_PATH.login} className="font-semibold text-foreground underline underline-offset-4">{c}</Link> })}
            </p>
          )}
        </div>
        <div className="overflow-hidden rounded-card border border-border bg-card shadow-dialog">
          <Image src={`/landing/hoc-${shotLocale}light.png`} alt={t('shotAlt')} width={1280} height={800} priority className="h-auto w-full dark:hidden" sizes="(min-width: 800px) 736px, 100vw" />
          <Image src={`/landing/hoc-${shotLocale}dark.png`} alt={t('shotAlt')} width={1280} height={800} className="hidden h-auto w-full dark:block" sizes="(min-width: 800px) 736px, 100vw" />
        </div>
      </section>

      {/* LP-02: người dùng hướng tới */}
      <section className="flex flex-col gap-4" aria-labelledby="lp-audience">
        <h2 id="lp-audience" className="text-description font-medium">
          {t('audienceTitle')}
        </h2>
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(['learner', 'busy', 'traveler'] as const).map((k) => (
            <li key={k} className="flex flex-col gap-2 rounded-card bg-card p-4">
              <h3 className="text-base font-semibold">{t(`audience.${k}.title`)}</h3>
              <p className="text-description">{t.rich(`audience.${k}.body`, { vi: (c) => <span lang="vi">{c}</span> })}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* LP-03: số liệu thật của bộ câu */}
      <section className="flex flex-col gap-4" aria-labelledby="lp-content">
        <h2 id="lp-content" className="text-description font-medium">
          {t('contentTitle')}
        </h2>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex flex-col-reverse gap-1 rounded-card bg-card p-4">
            <dt className="text-description">{t('statLanguages')}</dt>
            <dd className="num text-2xl font-bold" data-testid="lp-languages">
              {n(stats.languages)}
            </dd>
          </div>
          {fluency && (
            <div className="flex flex-col-reverse gap-1 rounded-card bg-card p-4">
              <dt className="text-description">{t('statFluency', { units: n(fluency.units) })}</dt>
              <dd className="num text-2xl font-bold">{t('itemsPerLanguage', { count: n(fluency.items) })}</dd>
            </div>
          )}
          {global && (
            <div className="flex flex-col-reverse gap-1 rounded-card bg-card p-4">
              <dt className="text-description">{t('statGlobal', { units: n(global.units) })}</dt>
              <dd className="num text-2xl font-bold">{t('items', { count: n(global.items) })}</dd>
            </div>
          )}
        </dl>
        <p className="text-description" data-testid="lp-language-list">
          {names.join(' · ')}
        </p>
      </section>

      {/* LP-04: tính năng nổi bật và lợi ích */}
      <section className="flex flex-col gap-4" aria-labelledby="lp-features">
        <h2 id="lp-features" className="text-description font-medium">
          {t('featuresTitle')}
        </h2>
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ key, Icon }) => (
            <li key={key} className="flex gap-3 rounded-card bg-card p-4">
              <span className="inline-flex size-10 flex-none items-center justify-center rounded-button bg-sidebar-accent text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="flex flex-col gap-1">
                <h3 className="text-base font-semibold">{t(`features.${key}.title`)}</h3>
                <p className="text-description">{t.rich(`features.${key}.body`, { vi: (c) => <span lang="vi">{c}</span> })}</p>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* LP-05: cách học trong ba bước */}
      <section className="flex flex-col gap-4" aria-labelledby="lp-steps">
        <h2 id="lp-steps" className="text-description font-medium">
          {t('stepsTitle')}
        </h2>
        <ol className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {(['choose', 'learn', 'review'] as const).map((k, i) => (
            <li key={k} className="flex flex-col gap-2 rounded-card border border-border p-4">
              <span className="num inline-flex size-8 items-center justify-center rounded-full bg-sidebar-accent text-sm font-bold text-sidebar-accent-foreground">{i + 1}</span>
              <h3 className="text-base font-semibold">{demo && k === 'choose' ? t('demoChoose') : t(`steps.${k}.title`)}</h3>
              <p className="text-description">{t(`steps.${k}.body`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* LP-06: lời mời cuối trang */}
      <section className="flex flex-col items-start gap-4 rounded-card bg-sidebar-accent p-6 md:flex-row md:items-center md:justify-between" aria-labelledby="lp-final">
        <div className="flex flex-col gap-1">
          <h2 id="lp-final" className="text-description font-medium">
            {t('finalTitle')}
          </h2>
          <p className="text-description">{demo ? t('demoFinalBody') : t('finalBody')}</p>
        </div>
        {/* FND-02: mỗi màn một nút chính (đã có ở phần mở đầu); lời mời cuối trang dùng nút viền trên nền card. */}
        <Link href={startHref} className={buttonClass({ tone: 'outline', size: 'lg', className: 'bg-card whitespace-nowrap' })} data-testid="lp-final">
          {demo ? t('ctaStart') : t('ctaRegister')}
        </Link>
      </section>
    </div>
  );
}
