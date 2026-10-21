'use client';
// @spec APP-05, APP-06, APP-08, DATA-05, DATA-06, DATA-13, DATA-14
// Trạng thái của khu học: cài đặt, danh mục, dữ liệu ngôn ngữ đang học, tiến độ, giọng đọc, đồng bộ tài khoản.
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flushSync } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import {
  SafeStorage,
  SETTINGS_KEY,
  emptyProgress,
  loadCatalog,
  loadLanguageData,
  loadProgress,
  loadSettings,
  mergeProgress,
  mergeSettings,
  progressKey,
  sameProgress,
  saveProgress,
  saveSettings,
  type Catalog,
  type CatalogLanguage,
  type DataSource,
  type LanguageData,
  type PackId,
  type Progress,
  type Settings,
} from '@/domain';
import { createDataSource } from '@/services/content-services/api';
import { createSyncApi } from '@/services/sync-services/api';
import type { SyncApi } from '@/services/sync-services/type';
import type { AuthUser } from '@/services/auth-services/type';
import { useBeforeSignOut } from './auth-provider';
import { ensureScriptFont } from '@/lib/script-fonts';
import { useVoices } from '@/lib/speech';
import { showApiError } from '@/lib/toast';

export type Load<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; value: T };

export interface AppDeps {
  source: DataSource;
  storage: SafeStorage;
  now: () => number;
  /** Đồng bộ với tài khoản; null là không đồng bộ (chế độ trên máy, test). Bỏ trống thì tự tạo theo cấu hình. */
  sync?: SyncApi | null;
}

export interface LearningState {
  deps: AppDeps;
  settings: Settings;
  updateSettings: (patch: Partial<Settings> | ((s: Settings) => Partial<Settings>)) => void;
  catalog: Load<Catalog>;
  retryCatalog: () => void;
  /** Ngôn ngữ đang học (đã có trong danh mục). */
  language?: CatalogLanguage;
  pack?: PackId;
  data: Load<LanguageData> | null;
  retryData: () => void;
  progress: Progress;
  updateProgress: (fn: (p: Progress) => Progress) => Progress;
  /** Tải dữ liệu rồi lưu lựa chọn ngôn ngữ và bộ (S1-04, S1-07, APP-06). */
  chooseLanguage: (lang: string, pack: PackId) => Promise<void>;
  storageBlocked: boolean;
  voices: SpeechSynthesisVoice[];
  voicesReady: boolean;
  /** DATA-14: đang lấy dữ liệu học từ tài khoản lần đầu sau khi đăng nhập. */
  syncing: boolean;
}

const Ctx = createContext<LearningState | null>(null);

export function useLearning(): LearningState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useLearning ngoài LearningProvider');
  return v;
}

export function defaultDeps(): AppDeps {
  return { source: createDataSource(), storage: new SafeStorage(), now: () => Date.now() };
}

/** Bộ đang dùng của một ngôn ngữ: bộ đã lưu, hoặc bộ duy nhất. Không có bộ mặc định cho ngôn ngữ nhiều bộ (DATA-13). */
export function packFor(settings: Settings, lang: CatalogLanguage | undefined): PackId | undefined {
  if (!lang) return undefined;
  const saved = settings.packByLang[lang.id];
  if (saved && lang.packs.includes(saved)) return saved;
  return lang.packs.length === 1 ? lang.packs[0] : undefined;
}

const toLoad = <T,>(q: { status: string; data?: T; error: Error | null }): Load<T> =>
  q.status === 'success' ? { status: 'ready', value: q.data as T } : q.status === 'error' ? { status: 'error', error: q.error ?? new Error('error') } : { status: 'loading' };

const PROGRESS_PREFIX = 'vitasr2.progress.';
type ProgressSlot = { key: string | null; p: Progress; raw: string | null };
const splitKey = (k: string) => k.split('.') as [PackId, string];
const SYNC_DELAY_MS = 1500;

