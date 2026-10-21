// @spec AU-05, APP-16
// Khu học: mọi trang cần đăng nhập, không cho máy tìm kiếm index.
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { WorkspaceFallback, WorkspaceFrame } from '@/components/layout/workspace-frame';

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    // Khung khu học đọc tham số URL nên chỉ chạy trên trình duyệt; HTML dựng sẵn có khung xương đúng hình (APP-08).
    <Suspense fallback={<WorkspaceFallback />}>
      <WorkspaceFrame>{children}</WorkspaceFrame>
    </Suspense>
  );
}
