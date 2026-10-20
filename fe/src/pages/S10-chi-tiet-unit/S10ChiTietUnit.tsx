// @spec S10-01, S10-02, S10-03, S10-04, S10-05, S10-06, APP-14
import { useEffect } from 'react';
import { ArrowLeft, ArrowRight } from '@phosphor-icons/react';
import { Strip } from '../../components/C2-dai-8-o/Strip';
import { Button } from '../../components/C3-nut/Button';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import { displayStatus, unitCounts, unitLevel, type Item, type LanguageData, type Progress } from '../../data';
import { href, lastLibraryParams, navigate } from '../../app/router';
import { useApp } from '../../app/state';
import { Detail, StatusIcon, unitCells } from '../T3-thu-vien/T3ThuVien';
import { pad4 } from '../T3-thu-vien/filter';
import './s10.css';

export function S10ChiTietUnit({ params }: { params: Record<string, string> }) {
  const { data, progress, deps } = useApp();
  if (!data || data.status !== 'ready') return null;
  return <UnitDetail d={data.value} so={Number(params.so)} progress={progress} now={deps.now()} />;
}

function UnitDetail({ d, so, progress, now }: { d: LanguageData; so: number; progress: Progress; now: number }) {
  const sheet = useSheet();
  const ui = d.units.findIndex((u) => u.number === so);

  // S10-01: số unit không có trong dữ liệu thì về Thư viện, không thêm lịch sử.
  useEffect(() => {
    if (ui < 0) navigate('thu-vien', {}, { replace: true });
  }, [ui]);
  if (ui < 0) return null;

  const u = d.units[ui];
  const lv = unitLevel(d, u);
  const situation = d.byId.get(u.ids[0])?.situation;
  const c = unitCounts(u, progress, now);
  const counts = (
    [
      [c.daNho, 'Đã nhớ'],
      [c.canOn, 'Cần ôn'],
      [c.chuaHoc, 'Chưa học'],
    ] as const
  )
    .filter(([n]) => n > 0)
    .map(([n, label]) => `${label} ${n}`)
    .join(' · ');
  const prev = d.units[ui - 1];
  const next = d.units[ui + 1];

  const openItem = (it: Item) =>
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

  return (
    <section className="s10 page">
      <div className="page-head s10__head">
        {/* APP-14: đường dẫn; tên khu mở lại Thư viện đúng chỗ đã xem. */}
        <nav className="crumbs t-sm" aria-label="Đường dẫn">
          <ol>
            <li>
              <a className="crumbs__link" href={href('thu-vien', lastLibraryParams() ?? { xem: 'unit', 'trinh-do': lv })}>
                <ArrowLeft size={16} aria-hidden />
                Thư viện
              </a>
            </li>
            <li aria-current="page" className="muted">
              Unit {u.number}
              {lv ? ` · ${lv}` : ''}
            </li>
          </ol>
        </nav>
        {u.title ? (
          <h1 className="page-title src" lang={d.lang}>
            {u.title}
          </h1>
        ) : (
          <h1 className="page-title">Unit {u.number}</h1>
        )}
        {u.translation && (
          <p className="vi t-body muted" lang="vi">
            {u.translation}
          </p>
        )}
        {situation && (
          <p className="vi t-sm muted" lang="vi">
            {situation}
          </p>
        )}
      </div>

      <div className="s10__progress">
        <Strip cells={unitCells(u, progress, now)} />
        <p className="t-body num" data-testid="s10-counts">
          {counts}
        </p>
        <div className="s10__actions">
          <Button variant="primary" onClick={() => navigate('phien-hoc', { nguon: 'unit', so: u.number })}>
            {c.daNho === u.ids.length ? 'Ôn lại unit này' : 'Học unit này'}
          </Button>
          <Button variant="text" onClick={() => navigate('kiem-tra', { unit: u.number })}>
            Kiểm tra nhanh unit này
          </Button>
        </div>
      </div>

      <section className="block" aria-labelledby="s10-items">
        <h2 id="s10-items" className="block-title">
          Các câu trong unit
        </h2>
        <ul className="lib-list">
          {u.ids.map((id) => {
            const it = d.byId.get(id);
            if (!it) return null;
            return (
              <li key={id}>
                <button type="button" className="lib-row" onClick={() => openItem(it)} data-id={id}>
                  <span className="lib-row__id t-sm muted num">{pad4(id)}</span>
                  <span className="lib-row__text">
                    <span className="lib-row__src src t-body" lang={d.lang}>
                      {it.en}
                    </span>
                    <span className="lib-row__vi vi t-sm muted" lang="vi">
                      {it.vi}
                    </span>
                  </span>
                  <StatusIcon status={displayStatus(progress.items[id], now)} />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {(prev || next) && (
        <nav className="s10__nav" aria-label="Unit trước và sau">
          {prev ? (
            <a className="s10__link t-body" href={href('unit', { so: prev.number })}>
              <ArrowLeft size={20} aria-hidden />
              Unit {prev.number}
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a className="s10__link t-body" href={href('unit', { so: next.number })}>
              Unit {next.number}
              <ArrowRight size={20} aria-hidden />
            </a>
          )}
        </nav>
      )}
    </section>
  );
}
