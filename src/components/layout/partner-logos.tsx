// @spec C5-08, LP-01
// Logo hai đơn vị đồng hành cạnh logo "Đa ngôn ngữ": A-STAR rồi Pháp Luật, mỗi logo trong một khung cùng chiều cao
// (viền, bo góc 8 px), cách nhau 12 px, giữ tỉ lệ và màu gốc. Giao diện tối dùng logo A-STAR chữ trắng. Là ảnh, không phải liên kết.
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

/** Kích thước ảnh trong public/partners (cao 168 px, đủ nét khi phóng to). */
const PHAP_LUAT = { src: '/partners/phap-luat-kinh-te-quoc-te.png', width: 520, height: 168 };
const A_STAR = { width: 722, height: 168 };

/** Khung cao 36 px ở header, 32 px trong menu trượt và chân trang; logo bên trong tính trừ viền 1 px. */
const SIZES = {
  md: { frame: 'h-9', aStar: 'h-[22px]', aStarPad: 'px-2.5', phapLuat: 'h-[34px]' },
  sm: { frame: 'h-8', aStar: 'h-[18px]', aStarPad: 'px-2', phapLuat: 'h-[30px]' },
};

export function PartnerLogos({ size = 'md', className }: { size?: 'md' | 'sm'; className?: string }) {
  const t = useTranslations('partners');
  const s = SIZES[size];
  const frame = cn('flex flex-none items-center overflow-hidden rounded-card border border-border', s.frame);
  return (
    <span className={cn('flex flex-none items-center gap-3', className)} data-testid="partner-logos">
      <span className={cn(frame, 'bg-card', s.aStarPad)} data-testid="partner-frame">
        <Image src="/partners/a-star.png" {...A_STAR} alt={t('aStar')} className={cn(s.aStar, 'w-auto dark:hidden')} />
        <Image src="/partners/a-star-trang.png" {...A_STAR} alt={t('aStar')} className={cn(s.aStar, 'hidden w-auto dark:block')} data-theme-variant="dark" />
      </span>
      {/* Logo Pháp Luật có nền đỏ riêng: lấp đầy khung. */}
      <span className={frame} data-testid="partner-frame">
        <Image {...PHAP_LUAT} alt={t('phapLuat')} className={cn(s.phapLuat, 'block w-auto')} />
      </span>
    </span>
  );
}
