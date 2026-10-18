// @spec T2-01, T2-02, T2-03, T2-04, T2-05
import { useEffect, useMemo } from 'react';
import { CaretRight, MagnifyingGlass, X } from '@phosphor-icons/react';
import { Button } from '../../components/C3-nut/Button';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import { dueItemIds, formatCount, lowerFirst, nextUnitIndex, searchItems, type LanguageData } from '../../data';
import { navigate } from '../../app/router';
import { useApp } from '../../app/state';
import { createStore, useStore, type Store } from '../../app/hooks';
import { topicsByCount } from '../T3-thu-vien/filter';
import './t2.css';

const FIXED_CHIPS = ['đặt phòng', 'ăn uống', 'sân bay', 'mua sắm'];
const PREVIEW = 5;

export function T2LuyenTap() {
  const { data, progress, deps } = useApp();
  const sheet = useSheet();
  if (!data || data.status !== 'ready') return null;
  const d = data.value;
  const due = dueItemIds(progress, deps.now(), (id) => d.byId.has(id)).length;

  // T2-04: unit đang học trong lộ trình; học hết lộ trình thì unit cuối.
  const ui = nextUnitIndex(d, progress) ?? d.units.length - 1;
  const unitNumber = d.units[ui]?.number;

  const openKeyword = () => {
    const store = createStore({ input: '', q: '' });
    sheet.open({
      title: 'Học theo từ khóa',
      body: () => <KeywordBody d={d} store={store} />,
      footer: (close) => <KeywordFooter d={d} store={store} close={close} />,
    });
  };

  return (
    <section className="t2">
      <h1 className="t-lg t2__title">Luyện tập</h1>
      <ul className="t2__list">
        <li>
          <button
            type="button"
            className="t2__row"
            aria-disabled={due === 0 || undefined}
            onClick={() => {
              if (due > 0) navigate('phien-hoc', { nguon: 'on-tap' });
            }}
            data-testid="t2-on-tap"
          >
            <span className="t2__row-text">
              <span className="t2__name t-body">Ôn tập hôm nay</span>
              <span className="t-sm muted">{due > 0 ? 'Các câu đến hạn ôn hôm nay, gồm cả câu bạn chưa nhớ hoặc trả lời chưa đúng.' : 'Hôm nay không có câu nào cần ôn.'}</span>
            </span>
            {due > 0 && (
              <span className="t2__count t-body num" aria-label={`${due} câu`}>
                {due}
              </span>
            )}
            <CaretRight size={20} aria-hidden className="t2__caret" />
          </button>
        </li>
        <li>
          <button type="button" className="t2__row" aria-haspopup="dialog" onClick={openKeyword}>
            <span className="t2__row-text">
              <span className="t2__name t-body">Học theo từ khóa</span>
              <span className="t-sm muted">Tìm câu theo từ bạn cần, ví dụ đặt phòng, ăn uống, sân bay.</span>
            </span>
            <CaretRight size={20} aria-hidden className="t2__caret" />
          </button>
        </li>
        <li>
          <button type="button" className="t2__row" onClick={() => navigate('kiem-tra', { unit: unitNumber })}>
            <span className="t2__row-text">
              <span className="t2__name t-body">Kiểm tra nhanh</span>
              <span className="t-sm muted">Nghe và chọn nghĩa, nghe theo cụm, sắp xếp câu.</span>
            </span>
            <CaretRight size={20} aria-hidden className="t2__caret" />
          </button>
        </li>
      </ul>
    </section>
  );
}

type KeywordState = { input: string; q: string };

function KeywordBody({ d, store }: { d: LanguageData; store: Store<KeywordState> }) {
  const st = useStore(store);
  const { language } = useApp();
  // T2-03: cập nhật sau khi ngừng gõ 250 ms.
  useEffect(() => {
    if (st.input === st.q) return;
    const t = window.setTimeout(() => store.set({ q: st.input }), 250);
    return () => window.clearTimeout(t);
  }, [st.input, st.q, store]);

  const chips = useMemo(() => (d.hasTopic ? topicsByCount(d).slice(0, 6).map((t) => t.topic) : FIXED_CHIPS), [d]);
  const q = st.q.trim();
  const results = useMemo(() => (q ? searchItems(d, q) : []), [d, q]);

  return (
    <div className="kw">
      <div className="lib-search">
        <MagnifyingGlass size={20} aria-hidden className="lib-search__icon" />
        <input
          type="search"
          className="lib-search__input t-body"
          placeholder="Ví dụ: đặt phòng, sân bay"
          aria-label="Từ khóa"
          value={st.input}
          onChange={(e) => store.set({ input: e.target.value })}
        />
        {st.input && (
          <button type="button" className="lib-search__clear" aria-label="Xóa từ khóa" onClick={() => store.set({ input: '', q: '' })}>
            <X size={20} aria-hidden />
          </button>
        )}
      </div>
      <ul className="kw__chips" aria-label="Gợi ý">
        {chips.map((c) => (
          <li key={c}>
            <button type="button" className="chip t-sm" onClick={() => store.set({ input: c, q: c })}>
              {c}
            </button>
          </li>
        ))}
      </ul>
      {q &&
        (results.length === 0 ? (
          <p className="t-body kw__none" role="status">
            Không có câu nào chứa "{q}". Thử từ khác bằng tiếng Việt hoặc {lowerFirst(language?.name ?? 'ngôn ngữ đang học')}.
          </p>
        ) : (
          <>
            <p className="t-sm muted num" role="status">
              Tìm thấy {formatCount(results.length)} câu
            </p>
            <ul className="kw__preview">
              {results.slice(0, PREVIEW).map((it) => (
                <li key={it.id}>
                  <span className="src t-body" lang={d.lang}>
                    {it.en}
                  </span>
                  <span className="vi t-sm muted" lang="vi">
                    {it.vi}
                  </span>
                </li>
              ))}
            </ul>
          </>
        ))}
    </div>
  );
}

function KeywordFooter({ d, store, close }: { d: LanguageData; store: Store<KeywordState>; close: () => void }) {
  const st = useStore(store);
  // Nút theo chữ đang có trong ô (không chờ 250 ms), để không mở phiên bằng từ khóa cũ.
  const term = st.input.trim();
  const count = useMemo(() => (term ? searchItems(d, term).length : 0), [d, term]);
  return (
    <Button
      variant="primary"
      locked={count === 0}
      onClick={() => {
        close();
        navigate('phien-hoc', { nguon: 'tu-khoa', q: term, nhom: 1 });
      }}
    >
      {count > 0 && count < 8 ? `Học ${count} câu` : 'Học 8 câu đầu'}
    </Button>
  );
}
