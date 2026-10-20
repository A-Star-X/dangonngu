// @spec S3-01, S3-02, S3-03, S3-04, S3-05, S3-06, S3-07, S3-08, S3-09
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { SentenceCard, SourceText, AudioButton, NoVoice } from '../../components/C1-the-cau/SentenceCard';
import { useSpeaker } from '../../components/C1-the-cau/useSpeaker';
import { Strip, type CellState } from '../../components/C2-dai-8-o/Strip';
import { Button } from '../../components/C3-nut/Button';
import { RatePair } from '../../components/C3-nut/RatePair';
import { Choices } from '../../components/C4-lua-chon/Choices';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import { useToast } from '../../components/C7-thong-bao/ToastHost';
import {
  buildChoices,
  completeSession,
  markHinted,
  moveTo,
  nextUnitIndex,
  recordCheck,
  recordMemorize,
  sessionGroup,
  sessionResults,
  startSession,
  GROUP_SIZE,
  type Item,
  type LanguageData,
  type Nguon,
  type Session,
} from '../../data';
import { sentenceSize } from '../../foundation/typography';
import { href, lastMainRoute, navigate, setLeaveGuard } from '../../app/router';
import { useApp } from '../../app/state';
import './s3.css';

const NGUON: Nguon[] = ['lo-trinh', 'on-tap', 'tu-khoa', 'cau'];

/** Gợi ý S3-05: chữ đầu tiên của nghĩa và số từ. */
export function hintText(vi: string): string {
  const first = [...vi.trim()].find((ch) => /[\p{L}\p{N}]/u.test(ch)) ?? vi.trim().charAt(0);
  const words = vi.trim().split(/\s+/).filter(Boolean).length;
  return `Nghĩa bắt đầu bằng "${first}…", gồm ${words} từ.`;
}

const isInteractive = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('button, a, input, select, textarea, [role="dialog"]');

export function S3PhienHoc({ params }: { params: Record<string, string> }) {
  const app = useApp();
  const { data, progress, updateProgress, deps } = app;
  const toast = useToast();
  const origin = useRef(lastMainRoute());
  const started = useRef<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(params.phien ?? null);

  const d = data?.status === 'ready' ? data.value : null;

  // S3-01, S3-08: mở lại phiên dở hoặc tạo phiên mới theo nguồn.
  useEffect(() => {
    if (!d) return;
    const key = JSON.stringify(params);
    if (started.current === key) return;
    started.current = key;
    if (params.phien) {
      const s = progress.sessions.find((x) => x.id === params.phien);
      if (s && s.completedAt === undefined && s.abandonedAt === undefined) {
        setSessionId(s.id);
        return;
      }
      if (s && s.completedAt !== undefined) {
        setSessionId(s.id);
        return;
      }
    }
    const nguon = (NGUON as string[]).includes(params.nguon) ? (params.nguon as Nguon) : 'lo-trinh';
    const g = sessionGroup(nguon, params, d, progress, deps.now());
    if (g.itemIds.length === 0) {
      toast.show({ text: 'Không có câu nào để học trong nhóm này.' });
      const o = origin.current;
      navigate(o.name, o.params, { replace: true });
      return;
    }
    const rest: Record<string, string> = {};
    for (const k of ['q', 'nhom', 'id']) if (params[k]) rest[k] = params[k];
    let created: Session | undefined;
    updateProgress((p) => {
      const r = startSession(p, nguon, g.itemIds, rest, deps.now());
      created = r.session;
      return r.progress;
    });
    setSessionId(created!.id);
    // Ghi id phiên vào route để tải lại trang thì mở lại đúng phiên.
    navigate('phien-hoc', { nguon, ...rest, phien: created!.id }, { replace: true });
    started.current = JSON.stringify({ nguon, ...rest, phien: created!.id });
  }, [d, params]); // eslint-disable-line react-hooks/exhaustive-deps

  const session = sessionId ? progress.sessions.find((s) => s.id === sessionId) : undefined;
  if (!d || !session) return <div className="s3" aria-busy="true" />;
  return <SessionView key={session.id} data={d} session={session} origin={origin.current} />;
}

