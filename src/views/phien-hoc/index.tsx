'use client';
// @spec S3-01, S3-02, S3-03, S3-04, S3-05, S3-06, S3-07, S3-08, S3-09
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  GROUP_SIZE,
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
  type Item,
  type LanguageData,
  type Nguon,
  type Session,
} from '@/domain';
import { Choices } from '@/components/learning/choices';
import { RatePair } from '@/components/learning/rate-pair';
import { AudioButton, NoVoice, SentenceCard, SourceText } from '@/components/learning/sentence-card';
import { Strip, type CellState } from '@/components/learning/strip';
import { useSpeaker } from '@/components/learning/use-speaker';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { buttonClass } from '@/components/ui/button-class';
import { CardCustom } from '@/components/ui/card-custom';
import { SectionTitle } from '@/components/ui/page-header';
import { useSheet } from '@/components/ui/sheet';
import { useLanguageName } from '@/hooks/use-language-name';
import { useLearningData } from '@/hooks/use-learning-data';
import { useNav } from '@/hooks/use-nav';
import { useRoute } from '@/hooks/use-route';
import { leaveGuarded, setLeaveGuard } from '@/lib/nav-guard';
import { lastMainRoute, type Place } from '@/lib/route-memory';
import { href } from '@/lib/routes';
import { notify } from '@/lib/toast';
import { useLearning } from '@/providers/learning-provider';
import { hintParts } from './utils/hint';

const NGUON: Nguon[] = ['lo-trinh', 'on-tap', 'tu-khoa', 'cau', 'unit'];

const isInteractive = (t: EventTarget | null) => t instanceof HTMLElement && !!t.closest('button, a, input, select, textarea, [role="dialog"], [role="combobox"]');

export function PhienHocView() {
  const t = useTranslations('s3');
  const { params } = useRoute();
  const app = useLearningData();
  const { updateProgress, deps } = useLearning();
  const nav = useNav();
  // Khu chính đã mở trước khi vào phiên, để "Thoát" về đúng chỗ (lấy một lần khi mở màn).
  const [origin] = useState(lastMainRoute);
  const started = useRef<string | null>(null);
  const d = app?.d ?? null;
  const progress = app?.progress;
  // Phiên đang học là phiên ghi trong route (?phien=); phiên đã bị thay (bỏ dở) thì tạo phiên mới.
  const found = params.phien && progress ? progress.sessions.find((x) => x.id === params.phien) : undefined;
  const session = found && found.abandonedAt === undefined ? found : undefined;

  // S3-01, S3-08: mở lại phiên dở hoặc tạo phiên mới theo nguồn.
  useEffect(() => {
    if (!d || !progress) return;
    const key = JSON.stringify(params);
    if (session) {
      // Tab này đang hiện phiên của route: ghi nhận, để phiên bị thay sau đó thì không tự tạo phiên khác chồng lên.
      started.current = key;
      return;
    }
    if (started.current === key) {
      // Phiên đang mở ở tab này bị thay (tab khác hay máy khác bắt đầu phiên mới, S3-08): báo rồi về màn trước.
      if (found?.abandonedAt !== undefined) {
        notify(t('replaced'));
        nav(origin.name, origin.params, { replace: true, force: true });
      }
      return;
    }
    started.current = key;
    const nguon = (NGUON as string[]).includes(params.nguon) ? (params.nguon as Nguon) : 'lo-trinh';
    const g = sessionGroup(nguon, params, d, progress, deps.now());
    if (g.itemIds.length === 0) {
      notify(t('emptyGroup'));
      nav(origin.name, origin.params, { replace: true, force: true });
      return;
    }
    const rest: Record<string, string> = {};
    for (const k of ['q', 'nhom', 'id', 'so']) if (params[k]) rest[k] = params[k];
    let created: Session | undefined;
    updateProgress((p) => {
      const r = startSession(p, nguon, g.itemIds, rest, deps.now());
      created = r.session;
      return r.progress;
    });
    // Ghi id phiên vào route để tải lại trang thì mở lại đúng phiên.
    started.current = JSON.stringify({ nguon, ...rest, phien: created!.id });
    nav('phien-hoc', { nguon, ...rest, phien: created!.id }, { replace: true, force: true });
  }, [d, params, session]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!d || !session) return <div className="min-h-64" aria-busy="true" />;
  return <SessionView key={session.id} data={d} session={session} origin={origin} />;
}

