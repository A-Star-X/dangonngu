// @spec T3-01, T3-02, T3-03, T3-04, T3-05, T3-06, T3-07, DATA-04
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowCounterClockwise, CaretDown, Check, Circle, MagnifyingGlass, X } from '@phosphor-icons/react';
import { SentenceCard } from '../../components/C1-the-cau/SentenceCard';
import { Button } from '../../components/C3-nut/Button';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import { daysAgoText, displayStatus, formatCount, levelOf, type DisplayStatus, type Item, type LanguageData } from '../../data';
import { navigate } from '../../app/router';
import { useApp } from '../../app/state';
import { useDebounced, useMediaQuery } from '../../app/hooks';
import {
  PAGE_SIZE,
  STATUS_LABEL,
  filterLibrary,
  levelsIn,
  pad4,
  pageCount,
  topicsAlphabetical,
  type LibraryFilter,
  type StatusFilter,
} from './filter';
import './t3.css';

export function T3ThuVien({ params }: { params: Record<string, string> }) {
  const { data, progress, deps } = useApp();
  if (!data || data.status !== 'ready') return null;
  return <Library d={data.value} params={params} progress={progress} now={deps.now()} />;
}

function StatusIcon({ status, decorative }: { status: DisplayStatus; decorative?: boolean }) {
  const label = STATUS_LABEL[status];
  return (
    <span className={`lib-status lib-status--${status}`} title={decorative ? undefined : label} aria-hidden={decorative || undefined}>
      {status === 'chua-hoc' && <Circle size={20} aria-hidden />}
      {status === 'da-nho' && <Check size={20} aria-hidden />}
      {status === 'can-on' && <ArrowCounterClockwise size={20} aria-hidden />}
      {!decorative && <span className="sr-only">{label}</span>}
    </span>
  );
}

