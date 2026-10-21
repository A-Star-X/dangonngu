// @spec APP-10
// Đăng ký service worker để mở lại được khi ngoại tuyến, và báo khi có bản mới.
// Service worker mới tự kích hoạt nhưng trang đang mở không tự tải lại: chỉ tải lại khi người dùng bấm "Cập nhật".
let available = false;
const listeners = new Set<() => void>();

/** Báo có bản mới (gọi từ service worker hoặc từ test). */
export function signalUpdate() {
  available = true;
  listeners.forEach((l) => l());
}

export function resetUpdateSignal() {
  available = false;
}

export const updateAvailable = () => available;

export function onUpdate(l: () => void): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Tải lại app. Bọc trong đối tượng để test thay được. */
export const appReload = {
  run: () => window.location.reload(),
};

type Container = Pick<ServiceWorkerContainer, 'register'> & { controller: unknown };

/**
 * Đăng ký service worker. `onFirstControl` chạy khi service worker vừa nhận quản lý trang lần đầu
 * (lần mở đầu tiên có mạng), để nạp lại dữ liệu đã tải vào bộ nhớ ngoại tuyến.
 */
export function registerServiceWorker(container: Container | undefined, opts: { url?: string; onFirstControl?: () => void } = {}) {
  if (!container) return;
  const hadController = Boolean(container.controller);
  container
    .register(opts.url ?? '/sw.js', { scope: '/' })
    .then((reg) => {
      reg.addEventListener('updatefound', () => {
        const w = reg.installing;
        if (!w) return;
        w.addEventListener('statechange', () => {
          if (w.state !== 'activated') return;
          if (hadController) signalUpdate();
          else opts.onFirstControl?.();
        });
      });
    })
    .catch(() => {
      // Không đăng ký được (trình duyệt chặn...): app vẫn chạy bình thường khi có mạng.
    });
}
