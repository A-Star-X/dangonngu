// @spec T4-01, T4-02, T4-03, T4-04, T4-05, T4-06, T4-07, T4-08
import { useState } from 'react';
import { Strip, type CellState } from '../../components/C2-dai-8-o/Strip';
import { Button } from '../../components/C3-nut/Button';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import {
  RANGES,
  NGUON_LABEL,
  completedSessions,
  dailyCounts,
  dayEndOf,
  dayTitle,
  displayStatus,
  formatCount,
  hasCompletedSession,
  itemsLearned,
  parseRange,
  rangeDays,
  rangeStats,
  reviewSchedule,
  sessionResults,
  sessionsInLast7Days,
  sessionTime,
  startOfDay,
  weekdayShort,
  endOfDay,
  type LanguageData,
  type Progress,
  type RangeDays,
  type Session,
} from '../../data';
import { navigate } from '../../app/router';
import { useApp } from '../../app/state';
import { STATUS_LABEL } from '../T3-thu-vien/filter';
import './t4.css';

const PAGE = 20;

export function T4TienBo({ params }: { params: Record<string, string> }) {
  const { data, progress, deps, settings } = useApp();
  const sheet = useSheet();
  const [limit, setLimit] = useState(PAGE);
  if (!data || data.status !== 'ready') return null;
  const d = data.value;
  const now = deps.now();
  const k = parseRange(params.khoang);
  const valid = (id: number) => d.byId.has(id);

  const picker = (
    <div className="t4__range" role="group" aria-label="Khoảng thời gian">
      {RANGES.map((r) => (
        <button
          key={r}
          type="button"
          className="t4__range-btn t-sm"
          aria-pressed={r === k}
          onClick={() => {
            setLimit(PAGE);
            navigate('tien-bo', { khoang: r }, { replace: true });
          }}
        >
          {r} ngày
        </button>
      ))}
    </div>
  );

  const head = (
    <div className="t4__head">
      <h1 className="t-lg t4__title">Tiến độ</h1>
      {picker}
    </div>
  );

  // T4-08: chưa có phiên nào.
  if (!hasCompletedSession(progress)) {
    return (
      <section className="t4">
        {head}
        <div className="t4__empty">
          <p className="t-body">Bạn chưa hoàn thành phiên học nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến độ.</p>
          <Button variant="primary" onClick={() => navigate('phien-hoc', { nguon: 'lo-trinh' })}>
            Học 8 câu
          </Button>
        </div>
      </section>
    );
  }

  const stats = rangeStats(progress, now, k, valid);
  const done = sessionsInLast7Days(progress, now);
  const goal = settings.weeklyGoal;
  const reached = done >= goal;
  const schedule = reviewSchedule(progress, now, valid);
  const days = rangeDays(now, k);
  const sessions = completedSessions(progress, days[0], endOfDay(now));

  const openDay = (day: number) => {
    sheet.open({ title: dayTitle(day), body: () => <DayDetail d={d} day={day} /> });
  };

  return (
    <section className="t4">
      {head}
      <dl className="t4__stats">
        <div className="t4__stat">
          <dt className="t-sm muted">phiên học</dt>
          <dd className="t-xl num" data-testid="t4-sessions">
            {formatCount(stats.sessions)}
          </dd>
        </div>
        <div className="t4__stat">
          <dt className="t-sm muted">câu đã học</dt>
          <dd className="t-xl num" data-testid="t4-items">
            {formatCount(stats.items)}
          </dd>
        </div>
        <div className="t4__stat">
          <dt className="t-sm muted">câu cần ôn hôm nay</dt>
          <dd className="t-xl num" data-testid="t4-due">
            {formatCount(stats.dueToday)}
          </dd>
        </div>
      </dl>

      <div className="t4__goal">
        <p className="t-body t4__goal-text">
          <span>Mục tiêu mỗi tuần</span>
          <span className="num" data-testid="t4-goal">
            {done}/{goal} phiên
          </span>
        </p>
        <div
          className={`t4__bar ${reached ? 't4__bar--reached' : ''}`}
          role="progressbar"
          aria-label="Mục tiêu mỗi tuần"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.min(done, goal)}
          aria-valuetext={`${done}/${goal} phiên`}
        >
          <span className="t4__bar-fill" style={{ width: `${Math.min(100, (done / goal) * 100)}%` }} />
        </div>
      </div>

      {k > 1 && <Chart k={k} now={now} progress={progress} valid={valid} onOpenDay={openDay} />}

      <section className="t4__block" aria-labelledby="t4-schedule">
        <h2 id="t4-schedule" className="t-body t4__h2">
          Lịch ôn tập
        </h2>
        <dl className="t4__schedule">
          <div>
            <dt>Hôm nay</dt>
            <dd className="num" data-testid="t4-today">
              {formatCount(schedule.today)} câu
            </dd>
          </div>
          <div>
            <dt>Ngày mai</dt>
            <dd className="num" data-testid="t4-tomorrow">
              {formatCount(schedule.tomorrow)} câu
            </dd>
          </div>
          <div>
            <dt>7 ngày tới</dt>
            <dd className="num" data-testid="t4-next7">
              {formatCount(schedule.next7)} câu
            </dd>
          </div>
        </dl>
      </section>

      {sessions.length > 0 && (
        <section className="t4__block" aria-labelledby="t4-sessions">
          <h2 id="t4-sessions" className="t-body t4__h2">
            Các phiên học
          </h2>
          <SessionList sessions={sessions.slice(0, limit)} progress={progress} now={now} />
          {sessions.length > limit && (
            <Button variant="secondary" onClick={() => setLimit(limit + PAGE)}>
              Xem thêm
            </Button>
          )}
        </section>
      )}
    </section>
  );
}

