'use client';
// @spec T3-01, T3-02, T3-03, T3-04, T3-05, T3-06, T3-07, T3-08, T3-09, T3-10, DATA-04
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  PAGE_SIZE,
  UNIT_PAGE_SIZE,
  defaultLevel,
  displayStatus,
  filterLibrary,
  levelsIn,
  pad4,
  pageCount,
  topicsAlphabetical,
  unitLearnState,
  unitLevel,
  type Item,
  type LanguageData,
  type LibraryFilter,
  type Progress,
  type StatusFilter,
} from '@/domain';
import { ItemDetail } from '@/components/learning/item-detail';
import { StatusIcon } from '@/components/learning/status-icon';
import { UnitCard } from '@/components/learning/unit-card';
import { NoData } from '@/components/status/no-data';
import { Button } from '@/components/ui/button';
import { CardCustom } from '@/components/ui/card-custom';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { PageHeader, SectionTitle } from '@/components/ui/page-header';
import { Pager } from '@/components/ui/pager';
import { SearchInput } from '@/components/ui/search-input';
import { Segmented } from '@/components/ui/segmented';
import { useSheet } from '@/components/ui/sheet';
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLearningData } from '@/hooks/use-learning-data';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useNav } from '@/hooks/use-nav';
import { useRoute } from '@/hooks/use-route';
import type { Params } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format-number';

export function ThuVienView() {
  const t = useTranslations('t3');
  const { params } = useRoute();
  const app = useLearningData();
  const nav = useNav();
  if (!app) return null;
  const view = params.xem === 'cau' ? 'cau' : 'unit';
  return (
    <section className="flex flex-col gap-4">
      <PageHeader
        title={t('title')}
        description={view === 'unit' ? t('descUnits') : t('descItems')}
        actions={
          // T3-08: chọn cách xem, giữ trong route.
          <Segmented
            label={t('viewLabel')}
            value={view}
            onChange={(v) => nav('thu-vien', { xem: v })}
            options={[
              { value: 'unit', label: t('viewUnit'), ariaLabel: t('viewUnitAria') },
              { value: 'cau', label: t('viewItem'), ariaLabel: t('viewItemAria') },
            ]}
          />
        }
      />
      {view === 'cau' ? <Library d={app.d} params={params} progress={app.progress} now={app.deps.now()} /> : <UnitLibrary d={app.d} params={params} progress={app.progress} now={app.deps.now()} />}
    </section>
  );
}

/** T3-09, T3-10: danh sách Unit dạng thẻ, dòng tổng quan và nút trình độ. */
function UnitLibrary({ d, params, progress, now }: { d: LanguageData; params: Params; progress: Progress; now: number }) {
  const t = useTranslations('t3');
  const locale = useLocale();
  const nav = useNav();
  const levels = useMemo(() => (d.hasLevel ? levelsIn(d) : []), [d]);
  const asked = params['trinh-do'];
  const level = levels.length ? (asked && levels.includes(asked) ? asked : defaultLevel(d, progress, levels)) : undefined;
  const units = useMemo(() => (level ? d.units.filter((u) => unitLevel(d, u) === level) : d.units), [d, level]);
  const page = Math.max(1, Number(params.trang) || 1);
  const listTop = useRef<HTMLParagraphElement>(null);
  const pages = pageCount(units.length, UNIT_PAGE_SIZE);
  const cur = Math.min(page, pages);
  const shown = units.slice((cur - 1) * UNIT_PAGE_SIZE, cur * UNIT_PAGE_SIZE);
  const learned = units.filter((u) => unitLearnState(u, progress) === 'da-hoc').length;
  const partial = units.filter((u) => unitLearnState(u, progress) === 'dang-hoc').length;
  const goPage = (n: number) => {
    nav('thu-vien', { ...params, trang: n > 1 ? n : undefined }, { replace: true });
    listTop.current?.scrollIntoView?.({ block: 'start' });
  };

  return (
    <section className="flex flex-col gap-4" aria-label={t('unitList')}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p ref={listTop} className="num text-description" data-testid="t3-unit-summary">
          {t('unitSummary', { total: formatCount(units.length, locale), learned: formatCount(learned, locale), partial: formatCount(partial, locale) })}
        </p>
        {levels.length > 0 && (
          <Segmented label={t('level')} value={level} onChange={(l) => nav('thu-vien', { xem: 'unit', 'trinh-do': l }, { replace: true })} options={levels.map((l) => ({ value: l, label: l }))} />
        )}
      </div>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((u) => (
          <li key={u.number} className="min-w-0">
            <UnitCard d={d} u={u} progress={progress} now={now} />
          </li>
        ))}
      </ul>
      <Pager page={cur} pages={pages} onPage={goPage} />
    </section>
  );
}

