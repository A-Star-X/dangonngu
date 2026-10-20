// @spec APP-04, S8-01, S10-01
// Điều hướng bằng hash (QD-02). Bảng route là nguồn chân lý ở APP-04.
import { useEffect, useState } from 'react';

export type RouteName = 'chon-ngon-ngu' | 'hoc' | 'luyen-tap' | 'thu-vien' | 'unit' | 'tien-bo' | 'cai-dat' | 'phien-hoc' | 'kiem-tra';

export const ROUTES: RouteName[] = ['chon-ngon-ngu', 'hoc', 'luyen-tap', 'thu-vien', 'unit', 'tien-bo', 'cai-dat', 'phien-hoc', 'kiem-tra'];
export const TAB_ROUTES: RouteName[] = ['hoc', 'luyen-tap', 'thu-vien', 'tien-bo'];
export const FULLSCREEN_ROUTES: RouteName[] = ['chon-ngon-ngu', 'phien-hoc', 'kiem-tra'];
/** Khu trên thanh tab mà mỗi route thuộc về (S10-01: Chi tiết Unit thuộc Thư viện). */
export const tabOf = (name: RouteName | null): RouteName | null => (name === 'unit' ? 'thu-vien' : name);

export interface Route {
  name: RouteName | null;
  params: Record<string, string>;
  raw: string;
}

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '');
  const [pathPart, query = ''] = raw.split('?');
  const seg = pathPart.replace(/^\//, '').replace(/\/$/, '');
  const name = (ROUTES as string[]).includes(seg) ? (seg as RouteName) : null;
  const params: Record<string, string> = {};
  new URLSearchParams(query).forEach((v, k) => (params[k] = v));
  return { name, params, raw };
}

export function href(name: RouteName, params?: Record<string, string | number | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== '') q.set(k, String(v));
  const qs = q.toString();
  return `#/${name}${qs ? `?${qs}` : ''}`;
}

export function navigate(name: RouteName, params?: Record<string, string | number | undefined>, opts?: { replace?: boolean }) {
  const target = href(name, params);
  if (opts?.replace) {
    const url = new URL(window.location.href);
    url.hash = target;
    window.history.replaceState(window.history.state, '', url);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (window.location.hash !== target) {
    window.location.hash = target;
  } else {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  }
}

/** Khu chính gần nhất đã mở (để "về màn trước" từ S3, S5). */
let lastMain: { name: RouteName; params: Record<string, string> } = { name: 'hoc', params: {} };
export const lastMainRoute = () => lastMain;

/**
 * Chặn rời route (S3-07: Back của trình duyệt giữa phiên mở sheet xác nhận).
 * Trả về false để giữ nguyên route hiện tại.
 */
type LeaveGuard = (to: Route) => boolean;
let leaveGuard: LeaveGuard | null = null;
export function setLeaveGuard(g: LeaveGuard | null) {
  leaveGuard = g;
}

let acceptedHref = typeof window !== 'undefined' ? window.location.href : '';

/** Màn đang mở trước khi vào S8 Cài đặt, để nút Quay lại về đúng chỗ (S8, APP-04). */
let current: Route | null = null;
let beforeSettings: { name: RouteName; params: Record<string, string> } | null = null;
function track(to: Route) {
  if (to.name === 'cai-dat' && current?.name && current.name !== 'cai-dat') beforeSettings = { name: current.name, params: current.params };
  current = to;
}
export function backFromSettings() {
  const b = beforeSettings ?? { name: 'hoc' as RouteName, params: {} };
  navigate(b.name, b.params);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    acceptedHref = window.location.href;
    if (current === null || current.raw !== route.raw) track(route);
    const on = () => {
      if (window.location.href === acceptedHref) {
        setRoute((r) => {
          const to = parseHash(window.location.hash);
          if (r.raw === to.raw) return r;
          track(to);
          return to;
        });
        return;
      }
      const to = parseHash(window.location.hash);
      if (leaveGuard && !leaveGuard(to)) {
        // Trả URL về route hiện tại, không đổi màn.
        window.history.pushState(null, '', acceptedHref);
        return;
      }
      acceptedHref = window.location.href;
      track(to);
      setRoute(to);
    };
    window.addEventListener('hashchange', on);
    window.addEventListener('popstate', on);
    return () => {
      window.removeEventListener('hashchange', on);
      window.removeEventListener('popstate', on);
    };
  }, []);
  useEffect(() => {
    // S10-04: thoát phiên mở từ Chi tiết Unit thì về lại đúng unit đó.
    if (route.name && (TAB_ROUTES.includes(route.name) || route.name === 'unit')) lastMain = { name: route.name, params: route.params };
  }, [route]);
  return route;
}
