'use client';
// @spec C7-01, C7-02, C7-03, AU-04
// Thông báo nổi bằng react-toastify. Chỉ một thông báo mỗi lúc; có nút hành động thì hiện 6 giây, không thì 3 giây.
// Tự đếm giờ để đóng (không dựa vào hiệu ứng CSS của thư viện), nên vẫn đóng đúng giờ khi máy tắt hiệu ứng chuyển động.
import { toast, type Id } from 'react-toastify';
import type { ApiErrorCode } from './api-error';
import { toApiError } from './api-error';

export interface NotifyOptions {
  /** Mã để ẩn đúng thông báo này (dismiss(id) không ẩn thông báo khác). */
  id?: string;
  kind?: 'status' | 'alert';
  action?: { label: string; onClick: () => void };
}

export const TOAST_MS = 3000;
export const TOAST_ACTION_MS = 6000;

let current: { id: string; timer: number } | null = null;
let seq = 0;

function Body({ text, action, id }: { text: string; action?: NotifyOptions['action']; id: string }) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <span className="min-w-0 text-sm">{text}</span>
      {action && (
        <button
          type="button"
          className="min-h-11 flex-none rounded-button px-3 text-sm font-semibold text-primary underline-offset-2 hover:underline"
          onClick={() => {
            action.onClick();
            dismiss(id);
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function notify(text: string, opts: NotifyOptions = {}): Id {
  // C7-01: thông báo mới thay thông báo đang hiện.
  dismiss();
  const id = opts.id ?? `t${(seq++).toString(36)}`;
  const content = <Body text={text} action={opts.action} id={id} />;
  const options = { toastId: id, autoClose: false, role: opts.kind === 'alert' ? 'alert' : 'status', closeButton: false } as const;
  if (opts.kind === 'alert') toast.error(content, options);
  else toast(content, options);
  const timer = window.setTimeout(() => dismiss(id), opts.action ? TOAST_ACTION_MS : TOAST_MS);
  current = { id, timer };
  return id;
}

export function dismiss(id?: string) {
  if (!current) {
    if (id === undefined) toast.dismiss();
    return;
  }
  if (id !== undefined && current.id !== id) return;
  window.clearTimeout(current.timer);
  toast.dismiss(current.id);
  current = null;
}

/** Báo lỗi gọi máy chủ: `t` là bộ dịch namespace apiError. */
export function showApiError(error: unknown, t: (code: ApiErrorCode) => string, opts: Omit<NotifyOptions, 'kind'> = {}): Id {
  const e = toApiError(error);
  return notify(t(e.code), { ...opts, kind: 'alert' });
}
