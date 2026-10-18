// @spec C4-01, C4-02, C4-03
import { useEffect, useRef, useState } from 'react';
import { Check, X } from '@phosphor-icons/react';
import './choices.css';

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
  const [wrong, setWrong] = useState<Set<number>>(new Set());
  const [done, setDone] = useState<number | null>(null);
  const [live, setLive] = useState('');
  const reported = useRef(false);

  const pick = (i: number) => {
    if (done !== null || wrong.has(i) || !options[i]) return;
    if (options[i].correct) {
      setDone(i);
      setLive('Đúng');
      onCorrect?.();
    } else {
      setWrong((w) => new Set(w).add(i));
      setLive('Chưa đúng, thử lại');
      if (!reported.current) {
        reported.current = true;
        onWrong?.();
      }
    }
  };

  const pickRef = useRef(pick);
  pickRef.current = pick;
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
      <ul className="choices" aria-labelledby={labelledBy}>
        {options.map((o, i) => {
          const isWrong = wrong.has(i);
          const isRight = done === i;
          const locked = done !== null || isWrong;
          return (
            <li key={o.key}>
              <button
                type="button"
                className={`choice ${isWrong ? 'choice--wrong' : ''} ${isRight ? 'choice--right' : ''}`}
                aria-disabled={locked || undefined}
                data-correct={o.correct ? 'true' : undefined}
                onClick={() => pick(i)}
              >
                <span className="choice__num t-sm muted num" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="choice__text vi t-body" lang="vi">
                  {o.text}
                </span>
                {isRight && (
                  <span className="choice__mark t-sm">
                    Đúng
                    <Check size={24} aria-hidden data-icon="dung" />
                  </span>
                )}
                {isWrong && (
                  <span className="choice__mark t-sm">
                    Chưa đúng
                    <X size={24} aria-hidden data-icon="sai" />
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