function SessionView({ data: d, session, origin }: { data: LanguageData; session: Session; origin: Place }) {
  const t = useTranslations('s3');
  const { progress, updateProgress, deps, language } = useLearning();
  const name = useLanguageName();
  const sheet = useSheet();
  const nav = useNav();
  const items = useMemo(() => session.itemIds.map((id) => d.byId.get(id)).filter((x): x is Item => !!x), [session.itemIds, d]);
  const N = items.length;
  const finished = session.completedAt !== undefined;
  const pos = Math.max(0, Math.min(session.position, N - 1));
  const step = session.step;
  const item = items[pos];

  const [revealed, setRevealed] = useState(false);
  const [answered, setAnswered] = useState(false);
  // Sang câu khác hay bước khác thì che lại câu gốc và bỏ trạng thái đã trả lời.
  const stepKey = `${pos}.${step}`;
  const [shownStep, setShownStep] = useState(stepKey);
  if (shownStep !== stepKey) {
    setShownStep(stepKey);
    setRevealed(false);
    setAnswered(false);
  }
  // S3-05: gợi ý đã mở được lưu trong phiên, nên mở lại phiên vẫn biết câu này đã dùng gợi ý.
  const hinted = step === 'kiem-tra' && item !== undefined && session.hintedItemId === item.id;
  const leaving = useRef(false);

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
    leaveGuarded((replace) => nav(origin.name, origin.params, { force: true, replace }));
  }, [origin, nav]);

  // S3-07: xác nhận khi thoát giữa phiên.
  const confirmExit = useCallback(() => {
    if (sheet.isOpen) return;
    // Câu đang làm đã trả lời đúng ở bước kiểm tra (chưa bấm "Câu tiếp") cũng tính là đã học.
    const doneCount = Math.min(session.position + (step === 'kiem-tra' && answered ? 1 : 0), N);
    sheet.open({
      title: t('exitTitle'),
      kind: 'confirm',
      body: () => <p className="text-data">{doneCount > 0 ? t('exitBody', { done: doneCount, total: N }) : t('exitBodyNone')}</p>,
      footer: (close) => (
        <>
          <Button
            tone="outline"
            onClick={() => {
              close();
              exitTo();
            }}
          >
            {t('stop')}
          </Button>
          <Button tone="primary" onClick={close}>
            {t('keepGoing')}
          </Button>
        </>
      ),
    });
  }, [sheet, session.position, step, answered, N, exitTo, t]);

  // Back của trình duyệt, liên kết trên thanh bên khi phiên chưa xong: giữ phiên và mở sheet xác nhận.
  useEffect(() => {
    // Đang rời màn (đã xác nhận Dừng): không bật chặn lại khi sheet vừa đóng làm effect chạy lại.
    if (finished || leaving.current) return;
    setLeaveGuard((to) => {
      // Liên kết "Cài đặt > Giọng đọc" (C1-05) rời phiên mà không hỏi: phiên vẫn mở lại được từ T1.
      if (leaving.current || to.name === 'phien-hoc' || to.name === 'cai-dat') return true;
      window.setTimeout(confirmExit, 0);
      return false;
    });
    return () => setLeaveGuard(null);
  }, [finished, confirmExit]);

  // S3-09: phím tắt.
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => undefined);
  useEffect(() => {
    keyRef.current = (e: KeyboardEvent) => {
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
  });
  useEffect(() => {
    const on = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, []);

  if (N === 0) return null;

  if (finished) return <Summary data={d} session={session} cells={cells} results={results} items={items} />;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      {/* @spec FND-15: khi đang học S3 không vẽ tiêu đề, tiêu đề màn chỉ dành cho trình đọc màn hình. */}
      <h1 className="sr-only">{t('title')}</h1>
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-button px-2 text-sm font-semibold hover:bg-muted" onClick={confirmExit}>
          <X className="size-5" aria-hidden />
          {t('exit')}
        </button>
        <span className="num text-data">{t('position', { n: pos + 1, total: N })}</span>
      </div>
      <Strip cells={cells} />
      {step === 'ghi-nho' ? (
        <>
          <SentenceCard
            key={`m${item.id}`}
            item={item}
            lang={d.lang}
            locale={d.locale}
            langName={name(language, true)}
            covered={!revealed}
            onReveal={() => setRevealed(true)}
            onOpenVoices={() => nav('cai-dat', { giong: 1 })}
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
  const t = useTranslations('s3');
  const { data: d, item, hinted, answered, keyboard, last } = props;
  const { language } = useLearning();
  const name = useLanguageName();
  const nav = useNav();
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
  const hint = hintParts(item.vi);
  return (
    <div className="flex flex-col gap-4 focus:outline-none" ref={box} tabIndex={-1}>
      <p id="s3-q" className="text-description">
        {t('question')}
      </p>
      <CardCustom className="flex flex-col items-start gap-3 p-4 sm:p-6">
        <SourceText item={item} lang={d.lang} />
        <AudioButton locked={speaker.noVoice || !speaker.ready} active={speaker.playing === 'once'} kind="once" onClick={() => speaker.toggle('once')} />
        {(speaker.noVoice || !speaker.ready) && <NoVoice langName={name(language, true)} onOpenVoices={() => nav('cai-dat', { giong: 1 })} pending={!speaker.ready} />}
      </CardCustom>
      {hinted && (
        <p className="vi border-l-2 border-border px-4 py-3 text-data" lang="vi" role="status">
          {t('hint', hint)}
        </p>
      )}
      <Choices
        options={choices.map((c) => ({ key: c.itemId, text: c.text, correct: c.correct }))}
        onWrong={props.onWrong}
        onCorrect={props.onCorrect}
        keyboard={keyboard && !answered}
        labelledBy="s3-q"
      />
      <div className="flex min-h-12 items-center justify-between gap-3">
        {!hinted && !answered && (
          <Button tone="link" onClick={props.onHint}>
            {t('showHint')}
          </Button>
        )}
        {answered && (
          <Button ref={nextBtn} tone="primary" className="ml-auto" onClick={props.onNext}>
            {last ? t('seeSummary') : t('next')}
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
}: {
  data: LanguageData;
  session: Session;
  cells: CellState[];
  results: ReturnType<typeof sessionResults>;
  items: Item[];
}) {
  const t = useTranslations('s3');
  const { progress } = useLearning();
  const nav = useNav();
  const N = items.length;
  const reviewItems = results.reviewIds.map((id) => d.byId.get(id)!).filter(Boolean);
  const ui = nextUnitIndex(d, progress);
  const nextCount = ui === null ? 0 : Math.min(d.units[ui].ids.length, GROUP_SIZE);

  let primary: { label: string; go: () => void } | null = null;
  if (session.nguon === 'tu-khoa') {
    const k = Math.max(1, Number(session.params?.nhom) || 1);
    const g = sessionGroup('tu-khoa', { q: session.params?.q ?? '', nhom: String(k) }, d, progress, 0);
    if ((g.groupCount ?? 0) > k) primary = { label: t('nextGroup'), go: () => nav('phien-hoc', { nguon: 'tu-khoa', q: session.params?.q, nhom: k + 1 }) };
  }
  if (!primary && nextCount > 0) primary = { label: t('learnMore', { count: nextCount }), go: () => nav('phien-hoc', { nguon: 'lo-trinh' }) };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <h1 className="text-2xl font-bold">{t('doneTitle')}</h1>
      <CardCustom className="flex flex-col gap-4 sm:p-6">
        <Strip cells={cells} />
        <p className="flex flex-col gap-1">
          <span className="num text-display-lg font-bold">
            {results.cleanCount}/{N}
          </span>
          <span className="text-description">{t('score')}</span>
        </p>
      </CardCustom>
      {reviewItems.length > 0 && (
        <section className="flex flex-col gap-3" aria-labelledby="s3-review">
          <SectionTitle id="s3-review">{t('reviewTitle')}</SectionTitle>
          <CardCustom className="py-2">
            <ul className="divide-y divide-border">
              {reviewItems.map((it) => (
                <li key={it.id} className="src py-2 text-data" lang={d.lang}>
                  {it.en}
                </li>
              ))}
            </ul>
          </CardCustom>
        </section>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {primary && (
          <Button tone="primary" onClick={primary.go} blockOnMobile>
            {primary.label}
          </Button>
        )}
        <div className="flex gap-2">
          <AppLink className={buttonClass({ tone: 'link' })} href={href('tien-do')}>
            {t('seeProgress')}
          </AppLink>
          <AppLink className={buttonClass({ tone: 'link' })} href={href('hoc')}>
            {t('finish')}
          </AppLink>
        </div>
      </div>
    </div>
  );
}
