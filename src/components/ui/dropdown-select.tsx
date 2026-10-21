'use client';
// @spec C8-01, C8-02, C8-03
// Cách chọn một giá trị duy nhất (rule giao diện: không dùng Select). Trigger bo góc 6 px, hover viền primary.
// Mẫu "select-only combobox" của WAI-ARIA: nút có role combobox, danh sách role listbox; có ô lọc cho danh sách dài.
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { fold } from '@/domain/text';

export interface DropdownOption {
  value: string;
  label: string;
  /** Dòng phụ dưới nhãn (ví dụ số câu). */
  description?: string;
  /** Chữ dùng để lọc thêm (ngoài nhãn). */
  keywords?: string;
  lang?: string;
}

export interface DropdownSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DropdownOption[];
  /** Nhãn trợ năng khi không có nhãn hiển thị liên kết bằng labelledBy. */
  ariaLabel?: string;
  labelledBy?: string;
  placeholder?: string;
  /** Hiện ô lọc trong danh sách (danh sách dài như Unit, Chủ đề). */
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  /** Nội dung hiển thị trên nút thay cho nhãn của lựa chọn. */
  renderValue?: (option: DropdownOption | undefined) => ReactNode;
  id?: string;
  disabled?: boolean;
  /** sm: ô 36 px trên header (rule giao diện: nút ở header là ô 36 px). */
  size?: 'md' | 'sm';
  /** Danh sách mở về phía phải (khi trigger nằm sát mép phải). */
  align?: 'start' | 'end';
}

export function DropdownSelect({
  value,
  onValueChange,
  options,
  ariaLabel,
  labelledBy,
  placeholder,
  searchable,
  searchPlaceholder,
  className,
  renderValue,
  id,
  disabled,
  size = 'md',
  align = 'start',
}: DropdownSelectProps) {
  const t = useTranslations('common');
  const autoId = useId();
  const triggerId = id ?? `dd-${autoId}`;
  const listId = `${triggerId}-list`;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);
  const shown = useMemo(() => {
    const q = fold(query);
    if (!q) return options;
    return options.filter((o) => fold(`${o.label} ${o.description ?? ''} ${o.keywords ?? ''}`).includes(q));
  }, [options, query]);

  const openList = () => {
    if (disabled) return;
    setQuery('');
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };
  const close = (focusTrigger = true) => {
    setOpen(false);
    if (focusTrigger) trigger.current?.focus();
  };
  const choose = (o: DropdownOption) => {
    onValueChange(o.value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    if (searchable) search.current?.focus();
    else list.current?.focus();
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, searchable]);

  useEffect(() => {
    if (!open) return;
    list.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView?.({ block: 'nearest' });
  }, [active, open]);

  const onListKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(shown.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(shown.length - 1);
    } else if (e.key === 'Enter' || (e.key === ' ' && !searchable)) {
      e.preventDefault();
      const o = shown[active];
      if (o) choose(o);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  return (
    <div ref={root} className={cn('relative', className)} data-dropdown-open={open || undefined}>
      <button
        ref={trigger}
        id={triggerId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-labelledby={labelledBy ? `${labelledBy} ${triggerId}` : undefined}
        aria-disabled={disabled || undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            openList();
          }
        }}
        className={cn(
          'flex w-full items-center justify-between gap-2 rounded-dropdown border border-border bg-card text-left text-sm text-foreground',
          size === 'sm' ? 'min-h-9 px-2.5 py-1' : 'min-h-11 px-3 py-2',
          'hover:border-primary aria-expanded:border-primary aria-disabled:opacity-40',
        )}
      >
        <span className={cn('min-w-0 truncate', !selected && 'text-muted-foreground')}>{renderValue ? renderValue(selected) : (selected?.label ?? placeholder)}</span>
        <ChevronDown className={cn('size-4 flex-none transition-transform', open && 'rotate-180')} aria-hidden />
      </button>
      {open && (
        <div className={cn('absolute z-40 mt-1 w-full min-w-56 rounded-dropdown border border-border bg-card shadow-dialog', align === 'end' ? 'right-0' : 'left-0')}>
          {searchable && (
            <div className="relative border-b border-border p-2">
              <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
              <input
                ref={search}
                type="search"
                value={query}
                placeholder={searchPlaceholder ?? t('search')}
                aria-label={searchPlaceholder ?? t('search')}
                aria-controls={listId}
                aria-activedescendant={shown[active] ? `${listId}-${active}` : undefined}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onListKey}
                className="min-h-11 w-full rounded-dropdown border border-border bg-background py-2 pr-2 pl-8 text-sm"
              />
            </div>
          )}
          <ul
            ref={list}
            id={listId}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={labelledBy}
            aria-label={labelledBy ? undefined : ariaLabel}
            aria-activedescendant={!searchable && shown[active] ? `${listId}-${active}` : undefined}
            onKeyDown={searchable ? undefined : onListKey}
            className="max-h-72 overflow-y-auto py-1"
          >
            {shown.length === 0 && <li className="text-description px-3 py-2">{t('noMatch')}</li>}
            {shown.map((o, i) => {
              const isSel = o.value === value;
              return (
                <li
                  key={o.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={isSel}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => choose(o)}
                  className={cn(
                    'flex min-h-11 cursor-pointer items-center justify-between gap-3 px-3 py-2 text-sm',
                    i === active && 'bg-muted',
                    isSel && 'font-semibold',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate" lang={o.lang}>
                      {o.label}
                    </span>
                    {o.description && <span className="text-description block">{o.description}</span>}
                  </span>
                  {isSel && <Check className="size-4 flex-none text-primary" aria-hidden />}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
