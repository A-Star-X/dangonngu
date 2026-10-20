// @spec T1-01, T1-02, T1-03, T1-04, T1-05, T1-06, T1-07, T1-08, T1-09
import { CaretRight } from '@phosphor-icons/react';
import { SentenceCard } from '../../components/C1-the-cau/SentenceCard';
import type { CellState } from '../../components/C2-dai-8-o/Strip';
import { Button } from '../../components/C3-nut/Button';
import {
  displayStatus,
  dueItemIds,
  levelOf,
  nextItemId,
  nextUnitIndex,
  openSession,
  sessionsInLast7Days,
  formatCount,
  unitLearnState,
  GROUP_SIZE,
  lowerFirst,
  type LanguageData,
  type Progress,
} from '../../data';
import { href, navigate, useRoute } from '../../app/router';
import { useApp } from '../../app/state';
import { S9HuongDan } from '../S9-huong-dan/S9HuongDan';
import { UnitRow } from '../T3-thu-vien/T3ThuVien';
import './t1.css';

export function T1Hoc() {
  const app = useApp();
  const route = useRoute();
  const { data, progress, settings, language, deps } = app;
  if (!data || data.status !== 'ready' || !language) return null;
  const d = data.value;
  const now = deps.now();

  const ui = nextUnitIndex(d, progress);
  const itemId = nextItemId(d, progress);
  const done = ui === null || itemId === null;
  const reviewCount = dueItemIds(progress, now, (id) => d.byId.has(id)).length;
  const weekCount = sessionsInLast7Days(progress, now);
  const goal = settings.weeklyGoal;
  const open = openSession(progress);

  const startSession = () => {
    if (open) navigate('phien-hoc', { ...(open.params ?? {}), nguon: open.nguon, phien: open.id });
    else navigate('phien-hoc', { nguon: 'lo-trinh' });
  };

  // S9: hiện lần đầu sau khi chọn ngôn ngữ; mở lại từ S8 bằng ?huong-dan=1.
  const replay = route.params['huong-dan'] === '1';
  const showGuide = !done && (replay || !settings.guideSeen);

  const goalLine = (
    <p className="t1__goal t-body">
      {weekCount >= goal ? `Tuần này: đã đạt mục tiêu ${weekCount}/${goal} phiên` : `Tuần này: ${weekCount}/${goal} phiên`}
    </p>
  );
  const reviewLine =
    reviewCount > 0 ? (
      <a className="t1__review" href={href('phien-hoc', { nguon: 'on-tap' })}>
        <span>{reviewCount} câu cần ôn hôm nay</span>
        <CaretRight size={20} aria-hidden />
      </a>
    ) : null;

  if (done) {
    const total = d.items.length;
    return (
      <section className="t1 t1--done">
        <h1 className="sr-only">Học</h1>
        <div className="t1__goal-area">{goalLine}</div>
        <div className="t1__main">
          <p className="t-body">
            Bạn đã học hết {formatCount(total)} câu {lowerFirst(language.name)}. Vào Luyện tập để ôn lại.
          </p>
          <Button variant="primary" onClick={() => navigate('luyen-tap')}>
            Mở Luyện tập
          </Button>
        </div>
        {reviewLine && <div className="t1__review-area">{reviewLine}</div>}
        <OverallProgress d={d} progress={progress} />
      </section>
    );
  }

  const unit = d.units[ui];
  const item = d.byId.get(itemId)!;
  const firstOfUnit = d.byId.get(unit.ids[0]);
  const level = levelOf(firstOfUnit);
  const situation = firstOfUnit?.situation;
  const pos = unit.ids.indexOf(itemId);
  const cells: CellState[] = unit.ids.slice(0, GROUP_SIZE).map((id) => {
    if (id === itemId) return 'dang';
    const st = displayStatus(progress.items[id], now);
    return st === 'chua-hoc' ? 'chua' : st === 'can-on' ? 'can-on' : 'nho';
  });
  const n = Math.min(unit.ids.length, GROUP_SIZE);
  const remaining = open ? open.itemIds.length - open.position : 0;

  return (
    <section className="t1">
      {/* @spec FND-15: T1 không vẽ tiêu đề, tiêu đề màn chỉ dành cho trình đọc màn hình. */}
      <h1 className="sr-only">Học</h1>
      <div className="t1__main">
        <SentenceCard
          item={item}
          lang={d.lang}
          locale={d.locale}
          langName={language.name}
          strip={{ cells, label: `Câu ${pos + 1}/${n}` }}
          onOpenVoices={() => navigate('cai-dat', { giong: 1 })}
          header={
            <div className="t1__unit">
              <a className="t1__unit-link t-sm" href={href('unit', { so: unit.number })}>
                Unit {unit.number}
                {level ? ` · ${level}` : ''}
              </a>
              {unit.title && (
                <p className="t-body" lang={d.lang}>
                  <span className="src" lang={d.lang}>
                    {unit.title}
                  </span>
                </p>
              )}
              {unit.translation && (
                <p className="t-body vi muted" lang="vi">
                  {unit.translation}
                </p>
              )}
              {situation && (
                <p className="t1__situation vi t-sm muted" lang="vi">
                  {situation}
                </p>
              )}
            </div>
          }
        />
        <div data-guide="start" className="t1__start">
          <Button variant="primary" onClick={startSession}>
            {open ? `Tiếp tục: ${remaining} câu còn lại` : n === GROUP_SIZE ? 'Học 8 câu' : `Học ${n} câu`}
          </Button>
        </div>
      </div>
      <div className="t1__goal-area">{goalLine}</div>
      {reviewLine && <div className="t1__review-area">{reviewLine}</div>}
      <NextUnits d={d} progress={progress} now={now} from={ui + 1} />
      <OverallProgress d={d} progress={progress} />
      {showGuide && <S9HuongDan replay={replay} onStart={startSession} />}
    </section>
  );
}

