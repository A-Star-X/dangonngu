'use client';
// @spec AU-05, AU-07, APP-03, APP-04, APP-05, APP-08, C6-02
// Cổng khu học: chưa đăng nhập thì về trang đăng nhập (giữ địa chỉ để quay lại); đã đăng nhập thì nạp dữ liệu học
// của đúng người đó và bọc AppShell. Nội dung trang chỉ hiện khi danh mục và dữ liệu ngôn ngữ đã tải xong.
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { claimDevice } from '@/domain';
import { Failed } from '@/components/status/failed';
import { Skeleton } from '@/components/status/loading';
import { SheetProvider, useSheet } from '@/components/ui/sheet';
import { useNav } from '@/hooks/use-nav';
import { useRoute } from '@/hooks/use-route';
import { useUpdateNotice } from '@/hooks/use-update-notice';
import { usePathname, useRouter } from '@/i18n/navigation';
import { trackRoute } from '@/lib/route-memory';
import { PUBLIC_PATH, routeName, type RouteName } from '@/lib/routes';
import { useAuth } from '@/providers/auth-provider';
import { LearningProvider, defaultDeps, useLearning, type AppDeps } from '@/providers/learning-provider';
import type { AuthUser } from '@/services/auth-services/type';
import { AppShell } from './app-shell';
import { Banners } from './banners';

let shared: AppDeps | null = null;
/** Một bộ phụ thuộc cho cả app (dùng chung với service worker để nạp dữ liệu ngoại tuyến, APP-10). */
export function appDeps(): AppDeps {
  if (!shared) shared = defaultDeps();
  return shared;
}

function safeLocalStorage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Địa chỉ để quay lại sau khi đăng nhập: chỉ nhận đường dẫn trong app. */
export function safeNext(v: string | null | undefined): string | null {
  // Chỉ nhận đường dẫn trong website: chặn `//host`, `\`, và ký tự điều khiển (trình duyệt bỏ tab, xuống dòng trong URL,
  // nên "/\t/host" thành "//host").
  if (!v || !v.startsWith('/') || v.startsWith('//') || /[\\\u0000-\u001f\u007f]/.test(v)) return null;
  try {
    const base = 'http://vitasr.invalid';
    const u = new URL(v, base);
    // Chuẩn hóa xong vẫn có thể thành "//host" ("/.//host"): chỉ nhận đúng route của khu học (APP-04).
    if (u.origin !== base || routeName(u.pathname) === null) return null;
    return `${u.pathname}${u.search}`;
  } catch {
    return null;
  }
}

type BootShape = 'card' | 'list' | 'hoc' | 'units';
const bootShape = (name: RouteName | null, xemCau: boolean): BootShape =>
  name === 'hoc' ? 'hoc' : name === 'thu-vien' ? (xemCau ? 'list' : 'units') : name === 'chon-ngon-ngu' ? 'list' : 'card';

/**
 * Khung xương dựng sẵn trong HTML (Suspense của khu học, trước khi JS chạy): đúng hình màn sắp mở theo đường dẫn (APP-08).
 * Chỉ đọc đường dẫn, không đọc tham số URL, để Next dựng được trên máy chủ.
 */
export function WorkspaceFallback() {
  return <BootScreen shape={bootShape(routeName(usePathname()), false)} />;
}

/** Đang đọc phiên đăng nhập: khung xương đúng hình khung khu học (header, thanh bên từ md) và màn sắp mở (APP-08). */
function BootScreen({ shape }: { shape: BootShape }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed top-0 right-0 left-0 z-30 h-14 border-b border-border bg-background md:left-60" aria-hidden="true" />
      <div className="fixed inset-y-0 left-0 z-50 hidden w-60 border-r border-sidebar-border bg-sidebar md:block" aria-hidden="true" />
      <main className="pt-14 md:pl-60">
        <div className="mx-auto flex w-full max-w-[1024px] min-w-0 flex-col gap-4 px-4 py-6">
          <Skeleton shape={shape} />
        </div>
      </main>
    </div>
  );
}

