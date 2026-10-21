'use client';
// @spec T3-01, FND-02
import { Check, Circle, RotateCcw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DisplayStatus } from '@/domain';
import { cn } from '@/lib/utils';

const COLOR: Record<DisplayStatus, string> = { 'chua-hoc': 'text-muted-foreground', 'da-nho': 'text-success', 'can-on': 'text-warning' };

export function StatusIcon({ status, decorative }: { status: DisplayStatus; decorative?: boolean }) {
  const t = useTranslations('status');
  const label = t(status);
  const Icon = status === 'da-nho' ? Check : status === 'can-on' ? RotateCcw : Circle;
  return (
    <span className={cn('inline-flex size-6 flex-none items-center justify-center', COLOR[status])} title={decorative ? undefined : label} aria-hidden={decorative || undefined} data-status={status}>
      <Icon className="size-5" aria-hidden />
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  );
}
