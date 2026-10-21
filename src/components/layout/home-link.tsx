'use client';
// @spec APP-12, C5-07
// Liên kết "Trang chủ" ở chân thanh bên: về Landing của website. Đi qua AppLink để giữa phiên học vẫn hỏi trước khi rời (S3-07).
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { AppLink } from '@/components/ui/app-link';
import { PUBLIC_PATH } from '@/lib/routes';
import { cn } from '@/lib/utils';


export function HomeLink({ className, onClick }: { className?: string; onClick?: () => void }) {
  const t = useTranslations('shell');
  return (
    <AppLink
      className={cn('flex min-h-10 items-center gap-2 rounded-dropdown px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground', className)}
      href={PUBLIC_PATH.home}
      onClick={onClick}
      data-testid="home-link"
    >
      <ArrowLeft className="size-4 flex-none" aria-hidden />
      {t('homeLink')}
    </AppLink>
  );
}
