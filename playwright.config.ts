import { defineConfig, devices } from '@playwright/test';

// Test giao diện chạy trên bản build (`npm run build` trước, rồi `next start`) với bộ dữ liệu đầy đủ trong public/data.
// Chế độ tài khoản trên máy (AU-06): không cấu hình Supabase, không gọi dịch vụ thật.
// Script chụp ảnh bằng chứng (evidence*.spec.ts) chỉ chạy khi EVIDENCE=1; script chụp ảnh cho Landing chỉ chạy khi SHOTS=1.
const ignore: string[] = [];
if (!process.env.EVIDENCE) ignore.push('**/evidence*.spec.ts');
if (!process.env.SHOTS) ignore.push('**/landing-shots.spec.ts');

export default defineConfig({
  testDir: 'tests/e2e',
  testIgnore: ignore,
  outputDir: 'test-results',
  fullyParallel: true,
  // Máy chạy test có thể chậm (2 nhân, chạy cùng test khác): chờ lâu hơn mặc định 5 giây.
  expect: { timeout: 10000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    trace: 'retain-on-failure',
    // Giờ Việt Nam, khớp mốc thời gian của tiến độ mẫu (fixtures/progress).
    timezoneId: 'Asia/Ho_Chi_Minh',
    locale: 'vi-VN',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        // Chỉ cho Chromium: máy đã có sẵn Chromium thì trỏ tới nó, không áp cho WebKit.
        launchOptions: process.env.PW_CHROMIUM_PATH ? { executablePath: process.env.PW_CHROMIUM_PATH } : undefined,
      },
    },
    // WebKit (gần Safari iOS) theo QD-01: bật khi máy chạy test đã cài trình duyệt WebKit của Playwright.
    ...(process.env.PW_WEBKIT ? [{ name: 'webkit', use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } } }] : []),
  ],
  webServer: {
    command: 'npx next start -p 4173',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
