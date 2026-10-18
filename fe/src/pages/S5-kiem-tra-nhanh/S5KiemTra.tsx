// @spec S5-01, S5-02, S5-03, S5-04, S5-05, S5-06, S5-07, S5-08, APP-03
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, SpeakerHigh, X } from '@phosphor-icons/react';
import { SourceText } from '../../components/C1-the-cau/SentenceCard';
import { useSpeaker } from '../../components/C1-the-cau/useSpeaker';
import { Button } from '../../components/C3-nut/Button';
import { Choices } from '../../components/C4-lua-chon/Choices';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import {
  abandonSession,
  buildChoices,
  chunkLabel,
  chunkSentence,
  completeSession,
  levelOf,
  lowerFirst,
  nextUnitIndex,
  recordCheck,
  shuffleOrder,
  startSession,
  type Item,
  type LanguageData,
  type Unit,
} from '../../data';
import { sentenceSize } from '../../foundation/typography';
import { navigate, setLeaveGuard } from '../../app/router';
import { useApp } from '../../app/state';
import { useSay } from '../../app/hooks';
import { voicesFor } from '../../app/speech';
import '../S3-phien-hoc/s3.css';
import './s5.css';

export type StepId = 'nghe-chon' | 'nghe-cum' | 'sap-xep';
export const ALL_STEPS: StepId[] = ['nghe-chon', 'nghe-cum', 'sap-xep'];
export const STEP_NAME: Record<StepId, string> = {
  'nghe-chon': 'Nghe và chọn nghĩa',
  'nghe-cum': 'Nghe theo cụm',
  'sap-xep': 'Sắp xếp câu',
};

/** S5-01: unit theo tham số `unit` (số unit), mặc định unit đang học; học hết lộ trình thì unit cuối. */
export function resolveUnit(d: LanguageData, p: ReturnType<typeof useApp>['progress'], param?: string): number {
  const byParam = param ? d.units.findIndex((u) => u.number === Number(param)) : -1;
  if (byParam >= 0) return byParam;
  return nextUnitIndex(d, p) ?? d.units.length - 1;
}

export function S5KiemTra({ params }: { params: Record<string, string> }) {
  const { data, progress } = useApp();
  if (!data || data.status !== 'ready') return null;
  const d = data.value;
  const ui = resolveUnit(d, progress, params.unit);
  const unit = d.units[ui];
  if (!unit) return null;
  return <TestView key={`${d.pack}.${d.lang}.${unit.number}`} d={d} unit={unit} unitIndex={ui} />;
}

const isInteractive = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('button, a, input, select, textarea, [role="dialog"]');

