// AU-06 tài khoản thử trên máy, AU-07 nhiều người trên một máy.
import { describe, expect, it } from 'vitest';
import { OWNER_KEY, claimDevice, stashKey } from '@/domain';
import { ApiError } from '@/lib/api-error';
import { localAuthApi } from '@/services/auth-services/api';
import { LOCAL_SESSION_KEY, LOCAL_USERS_KEY } from '@/services/auth-services/api-url';
import { memoryBackend } from './helpers';

const SETTINGS = 'vitasr2.settings';
const PROG = 'vitasr2.progress.fluency.en';

describe('AU-07 dữ liệu học trên máy thuộc về một tài khoản', () => {
  // @ac AU-AC07
  it('máy có tiến độ từ trước khi có đăng nhập: người đăng nhập đầu tiên nhận dữ liệu đó', () => {
    const { backend } = memoryBackend({ [SETTINGS]: '{"lang":"en"}', [PROG]: '{"schema":1,"a":1}' });
    expect(claimDevice(backend, 'u1')).toBe('adopted');
    expect(backend.getItem(OWNER_KEY)).toBe('u1');
    expect(backend.getItem(PROG)).toBe('{"schema":1,"a":1}');
    // Đăng nhập lại cùng người: không đổi gì.
    expect(claimDevice(backend, 'u1')).toBe('same');
    expect(backend.getItem(SETTINGS)).toBe('{"lang":"en"}');
  });

  // @ac AU-AC07
  it('người thứ hai không thấy tiến độ của người đầu; người đầu đăng nhập lại thì thấy lại', () => {
    const { backend, mem } = memoryBackend({ [SETTINGS]: '{"lang":"en"}', [PROG]: '{"u":1}', 'vitasr2.theme': 'dark' });
    claimDevice(backend, 'u1');
    expect(claimDevice(backend, 'u2')).toBe('switched');
    expect(backend.getItem(PROG)).toBeNull();
    expect(backend.getItem(SETTINGS)).toBeNull();
    expect(backend.getItem(OWNER_KEY)).toBe('u2');
    expect(backend.getItem(stashKey('u1'))).not.toBeNull();
    // Giao diện sáng tối không thuộc tài khoản.
    expect(backend.getItem('vitasr2.theme')).toBe('dark');

    // Người thứ hai học một chút.
    backend.setItem(PROG, '{"u":2}');
    expect(claimDevice(backend, 'u1')).toBe('switched');
    expect(backend.getItem(PROG)).toBe('{"u":1}');
    expect(backend.getItem(SETTINGS)).toBe('{"lang":"en"}');
    expect(backend.getItem(stashKey('u1'))).toBeNull();
    expect(JSON.parse(backend.getItem(stashKey('u2'))!)).toEqual({ [PROG]: '{"u":2}' });

    expect(claimDevice(backend, 'u2')).toBe('switched');
    expect(backend.getItem(PROG)).toBe('{"u":2}');
    expect([...mem.keys()].filter((k) => k.startsWith('vitasr2.progress.'))).toEqual([PROG]);
  });

  // @ac AU-AC07
  it('không có bộ nhớ hoặc bộ nhớ ném lỗi: không làm hỏng app', () => {
    expect(claimDevice(null, 'u1')).toBe('same');
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => undefined,
      removeItem: () => undefined,
      key: () => null,
      length: 0,
    } as unknown as Storage;
    expect(claimDevice(broken, 'u1')).toBe('same');
  });
});

