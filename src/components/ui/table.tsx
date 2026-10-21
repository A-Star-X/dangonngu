// Bảng dùng chung. Bảng mới đặt trong CardCustom và DataWithStatus (rule giao diện).
import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/** `scroll={false}`: không bọc vùng cuộn ngang (bảng chỉ cho trình đọc màn hình, vùng cuộn không nhận focus được thì axe báo lỗi). */
export function Table({ className, scroll = true, ...rest }: HTMLAttributes<HTMLTableElement> & { scroll?: boolean }) {
  const table = <table className={cn('w-full border-collapse text-data', className)} {...rest} />;
  if (!scroll) return table;
  return <div className="w-full overflow-x-auto">{table}</div>;
}
export function TableHeader(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <thead {...props} />;
}
export function TableBody(props: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...props} />;
}
export function TableRow({ className, ...rest }: HTMLAttributes<HTMLTableRowElement>) {
  return <tr className={cn('border-b border-border last:border-0', className)} {...rest} />;
}
export function TableHead({ className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn('text-label px-3 py-2 text-left text-muted-foreground', className)} {...rest} />;
}
export function TableCell({ className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn('px-3 py-2', className)} {...rest} />;
}
