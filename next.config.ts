// @spec APP-10, APP-15, DATA-05
// Cấu hình Next.js. next-intl đọc cấu hình ngôn ngữ giao diện ở src/i18n/request.ts (APP-15).
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string };

// Mã bản build dùng cho service worker (APP-10): mỗi lần build một mã, để trình duyệt nhận ra bản mới.
const buildId = `${pkg.version}-${(process.env.VERCEL_GIT_COMMIT_SHA ?? Date.now().toString(36)).slice(0, 12)}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  generateBuildId: async () => buildId,
  // Số phiên bản hiện ở Cài đặt (S8-06), mã bản build cho service worker (APP-10).
  env: { NEXT_PUBLIC_APP_VERSION: pkg.version, APP_BUILD_ID: buildId },
  // Ảnh bằng chứng, tài liệu và dữ liệu thử không thuộc bản build.
  outputFileTracingExcludes: { '*': ['docs/**', 'fixtures/**', 'tests/**'] },
};

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
export default withNextIntl(nextConfig);
