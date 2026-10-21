'use client';
// @spec APP-12, APP-09
// Liên kết về trang học chính. Trang học chính mở app ở trang mới (APP-09), nên đây là liên kết thường.
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { HOST_URL } from '@/lib/host-url';
import { cn } from '@/lib/utils';


export function HostLink({ className }: { className?: string }) {
  const t = useTranslations('shell');
  if (!HOST_URL) return null;
  return (
    <a
      className={cn('flex min-h-10 items-center gap-2 rounded-dropdown px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground', className)}
      href={HOST_URL}
      data-testid="host-link"
    >
      <ArrowLeft className="size-4 flex-none" aria-hidden />
      {t('hostLink')}
    </a>
  );
}
