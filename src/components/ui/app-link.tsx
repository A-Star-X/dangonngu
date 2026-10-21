'use client';
// @spec APP-13, S3-07
// Liên kết trong khu học: thẻ <a> thật (mở được ở tab mới), chuyển màn bằng router, hỏi chặn rời màn trước.
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';
import { canLeave } from '@/lib/nav-guard';

export interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string;
  children: ReactNode;
  replace?: boolean;
}

export function AppLink({ href, onClick, children, replace, ...rest }: AppLinkProps) {
  return (
    <Link
      href={href}
      replace={replace}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        // Mở tab mới (Ctrl, Cmd, chuột giữa) thì để trình duyệt tự xử lý.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!canLeave(href)) e.preventDefault();
      }}
      {...rest}
    >
      {children}
    </Link>
  );
}
