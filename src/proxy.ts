// @spec APP-15
// Xác định ngôn ngữ giao diện cho mỗi request. Chưa chọn (chưa có cookie) thì dùng tiếng Việt,
// không đoán theo ngôn ngữ trình duyệt: người học là người Việt, nhiều máy để giao diện tiếng Anh.
import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { LOCALE_COOKIE, routing } from './i18n/routing';

const handleI18n = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (request.cookies.has(LOCALE_COOKIE)) return handleI18n(request);
  const headers = new Headers(request.headers);
  headers.set('accept-language', routing.defaultLocale);
  return handleI18n(new NextRequest(request, { headers }));
}

export const config = {
  // Bỏ qua file tĩnh, dữ liệu câu, ảnh và file metadata (robots, sitemap, icon, ảnh chia sẻ).
  matcher: ['/((?!api|_next|_vercel|data|fonts|landing|sw\\.js|robots\\.txt|sitemap\\.xml|icon|apple-icon|opengraph-image|twitter-image|.*\\..*).*)'],
};
