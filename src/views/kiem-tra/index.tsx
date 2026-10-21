'use client';
// @spec S5-01, S5-02, S5-03, S5-04, S5-05, S5-06, S5-07, S5-08, S5-09
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Volume2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  ALL_STEPS,
  abandonSession,
  buildChoices,
  chunkLabel,
  chunkSentence,
  completeSession,
  isStepId,
  levelOf,
  moveTest,
  openTest,
  recordCheck,
  resolveUnit,
  shuffleOrder,
  startSession,
  type Item,
  type LanguageData,
  type Session,
  type StepId,
  type Unit,
} from '@/domain';
import { Choices } from '@/components/learning/choices';
import { SourceText } from '@/components/learning/sentence-card';
import { useSpeaker } from '@/components/learning/use-speaker';
import { Button } from '@/components/ui/button';
import { CardCustom } from '@/components/ui/card-custom';
import { SectionTitle } from '@/components/ui/page-header';
import { useSheet } from '@/components/ui/sheet';
import { useLearningData } from '@/hooks/use-learning-data';
import { useNav } from '@/hooks/use-nav';
import { useRoute } from '@/hooks/use-route';
import { useSay } from '@/hooks/use-say';
import { leaveGuarded, setLeaveGuard } from '@/lib/nav-guard';
import { voicesFor } from '@/lib/speech';
import { cn } from '@/lib/utils';
import { useLearning } from '@/providers/learning-provider';

const isInteractive = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('button, a, input, select, textarea, [role="dialog"], [role="combobox"]');

export function KiemTraView() {
  const { params } = useRoute();
  const app = useLearningData();
  if (!app) return null;
  const { d, progress } = app;
  const ui = resolveUnit(d, progress, params.unit);
  const unit = d.units[ui];
  if (!unit) return null;
  return <TestView key={`${d.pack}.${d.lang}.${unit.number}`} d={d} unit={unit} unitIndex={ui} resumeNow={params.tiep === '1'} />;
}

const exitBtn = '-ml-2 inline-flex min-h-11 items-center gap-2 rounded-button px-2 text-sm font-semibold hover:bg-muted';

