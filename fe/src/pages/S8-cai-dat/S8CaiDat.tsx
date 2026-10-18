// @spec S8-01, S8-02, S8-03, S8-04, S8-05, S8-06
import { useEffect, useRef } from 'react';
import { CaretRight, Minus, Plus, SpeakerHigh } from '@phosphor-icons/react';
import { Button } from '../../components/C3-nut/Button';
import { useSheet } from '../../components/C6-sheet/SheetHost';
import { useToast } from '../../components/C7-thong-bao/ToastHost';
import { emptyProgress, exportFileName, lowerFirst, makeExport, MAX_IMPORT_BYTES, packInfo, parseImport, type Progress, type ThemeChoice } from '../../data';
import { navigate } from '../../app/router';
import { useApp } from '../../app/state';
import { useLanguageSheet } from '../../app/useLanguageSheet';
import { createStore, useStore, type Store } from '../../app/hooks';
import { autoVoice, speak, voicesFor } from '../../app/speech';
import './s8.css';

const RATES = [0.75, 1, 1.25];
const rateLabel = (r: number) => `${String(r).replace('.', ',')}x`;
const THEMES: { id: ThemeChoice; label: string }[] = [
  { id: 'system', label: 'Theo thiết bị' },
  { id: 'light', label: 'Sáng' },
  { id: 'dark', label: 'Tối' },
];

/** Bọc sự kiện tải file để test thay được. */
export const fileIO = {
  download(name: string, text: string) {
    const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
  read(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result ?? ''));
      r.onerror = () => reject(r.error);
      r.readAsText(file);
    });
  },
};

const sameName = (a: string, b: string) => a.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi') === b.normalize('NFC').trim().toLocaleLowerCase('vi');

