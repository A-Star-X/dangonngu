// Đầu trang: h1 24 px đậm, mô tả tùy chọn, hành động bên phải và xuống dòng khi hẹp (rule giao diện, FND-15).
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PageHeader({ title, description, actions, className, titleId, srOnlyTitle }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; className?: string; titleId?: string; srOnlyTitle?: boolean }) {
  return (
    <header className={cn('flex flex-wrap items-start justify-between gap-x-4 gap-y-3', srOnlyTitle && !description && !actions && 'sr-only', className)}>
      <div className="min-w-0 flex-1 basis-60">
        <h1 id={titleId} className={cn('text-2xl font-bold text-foreground', srOnlyTitle && 'sr-only')}>
          {title}
        </h1>
        {description && <p className="text-description mt-1">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** Tiêu đề section: h2 + text-description (rule giao diện). */
export function SectionTitle({ children, id, className }: { children: ReactNode; id?: string; className?: string }) {
  return (
    <h2 id={id} className={cn('text-description font-medium', className)}>
      {children}
    </h2>
  );
}
