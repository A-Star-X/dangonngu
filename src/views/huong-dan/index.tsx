'use client';
// @spec S9-01, S9-02, S9-03, S9-04, S9-05, APP-11
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { useSheet } from '@/components/ui/sheet';
import { useNav } from '@/hooks/use-nav';
import { useLearning } from '@/providers/learning-provider';

const STEPS = ['card', 'start', 'nav'] as const;
/** Chiều cao header của khung khu học (C5-05). */
const HEADER_PX = 56;

type Rect = { top: number; left: number; width: number; height: number };

/** Phần tử đang hiện của bước: thanh bên (từ md) hoặc nút menu trên header (dưới md). */
function targetOf(step: number): HTMLElement | null {
  const all = [...document.querySelectorAll<HTMLElement>(`[data-guide="${STEPS[step]}"]`)];
  return (
    all.find((el) => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth;
    }) ??
    all[0] ??
    null
  );
}

/** Vị trí phần tử của bước và kích thước cửa sổ, đọc từ DOM; đổi khi cuộn, đổi cỡ cửa sổ hay phần tử đổi cỡ. */
function useTargetRect(step: number): { rect: Rect | null; vw: number; vh: number } {
  const subscribe = useCallback(
    (fn: () => void) => {
      window.addEventListener('resize', fn);
      window.addEventListener('scroll', fn, true);
      // Phần tử được làm nổi có thể đổi kích thước sau khi hiện (ví dụ dòng báo thiếu giọng đọc).
      const el = targetOf(step);
      const ro = el && typeof ResizeObserver !== 'undefined' ? new ResizeObserver(fn) : null;
      if (el) ro?.observe(el);
      return () => {
        window.removeEventListener('resize', fn);
        window.removeEventListener('scroll', fn, true);
        ro?.disconnect();
      };
    },
    [step],
  );
  const snap = useSyncExternalStore(
    subscribe,
    () => {
      const el = targetOf(step);
      const r = el?.getBoundingClientRect();
      return `${r ? `${r.top},${r.left},${r.width},${r.height}` : '-'}|${window.innerWidth},${window.innerHeight}`;
    },
    () => '-|0,0',
  );
  return useMemo(() => {
    const [r, v] = snap.split('|');
    const [vw, vh] = v.split(',').map(Number);
    if (r === '-') return { rect: null, vw, vh };
    const [top, left, width, height] = r.split(',').map(Number);
    return { rect: { top, left, width, height }, vw, vh };
  }, [snap]);
}