export function WorkspaceFrame({ children, deps }: { children: ReactNode; deps?: AppDeps }) {
  const { status, user, signedOutByUser } = useAuth();
  const router = useRouter();
  const route = useRoute();

  useEffect(() => {
    if (status !== 'signed-out') return;
    // AU-05: tự đăng xuất thì về trang đăng nhập, không giữ màn cũ (người đăng nhập sau có thể là người khác).
    // Chưa đăng nhập mà mở route cần đăng nhập: giữ địa chỉ để đăng nhập xong quay lại đúng màn.
    router.replace(signedOutByUser ? PUBLIC_PATH.login : `${PUBLIC_PATH.login}?tiep=${encodeURIComponent(route.raw)}`);
  }, [status, router]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status !== 'signed-in' || !user) {
    return <BootScreen shape={bootShape(route.name, route.params.xem === 'cau')} />;
  }
  return (
    <SignedIn key={user.id} user={user} deps={deps}>
      {children}
    </SignedIn>
  );
}

function SignedIn({ user, deps, children }: { user: AuthUser; deps?: AppDeps; children: ReactNode }) {
  // AU-07: nhận dữ liệu học trên máy về đúng người đang đăng nhập, trước khi đọc cài đặt và tiến độ.
  useState(() => claimDevice(safeLocalStorage(), user.id));
  return (
    <LearningProvider user={user} deps={deps ?? appDeps()}>
      <SheetProvider>
        <AppShell>
          <WorkspaceContent>{children}</WorkspaceContent>
        </AppShell>
      </SheetProvider>
    </LearningProvider>
  );
}

function WorkspaceContent({ children }: { children: ReactNode }) {
  const t = useTranslations('statusDisplay');
  const route = useRoute();
  const nav = useNav();
  const app = useLearning();
  const sheet = useSheet();
  useUpdateNotice(route.name);

  useEffect(() => {
    trackRoute(route);
  }, [route]);

  // C6-02: đổi màn (kể cả nút Back của trình duyệt) thì đóng sheet đang mở, để sheet không nằm đè lên màn khác.
  // Chạy trước effect của trang mới, để trang mới vẫn tự mở được sheet của nó (ví dụ Cài đặt > Giọng đọc).
  const shown = useRef(route.name);
  useLayoutEffect(() => {
    if (shown.current === route.name) return;
    shown.current = route.name;
    sheet.close();
  }, [route.name, sheet.close]); // eslint-disable-line react-hooks/exhaustive-deps

  const { catalog, language, pack, data, settings, syncing } = app;
  const ready = catalog.status === 'ready';
  const hasLanguage = Boolean(language && pack);
  // Máy mới chưa có ngôn ngữ: chờ lấy dữ liệu tài khoản lần đầu, để không hỏi lại ngôn ngữ đã chọn trên máy khác.
  const waitSync = syncing && !settings.lang;

  // APP-05: chưa chọn ngôn ngữ thì về S1.
  useEffect(() => {
    if (!ready || waitSync) return;
    if (!hasLanguage && route.name !== 'chon-ngon-ngu') nav('chon-ngon-ngu', undefined, { replace: true, force: true });
  }, [ready, waitSync, hasLanguage, route.name, nav]);

  const listShape = route.name === 'chon-ngon-ngu' || !settings.lang;
  const cardShape = route.name === 'hoc' ? 'hoc' : 'card';
  const libraryShape = route.params.xem === 'cau' ? 'list' : 'units';
  let content: ReactNode;
  if (catalog.status === 'loading' || waitSync) content = <Skeleton shape={listShape ? 'list' : route.name === 'thu-vien' ? libraryShape : cardShape} />;
  else if (catalog.status === 'error') content = <Failed message={t('dataFailed')} onRetry={app.retryCatalog} />;
  else if (route.name === 'chon-ngon-ngu') content = children;
  else if (!hasLanguage) content = <Skeleton shape="list" />;
  else if (!data || data.status === 'loading') content = <Skeleton shape={route.name === 'thu-vien' ? libraryShape : cardShape} />;
  else if (data.status === 'error') content = <Failed message={t('dataFailed')} onRetry={app.retryData} />;
  else content = children;

  return (
    <>
      <Banners />
      {content}
    </>
  );
}
