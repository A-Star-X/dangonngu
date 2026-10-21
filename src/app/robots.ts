// @spec APP-16, APP-17
import type { MetadataRoute } from 'next';
import { PUBLIC_PATH, ROUTE_PATH } from '@/lib/routes';
import { siteUrl } from '@/lib/seo';
import { indexable } from '@/lib/app-env';

export default function robots(): MetadataRoute.Robots {
  // APP-17: staging và demo không cho máy tìm kiếm index.
  if (!indexable()) return { rules: [{ userAgent: '*', disallow: '/' }] };
  const base = siteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        allow: [PUBLIC_PATH.home, PUBLIC_PATH.register],
        // Khu học cần đăng nhập và trang đăng nhập không cho index.
        disallow: [...Object.values(ROUTE_PATH), PUBLIC_PATH.login],
      },
    ],
    sitemap: new URL('/sitemap.xml', base).toString(),
    host: base.origin,
  };
}
