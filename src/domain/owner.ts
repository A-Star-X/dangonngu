// @spec AU-07, DATA-14
// Dữ liệu học trên máy thuộc về một tài khoản. Người khác đăng nhập trên cùng máy thì cất dữ liệu của người trước
// sang một chỗ riêng và lấy lại dữ liệu đã cất của người mới (nếu có), để hai người không thấy tiến độ của nhau.
export const OWNER_KEY = 'vitasr2.owner';
export const stashKey = (userId: string) => `vitasr2.stash.${userId}`;

/** Khóa dữ liệu học: cài đặt và tiến độ từng cặp (bộ, ngôn ngữ). Giao diện sáng tối và phiên đăng nhập không tính. */
export const isLearningKey = (k: string) => k === 'vitasr2.settings' || k.startsWith('vitasr2.progress.');

type KV = Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'key' | 'length'>;

function learningKeys(store: KV): string[] {
  const keys: string[] = [];
  for (let i = 0; i < store.length; i++) {
    const k = store.key(i);
    if (k && isLearningKey(k)) keys.push(k);
  }
  return keys;
}

export type OwnerChange = 'same' | 'adopted' | 'switched';

/**
 * Gọi khi biết người đang đăng nhập, trước khi đọc dữ liệu học.
 * - Chưa có chủ (máy dùng app trước khi có đăng nhập): dữ liệu đang có thuộc về người này.
 * - Chủ khác: cất dữ liệu của chủ cũ, lấy lại phần đã cất của người này.
 */
export function claimDevice(store: KV | null, userId: string): OwnerChange {
  if (!store) return 'same';
  try {
    const owner = store.getItem(OWNER_KEY);
    if (owner === userId) return 'same';
    if (owner === null) {
      store.setItem(OWNER_KEY, userId);
      return 'adopted';
    }
    const keys = learningKeys(store);
    const stash: Record<string, string> = {};
    for (const k of keys) stash[k] = store.getItem(k) ?? '';
    store.setItem(stashKey(owner), JSON.stringify(stash));
    for (const k of keys) store.removeItem(k);
    const mine = store.getItem(stashKey(userId));
    if (mine) {
      try {
        const saved = JSON.parse(mine) as Record<string, string>;
        for (const [k, v] of Object.entries(saved)) if (isLearningKey(k) && typeof v === 'string') store.setItem(k, v);
      } catch {
        // Phần cất bị hỏng: bỏ qua, dữ liệu sẽ lấy lại từ tài khoản nếu có đồng bộ.
      }
      store.removeItem(stashKey(userId));
    }
    store.setItem(OWNER_KEY, userId);
    return 'switched';
  } catch {
    return 'same';
  }
}
