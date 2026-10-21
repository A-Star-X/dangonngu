// Thay router của Next và next-intl trong test: địa chỉ nằm ở window.location (jsdom), đổi bằng history.
// Mọi lần pushState, replaceState, popstate báo cho các hook đọc lại, giống Next đồng bộ router với history.
import { forwardRef, useSyncExternalStore, type AnchorHTMLAttributes, type ReactNode } from 'react';

const EVENT = 'vitasr:location';
const listeners = new Set<() => void>();
let patched = false;

export function patchHistory() {
  if (patched) return;
  patched = true;
  const push = window.history.pushState.bind(window.history);
  const replace = window.history.replaceState.bind(window.history);
  window.history.pushState = (data: unknown, unused: string, url?: string | URL | null) => {
    push(data, unused, url);
    window.dispatchEvent(new Event(EVENT));
  };
  window.history.replaceState = (data: unknown, unused: string, url?: string | URL | null) => {
    replace(data, unused, url);
    window.dispatchEvent(new Event(EVENT));
  };
  const notify = () => listeners.forEach((l) => l());
  window.addEventListener(EVENT, notify);
  window.addEventListener('popstate', notify);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function usePathnameMock(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname, () => '/');
}

// Giữ cùng một đối tượng URLSearchParams khi query không đổi (như Next), để effect phụ thuộc vào nó không chạy lại.
const searchCache = new Map<string, URLSearchParams>();
function paramsFor(raw: string) {
  let sp = searchCache.get(raw);
  if (!sp) {
    sp = new URLSearchParams(raw);
    searchCache.set(raw, sp);
  }
  return sp;
}
export function useSearchParamsMock(): URLSearchParams {
  const raw = useSyncExternalStore(subscribe, () => window.location.search, () => '');
  return paramsFor(raw);
}

/** Các lần chuyển trang bằng router (để test kiểm). */
export const routerCalls: { kind: 'push' | 'replace'; href: string; locale?: string }[] = [];

const hrefOf = (h: string | { pathname: string }) => (typeof h === 'string' ? h : h.pathname);

export const routerMock = {
  push: (href: string, opts?: { locale?: string }) => {
    routerCalls.push({ kind: 'push', href, locale: opts?.locale });
    window.history.pushState(null, '', href);
  },
  replace: (href: string, opts?: { locale?: string }) => {
    routerCalls.push({ kind: 'replace', href, locale: opts?.locale });
    window.history.replaceState(null, '', href);
  },
  back: () => window.history.back(),
  forward: () => window.history.forward(),
  refresh: () => undefined,
  prefetch: () => undefined,
};

export const LinkMock = forwardRef<HTMLAnchorElement, AnchorHTMLAttributes<HTMLAnchorElement> & { href: string | { pathname: string }; replace?: boolean; children?: ReactNode; prefetch?: boolean; locale?: string }>(
  function LinkMock({ href, replace, onClick, children, prefetch: _p, locale: _l, ...rest }, ref) {
    void _p;
    void _l;
    const h = hrefOf(href);
    return (
      <a
        ref={ref}
        href={h}
        onClick={(e) => {
          onClick?.(e);
          if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          if (replace) routerMock.replace(h);
          else routerMock.push(h);
        }}
        {...rest}
      >
        {children}
      </a>
    );
  },
);