function TestView({ d, unit, unitIndex, resumeNow }: { d: LanguageData; unit: Unit; unitIndex: number; resumeNow: boolean }) {
  const t = useTranslations('s5');
  const { updateProgress, deps, progress } = useLearning();
  const route = useRoute();
  const say = useSay();
  const sheet = useSheet();
  const nav = useNav();
  const leaving = useRef(false);
  /** Route của bài đang làm; đổi sang route khác (kể cả unit khác qua nút Back) phải hỏi trước (S5-08). */
  const ownRoute = useRef(route.raw);
  const items = useMemo(() => unit.ids.map((id) => d.byId.get(id)).filter((x): x is Item => !!x), [unit, d]);
  const chunks = useMemo(() => new Map(items.map((it) => [it.id, chunkSentence(it.en, d.lang)])), [items, d.lang]);
  const eligible = useCallback((s: StepId) => (s === 'nghe-chon' ? items : items.filter((it) => (chunks.get(it.id)?.length ?? 0) >= 2)), [items, chunks]);

  const [phase, setPhase] = useState<'start' | 'run' | 'done'>('start');
  const [steps, setSteps] = useState<StepId[]>([]);
  const [si, setSi] = useState(0);
  const [pos, setPos] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [cumDone, setCumDone] = useState(0);

  const now = () => deps.now();

  // S5-09: bài dở của đúng unit này.
  const paused = (() => {
    const s = openTest(progress);
    return s && s.params?.unit === String(unit.number) ? s : undefined;
  })();

  const begin = (list: StepId[]) => {
    const run = list.filter((s) => eligible(s).length > 0);
    let id = '';
    updateProgress((p) => {
      const r = startSession(p, 'kiem-tra', items.map((it) => it.id), { unit: String(unit.number), buoc: run.join(','), buocSo: '0' }, now());
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

  /** S5-09: mở lại bài dở ở đúng bước và câu; số câu Nghe theo cụm đã làm tính lại từ vị trí. */
  const resume = (s: Session) => {
    const run = (s.params?.buoc ?? '').split(',').filter((x): x is StepId => isStepId(x) && eligible(x).length > 0);
    if (run.length === 0) return begin(ALL_STEPS);
    const i = Math.min(Number(s.params?.buocSo) || 0, run.length - 1);
    const at = Math.max(0, Math.min(s.position, eligible(run[i]).length - 1));
    const ci = run.indexOf('nghe-cum');
    setSessionId(s.id);
    setSteps(run);
    setSi(i);
    setPos(at);
    setAnswered(false);
    setCumDone(ci < 0 || ci > i ? 0 : ci < i ? eligible('nghe-cum').length : at);
    setPhase('run');
  };

  const resumed = useRef(false);
  useEffect(() => {
    if (resumed.current || !resumeNow || !paused) return;
    resumed.current = true;
    resume(paused);
  });

  const step = steps[si];
  const stepItems = step ? eligible(step) : [];
  const item = stepItems[pos];

  const next = () => {
    if (step === 'nghe-cum') setCumDone((n) => n + 1);
    setAnswered(false);
    let ns = si;
    let np = pos + 1;
    if (np >= stepItems.length) {
      ns = si + 1;
      np = 0;
    }
    if (ns >= steps.length) {
      updateProgress((p) => completeSession(p, sessionId!, now()));
      setPhase('done');
      return;
    }
    setSi(ns);
    setPos(np);
    // S5-09: lưu bước và câu đang làm sau mỗi câu.
    updateProgress((p) => moveTest(p, sessionId!, ns, np));
  };

  // S5-08: Thoát ở màn bắt đầu và Dừng giữa chừng đều về T2 Luyện tập, như nút Xong (S5-07).
  const leave = useCallback(() => {
    leaving.current = true;
    leaveGuarded((replace) => nav('luyen-tap', undefined, { force: true, replace }));
  }, [nav]);

  // S5-08: tạm dừng giữa chừng; bài dở đã được lưu sau mỗi câu (S5-09).
  const confirmExit = useCallback(() => {
    if (sheet.isOpen) return;
    sheet.open({
      title: t('pauseTitle'),
      kind: 'confirm',
      body: () => <p className="text-data">{t('pauseBody')}</p>,
      footer: (close) => (
        <>
          <Button
            tone="outline"
            onClick={() => {
              close();
              leave();
            }}
          >
            {t('pause')}
          </Button>
          <Button tone="primary" onClick={close}>
            {t('resume')}
          </Button>
        </>
      ),
    });
  }, [sheet, leave, t]);

  const running = phase === 'run';
  useEffect(() => {
    // Đang rời màn (đã xác nhận Tạm dừng): không bật chặn lại khi sheet vừa đóng làm effect chạy lại.
    if (!running || leaving.current) return;
    setLeaveGuard((to) => {
      if (leaving.current || to.raw === ownRoute.current) return true;
      window.setTimeout(confirmExit, 0);
      return false;
    });
    return () => setLeaveGuard(null);
  }, [running, confirmExit]);

  const escRef = useRef<(e: KeyboardEvent) => void>(() => undefined);
  useEffect(() => {
    escRef.current = (e: KeyboardEvent) => {
      if (sheet.isOpen || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Escape' && running) {
        e.preventDefault();
        confirmExit();
      }
    };
  });
  useEffect(() => {
    const on = (e: KeyboardEvent) => escRef.current(e);
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  const level = levelOf(d.byId.get(unit.ids[0]));

  if (phase === 'start') {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <div>
          <button type="button" className={exitBtn} onClick={leave}>
            <X className="size-5" aria-hidden />
            {t('exit')}
          </button>
        </div>
        <CardCustom className="flex flex-col gap-1 sm:p-6">
          <p className="text-label text-muted-foreground">
            {t('unitLine', { n: unit.number })}
            {level ? ` · ${level}` : ''}
          </p>
          {unit.title ? (
            <h1 className="src text-xl font-semibold" lang={d.lang}>
              {unit.title}
            </h1>
          ) : (
            <h1 className="sr-only">{t('title')}</h1>
          )}
          {unit.translation && (
            <p className="vi text-base text-muted-foreground" lang="vi">
              {unit.translation}
            </p>
          )}
          <p className="num mt-2 text-data">{t('itemCount', { count: items.length })}</p>
        </CardCustom>
        <ol className="flex flex-col divide-y divide-border">
          {ALL_STEPS.map((s, i) => (
            <li key={s} className="flex flex-col gap-1 py-3">
              <span className="text-base font-semibold">
                {i + 1}. {t(`step.${s}`)}
              </span>
              <span className="text-description">{t(`stepDesc.${s}`)}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-col items-stretch gap-3 sm:items-start">
          {paused ? (
            <>
              <Button tone="primary" onClick={() => resume(paused)} blockOnMobile>
                {t('resume')}
              </Button>
              <Button tone="link" className="self-start" onClick={() => updateProgress((p) => abandonSession(p, paused.id, now()))}>
                {t('restart')}
              </Button>
            </>
          ) : (
            <Button tone="primary" onClick={() => begin(ALL_STEPS)} blockOnMobile>
              {t('allSteps')}
            </Button>
          )}
          <div className="flex flex-col items-start gap-1 sm:flex-row sm:flex-wrap sm:gap-3">
            {ALL_STEPS.map((s) => (
              <Button key={s} tone="link" onClick={() => begin([s])}>
                {t('onlyStep', { step: t(`stepInline.${s}`) })}
              </Button>
            ))}
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
      return { s, text: t('resultLine', { step: t(`step.${s}`), n: x, total: n }) };
    });
    const tested = new Set(steps.flatMap((s) => eligible(s).map((it) => it.id))).size;
    // S5-07: câu sai ngay lần đầu ở bước 1 hoặc bước 3, theo thứ tự trong unit.
    const review = items.filter((it) => (['nghe-chon', 'sap-xep'] as const).some((k) => atts.find((a) => a.itemId === it.id && a.kind === k)?.outcome === 'sai'));
    const nextUnit = d.units[unitIndex + 1];
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
        <h1 className="text-2xl font-bold">{t('doneTitle')}</h1>
        <CardCustom className="flex flex-col sm:p-6">
          <ul className="flex flex-col divide-y divide-border" data-testid="s5-result">
            {lines.map((l) => (
              <li key={l.s} className="num py-3 text-data">
                {l.text}
              </li>
            ))}
          </ul>
          <p className="num pt-3 text-description">{t('tested', { count: tested })}</p>
        </CardCustom>
        {review.length > 0 && (
          <section className="flex flex-col gap-3" aria-labelledby="s5-review">
            <SectionTitle id="s5-review">{t('reviewTitle')}</SectionTitle>
            <CardCustom className="py-1">
              <ul className="divide-y divide-border">
                {review.map((it) => (
                  <li key={it.id} className="flex items-center justify-between gap-3 py-3">
                    <span className="flex min-w-0 flex-col gap-1 [overflow-wrap:anywhere]">
                      <span className="src text-data" lang={d.lang}>
                        {it.en}
                      </span>
                      <span className="vi text-sm text-muted-foreground" lang="vi">
                        {it.vi}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="inline-flex min-h-11 flex-none items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold hover:border-muted-foreground"
                      onClick={() => say(it.en, d.lang, d.locale)}
                      aria-label={t('listenTo', { text: it.en })}
                    >
                      <Volume2 className="size-5" aria-hidden />
                      {t('listen')}
                    </button>
                  </li>
                ))}
              </ul>
            </CardCustom>
          </section>
        )}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {nextUnit && (
            <Button tone="primary" onClick={() => nav('kiem-tra', { unit: nextUnit.number })} blockOnMobile>
              {t('nextUnit')}
            </Button>
          )}
          <Button tone="link" onClick={() => nav('luyen-tap')}>
            {t('finish')}
          </Button>
        </div>
      </div>
    );
  }

  if (!item || !step) return null;
  const record = (kind: 'nghe-chon' | 'sap-xep', correct: boolean) => updateProgress((p) => recordCheck(p, sessionId!, item.id, correct, false, now(), kind));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* @spec FND-15: khi đang làm bài S5 không vẽ tiêu đề, tiêu đề màn chỉ dành cho trình đọc màn hình. */}
      <h1 className="sr-only">{t('title')}</h1>
      <div className="flex items-center justify-between gap-2">
        <button type="button" className={exitBtn} onClick={confirmExit}>
          <X className="size-5" aria-hidden />
          {t('exit')}
        </button>
        <span className="min-w-0 flex-1 text-center text-base leading-tight font-semibold text-balance" data-testid="s5-step-name">
          {t(`step.${step}`)}
        </span>
        <span className="num flex-none text-data">{t('position', { n: pos + 1, total: stepItems.length })}</span>
      </div>
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
      {step === 'sap-xep' && <Arrange key={`x${item.id}`} d={d} item={item} chunks={chunks.get(item.id)!} onFirstCheck={(ok) => record('sap-xep', ok)} onNext={next} />}
    </div>
  );
}

/** S5-02: chỉ báo bước. */
function StepDots({ steps, current }: { steps: StepId[]; current: number }) {
  const t = useTranslations('s5');
  return (
    <ol className="relative flex items-center gap-8 self-start before:absolute before:top-1/2 before:right-2 before:left-2 before:h-0.5 before:-translate-y-1/2 before:bg-border" aria-label={t('dots', { n: current + 1, total: steps.length })}>
      {steps.map((s, i) => {
        const state = i < current ? 'xong' : i === current ? 'dang' : 'chua';
        return (
          <li
            key={s}
            className={cn(
              'relative inline-flex size-4 items-center justify-center rounded-full border-2',
              state === 'xong' && 'border-foreground bg-foreground text-background',
              state === 'dang' && 'border-foreground bg-card after:size-1.5 after:rounded-full after:bg-foreground',
              state === 'chua' && 'border-border bg-background',
            )}
            data-state={state}
            aria-label={t('dot', { step: t(`step.${s}`), state: t(`dotState.${state}`) })}
          >
            {state === 'xong' && <Check className="size-3" aria-hidden />}
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

const actionsRow = 'flex min-h-12 items-center justify-end gap-3';

/** S5-03: nghe rồi chọn nghĩa. */
function ListenChoose(props: { d: LanguageData; item: Item; answered: boolean; keyboard: boolean; onWrong: () => void; onCorrect: () => void; onNext: () => void }) {
  const t = useTranslations('s5');
  const { d, item, answered } = props;
  const { voices, voicesReady } = useLearning();
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
  if (!voicesReady) return <div className="flex flex-col gap-4" data-item-id={item.id} aria-busy="true" />;

  return (
    <div className="flex flex-col gap-4" data-item-id={item.id}>
      {(hasVoice || showText) && (
        <CardCustom className="flex flex-col items-start gap-3 sm:p-6">
          {hasVoice && (
            <button
              type="button"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-border px-4 font-semibold hover:border-muted-foreground"
              onClick={() => {
                speaker.stop();
                speaker.toggle('once');
              }}
            >
              <Volume2 className="size-5" aria-hidden />
              <span>{t('replay')}</span>
            </button>
          )}
          {showText && (
            <div className="w-full" data-testid="s5-source">
              {/* @spec C1-09: tô sáng chữ đang đọc khi nghe lại sau khi đã trả lời. */}
              <SourceText item={item} lang={d.lang} word={speaker.word} />
            </div>
          )}
          {noVoice && <p className="text-description">{t('noVoice')}</p>}
        </CardCustom>
      )}
      <p id="s5-q" className="text-description">
        {t('question')}
      </p>
      <Choices
        options={choices.map((c) => ({ key: c.itemId, text: c.text, correct: c.correct }))}
        onWrong={props.onWrong}
        onCorrect={props.onCorrect}
        keyboard={props.keyboard && !answered}
        labelledBy="s5-q"
      />
      <div className={actionsRow}>
        {answered && (
          <Button ref={nextBtn} tone="primary" onClick={props.onNext}>
            {t('next')}
          </Button>
        )}
      </div>
    </div>
  );
}

/** S5-06: chỉ hiện nghĩa của cả câu. */
function Meaning({ item }: { item: Item }) {
  return (
    <p className="vi text-lg text-foreground" lang="vi">
      {item.vi}
    </p>
  );
}

const chunkClass = 'inline-flex min-h-12 min-w-16 max-w-full items-center gap-1 rounded-button px-3 py-2 text-left text-foreground [overflow-wrap:anywhere]';

/** S5-04: nghe theo cụm. */
function ListenChunks({ d, item, chunks, onNext }: { d: LanguageData; item: Item; chunks: string[]; onNext: () => void }) {
  const t = useTranslations('s5');
  const say = useSay();
  const [open, setOpen] = useState<Set<number>>(new Set());
  const all = open.size === chunks.length;
  useEffect(() => {
    if (all) say(item.en, d.lang, d.locale);
  }, [all]); // eslint-disable-line react-hooks/exhaustive-deps
  const nextBtn = useNextFocus(all);
  useEnterNext(all, onNext);
  return (
    <div className="flex flex-col gap-4" data-item-id={item.id}>
      <Meaning item={item} />
      <p className="text-description">{t('tapChunks')}</p>
      <ul className="flex flex-wrap gap-2" lang={d.lang}>
        {chunks.map((c, i) => {
          const shown = open.has(i);
          return (
            <li key={i}>
              <button
                type="button"
                className={cn(chunkClass, shown ? 'border border-border bg-card' : 'border border-dashed border-muted-foreground bg-transparent')}
                data-state={shown ? 'open' : 'covered'}
                aria-label={shown ? chunkLabel(c) : t('chunkCovered', { n: i + 1 })}
                onClick={() => {
                  setOpen((s) => new Set(s).add(i));
                  say(chunkLabel(c), d.lang, d.locale);
                }}
              >
                <span className={shown ? 'src text-data' : 'text-sm text-muted-foreground'} lang={shown ? d.lang : 'vi'}>
                  {shown ? chunkLabel(c) : t('chunk', { n: i + 1 })}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className={actionsRow}>
        {all && (
          <Button ref={nextBtn} tone="primary" onClick={onNext}>
            {t('next')}
          </Button>
        )}
      </div>
    </div>
  );
}

/** S5-05: sắp xếp câu. */
function Arrange({ d, item, chunks, onFirstCheck, onNext }: { d: LanguageData; item: Item; chunks: string[]; onFirstCheck: (ok: boolean) => void; onNext: () => void }) {
  const t = useTranslations('s5');
  const order = useMemo(() => shuffleOrder(chunks, `${d.pack}:${d.lang}:${item.id}`), [chunks, d.pack, d.lang, item.id]);
  const [answer, setAnswer] = useState<number[]>([]);
  const [result, setResult] = useState<'idle' | 'right' | 'wrong'>('idle');
  const [wrongAt, setWrongAt] = useState<Set<number>>(new Set());
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
    const poolBtns = pick('[data-testid="s5-pool"] button');
    const answerBtns = pick('[data-testid="s5-answer"] button');
    const checkBtn = root.querySelector<HTMLElement>('[data-testid="s5-actions"] button');
    const target = r.zone === 'pool' ? (poolBtns[Math.min(r.at, poolBtns.length - 1)] ?? checkBtn) : (answerBtns[Math.min(r.at, answerBtns.length - 1)] ?? poolBtns[0]);
    target?.focus();
  }, [answer]);
  const tap = (e: { currentTarget: HTMLElement }, zone: 'pool' | 'answer', at: number, next: number[]) => {
    if (e.currentTarget === document.activeElement) refocus.current = { zone, at };
    change(next);
  };

  return (
    <div className="flex flex-col gap-4" data-item-id={item.id} ref={box}>
      <Meaning item={item} />
      <div
        className={cn('flex min-h-18 flex-wrap items-center gap-2 rounded-card border bg-background p-3', right ? 'border-2 border-success' : 'border-border')}
        aria-label={t('yourSentence')}
        role="group"
        data-testid="s5-answer"
      >
        {answer.length === 0 ? (
          <span className="text-description">{t('arrangeHint')}</span>
        ) : (
          answer.map((idx, at) => (
            <button
              key={idx}
              type="button"
              className={cn(chunkClass, wrongAt.has(at) ? 'border-2 border-danger bg-danger-soft' : 'border border-border bg-card')}
              aria-label={wrongAt.has(at) ? t('chunkWrong', { text: chunkLabel(chunks[idx]) }) : chunkLabel(chunks[idx])}
              data-wrong={wrongAt.has(at) ? 'true' : undefined}
              aria-disabled={right || undefined}
              onClick={(e) => tap(e, 'answer', at, answer.filter((x) => x !== idx))}
            >
              <span className="src text-data" lang={d.lang}>
                {chunkLabel(chunks[idx])}
              </span>
              {wrongAt.has(at) && <X className="size-4 flex-none text-danger" aria-hidden />}
            </button>
          ))
        )}
        {right && <Check className="ml-auto size-6 text-success" aria-hidden />}
      </div>
      <ul className="flex min-h-12 flex-wrap gap-2" aria-label={t('chunks')} data-testid="s5-pool">
        {pool.map((idx, at) => (
          <li key={idx}>
            <button type="button" className={cn(chunkClass, 'border border-border bg-card hover:border-muted-foreground')} onClick={(e) => tap(e, 'pool', at, [...answer, idx])}>
              <span className="src text-data" lang={d.lang}>
                {chunkLabel(chunks[idx])}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className={cn('mt-1 min-h-6 text-data font-semibold', result === 'wrong' && 'text-danger', right && 'text-success')} aria-live="polite" data-testid="s5-feedback">
        {result === 'idle' ? '' : right ? t('right') : t('wrong')}
      </p>
      <div className={actionsRow} data-testid="s5-actions">
        {right ? (
          <Button ref={nextBtn} tone="primary" onClick={onNext}>
            {t('next')}
          </Button>
        ) : (
          <Button tone="primary" locked={!full} onClick={check}>
            {t('check')}
          </Button>
        )}
      </div>
    </div>
  );
}