function SessionView({ data: d, session, origin }: { data: LanguageData; session: Session; origin: ReturnType<typeof lastMainRoute> }) {
  const { progress, updateProgress, deps, language } = useApp();
  const sheet = useSheet();
  const items = useMemo(() => session.itemIds.map((id) => d.byId.get(id)).filter((x): x is Item => !!x), [session.itemIds, d]);
  const N = items.length;
  const finished = session.completedAt !== undefined;
  const pos = Math.max(0, Math.min(session.position, N - 1));
  const step = session.step;
  const item = items[pos];

  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);
  // S3-05: gợi ý đã mở được lưu trong phiên, nên mở lại phiên vẫn biết câu này đã dùng gợi ý.
  const hinted = step === 'kiem-tra' && item !== undefined && session.hintedItemId === item.id;
  const leaving = useRef(false);

  useEffect(() => {
    setRevealed(false);
    setAnswered(false);
  }, [pos, step]);

  const results = sessionResults(progress, session);
  const cells: CellState[] = items.map((it, i) => {
    const r = results.perItem.get(it.id);
    if (!finished && i === pos) return 'dang';
    return r === 'nho' ? 'nho' : r === 'can-on' ? 'can-on' : 'chua';
  });

  const now = () => deps.now();

  const rate = (outcome: 'nho' | 'can-on') => {
    updateProgress((p) => moveTo(recordMemorize(p, session.id, item.id, outcome, now()), session.id, pos, 'kiem-tra'));
  };

  const next = () => {
    if (pos + 1 < N) updateProgress((p) => moveTo(p, session.id, pos + 1, 'ghi-nho'));
    else updateProgress((p) => completeSession(p, session.id, now()));
  };

  const exitTo = useCallback(() => {
    leaving.current = true;
    navigate(origin.name, origin.params);
  }, [origin]);

  // S3-07: xác nhận khi thoát giữa phiên.
  const confirmExit = useCallback(() => {
    if (sheet.isOpen) return;
    const doneCount = Math.min(session.position, N);
    sheet.open({
      title: 'Dừng phiên học?',
      kind: 'confirm',
      body: () => <p className="t-body">{doneCount > 0 ? `Bạn đã học ${doneCount}/${N} câu. Kết quả các câu này vẫn được lưu.` : 'Bạn chưa học xong câu nào.'}</p>,
      footer: (close) => (
        <>
          <Button variant="secondary" onClick={() => { close(); exitTo(); }}>
            Dừng
          </Button>
          <Button variant="primary" onClick={close}>
            Học tiếp
          </Button>
        </>
      ),
    });
  }, [sheet, session.position, N, exitTo]);

  // Nút Back của trình duyệt khi phiên chưa xong: giữ phiên và mở sheet xác nhận.
  useEffect(() => {
    if (finished) return;
    setLeaveGuard((to) => {
      // Liên kết "Cài đặt > Giọng đọc" (C1-05) rời phiên mà không hỏi: phiên vẫn mở lại được từ T1.
      if (leaving.current || to.name === 'phien-hoc' || to.name === 'cai-dat') return true;
      window.setTimeout(confirmExit, 0);
      return false;
    });
    return () => setLeaveGuard(null);
  }, [finished, confirmExit]);

  // S3-09: phím tắt.
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      // Giữ phím thì trình duyệt lặp sự kiện: bỏ qua lần lặp để một lần nhấn chỉ chấm một câu.
      if (sheet.isOpen || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape' && !finished) {
        e.preventDefault();
        confirmExit();
        return;
      }
      if (finished) return;
      if (step === 'ghi-nho') {
        if (e.key === ' ' && !revealed && !isInteractive(e.target)) {
          e.preventDefault();
          setRevealed(true);
        } else if (revealed && (e.key === '1' || e.key === '2')) {
          e.preventDefault();
          rate(e.key === '1' ? 'can-on' : 'nho');
        }
      } else if (e.key === 'Enter' && answered && !isInteractive(e.target)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  if (N === 0) return null;

  if (finished) return <Summary data={d} session={session} cells={cells} results={results} items={items} origin={origin} />;

  return (
    <div className="s3">
      {/* @spec FND-15: khi đang học S3 không vẽ tiêu đề, tiêu đề màn chỉ dành cho trình đọc màn hình. */}
      <h1 className="sr-only">Phiên học</h1>
      <header className="s3__bar">
        <button type="button" className="s3__exit" onClick={confirmExit}>
          <X size={24} aria-hidden />
          Thoát
        </button>
        <span className="t-body num">
          Câu {pos + 1}/{N}
        </span>
      </header>
      <div className="s3__body">
        <Strip cells={cells} />
        {step === 'ghi-nho' ? (
          <>
            <SentenceCard
              key={`m${item.id}`}
              item={item}
              lang={d.lang}
              locale={d.locale}
              langName={language?.name ?? ''}
              covered={!revealed}
              onReveal={() => setRevealed(true)}
              onOpenVoices={() => navigate('cai-dat', { giong: 1 })}
              className="s3__card"
              autoFocus
            />
            <RatePair locked={!revealed} onReview={() => rate('can-on')} onKnown={() => rate('nho')} />
          </>
        ) : (
          <CheckStep
            key={`c${item.id}`}
            data={d}
            item={item}
            hinted={hinted}
            answered={answered}
            keyboard={!sheet.isOpen}
            onHint={() => updateProgress((p) => markHinted(p, session.id, item.id))}
            onWrong={() => updateProgress((p) => recordCheck(p, session.id, item.id, false, hinted, now()))}
            onCorrect={() => {
              updateProgress((p) => recordCheck(p, session.id, item.id, true, hinted, now()));
              setAnswered(true);
            }}
            last={pos + 1 === N}
            onNext={next}
          />
        )}
      </div>
    </div>
  );
}

