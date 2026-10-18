// @spec S1-01, S1-02, S1-03, S1-04, S1-05, S1-06, S1-07, APP-12
import { useState } from 'react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { formatCount, lowerFirst, PACKS, type CatalogLanguage, type PackId } from '../../data';
import { HostBack } from '../../app/HostBack';
import { LangRowText } from '../../app/LanguageList';
import { LoadError, Skeleton } from '../../app/States';
import { navigate } from '../../app/router';
import { useApp } from '../../app/state';
import './s1.css';

export function S1ChonNgonNgu() {
  const { catalog, chooseLanguage, retryCatalog } = useApp();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<{ lang: string; pack: PackId } | null>(null);
  const [packStep, setPackStep] = useState<CatalogLanguage | null>(null);

  const pick = async (lang: string, pack: PackId) => {
    setBusy(`${pack}.${lang}`);
    setFailed(null);
    try {
      await chooseLanguage(lang, pack);
      navigate('hoc');
    } catch {
      setFailed({ lang, pack });
    } finally {
      setBusy(null);
    }
  };

  if (catalog.status === 'loading') {
    return (
      <div className="s1">
        <Skeleton shape="list" rows={6} />
      </div>
    );
  }
  if (catalog.status === 'error') {
    return (
      <div className="s1">
        <HostBack className="s1__host" />
        <LoadError onRetry={retryCatalog} />
      </div>
    );
  }

  if (failed) {
    return (
      <div className="s1">
        <LoadError onRetry={() => pick(failed.lang, failed.pack)} />
      </div>
    );
  }

  if (packStep) {
    const lang = packStep;
    return (
      <div className="s1">
        <button type="button" className="s1__back" onClick={() => setPackStep(null)} aria-disabled={busy ? true : undefined}>
          <CaretLeft size={24} aria-hidden />
          Quay lại
        </button>
        <h1 className="s1__title t-xl">Học {lowerFirst(lang.name)} với bộ nào?</h1>
        <ul className="s1__packs">
          {PACKS.filter((p) => lang.packs.includes(p.id)).map((p) => {
            const key = `${p.id}.${lang.id}`;
            return (
              <li key={p.id}>
                <button
                  type="button"
                  className="s1__pack"
                  aria-disabled={(busy && busy !== key) || undefined}
                  aria-busy={busy === key || undefined}
                  onClick={() => !busy && pick(lang.id, p.id)}
                >
                  <span className="s1__pack-text">
                    <span className="t-body s1__pack-name">{p.name}</span>
                    <span className="t-sm muted">{p.description}</span>
                  </span>
                  {busy === key ? <span className="lang-row__spinner" aria-label="Đang tải" /> : <CaretRight size={24} aria-hidden className="muted" />}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="t-sm muted s1__note">Bạn có thể đổi bộ sau ở thanh trên cùng hoặc trong Cài đặt.</p>
      </div>
    );
  }

  const [first, ...rest] = catalog.value.languages;
  const row = (l: CatalogLanguage) => {
    const multi = l.packs.length > 1;
    const key = `${l.packs[0]}.${l.id}`;
    return (
      <button
        type="button"
        className="lang-row"
        aria-disabled={(busy && busy !== key) || undefined}
        aria-busy={busy === key || undefined}
        onClick={() => {
          if (busy) return;
          if (multi) setPackStep(l);
          else pick(l.id, l.packs[0]);
        }}
      >
        <LangRowText lang={l} />
        {busy === key ? (
          <span className="lang-row__spinner" aria-label="Đang tải" />
        ) : multi ? (
          <span className="s1__packs-count t-sm muted">
            {l.packs.length} bộ <CaretRight size={16} aria-hidden />
          </span>
        ) : l.count ? (
          <span className="t-sm muted num">{formatCount(l.count)}</span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="s1">
      <HostBack className="s1__host" />
      <p className="s1__brand t-body">VITASR</p>
      <h1 className="s1__title t-xl">Bạn muốn học ngôn ngữ nào?</h1>
      {first && <div className="s1__featured">{row(first)}</div>}
      <ul className="lang-list s1__list">
        {rest.map((l) => (
          <li key={l.id}>{row(l)}</li>
        ))}
      </ul>
      <p className="t-sm muted s1__note">Bạn có thể đổi ngôn ngữ sau ở thanh trên cùng hoặc trong Cài đặt.</p>
    </div>
  );
}
