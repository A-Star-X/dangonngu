'use client';
// @spec AU-01, AU-02, AU-05, AU-06
// Phiên đăng nhập của người dùng (token và user, lưu trên localStorage).
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createAuthApi } from '@/services/auth-services/api';
import type { AuthApi, AuthMode, AuthSession, AuthUser, SignUpResult } from '@/services/auth-services/type';

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  session: AuthSession | null;
  mode: AuthMode;
  signIn: (email: string, password: string) => Promise<AuthSession>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  /** Người dùng vừa tự đăng xuất (không phải phiên hết hạn): rời khu học về /dang-nhap, không giữ màn cũ (AU-05). */
  signedOutByUser: boolean;
}

const Ctx = createContext<AuthState | null>(null);

/** Việc phải làm xong trước khi đăng xuất, ví dụ gửi nốt tiến độ chưa đồng bộ (DATA-14). */
export type BeforeSignOut = () => Promise<void>;
const BeforeCtx = createContext<(fn: BeforeSignOut) => () => void>(() => () => {});
/** Đăng ký một việc chạy trước khi đăng xuất; trả về hàm hủy đăng ký. Ngoài AuthProvider thì không làm gì. */
export const useBeforeSignOut = () => useContext(BeforeCtx);
/** Chờ các việc trước khi đăng xuất tối đa chừng này, mạng chậm cũng không giữ người dùng lại lâu. */
export const SIGN_OUT_WAIT_MS = 3000;

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth ngoài AuthProvider');
  return v;
}

export function AuthProvider({ children, api: given }: { children: ReactNode; api?: AuthApi }) {
  const [api] = useState<AuthApi | null>(() => given ?? (typeof window === 'undefined' ? null : createAuthApi()));
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [signedOutByUser, setSignedOutByUser] = useState(false);

  useEffect(() => {
    // Trên máy chủ không có localStorage: chưa biết phiên, giữ "loading" tới khi chạy trên trình duyệt.
    const a = api ?? createAuthApi();
    let alive = true;
    a.getSession().then(
      (s) => {
        if (!alive) return;
        setSession(s);
        setStatus(s ? 'signed-in' : 'signed-out');
      },
      () => {
        if (!alive) return;
        setSession(null);
        setStatus('signed-out');
      },
    );
    const off = a.onChange((s) => {
      // Đăng nhập lại (kể cả ở tab khác) thì lần đăng xuất sau mới tính lại là tự đăng xuất hay không.
      if (s) setSignedOutByUser(false);
      setSession((cur) => (cur?.token === s?.token && cur?.user.id === s?.user.id ? cur : s));
      setStatus(s ? 'signed-in' : 'signed-out');
    });
    return () => {
      alive = false;
      off();
    };
  }, [api]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const s = await (api ?? createAuthApi()).signIn(email, password);
      setSignedOutByUser(false);
      setSession(s);
      setStatus('signed-in');
      return s;
    },
    [api],
  );
  const signUp = useCallback(
    async (email: string, password: string) => {
      const r = await (api ?? createAuthApi()).signUp(email, password);
      if (r.session) {
        setSignedOutByUser(false);
        setSession(r.session);
        setStatus('signed-in');
      }
      return r;
    },
    [api],
  );
  const before = useRef(new Set<BeforeSignOut>());
  const registerBefore = useCallback((fn: BeforeSignOut) => {
    before.current.add(fn);
    return () => {
      before.current.delete(fn);
    };
  }, []);
  const signOut = useCallback(async () => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const jobs = [...before.current].map((fn) => fn().catch(() => undefined));
    await Promise.race([Promise.all(jobs), new Promise<void>((r) => (timer = setTimeout(r, SIGN_OUT_WAIT_MS)))]);
    clearTimeout(timer);
    // Đặt trước khi gọi dịch vụ: dịch vụ báo đổi phiên (onChange) ngay trong lúc đăng xuất, khung khu học phải biết
    // đây là người dùng tự đăng xuất để về /dang-nhap không kèm ?tiep= (AU-05).
    setSignedOutByUser(true);
    try {
      await (api ?? createAuthApi()).signOut();
    } finally {
      setSession(null);
      setStatus('signed-out');
    }
  }, [api]);

  const value = useMemo<AuthState>(
    () => ({ status, user: session?.user ?? null, session, mode: (api ?? { mode: 'local' as AuthMode }).mode, signIn, signUp, signOut, signedOutByUser }),
    [status, session, api, signIn, signUp, signOut, signedOutByUser],
  );
  return (
    <BeforeCtx.Provider value={registerBefore}>
      <Ctx.Provider value={value}>{children}</Ctx.Provider>
    </BeforeCtx.Provider>
  );
}
