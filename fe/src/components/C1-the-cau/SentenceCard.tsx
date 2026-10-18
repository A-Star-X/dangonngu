// @spec C1-01, C1-02, C1-03, C1-04, C1-05, C1-06, C1-07, C1-08
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Repeat, SpeakerHigh, Stop } from '@phosphor-icons/react';
import { lowerFirst, type Item } from '../../data';
import { sentenceSize } from '../../foundation/typography';
import { useSpeaker } from './useSpeaker';
import { Strip, type CellState } from '../C2-dai-8-o/Strip';
import './card.css';

export interface SentenceCardProps {
  item: Item;
  /** Mã ngôn ngữ đích (lang của câu gốc). */
  lang: string;
  locale?: string;
  langName: string;
  /** Che câu gốc (C1-02). */
  covered?: boolean;
  onReveal?: () => void;
  strip?: { cells: CellState[]; label: string };
  /** Phần đầu thẻ do trang truyền vào (tên unit ở T1). */
  header?: ReactNode;
  /** Mở sheet Giọng đọc (C1-05). */
  onOpenVoices?: () => void;
  className?: string;
  /** Đưa focus vào thẻ khi đang che, để Space / Enter hiện câu gốc ngay (S3-09). */
  autoFocus?: boolean;
}

function Source({ item, lang, size }: { item: Item; lang: string; size: string }) {
  if (item.furigana) {
    return (
      <p className={`card__source src ${size}`} lang={lang}>
        {item.furigana.map((seg, i) =>
          seg[1] ? (
            <ruby key={i}>
              {seg[0]}
              <rp>(</rp>
              <rt>{seg[1]}</rt>
              <rp>)</rp>
            </ruby>
          ) : (
            <span key={i}>{seg[0]}</span>
          ),
        )}
      </p>
    );
  }
  return (
    <p className={`card__source src ${size}`} lang={lang}>
      {item.en}
    </p>
  );
}

export function SentenceCard({ item, lang, locale, langName, covered = false, onReveal, strip, header, onOpenVoices, className, autoFocus }: SentenceCardProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (autoFocus && covered) ref.current?.focus({ preventScroll: true });
  }, [autoFocus, covered, item.id]);
  const speaker = useSpeaker(item.en, lang, locale);
  const size = sentenceSize(item.en);
  // C1-02: khối che và tabIndex của thẻ biến mất khi hiện câu gốc; nếu focus đang ở thẻ thì chuyển sang câu vừa hiện,
  // để bàn phím không rơi về đầu trang và trình đọc màn hình đọc được câu gốc.
  const revealedRef = useRef<HTMLDivElement>(null);
  const focusAfterReveal = useRef(false);
  useEffect(() => {
    if (covered || !focusAfterReveal.current) return;
    focusAfterReveal.current = false;
    revealedRef.current?.focus({ preventScroll: true });
  }, [covered]);
  const reveal = () => {
    if (!covered) return;
    focusAfterReveal.current = !!ref.current && ref.current.contains(document.activeElement);
    onReveal?.();
  };
  const onKey = (e: KeyboardEvent) => {
    if (!covered || e.target !== e.currentTarget) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      reveal();
    }
  };
  const audioLocked = covered || speaker.noVoice || !speaker.ready;

  return (
    <article
      ref={ref}
      className={`card ${covered ? 'card--covered' : ''} ${className ?? ''}`}
      tabIndex={covered ? 0 : undefined}
      onKeyDown={onKey}
      onClick={covered ? reveal : undefined}
      data-guide="card"
    >
      {strip && (
        <div className="card__top">
          <Strip cells={strip.cells} />
          <span className="t-sm muted num">{strip.label}</span>
        </div>
      )}
      {header}
      <p className="card__meaning vi t-lg" lang="vi">
        {item.vi}
      </p>
      {covered ? (
        <button
          type="button"
          className="card__cover t-body"
          onClick={(e) => {
            e.stopPropagation();
            reveal();
          }}
        >
          Nhấn để hiện câu gốc
        </button>
      ) : (
        <div className="card__revealed" data-testid="card-source" ref={revealedRef} tabIndex={-1}>
          <Source item={item} lang={lang} size={size} />
          {item.reading && !item.furigana && (
            <p className="card__reading t-sm muted" lang={lang}>
              {item.reading}
            </p>
          )}
          {item.noteVi && (
            <p className="card__note vi t-sm muted" lang="vi">
              Cách dùng: {item.noteVi}
            </p>
          )}
        </div>
      )}
      <div className="card__audio">
        <AudioButton locked={audioLocked} active={speaker.playing === 'once'} kind="once" onClick={() => speaker.toggle('once')} />
        <AudioButton locked={audioLocked} active={speaker.playing === 'loop'} kind="loop" onClick={() => speaker.toggle('loop')} />
      </div>
      {(speaker.noVoice || !speaker.ready) && <NoVoice langName={langName} onOpenVoices={onOpenVoices} pending={!speaker.ready} />}
    </article>
  );
}

export function AudioButton({ locked, active, kind, onClick }: { locked: boolean; active: boolean; kind: 'once' | 'loop'; onClick: () => void }) {
  return (
    <button
      type="button"
      className="card__audio-btn"
      aria-disabled={locked || undefined}
      onClick={(e) => {
        e.stopPropagation();
        if (!locked) onClick();
      }}
    >
      {active ? <Stop size={24} aria-hidden /> : kind === 'once' ? <SpeakerHigh size={24} aria-hidden /> : <Repeat size={24} aria-hidden />}
      <span>{active ? 'Dừng' : kind === 'once' ? 'Nghe' : 'Nghe lặp'}</span>
    </button>
  );
}

/**
 * Câu báo thiếu giọng dưới hàng nút Nghe (C1-05).
 *
 * `pending`: trình duyệt còn đang nạp danh sách giọng (tối đa 1,5 giây, xem `useVoices`), chưa biết có giọng hay không.
 * Khi đó giữ sẵn chỗ bằng một dòng ẩn cùng nội dung, để lúc câu báo hiện ra các lựa chọn và nút bên dưới
 * không bị đẩy xuống dưới tay người đang bấm. Có giọng thì nơi gọi bỏ dòng giữ chỗ.
 */
export function NoVoice({ langName, onOpenVoices, pending = false }: { langName: string; onOpenVoices?: () => void; pending?: boolean }) {
  if (pending) {
    return (
      <p className="card__novoice card__novoice--pending t-sm muted" aria-hidden="true">
        Thiết bị chưa có giọng {lowerFirst(langName)}. Mở <span className="card__link">Cài đặt &gt; Giọng đọc</span>.
      </p>
    );
  }
  return (
    <p className="card__novoice t-sm muted">
      Thiết bị chưa có giọng {lowerFirst(langName)}. Mở{' '}
      <button
        type="button"
        className="card__link"
        onClick={(e) => {
          e.stopPropagation();
          onOpenVoices?.();
        }}
      >
        Cài đặt &gt; Giọng đọc
      </button>
      .
    </p>
  );
}

export { Source as SourceText };
