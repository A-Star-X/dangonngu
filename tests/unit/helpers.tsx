// Dựng app trong test đơn vị: nhà cung cấp như layout thật, khung khu học và view theo đường dẫn hiện tại.
import { act, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactNode } from 'react';
import { vi } from 'vitest';
import { SafeStorage, type DataSource } from '@/domain';
import { WorkspaceFrame } from '@/components/layout/workspace-frame';
import { SheetProvider } from '@/components/ui/sheet';
import { routeName, type RouteName } from '@/lib/routes';
import { AppProviders } from '@/providers/app-providers';
import { LearningProvider, type AppDeps } from '@/providers/learning-provider';
import { makeQueryClient } from '@/providers/query-provider';
import type { AuthApi, AuthSession } from '@/services/auth-services/type';
import { StaticFileSource } from '@/services/content-services/api';
import vi_messages from '@/messages/vi.json';
import en_messages from '@/messages/en.json';
import { ChonNgonNguView } from '@/views/chon-ngon-ngu';
import { HocView } from '@/views/hoc';
import { PhienHocView } from '@/views/phien-hoc';
import { LuyenTapView } from '@/views/luyen-tap';
import { KiemTraView } from '@/views/kiem-tra';
import { ThuVienView } from '@/views/thu-vien';
import { ChiTietUnitView } from '@/views/chi-tiet-unit';
import { TienDoView } from '@/views/tien-do';
import { CaiDatView } from '@/views/cai-dat';
import { DangNhapView } from '@/views/dang-nhap';
import { DangKyView } from '@/views/dang-ky';
import progress30 from '../../fixtures/progress/fluency-en-30-ngay.json';
import soLieu30 from '../../fixtures/progress/fluency-en-30-ngay.so-lieu.json';
import { FixtureSource } from './fixture-source';
import { usePathnameMock } from './router-mock';

export { FixtureSource };

/** Tiến độ mẫu 30 ngày (DATA-09) và số liệu tính tay đi kèm. */
export const PROGRESS_30 = progress30;
export const SO_LIEU_30 = soLieu30;
export const progressSeed = (p: unknown = progress30, pack = 'fluency', lang = 'en') => ({ [`vitasr2.progress.${pack}.${lang}`]: p });

export const MESSAGES = { vi: vi_messages, en: en_messages };

