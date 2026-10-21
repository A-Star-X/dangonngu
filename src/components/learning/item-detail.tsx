'use client';
// @spec T3-05, S10-05
// Nội dung chi tiết một câu (trong sheet, ở cột phải của Thư viện từ 1200 px, và ở Chi tiết Unit).
import { useLocale, useTranslations } from 'next-intl';
import { LEARN_STATUS_TONE, displayStatus, levelOf, type LanguageData } from '@/domain';
import { Badge } from '@/components/ui/badge';
import { useLanguageName } from '@/hooks/use-language-name';
import { useNav } from '@/hooks/use-nav';
import { formatDaysAgo } from '@/utils/format-date';
import { useLearning } from '@/providers/learning-provider';
import { SentenceCard } from './sentence-card';
import { StatusIcon } from './status-icon';

export function ItemDetail({ d, id }: { d: LanguageData; id: number }) {
  const t = useTranslations('detail');
  const ts = useTranslations('status');
  const tu = useTranslations('unit');
  const locale = useLocale();
  const name = useLanguageName();
  const { progress, deps, language } = useLearning();
  const nav = useNav();
  const it = d.byId.get(id);
  if (!it) return null;
  const now = deps.now();
  const ui = d.unitIndexOf.get(id);
  const u = ui !== undefined ? d.units[ui] : undefined;
  const state = progress.items[id];
  const st = displayStatus(state, now);
  const level = levelOf(it);
  return (
    <div className="flex flex-col gap-3">
      <SentenceCard item={it} lang={d.lang} locale={d.locale} langName={name(language, true)} onOpenVoices={() => nav('cai-dat', { giong: 1 })} className="border border-border" />
      {u && (
        <p className="text-base">
          {tu('name', { n: u.number })}
          {level ? ` · ${level}` : ''}
          {u.title ? (
            <>
              {': '}
              <span className="src" lang={d.lang}>
                {u.title}
              </span>
            </>
          ) : null}
        </p>
      )}
      <p className="flex flex-wrap items-center gap-2 text-base" data-testid="detail-status">
        <Badge tone={LEARN_STATUS_TONE[st]} icon={<StatusIcon status={st} decorative />}>
          {ts(st)}
        </Badge>
        {state && <span className="text-description">{t('lastStudied', { when: formatDaysAgo(state.lastAt, now, locale) })}</span>}
      </p>
    </div>
  );
}
