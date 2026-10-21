'use client';
// @spec S1-01, S1-02, S1-03, S1-04, S1-05, S1-06, S1-07
import { useState } from 'react';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { PACKS, type CatalogLanguage, type PackId } from '@/domain';
import { Failed } from '@/components/status/failed';
import { CardCustom } from '@/components/ui/card-custom';
import { PageHeader } from '@/components/ui/page-header';
import { LangRowText, Spinner, langRowClass } from '@/components/layout/language-sheet';
import { useLanguageName } from '@/hooks/use-language-name';
import { useNav } from '@/hooks/use-nav';
import { formatCount } from '@/utils/format-number';
import { useLearning } from '@/providers/learning-provider';

export function ChonNgonNguView() {
  const t = useTranslations('s1');
  const tl = useTranslations('language');
  const locale = useLocale();
  const name = useLanguageName();
  const { catalog, chooseLanguage } = useLearning();
  const nav = useNav();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<{ lang: string; pack: PackId } | null>(null);
  const [packStep, setPackStep] = useState<CatalogLanguage | null>(null);

  const pick = async (lang: string, pack: PackId) => {
    setBusy(`${pack}.${lang}`);
    setFailed(null);
    try {
      await chooseLanguage(lang, pack);
      nav('hoc');
    } catch {
      setFailed({ lang, pack });
    } finally {
      setBusy(null);
    }
  };

  if (catalog.status !== 'ready') return null;

  if (failed) {
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <PageHeader title={t('title')} />
        <Failed message={t('loadFailed')} onRetry={() => void pick(failed.lang, failed.pack)} />
      </section>
    );
  }

  if (packStep) {
    const lang = packStep;
    return (
      <section className="mx-auto flex w-full max-w-xl flex-col gap-4">
        <button
          type="button"
          className="-ml-2 inline-flex min-h-11 items-center gap-1 self-start rounded-button px-2 text-sm font-semibold aria-disabled:opacity-40"
          onClick={() => setPackStep(null)}
          aria-disabled={busy ? true : undefined}
        >
          <ArrowLeft className="size-5" aria-hidden />
          {t('back')}
        </button>
        <PageHeader title={t('packTitle', { lang: name(lang, true) })} />
        <CardCustom className="py-0">
          <ul className="divide-y divide-border">
            {PACKS.filter((p) => lang.packs.includes(p.id)).map((p) => {
              const key = `${p.id}.${lang.id}`;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    className="flex min-h-18 w-full items-center justify-between gap-4 py-4 text-left aria-disabled:opacity-40"
                    aria-disabled={(busy && busy !== key) || undefined}
                    aria-busy={busy === key || undefined}
                    onClick={() => !busy && void pick(lang.id, p.id)}
                  >
                    <span className="flex flex-col gap-1">
                      <span className="text-base font-semibold">{p.name}</span>
                      <span className="text-description">{t(`packDescription.${p.id}`)}</span>
                    </span>
                    {busy === key ? <Spinner label={tl('loading')} /> : <ChevronRight className="size-5 flex-none text-muted-foreground" aria-hidden />}
                  </button>
                </li>
              );
            })}
          </ul>
        </CardCustom>
        {/* S1-07: dòng chú thích dưới danh sách bộ. */}
        <p className="text-description">{t('packNote')}</p>
      </section>
    );
  }

  const [first, ...rest] = catalog.value.languages;
  const row = (l: CatalogLanguage) => {
    const multi = l.packs.length > 1;
    const key = `${l.packs[0]}.${l.id}`;
    return (
      <button
        type="button"
        className={langRowClass}
        aria-disabled={(busy && busy !== key) || undefined}
        aria-busy={busy === key || undefined}
        onClick={() => {
          if (busy) return;
          if (multi) setPackStep(l);
          else void pick(l.id, l.packs[0]);
        }}
      >
        <LangRowText lang={l} />
        {busy === key ? (
          <Spinner label={tl('loading')} />
        ) : multi ? (
          <span className="inline-flex flex-none items-center gap-1 text-sm text-muted-foreground">
            {t('packCount', { count: l.packs.length })} <ChevronRight className="size-4" aria-hidden />
          </span>
        ) : l.count ? (
          <span className="num flex-none text-sm whitespace-nowrap text-muted-foreground">{tl('count', { count: formatCount(l.count, locale) })}</span>
        ) : null}
      </button>
    );
  };

  return (
    <section className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <PageHeader title={t('title')} />
      {first && <CardCustom className="border border-primary/40 py-0">{row(first)}</CardCustom>}
      <CardCustom className="py-0">
        <ul className="divide-y divide-border">
          {rest.map((l) => (
            <li key={l.id}>{row(l)}</li>
          ))}
        </ul>
      </CardCustom>
      {/* S1-05: dòng chú thích ở cuối danh sách. */}
      <p className="text-description">{t('note')}</p>
    </section>
  );
}
