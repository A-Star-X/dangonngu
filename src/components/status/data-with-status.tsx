'use client';
// Thứ tự hiển thị: lỗi, đang tải, không có dữ liệu, nội dung (rule status-display).
import type { ReactNode } from 'react';
import { Failed } from './failed';
import { Loading } from './loading';
import { NoData } from './no-data';
import { NAValue, ValueLoading } from './value-loading';

export function DataWithStatus({
  isError,
  isLoading,
  isEmpty,
  onRetry,
  errorMessage,
  loadingFallback,
  empty,
  children,
}: {
  isError?: boolean;
  isLoading?: boolean;
  isEmpty?: boolean;
  onRetry?: () => void;
  errorMessage?: string;
  /** Khung xương đúng hình khối thay cho vòng xoay (APP-08). */
  loadingFallback?: ReactNode;
  empty?: ReactNode;
  children: ReactNode;
}) {
  if (isError) return <Failed message={errorMessage} onRetry={onRetry} />;
  if (isLoading) return <>{loadingFallback ?? <Loading />}</>;
  if (isEmpty) return <>{empty ?? <NoData />}</>;
  return <>{children}</>;
}

/** Ô giá trị nhỏ: lỗi hoặc không có thì "--", đang tải thì khung xương. */
export function ValueWithStatus({ isLoading, isError, value }: { isLoading?: boolean; isError?: boolean; value: ReactNode | null | undefined }) {
  if (isError) return <NAValue />;
  if (isLoading) return <ValueLoading />;
  if (value === null || value === undefined || value === '') return <NAValue />;
  return <>{value}</>;
}
