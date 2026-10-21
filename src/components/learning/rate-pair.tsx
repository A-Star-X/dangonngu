'use client';
// @spec C3-03
import { Check, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export function RatePair({ locked, onReview, onKnown }: { locked: boolean; onReview: () => void; onKnown: () => void }) {
  const t = useTranslations('rate');
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button tone="warning" locked={locked} onClick={onReview} icon={<RotateCcw className="size-5" aria-hidden />} shortcut="1" className="min-h-12">
        {t('review')}
      </Button>
      <Button tone="success" locked={locked} onClick={onKnown} icon={<Check className="size-5" aria-hidden />} shortcut="2" className="min-h-12">
        {t('known')}
      </Button>
    </div>
  );
}
