// @spec APP-04, APP-14, S8-01, S10-04
// Nhớ màn đã mở gần nhất để các nút "Thoát", "Quay lại" và đường dẫn về đúng chỗ.
import { NAV_ROUTES, type Params, type Route, type RouteName } from './routes';

export interface Place {
  name: RouteName;
  params: Params;
}

/** Khu chính gần nhất đã mở (để "về màn trước" từ S3, S5). S10-04: kể cả Chi tiết Unit. */
let lastMain: Place = { name: 'hoc', params: {} };
/** APP-14: Thư viện đã xem gần nhất, để đường dẫn ở S10 mở lại đúng chỗ. */
let lastLibrary: Params | null = null;
/** Màn đang mở trước khi vào S8 Cài đặt. */
let beforeSettings: Place | null = null;
let current: Route | null = null;

export function trackRoute(to: Route) {
  if (current && current.raw === to.raw) return;
  if (to.name === 'cai-dat' && current?.name && current.name !== 'cai-dat') beforeSettings = { name: current.name, params: current.params };
  if (to.name && (NAV_ROUTES.includes(to.name) || to.name === 'unit')) lastMain = { name: to.name, params: to.params };
  if (to.name === 'thu-vien') lastLibrary = to.params;
  current = to;
}

export const lastMainRoute = (): Place => lastMain;
export const lastLibraryParams = (): Params | null => lastLibrary;
export const settingsReturn = (): Place => beforeSettings ?? { name: 'hoc', params: {} };

/** Chỉ dùng trong test. */
export function resetRouteMemory() {
  lastMain = { name: 'hoc', params: {} };
  lastLibrary = null;
  beforeSettings = null;
  current = null;
}
