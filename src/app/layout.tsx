// Layout gốc chỉ chuyển tiếp: thẻ <html> nằm ở src/app/[locale]/layout.tsx để có thuộc tính lang đúng ngôn ngữ giao diện.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { siteUrl } from '@/lib/seo';

export const metadata: Metadata = { metadataBase: siteUrl() };

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
