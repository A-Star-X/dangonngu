// APP-04 bảng route và đường dẫn kiểu cũ; S3-07, S5-08 chặn rời màn (liên kết trong app và nút Back).
// Sheet xác nhận và màn đích khi Dừng được kiểm ở test của S3 và S5; ở đây chỉ kiểm cơ chế lịch sử.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BACK, canLeave, resetLeaveGuard, setLeaveGuard } from '@/lib/nav-guard';
import { href, legacyHashTarget, navOf, parseHref, query, routeName, ROUTE_PATH } from '@/lib/routes';

describe('APP-04 route', () => {
  // @ac APP-AC05
  it('liên kết kiểu cũ có dấu # chuyển sang đường dẫn mới', () => {
    expect(legacyHashTarget('#/thu-vien?xem=cau')).toBe('/thu-vien?xem=cau');
    expect(legacyHashTarget('#/unit?so=2')).toBe('/thu-vien/unit?so=2');
    expect(legacyHashTarget('#/tien-bo?khoang=30')).toBe('/tien-do?khoang=30');
    expect(legacyHashTarget('#/tien-bo')).toBe('/tien-do');
    expect(legacyHashTarget('#/hoc')).toBe('/hoc');
    expect(legacyHashTarget('#/phien-hoc?nguon=on-tap')).toBe('/phien-hoc?nguon=on-tap');
    expect(legacyHashTarget('#/chon-ngon-ngu')).toBe('/chon-ngon-ngu');
    expect(legacyHashTarget('#/kiem-tra?unit=3')).toBe('/kiem-tra?unit=3');
    // Route cũ không còn: về trang Học.
    expect(legacyHashTarget('#/khong-co')).toBe('/hoc');
    // Không phải route kiểu cũ: không đổi.
    expect(legacyHashTarget('')).toBeNull();
    expect(legacyHashTarget('#main')).toBeNull();
  });

  // @ac APP-AC05
  it('đường dẫn ra tên màn; không có trong bảng thì null', () => {
    for (const [name, path] of Object.entries(ROUTE_PATH)) expect(routeName(path)).toBe(name);
    expect(routeName('/thu-vien/')).toBe('thu-vien');
    expect(routeName('/thu-vien/unit')).toBe('unit');
    expect(routeName('/khong-co')).toBeNull();
    expect(routeName('/')).toBeNull();
    expect(navOf('unit')).toBe('thu-vien');
    expect(navOf('hoc')).toBe('hoc');
  });

  it('tạo và đọc địa chỉ có tham số, bỏ tham số rỗng', () => {
    expect(href('thu-vien', { xem: 'cau', q: '', trang: undefined, unit: 2 })).toBe('/thu-vien?xem=cau&unit=2');
    expect(href('unit', { so: 5 })).toBe('/thu-vien/unit?so=5');
    expect(query({ a: null, b: 0 })).toBe('?b=0');
    expect(parseHref('/thu-vien?xem=cau&q=book')).toEqual({ name: 'thu-vien', params: { xem: 'cau', q: 'book' }, raw: '/thu-vien?xem=cau&q=book' });
  });
});

const nextPop = () => new Promise<void>((resolve) => window.addEventListener('popstate', () => resolve(), { once: true }));
const marked = () => Boolean((window.history.state as Record<string, unknown> | null)?.__vitasrGuard);
const settle = (ms = 10) => new Promise((r) => setTimeout(r, ms));
/** Mở một mục mới ở cuối lịch sử (jsdom giữ lịch sử giữa các test; pushState cắt các mục phía trước). */
const openAt = (url: string) => window.history.pushState(null, '', url);

describe('S3-07, S5-08 chặn rời màn', () => {
  afterEach(() => resetLeaveGuard());

  it('liên kết trong app hỏi guard; guard cho phép thì đi, chặn thì ở lại', () => {
    expect(canLeave('/hoc')).toBe(true);
    openAt('/phien-hoc?nguon=lo-trinh&phien=s1');
    const guard = vi.fn((to: { name: string | null }) => to.name === 'phien-hoc' || to.name === 'cai-dat');
    setLeaveGuard(guard);
    expect(canLeave('/hoc')).toBe(false);
    expect(canLeave('/cai-dat?giong=1')).toBe(true);
    expect(canLeave('/phien-hoc?nguon=lo-trinh')).toBe(true);
    expect(guard.mock.calls.map((c) => c[0].name)).toEqual(['hoc', 'cai-dat', 'phien-hoc']);
  });

  // @ac S3-AC08
  it('Back của trình duyệt: màn không đổi, guard được hỏi, lần Back sau vẫn bị chặn', async () => {
    openAt('/phien-hoc?nguon=lo-trinh&phien=s1');
    const len = window.history.length;
    const guard = vi.fn(() => false);
    setLeaveGuard(guard);
    // Bật chặn thì thêm một mục trùng địa chỉ.
    expect(window.history.length).toBe(len + 1);
    expect(marked()).toBe(true);

    let pop = nextPop();
    window.history.back();
    await pop;
    expect(guard).toHaveBeenCalledTimes(1);
    expect(guard).toHaveBeenLastCalledWith(BACK);
    expect(window.location.pathname + window.location.search).toBe('/phien-hoc?nguon=lo-trinh&phien=s1');
    // Đã thêm lại mục trùng.
    expect(marked()).toBe(true);

    pop = nextPop();
    window.history.back();
    await pop;
    expect(guard).toHaveBeenCalledTimes(2);
    expect(marked()).toBe(true);
  });

  // @ac S3-AC08
  it('guard cho rời khi Back thì không thêm lại mục trùng; gỡ chặn khi đứng ở mục trùng thì bỏ mục trùng', async () => {
    openAt('/kiem-tra?unit=1');
    setLeaveGuard(() => true);
    const pop = nextPop();
    window.history.back();
    await pop;
    expect(marked()).toBe(false);
    resetLeaveGuard();

    // Phiên xong (gỡ chặn) khi đang đứng ở mục trùng: lùi bỏ mục trùng, một lần Back là rời màn.
    setLeaveGuard(() => false);
    expect(marked()).toBe(true);
    const popRelease = nextPop();
    setLeaveGuard(null);
    await popRelease;
    expect(marked()).toBe(false);
    expect(canLeave('/hoc')).toBe(true);
  });

  it('gỡ rồi gắn lại ngay (React chạy lại effect) không thêm mục trùng thứ hai', async () => {
    openAt('/phien-hoc?phien=s2');
    const len0 = window.history.length;
    setLeaveGuard(() => false);
    setLeaveGuard(null);
    setLeaveGuard(() => false);
    await settle(20);
    expect(window.history.length).toBe(len0 + 1);
    expect(marked()).toBe(true);
  });
});