export function S8CaiDat({ params }: { params: Record<string, string> }) {
  const app = useApp();
  const { settings, updateSettings, language, pack, voices, progress, updateProgress, deps } = app;
  const sheet = useSheet();
  const toast = useToast();
  const openLanguageSheet = useLanguageSheet();
  const fileInput = useRef<HTMLInputElement>(null);

  const openVoices = () => {
    sheet.open({
      title: 'Giọng đọc',
      body: () => <VoicesBody />,
      footer: (close) => (
        <Button variant="primary" onClick={close}>
          Xong
        </Button>
      ),
      onClose: () => {
        if (window.location.hash.includes('giong=1')) navigate('cai-dat', {}, { replace: true });
      },
    });
  };

  // C1-05: liên kết "Cài đặt > Giọng đọc" mở thẳng sheet Giọng đọc.
  useEffect(() => {
    if (params.giong === '1') openVoices();
  }, [params.giong]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!language || !pack) return null;
  const lang = language.id;
  const multi = language.packs.length > 1;
  /** Tên dùng trong câu xác nhận và câu báo lỗi nhập tiến độ (S8-05): kèm tên bộ khi ngôn ngữ có nhiều bộ. */
  const who = multi ? `${lowerFirst(language.name)} (${packInfo(pack).name})` : lowerFirst(language.name);
  const chosen = voices.find((v) => v.voiceURI === settings.voiceByLang[lang] && voicesFor(lang, [v]).length > 0);
  // Vùng giọng theo bộ nội dung đang học (Global English en-GB, English Fluency en-US), giống thẻ câu.
  const auto = autoVoice(lang, language.entries[pack]?.locale ?? language.locale, voices);

  const doExport = () => {
    const now = deps.now();
    fileIO.download(exportFileName(lang, now), JSON.stringify(makeExport(pack, lang, settings, progress, now), null, 2));
  };

  const onFile = async (file: File | undefined) => {
    if (fileInput.current) fileInput.current.value = '';
    if (!file) return;
    let text = '';
    // Tệp quá lớn thì không đọc vào bộ nhớ; coi như tệp sai (S8-05).
    if (file.size <= MAX_IMPORT_BYTES) {
      try {
        text = await fileIO.read(file);
      } catch {
        text = '';
      }
    }
    const p = parseImport(text, pack, lang);
    if (!p) {
      toast.show({ text: `Tệp này không phải tệp tiến độ học ${who} của VITASR. Chọn tệp đã xuất bằng Xuất tiến độ khi đang học ${who}.`, kind: 'alert' });
      return;
    }
    confirmImport(p);
  };

  const confirmImport = (p: Progress) => {
    sheet.open({
      title: 'Nhập tiến độ',
      kind: 'confirm',
      body: () => <p className="t-body">Thay tiến độ {who} hiện tại bằng tệp này?</p>,
      footer: (close) => (
        <>
          <Button variant="secondary" onClick={close}>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              close();
              updateProgress(() => p);
              toast.show({ text: 'Đã nhập tiến độ' });
            }}
          >
            Nhập tiến độ
          </Button>
        </>
      ),
    });
  };

  const confirmDelete = () => {
    const store = createStore({ typed: '' });
    sheet.open({
      title: `Xóa tiến độ ${lowerFirst(language.name)}`,
      kind: 'confirm',
      body: () => <DeleteBody name={language.name} store={store} />,
      footer: (close) => (
        <DeleteFooter
          name={language.name}
          store={store}
          close={close}
          onDelete={() => {
            updateProgress(() => emptyProgress());
            toast.show({ text: 'Đã xóa tiến độ' });
            navigate('hoc');
          }}
        />
      ),
    });
  };

  return (
    <section className="s8">
      <h1 className="t-lg s8__title">Cài đặt</h1>

      <section className="s8__group" aria-labelledby="s8-hoc">
        <h2 id="s8-hoc" className="t-sm muted s8__group-title">
          Học tập
        </h2>
        <ul className="s8__list">
          <li className="s8__row">
            <span className="s8__label" id="s8-goal">
              Mục tiêu mỗi tuần
            </span>
            <div className="stepper" role="group" aria-labelledby="s8-goal">
              <Button
                variant="secondary"
                className="stepper__btn"
                aria-label="Giảm mục tiêu"
                locked={settings.weeklyGoal <= 1}
                onClick={() => updateSettings((s) => ({ weeklyGoal: Math.max(1, s.weeklyGoal - 1) }))}
                icon={<Minus size={20} aria-hidden />}
              >
                {''}
              </Button>
              <span className="stepper__value t-body num" aria-live="polite" data-testid="s8-goal">
                {settings.weeklyGoal} phiên
              </span>
              <Button
                variant="secondary"
                className="stepper__btn"
                aria-label="Tăng mục tiêu"
                locked={settings.weeklyGoal >= 21}
                onClick={() => updateSettings((s) => ({ weeklyGoal: Math.min(21, s.weeklyGoal + 1) }))}
                icon={<Plus size={20} aria-hidden />}
              >
                {''}
              </Button>
            </div>
          </li>
          <li>
            <button type="button" className="s8__row s8__row--btn" aria-haspopup="dialog" onClick={openLanguageSheet}>
              <span className="s8__label">Ngôn ngữ đang học</span>
              <span className="s8__value">
                <span className="t-body">{language.name}</span>
                {multi && <span className="t-sm muted">{packInfo(pack).name}</span>}
              </span>
              <CaretRight size={20} aria-hidden className="s8__caret" />
            </button>
          </li>
        </ul>
      </section>

      <section className="s8__group" aria-labelledby="s8-am-thanh">
        <h2 id="s8-am-thanh" className="t-sm muted s8__group-title">
          Âm thanh
        </h2>
        <ul className="s8__list">
          <li>
            <button type="button" className="s8__row s8__row--btn" aria-haspopup="dialog" onClick={openVoices}>
              <span className="s8__label">Giọng đọc</span>
              <span className="s8__value t-body">{chosen ? chosen.name : auto ? `Tự động (${auto.name})` : 'Tự động'}</span>
              <CaretRight size={20} aria-hidden className="s8__caret" />
            </button>
          </li>
          {/* S8-03: "Âm thanh ngoại tuyến" chỉ hiện khi ngôn ngữ có gói âm thanh dựng sẵn; bản đầu chưa hỗ trợ tải gói nên không hiện. */}
        </ul>
      </section>

      <section className="s8__group" aria-labelledby="s8-giao-dien">
        <h2 id="s8-giao-dien" className="t-sm muted s8__group-title">
          Giao diện
        </h2>
        <div className="s8__list" role="radiogroup" aria-labelledby="s8-giao-dien">
          {THEMES.map((t) => (
            <label key={t.id} className="s8__row s8__radio">
              <span className="s8__label">{t.label}</span>
              <input type="radio" name="theme" checked={settings.theme === t.id} onChange={() => updateSettings({ theme: t.id })} />
            </label>
          ))}
        </div>
      </section>

      <section className="s8__group" aria-labelledby="s8-tien-do">
        <h2 id="s8-tien-do" className="t-sm muted s8__group-title">
          Tiến độ
        </h2>
        <ul className="s8__list">
          <li>
            <button type="button" className="s8__row s8__row--btn" onClick={doExport}>
              <span className="s8__label">Xuất tiến độ</span>
            </button>
          </li>
          <li>
            <button type="button" className="s8__row s8__row--btn" onClick={() => fileInput.current?.click()}>
              <span className="s8__label">Nhập tiến độ</span>
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="application/json,.json"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              data-testid="s8-import"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </li>
          <li>
            <button type="button" className="s8__row s8__row--btn" aria-haspopup="dialog" onClick={confirmDelete}>
              <span className="s8__label">Xóa tiến độ {lowerFirst(language.name)}</span>
            </button>
          </li>
        </ul>
      </section>

      <section className="s8__group" aria-labelledby="s8-tro-giup">
        <h2 id="s8-tro-giup" className="t-sm muted s8__group-title">
          Trợ giúp
        </h2>
        <ul className="s8__list">
          <li>
            <button type="button" className="s8__row s8__row--btn" onClick={() => navigate('hoc', { 'huong-dan': 1 })}>
              <span className="s8__label">Xem lại hướng dẫn</span>
              <CaretRight size={20} aria-hidden className="s8__caret" />
            </button>
          </li>
          <li className="s8__row">
            <span className="s8__label muted" data-testid="s8-version">
              Phiên bản {__APP_VERSION__}
            </span>
          </li>
        </ul>
      </section>
    </section>
  );
}