/** speechSynthesis giả với danh sách giọng cho trước. */
export function fakeSpeech(voices: { lang: string; voiceURI: string; name: string; default?: boolean; localService?: boolean }[]) {
  const synth = {
    speak: vi.fn(),
    cancel: vi.fn(),
    getVoices: () => voices,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  class Utter {
    text: string;
    lang = '';
    rate = 1;
    voice: unknown = null;
    onstart: (() => void) | null = null;
    onend: (() => void) | null = null;
    onerror: ((e: unknown) => void) | null = null;
    constructor(t: string) {
      this.text = t;
    }
  }
  (window as unknown as Record<string, unknown>).speechSynthesis = synth;
  (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = Utter;
  return synth;
}

export function removeFakeSpeech() {
  delete (window as unknown as Record<string, unknown>).speechSynthesis;
  delete (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
}

export const NOW = new Date(2026, 9, 8, 10, 0, 0).getTime();

export function memoryBackend(seed: Record<string, unknown> = {}) {
  const mem = new Map<string, string>(Object.entries(seed).map(([k, v]) => [k, typeof v === 'string' ? v : JSON.stringify(v)]));
  const backend = {
    getItem: (k: string) => (mem.has(k) ? mem.get(k)! : null),
    setItem: (k: string, v: string) => void mem.set(k, String(v)),
    removeItem: (k: string) => void mem.delete(k),
    key: (i: number) => [...mem.keys()][i] ?? null,
    get length() {
      return mem.size;
    },
    clear: () => mem.clear(),
  } as unknown as Storage;
  return { mem, backend };
}

export interface DepsOptions {
  seed?: Record<string, unknown>;
  source?: DataSource;
  now?: () => number;
  backend?: Storage | null;
}

export function makeDeps(opts: DepsOptions = {}) {
  const { mem, backend } = memoryBackend(opts.seed);
  const deps: AppDeps = {
    source: opts.source ?? new FixtureSource(),
    storage: new SafeStorage(opts.backend === undefined ? backend : opts.backend),
    now: opts.now ?? (() => NOW),
    sync: null,
  };
  return { deps, mem };
}

export function settingsSeed(extra: Record<string, unknown> = {}) {
  return { 'vitasr2.settings': { schema: 1, packByLang: { en: 'fluency' }, lang: 'en', voiceByLang: {}, rate: 1, weeklyGoal: 5, guideSeen: true, ...extra } };
}

export const TEST_USER = { id: 'nguoi-hoc-1', email: 'hoc@vitasr.test' };
export const TEST_SESSION: AuthSession = { token: 'local.test', user: TEST_USER };

/** Dịch vụ đăng nhập giả: mặc định đã đăng nhập. */
export function fakeAuth(opts: { session?: AuthSession | null; signIn?: AuthApi['signIn']; signUp?: AuthApi['signUp'] } = {}): AuthApi & { signOut: ReturnType<typeof vi.fn> } {
  let session = opts.session === undefined ? TEST_SESSION : opts.session;
  return {
    mode: 'local',
    getSession: async () => session,
    signIn: opts.signIn ?? (async () => (session = TEST_SESSION)),
    signUp: opts.signUp ?? (async () => ({ session: (session = TEST_SESSION), needsConfirm: false })),
    signOut: vi.fn(async () => {
      session = null;
    }),
    onChange: () => () => undefined,
  };
}

const VIEWS: Record<RouteName, () => ReactNode> = {
  'chon-ngon-ngu': () => <ChonNgonNguView />,
  hoc: () => <HocView />,
  'phien-hoc': () => <PhienHocView />,
  'luyen-tap': () => <LuyenTapView />,
  'kiem-tra': () => <KiemTraView />,
  'thu-vien': () => <ThuVienView />,
  unit: () => <ChiTietUnitView />,
  'tien-do': () => <TienDoView />,
  'cai-dat': () => <CaiDatView />,
};

/** Trang theo đường dẫn hiện tại, như Next chọn page.tsx trong nhóm route khu học. */
function RouteSwitch() {
  const pathname = usePathnameMock();
  const name = routeName(pathname);
  if (pathname === '/dang-nhap') return <DangNhapView />;
  if (pathname === '/dang-ky') return <DangKyView />;
  if (!name) return null;
  return <>{VIEWS[name]()}</>;
}

export interface RenderOptions extends DepsOptions {
  locale?: 'vi' | 'en';
  auth?: AuthApi;
  wait?: boolean;
}

function Intl({ locale = 'vi', children }: { locale?: 'vi' | 'en'; children: ReactNode }) {
  return (
    <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Asia/Ho_Chi_Minh">
      {children}
    </NextIntlClientProvider>
  );
}

/** Chờ dữ liệu fixture nạp xong (khung xương biến mất), tối đa khoảng 2 giây. */
export async function waitLoaded(container: HTMLElement, wait = true) {
  for (let i = 0; i < 100; i++) {
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });
    if (!wait) break;
    if (!container.querySelector('[data-testid="skeleton"], [aria-busy="true"].min-h-64')) break;
  }
  await act(async () => {
    await new Promise((r) => setTimeout(r, 0));
  });
}

/** Mở app ở một đường dẫn của khu học, ví dụ renderApp('/thu-vien?xem=cau'). */
export async function renderApp(url: string, opts: RenderOptions = {}) {
  window.history.replaceState(null, '', url.startsWith('/') ? url : `/${url}`);
  const made = makeDeps(opts);
  const auth = opts.auth ?? fakeAuth();
  const isPublic = /^\/(dang-nhap|dang-ky)/.test(window.location.pathname);
  const utils = render(
    <Intl locale={opts.locale}>
      <AppProviders queryClient={makeQueryClient()} authApi={auth}>
        {isPublic ? <RouteSwitch /> : <WorkspaceFrame deps={made.deps}>{<RouteSwitch />}</WorkspaceFrame>}
      </AppProviders>
    </Intl>,
  );
  await waitLoaded(utils.container, opts.wait !== false);
  return { ...utils, ...made, auth };
}

/** Bọc một thành phần với các provider của khu học (không có khung, không có view). */
export function withProviders(ui: ReactNode, opts: DepsOptions & { locale?: 'vi' | 'en' } = {}) {
  const made = makeDeps(opts);
  return {
    ...render(
      <Intl locale={opts.locale}>
        <AppProviders queryClient={makeQueryClient()} authApi={fakeAuth()}>
          <LearningProvider deps={made.deps} user={TEST_USER}>
            <SheetProvider>{ui}</SheetProvider>
          </LearningProvider>
        </AppProviders>
      </Intl>,
    ),
    ...made,
  };
}

/** Chỉ bọc ngôn ngữ giao diện (thành phần không cần dữ liệu học). */
export function withIntl(ui: ReactNode, locale: 'vi' | 'en' = 'vi') {
  return render(<Intl locale={locale}>{ui}</Intl>);
}

/** Đường dẫn hiện tại kèm query, ví dụ "/thu-vien?xem=cau". */
export const here = () => `${window.location.pathname}${window.location.search}`;
export const query = () => Object.fromEntries(new URLSearchParams(window.location.search));

export async function settle(ms = 0) {
  await act(async () => {
    await new Promise((r) => setTimeout(r, ms));
  });
}

export { screen };

/** Nguồn tĩnh đọc bộ dữ liệu đầy đủ trong public/data (dùng khi cần nhiều câu, ví dụ phân trang). */
export async function publicSource(): Promise<DataSource> {
  const { readFileSync } = await import('node:fs');
  const path = await import('node:path');
  const root = path.resolve(process.cwd(), 'public');
  const fetchImpl = (async (url: string) => {
    try {
      return new Response(readFileSync(path.join(root, url.replace(/^\//, ''))), { status: 200 });
    } catch {
      return new Response('', { status: 404 });
    }
  }) as unknown as typeof fetch;
  return new StaticFileSource(fetchImpl);
}

/** Các dialog đang mở. */
export const dialogs = () => document.querySelectorAll('[role="dialog"]');

/** Như layout của Next: trang công khai nằm ngoài khung, trang khu học trong WorkspaceFrame; đổi theo đường dẫn hiện tại. */
function SiteRoutes({ deps }: { deps: AppDeps }) {
  const pathname = usePathnameMock();
  if (/^\/(dang-nhap|dang-ky)/.test(pathname)) return <RouteSwitch />;
  return (
    <WorkspaceFrame deps={deps}>
      <RouteSwitch />
    </WorkspaceFrame>
  );
}

/**
 * Mở cả website (trang công khai và khu học) ở một đường dẫn: chuyển giữa trang đăng nhập và khu học hiện đúng view.
 * `deps` cho sẵn thì dùng (ví dụ có dịch vụ đồng bộ giả), không thì tạo như renderApp.
 */
export async function renderSite(url: string, opts: RenderOptions & { deps?: AppDeps } = {}) {
  window.history.replaceState(null, '', url.startsWith('/') ? url : `/${url}`);
  const made = opts.deps ? { deps: opts.deps, mem: new Map<string, string>() } : makeDeps(opts);
  const auth = opts.auth ?? fakeAuth();
  const utils = render(
    <Intl locale={opts.locale}>
      <AppProviders queryClient={makeQueryClient()} authApi={auth}>
        <SiteRoutes deps={made.deps} />
      </AppProviders>
    </Intl>,
  );
  await waitLoaded(utils.container, opts.wait !== false);
  return { ...utils, ...made, auth };
}
