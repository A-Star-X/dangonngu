'use client';
// Ô tìm kiếm có icon và nút xóa. Giá trị đi vào bộ lọc phải qua useDebouncedValue (rule search-debounce).
import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
  value: string;
  onValueChange: (v: string) => void;
  clearLabel: string;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput({ value, onValueChange, clearLabel, className, ...rest }, ref) {
  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="pointer-events-none absolute left-3 size-5 text-muted-foreground" aria-hidden />
      <input
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="min-h-12 w-full appearance-none rounded-dropdown border border-border bg-card pr-12 pl-11 text-base text-foreground placeholder:text-muted-foreground hover:border-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        {...rest}
      />
      {value && (
        <button type="button" className="absolute right-1 inline-flex size-11 items-center justify-center rounded-full text-muted-foreground hover:text-foreground" aria-label={clearLabel} onClick={() => onValueChange('')}>
          <X className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
});