describe('AU-06 tài khoản thử trên máy', () => {
  // @ac AU-AC06
  it('đăng ký, đăng xuất, đăng nhập lại; phiên giữ trên máy', async () => {
    const { backend } = memoryBackend();
    const api = localAuthApi(backend);
    expect(api.mode).toBe('local');
    expect(await api.getSession()).toBeNull();
    const r = await api.signUp('  Hoc@Vi.Du ', 'matkhau123');
    expect(r.needsConfirm).toBe(false);
    expect(r.session?.user.email).toBe('hoc@vi.du');
    // Mở lại app (đối tượng mới, cùng bộ nhớ): vẫn đăng nhập.
    const again = localAuthApi(backend);
    expect((await again.getSession())?.user.id).toBe(r.session!.user.id);
    await again.signOut();
    expect(await again.getSession()).toBeNull();
    expect(backend.getItem(LOCAL_SESSION_KEY)).toBeNull();
    const s = await again.signIn('HOC@vi.du', 'matkhau123');
    expect(s.user.id).toBe(r.session!.user.id);
    expect(typeof s.token).toBe('string');
    expect(JSON.parse(backend.getItem(LOCAL_SESSION_KEY)!).user.email).toBe('hoc@vi.du');
  });

  // @ac AU-AC06
  it('mật khẩu sai, email chưa có, email đã có tài khoản báo đúng mã lỗi', async () => {
    const { backend } = memoryBackend();
    const api = localAuthApi(backend);
    await api.signUp('a@b.cd', 'matkhau123');
    await expect(api.signIn('a@b.cd', 'sai-mat-khau')).rejects.toMatchObject({ code: 'invalid-credentials' });
    await expect(api.signIn('khong@co.vn', 'matkhau123')).rejects.toBeInstanceOf(ApiError);
    await expect(api.signIn('khong@co.vn', 'matkhau123')).rejects.toMatchObject({ code: 'invalid-credentials' });
    await expect(api.signUp('A@B.CD', 'khac12345')).rejects.toMatchObject({ code: 'email-taken' });
  });

  // @ac AU-AC06
  it('trên máy không lưu mật khẩu dạng chữ thường', async () => {
    const { backend, mem } = memoryBackend();
    await localAuthApi(backend).signUp('a@b.cd', 'matkhau-bi-mat-123');
    const all = [...mem.values()].join('\n');
    expect(all).not.toContain('matkhau-bi-mat-123');
    const users = JSON.parse(backend.getItem(LOCAL_USERS_KEY)!) as Record<string, { id: string; hash: string; salt?: string }>;
    expect(users['a@b.cd'].hash).toMatch(/^[0-9a-f]{64}$/);
    // Băm có muối riêng (PBKDF2): hai tài khoản cùng mật khẩu có mã băm khác nhau.
    expect(users['a@b.cd'].salt).toMatch(/^[0-9a-f]{32}$/);
    await localAuthApi(backend).signUp('x@y.zz', 'matkhau-bi-mat-123');
    const again = JSON.parse(backend.getItem(LOCAL_USERS_KEY)!) as Record<string, { hash: string }>;
    expect(again['x@y.zz'].hash).not.toBe(again['a@b.cd'].hash);
  });

  // @ac AU-AC06
  it('tài khoản thử tạo trước Đợt 6 (băm không muối) vẫn đăng nhập được và được nâng lên băm có muối', async () => {
    const { backend } = memoryBackend();
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('vitasr2:cu@vi.du:matkhau123'));
    const legacy = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
    backend.setItem(LOCAL_USERS_KEY, JSON.stringify({ 'cu@vi.du': { id: 'u-cu', hash: legacy } }));
    const api = localAuthApi(backend);
    await expect(api.signIn('cu@vi.du', 'sai-mat-khau')).rejects.toMatchObject({ code: 'invalid-credentials' });
    const s = await api.signIn('cu@vi.du', 'matkhau123');
    expect(s.user.id).toBe('u-cu');
    const users = JSON.parse(backend.getItem(LOCAL_USERS_KEY)!) as Record<string, { hash: string; salt?: string }>;
    expect(users['cu@vi.du'].salt).toBeTruthy();
    expect(users['cu@vi.du'].hash).not.toBe(legacy);
    await expect(api.signIn('cu@vi.du', 'matkhau123')).resolves.toMatchObject({ user: { id: 'u-cu' } });
  });
});
