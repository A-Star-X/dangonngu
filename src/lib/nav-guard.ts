// @spec S3-07, S5-08
// Chặn rời màn giữa phiên học hoặc bài kiểm tra. Liên kết và nút trong app hỏi `canLeave` trước khi chuyển màn.
// Nút Back của trình duyệt: khi bật chặn, thêm một mục lịch sử trùng địa chỉ; Back chỉ lùi về mục gốc cùng địa chỉ
// (màn không đổi), app bắt sự kiện popstate để hỏi guard (guard mở sheet xác nhận) rồi thêm lại mục trùng.
import { parseHref, type Route } from './routes';

/** Trả về true nếu cho rời sang `to`. Khi trả false, guard tự mở sheet xác nhận. */
export type LeaveGuard = (to: Route) => boolean;

/** Đích của nút Back: trình duyệt không cho biết trước, coi như rời màn. */
export const BACK: Route = { name: null, params: {}, raw: '' };

const MARK = '__vitasrGuard';
let guard: LeaveGuard | null = null;
let armed = false;
let guardedUrl = '';
let releaseTimer: number | undefined;

const here = () => `${window.location.pathname}${window.location.search}`;
const onMark = () => Boolean((window.history.state as Record<string, unknown> | null)?.[MARK]);

/** Mục trùng giữ nguyên trạng thái nội bộ của Next (Next bỏ qua, không đổi màn). */
function pushMark() {
  window.history.pushState({ ...(window.history.state ?? {}), [MARK]: true }, '', guardedUrl);
}

function onPop() {
  if (!guard) return;
  // Lùi từ mục trùng về mục gốc cùng địa chỉ: màn không đổi; hỏi guard và giữ chặn cho lần Back sau.
  if (here() === guardedUrl && !onMark()) {
    if (guard(BACK)) return;
    pushMark();
  }
  // Địa chỉ khác (lùi liền nhiều bước): màn đã đổi, guard sẽ được gỡ khi màn cũ đóng.
}

export function setLeaveGuard(g: LeaveGuard | null) {
  guard = g;
  if (typeof window === 'undefined') return;
  if (g) {
    window.clearTimeout(releaseTimer);
    if (!armed) {
      armed = true;
      guardedUrl = here();
      pushMark();
      window.addEventListener('popstate', onPop);
    }
    return;
  }
  if (!armed) return;
  // Gỡ chậm một nhịp: React (chế độ phát triển) gỡ rồi gắn lại effect ngay, không cần làm gì.
  window.clearTimeout(releaseTimer);
  releaseTimer = window.setTimeout(() => {
    if (guard) return;
    armed = false;
    window.removeEventListener('popstate', onPop);
    // Vẫn đứng ở mục trùng (phiên vừa xong): bỏ mục trùng để một lần Back là rời màn.
    if (onMark() && here() === guardedUrl) window.history.back();
  }, 0);
}

/**
 * Rời màn đang chặn sau khi người dùng đã xác nhận (Dừng, Tạm dừng). Đang chặn thì bỏ mục trùng rồi để `go(true)` thay
 * mục của màn bằng đích, để Back sau đó không quay lại phiên vừa rời và không bị kẹt giữa phiên với sheet xác nhận.
 * Không chặn (chưa bắt đầu, đã xong) thì `go(false)`: chuyển màn bình thường.
 */
export function leaveGuarded(go: (replace: boolean) => void) {
  guard = null;
  if (typeof window === 'undefined' || !armed) {
    go(false);
    return;
  }
  armed = false;
  window.clearTimeout(releaseTimer);
  window.removeEventListener('popstate', onPop);
  if (onMark() && here() === guardedUrl) {
    const done = () => {
      window.removeEventListener('popstate', done);
      go(true);
    };
    window.addEventListener('popstate', done);
    window.history.back();
    return;
  }
  go(true);
}

/** Hỏi guard trước khi chuyển màn bằng liên kết hay nút trong app. */
export function canLeave(to: string): boolean {
  if (!guard) return true;
  return guard(parseHref(to));
}

/** Chỉ dùng trong test. */
export function resetLeaveGuard() {
  guard = null;
  armed = false;
  guardedUrl = '';
  if (typeof window !== 'undefined') {
    window.clearTimeout(releaseTimer);
    window.removeEventListener('popstate', onPop);
  }
}
