'use client';
// @spec T1-01, T1-02, T1-03, T1-04, T1-05, T1-06, T1-07, T1-08, T1-09
import { ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import {
  GROUP_SIZE,
  displayStatus,
  dueItemIds,
  levelOf,
  nextItemId,
  nextUnitIndex,
  openSession,
  sessionsInLast7Days,
  unitLearnState,
  type LanguageData,
  type Progress,
} from '@/domain';
import { SentenceCard } from '@/components/learning/sentence-card';
import type { CellState } from '@/components/learning/strip';
import { UnitCard } from '@/components/learning/unit-card';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { CardCustom } from '@/components/ui/card-custom';
import { PageHeader, SectionTitle } from '@/components/ui/page-header';
import { useLanguageName } from '@/hooks/use-language-name';
import { useLearningData } from '@/hooks/use-learning-data';
import { useNav } from '@/hooks/use-nav';
import { useRoute } from '@/hooks/use-route';
import { href } from '@/lib/routes';
import { formatCount } from '@/utils/format-number';
import { HuongDan } from '@/views/huong-dan';

const linkMore = 'inline-flex min-h-11 items-center gap-1 self-start text-sm font-semibold text-foreground hover:underline underline-offset-4';

export function HocView() {
  const t = useTranslations('t1');
  const locale = useLocale();
  const name = useLanguageName();
  const app = useLearningData();
  const route = useRoute();
  const nav = useNav();
  if (!app) return null;
  const { d, progress, settings, language, deps } = app;
  const now = deps.now();

  const ui = nextUnitIndex(d, progress);
  const itemId = nextItemId(d, progress);
  const done = ui === null || itemId === null;
  const reviewCount = dueItemIds(progress, now, (id) => d.byId.has(id)).length;
  const weekCount = sessionsInLast7Days(progress, now);
  const goal = settings.weeklyGoal;
  const open = openSession(progress);

  const startSession = () => {
    if (open) nav('phien-hoc', { ...(open.params ?? {}), nguon: open.nguon, phien: open.id });
    else nav('phien-hoc', { nguon: 'lo-trinh' });
  };

  // S9: hiện lần đầu sau khi chọn ngôn ngữ; mở lại từ S8 bằng ?huong-dan=1.
  const replay = route.params['huong-dan'] === '1';
  const showGuide = !done && (replay || !settings.guideSeen);

  const goalLine = (
    <p className="text-data" data-testid="t1-goal">
      {weekCount >= goal ? t('goalReached', { done: weekCount, goal }) : t('goal', { done: weekCount, goal })}
    </p>
  );
  const reviewLine =
    reviewCount > 0 ? (
      <AppLink
        className="flex min-h-12 items-center justify-between gap-2 rounded-card border border-warning/40 bg-warning-soft px-4 text-base font-semibold text-foreground hover:border-warning"
        href={href('phien-hoc', { nguon: 'on-tap' })}
        data-testid="t1-review"
      >
        <span>{t('review', { count: reviewCount })}</span>
        <ChevronRight className="size-5" aria-hidden />
      </AppLink>
    ) : null;

  if (done) {
    const total = d.items.length;
    return (
      <section className="flex flex-col gap-4">
        <PageHeader title={t('title')} srOnlyTitle />
        <CardCustom className="flex flex-col gap-3">
          {goalLine}
        </CardCustom>
        <CardCustom className="flex flex-col items-start gap-4">
          <p className="text-data">{t('allDone', { count: formatCount(total, locale), lang: name(language, true) })}</p>
          <Button tone="primary" onClick={() => nav('luyen-tap')}>
            {t('openPractice')}
          </Button>
        </CardCustom>
        {reviewLine}
        <OverallProgress d={d} progress={progress} />
      </section>
    );
  }

  const unit = d.units[ui];
  const item = d.byId.get(itemId)!;
  const firstOfUnit = d.byId.get(unit.ids[0]);
  const level = levelOf(firstOfUnit);
  const situation = firstOfUnit?.situation;
  const pos = unit.ids.indexOf(itemId);
  const cells: CellState[] = unit.ids.slice(0, GROUP_SIZE).map((id) => {
    if (id === itemId) return 'dang';
    const st = displayStatus(progress.items[id], now);
    return st === 'chua-hoc' ? 'chua' : st === 'can-on' ? 'can-on' : 'nho';
  });
  const n = Math.min(unit.ids.length, GROUP_SIZE);
  const remaining = open ? open.itemIds.length - open.position : 0;

  return (
    // T1-06: dưới 1200 px một cột (mục tiêu tuần, thẻ và nút chính, câu cần ôn, Unit tiếp theo, Tiến độ của bạn);
    // từ 1200 px hai cột: cột chính tối đa 560 px là thẻ câu, cột phụ tối thiểu 320 px là các khối còn lại.
    <section className="grid grid-cols-1 gap-4 wide:grid-cols-[minmax(0,560px)_minmax(320px,1fr)] wide:items-start wide:gap-x-8">
      <h1 className="sr-only">{t('title')}</h1>
      <div className="order-2 flex min-w-0 flex-col gap-4 wide:order-1 wide:row-span-4">
        <SentenceCard
          item={item}
          lang={d.lang}
          locale={d.locale}
          langName={name(language, true)}
          strip={{ cells, label: t('position', { n: pos + 1, total: n }) }}
          onOpenVoices={() => nav('cai-dat', { giong: 1 })}
          header={
            <div className="flex flex-col gap-1 border-b border-border pb-3">
              <AppLink className="inline-flex min-h-11 min-w-11 items-center self-start text-label text-muted-foreground hover:text-foreground hover:underline" href={href('unit', { so: unit.number })}>
                {t('unitLink', { n: unit.number })}
                {level ? ` · ${level}` : ''}
              </AppLink>
              {unit.title && (
                <p className="src text-base font-semibold" lang={d.lang}>
                  {unit.title}
                </p>
              )}
              {unit.translation && (
                <p className="vi text-base text-muted-foreground" lang="vi">
                  {unit.translation}
                </p>
              )}
              {situation && (
                <p className="vi mt-1 text-sm text-muted-foreground" lang="vi">
                  {situation}
                </p>
              )}
            </div>
          }
        />
        <div className="flex">
          <Button tone="primary" onClick={startSession} blockOnMobile className="min-h-12 sm:min-w-60" data-guide="start">
            {open ? t('continue', { count: remaining }) : t('start', { count: n })}
          </Button>
        </div>
      </div>
      <CardCustom className="order-1 wide:order-2">{goalLine}</CardCustom>
      {reviewLine && <div className="order-3">{reviewLine}</div>}
      <div className="order-4 min-w-0">
        <NextUnits d={d} progress={progress} now={now} from={ui + 1} />
      </div>
      <div className="order-5 min-w-0">
        <OverallProgress d={d} progress={progress} />
      </div>
      {showGuide && <HuongDan replay={replay} onStart={startSession} />}
    </section>
  );
}

/** T1-08: tối đa 3 unit ngay sau unit đang học. */
function NextUnits({ d, progress, now, from }: { d: LanguageData; progress: Progress; now: number; from: number }) {
  const t = useTranslations('t1');
  const units = d.units.slice(from, from + 3);
  if (units.length === 0) return null;
  return (
    <section className="flex flex-col gap-3" aria-labelledby="t1-next">
      <SectionTitle id="t1-next">{t('nextUnits')}</SectionTitle>
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-3 wide:grid-cols-1">
        {units.map((u) => (
          <li key={u.number}>
            <UnitCard d={d} u={u} progress={progress} now={now} />
          </li>
        ))}
      </ul>
      <AppLink className={linkMore} href={href('thu-vien')}>
        {t('allUnits')}
        <ChevronRight className="size-4" aria-hidden />
      </AppLink>
    </section>
  );
}

/** T1-09: số câu đã qua bước ghi nhớ trên tổng số câu của bộ, số unit đã học. */
function OverallProgress({ d, progress }: { d: LanguageData; progress: Progress }) {
  const t = useTranslations('t1');
  const locale = useLocale();
  const total = d.items.length;
  const learned = d.items.filter((it) => progress.items[it.id]?.status === 'da-hoc').length;
  const units = d.units.filter((u) => unitLearnState(u, progress) === 'da-hoc').length;
  const text = t('learned', { learned: formatCount(learned, locale), total: formatCount(total, locale) });
  return (
    <section className="flex flex-col gap-3" aria-labelledby="t1-stats">
      <SectionTitle id="t1-stats">{t('yourProgress')}</SectionTitle>
      <CardCustom className="flex flex-col gap-3">
        <p className="num text-data font-semibold" data-testid="t1-learned">
          {text}
        </p>
        <div className="h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={t('learnedLabel')} aria-valuemin={0} aria-valuemax={total} aria-valuenow={learned} aria-valuetext={text}>
          <span className="block h-full rounded-full bg-foreground" style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
        </div>
        {units > 0 && (
          <p className="num text-description" data-testid="t1-units">
            {t('unitsLearned', { count: formatCount(units, locale) })}
          </p>
        )}
        <AppLink className={linkMore} href={href('tien-do')}>
          {t('seeProgress')}
          <ChevronRight className="size-4" aria-hidden />
        </AppLink>
      </CardCustom>
    </section>
  );
}
