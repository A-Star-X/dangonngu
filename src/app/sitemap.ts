// @spec APP-16
// Chỉ các trang công khai cho index.
import type { MetadataRoute } from 'next';
import { PUBLIC_PATH } from '@/lib/routes';
import { siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return [
    { url: new URL(PUBLIC_PATH.home, base).toString(), changeFrequency: 'monthly', priority: 1 },
    { url: new URL(PUBLIC_PATH.register, base).toString(), changeFrequency: 'yearly', priority: 0.6 },
  ];
}
