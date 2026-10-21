// FND-16 giá trị chờ ngừng thay đổi; LP-03 số liệu Landing lấy từ public/data.
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_DEBOUNCE_MS, SEARCH_DEBOUNCE_MS, useDebouncedValue } from '@/hooks/use-debounced-value';
import { contentStats } from '@/views/landing/utils/content-stats';

describe('FND-16 useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // @ac FND-AC20
  it('không truyền thời gian thì chờ 3000 ms sau lần đổi cuối', () => {
    expect(DEFAULT_DEBOUNCE_MS).toBe(3000);
    const { result, rerender } = renderHook(({ v }: { v: string }) => useDebouncedValue(v), { initialProps: { v: 'a' } });
    expect(result.current).toBe('a');
    rerender({ v: 'ab' });
    act(() => vi.advanceTimersByTime(2000));
    rerender({ v: 'abc' });
    // Lần đổi mới đặt lại đồng hồ: 2999 ms sau lần cuối vẫn là giá trị cũ.
    act(() => vi.advanceTimersByTime(2999));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('abc');
  });

  // @ac FND-AC20
  it('ô tìm kiếm truyền 300 ms thì dùng 300 ms', () => {
    expect(SEARCH_DEBOUNCE_MS).toBe(300);
    const { result, rerender } = renderHook(({ v }: { v: string }) => useDebouncedValue(v, SEARCH_DEBOUNCE_MS), { initialProps: { v: '' } });
    rerender({ v: 'book' });
    act(() => vi.advanceTimersByTime(299));
    expect(result.current).toBe('');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('book');
  });

  it('gỡ component trước khi hết giờ thì không cập nhật nữa', () => {
    const { result, rerender, unmount } = renderHook(({ v }: { v: number }) => useDebouncedValue(v, 500), { initialProps: { v: 1 } });
    rerender({ v: 2 });
    unmount();
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});

describe('LP-03 số liệu bộ câu', () => {
  // @ac LP-AC02
  it('15 ngôn ngữ; Fluency 4.096 câu, 512 unit mỗi ngôn ngữ; Global English 4.608 câu, 576 unit', () => {
    const s = contentStats();
    expect(s.languages).toBe(15);
    expect(s.list).toHaveLength(15);
    expect(s.list.every((l) => l.id && l.name)).toBe(true);
    expect(s.packs).toEqual([
      { id: 'fluency', languages: 15, items: 4096, units: 512 },
      // Global English chỉ có tiếng Anh.
      { id: 'global', languages: 1, items: 4608, units: 576 },
    ]);
  });

  // @ac LP-AC02
  it('số câu và số unit giống nhau ở mọi ngôn ngữ của bộ (Landing ghi "mỗi ngôn ngữ")', () => {
    const dir = path.join(process.cwd(), 'public', 'data');
    const read = (...p: string[]) => JSON.parse(readFileSync(path.join(dir, ...p), 'utf8'));
    for (const pack of contentStats().packs) {
      const manifest = read(pack.id, 'manifest.json') as { languages: { id: string; file: string; units: string }[] };
      for (const l of manifest.languages) {
        const items = read(pack.id, l.file) as { itemCount?: number; items: unknown[] };
        const units = read(pack.id, l.units) as { units: unknown[] };
        expect({ lang: l.id, items: items.items.length, units: units.units.length }).toEqual({ lang: l.id, items: pack.items, units: pack.units });
        if (items.itemCount !== undefined) expect(items.itemCount).toBe(items.items.length);
      }
    }
  });
});