function CheckStep(props: {
  data: LanguageData;
  item: Item;
  hinted: boolean;
  answered: boolean;
  keyboard: boolean;
  last: boolean;
  onHint: () => void;
  onWrong: () => void;
  onCorrect: () => void;
  onNext: () => void;
}) {
  const { data: d, item, hinted, answered, keyboard, last } = props;
  const { language } = useApp();
  const choices = useMemo(() => buildChoices(d, item), [d, item]);
  const speaker = useSpeaker(item.en, d.lang, d.locale);
  const nextBtn = useRef<HTMLButtonElement>(null);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    box.current?.focus({ preventScroll: true });
  }, [item.id]);
  useEffect(() => {
    if (answered) nextBtn.current?.focus();
  }, [answered]);
  return (
    <div className="s3__check" ref={box} tabIndex={-1}>
      <p id="s3-q" className="t-body muted">
        Câu này nghĩa là gì?
      </p>
      <div className="s3__source">
        <SourceText item={item} lang={d.lang} size={sentenceSize(item.en)} />
        <AudioButton locked={speaker.noVoice || !speaker.ready} active={speaker.playing === 'once'} kind="once" onClick={() => speaker.toggle('once')} />
        {(speaker.noVoice || !speaker.ready) && (
          <NoVoice langName={language?.name ?? ''} onOpenVoices={() => navigate('cai-dat', { giong: 1 })} pending={!speaker.ready} />
        )}
      </div>
      {hinted && (
        <p className="s3__hint vi t-body" lang="vi" role="status">
          {hintText(item.vi)}
        </p>
      )}
      <Choices
        options={choices.map((c) => ({ key: c.itemId, text: c.text, correct: c.correct }))}
        onWrong={props.onWrong}
        onCorrect={props.onCorrect}
        keyboard={keyboard && !answered}
        labelledBy="s3-q"
      />
      <div className="s3__check-actions">
        {!hinted && !answered && (
          <Button variant="text" onClick={props.onHint}>
            Xem gợi ý
          </Button>
        )}
        {answered && (
          <Button ref={nextBtn} variant="primary" onClick={props.onNext}>
            {last ? 'Xem tổng kết' : 'Câu tiếp'}
          </Button>
        )}
      </div>
    </div>
  );
}

function Summary({
  data: d,
  session,
  cells,
  results,
  items,
  origin,
}: {
  data: LanguageData;
  session: Session;
  cells: CellState[];
  results: ReturnType<typeof sessionResults>;
  items: Item[];
  origin: ReturnType<typeof lastMainRoute>;
}) {
  const { progress } = useApp();
  const N = items.length;
  const reviewItems = results.reviewIds.map((id) => d.byId.get(id)!).filter(Boolean);
  const ui = nextUnitIndex(d, progress);
  const nextCount = ui === null ? 0 : Math.min(d.units[ui].ids.length, GROUP_SIZE);

  let primary: { label: string; go: () => void } | null = null;
  if (session.nguon === 'tu-khoa') {
    const k = Math.max(1, Number(session.params?.nhom) || 1);
    const g = sessionGroup('tu-khoa', { q: session.params?.q ?? '', nhom: String(k) }, d, progress, 0);
    if ((g.groupCount ?? 0) > k) primary = { label: 'Nhóm tiếp', go: () => navigate('phien-hoc', { nguon: 'tu-khoa', q: session.params?.q, nhom: k + 1 }) };
  }
  if (!primary && nextCount > 0) primary = { label: `Học tiếp ${nextCount} câu`, go: () => navigate('phien-hoc', { nguon: 'lo-trinh' }) };
  void origin;

  return (
    <div className="s3 s3--summary">
      <div className="s3__body">
        <h1 className="page-title s3__done-title">Xong phiên học</h1>
        <Strip cells={cells} />
        <p className="s3__score">
          <span className="t-3xl num">
            {results.cleanCount}/{N}
          </span>
          <span className="t-body muted">câu nhớ được không cần gợi ý</span>
        </p>
        {reviewItems.length > 0 && (
          <div className="s3__review">
            <h2 className="block-title s3__review-title">Cần ôn lại:</h2>
            <ul>
              {reviewItems.map((it) => (
                <li key={it.id} className="t-body src" lang={d.lang}>
                  {it.en}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="s3__summary-actions">
          {primary && (
            <Button variant="primary" onClick={primary.go}>
              {primary.label}
            </Button>
          )}
          <div className="s3__summary-links">
            <a className="btn btn--text" href={href('tien-bo')}>
              Xem tiến độ
            </a>
            <a className="btn btn--text" href={href('hoc')}>
              Xong
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
