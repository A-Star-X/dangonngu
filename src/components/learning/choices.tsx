'use client';
// @spec C4-01, C4-02, C4-03
import { useEffect, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

export interface ChoiceOption {
  key: string | number;
  text: string;
  correct: boolean;
}

export interface ChoicesProps {
  options: ChoiceOption[];
  /** Lần chọn sai đầu tiên. */
  onWrong?: () => void;
  onCorrect?: () => void;
  /** Bật phím 1 đến 4 (tắt khi có lớp phủ đang mở). */
  keyboard?: boolean;
  labelledBy?: string;
}

export function Choices({ options, onWrong, onCorrect, keyboard = true, labelledBy }: ChoicesProps) {
  const t = useTranslations('choices');
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [done, setDone] = useState<number | null>(null);
  const [live, setLive] = useState('');
  const reported = useRef(false);

  const pick = (i: number) => {
    if (done !== null || wrong.has(i) || !options[i]) return;
    if (options[i].correct) {
      setDone(i);
      setLive(t('right'));
      onCorrect?.();
    } else {
      setWrong((w) => new Set(w).add(i));
      setLive(t('tryAgain'));
      if (!reported.current) {
        reported.current = true;
        onWrong?.();
      }
    }
  };

  const pickRef = useRef(pick);
  useEffect(() => {
    pickRef.current = pick;
  });
  useEffect(() => {
    if (!keyboard) return;
    const on = (e: KeyboardEvent) => {
      // Bỏ qua sự kiện lặp khi giữ phím: phím giữ từ bước trước không được tự chọn đáp án.
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= 4) {
        e.preventDefault();
        pickRef.current(n - 1);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [keyboard]);

  return (
    <div>
      <ul className="flex flex-col gap-2" aria-labelledby={labelledBy}>
        {options.map((o, i) => {
          const isWrong = wrong.has(i);
          const isRight = done === i;
          const locked = done !== null || isWrong;
          return (
            <li key={o.key}>
              <button
                type="button"
                className={cn(
                  'flex min-h-14 w-full items-center gap-3 rounded-button border border-border bg-card px-4 py-3 text-left text-foreground',
                  !locked && 'hover:border-muted-foreground',
                  isRight && 'border-2 border-success',
                  isWrong && 'border-2 border-danger bg-danger-soft',
                  locked && !isRight && !isWrong && 'opacity-40',
                )}
                aria-disabled={locked || undefined}
                data-correct={o.correct ? 'true' : undefined}
                data-state={isRight ? 'right' : isWrong ? 'wrong' : undefined}
                onClick={() => pick(i)}
              >
                <span className="num hidden w-4 flex-none text-sm text-muted-foreground md:inline" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="vi min-w-0 flex-1 text-base [overflow-wrap:anywhere]" lang="vi">
                  {o.text}
                </span>
                {isRight && (
                  <span className="inline-flex flex-none items-center gap-1 text-sm font-semibold text-success">
                    {t('right')}
                    <Check className="size-5" aria-hidden data-icon="dung" />
                  </span>
                )}
                {isWrong && (
                  <span className="inline-flex flex-none items-center gap-1 text-sm font-semibold text-danger">
                    {t('wrong')}
                    <X className="size-5" aria-hidden data-icon="sai" />
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite" data-testid="choices-live">
        {live}
      </p>
    </div>
  );
}
