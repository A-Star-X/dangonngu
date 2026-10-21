'use client';
// @spec S10-01, S10-02, S10-03, S10-04, S10-05, S10-06, APP-14
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { displayStatus, pad4, unitCounts, unitLevel, type Item, type LanguageData, type Progress } from '@/domain';
import { ItemDetail } from '@/components/learning/item-detail';
import { StatusIcon } from '@/components/learning/status-icon';
import { Strip } from '@/components/learning/strip';
import { unitCells } from '@/components/learning/unit-card';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { CardCustom } from '@/components/ui/card-custom';
import { SectionTitle } from '@/components/ui/page-header';
import { useSheet } from '@/components/ui/sheet';
import { useLearningData } from '@/hooks/use-learning-data';
import { useNav } from '@/hooks/use-nav';
import { useRoute } from '@/hooks/use-route';
import { lastLibraryParams } from '@/lib/route-memory';
import { href } from '@/lib/routes';

export function ChiTietUnitView() {
  const { params } = useRoute();
  const app = useLearningData();
  if (!app) return null;
  return <UnitDetail d={app.d} so={Number(params.so)} progress={app.progress} now={app.deps.now()} />;
}

function UnitDetail({ d, so, progress, now }: { d: LanguageData; so: number; progress: Progress; now: number }) {
  const t = useTranslations('s10');
  const tu = useTranslations('unit');
  const ts = useTranslations('status');
  const tl = useTranslations('t3');
  const sheet = useSheet();
  const nav = useNav();
  const ui = d.units.findIndex((u) => u.number === so);

  // S10-01: số unit không có trong dữ liệu thì về Thư viện, không thêm lịch sử.
  useEffect(() => {
    if (ui < 0) nav('thu-vien', {}, { replace: true, force: true });
  }, [ui, nav]);
  if (ui < 0) return null;

  const u = d.units[ui];
  const lv = unitLevel(d, u);
  const situation = d.byId.get(u.ids[0])?.situation;
  const c = unitCounts(u, progress, now);
  const counts = (
    [
      [c.daNho, ts('da-nho')],
      [c.canOn, ts('can-on')],
      [c.chuaHoc, ts('chua-hoc')],
    ] as const
  )
    .filter(([n]) => n > 0)
    .map(([n, label]) => `${label} ${n}`)
    .join(' · ');
  const prev = d.units[ui - 1];
  const next = d.units[ui + 1];
  const unitName = `${tu('name', { n: u.number })}${lv ? ` · ${lv}` : ''}`;

  const openItem = (it: Item) =>
    sheet.open({
      title: tl('itemTitle', { id: pad4(it.id) }),
      body: () => <ItemDetail d={d} id={it.id} />,
      footer: (close) => (
        <Button
          tone="primary"
          onClick={() => {
            close();
            nav('phien-hoc', { nguon: 'cau', id: it.id });
          }}
        >
          {tl('learnThis')}
        </Button>
      ),
    });

  return (
    <section className="flex flex-col gap-4">
      {/* APP-14: đường dẫn; tên khu mở lại Thư viện đúng chỗ đã xem. */}
      <nav className="text-sm" aria-label={t('breadcrumb')}>
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <AppLink className="inline-flex min-h-11 items-center gap-1 text-foreground hover:underline underline-offset-4" href={href('thu-vien', lastLibraryParams() ?? { xem: 'unit', 'trinh-do': lv })}>
              <ArrowLeft className="size-4" aria-hidden />
              {t('library')}
            </AppLink>
          </li>
          <li aria-hidden="true">
            <ChevronRight className="size-4 text-muted-foreground" />
          </li>
          <li aria-current="page" className="text-muted-foreground">
            {unitName}
          </li>
        </ol>
      </nav>
      <header className="flex flex-col gap-1">
        {u.title ? (
          <h1 className="src text-2xl font-bold" lang={d.lang}>
            {u.title}
          </h1>
        ) : (
          <h1 className="text-2xl font-bold">{tu('name', { n: u.number })}</h1>
        )}
        {u.translation && (
          <p className="vi text-base text-muted-foreground" lang="vi">
            {u.translation}
          </p>
        )}
        {situation && (
          <p className="vi text-description" lang="vi">
            {situation}
          </p>
        )}
      </header>

      <CardCustom className="flex flex-col gap-3 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Strip cells={unitCells(u, progress, now)} />
          <p className="num text-data" data-testid="s10-counts">
            {counts}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button tone="primary" onClick={() => nav('phien-hoc', { nguon: 'unit', so: u.number })} blockOnMobile>
            {c.daNho === u.ids.length ? t('reviewUnit') : t('learnUnit')}
          </Button>
          <Button tone="outline" onClick={() => nav('kiem-tra', { unit: u.number })} blockOnMobile>
            {t('testUnit')}
          </Button>
        </div>
      </CardCustom>

      <section className="flex flex-col gap-3" aria-labelledby="s10-items">
        <SectionTitle id="s10-items">{t('items', { count: u.ids.length })}</SectionTitle>
        <CardCustom className="px-2 py-1">
          <ul className="divide-y divide-border">
            {u.ids.map((id) => {
              const it = d.byId.get(id);
              if (!it) return null;
              return (
                <li key={id}>
                  <button type="button" className="grid min-h-14 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-dropdown px-2 py-3 text-left hover:bg-muted" onClick={() => openItem(it)} data-id={id}>
                    <span className="num w-10 pt-1 text-sm text-muted-foreground">{pad4(id)}</span>
                    <span className="flex min-w-0 flex-col gap-1">
                      <span className="src line-clamp-2 text-data [overflow-wrap:anywhere]" lang={d.lang}>
                        {it.en}
                      </span>
                      <span className="vi truncate text-sm text-muted-foreground" lang="vi">
                        {it.vi}
                      </span>
                    </span>
                    <StatusIcon status={displayStatus(progress.items[id], now)} />
                  </button>
                </li>
              );
            })}
          </ul>
        </CardCustom>
      </section>

      {(prev || next) && (
        <nav className="flex justify-between gap-3 border-t border-border pt-4" aria-label={t('prevNext')}>
          {prev ? (
            <AppLink className="inline-flex min-h-11 items-center gap-2 text-data hover:underline underline-offset-4" href={href('unit', { so: prev.number })}>
              <ArrowLeft className="size-5" aria-hidden />
              {tu('name', { n: prev.number })}
            </AppLink>
          ) : (
            <span />
          )}
          {next && (
            <AppLink className="inline-flex min-h-11 items-center gap-2 text-data hover:underline underline-offset-4" href={href('unit', { so: next.number })}>
              {tu('name', { n: next.number })}
              <ArrowRight className="size-5" aria-hidden />
            </AppLink>
          )}
        </nav>
      )}
    </section>
  );
}
