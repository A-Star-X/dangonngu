// @spec AU-01, AU-02, AU-05, AU-06
export interface AuthUser {
  id: string;
  email: string;
}

/** Phiên đăng nhập giữ trên localStorage: token và user. */
export interface AuthSession {
  token: string;
  user: AuthUser;
}

/** supabase: tài khoản trên máy chủ, đồng bộ tiến độ giữa các máy. local: chế độ thử, tài khoản chỉ có trên máy này. */
export type AuthMode = 'supabase' | 'local';

export interface SignUpResult {
  session: AuthSession | null;
  /** Máy chủ yêu cầu xác nhận email trước khi đăng nhập. */
  needsConfirm: boolean;
}

export interface AuthApi {
  mode: AuthMode;
  getSession(): Promise<AuthSession | null>;
  signIn(email: string, password: string): Promise<AuthSession>;
  signUp(email: string, password: string): Promise<SignUpResult>;
  signOut(): Promise<void>;
  /** Phiên đổi ở tab khác hoặc do máy chủ (hết hạn). */
  onChange(fn: (s: AuthSession | null) => void): () => void;
}
