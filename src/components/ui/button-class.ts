// @spec C3-01, C3-02
// Class của nút, dùng được cả ở component máy chủ (liên kết trông như nút ở Landing, header công khai).
import { cn } from '@/lib/utils';

export type ButtonTone = 'primary' | 'ghost' | 'outline' | 'link' | 'success' | 'warning' | 'danger';

const TONE: Record<ButtonTone, string> = {
  primary: 'bg-primary text-primary-foreground hover:brightness-95',
  ghost: 'bg-muted text-foreground hover:brightness-95',
  outline: 'border border-border bg-transparent text-foreground hover:border-muted-foreground',
  link: 'bg-transparent text-foreground px-2 font-normal hover:underline underline-offset-4',
  success: 'bg-success text-success-foreground border border-success hover:brightness-95',
  warning: 'border-[1.5px] border-warning text-warning bg-transparent hover:bg-warning-soft',
  // Hành động xóa (FND-02: `danger` dùng cho trả lời chưa đúng và hành động xóa).
  danger: 'bg-danger text-danger-foreground hover:brightness-95',
};

export function buttonClass({ tone = 'outline', size = 'md', className }: { tone?: ButtonTone; size?: 'md' | 'lg'; className?: string } = {}) {
  return cn(
    'relative inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-button px-4 py-2.5 text-sm font-semibold text-center transition-[filter,background-color,border-color] duration-150',
    'aria-disabled:opacity-40 aria-disabled:hover:brightness-100 aria-disabled:hover:no-underline',
    size === 'lg' && 'min-h-12 px-6 text-base',
    TONE[tone],
    className,
  );
}
