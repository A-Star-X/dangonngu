'use client';
// @spec T2-01, T2-02, T2-03, T2-04, T2-05, T2-06
import { useMemo, type ReactNode } from 'react';
import { ChevronRight, Headphones, Search as SearchIcon, RotateCcw, type LucideIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { dueItemIds, nextUnitIndex, openTest, pausedTestInfo, searchItems, topicsByCount, type LanguageData } from '@/domain';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { SearchInput } from '@/components/ui/search-input';
import { useSheet } from '@/components/ui/sheet';
import { SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value';
import { useLanguageName } from '@/hooks/use-language-name';
import { useLearningData } from '@/hooks/use-learning-data';
import { useNav } from '@/hooks/use-nav';
import { createStore, useStore, type Store } from '@/lib/store';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format-number';
import { statusBadgeClass } from '@/utils/status-badge-colors';

const PREVIEW = 5;

function Row({ icon: Icon, title, desc, extra, count, locked, onClick, testId, popup }: { icon: LucideIcon; title: string; desc: ReactNode; extra?: string | null; count?: number; locked?: boolean; onClick: () => void; testId?: string; popup?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        'group flex h-full min-h-20 w-full items-start gap-4 rounded-card border border-border bg-card p-4 text-left text-card-foreground',
        locked ? 'cursor-default' : 'hover:border-primary',
      )}
      aria-disabled={locked || undefined}
      aria-haspopup={popup ? 'dialog' : undefined}
      onClick={onClick}
      data-testid={testId}
    >
      <span className={cn('inline-flex size-10 flex-none items-center justify-center rounded-button', locked ? 'bg-muted text-muted-foreground' : 'bg-sidebar-accent text-primary')}>
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span className={cn('text-base font-semibold', locked && 'text-muted-foreground')}>{title}</span>
        <span className="text-description">{desc}</span>
        {extra && <span className="text-sm font-semibold text-foreground">{extra}</span>}
      </span>
      {count !== undefined && count > 0 && (
        <span className={cn('num flex-none rounded-dropdown border px-2 py-0.5 text-sm font-semibold', statusBadgeClass('warning'))}>{count}</span>
      )}
      <ChevronRight className={cn('mt-2 size-5 flex-none text-muted-foreground', locked && 'invisible')} aria-hidden />
    </button>
  );
}

export function LuyenTapView() {
  const t = useTranslations('t2');
  const ts = useTranslations('s5');
  const app = useLearningData();
  const sheet = useSheet();
  const nav = useNav();
  if (!app) return null;
  const { d, progress, deps } = app;
  const due = dueItemIds(progress, deps.now(), (id) => d.byId.has(id)).length;

  // T2-04: unit đang học trong lộ trình; học hết lộ trình thì unit cuối.
  const ui = nextUnitIndex(d, progress) ?? d.units.length - 1;
  const unitNumber = d.units[ui]?.number;
  // T2-04, S5-09: có bài kiểm tra dở thì mở lại đúng chỗ.
  const paused = openTest(progress);
  const info = paused ? pausedTestInfo(d, paused) : null;
  const pausedLine = info ? t('paused', { unit: info.unit, step: ts(`stepInline.${info.step}`), n: info.at, total: info.total }) : null;

  const openKeyword = () => {
    const store = createStore({ input: '' });
    sheet.open({
      title: t('keywordTitle'),
      body: () => <KeywordBody d={d} store={store} />,
      footer: (close) => <KeywordFooter d={d} store={store} close={close} />,
    });
  };

  return (
    <section className="flex flex-col gap-4">
      <PageHeader title={t('title')} description={t('description')} />
      {/* T2-06: dưới sm một cột; từ sm các mục xếp lưới tự xuống hàng. */}
      <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2 wide:grid-cols-3">
        <li>
          <Row
            icon={RotateCcw}
            title={t('reviewTitle')}
            desc={due > 0 ? t('reviewDesc') : t('reviewNone')}
            count={due}
            locked={due === 0}
            onClick={() => {
              if (due > 0) nav('phien-hoc', { nguon: 'on-tap' });
            }}
            testId="t2-on-tap"
          />
        </li>
        <li>
          <Row icon={SearchIcon} title={t('keywordTitle')} desc={t.rich('keywordDesc', { vi: (c) => <span lang="vi">{c}</span> })} onClick={openKeyword} popup testId="t2-tu-khoa" />
        </li>
        <li>
          <Row
            icon={Headphones}
            title={t('testTitle')}
            desc={t('testDesc')}
            extra={pausedLine}
            onClick={() => (paused && info ? nav('kiem-tra', { unit: paused.params?.unit, tiep: 1 }) : nav('kiem-tra', { unit: unitNumber }))}
            testId="t2-kiem-tra"
          />
        </li>
      </ul>
    </section>
  );
}

