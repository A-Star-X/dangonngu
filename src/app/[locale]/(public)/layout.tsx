// @spec LP-01, AU-01
// Trang công khai: header riêng, không có thanh bên; nội dung rộng tối đa khoảng 1152 px như header, chân trang (LP-01).
import type { ReactNode } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { PublicHeader } from '@/components/layout/public-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default async function PublicLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
