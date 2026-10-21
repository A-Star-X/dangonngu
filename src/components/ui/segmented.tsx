'use client';
// Nhóm nút liền nhau chọn cách xem (T3-08), trình độ (T3-10), khoảng thời gian (T4-01). Mỗi nút 44 px.
import { cn } from '@/lib/utils';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  ariaLabel?: string;
}

export function Segmented<T extends string>({ options, value, onChange, label, className }: { options: SegmentedOption<T>[]; value: T | undefined; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    // Không dùng overflow-hidden: viền focus nằm ngoài nút 2 px (FND-14) sẽ bị cắt; bo góc đặt ở nút đầu và cuối.
    <div className={cn('inline-flex max-w-full flex-wrap rounded-button border border-border bg-card', className)} role="group" aria-label={label}>
      {options.map((o, i) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            className={cn(
              'relative min-h-11 min-w-14 px-4 text-sm text-foreground first:rounded-l-button last:rounded-r-button focus-visible:z-10',
              i > 0 && 'border-l border-border',
              on ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground' : 'hover:bg-muted',
            )}
            aria-pressed={on}
            aria-label={o.ariaLabel}
            onClick={() => !on && onChange(o.value)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
