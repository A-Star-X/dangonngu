// @spec APP-04, APP-13, S10-01
// Bảng route của khu học (APP-04). URL không có dấu # và không có tiền tố ngôn ngữ giao diện (APP-15).

export type RouteName = 'chon-ngon-ngu' | 'hoc' | 'luyen-tap' | 'thu-vien' | 'unit' | 'tien-do' | 'cai-dat' | 'phien-hoc' | 'kiem-tra';

export const ROUTE_PATH: Record<RouteName, string> = {
  'chon-ngon-ngu': '/chon-ngon-ngu',
  hoc: '/hoc',
  'luyen-tap': '/luyen-tap',
  'thu-vien': '/thu-vien',
  unit: '/thu-vien/unit',
  'tien-do': '/tien-do',
  'cai-dat': '/cai-dat',
  'phien-hoc': '/phien-hoc',
  'kiem-tra': '/kiem-tra',
};

/** Trang công khai, không cần đăng nhập (AU-01, LP-01). */
export const PUBLIC_PATH = { home: '/', login: '/dang-nhap', register: '/dang-ky' } as const;

/** Bốn khu chính trên thanh bên (C5-01). */
export const NAV_ROUTES: RouteName[] = ['hoc', 'luyen-tap', 'thu-vien', 'tien-do'];

/** Khu trên thanh bên mà mỗi route thuộc về (S10-01: Chi tiết Unit thuộc Thư viện). */
export const navOf = (name: RouteName | null): RouteName | null => (name === 'unit' ? 'thu-vien' : name);

export type Params = Record<string, string>;
export type ParamsIn = Record<string, string | number | undefined | null>;

export interface Route {
  name: RouteName | null;
  params: Params;
  /** Đường dẫn kèm query, ví dụ /thu-vien?xem=cau. */
  raw: string;
}

const BY_PATH = new Map(Object.entries(ROUTE_PATH).map(([k, v]) => [v, k as RouteName]));

export function routeName(pathname: string): RouteName | null {
  const p = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  return BY_PATH.get(p) ?? null;
}

export function toParams(search: URLSearchParams | string | null | undefined): Params {
  const out: Params = {};
  if (!search) return out;
  const sp = typeof search === 'string' ? new URLSearchParams(search) : search;
  sp.forEach((v, k) => (out[k] = v));
  return out;
}

export function query(params?: ParamsIn): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v !== undefined && v !== null && v !== '') q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function href(name: RouteName, params?: ParamsIn): string {
  return `${ROUTE_PATH[name]}${query(params)}`;
}

export function parseHref(url: string): Route {
  const u = new URL(url, 'http://x');
  return { name: routeName(u.pathname), params: toParams(u.searchParams), raw: `${u.pathname}${u.search}` };
}

/** Đổi đường dẫn kiểu cũ (#/thu-vien?xem=cau) sang đường dẫn mới, để liên kết đã lưu vẫn mở đúng màn (APP-04). */
export function legacyHashTarget(hash: string): string | null {
  const m = /^#\/([a-z-]+)(\?.*)?$/.exec(hash);
  if (!m) return null;
  const old = m[1];
  const name: RouteName | null = old === 'tien-bo' ? 'tien-do' : old in ROUTE_PATH ? (old as RouteName) : null;
  if (!name) return ROUTE_PATH.hoc;
  return `${ROUTE_PATH[name]}${m[2] ?? ''}`;
}