type KeywordState = { input: string };

function KeywordBody({ d, store }: { d: LanguageData; store: Store<KeywordState> }) {
  const t = useTranslations('t2');
  const locale = useLocale();
  const name = useLanguageName();
  const { language } = useLearningData() ?? {};
  const st = useStore(store);
  // T2-03: kết quả theo từ khóa đã ngừng gõ 300 ms; ô nhập vẫn cập nhật ngay.
  const q = useDebouncedValue(st.input, SEARCH_DEBOUNCE_MS).trim();
  const chips = useMemo(() => (d.hasTopic ? topicsByCount(d).slice(0, 6).map((x) => x.topic) : (t.raw('chips') as string[])), [d, t]);
  const results = useMemo(() => (q ? searchItems(d, q) : []), [d, q]);

  return (
    <div className="flex flex-col gap-4">
      <SearchInput value={st.input} onValueChange={(v) => store.set({ input: v })} placeholder={t('keywordPlaceholder')} aria-label={t('keywordLabel')} clearLabel={t('clear')} />
      {/* Màn thấp: chip nằm một hàng cuộn ngang, không chiếm chỗ của kết quả (T2-03). */}
      <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label={t('suggestions')}>
        {chips.map((c) => (
          <li key={c} className="flex-none">
            <button type="button" className="min-h-11 rounded-dropdown border border-border px-3 text-sm whitespace-nowrap hover:border-primary" onClick={() => store.set({ input: c })}>
              {c}
            </button>
          </li>
        ))}
      </ul>
      {q &&
        (results.length === 0 ? (
          <p className="py-2 text-data" role="status">
            {t('noResult', { q, lang: language ? name(language, true) : '' })}
          </p>
        ) : (
          <>
            <p className="num text-description" role="status">
              {t('found', { count: formatCount(results.length, locale) })}
            </p>
            <ul className="divide-y divide-border">
              {results.slice(0, PREVIEW).map((it) => (
                <li key={it.id} className="flex flex-col gap-1 py-3">
                  <span className="src text-data" lang={d.lang}>
                    {it.en}
                  </span>
                  <span className="vi text-sm text-muted-foreground" lang="vi">
                    {it.vi}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ))}
    </div>
  );
}

function KeywordFooter({ d, store, close }: { d: LanguageData; store: Store<KeywordState>; close: () => void }) {
  const t = useTranslations('t2');
  const nav = useNav();
  const st = useStore(store);
  const q = useDebouncedValue(st.input, SEARCH_DEBOUNCE_MS).trim();
  // Chưa hết thời gian chờ gõ thì khóa nút, để không mở phiên bằng từ khóa cũ.
  const settled = q === st.input.trim();
  const count = useMemo(() => (q ? searchItems(d, q).length : 0), [d, q]);
  return (
    <Button
      tone="primary"
      locked={!settled || count === 0}
      onClick={() => {
        close();
        nav('phien-hoc', { nguon: 'tu-khoa', q, nhom: 1 });
      }}
    >
      {count > 0 && count < 8 ? t('learnN', { count }) : t('learn8')}
    </Button>
  );
}
