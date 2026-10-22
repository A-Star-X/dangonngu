// @spec APP-18, APP-01, LP-01
// Logo: chữ "Đa ngôn ngữ" đậm, không có ô biểu tượng (QD-12). Tên riêng tiếng Việt nên có lang="vi" kể cả khi giao diện tiếng Anh.
import { SITE_NAME } from '@/lib/seo';
import { cn } from '@/lib/utils';

export function Brand({ className }: { className?: string }) {
  return (
    <span className={cn('text-lg font-bold whitespace-nowrap text-foreground', className)} lang="vi">
      {SITE_NAME}
    </span>
  );
}