function Library({ d, params, progress, now }: { d: LanguageData; params: Record<string, string>; progress: ReturnType<typeof useApp>['progress']; now: number }) {
  const sheet = useSheet();
  const wide = useMediaQuery('(min-width: 900px)');
  const [input, setInput] = useState(params.q ?? '');
  const q = useDebounced(input, 250);
  const unit = params.unit && d.units.some((u) => u.number === Number(params.unit)) ? Number(params.unit) : null;
  const [status, setStatus] = useState<StatusFilter>('all');
  const [topic, setTopic] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<number | null>(null);
  const listTop = useRef<HTMLDivElement>(null);

  // T3-02: từ khóa giữ trong route (?q=).
  const sentQ = useRef(params.q ?? '');
  useEffect(() => {
    if ((params.q ?? '') !== q) {
      sentQ.current = q;
      navigate('thu-vien', { ...params, q: q || undefined }, { replace: true });
    }
  }, [q]); // eslint-disable-line react-hooks/exhaustive-deps
  // Route đổi từ chỗ khác (ví dụ chạm lại tab Thư viện): ô tìm theo route.
  useEffect(() => {
    const pq = params.q ?? '';
    if (pq !== sentQ.current) {
      sentQ.current = pq;
      setInput(pq);
    }
  }, [params.q]);

  const setUnit = (n: number | null) => navigate('thu-vien', { ...params, q: q || undefined, unit: n ?? undefined }, { replace: true });

  const filter: LibraryFilter = { q, unit, status, topic, level };
  const results = useMemo(() => filterLibrary(d, progress, now, filter), [d, progress, now, q, unit, status, topic, level]); // eslint-disable-line react-hooks/exhaustive-deps
  const pages = pageCount(results.length);

  // T3-04: đổi từ khóa hoặc bộ lọc thì về trang 1.
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setPage(1);
    setSelected(null);
  }, [q, unit, status, topic, level]);

  const cur = Math.min(page, pages);
  const pageItems = results.slice((cur - 1) * PAGE_SIZE, cur * PAGE_SIZE);
  const detailItem = wide ? (pageItems.find((it) => it.id === selected) ?? pageItems[0]) : undefined;

  const goPage = (n: number) => {
    setPage(n);
    setSelected(null);
    listTop.current?.scrollIntoView?.({ block: 'start' });
  };

  const clearAll = () => {
    setInput('');
    setStatus('all');
    setTopic(null);
    setLevel(null);
    navigate('thu-vien', {}, { replace: true });
  };

  const openDetail = (it: Item) => {
    if (wide) {
      setSelected(it.id);
      return;
    }
    sheet.open({
      title: `Câu ${pad4(it.id)}`,
      body: () => <Detail d={d} id={it.id} />,
      footer: (close) => (
        <Button
          variant="primary"
          onClick={() => {
            close();
            navigate('phien-hoc', { nguon: 'cau', id: it.id });
          }}
        >
          Học câu này
        </Button>
      ),
    });
  };

  const unitObj = unit !== null ? d.units.find((u) => u.number === unit) : undefined;
  const filters = (
    <div className="lib-filters">
      <FilterButton
        label="Unit"
        value={unitObj ? `Unit ${unitObj.number}${unitObj.title ? `: ${unitObj.title}` : ''}` : null}
        onClick={() =>
          sheet.open({
            title: 'Unit',
            body: (close) => (
              <OptionList
                current={unit === null ? 'all' : String(unit)}
                options={[{ key: 'all', label: 'Tất cả' }, ...d.units.map((u) => ({ key: String(u.number), label: `Unit ${u.number}${u.title ? `: ${u.title}` : ''}`, lang: d.lang }))]}
                onPick={(k) => {
                  close();
                  setUnit(k === 'all' ? null : Number(k));
                }}
              />
            ),
          })
        }
      />
      <FilterButton
        label="Trạng thái"
        value={status === 'all' ? null : STATUS_LABEL[status]}
        onClick={() =>
          sheet.open({
            title: 'Trạng thái',
            body: (close) => (
              <OptionList
                current={status}
                options={[
                  { key: 'all', label: 'Tất cả' },
                  { key: 'chua-hoc', label: 'Chưa học' },
                  { key: 'da-nho', label: 'Đã nhớ' },
                  { key: 'can-on', label: 'Cần ôn' },
                ]}
                onPick={(k) => {
                  close();
                  setStatus(k as StatusFilter);
                }}
              />
            ),
          })
        }
      />
      {d.hasTopic && (
        <FilterButton
          label="Chủ đề"
          value={topic}
          onClick={() =>
            sheet.open({
              title: 'Chủ đề',
              body: (close) => (
                <TopicList
                  d={d}
                  current={topic}
                  onPick={(t) => {
                    close();
                    setTopic(t);
                  }}
                />
              ),
            })
          }
        />
      )}
      {d.hasLevel && (
        <FilterButton
          label="Trình độ"
          value={level}
          onClick={() =>
            sheet.open({
              title: 'Trình độ',
              body: (close) => (
                <OptionList
                  current={level ?? 'all'}
                  options={[{ key: 'all', label: 'Tất cả' }, ...levelsIn(d).map((l) => ({ key: l, label: l }))]}
                  onPick={(k) => {
                    close();
                    setLevel(k === 'all' ? null : k);
                  }}
                />
              ),
            })
          }
        />
      )}
    </div>
  );

  return (
    <section className={`t3 ${wide ? 't3--wide' : ''}`}>
      {/* @spec FND-15: T3 không vẽ tiêu đề, tiêu đề màn chỉ dành cho trình đọc màn hình. */}
      <h1 className="sr-only">Thư viện</h1>
      <div className="t3__list-col">
        <div className="lib-search">
          <MagnifyingGlass size={20} aria-hidden className="lib-search__icon" />
          <input
            type="search"
            className="lib-search__input t-body"
            placeholder="Tìm câu hoặc nghĩa"
            aria-label="Tìm câu hoặc nghĩa"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {input && (
            <button type="button" className="lib-search__clear" aria-label="Xóa từ khóa" onClick={() => setInput('')}>
              <X size={20} aria-hidden />
            </button>
          )}
        </div>
        {filters}
        <div ref={listTop} className="lib-count t-sm muted num" aria-live="polite">
          {formatCount(results.length)} câu
        </div>
        {results.length === 0 ? (
          <div className="lib-empty">
            <p className="t-body">Không có câu nào khớp với tìm kiếm và bộ lọc hiện tại.</p>
            <Button variant="secondary" onClick={clearAll}>
              Xóa tìm kiếm và bộ lọc
            </Button>
          </div>
        ) : (
          <ul className="lib-list">
            {pageItems.map((it) => (
              <li key={it.id}>
                <button
                  type="button"
                  className={`lib-row ${detailItem?.id === it.id ? 'is-selected' : ''}`}
                  aria-current={detailItem?.id === it.id ? 'true' : undefined}
                  onClick={() => openDetail(it)}
                  data-id={it.id}
                >
                  <span className="lib-row__id t-sm muted num">{pad4(it.id)}</span>
                  <span className="lib-row__text">
                    <span className="lib-row__src src t-body" lang={d.lang}>
                      {it.en}
                    </span>
                    <span className="lib-row__vi vi t-sm muted" lang="vi">
                      {it.vi}
                    </span>
                  </span>
                  <StatusIcon status={displayStatus(progress.items[it.id], now)} />
                </button>
              </li>
            ))}
          </ul>
        )}
        {pages > 1 && (
          <nav className="pager" aria-label="Phân trang">
            <Button variant="secondary" locked={cur === 1} onClick={() => goPage(cur - 1)}>
              Trước
            </Button>
            <span className="t-sm num">
              Trang {cur}/{pages}
            </span>
            <Button variant="secondary" locked={cur === pages} onClick={() => goPage(cur + 1)}>
              Sau
            </Button>
          </nav>
        )}
      </div>
      {wide && detailItem && (
        <aside className="t3__detail-col" aria-label="Chi tiết câu">
          <h2 className="block-title t3__detail-title">Câu {pad4(detailItem.id)}</h2>
          <Detail d={d} id={detailItem.id} />
          <Button variant="primary" onClick={() => navigate('phien-hoc', { nguon: 'cau', id: detailItem.id })}>
            Học câu này
          </Button>
        </aside>
      )}
    </section>
  );
}

