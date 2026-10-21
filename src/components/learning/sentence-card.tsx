'use client';
// @spec C1-01, C1-02, C1-03, C1-04, C1-05, C1-06, C1-07, C1-08, C1-09, C1-10
import { useEffect, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { Repeat, Snail, Square, Volume2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Item } from '@/domain';
import { cn } from '@/lib/utils';
import { sentenceSize } from '@/lib/typography';
import { Strip, type CellState } from './strip';
import { useSpeaker } from './use-speaker';

export interface SentenceCardProps {
  item: Item;
  /** Mã ngôn ngữ đích (lang của câu gốc). */
  lang: string;
  locale?: string;
  /** Tên ngôn ngữ để đặt giữa câu báo thiếu giọng ("tiếng Nhật"). */
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

export function SourceText({ item, lang, className, word }: { item: Item; lang: string; className?: string; word?: [number, number] | null }) {
  const cls = cn('src text-left text-foreground [overflow-wrap:anywhere] [&_rt]:text-sm [&_rt]:text-muted-foreground', sentenceSize(item.en), className);
  if (item.furigana) {
    return (
      <p className={cls} lang={lang} data-testid="source-text">
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
  // C1-09: tô nền và gạch chân chữ đang đọc; không đổi cỡ, độ đậm nên các chữ khác không xê dịch.
  if (word) {
    const [s, e] = word;
    return (
      <p className={cls} lang={lang} data-testid="source-text">
        {item.en.slice(0, s)}
        <mark className="rounded-sm bg-sidebar-accent text-foreground underline decoration-primary decoration-2 underline-offset-4 [box-decoration-break:clone]" data-testid="speaking-word">
          {item.en.slice(s, e)}
        </mark>
        {item.en.slice(e)}
      </p>
    );
  }
  return (
    <p className={cls} lang={lang} data-testid="source-text">
      {item.en}
    </p>
  );
}

export function SentenceCard({ item, lang, locale, langName, covered = false, onReveal, strip, header, onOpenVoices, className, autoFocus }: SentenceCardProps) {
  const t = useTranslations('card');
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (autoFocus && covered) ref.current?.focus({ preventScroll: true });
  }, [autoFocus, covered, item.id]);
  const speaker = useSpeaker(item.en, lang, locale);
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
      className={cn('flex min-w-0 flex-col gap-4 rounded-card bg-card p-4 text-card-foreground sm:p-6', covered && 'cursor-pointer', className)}
      tabIndex={covered ? 0 : undefined}
      onKeyDown={onKey}
      onClick={covered ? reveal : undefined}
      data-guide="card"
      data-testid="sentence-card"
    >
      {strip && (
        <div className="flex items-center justify-between gap-3">
          <Strip cells={strip.cells} />
          <span className="num text-sm text-muted-foreground">{strip.label}</span>
        </div>
      )}
      {header}
      <p className="vi text-lg text-foreground [overflow-wrap:anywhere]" lang="vi">
        {item.vi}
      </p>
      {covered ? (
        <button
          type="button"
          className="flex min-h-14 items-center rounded-dropdown bg-muted px-4 py-3 text-left text-base text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            reveal();
          }}
        >
          {t('reveal')}
        </button>
      ) : (
        <div className="flex flex-col gap-2 motion-safe:animate-[card-reveal_var(--d-reveal)_ease-out] focus:outline-none" data-testid="card-source" ref={revealedRef} tabIndex={-1}>
          <SourceText item={item} lang={lang} word={speaker.word} />
          {item.reading && !item.furigana && (
            <p className="text-sm text-muted-foreground" lang={lang}>
              {item.reading}
            </p>
          )}
          {item.noteVi && (
            <p className="vi text-sm text-muted-foreground" lang="vi">
              {t('usage', { note: item.noteVi })}
            </p>
          )}
        </div>
      )}
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <AudioButton locked={audioLocked} active={speaker.playing === 'once'} kind="once" onClick={() => speaker.toggle('once')} />
          <AudioButton locked={audioLocked} active={speaker.playing === 'slow'} kind="slow" onClick={() => speaker.toggle('slow')} />
        </div>
        <AudioButton locked={audioLocked} active={speaker.playing === 'loop'} kind="loop" onClick={() => speaker.toggle('loop')} />
      </div>
      {(speaker.noVoice || !speaker.ready) && <NoVoice langName={langName} onOpenVoices={onOpenVoices} pending={!speaker.ready} />}
    </article>
  );
}

export function AudioButton({ locked, active, kind, onClick, label }: { locked: boolean; active: boolean; kind: 'once' | 'loop' | 'slow'; onClick: () => void; label?: string }) {
  const t = useTranslations('card');
  const Icon = active ? Square : kind === 'once' ? Volume2 : kind === 'slow' ? Snail : Repeat;
  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border py-2 pr-4 pl-3 text-sm font-semibold whitespace-nowrap text-foreground hover:border-muted-foreground aria-disabled:opacity-40 aria-disabled:hover:border-border"
      aria-disabled={locked || undefined}
      aria-label={label}
      onClick={(e) => {
        e.stopPropagation();
        if (!locked) onClick();
      }}
    >
      <Icon className="size-5" aria-hidden />
      <span>{active ? t('stop') : kind === 'once' ? t('listen') : kind === 'slow' ? t('listenSlow') : t('listenLoop')}</span>
    </button>
  );
}

/**
 * Câu báo thiếu giọng dưới hàng nút Nghe (C1-05).
 *
 * `pending`: trình duyệt còn đang nạp danh sách giọng (tối đa 1,5 giây), chưa biết có giọng hay không.
 * Khi đó giữ sẵn chỗ bằng một dòng ẩn cùng nội dung, để lúc câu báo hiện ra các lựa chọn và nút bên dưới
 * không bị đẩy xuống dưới tay người đang bấm.
 */
export function NoVoice({ langName, onOpenVoices, pending = false }: { langName: string; onOpenVoices?: () => void; pending?: boolean }) {
  const t = useTranslations('card');
  if (pending) {
    return (
      <p className="invisible text-sm text-muted-foreground" aria-hidden="true" data-testid="no-voice" data-pending="true">
        {t.rich('noVoice', { lang: langName, link: (c) => <span className="inline-block underline">{c}</span> })}
      </p>
    );
  }
  return (
    <p className="text-sm text-muted-foreground" data-testid="no-voice">
      {t.rich('noVoice', {
        lang: langName,
        link: (c) => (
          <button
            type="button"
            className="text-foreground underline underline-offset-2"
            data-inline-link=""
            onClick={(e) => {
              e.stopPropagation();
              onOpenVoices?.();
            }}
          >
            {c}
          </button>
        ),
      })}
    </p>
  );
}
