'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(function Input(
  { className, invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'min-h-11 w-full rounded-dropdown border border-border bg-card px-3 py-2 text-data text-foreground placeholder:text-muted-foreground',
        'focus-visible:border-ring aria-invalid:border-danger',
        className,
      )}
      {...rest}
    />
  );
});
