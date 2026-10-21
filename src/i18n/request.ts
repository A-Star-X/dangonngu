// @spec APP-15
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { routing, TIME_ZONE } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  // Ngôn ngữ không hỗ trợ thì về ngôn ngữ mặc định.
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  return {
    locale,
    timeZone: TIME_ZONE,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