function DeleteBody({ name, store }: { name: string; store: Store<{ typed: string }> }) {
  const st = useStore(store);
  return (
    <div className="s8__confirm">
      <p className="t-body">
        Gõ "{name}" để xác nhận. Tiến độ đã xóa không lấy lại được.
      </p>
      <input
        type="text"
        className="lib-search__input lib-search__input--plain t-body"
        aria-label="Tên ngôn ngữ"
        autoComplete="off"
        value={st.typed}
        onChange={(e) => store.set({ typed: e.target.value })}
      />
    </div>
  );
}

function DeleteFooter({ name, store, close, onDelete }: { name: string; store: Store<{ typed: string }>; close: () => void; onDelete: () => void }) {
  const st = useStore(store);
  const ok = sameName(st.typed, name);
  return (
    <>
      <Button variant="secondary" onClick={close}>
        Hủy
      </Button>
      <Button
        variant="primary"
        locked={!ok}
        onClick={() => {
          close();
          onDelete();
        }}
      >
        Xóa
      </Button>
    </>
  );
}

/** S8-02: sheet Giọng đọc. */
function VoicesBody() {
  const { language, pack, settings, updateSettings, voices, voicesReady, data } = useApp();
  const store = useRef(createStore({ target: 'lang' as 'lang' | 'vi' })).current;
  const st = useStore(store);
  if (!language) return null;
  const code = st.target === 'lang' ? language.id : 'vi';
  const name = st.target === 'lang' ? language.name : 'Tiếng Việt';
  const list = voicesFor(code, voices);
  const chosen = settings.voiceByLang[code];
  const d = data?.status === 'ready' ? data.value : null;
  const sample = d?.items[0] ? (st.target === 'lang' ? d.items[0].en : d.items[0].vi) : language.name;
  const locale = st.target === 'lang' ? ((pack && language.entries[pack]?.locale) ?? language.locale) : 'vi-VN';
  const pick = (uri: string | undefined) =>
    updateSettings((s) => {
      const next = { ...s.voiceByLang };
      if (uri) next[code] = uri;
      else delete next[code];
      return { voiceByLang: next };
    });
  const test = (uri?: string) => speak({ text: sample, lang: code, locale, voiceURI: uri, rate: settings.rate });
  const isDefault = !chosen || !list.some((v) => v.voiceURI === chosen);
  // S8-02: "Tự động" ưu tiên giọng Google, rồi giọng chất lượng cao, rồi giọng mặc định của thiết bị.
  const auto = autoVoice(code, locale, voices);

  return (
    <div className="voices">
      <fieldset className="s8__fieldset">
        <legend className="t-sm muted">Chọn giọng cho</legend>
        <div className="seg" role="radiogroup">
          {(['lang', 'vi'] as const).map((t) => (
            <label key={t} className="seg__opt">
              <input type="radio" name="voice-target" checked={st.target === t} onChange={() => store.set({ target: t })} />
              <span>{t === 'lang' ? language.name : 'Tiếng Việt'}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {voicesReady && list.length === 0 ? (
        <p className="t-body" role="status">
          Thiết bị chưa có giọng {lowerFirst(name)}. Thêm giọng trong cài đặt hệ thống của thiết bị rồi mở lại app.
        </p>
      ) : (
        <ul className="voices__list" aria-label={`Giọng ${lowerFirst(name)}`}>
          <li className="voices__row">
            <label className="voices__pick">
              <input type="radio" name="voice" checked={isDefault} onChange={() => pick(undefined)} aria-label="Tự động" aria-describedby={auto ? 'voice-auto-name' : undefined} />
              <span className="voices__name">
                <span className="t-body">Tự động</span>
                {auto && (
                  <span id="voice-auto-name" className="t-sm muted">
                    Đang dùng {auto.name}
                  </span>
                )}
              </span>
            </label>
            <Button variant="text" icon={<SpeakerHigh size={20} aria-hidden />} onClick={() => test(undefined)} aria-label="Nghe thử giọng tự động">
              Nghe thử
            </Button>
          </li>
          {list.map((v) => (
            <li key={v.voiceURI} className="voices__row">
              <label className="voices__pick">
                <input type="radio" name="voice" checked={!isDefault && chosen === v.voiceURI} onChange={() => pick(v.voiceURI)} />
                <span className="voices__name">
                  <span className="t-body">{v.name}</span>
                  <span className="t-sm muted">{v.lang}</span>
                </span>
              </label>
              <Button variant="text" icon={<SpeakerHigh size={20} aria-hidden />} onClick={() => test(v.voiceURI)} aria-label={`Nghe thử ${v.name}`}>
                Nghe thử
              </Button>
            </li>
          ))}
        </ul>
      )}

      <fieldset className="s8__fieldset">
        <legend className="t-sm muted">Tốc độ đọc</legend>
        <div className="seg" role="radiogroup">
          {RATES.map((r) => (
            <label key={r} className="seg__opt">
              <input type="radio" name="rate" checked={settings.rate === r} onChange={() => updateSettings({ rate: r })} />
              <span className="num">{rateLabel(r)}</span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
