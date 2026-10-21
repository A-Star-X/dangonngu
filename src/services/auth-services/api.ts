// @spec AU-01, AU-02, AU-04, AU-05, AU-06
// Đăng nhập, đăng ký, đăng xuất. Có Supabase thì dùng Supabase; chưa cấu hình thì dùng tài khoản thử lưu trên máy.
import type { Session as SbSession, SupabaseClient } from '@supabase/supabase-js';
import { ApiError, toApiError } from '@/lib/api-error';
import { getSupabase } from '@/lib/supabase';
import { normalizeEmail } from '@/utils/email';
import { hashString } from '@/domain/text';
import { LOCAL_SESSION_KEY, LOCAL_USERS_KEY } from './api-url';
import type { AuthApi, AuthSession, SignUpResult } from './type';

// ---------- Supabase ----------

const toSession = (s: SbSession | null): AuthSession | null =>
  s?.user ? { token: s.access_token, user: { id: s.user.id, email: s.user.email ?? '' } } : null;

function mapSupabaseError(e: { code?: string; message?: string; status?: number; name?: string }): ApiError {
  const code = e.code ?? '';
  const msg = (e.message ?? '').toLowerCase();
  if (code === 'invalid_credentials' || msg.includes('invalid login')) return new ApiError('invalid-credentials', e.message);
  if (code === 'user_already_exists' || code === 'email_exists' || msg.includes('already registered')) return new ApiError('email-taken', e.message);
  if (code === 'weak_password' || msg.includes('password should')) return new ApiError('weak-password', e.message);
  if (code === 'email_not_confirmed' || msg.includes('not confirmed')) return new ApiError('email-not-confirmed', e.message);
  if (code === 'over_request_rate_limit' || code === 'over_email_send_rate_limit' || e.status === 429) return new ApiError('rate-limit', e.message);
  if (e.name === 'AuthRetryableFetchError' || msg.includes('fetch')) return new ApiError('network', e.message);
  return new ApiError('unknown', e.message);
}

export function supabaseAuthApi(sb: SupabaseClient): AuthApi {
  return {
    mode: 'supabase',
    async getSession() {
      const { data } = await sb.auth.getSession();
      return toSession(data.session);
    },
    async signIn(email, password) {
      const { data, error } = await sb.auth.signInWithPassword({ email: normalizeEmail(email), password });
      if (error) throw mapSupabaseError(error);
      const s = toSession(data.session);
      if (!s) throw new ApiError('unknown');
      return s;
    },
    async signUp(email, password): Promise<SignUpResult> {
      const { data, error } = await sb.auth.signUp({ email: normalizeEmail(email), password });
      if (error) throw mapSupabaseError(error);
      // Email đã có tài khoản và máy chủ bật xác nhận email: Supabase trả về user không có identity.
      if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) throw new ApiError('email-taken');
      const session = toSession(data.session);
      return { session, needsConfirm: session === null };
    },
    async signOut() {
      const { error } = await sb.auth.signOut();
      if (error) throw mapSupabaseError(error);
    },
    onChange(fn) {
      const { data } = sb.auth.onAuthStateChange((_event, s) => fn(toSession(s)));
      return () => data.subscription.unsubscribe();
    },
  };
}

// ---------- Chế độ trên máy (AU-06) ----------

/** `salt` có từ Đợt 6: mật khẩu băm PBKDF2 có muối riêng; bản ghi cũ không có `salt` dùng SHA-256 và được nâng khi đăng nhập. */
type LocalUsers = Record<string, { id: string; hash: string; salt?: string }>;

const PBKDF2_ITERATIONS = 100_000;
const toHex = (buf: ArrayBuffer | Uint8Array) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Băm chậm có muối (Web Crypto). Không có Web Crypto (trang không chạy https) thì trả null. */
async function slowHash(password: string, salt: string): Promise<string | null> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (!subtle) return null;
    const enc = new TextEncoder();
    const key = await subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: PBKDF2_ITERATIONS }, key, 256);
    return toHex(bits);
  } catch {
    return null;
  }
}

