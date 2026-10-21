'use client';
// @spec FND-03
// Giao diện sáng, tối bằng class .dark trên thẻ html. Lựa chọn lưu ở THEME_KEY và áp dụng trước khung hình đầu
// tiên bằng đoạn mã trong layout gốc (themeScript), không nhấp nháy giao diện sai.
import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { THEME_KEY, type ThemeChoice } from '@/domain/progress';

interface ThemeApi {
  theme: ThemeChoice;
  /** Giao diện đang hiện thật sự (đã tính theo thiết bị). */
  resolved: 'light' | 'dark';
  setTheme: (t: ThemeChoice) => void;
}

const Ctx = createContext<ThemeApi | null>(null);

export function useTheme(): ThemeApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme ngoài ThemeProvider');
  return v;
}

/** Đọc lựa chọn đã lưu; bản cũ lưu trong vitasr2.settings.theme. */
export function readTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    if (v === 'light' || v === 'dark' || v === 'system') return v;
    const old = JSON.parse(localStorage.getItem('vitasr2.settings') || '{}') as { theme?: unknown };
    if (old.theme === 'light' || old.theme === 'dark') return old.theme;
  } catch {
    // Bộ nhớ bị chặn: theo thiết bị.
  }
  return 'system';
}

const systemDark = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function applyThemeClass(theme: ThemeChoice) {
  const dark = theme === 'dark' || (theme === 'system' && systemDark());
  document.documentElement.classList.toggle('dark', dark);
  document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
  return dark ? 'dark' : 'light';
}

/** Chạy trong <head> trước khi vẽ trang. Giữ ngắn, không phụ thuộc gói nào. */
export const themeScript = `(function(){try{var k='${THEME_KEY}';var t=localStorage.getItem(k);if(!t){var s=JSON.parse(localStorage.getItem('vitasr2.settings')||'{}');t=s.theme}var d=t==='dark'||((t!=='light')&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);var e=document.documentElement;if(d)e.classList.add('dark');e.style.colorScheme=d?'dark':'light'}catch(_){}})();`;

// Kho ngoài React: lựa chọn đã lưu và chế độ của thiết bị. Tab khác đổi giao diện thì tab này đổi theo.
const listeners = new Set<() => void>();
let memoryTheme: ThemeChoice | null = null;
const notify = () => listeners.forEach((l) => l());

function subscribe(fn: () => void) {
  listeners.add(fn);
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  mq?.addEventListener?.('change', fn);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === THEME_KEY) fn();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(fn);
    mq?.removeEventListener?.('change', fn);
    window.removeEventListener('storage', onStorage);
  };
}

const snapshot = () => `${memoryTheme ?? readTheme()}|${systemDark() ? 'dark' : 'light'}`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const snap = useSyncExternalStore(subscribe, snapshot, () => 'system|light');
  const [theme, device] = snap.split('|') as [ThemeChoice, 'light' | 'dark'];
  const resolved: 'light' | 'dark' = theme === 'system' ? device : theme;

  useEffect(() => {
    applyThemeClass(theme);
  }, [theme, device]);

  const setTheme = useCallback((t: ThemeChoice) => {
    try {
      localStorage.setItem(THEME_KEY, t);
      memoryTheme = null;
    } catch {
      // Không lưu được thì vẫn áp dụng trong lần mở này.
      memoryTheme = t;
    }
    applyThemeClass(t);
    notify();
  }, []);

  const api = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
