// @spec APP-05, APP-06, APP-08, DATA-05, DATA-06, DATA-13, FND-03
// Trạng thái toàn cục: cài đặt, danh mục, dữ liệu ngôn ngữ đang học, tiến độ.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  createDataSource,
  loadCatalog,
  loadLanguageData,
  loadProgress,
  loadSettings,
  progressKey,
  saveProgress,
  SETTINGS_KEY,
  saveSettings,
  SafeStorage,
  emptyProgress,
  type Catalog,
  type CatalogLanguage,
  type DataSource,
  type LanguageData,
  type PackId,
  type Progress,
  type Settings,
} from '../data';
import { flushSync } from 'react-dom';
import { ensureScriptFont } from '../foundation/fonts';
import { useVoices } from './speech';

export type Load<T> = { status: 'loading' } | { status: 'error'; error: Error } | { status: 'ready'; value: T };

export interface AppDeps {
  source: DataSource;
  storage: SafeStorage;
  now: () => number;
}

export interface AppState {
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
}

const Ctx = createContext<AppState | null>(null);

export function useApp(): AppState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp ngoài AppProvider');
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

export function applyTheme(theme: Settings['theme']) {
  const el = document.documentElement;
  if (theme === 'system') el.removeAttribute('data-theme');
  else el.setAttribute('data-theme', theme);
}

