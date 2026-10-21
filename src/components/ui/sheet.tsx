'use client';
// @spec C6-01, C6-02, C6-03, C6-04, APP-11
// Một nơi duy nhất hiển thị sheet: mở sheet mới thì sheet đang mở đóng trước (APP-11).
// Dưới md: trượt từ dưới lên; từ md: hộp thoại giữa màn.
import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface SheetSpec {
  title: string;
  /** confirm: không đóng khi bấm lớp nền (C6-02). */
  kind?: 'normal' | 'confirm';
  body: (close: () => void) => ReactNode;
  /** Hành động chính đứng yên ở đáy (C6-04). */
  footer?: (close: () => void) => ReactNode;
  onClose?: () => void;
}

interface SheetApi {
  open: (spec: SheetSpec) => void;
  close: () => void;
  isOpen: boolean;
}

const Ctx = createContext<SheetApi | null>(null);

export function useSheet(): SheetApi {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSheet ngoài SheetProvider');
  return v;
}

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export function SheetProvider({ children }: { children: ReactNode }) {
  const [spec, setSpec] = useState<(SheetSpec & { n: number }) | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const specRef = useRef(spec);
  useEffect(() => {
    specRef.current = spec;
  }, [spec]);
  const counter = useRef(0);

  const close = useCallback(() => {
    const cur = specRef.current;
    if (!cur) return;
    specRef.current = null;
    setSpec(null);
    cur.onClose?.();
    const el = opener.current;
    opener.current = null;
    if (el && document.contains(el)) window.setTimeout(() => el.focus(), 0);
  }, []);

  const open = useCallback((s: SheetSpec) => {
    if (specRef.current) {
      // Đóng sheet đang mở trước, giữ phần tử đã mở ban đầu.
      specRef.current.onClose?.();
    } else {
      opener.current = document.activeElement as HTMLElement | null;
    }
    counter.current += 1;
    const next = { ...s, n: counter.current };
    specRef.current = next;
    setSpec(next);
  }, []);

  const api = useMemo(() => ({ open, close, isOpen: spec !== null }), [open, close, spec]);

  return (
    <Ctx.Provider value={api}>
      {children}
      {spec && <SheetView key={spec.n} spec={spec} close={close} />}
    </Ctx.Provider>
  );
}

function SheetView({ spec, close }: { spec: SheetSpec; close: () => void }) {
  const t = useTranslations('common');
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ y: number; dy: number } | null>(null);
  const [dy, setDy] = useState(0);

  useEffect(() => {
    const first = panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      // Danh sách chọn đang mở trong sheet tự xử lý Esc của nó.
      if ((e.target as HTMLElement | null)?.closest?.('[data-dropdown-open]')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        close();
        return;
      }
      if (e.key === 'Tab' && panel.current) {
        const els = [...panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((x) => x.offsetParent !== null || x === document.activeElement);
        if (els.length === 0) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && (document.activeElement === first || !panel.current.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !panel.current.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    // capture để Esc của sheet chạy trước phím tắt của trang.
    window.addEventListener('keydown', on, true);
    return () => window.removeEventListener('keydown', on, true);
  }, [close]);

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center md:p-6">
      <div
        className="absolute inset-0 bg-scrim"
        data-testid="sheet-scrim"
        onClick={() => {
          if (spec.kind !== 'confirm') close();
        }}
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={dy ? { transform: `translateY(${dy}px)` } : undefined}
        className={cn(
          'relative flex max-h-[90%] w-full flex-col rounded-t-card bg-card text-card-foreground shadow-sheet',
          'pb-[env(safe-area-inset-bottom)] motion-safe:animate-[sheet-up_var(--d-sheet)_ease-out]',
          'md:max-w-[560px] md:rounded-card md:pb-0 md:shadow-dialog md:motion-safe:animate-none',
        )}
      >
        <div
          className="mx-auto mt-2 h-1 w-9 flex-none cursor-grab touch-none rounded-full bg-border md:hidden"
          aria-hidden="true"
          onPointerDown={(e) => {
            drag.current = { y: e.clientY, dy: 0 };
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (!drag.current) return;
            drag.current.dy = Math.max(0, e.clientY - drag.current.y);
            setDy(drag.current.dy);
          }}
          onPointerUp={() => {
            const d = drag.current?.dy ?? 0;
            drag.current = null;
            setDy(0);
            if (d > 80) close();
          }}
        />
        <header className="flex flex-none items-center justify-between gap-3 pt-3 pr-3 pb-2 pl-6 md:pt-4">
          <h2 id={titleId} className="text-xl font-semibold">
            {spec.title}
          </h2>
          <button type="button" className="inline-flex size-11 flex-none items-center justify-center rounded-full hover:bg-muted" aria-label={t('close')} onClick={close}>
            <X className="size-6" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pt-2 pb-6">{spec.body(close)}</div>
        {spec.footer && <footer className="flex flex-none flex-wrap justify-end gap-3 border-t border-border px-6 py-4">{spec.footer(close)}</footer>}
      </div>
    </div>
  );
}
