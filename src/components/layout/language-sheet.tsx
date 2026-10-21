'use client';
// @spec APP-06, S1-02, S1-03
// Sheet Đổi ngôn ngữ hoặc bộ nội dung, và dòng ngôn ngữ dùng chung cho S1.
import { useCallback, useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { packInfo, type CatalogLanguage, type PackId } from '@/domain';
import { useSheet } from '@/components/ui/sheet';
import { useLanguageName } from '@/hooks/use-language-name';
import { useNav } from '@/hooks/use-nav';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { formatCount } from '@/utils/format-number';
import { useLearning } from '@/providers/learning-provider';

export function Spinner({ label }: { label: string }) {
  return <span className="size-4 flex-none animate-spin rounded-full border-2 border-muted-foreground border-r-transparent" role="img" aria-label={label} />;
}

export function LangRowText({ lang }: { lang: CatalogLanguage }) {
  const name = useLanguageName();
  return (
    <span className="flex min-w-0 flex-col">
      <span className="text-base font-semibold">{name(lang)}</span>
      {lang.nativeName && (
        <span className="src text-sm text-muted-foreground" lang={lang.id}>
          {lang.nativeName}
        </span>
      )}
    </span>
  );
}

export const langRowClass = 'flex min-h-16 w-full items-center justify-between gap-3 py-3 text-left text-foreground aria-disabled:opacity-40';

/** Danh sách cho sheet Đổi ngôn ngữ: ngôn ngữ nhiều bộ tách thành một dòng cho mỗi bộ. */
export function SwitchList({
  languages,
  current,
  busy,
  onPick,
}: {
  languages: CatalogLanguage[];
  current?: { lang: string; pack?: PackId };
  busy?: string | null;
  onPick: (lang: string, pack: PackId) => void;
}) {
  const t = useTranslations('language');
  const name = useLanguageName();
  const locale = useLocale();
  const rows = languages.flatMap((l) => l.packs.map((p) => ({ l, p, multi: l.packs.length > 1 })));
  return (
    <ul className="divide-y divide-border">
      {rows.map(({ l, p, multi }) => {
        const key = `${p}.${l.id}`;
        const active = current?.lang === l.id && current?.pack === p;
        return (
          <li key={key}>
            <button
              type="button"
              className={langRowClass}
              aria-current={active ? 'true' : undefined}
              aria-disabled={(busy && busy !== key) || undefined}
              aria-busy={busy === key || undefined}
              onClick={() => !busy && !active && onPick(l.id, p)}
            >
              <span className="flex min-w-0 flex-col">
                <span className="text-base font-semibold">
                  {name(l)}
                  {multi ? `, ${packInfo(p).name}` : ''}
                </span>
                {l.nativeName && (
                  <span className="src text-sm text-muted-foreground" lang={l.id}>
                    {l.nativeName}
                  </span>
                )}
              </span>
              {busy === key ? (
                <Spinner label={t('loading')} />
              ) : active ? (
                <Check className="size-5 flex-none text-primary" aria-label={t('current')} />
              ) : !multi && l.count ? (
                <span className="num text-sm text-muted-foreground">{t('count', { count: formatCount(l.count, locale) })}</span>
              ) : (
                <ChevronRight className="size-5 flex-none text-muted-foreground" aria-hidden />
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function SwitchBody({ close }: { close: () => void }) {
  const t = useTranslations('language');
  const { catalog, language, pack, chooseLanguage } = useLearning();
  const nav = useNav();
  const [busy, setBusy] = useState<string | null>(null);
  if (catalog.status !== 'ready') return null;
  const pick = async (lang: string, p: PackId) => {
    setBusy(`${p}.${lang}`);
    try {
      await chooseLanguage(lang, p);
      close();
      nav('hoc', undefined, { force: true });
    } catch {
      setBusy(null);
      notify(t('loadFailed'), { kind: 'alert', action: { label: t('retry'), onClick: () => void pick(lang, p) } });
    }
  };
  return <SwitchList languages={catalog.value.languages} current={language ? { lang: language.id, pack } : undefined} busy={busy} onPick={pick} />;
}

export function useLanguageSheet() {
  const sheet = useSheet();
  const t = useTranslations('language');
  return useCallback(() => {
    sheet.open({ title: t('switchTitle'), body: (close) => <SwitchBody close={close} /> });
  }, [sheet, t]);
}

export function languageButtonClass(className?: string) {
  return cn('flex min-h-11 w-full items-center justify-between gap-2 rounded-dropdown border border-sidebar-border bg-card px-3 py-2 text-left hover:border-primary', className);
}
