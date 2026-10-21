import { setRequestLocale } from 'next-intl/server';
import { makeMetadata } from '@/lib/page';
import { LandingView } from '@/views/landing';

export const generateMetadata = makeMetadata('home', '/', true, true);

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <LandingView />;
}
