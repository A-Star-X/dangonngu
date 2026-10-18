// @spec S9-01, S9-02, S9-03, S9-04, S9-05, APP-11
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Button } from '../../components/C3-nut/Button';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import { navigate } from '../../app/router';
import { useApp } from '../../app/state';
import './s9.css';

const STEPS = [
  { target: 'card', text: 'Đây là câu bạn sẽ học. Nút Nghe sẽ đọc to câu này cho bạn.' },
  { target: 'start', text: 'Mỗi phiên học có 8 câu, mất khoảng 5 phút.' },
  { target: 'tabbar', text: 'Ôn tập và kiểm tra nằm ở mục Luyện tập. Kết quả học nằm ở mục Tiến độ.' },
] as const;

type Rect = { top: number; left: number; width: number; height: number };

export function S9HuongDan({ replay, onStart }: { replay: boolean; onStart: () => void }) {
  const { updateSettings } = useApp();
  const sheet = useSheet();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [vw, setVw] = useState(() => window.innerWidth);
  const [vh, setVh] = useState(() => window.innerHeight);
  const bubble = useRef<HTMLDivElement>(null);
  const [bh, setBh] = useState(160);
  const primary = useRef<HTMLButtonElement>(null);

  const finish = useCallback(() => {
    updateSettings({ guideSeen: true });
    if (replay) navigate('hoc', undefined, { replace: true });
  }, [updateSettings, replay]);

  const measure = useCallback(() => {
    const el = document.querySelector<HTMLElement>(`[data-guide="${STEPS[step].target}"]`);
    setVw(window.innerWidth);
    setVh(window.innerHeight);
    if (!el) return setRect(null);
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-guide="${STEPS[step].target}"]`);
    el?.scrollIntoView?.({ block: 'nearest' });
    measure();
    if (bubble.current) setBh(bubble.current.offsetHeight);
  }, [measure, step]);

  useEffect(() => {
    primary.current?.focus();
  }, [step]);

  // Phần tử được làm nổi có thể đổi kích thước sau khi hiện (ví dụ dòng báo thiếu giọng đọc).
  useEffect(() => {
    const el = document.querySelector<HTMLElement>(`[data-guide="${STEPS[step].target}"]`);
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => measure());
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure, step]);

  useEffect(() => {
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !sheet.isOpen) {
        e.preventDefault();
        finish();
        return;
      }
      // APP-11: giữ focus trong bong bóng, để bàn phím không mở được sheet khác (ví dụ Đổi ngôn ngữ) khi hướng dẫn đang mở.
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

  const last = step === STEPS.length - 1;
  const pad = 8;
  const r = rect;
  const hole = r ? { top: r.top - pad, left: r.left - pad, right: r.left + r.width + pad, bottom: r.top + r.height + pad } : null;

  // Bong bóng đặt dưới phần tử nếu đủ chỗ, không thì đặt trên; với thanh dọc thì đặt bên phải.
  let bubbleStyle: React.CSSProperties = { left: 16, right: 16, bottom: 16 };
  if (hole) {
    const width = Math.min(360, vw - 32);
    const sideNav = STEPS[step].target === 'tabbar' && r!.height > vh * 0.6;
    if (sideNav) {
      bubbleStyle = { top: Math.max(16, r!.top + 120), left: hole.right + 16, width };
    } else {
      const left = Math.min(Math.max(16, hole.left), vw - width - 16);
      if (hole.bottom + 12 + bh <= vh - 8) bubbleStyle = { top: hole.bottom + 12, left, width };
      else bubbleStyle = { top: Math.max(8, hole.top - 12 - bh), left, width };
    }
  }

  return (
    <div className="guide" role="dialog" aria-modal="true" aria-labelledby="guide-text">
      {hole ? (
        <>
          <div className="guide__scrim" style={{ top: 0, left: 0, right: 0, height: Math.max(0, hole.top) }} />
          <div className="guide__scrim" style={{ top: hole.bottom, left: 0, right: 0, bottom: 0 }} />
          <div className="guide__scrim" style={{ top: hole.top, left: 0, width: Math.max(0, hole.left), height: hole.bottom - hole.top }} />
          <div className="guide__scrim" style={{ top: hole.top, left: hole.right, right: 0, height: hole.bottom - hole.top }} />
          <div className="guide__ring" style={{ top: hole.top, left: hole.left, width: hole.right - hole.left, height: hole.bottom - hole.top }} />
        </>
      ) : (
        <div className="guide__scrim" style={{ inset: 0 }} />
      )}
      <div ref={bubble} className="guide__bubble" style={bubbleStyle}>
        <p className="t-sm muted num">Bước {step + 1}/3</p>
        <p id="guide-text" className="t-body">
          {STEPS[step].text}
        </p>
        <div className="guide__actions">
          <Button variant="text" onClick={finish}>
            Bỏ qua
          </Button>
          <Button
            ref={primary}
            variant="primary"
            onClick={() => {
              if (!last) setStep(step + 1);
              else if (replay) finish();
              else {
                updateSettings({ guideSeen: true });
                onStart();
              }
            }}
          >
            {!last ? 'Tiếp' : replay ? 'Xong' : 'Bắt đầu học'}
          </Button>
        </div>
      </div>
    </div>
  );
}