export function AppProvider({ deps: given, children }: { deps?: AppDeps; children: ReactNode }) {
  const deps = useMemo(() => given ?? defaultDeps(), [given]);
  const [settings, setSettings] = useState<Settings>(() => loadSettings(deps.storage));
  const settingsRef = useRef(settings);
  const [storageBlocked, setBlocked] = useState(deps.storage.isBlocked());
  useEffect(() => deps.storage.subscribe(setBlocked) as unknown as () => void, [deps.storage]);

  const updateSettings = useCallback<AppState['updateSettings']>(
    (patch) => {
      const next = { ...settingsRef.current, ...(typeof patch === 'function' ? patch(settingsRef.current) : patch) };
      settingsRef.current = next;
      saveSettings(deps.storage, next);
      setSettings(next);
    },
    [deps.storage],
  );

  useEffect(() => applyTheme(settings.theme), [settings.theme]);

  // Danh mục
  const [catalog, setCatalog] = useState<Load<Catalog>>({ status: 'loading' });
  const [catalogToken, setCatalogToken] = useState(0);
  useEffect(() => {
    let alive = true;
    setCatalog({ status: 'loading' });
    loadCatalog(deps.source).then(
      (value) => alive && setCatalog({ status: 'ready', value }),
      (error: Error) => alive && setCatalog({ status: 'error', error }),
    );
    return () => {
      alive = false;
    };
  }, [deps.source, catalogToken]);

  const cat = catalog.status === 'ready' ? catalog.value : undefined;
  const language = cat?.languages.find((l) => l.id === settings.lang);
  const pack = packFor(settings, language);

  // Dữ liệu ngôn ngữ
  const cache = useRef(new Map<string, Promise<LanguageData>>());
  const getData = useCallback(
    (lang: string, p: PackId) => {
      const key = `${p}.${lang}`;
      let pr = cache.current.get(key);
      if (!pr) {
        pr = loadLanguageData(deps.source, cat!, lang, p);
        cache.current.set(key, pr);
        pr.catch(() => cache.current.delete(key));
      }
      return pr;
    },
    [deps.source, cat],
  );

  const [data, setData] = useState<Load<LanguageData> | null>(null);
  const [dataToken, setDataToken] = useState(0);
  useEffect(() => {
    if (!cat || !language || !pack) {
      setData(null);
      return;
    }
    let alive = true;
    ensureScriptFont(language.id);
    setData({ status: 'loading' });
    getData(language.id, pack).then(
      (value) => alive && setData({ status: 'ready', value }),
      (error: Error) => alive && setData({ status: 'error', error }),
    );
    return () => {
      alive = false;
    };
  }, [cat, language, pack, getData, dataToken]);

  // Tiến độ của cặp (bộ, ngôn ngữ) đang học
  const key = language && pack ? `${pack}.${language.id}` : null;
  // `raw`: chuỗi đang nằm trong bộ nhớ máy ứng với `p`, để biết tab khác đã ghi đè hay chưa mà không phải đọc lại JSON mỗi lần.
  const progressRef = useRef<{ key: string | null; p: Progress; raw: string | null }>({ key: null, p: emptyProgress(), raw: null });
  const readProgress = useCallback(
    (k: string) => {
      const [pk, lg] = k.split('.') as [PackId, string];
      return { key: k, p: loadProgress(deps.storage, pk, lg), raw: deps.storage.get(progressKey(pk, lg)) };
    },
    [deps.storage],
  );
  if (progressRef.current.key !== key) {
    progressRef.current = key ? readProgress(key) : { key, p: emptyProgress(), raw: null };
  }
  const [, force] = useState(0);
  const updateProgress = useCallback(
    (fn: (p: Progress) => Progress) => {
      let cur = progressRef.current;
      if (cur.key) {
        const [pk, lg] = cur.key.split('.') as [PackId, string];
        // DATA-06: tab khác của app có thể vừa ghi tiến độ; đọc lại trước khi sửa để không ghi đè mất phần của tab đó.
        // Chỉ nạp lại khi đọc được bản khác hẳn; đọc lỗi (trả về null) hay bộ nhớ bị chặn thì giữ bản đang có.
        const fresh = deps.storage.get(progressKey(pk, lg));
        if (fresh !== null && fresh !== cur.raw && !deps.storage.isBlocked()) cur = readProgress(cur.key);
      }
      const next = fn(cur.p);
      let raw: string | null = null;
      if (cur.key) {
        const [pk, lg] = cur.key.split('.') as [PackId, string];
        saveProgress(deps.storage, pk, lg, next);
        raw = deps.storage.get(progressKey(pk, lg));
      }
      progressRef.current = { key: cur.key, p: next, raw };
      force((n) => n + 1);
      return next;
    },
    [deps.storage, readProgress],
  );

  // DATA-06: app mở ở nhiều tab (trang học chính mở app bằng tab mới). Tab khác ghi tiến độ hay cài đặt thì nạp lại,
  // để tab này không ghi đè mất. Riêng ngôn ngữ và bộ đang học giữ theo tab này để màn đang mở không bị đổi ngang.
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === null || e.key === SETTINGS_KEY) {
        const cur = settingsRef.current;
        const loaded = loadSettings(deps.storage);
        const next: Settings = { ...loaded, lang: cur.lang, packByLang: { ...loaded.packByLang, ...(cur.lang && cur.packByLang[cur.lang] ? { [cur.lang]: cur.packByLang[cur.lang] } : {}) } };
        settingsRef.current = next;
        setSettings(next);
      }
      const k = progressRef.current.key;
      if (k) {
        const [pk, lg] = k.split('.') as [PackId, string];
        if ((e.key === null || e.key === progressKey(pk, lg)) && deps.storage.get(progressKey(pk, lg)) !== progressRef.current.raw) {
          progressRef.current = readProgress(k);
          force((n) => n + 1);
        }
      }
    };
    window.addEventListener('storage', on);
    return () => window.removeEventListener('storage', on);
  }, [deps.storage, readProgress]);

  const chooseLanguage = useCallback(
    async (lang: string, p: PackId) => {
      ensureScriptFont(lang);
      await getData(lang, p);
      // Ghi nhận lựa chọn ngay để màn kế tiếp (thường là #/hoc) thấy ngôn ngữ mới.
      flushSync(() => updateSettings((s) => ({ lang, packByLang: { ...s.packByLang, [lang]: p } })));
    },
    [getData, updateSettings],
  );

  const { voices, ready: voicesReady } = useVoices();

  const value: AppState = {
    deps,
    settings,
    updateSettings,
    catalog,
    retryCatalog: () => setCatalogToken((n) => n + 1),
    language,
    pack,
    data,
    retryData: () => setDataToken((n) => n + 1),
    progress: progressRef.current.p,
    updateProgress,
    chooseLanguage,
    storageBlocked,
    voices,
    voicesReady,
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
