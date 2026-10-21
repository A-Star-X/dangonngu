// @spec FND-16
// Giá trị cập nhật sau khi ngừng thay đổi `delay` mili giây. Mặc định 3000 ms theo rule chung của nhóm;
// ô tìm kiếm truyền 300 ms để kết quả theo kịp lúc gõ (T2-03, T3-02).
import { useEffect, useState } from 'react';

export const DEFAULT_DEBOUNCE_MS = 3000;
export const SEARCH_DEBOUNCE_MS = 300;

export function useDebouncedValue<T>(value: T, delay: number = DEFAULT_DEBOUNCE_MS): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setV(value), delay);
    return () => window.clearTimeout(t);
  }, [value, delay]);
  return v;
}
