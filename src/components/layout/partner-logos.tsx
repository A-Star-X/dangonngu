// @spec C5-08, LP-01
// Logo hai đơn vị đồng hành cạnh logo VITASR: cùng chiều cao, cách nhau 12 px, giữ tỉ lệ và màu gốc.
// Giao diện tối dùng logo A-STAR chữ trắng. Là ảnh, không phải liên kết.
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** Kích thước ảnh trong public/partners (cao 168 px, đủ nét khi phóng to). */
const PHAP_LUAT = { src: '/partners/phap-luat-kinh-te-quoc-te.png', width: 520, height: 168 };
const A_STAR = { width: 722, height: 168 };

export function PartnerLogos({ size = 'md', className }: { size?: 'md' | 'sm'; className?: string }) {
  const t = useTranslations('partners');
  // Header cao 32 px (bằng ô logo VITASR); menu trượt và chân trang 24 px.
  const h = size === 'md' ? 'h-8' : 'h-6';
  return (
    <span className={cn('flex flex-none items-center gap-3', className)} data-testid="partner-logos">
      <Image {...PHAP_LUAT} alt={t('phapLuat')} className={cn(h, 'w-auto')} />
      <Image src="/partners/a-star.png" {...A_STAR} alt={t('aStar')} className={cn(h, 'w-auto dark:hidden')} />
      <Image src="/partners/a-star-trang.png" {...A_STAR} alt={t('aStar')} className={cn(h, 'hidden w-auto dark:block')} data-theme-variant="dark" />
    </span>
  );
}
