// @spec APP-15
// Ngôn ngữ giao diện: tiếng Việt mặc định, tiếng Anh thứ hai. URL không có tiền tố ngôn ngữ; lựa chọn lưu bằng cookie.
import { defineRouting } from 'next-intl/routing';

export const LOCALE_COOKIE = 'NEXT_LOCALE';

export const routing = defineRouting({
  locales: ['vi', 'en'],
  defaultLocale: 'vi',
  localePrefix: 'never',
  localeCookie: { name: LOCALE_COOKIE, maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' },
});

export type AppLocale = (typeof routing.locales)[number];

/** Múi giờ dùng khi định dạng ngày giờ trên giao diện. Khai báo một nơi (rule i18n). */
export const TIME_ZONE = 'Asia/Ho_Chi_Minh';
