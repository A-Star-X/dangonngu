// @spec APP-01, LP-01
// Logo VITASR: ô vuông bo góc màu primary với chữ V, cao 32 px (rule giao diện: logo cao 32 px trong hàng 56 px).
import { cn } from '@/lib/utils';

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-8 flex-none', className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-primary" />
      <path d="M9 10.5 14.6 22.5h2.8L23 10.5h-3.1l-3.9 8.7-3.9-8.7z" className="fill-primary-foreground" />
    </svg>
  );
}

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-base font-bold tracking-wide text-foreground">VITASR</span>
    </span>
  );
}
