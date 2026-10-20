// @spec APP-01, APP-03, APP-04, APP-05, APP-07, APP-08, APP-09, APP-10, C6-02
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { SheetProvider, useSheet } from '../components/C6-sheet/SheetHost';
import { ToastProvider } from '../components/C7-thong-bao/ToastHost';
import { TabBar } from '../components/C5-thanh-tab/TabBar';
import { dueItemIds } from '../data';
import { FULLSCREEN_ROUTES, navigate, tabOf, useRoute, type Route } from './router';
import { AppProvider, useApp, type AppDeps } from './state';
import { TopBar } from './TopBar';
import { LoadError, Skeleton } from './States';
import { S1ChonNgonNgu } from '../pages/S1-chon-ngon-ngu/S1ChonNgonNgu';
import { T1Hoc } from '../pages/T1-hoc/T1Hoc';
import { S3PhienHoc } from '../pages/S3-phien-hoc/S3PhienHoc';
import { T2LuyenTap } from '../pages/T2-luyen-tap/T2LuyenTap';
import { T3ThuVien } from '../pages/T3-thu-vien/T3ThuVien';
import { S10ChiTietUnit } from '../pages/S10-chi-tiet-unit/S10ChiTietUnit';
import { T4TienBo } from '../pages/T4-tien-bo/T4TienBo';
import { S5KiemTra } from '../pages/S5-kiem-tra-nhanh/S5KiemTra';
import { S8CaiDat } from '../pages/S8-cai-dat/S8CaiDat';
import { useUpdateNotice } from './updates';
import './app.css';

export function App({ deps }: { deps?: AppDeps }) {
  return (
    <AppProvider deps={deps}>
      <ToastProvider>
        <SheetProvider>
          <Shell />
        </SheetProvider>
      </ToastProvider>
    </AppProvider>
  );
}

function useOnline() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine !== false));
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}

function Banners() {
  const { storageBlocked } = useApp();
  const online = useOnline();
  return (
    <>
      {!online && (
        <p className="banner t-sm" role="status">
          Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy.
        </p>
      )}
      {storageBlocked && (
        <p className="banner banner--warn t-sm" role="alert">
          Trình duyệt đang chặn lưu tiến độ, tiến độ sẽ mất khi đóng app. Cho phép trang này lưu trên máy trong cài đặt trình duyệt rồi mở lại app.
        </p>
      )}
    </>
  );
}

function Shell() {
  const route = useRoute();
  const app = useApp();
  useUpdateNotice(route.name);

  // C6-02: đổi màn (kể cả nút Back của trình duyệt hay điện thoại) thì đóng sheet đang mở, để sheet không nằm đè lên màn khác.
  // Chạy trước effect của trang mới, để trang mới vẫn tự mở được sheet của nó (ví dụ Cài đặt > Giọng đọc).
  const sheet = useSheet();
  const shownRoute = useRef(route.name);
  useLayoutEffect(() => {
    if (shownRoute.current === route.name) return;
    shownRoute.current = route.name;
    sheet.close();
  }, [route.name, sheet.close]); // eslint-disable-line react-hooks/exhaustive-deps
  const { catalog, language, pack, settings, data, progress, deps } = app;
  const ready = catalog.status === 'ready';
  const hasLanguage = Boolean(language && pack);

  // APP-04, APP-05: route không hợp lệ hoặc chưa chọn ngôn ngữ.
  useEffect(() => {
    if (!ready) return;
    if (!hasLanguage && route.name !== 'chon-ngon-ngu') navigate('chon-ngon-ngu', undefined, { replace: true });
    else if (hasLanguage && route.name === null) navigate('hoc', undefined, { replace: true });
  }, [ready, hasLanguage, route.name]);

  const fullscreen = route.name !== null && FULLSCREEN_ROUTES.includes(route.name);
  useEffect(() => {
    document.body.classList.toggle('has-tabbar', !fullscreen);
  }, [fullscreen]);

  if (catalog.status === 'loading') {
    return (
      <div className="boot">
        <Skeleton shape={!settings.lang || route.name === 'thu-vien' || route.name === 'chon-ngon-ngu' ? 'list' : 'card'} />
      </div>
    );
  }
  if (catalog.status === 'error') {
    return (
      <div className="boot">
        <LoadError onRetry={app.retryCatalog} />
      </div>
    );
  }

  if (route.name === 'chon-ngon-ngu' || !hasLanguage) {
    return (
      <div className="fullscreen">
        <Banners />
        <S1ChonNgonNgu />
      </div>
    );
  }

  const content = (() => {
    if (!data || data.status === 'loading') return <Skeleton shape={route.name === 'thu-vien' ? 'list' : 'card'} />;
    if (data.status === 'error') return <LoadError onRetry={app.retryData} />;
    return <Page route={route} />;
  })();

  if (fullscreen) {
    return (
      <div className="fullscreen">
        <Banners />
        {content}
      </div>
    );
  }

  const reviewCount = data?.status === 'ready' ? dueItemIds(progress, deps.now(), (id) => data.value.byId.has(id)).length : 0;
  return (
    <div className="shell">
      <TabBar current={tabOf(route.name)} reviewCount={reviewCount} brand />
      <div className="shell__main">
        <TopBar settings={route.name === 'cai-dat'} />
        <Banners />
        <main className="shell__content">{content}</main>
      </div>
    </div>
  );
}

function Page({ route }: { route: Route }): ReactNode {
  switch (route.name) {
    case 'hoc':
      return <T1Hoc />;
    case 'phien-hoc':
      return <S3PhienHoc params={route.params} />;
    case 'luyen-tap':
      return <T2LuyenTap />;
    case 'thu-vien':
      return <T3ThuVien params={route.params} />;
    case 'unit':
      return <S10ChiTietUnit params={route.params} />;
    case 'tien-bo':
      return <T4TienBo params={route.params} />;
    case 'cai-dat':
      return <S8CaiDat params={route.params} />;
    case 'kiem-tra':
      return <S5KiemTra params={route.params} />;
    default:
      return null;
  }
}
