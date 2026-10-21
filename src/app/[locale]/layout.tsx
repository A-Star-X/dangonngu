// @spec APP-15, APP-16, FND-03, FND-04
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { baseMetadata } from '@/lib/seo';
import { AppProviders } from '@/providers/app-providers';
import { themeScript } from '@/providers/theme-provider';
import { ClientBoot } from '@/components/layout/client-boot';
import '@/styles/fonts';
import '@/styles/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'meta' });
  return baseMetadata(t('description'), locale);
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f4f6f9' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1424' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {/* FND-03: áp dụng sáng, tối trước khi vẽ nội dung (chạy đồng bộ ở đầu body, trước mọi phần tử hiển thị). */}
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppProviders>
            <ClientBoot />
            {children}
          </AppProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