function TestView({ d, unit, unitIndex }: { d: LanguageData; unit: Unit; unitIndex: number }) {
  const { updateProgress, deps, progress } = useApp();
  const sheet = useSheet();
  const leaving = useRef(false);
  /** Route của bài đang làm; đổi sang route khác (kể cả unit khác qua nút Back) phải hỏi trước (S5-08). */
  const ownRoute = useRef(window.location.hash.replace(/^#/, ''));
  const items = useMemo(() => unit.ids.map((id) => d.byId.get(id)).filter((x): x is Item => !!x), [unit, d]);
  const chunks = useMemo(() => new Map(items.map((it) => [it.id, chunkSentence(it.en, d.lang)])), [items, d.lang]);
  const eligible = useCallback(
    (s: StepId) => (s === 'nghe-chon' ? items : items.filter((it) => (chunks.get(it.id)?.length ?? 0) >= 2)),
    [items, chunks],
  );

  const [phase, setPhase] = useState<'start' | 'run' | 'done'>('start');
  const [steps, setSteps] = useState<StepId[]>([]);
  const [si, setSi] = useState(0);
  const [pos, setPos] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [cumDone, setCumDone] = useState(0);

  const now = () => deps.now();

  const begin = (list: StepId[]) => {
    const run = list.filter((s) => eligible(s).length > 0);
    let id = '';
    updateProgress((p) => {
      const r = startSession(p, 'kiem-tra', items.map((it) => it.id), { unit: String(unit.number) }, now());
      id = r.session.id;
      return r.progress;
    });
    setSessionId(id);
    setSteps(run.length > 0 ? run : list);
    setSi(0);
    setPos(0);
    setAnswered(false);
    setCumDone(0);
    if (run.length === 0) {
      updateProgress((p) => completeSession(p, id, now()));
      setPhase('done');
    } else setPhase('run');
  };

  const step = steps[si];
  const stepItems = step ? eligible(step) : [];
  const item = stepItems[pos];

  const next = () => {
    if (step === 'nghe-cum') setCumDone((n) => n + 1);
    setAnswered(false);
    if (pos + 1 < stepItems.length) setPos(pos + 1);
    else if (si + 1 < steps.length) {
      setSi(si + 1);
      setPos(0);
    } else {
      updateProgress((p) => completeSession(p, sessionId!, now()));
      setPhase('done');
    }
  };

  // S5-08: Thoát ở màn bắt đầu và Dừng giữa chừng đều về T2 Luyện tập, như nút Xong (S5-07), kể cả khi mở S5 thẳng bằng đường dẫn.
  const leave = useCallback(() => {
    leaving.current = true;
    navigate('luyen-tap');
  }, []);

  // S5-08: thoát giữa chừng.
  const confirmExit = useCallback(() => {
    if (sheet.isOpen) return;
    sheet.open({
      title: 'Dừng kiểm tra?',
      kind: 'confirm',
      body: () => <p className="t-body">Kết quả các câu đã làm vẫn được lưu.</p>,
      footer: (close) => (
        <>
          <Button
            variant="secondary"
            onClick={() => {
              close();
              if (sessionId) updateProgress((p) => abandonSession(p, sessionId, deps.now()));
              leave();
            }}
          >
            Dừng
          </Button>
          <Button variant="primary" onClick={close}>
            Làm tiếp
          </Button>
        </>
      ),
    });
  }, [sheet, sessionId, updateProgress, deps, leave]);

  const running = phase === 'run';
  useEffect(() => {
    if (!running) return;
    setLeaveGuard((to) => {
      if (leaving.current || to.raw === ownRoute.current) return true;
      window.setTimeout(confirmExit, 0);
      return false;
    });
    return () => setLeaveGuard(null);
  }, [running, confirmExit]);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (sheet.isOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape' && running) {
        e.preventDefault();
        confirmExit();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  });

  const level = levelOf(d.byId.get(unit.ids[0]));

  if (phase === 'start') {
    return (
      <div className="s3 s5">
        <header className="s3__bar">
          <button type="button" className="s3__exit" onClick={leave}>
            <X size={24} aria-hidden />
            Thoát
          </button>
        </header>
        <div className="s3__body s5__start">
          <div className="s5__unit">
            <p className="t-sm muted">
              Kiểm tra nhanh · Unit {unit.number}
              {level ? ` · ${level}` : ''}
            </p>
            {unit.title && (
              <h1 className="t-lg s5__title src" lang={d.lang}>
                {unit.title}
              </h1>
            )}
            {unit.translation && (
              <p className="t-body vi muted" lang="vi">
                {unit.translation}
              </p>
            )}
            <p className="t-body num">{items.length} câu</p>
          </div>
          <ol className="s5__steps-desc">
            <li>
              <span className="t-body s5__step-name">1. Nghe và chọn nghĩa</span>
              <span className="t-sm muted">Nghe câu rồi chọn nghĩa đúng.</span>
            </li>
            <li>
              <span className="t-body s5__step-name">2. Nghe theo cụm</span>
              <span className="t-sm muted">Mở từng cụm của câu để nghe.</span>
            </li>
            <li>
              <span className="t-body s5__step-name">3. Sắp xếp câu</span>
              <span className="t-sm muted">Xếp các cụm theo đúng thứ tự.</span>
            </li>
          </ol>
          <div className="s5__start-actions">
            <Button variant="primary" onClick={() => begin(ALL_STEPS)}>
              Làm cả 3 bước
            </Button>
            <div className="s5__one">
              {ALL_STEPS.map((s) => (
                <Button key={s} variant="text" onClick={() => begin([s])}>
                  Chỉ {lowerFirst(STEP_NAME[s])}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'done') {
    const atts = progress.attempts.filter((a) => a.sessionId === sessionId);
    const firstRight = (kind: 'nghe-chon' | 'sap-xep') => atts.filter((a) => a.kind === kind && a.outcome === 'dung' && !a.hinted).length;
    const lines = steps.map((s) => {
      const n = eligible(s).length;
      const x = s === 'nghe-cum' ? Math.min(cumDone, n) : firstRight(s);
      return { s, text: `${STEP_NAME[s]}: ${x}/${n}` };
    });
    const tested = new Set(steps.flatMap((s) => eligible(s).map((it) => it.id))).size;
    const nextUnit = d.units[unitIndex + 1];
    return (
      <div className="s3 s3--summary s5">
        <div className="s3__body">
          <h1 className="t-lg s3__done-title">Xong kiểm tra</h1>
          <ul className="s5__result">
            {lines.map((l) => (
              <li key={l.s} className="t-body num">
                {l.text}
              </li>
            ))}
          </ul>
          <p className="t-body num">Đã kiểm tra {tested} câu.</p>
          <div className="s3__summary-actions">
            {nextUnit && (
              <Button variant="primary" onClick={() => navigate('kiem-tra', { unit: nextUnit.number })}>
                Kiểm tra unit tiếp theo
              </Button>
            )}
            <div className="s3__summary-links">
              <Button variant="text" onClick={() => navigate('luyen-tap')}>
                Xong
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!item || !step) return null;
  const record = (kind: 'nghe-chon' | 'sap-xep', correct: boolean) => updateProgress((p) => recordCheck(p, sessionId!, item.id, correct, false, now(), kind));

  return (
    <div className="s3 s5">
      <header className="s3__bar s5__bar">
        <button type="button" className="s3__exit" onClick={confirmExit}>
          <X size={24} aria-hidden />
          Thoát
        </button>
        <span className="t-body s5__bar-step">{STEP_NAME[step]}</span>
        <span className="t-body num s5__bar-count">
          Câu {pos + 1}/{stepItems.length}
        </span>
      </header>
      <div className="s3__body">
        <StepDots steps={steps} current={si} />
        {step === 'nghe-chon' && (
          <ListenChoose
            key={`c${item.id}`}
            d={d}
            item={item}
            answered={answered}
            keyboard={!sheet.isOpen}
            onWrong={() => record('nghe-chon', false)}
            onCorrect={() => {
              record('nghe-chon', true);
              setAnswered(true);
            }}
            onNext={next}
          />
        )}
        {step === 'nghe-cum' && <ListenChunks key={`m${item.id}`} d={d} item={item} chunks={chunks.get(item.id)!} onNext={next} />}
        {step === 'sap-xep' && (
          <Arrange key={`x${item.id}`} d={d} item={item} chunks={chunks.get(item.id)!} onFirstCheck={(ok) => record('sap-xep', ok)} onNext={next} />
        )}
      </div>
    </div>
  );
}

/** S5-02: chỉ báo bước. */
function StepDots({ steps, current }: { steps: StepId[]; current: number }) {
  return (
    <ol className="s5__dots" aria-label={`Bước ${current + 1}/${steps.length}`}>
      {steps.map((s, i) => {
        const state = i < current ? 'xong' : i === current ? 'dang' : 'chua';
        return (
          <li key={s} className={`s5__dot s5__dot--${state}`} data-state={state} aria-label={`${STEP_NAME[s]}, ${state === 'xong' ? 'đã xong' : state === 'dang' ? 'đang làm' : 'chưa làm'}`}>
            {state === 'xong' && <Check size={12} aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function useNextFocus(show: boolean) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (show) ref.current?.focus();
  }, [show]);
  return ref;
}

/** Enter để sang câu tiếp khi nút Câu tiếp đang hiện. */
function useEnterNext(show: boolean, onNext: () => void) {
  useEffect(() => {
    if (!show) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat && !isInteractive(e.target)) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [show, onNext]);
}

/** S5-03: nghe rồi chọn nghĩa. */
function ListenChoose(props: {
  d: LanguageData;
  item: Item;
  answered: boolean;
  keyboard: boolean;
  onWrong: () => void;
  onCorrect: () => void;
  onNext: () => void;
}) {
  const { d, item, answered } = props;
  const { voices, voicesReady } = useApp();
  const speaker = useSpeaker(item.en, d.lang, d.locale);
  const hasVoice = typeof window !== 'undefined' && 'speechSynthesis' in window && voicesFor(d.lang, voices).length > 0;
  const noVoice = voicesReady && !hasVoice;
  const choices = useMemo(() => buildChoices(d, item), [d, item]);
  const spoke = useRef(false);
  // Tự phát âm câu gốc một lần khi vào câu.
  useEffect(() => {
    if (spoke.current || !hasVoice) return;
    spoke.current = true;
    speaker.toggle('once');
  }, [hasVoice]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextBtn = useNextFocus(answered);
  useEnterNext(answered, props.onNext);
  const showText = answered || noVoice;

  // S5-03: chưa biết có giọng hay không (đang nạp danh sách giọng, tối đa 1,5 giây) thì chưa hiện câu hỏi và lựa chọn,
  // để khối nghe hoặc chữ câu gốc hiện ra sau không đẩy các lựa chọn xuống dưới tay người đang bấm.
  if (!voicesReady) return <div className="s5__task" data-item-id={item.id} aria-busy="true" />;

  return (
    <div className="s5__task" data-item-id={item.id}>
      {(hasVoice || showText) && (
        <div className="s5__listen">
          {hasVoice && (
            <button
              type="button"
              className="s5__replay"
              onClick={() => {
                speaker.stop();
                speaker.toggle('once');
              }}
            >
              <SpeakerHigh size={24} aria-hidden />
              <span>Nghe lại</span>
            </button>
          )}
          {showText && (
            <div className="s5__source" data-testid="s5-source">
              <SourceText item={item} lang={d.lang} size={sentenceSize(item.en)} />
            </div>
          )}
          {noVoice && <p className="t-sm muted">Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh.</p>}
        </div>
      )}
      <p id="s5-q" className="t-body muted">
        Câu bạn nghe nghĩa là gì?
      </p>
      <Choices
        options={choices.map((c) => ({ key: c.itemId, text: c.text, correct: c.correct }))}
        onWrong={props.onWrong}
        onCorrect={props.onCorrect}
        keyboard={props.keyboard && !answered}
        labelledBy="s5-q"
      />
      <div className="s3__check-actions">
        {answered && (
          <Button ref={nextBtn} variant="primary" onClick={props.onNext}>
            Câu tiếp
          </Button>
        )}
      </div>
    </div>
  );
}

/** S5-06: chỉ hiện nghĩa của cả câu. */
function Meaning({ item }: { item: Item }) {
  return (
    <p className="s5__meaning vi t-lg" lang="vi">
      {item.vi}
    </p>
  );
}

/** S5-04: nghe theo cụm. */
function ListenChunks({ d, item, chunks, onNext }: { d: LanguageData; item: Item; chunks: string[]; onNext: () => void }) {
  const say = useSay();
  const [open, setOpen] = useState<Set<number>>(new Set());
  const all = open.size === chunks.length;
  useEffect(() => {
    if (all) say(item.en, d.lang, d.locale);
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextBtn = useNextFocus(all);
  useEnterNext(all, onNext);
  return (
    <div className="s5__task" data-item-id={item.id}>
      <Meaning item={item} />
      <p className="t-body muted">Nhấn từng cụm để nghe.</p>
      <ul className="s5__chunks" lang={d.lang}>
        {chunks.map((c, i) => {
          const shown = open.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                className={`chunk ${shown ? 'chunk--open' : 'chunk--covered'}`}
                aria-label={shown ? chunkLabel(c) : `Cụm ${i + 1}, đang che`}
                onClick={() => {
                  setOpen((s) => new Set(s).add(i));
                  say(chunkLabel(c), d.lang, d.locale);
                }}
              >
                <span className={shown ? 'src t-body' : 't-sm muted'} lang={shown ? d.lang : 'vi'}>
                  {shown ? chunkLabel(c) : `Cụm ${i + 1}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="s3__check-actions">
        {all && (
          <Button ref={nextBtn} variant="primary" onClick={onNext}>
            Câu tiếp
          </Button>
        )}
      </div>
    </div>
  );
}

/** S5-05: sắp xếp câu. */
function Arrange({ d, item, chunks, onFirstCheck, onNext }: { d: LanguageData; item: Item; chunks: string[]; onFirstCheck: (ok: boolean) => void; onNext: () => void }) {
  const order = useMemo(() => shuffleOrder(chunks, `${d.pack}:${d.lang}:${item.id}`), [chunks, d.pack, d.lang, item.id]);
  const [answer, setAnswer] = useState<number[]>([]);
  const [result, setResult] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [wrongAt, setWrongAt] = useState<Set<number>>(new Set());
  const [live, setLive] = useState('');
  const reported = useRef(false);
  const full = answer.length === chunks.length;
  const right = result === 'right';
  const pool = order.filter((i) => !answer.includes(i));

  const change = (next: number[]) => {
    if (right) return;
    setAnswer(next);
    setResult('idle');
    setWrongAt(new Set());
  };
  const check = () => {
    const bad = new Set<number>();
    answer.forEach((idx, at) => {
      if (chunkLabel(chunks[idx]) !== chunkLabel(chunks[at])) bad.add(at);
    });
    const ok = bad.size === 0;
    if (!reported.current) {
      reported.current = true;
      onFirstCheck(ok);
    }
    setResult(ok ? 'right' : 'wrong');
    setWrongAt(bad);
    setLive(ok ? 'Đúng' : 'Chưa đúng. Nhấn các cụm có dấu x để đưa về hàng cụm, rồi xếp lại.');
  };
  const nextBtn = useNextFocus(right);
  useEnterNext(right, onNext);

  // S5-05: nút cụm vừa nhấn biến mất khỏi hàng của nó; nếu nó đang có focus thì chuyển focus sang cụm kế bên
  // (hoặc nút Kiểm tra khi đã xếp hết), để người dùng bàn phím không phải Tab lại từ đầu trang.
  const box = useRef<HTMLDivElement>(null);
  const refocus = useRef<{ zone: 'pool' | 'answer'; at: number } | null>(null);
  useEffect(() => {
    const r = refocus.current;
    const root = box.current;
    if (!r || !root) return;
    refocus.current = null;
    const pick = (sel: string) => [...root.querySelectorAll<HTMLElement>(sel)];
    const poolBtns = pick('[data-testid="s5-pool"] .chunk');
    const answerBtns = pick('[data-testid="s5-answer"] .chunk');
    const check = root.querySelector<HTMLElement>('.s3__check-actions button');
    const target =
      r.zone === 'pool'
        ? (poolBtns[Math.min(r.at, poolBtns.length - 1)] ?? check)
        : (answerBtns[Math.min(r.at, answerBtns.length - 1)] ?? poolBtns[0]);
    target?.focus();
  }, [answer]);
  const tap = (e: { currentTarget: HTMLElement }, zone: 'pool' | 'answer', at: number, next: number[]) => {
    if (e.currentTarget === document.activeElement) refocus.current = { zone, at };
    change(next);
  };

  return (
    <div className="s5__task" data-item-id={item.id} ref={box}>
      <Meaning item={item} />
      <div className={`s5__answer ${right ? 's5__answer--right' : ''}`} aria-label="Câu của bạn" role="group" data-testid="s5-answer">
        {answer.length === 0 ? (
          <span className="t-sm muted">Nhấn các cụm bên dưới theo đúng thứ tự.</span>
        ) : (
          answer.map((idx, at) => (
            <button
              key={idx}
              type="button"
              className={`chunk chunk--open ${wrongAt.has(at) ? 'chunk--wrong' : ''}`}
              aria-label={`${chunkLabel(chunks[idx])}${wrongAt.has(at) ? ', chưa đúng vị trí' : ''}`}
              data-wrong={wrongAt.has(at) ? 'true' : undefined}
              aria-disabled={right || undefined}
              onClick={(e) => tap(e, 'answer', at, answer.filter((x) => x !== idx))}
            >
              <span className="src t-body" lang={d.lang}>
                {chunkLabel(chunks[idx])}
              </span>
              {wrongAt.has(at) && <X size={16} aria-hidden className="chunk__mark" />}
            </button>
          ))
        )}
        {right && <Check size={24} aria-hidden className="s5__answer-mark" />}
      </div>
      <ul className="s5__chunks s5__pool" aria-label="Các cụm" data-testid="s5-pool">
        {pool.map((idx, at) => (
          <li key={idx}>
            <button type="button" className="chunk chunk--open" onClick={(e) => tap(e, 'pool', at, [...answer, idx])}>
              <span className="src t-body" lang={d.lang}>
                {chunkLabel(chunks[idx])}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className={`s5__feedback t-body ${result === 'wrong' ? 's5__feedback--wrong' : ''} ${right ? 's5__feedback--right' : ''}`} aria-live="polite" data-testid="s5-feedback">
        {result === 'idle' ? '' : live}
      </p>
      <div className="s3__check-actions">
        {right ? (
          <Button ref={nextBtn} variant="primary" onClick={onNext}>
            Câu tiếp
          </Button>
        ) : (
          <Button variant="primary" locked={!full} onClick={check}>
            Kiểm tra
          </Button>
        )}
      </div>
    </div>
  );
}