function FilterButton({ label, value, onClick }: { label: string; value: string | null; onClick: () => void }) {
  return (
    <button
      type="button"
      className={`lib-filter t-sm ${value ? 'is-active' : ''}`}
      aria-haspopup="dialog"
      aria-label={value ? `${label}: ${value}` : label}
      onClick={onClick}
    >
      <span className="lib-filter__text">{value ?? label}</span>
      <CaretDown size={16} aria-hidden />
    </button>
  );
}

interface Option {
  key: string;
  label: string;
  hint?: string;
  lang?: string;
}

function OptionList({ options, current, onPick }: { options: Option[]; current: string; onPick: (key: string) => void }) {
  return (
    <ul className="opt-list">
      {options.map((o) => (
        <li key={o.key}>
          <button type="button" className="opt-row" aria-pressed={o.key === current} onClick={() => onPick(o.key)}>
            <span className="opt-row__label t-body" lang={o.lang}>
              {o.label}
            </span>
            {o.hint && <span className="t-sm muted num">{o.hint}</span>}
            {o.key === current && <Check size={20} aria-hidden className="opt-row__check" />}
          </button>
        </li>
      ))}
    </ul>
  );
}

function TopicList({ d, current, onPick }: { d: LanguageData; current: string | null; onPick: (t: string | null) => void }) {
  const [find, setFind] = useState('');
  const all = useMemo(() => topicsAlphabetical(d), [d]);
  const f = find.trim().toLocaleLowerCase('vi');
  const shown = f ? all.filter((t) => t.topic.toLocaleLowerCase('vi').includes(f)) : all;
  return (
    <div className="topic-list">
      <input
        type="search"
        className="lib-search__input lib-search__input--plain t-body"
        placeholder="Tìm chủ đề"
        aria-label="Tìm chủ đề"
        value={find}
        onChange={(e) => setFind(e.target.value)}
      />
      <OptionList
        current={current ?? 'all'}
        options={[{ key: 'all', label: 'Tất cả' }, ...shown.map((t) => ({ key: t.topic, label: t.topic, hint: `${formatCount(t.count)} câu` }))]}
        onPick={(k) => onPick(k === 'all' ? null : k)}
      />
    </div>
  );
}

/** T3-05: nội dung chi tiết câu (dùng trong sheet và ở cột phải từ 900 px). */
function Detail({ d, id }: { d: LanguageData; id: number }) {
  const { progress, deps, language } = useApp();
  const it = d.byId.get(id);
  if (!it) return null;
  const now = deps.now();
  const ui = d.unitIndexOf.get(id);
  const u = ui !== undefined ? d.units[ui] : undefined;
  const state = progress.items[id];
  const st = displayStatus(state, now);
  const level = levelOf(it);
  return (
    <div className="lib-detail">
      <SentenceCard item={it} lang={d.lang} locale={d.locale} langName={language?.name ?? ''} onOpenVoices={() => navigate('cai-dat', { giong: 1 })} />
      {u && (
        <p className="t-body">
          Unit {u.number}
          {level ? ` · ${level}` : ''}
          {u.title ? (
            <>
              {': '}
              <span className="src" lang={d.lang}>
                {u.title}
              </span>
            </>
          ) : null}
        </p>
      )}
      <p className="lib-detail__status t-body">
        <StatusIcon status={st} decorative />
        <span>{state ? `${STATUS_LABEL[st]} · Học lần cuối: ${daysAgoText(state.lastAt, now)}` : 'Chưa học'}</span>
      </p>
    </div>
  );
}