/** T4-04: biểu đồ cột và bảng số liệu tương đương cho trình đọc màn hình. */
function Chart({ k, now, progress, valid, onOpenDay }: { k: RangeDays; now: number; progress: Progress; valid: (id: number) => boolean; onOpenDay: (day: number) => void }) {
  const counts = dailyCounts(progress, now, k, valid);
  const max = Math.max(1, ...counts.map((c) => c.count));
  const today = startOfDay(now);
  const label = (day: number, i: number) => {
    if (k === 7) return weekdayShort(day);
    return (k - 1 - i) % 5 === 0 ? String(new Date(day).getDate()) : '';
  };
  return (
    <section className="t4__block" aria-labelledby="t4-chart">
      <h2 id="t4-chart" className="t-body t4__h2">
        Số câu đã học mỗi ngày
      </h2>
      <div className={`chart chart--${k}`} data-testid="t4-chart">
        {counts.map((c, i) => {
          const isToday = c.day === today;
          return (
            <div key={c.day} className="chart__col" data-testid="t4-col">
              <div className="chart__plot">
                {c.count > 0 ? (
                  <button
                    type="button"
                    className={`chart__hit ${isToday ? 'is-today' : ''}`}
                    aria-label={`${dayTitle(c.day)}: ${c.count} câu`}
                    onClick={() => onOpenDay(c.day)}
                  >
                    <span className="chart__bar" style={{ height: `${(c.count / max) * 100}%` }} />
                  </button>
                ) : (
                  <span className="chart__dot" aria-hidden="true" />
                )}
              </div>
              <span className="chart__label t-sm muted num" aria-hidden="true">
                {label(c.day, i)}
              </span>
            </div>
          );
        })}
      </div>
      <table className="sr-only" data-testid="t4-table">
        <caption>Số câu đã học mỗi ngày</caption>
        <thead>
          <tr>
            <th scope="col">Ngày</th>
            <th scope="col">Số câu</th>
          </tr>
        </thead>
        <tbody>
          {counts.map((c) => (
            <tr key={c.day}>
              <th scope="row">{dayTitle(c.day)}</th>
              <td>{c.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function cellsOf(progress: Progress, s: Session): CellState[] {
  const r = sessionResults(progress, s);
  return s.itemIds.map((id) => {
    const x = r.perItem.get(id);
    return x === 'nho' ? 'nho' : x === 'can-on' ? 'can-on' : 'chua';
  });
}

/** T4-06: danh sách phiên. */
function SessionList({ sessions, progress, now }: { sessions: Session[]; progress: Progress; now: number }) {
  return (
    <ul className="t4__sessions" data-testid="t4-session-list">
      {sessions.map((s) => (
        <li key={s.id} className="t4__session">
          <span className="t-body num t4__session-time">{sessionTime(s.completedAt!, now)}</span>
          <span className="t-body t4__session-src">{NGUON_LABEL[s.nguon]}</span>
          <Strip cells={cellsOf(progress, s)} className="t4__strip" />
        </li>
      ))}
    </ul>
  );
}

/** T4-07: chi tiết một ngày. */
function DayDetail({ d, day }: { d: LanguageData; day: number }) {
  const { progress, deps } = useApp();
  const now = deps.now();
  const from = day;
  const to = dayEndOf(day);
  const sessions = completedSessions(progress, from, to);
  const ids = itemsLearned(progress, from, to, (id) => d.byId.has(id));
  return (
    <div className="t4__day">
      <h3 className="t-body t4__h2">Các phiên học</h3>
      <SessionList sessions={sessions} progress={progress} now={now} />
      <h3 className="t-body t4__h2">Câu đã học ({formatCount(ids.length)})</h3>
      <ul className="t4__day-items" data-testid="t4-day-items">
        {ids.map((id) => {
          const it = d.byId.get(id)!;
          return (
            <li key={id}>
              <span className="src t-body" lang={d.lang}>
                {it.en}
              </span>
              <span className="t-sm muted">{STATUS_LABEL[displayStatus(progress.items[id], now)]}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