export function HuongDan({ replay, onStart }: { replay: boolean; onStart: () => void }) {
  const t = useTranslations('s9');
  const { updateSettings } = useLearning();
  const sheet = useSheet();
  const nav = useNav();
  const [step, setStep] = useState(0);
  const { rect, vw, vh } = useTargetRect(step);
  const bubble = useRef<HTMLDivElement>(null);
  const primary = useRef<HTMLButtonElement>(null);

  const finish = useCallback(() => {
    updateSettings({ guideSeen: true });
    if (replay) nav('hoc', undefined, { replace: true });
  }, [updateSettings, replay, nav]);

  useLayoutEffect(() => {
    targetOf(step)?.scrollIntoView?.({ block: 'nearest' });
  }, [step]);

  useEffect(() => {
    primary.current?.focus();
  }, [step]);

  const last = step === STEPS.length - 1;
  const pad = 8;
  const r = rect;
  const hole = r ? { top: r.top - pad, left: r.left - pad, right: r.left + r.width + pad, bottom: r.top + r.height + pad } : null;

  // Bong bóng đặt dưới phần tử nếu đủ chỗ, không thì đặt trên; với thanh bên thì đặt bên phải.
  // Cần chiều cao thật của bong bóng nên đặt vị trí sau khi vẽ, ghi thẳng vào style.
  useLayoutEffect(() => {
    const b = bubble.current;
    if (!b) return;
    const bh = b.offsetHeight || 160;
    let pos: CSSProperties = { left: 16, right: 16, bottom: 16, top: 'auto', width: 'auto' };
    if (hole && r) {
      const width = Math.min(360, vw - 32);
      const sideNav = STEPS[step] === 'nav' && r.height > vh * 0.6;
      if (sideNav) pos = { top: Math.max(16, r.top + 120), left: Math.min(hole.right + 8, vw - width - 16), width, right: 'auto', bottom: 'auto' };
      else {
        const fitsBelow = hole.bottom + 8 + bh <= vh - 8;
        const fitsAbove = hole.top - 8 - bh >= 8;
        // S9-02: trên hay dưới đều không đủ chỗ (thẻ câu cao trên màn hẹp): cuộn cho phần tử lên sát header để bong bóng
        // nằm dưới mà không che phần tử. Cuộn được thì chờ lần vẽ sau (vị trí phần tử đổi theo sự kiện cuộn).
        if (!fitsBelow && !fitsAbove) {
          const dy = hole.top - (HEADER_PX + 8);
          if (dy > 0 && hole.bottom - dy + 8 + bh <= vh - 8) {
            const before = window.scrollY;
            window.scrollBy({ top: dy, behavior: 'instant' });
            if (window.scrollY !== before) return;
          }
        }
        const left = Math.min(Math.max(16, hole.left), vw - width - 16);
        // Cách mép vùng làm nổi 8 px: bằng nhịp 16 px giữa các khối trừ phần đệm 8 px của vùng làm nổi, nên bong bóng
        // phủ trọn khối kế tiếp thay vì để lộ một dải mỏng của khối đó.
        const top = fitsBelow ? hole.bottom + 8 : Math.max(8, hole.top - 8 - bh);
        pos = { top, left, width, right: 'auto', bottom: 'auto' };
      }
    }
    for (const [k, v] of Object.entries(pos)) b.style.setProperty(k, typeof v === 'number' ? `${v}px` : String(v));
  });

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sheet.isOpen) {
        e.preventDefault();
        finish();
        return;
      }
      // APP-11: giữ focus trong bong bóng, để bàn phím không mở được sheet khác khi hướng dẫn đang mở.
      if (e.key === 'Tab' && bubble.current && !sheet.isOpen) {
        const els = [...bubble.current.querySelectorAll<HTMLElement>('button')];
        if (els.length === 0) return;
        const i = els.indexOf(document.activeElement as HTMLElement);
        e.preventDefault();
        const next = e.shiftKey ? (i <= 0 ? els.length - 1 : i - 1) : i === -1 || i === els.length - 1 ? 0 : i + 1;
        els[next].focus();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [finish, sheet.isOpen]);

  const scrim = 'fixed bg-scrim';
  return (
    <div className="fixed inset-0 z-[55]" role="dialog" aria-modal="true" aria-labelledby="guide-text" data-testid="guide">
      {hole ? (
        <>
          <div className={scrim} style={{ top: 0, left: 0, right: 0, height: Math.max(0, hole.top) }} />
          <div className={scrim} style={{ top: hole.bottom, left: 0, right: 0, bottom: 0 }} />
          <div className={scrim} style={{ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.bottom - hole.top }} />
          <div className={scrim} style={{ top: hole.top, left: hole.right, right: 0, height: hole.bottom - hole.top }} />
          <div className="pointer-events-none fixed rounded-card border-2 border-card" style={{ top: hole.top, left: hole.left, width: hole.right - hole.left, height: hole.bottom - hole.top }} />
        </>
      ) : (
        <div className={scrim} style={{ inset: 0 }} />
      )}
      <div ref={bubble} className="fixed bottom-4 left-4 right-4 flex flex-col gap-2 rounded-card bg-card p-4 text-card-foreground shadow-dialog">
        <p className="num text-description">{t('step', { n: step + 1, total: STEPS.length })}</p>
        <p id="guide-text" className="text-data">
          {t(`text.${STEPS[step]}`)}
        </p>
        <div className="mt-2 flex items-center justify-end gap-2">
          <Button tone="link" onClick={finish}>
            {t('skip')}
          </Button>
          <Button
            ref={primary}
            tone="outline"
            onClick={() => {
              if (!last) setStep(step + 1);
              else if (replay) finish();
              else {
                updateSettings({ guideSeen: true });
                onStart();
              }
            }}
          >
            {!last ? t('next') : replay ? t('done') : t('start')}
          </Button>
        </div>
      </div>
    </div>
  );
}
