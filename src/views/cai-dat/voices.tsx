'use client';
// @spec S8-02
import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { useLanguageName } from '@/hooks/use-language-name';
import { autoVoice, speak, voicesFor } from '@/lib/speech';
import { useLearning } from '@/providers/learning-provider';

const RATES = [0.75, 1, 1.25];
const AUTO = '__auto__';

export function rateLabel(r: number, locale: string) {
  return `${locale === 'vi' ? String(r).replace('.', ',') : String(r)}x`;
}

/** S8-02: sheet Giọng đọc. */
export function VoicesBody({ locale }: { locale: string }) {
  const t = useTranslations('s8');
  const name = useLanguageName();
  const { language, pack, settings, updateSettings, voices, voicesReady, data } = useLearning();
  const [target, setTarget] = useState<'lang' | 'vi'>('lang');
  if (!language) return null;
  const code = target === 'lang' ? language.id : 'vi';
  // FND-12: tên ngôn ngữ đứng giữa câu viết thường chữ đầu ("Giọng tiếng Anh").
  const label = target === 'lang' ? name(language, true) : t('vietnameseMid');
  const list = voicesFor(code, voices);
  const chosen = settings.voiceByLang[code];
  const d = data?.status === 'ready' ? data.value : null;
  const sample = d?.items[0] ? (target === 'lang' ? d.items[0].en : d.items[0].vi) : language.name;
  const loc = target === 'lang' ? ((pack && language.entries[pack]?.locale) ?? language.locale) : 'vi-VN';
  const isDefault = !chosen || !list.some((v) => v.voiceURI === chosen);
  // S8-02: "Tự động" ưu tiên giọng Google, rồi giọng chất lượng cao, rồi giọng mặc định của thiết bị.
  const auto = autoVoice(code, loc, voices);
  const pick = (uri: string) =>
    updateSettings((s) => {
      const next = { ...s.voiceByLang };
      if (uri !== AUTO) next[code] = uri;
      else delete next[code];
      return { voiceByLang: next };
    });
  const test = () => speak({ text: sample, lang: code, locale: loc, voiceURI: isDefault ? undefined : chosen, rate: settings.rate });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-label" id="s8-voice-target">
          {t('voiceFor')}
        </span>
        <DropdownSelect
          labelledBy="s8-voice-target"
          value={target}
          onValueChange={(v) => setTarget(v as 'lang' | 'vi')}
          options={[
            { value: 'lang', label: name(language) },
            { value: 'vi', label: t('vietnamese') },
          ]}
        />
      </div>

      {voicesReady && list.length === 0 ? (
        <p className="text-data" role="status">
          {t('noVoices', { lang: target === 'lang' ? name(language, true) : t('vietnameseMid') })}
        </p>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-label" id="s8-voice">
            {t('voiceOf', { lang: label })}
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <DropdownSelect
              className="min-w-0 flex-1"
              labelledBy="s8-voice"
              value={isDefault ? AUTO : chosen}
              onValueChange={pick}
              searchable={list.length > 8}
              options={[
                { value: AUTO, label: t('auto'), description: auto ? t('autoUsing', { voice: auto.name }) : undefined },
                ...list.map((v) => ({ value: v.voiceURI, label: v.name, description: v.lang })),
              ]}
            />
            <Button tone="outline" icon={<Volume2 className="size-4" aria-hidden />} onClick={test} data-testid="s8-voice-test">
              {t('tryVoice')}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <span className="text-label" id="s8-rate">
          {t('rate')}
        </span>
        <DropdownSelect labelledBy="s8-rate" value={String(settings.rate)} onValueChange={(v) => updateSettings({ rate: Number(v) })} options={RATES.map((r) => ({ value: String(r), label: rateLabel(r, locale) }))} />
      </div>
    </div>
  );
}