function Library({ d, params, progress, now }: { d: LanguageData; params: Params; progress: Progress; now: number }) {
  const t = useTranslations('t3');
  const tStatus = useTranslations('status');
  const tu = useTranslations('unit');
  const locale = useLocale();
  const sheet = useSheet();
  const nav = useNav();
  // T3-07: hai cột từ 1200 px (APP-07).
  const wide = useMediaQuery('(min-width: 1200px)');
  const [input, setInput] = useState(params.q ?? '');
  // T3-02: lọc theo từ khóa đã ngừng gõ 300 ms; ô nhập vẫn cập nhật ngay.
  const q = useDebouncedValue(input, SEARCH_DEBOUNCE_MS);
  const unit = params.unit && d.units.some((u) => u.number === Number(params.unit)) ? Number(params.unit) : null;
  const [status, setStatus] = useState<StatusFilter>('all');
  const [topic, setTopic] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  // APP-04: trang đang xem giữ trong route (?trang=), đổi trang thì thay route.
  const page = Math.max(1, Number(params.trang) || 1);
  const [selected, setSelected] = useState<number | null>(null);
  const listTop = useRef<HTMLDivElement>(null);

  // T3-02: từ khóa giữ trong route (?q=).
  const sentQ = useRef(params.q ?? '');
  useEffect(() => {
    if ((params.q ?? '') !== q) {
      sentQ.current = q;
      nav('thu-vien', { ...params, q: q || undefined }, { replace: true });
    }
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  // Route đổi từ chỗ khác (ví dụ chạm lại mục Thư viện): ô tìm theo route.
  useEffect(() => {
    const pq = params.q ?? '';
    if (pq !== sentQ.current) {
      sentQ.current = pq;
      setInput(pq);
    }
  }, [params.q]);

  const go = (patch: Record<string, string | number | undefined>) => nav('thu-vien', { ...params, q: q || undefined, ...patch }, { replace: true });
  const setUnit = (n: number | null) => go({ unit: n ?? undefined, trang: undefined });

  const filter: LibraryFilter = { q, unit, status, topic, level };
  const results = useMemo(() => filterLibrary(d, progress, now, filter), [d, progress, now, q, unit, status, topic, level]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = pageCount(results.length);

  // T3-04: đổi từ khóa hoặc bộ lọc thì về trang 1.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (params.trang) go({ trang: undefined });
    setSelected(null);
  }, [q, unit, status, topic, level]); // eslint-disable-line react-hooks/exhaustive-deps

  const cur = Math.min(page, pages);
  const pageItems = results.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const detailItem = wide ? (pageItems.find((it) => it.id === selected) ?? pageItems[0]) : undefined;

  const goPage = (n: number) => {
    go({ trang: n > 1 ? n : undefined });
    setSelected(null);
    listTop.current?.scrollIntoView?.({ block: 'start' });
  };

  const clearAll = () => {
    setInput('');
    setStatus('all');
    setTopic(null);
    setLevel(null);
    nav('thu-vien', { xem: 'cau' }, { replace: true });
  };

  const openDetail = (it: Item) => {
    if (wide) {
      setSelected(it.id);
      return;
    }
    sheet.open({
      title: t('itemTitle', { id: pad4(it.id) }),
      body: () => <ItemDetail d={d} id={it.id} />,
      footer: (close) => (
        <Button
          tone="primary"
          onClick={() => {
            close();
            nav('phien-hoc', { nguon: 'cau', id: it.id });
          }}
        >
          {t('learnThis')}
        </Button>
      ),
    });
  };

  const unitLabel = (n: number, title?: string) => (title ? `${tu('name', { n })}: ${title}` : tu('name', { n }));
  const unitOptions = useMemo(
    () => [{ value: 'all', label: t('all') }, ...d.units.map((u) => ({ value: String(u.number), label: unitLabel(u.number, u.title), keywords: u.translation, lang: d.lang }))],
    [d, t, tu], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const topicOptions = useMemo(
    () => [{ value: 'all', label: t('all') }, ...topicsAlphabetical(d).map((x) => ({ value: x.topic, label: x.topic, description: t('topicCount', { count: formatCount(x.count, locale) }) }))],
    [d, t, locale],
  );

  const filters = (
    <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-2', !wide && 'lg:grid-cols-4')} data-testid="t3-filters">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-label" id="f-unit">
          {t('filterUnit')}
        </span>
        <DropdownSelect labelledBy="f-unit" value={unit === null ? 'all' : String(unit)} onValueChange={(v) => setUnit(v === 'all' ? null : Number(v))} options={unitOptions} searchable searchPlaceholder={t('findUnit')} />
      </div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-label" id="f-status">
          {t('filterStatus')}
        </span>
        <DropdownSelect
          labelledBy="f-status"
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
          options={[
            { value: 'all', label: t('all') },
            { value: 'chua-hoc', label: tStatus('chua-hoc') },
            { value: 'da-nho', label: tStatus('da-nho') },
            { value: 'can-on', label: tStatus('can-on') },
          ]}
        />
      </div>
      {d.hasTopic && (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-label" id="f-topic">
            {t('filterTopic')}
          </span>
          <DropdownSelect labelledBy="f-topic" value={topic ?? 'all'} onValueChange={(v) => setTopic(v === 'all' ? null : v)} options={topicOptions} searchable searchPlaceholder={t('findTopic')} />
        </div>
      )}
      {d.hasLevel && (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-label" id="f-level">
            {t('filterLevel')}
          </span>
          <DropdownSelect labelledBy="f-level" value={level ?? 'all'} onValueChange={(v) => setLevel(v === 'all' ? null : v)} options={[{ value: 'all', label: t('all') }, ...levelsIn(d).map((l) => ({ value: l, label: l }))]} />
        </div>
      )}
    </div>
  );

  return (
    <div className={cn('flex flex-col gap-4', wide && 'grid grid-cols-[minmax(0,min(480px,50%))_minmax(0,1fr)] items-start gap-8')}>
      <div className="flex min-w-0 flex-col gap-3">
        <SearchInput value={input} onValueChange={setInput} placeholder={t('searchPlaceholder')} aria-label={t('searchPlaceholder')} clearLabel={t('clear')} />
        {filters}
        <div ref={listTop} className="num pt-1 text-description" aria-live="polite" data-testid="t3-count">
          {t('count', { count: formatCount(results.length, locale) })}
        </div>
        {results.length === 0 ? (
          <NoData
            message={t('empty')}
            action={
              <Button tone="outline" onClick={clearAll}>
                {t('clearAll')}
              </Button>
            }
          />
        ) : (
          <CardCustom className="px-2 py-1">
            <ul className="divide-y divide-border">
              {pageItems.map((it) => {
                const sel = detailItem?.id === it.id;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      className={cn('grid min-h-14 w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-dropdown px-2 py-3 text-left', sel ? 'bg-sidebar-accent' : 'hover:bg-muted')}
                      aria-current={sel ? 'true' : undefined}
                      onClick={() => openDetail(it)}
                      data-id={it.id}
                    >
                      <span className="num w-10 pt-1 text-sm text-muted-foreground">{pad4(it.id)}</span>
                      <span className="flex min-w-0 flex-col gap-1">
                        <span className="src line-clamp-2 text-data [overflow-wrap:anywhere]" lang={d.lang}>
                          {it.en}
                        </span>
                        <span className="vi truncate text-sm text-muted-foreground" lang="vi">
                          {it.vi}
                        </span>
                      </span>
                      <StatusIcon status={displayStatus(progress.items[it.id], now)} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardCustom>
        )}
        <Pager page={cur} pages={pages} onPage={goPage} />
      </div>
      {wide && detailItem && (
        <aside className="sticky top-20 flex min-w-0 flex-col items-start gap-3 rounded-card bg-card p-4 sm:p-6" aria-label={t('detailLabel')}>
          <SectionTitle>{t('itemTitle', { id: pad4(detailItem.id) })}</SectionTitle>
          <div className="w-full">
            <ItemDetail d={d} id={detailItem.id} />
          </div>
          <Button tone="primary" onClick={() => nav('phien-hoc', { nguon: 'cau', id: detailItem.id })}>
            {t('learnThis')}
          </Button>
        </aside>
      )}
    </div>
  );
}