export function LearningProvider({ deps: given, user, children }: { deps?: AppDeps; user?: AuthUser | null; children: ReactNode }) {
  const deps = useMemo(() => given ?? defaultDeps(), [given]);
  const qc = useQueryClient();
  const tErr = useTranslations('apiError');
  const [settings, setSettings] = useState<Settings>(() => loadSettings(deps.storage));
  const settingsRef = useRef(settings);
  const [storageBlocked, setBlocked] = useState(deps.storage.isBlocked());
  useEffect(() => deps.storage.subscribe(setBlocked) as unknown as () => void, [deps.storage]);

  // ---------- Danh mục và dữ liệu câu (react-query) ----------
  const catalogQ = useQuery({ queryKey: ['catalog'], queryFn: () => loadCatalog(deps.source) });
  const catalog = toLoad<Catalog>(catalogQ);
  const cat = catalogQ.data;
  const language = cat?.languages.find((l) => l.id === settings.lang);
  const pack = packFor(settings, language);

  const dataQuery = useCallback(
    (lang: string, p: PackId) => ({
      queryKey: ['language-data', p, lang] as const,
      queryFn: () => loadLanguageData(deps.source, cat!, lang, p),
    }),
    [deps.source, cat],
  );
  const dataQ = useQuery({
    ...dataQuery(language?.id ?? '', pack ?? 'global'),
    enabled: Boolean(cat && language && pack),
  });
  const data: Load<LanguageData> | null = cat && language && pack ? toLoad<LanguageData>(dataQ) : null;
  useEffect(() => {
    if (language) ensureScriptFont(language.id);
  }, [language]);

  // ---------- Tiến độ của cặp (bộ, ngôn ngữ) đang học ----------
  const key = language && pack ? `${pack}.${language.id}` : null;
  const readProgress = useCallback(
    (k: string | null): ProgressSlot => {
      if (!k) return { key: k, p: emptyProgress(), raw: null };
      const [pk, lg] = splitKey(k);
      return { key: k, p: loadProgress(deps.storage, pk, lg), raw: deps.storage.get(progressKey(pk, lg)) };
    },
    [deps.storage],
  );
  // `raw`: chuỗi đang nằm trong bộ nhớ máy ứng với `p`, để biết tab khác đã ghi đè hay chưa mà không phải đọc lại JSON mỗi lần.
  const [slot, setSlot] = useState<ProgressSlot>(() => readProgress(key));
  let current = slot;
  if (slot.key !== key) {
    // Đổi ngôn ngữ hoặc bộ: đọc tiến độ của cặp mới ngay trong lần vẽ này (không vẽ một lần với tiến độ cũ).
    current = readProgress(key);
    setSlot(current);
  }
  /** Bản mới nhất để các hàm ghi đọc ngay (nhiều lần ghi trong cùng một sự kiện). */
  const latest = useRef(current);
  useLayoutEffect(() => {
    latest.current = slot;
  }, [slot]);
  const commit = useCallback((next: ProgressSlot) => {
    latest.current = next;
    setSlot(next);
  }, []);
  const reloadProgress = useCallback(() => {
    const k = latest.current.key;
    if (k) commit(readProgress(k));
  }, [readProgress, commit]);

  // ---------- Đồng bộ tài khoản (DATA-14) ----------
  const sync = useMemo(() => (deps.sync === undefined ? createSyncApi() : deps.sync), [deps.sync]);
  const uid = user?.id ?? null;
  const canSync = Boolean(sync && uid);
  const pending = useRef(new Set<string>());
  const pushTimer = useRef<number | undefined>(undefined);
  const pulled = useRef(false);
  const warned = useRef(false);

  const pullQ = useQuery({
    queryKey: ['cloud-pull', uid],
    enabled: canSync,
    retry: 1,
    // Mỗi lần vào khu học (đăng nhập lại, đổi người) lấy bản mới của tài khoản, không dùng bản lấy lần trước trong tab.
    staleTime: 0,
    gcTime: 0,
    queryFn: async () => {
      const [s, rows] = await Promise.all([sync!.fetchSettings(uid!), sync!.fetchAllProgress(uid!)]);
      return { s, rows };
    },
  });

  const pushM = useMutation({
    // Các lần gửi chạy lần lượt: lần sau đọc bản trên tài khoản sau khi lần trước đã ghi, không ghi đè nhau.
    scope: { id: 'cloud-push' },
    mutationFn: async (keys: string[]) => {
      for (const k of keys) {
        if (k === SETTINGS_KEY) {
          await sync!.saveSettings(uid!, settingsRef.current);
          continue;
        }
        const [pk, lg] = splitKey(k.slice(PROGRESS_PREFIX.length));
        const remote = await sync!.fetchProgress(uid!, pk, lg);
        const local = loadProgress(deps.storage, pk, lg);
        const merged = remote ? mergeProgress(local, remote) : local;
        await sync!.saveProgress(uid!, pk, lg, merged);
        // Trong lúc gửi, người học có thể đã học thêm: gộp lại với bản mới nhất trên máy, không ghi đè.
        const newest = loadProgress(deps.storage, pk, lg);
        const final = mergeProgress(newest, merged);
        if (!sameProgress(final, newest)) {
          saveProgress(deps.storage, pk, lg, final);
          if (latest.current.key === `${pk}.${lg}`) reloadProgress();
        }
      }
    },
    onError: (e, keys) => {
      for (const k of keys) pending.current.add(k);
      // Báo một lần mỗi lần mở app; mất mạng thì không báo, sẽ gửi lại khi có mạng.
      if (!warned.current && navigator.onLine !== false) {
        warned.current = true;
        showApiError(e, (c) => tErr(c), { id: 'dong-bo' });
      }
    },
  });
  const pushNowRef = useRef(pushM.mutateAsync);
  useLayoutEffect(() => {
    pushNowRef.current = pushM.mutateAsync;
  });
  /** Lần gửi gần nhất (lỗi đã được onError xử lý), để đăng xuất chờ lần đang chạy xong. */
  const inflight = useRef<Promise<unknown>>(Promise.resolve());
  const pushKeys = useCallback((keys: string[]) => {
    inflight.current = pushNowRef.current(keys).catch(() => undefined);
    return inflight.current;
  }, []);

  const flush = useCallback(() => {
    window.clearTimeout(pushTimer.current);
    if (!canSync || !pulled.current || pending.current.size === 0) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
    const keys = [...pending.current];
    pending.current.clear();
    void pushKeys(keys);
  }, [canSync, pushKeys]);

  const schedulePush = useCallback(
    (k: string) => {
      if (!canSync) return;
      pending.current.add(k);
      window.clearTimeout(pushTimer.current);
      pushTimer.current = window.setTimeout(flush, SYNC_DELAY_MS);
    },
    [canSync, flush],
  );

  // Lần đầu sau khi đăng nhập: gộp dữ liệu của tài khoản vào máy, rồi gửi phần máy có mà tài khoản chưa có.
  useEffect(() => {
    if (!pullQ.data || pulled.current) return;
    pulled.current = true;
    const { s, rows } = pullQ.data;
    const merged = mergeSettings(loadSettings(deps.storage), s);
    saveSettings(deps.storage, merged);
    settingsRef.current = merged;
    setSettings(merged);
    const remoteKeys = new Set<string>();
    for (const r of rows) {
      const k = progressKey(r.pack, r.lang);
      remoteKeys.add(k);
      const local = loadProgress(deps.storage, r.pack, r.lang);
      const m = mergeProgress(local, r.data);
      if (!sameProgress(m, local)) saveProgress(deps.storage, r.pack, r.lang, m);
      if (!sameProgress(m, r.data)) pending.current.add(k);
    }
    for (const k of deps.storage.keys(PROGRESS_PREFIX)) if (!remoteKeys.has(k)) pending.current.add(k);
    pending.current.add(SETTINGS_KEY);
    reloadProgress();
    flush();
  }, [pullQ.data, deps.storage, reloadProgress, flush]);

  // Không lấy được dữ liệu tài khoản (mất mạng, máy chủ lỗi): báo một lần, có mạng lại thì thử lại.
  useEffect(() => {
    if (!pullQ.isError) return;
    if (!warned.current && navigator.onLine !== false) {
      warned.current = true;
      showApiError(pullQ.error, (c) => tErr(c), { id: 'dong-bo' });
    }
    const again = () => void pullQ.refetch();
    window.addEventListener('online', again);
    return () => window.removeEventListener('online', again);
  }, [pullQ.isError, pullQ.error, pullQ.refetch, tErr]); // eslint-disable-line react-hooks/exhaustive-deps

  // Đăng xuất khi còn thay đổi chưa gửi (đang chờ 1,5 giây): gửi ngay rồi mới đăng xuất.
  const beforeSignOut = useBeforeSignOut();
  useEffect(() => {
    if (!canSync) return;
    return beforeSignOut(async () => {
      window.clearTimeout(pushTimer.current);
      // Chờ lần gửi đang chạy (nếu có), rồi gửi nốt phần còn chờ.
      await inflight.current;
      if (!pulled.current || pending.current.size === 0) return;
      if (typeof navigator !== 'undefined' && navigator.onLine === false) return;
      const keys = [...pending.current];
      pending.current.clear();
      await pushKeys(keys);
    });
  }, [canSync, beforeSignOut, pushKeys]);

  useEffect(() => {
    if (!canSync) return;
    const onHide = () => document.visibilityState === 'hidden' && flush();
    window.addEventListener('online', flush);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('online', flush);
      document.removeEventListener('visibilitychange', onHide);
      // Rời khu học (đổi người, đổi ngôn ngữ giao diện) khi còn phần chờ gửi: gửi ngay thay vì bỏ.
      flush();
    };
  }, [canSync, flush]);

  // ---------- Ghi cài đặt và tiến độ ----------
  const updateSettings = useCallback<LearningState['updateSettings']>(
    (patch) => {
      const next = { ...settingsRef.current, ...(typeof patch === 'function' ? patch(settingsRef.current) : patch) };
      settingsRef.current = next;
      saveSettings(deps.storage, next);
      setSettings(next);
      schedulePush(SETTINGS_KEY);
    },
    [deps.storage, schedulePush],
  );

  const updateProgress = useCallback(
    (fn: (p: Progress) => Progress) => {
      let cur = latest.current;
      if (cur.key) {
        const [pk, lg] = splitKey(cur.key);
        // DATA-06: tab khác của app có thể vừa ghi tiến độ; đọc lại trước khi sửa để không ghi đè mất phần của tab đó.
        // Chỉ nạp lại khi đọc được bản khác hẳn; đọc lỗi (trả về null) hay bộ nhớ bị chặn thì giữ bản đang có.
        const fresh = deps.storage.get(progressKey(pk, lg));
        if (fresh !== null && fresh !== cur.raw && !deps.storage.isBlocked()) cur = readProgress(cur.key);
      }
      const next = fn(cur.p);
      let raw: string | null = null;
      if (cur.key) {
        const [pk, lg] = splitKey(cur.key);
        saveProgress(deps.storage, pk, lg, next);
        raw = deps.storage.get(progressKey(pk, lg));
        schedulePush(progressKey(pk, lg));
      }
      commit({ key: cur.key, p: next, raw });
      return next;
    },
    [deps.storage, readProgress, schedulePush, commit],
  );

  // DATA-06: app mở ở nhiều tab. Tab khác ghi tiến độ hay cài đặt thì nạp lại, để tab này không ghi đè mất.
  // Riêng ngôn ngữ và bộ đang học giữ theo tab này để màn đang mở không bị đổi ngang.
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === null || e.key === SETTINGS_KEY) {
        const cur = settingsRef.current;
        const loaded = loadSettings(deps.storage);
        const next: Settings = {
          ...loaded,
          lang: cur.lang,
          packByLang: { ...loaded.packByLang, ...(cur.lang && cur.packByLang[cur.lang] ? { [cur.lang]: cur.packByLang[cur.lang] } : {}) },
        };
        settingsRef.current = next;
        setSettings(next);
      }
      const k = latest.current.key;
      if (k) {
        const [pk, lg] = splitKey(k);
        if ((e.key === null || e.key === progressKey(pk, lg)) && deps.storage.get(progressKey(pk, lg)) !== latest.current.raw) reloadProgress();
      }
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, [deps.storage, reloadProgress]);

  const chooseLanguage = useCallback(
    async (lang: string, p: PackId) => {
      ensureScriptFont(lang);
      await qc.fetchQuery(dataQuery(lang, p));
      // Ghi nhận lựa chọn ngay để màn kế tiếp (thường là /hoc) thấy ngôn ngữ mới.
      flushSync(() => updateSettings((s) => ({ lang, packByLang: { ...s.packByLang, [lang]: p } })));
    },
    [qc, dataQuery, updateSettings],
  );

  const { voices, ready: voicesReady } = useVoices();

  const value: LearningState = {
    deps,
    settings,
    updateSettings,
    catalog,
    retryCatalog: () => void catalogQ.refetch(),
    language,
    pack,
    data,
    retryData: () => void dataQ.refetch(),
    progress: current.p,
    updateProgress,
    chooseLanguage,
    storageBlocked,
    voices,
    voicesReady,
    syncing: canSync && pullQ.isPending,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
