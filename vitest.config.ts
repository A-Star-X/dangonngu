// Test đơn vị (Vitest, jsdom). Chạy bằng `npm test` với giờ Việt Nam để khớp tiến độ mẫu.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  define: { 'process.env.NEXT_PUBLIC_APP_VERSION': JSON.stringify('0.2.0') },
  test: {
    include: ['tests/unit/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['tests/unit/setup.ts'],
    testTimeout: 20000,
    css: false,
  },
});
