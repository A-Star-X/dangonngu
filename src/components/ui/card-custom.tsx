// Khung cho mọi panel và bảng: nền card, p-4, bo góc 8 px (rule giao diện).
import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function CardCustom({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('rounded-card bg-card p-4 text-card-foreground', className)} {...rest} />;
}