const newSalt = () => {
  const c = globalThis.crypto;
  if (typeof c?.getRandomValues === 'function') return toHex(c.getRandomValues(new Uint8Array(16)));
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
};

interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

async function digest(text: string): Promise<string> {
  try {
    const subtle = globalThis.crypto?.subtle;
    if (subtle) {
      const buf = await subtle.digest('SHA-256', new TextEncoder().encode(text));
      return toHex(buf);
    }
  } catch {
    // Trình duyệt không có Web Crypto (trang không chạy https): dùng hàm băm đơn giản, chỉ để thử.
  }
  return `h${hashString(text).toString(16)}`;
}

const newId = () =>
  typeof globalThis.crypto?.randomUUID === 'function' ? globalThis.crypto.randomUUID() : `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function localAuthApi(store: KV | null = typeof window !== 'undefined' ? safeLocalStorage() : null): AuthApi {
  const read = <T,>(k: string): T | null => {
    try {
      const v = store?.getItem(k);
      return v ? (JSON.parse(v) as T) : null;
    } catch {
      return null;
    }
  };
  const write = (k: string, v: unknown) => {
    try {
      store?.setItem(k, JSON.stringify(v));
    } catch {
      throw new ApiError('unknown', 'storage');
    }
  };
  const saveSession = (s: AuthSession) => {
    write(LOCAL_SESSION_KEY, s);
    return s;
  };
  const hashOf = (email: string, password: string) => digest(`vitasr2:${email}:${password}`);
  const valid = (s: unknown): s is AuthSession => {
    const x = s as AuthSession | null;
    return !!x && typeof x.token === 'string' && !!x.user && typeof x.user.id === 'string' && typeof x.user.email === 'string';
  };

  return {
    mode: 'local',
    async getSession() {
      const s = read<AuthSession>(LOCAL_SESSION_KEY);
      return valid(s) ? s : null;
    },
    async signIn(email, password) {
      const e = normalizeEmail(email);
      const users = read<LocalUsers>(LOCAL_USERS_KEY) ?? {};
      const u = users[e];
      if (!u) throw new ApiError('invalid-credentials');
      if (u.salt) {
        if (u.hash !== (await slowHash(password, u.salt))) throw new ApiError('invalid-credentials');
      } else {
        if (u.hash !== (await hashOf(e, password))) throw new ApiError('invalid-credentials');
        // Bản ghi cũ: nâng lên băm có muối.
        const salt = newSalt();
        const hash = await slowHash(password, salt);
        if (hash) {
          users[e] = { id: u.id, hash, salt };
          write(LOCAL_USERS_KEY, users);
        }
      }
      return saveSession({ token: `local.${u.id}.${Date.now().toString(36)}`, user: { id: u.id, email: e } });
    },
    async signUp(email, password) {
      const e = normalizeEmail(email);
      const users = read<LocalUsers>(LOCAL_USERS_KEY) ?? {};
      if (users[e]) throw new ApiError('email-taken');
      const id = newId();
      const salt = newSalt();
      const slow = await slowHash(password, salt);
      users[e] = slow ? { id, hash: slow, salt } : { id, hash: await hashOf(e, password) };
      write(LOCAL_USERS_KEY, users);
      return { session: saveSession({ token: `local.${id}.${Date.now().toString(36)}`, user: { id, email: e } }), needsConfirm: false };
    },
    async signOut() {
      try {
        store?.removeItem(LOCAL_SESSION_KEY);
      } catch {
        // Bộ nhớ bị chặn: phiên chỉ còn trong lần mở này.
      }
    },
    onChange(fn) {
      if (typeof window === 'undefined') return () => undefined;
      const on = (ev: StorageEvent) => {
        if (ev.key !== null && ev.key !== LOCAL_SESSION_KEY) return;
        const s = read<AuthSession>(LOCAL_SESSION_KEY);
        fn(valid(s) ? s : null);
      };
      window.addEventListener('storage', on);
      return () => window.removeEventListener('storage', on);
    },
  };
}

function safeLocalStorage(): KV | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function createAuthApi(): AuthApi {
  const sb = getSupabase();
  return sb ? supabaseAuthApi(sb) : localAuthApi();
}

export { toApiError };
