// @spec APP-16, APP-17
// Metadata dùng chung: metadataBase, tiêu đề "%s | VITASR", Open Graph, Twitter, canonical, cho phép hay chặn index.
import type { Metadata } from 'next';
import { indexable } from './app-env';

export const SITE_NAME = 'VITASR';

export function siteUrl(): URL {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL ?? '').trim() || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');
  try {
    return new URL(raw);
  } catch {
    return new URL('http://localhost:3000');
  }
}

export function baseMetadata(description: string, locale: string): Metadata {
  return {
    metadataBase: siteUrl(),
    title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
    description,
    applicationName: SITE_NAME,
    openGraph: { type: 'website', siteName: SITE_NAME, locale: locale === 'en' ? 'en_US' : 'vi_VN', description },
    twitter: { card: 'summary_large_image', description },
  };
}

/** Ảnh chia sẻ dựng ở src/app/opengraph-image.tsx và twitter-image.tsx. */
const OG_IMAGE = { url: '/opengraph-image', width: 1200, height: 630, alt: 'VITASR' };

/**
 * Metadata một trang. `index`: trang công khai cho máy tìm kiếm; trang sau đăng nhập và trang đăng nhập thì không.
 * Next thay cả khối `openGraph`/`twitter` của layout bằng khối của trang (không gộp từng trường), và ảnh chia sẻ dạng file
 * ở thư mục gốc cũng mất theo; vì vậy khối của trang ghi lại đủ loại trang, tên site, ngôn ngữ và ảnh.
 */
export function pageMetadata({ title, description, path, index, locale = 'vi' }: { title: string; description?: string; path: string; index: boolean; locale?: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    // APP-17: chỉ production cho index.
    robots: index && indexable() ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { type: 'website', siteName: SITE_NAME, locale: locale === 'en' ? 'en_US' : 'vi_VN', title, description, url: path, images: [OG_IMAGE] },
    twitter: { card: 'summary_large_image', title, description, images: ['/twitter-image'] },
  };
}
