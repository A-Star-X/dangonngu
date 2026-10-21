// Badge trạng thái: màu lấy từ statusBadgeClass, không tự đặt màu trong view.
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { statusBadgeClass, type StatusTone } from '@/utils/status-badge-colors';

export function Badge({ tone, children, className, icon }: { tone: StatusTone; children: ReactNode; className?: string; icon?: ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-dropdown border px-2 py-0.5 text-sm font-medium whitespace-nowrap', statusBadgeClass(tone), className)}>
      {icon}
      {children}
    </span>
  );
}
