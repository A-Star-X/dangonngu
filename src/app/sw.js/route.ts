// @spec APP-10
// Service worker, dựng tĩnh lúc build kèm mã bản build (APP_BUILD_ID trong next.config.ts).
// - Trang (HTML): lấy mạng trước, mất mạng thì dùng bản đã lưu; khung khu học lưu sẵn khi cài.
// - File của Next (/_next/static, có mã băm trong tên): dùng bản đã lưu, không có thì tải và lưu.
// - Dữ liệu câu (/data/*.json): lấy mạng trước, mất mạng thì dùng bản đã lưu.
// - Font Noto, ảnh Landing (tên file không đổi giữa các bản): dùng bản đã lưu ngay, đồng thời tải bản mới để lần sau dùng.
// Bản mới tự kích hoạt, nhưng trang đang mở chỉ tải lại khi người dùng bấm "Cập nhật" (src/hooks/use-update-notice.ts).
// Bộ nhớ đệm theo bản: giữ bản hiện tại và bản ngay trước (trang cũ còn mở vẫn tải được file của nó khi mất mạng), xóa
// các bản cũ hơn. Dữ liệu câu lưu ở bộ nhớ riêng không theo bản, để đổi bản không mất dữ liệu đã tải để học ngoại tuyến.
import { ROUTE_PATH, PUBLIC_PATH } from '@/lib/routes';

export const dynamic = 'force-static';

const SHELL_PAGES = [...Object.values(ROUTE_PATH), PUBLIC_PATH.login];

function source(version: string) {
  return `/* VITASR service worker ${version} */
const VERSION = ${JSON.stringify(version)};
const SHELL = 'vitasr2-shell-' + VERSION;
const RUNTIME = 'vitasr2-runtime-' + VERSION;
const DATA = 'vitasr2-data';
const META = 'vitasr2-meta';
const PAGES = ${JSON.stringify(SHELL_PAGES)};

const putIn = (name, key, res) => {
  if (res && res.ok && res.type === 'basic') {
    // Sao ngay lúc nhận, trước khi trả cho trang (sao sau khi trang đã đọc thì lỗi "body already used").
    const copy = res.clone();
    caches.open(name).then((c) => c.put(key, copy));
  }
  return res;
};
const putRuntime = (req, res) => putIn(RUNTIME, req, res);

const readText = async (cache, key) => {
  const r = await cache.match(key);
  return r ? r.text() : '';
};

// Giữ bộ nhớ của bản hiện tại và bản ngay trước, xóa phần còn lại.
async function cleanup() {
  const meta = await caches.open(META);
  const current = await readText(meta, '/__version');
  let previous = await readText(meta, '/__previous');
  if (current && current !== VERSION) {
    previous = current;
    await meta.put('/__previous', new Response(previous));
  }
  await meta.put('/__version', new Response(VERSION));
  const keep = new Set([SHELL, RUNTIME, DATA, META]);
  if (previous) {
    keep.add('vitasr2-shell-' + previous);
    keep.add('vitasr2-runtime-' + previous);
  }
  const keys = await caches.keys();
  await Promise.all(keys.filter((k) => k.startsWith('vitasr2-') && !keep.has(k)).map((k) => caches.delete(k)));
}

// Lưu sẵn các trang của khu học và file JS, CSS mà các trang đó dùng.
async function precache() {
  const cache = await caches.open(SHELL);
  const assets = new Set();
  await Promise.all(
    PAGES.map(async (p) => {
      try {
        const res = await fetch(new Request(p, { cache: 'reload', credentials: 'same-origin' }));
        if (!res.ok) return;
        const html = await res.clone().text();
        await cache.put(p, res);
        for (const m of html.matchAll(/(?:src|href)="(\\/_next\\/static\\/[^"]+)"/g)) assets.add(m[1]);
      } catch (e) {}
    }),
  );
  await Promise.all([...assets].map((a) => cache.add(new Request(a, { cache: 'reload' })).catch(() => undefined)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    cleanup().then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  // Gói dữ liệu trang của Next (?_rsc=): mạng trước, mất mạng để Next tự chuyển sang tải cả trang.
  if (url.searchParams.has('_rsc')) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => putIn(RUNTIME, url.pathname, res))
        .catch(async () => {
          const hit = (await caches.match(url.pathname, { ignoreSearch: true, ignoreVary: true })) || (await caches.match(PAGES.includes(url.pathname) ? url.pathname : '/hoc', { ignoreVary: true }));
          return hit || Response.error();
        }),
    );
    return;
  }

  if (url.pathname.startsWith('/data/') && url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(req)
        .then((res) => putIn(DATA, req, res))
        .catch(() => caches.match(req, { ignoreVary: true }).then((r) => r || Response.error())),
    );
    return;
  }

  // ignoreVary: script module gửi kèm Origin còn bản lưu sẵn thì không; máy chủ có thể trả Vary: Origin.
  if (url.pathname.startsWith('/_next/static/')) {
    // Tên file có mã băm: đã lưu thì dùng luôn.
    event.respondWith(caches.match(req, { ignoreVary: true }).then((r) => r || fetch(req).then((res) => putRuntime(req, res))));
    return;
  }
  if (url.pathname.startsWith('/fonts/') || url.pathname.startsWith('/landing/')) {
    // Tên file không đổi giữa các bản: trả bản đã lưu ngay, tải bản mới ở nền cho lần sau.
    const fresh = fetch(req).then((res) => putRuntime(req, res));
    event.waitUntil(fresh.catch(() => undefined));
    event.respondWith(caches.match(req, { ignoreVary: true }).then((r) => r || fresh));
  }
});
`;
}

export function GET() {
  return new Response(source(process.env.APP_BUILD_ID ?? 'dev'), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': '/',
    },
  });
}