/** T1-08: tối đa 3 unit ngay sau unit đang học. */
function NextUnits({ d, progress, now, from }: { d: LanguageData; progress: Progress; now: number; from: number }) {
  const units = d.units.slice(from, from + 3);
  if (units.length === 0) return null;
  return (
    <section className="t1__next block" aria-labelledby="t1-next">
      <h2 id="t1-next" className="block-title">
        Unit tiếp theo
      </h2>
      <ul className="t1__next-list">
        {units.map((u) => (
          <li key={u.number}>
            <UnitRow d={d} u={u} progress={progress} now={now} />
          </li>
        ))}
      </ul>
      <a className="t1__more t-body" href={href('thu-vien')}>
        Xem tất cả unit
        <CaretRight size={20} aria-hidden />
      </a>
    </section>
  );
}

/** T1-09: số câu đã qua bước ghi nhớ trên tổng số câu của bộ, số unit đã học. */
function OverallProgress({ d, progress }: { d: LanguageData; progress: Progress }) {
  const total = d.items.length;
  const learned = d.items.filter((it) => progress.items[it.id]?.status === 'da-hoc').length;
  const units = d.units.filter((u) => unitLearnState(u, progress) === 'da-hoc').length;
  return (
    <section className="t1__stats block" aria-labelledby="t1-stats">
      <h2 id="t1-stats" className="block-title">
        Tiến độ của bạn
      </h2>
      <p className="t-body num" data-testid="t1-learned">
        {formatCount(learned)}/{formatCount(total)} câu
      </p>
      <div
        className="t1__bar"
        role="progressbar"
        aria-label="Số câu đã học"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={learned}
        aria-valuetext={`${formatCount(learned)}/${formatCount(total)} câu`}
      >
        <span className="t1__bar-fill" style={{ width: `${total ? (learned / total) * 100 : 0}%` }} />
      </div>
      {units > 0 && (
        <p className="t-sm muted num" data-testid="t1-units">
          {formatCount(units)} unit đã học
        </p>
      )}
      <a className="t1__more t-body" href={href('tien-bo')}>
        Xem tiến độ
        <CaretRight size={20} aria-hidden />
      </a>
    </section>
  );
}
