'use client';
// @spec C3-01, C3-02, C3-04
// Nút dùng chung theo rule giao diện: bo góc 8 px, px-4 py-2.5, chữ 14 px đậm; vùng bấm tối thiểu 44 px (FND-14).
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { buttonClass, type ButtonTone } from './button-class';

export { buttonClass, type ButtonTone };


export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'> {
  tone?: ButtonTone;
  /** lg chỉ dùng cho lời mời chính ở Landing. */
  size?: 'md' | 'lg';
  /** Khóa: aria-disabled, không phát click (C3-04). */
  locked?: boolean;
  /** Đang xử lý: giữ chữ, thêm chỉ báo nhỏ, không nhận bấm. */
  busy?: boolean;
  icon?: ReactNode;
  /** Gợi ý phím tắt (hiện từ md). */
  shortcut?: string;
  /** Nút chính rộng hết khối trên màn hẹp (dưới sm). */
  blockOnMobile?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { tone = 'outline', size = 'md', locked, busy, icon, shortcut, blockOnMobile, className, onClick, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClass({ tone, size, className: cn(blockOnMobile && 'w-full sm:w-auto', busy && 'aria-disabled:opacity-100', className) })}
      aria-disabled={locked || busy ? true : undefined}
      aria-busy={busy || undefined}
      onClick={(e) => {
        if (locked || busy) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      {...rest}
    >
      {icon}
      <span>{children}</span>
      {busy && <span className="size-3 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
      {shortcut && (
        <kbd className="hidden rounded-dropdown border border-current px-1 font-sans text-xs opacity-70 md:inline-block" aria-hidden="true">
          {shortcut}
        </kbd>
      )}
    </button>
  );
});
