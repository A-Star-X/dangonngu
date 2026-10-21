'use client';
// @spec S8-01, S8-02, S8-04, S8-05, S8-06, S8-07, S8-08, APP-15, AU-05
import { useEffect, useRef, type ReactNode } from 'react';
import { ArrowLeft, ChevronRight, LogOut, Minus, Plus } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { MAX_IMPORT_BYTES, emptyProgress, exportFileName, makeExport, packInfo, parseImport, type Progress, type ThemeChoice } from '@/domain';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { useLanguageSheet } from '@/components/layout/language-sheet';
import { Button } from '@/components/ui/button';
import { CardCustom } from '@/components/ui/card-custom';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { PageHeader, SectionTitle } from '@/components/ui/page-header';
import { useSheet } from '@/components/ui/sheet';
import { useLanguageName } from '@/hooks/use-language-name';
import { useLearningData } from '@/hooks/use-learning-data';
import { useNav } from '@/hooks/use-nav';
import { useRoute } from '@/hooks/use-route';
import { settingsReturn } from '@/lib/route-memory';
import { autoVoice, voicesFor } from '@/lib/speech';
import { notify } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { DeleteForm } from './delete-form';
import { fileIO } from './utils/file-io';
import { VoicesBody } from './voices';

const rowClass = 'flex min-h-14 w-full items-center gap-3 py-2 text-left text-foreground';
const rowBtn = cn(rowClass, 'group');

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section className="flex min-w-0 flex-col gap-3" aria-labelledby={id}>
      <SectionTitle id={id}>{title}</SectionTitle>
      <CardCustom className="py-1">
        <ul className="divide-y divide-border">{children}</ul>
      </CardCustom>
    </section>
  );
}

export function CaiDatView() {
  const t = useTranslations('s8');
  const locale = useLocale();
  const name = useLanguageName();
  const { params } = useRoute();
  const app = useLearningData();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const sheet = useSheet();
  const nav = useNav();
  const openLanguageSheet = useLanguageSheet();
  const fileInput = useRef<HTMLInputElement>(null);

  const openVoices = () => {
    sheet.open({
      title: t('voices'),
      body: () => <VoicesBody locale={locale} />,
      footer: (close) => (
        <Button tone="primary" onClick={close}>
          {t('done')}
        </Button>
      ),
      onClose: () => {
        if (new URLSearchParams(window.location.search).get('giong') === '1') nav('cai-dat', {}, { replace: true, force: true });
      },
    });
  };

  // C1-05: liên kết "Cài đặt > Giọng đọc" mở thẳng sheet Giọng đọc.
  useEffect(() => {
    if (params.giong === '1') openVoices();
  }, [params.giong]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!app) return null;
  const { settings, updateSettings, language, pack, voices, progress, updateProgress, deps } = app;
  const lang = language.id;
  const multi = language.packs.length > 1;
  /** Tên dùng trong câu xác nhận và câu báo lỗi nhập tiến độ (S8-05): kèm tên bộ khi ngôn ngữ có nhiều bộ. */
  const who = multi ? `${name(language, true)} (${packInfo(pack).name})` : name(language, true);
  const chosen = voices.find((v) => v.voiceURI === settings.voiceByLang[lang] && voicesFor(lang, [v]).length > 0);
  // Vùng giọng theo bộ nội dung đang học (Global English en-GB, English Fluency en-US), giống thẻ câu.
  const auto = autoVoice(lang, language.entries[pack]?.locale ?? language.locale, voices);

  // Đọc màn trước lúc bấm: màn trước chỉ được ghi sau khi S8 đã vẽ lần đầu (trackRoute chạy trong effect của khung).
  const goBack = () => {
    const back = settingsReturn();
    nav(back.name, back.params);
  };

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
      notify(t('importInvalid', { who }), { kind: 'alert' });
      return;
    }
    confirmImport(p);
  };

  const confirmImport = (p: Progress) => {
    sheet.open({
      title: t('import'),
      kind: 'confirm',
      body: () => <p className="text-data">{t('importConfirm', { who })}</p>,
      footer: (close) => (
        <>
          <Button tone="outline" onClick={close}>
            {t('cancel')}
          </Button>
          <Button
            tone="primary"
            onClick={() => {
              close();
              // DATA-14: tệp nhập thay toàn bộ tiến độ cũ, kể cả bản trên tài khoản.
              updateProgress(() => ({ ...p, baseAt: deps.now() }));
              notify(t('imported'));
            }}
          >
            {t('import')}
          </Button>
        </>
      ),
    });
  };

  const confirmDelete = () => {
    sheet.open({
      title: t('deleteTitle', { lang: name(language, true) }),
      kind: 'confirm',
      body: (close) => (
        <DeleteForm
          name={name(language)}
          onCancel={close}
          onDelete={() => {
            close();
            updateProgress(() => ({ ...emptyProgress(), baseAt: deps.now() }));
            notify(t('deleted'));
            nav('hoc');
          }}
        />
      ),
    });
  };

  const themes: { value: ThemeChoice; label: string }[] = [
    { value: 'system', label: t('themeSystem') },
    { value: 'light', label: t('themeLight') },
    { value: 'dark', label: t('themeDark') },
  ];

  return (
    <section className="flex flex-col gap-4">
      <div>
        <Button tone="link" className="-ml-2" icon={<ArrowLeft className="size-4" aria-hidden />} onClick={goBack}>
          {t('back')}
        </Button>
      </div>
      <PageHeader title={t('title')} description={t('description')} />
      {/* S8-07: từ lg các nhóm xếp lưới hai cột, thứ tự đọc giữ nguyên. */}
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <Group id="s8-hoc" title={t('groupLearn')}>
          <li className={rowClass}>
            <span className="flex-1" id="s8-goal">
              {t('goal')}
            </span>
            <div className="flex items-center gap-2" role="group" aria-labelledby="s8-goal">
              <Button tone="outline" className="px-0" aria-label={t('goalDown')} locked={settings.weeklyGoal <= 1} onClick={() => updateSettings((s) => ({ weeklyGoal: Math.max(1, s.weeklyGoal - 1) }))} icon={<Minus className="size-4" aria-hidden />} />
              <span className="num min-w-18 text-center text-data" aria-live="polite" data-testid="s8-goal">
                {t('goalValue', { count: settings.weeklyGoal })}
              </span>
              <Button tone="outline" className="px-0" aria-label={t('goalUp')} locked={settings.weeklyGoal >= 21} onClick={() => updateSettings((s) => ({ weeklyGoal: Math.min(21, s.weeklyGoal + 1) }))} icon={<Plus className="size-4" aria-hidden />} />
            </div>
          </li>
          <li>
            <button type="button" className={rowBtn} aria-haspopup="dialog" onClick={openLanguageSheet}>
              <span className="flex-1 group-hover:underline">{t('language')}</span>
              <span className="flex min-w-0 flex-col items-end text-right">
                <span className="text-data">{name(language)}</span>
                {multi && <span className="text-description">{packInfo(pack).name}</span>}
              </span>
              <ChevronRight className="size-5 flex-none text-muted-foreground" aria-hidden />
            </button>
          </li>
        </Group>

        <Group id="s8-am-thanh" title={t('groupSound')}>
          <li>
            <button type="button" className={rowBtn} aria-haspopup="dialog" onClick={openVoices} data-testid="s8-voice-row">
              <span className="shrink-0 group-hover:underline">{t('voices')}</span>
              <span className="min-w-0 flex-1 text-right text-data text-muted-foreground">{chosen ? chosen.name : auto ? t('autoWith', { voice: auto.name }) : t('auto')}</span>
              <ChevronRight className="size-5 flex-none text-muted-foreground" aria-hidden />
            </button>
          </li>
          {/* S8-03: "Âm thanh ngoại tuyến" chỉ hiện khi ngôn ngữ có gói âm thanh dựng sẵn; bản đầu chưa hỗ trợ tải gói nên không hiện. */}
        </Group>

        <Group id="s8-giao-dien" title={t('groupDisplay')}>
          <li className={cn(rowClass, 'flex-wrap')}>
            <span className="flex-1" id="s8-theme">
              {t('theme')}
            </span>
            <DropdownSelect className="w-full sm:w-56" labelledBy="s8-theme" value={theme} onValueChange={(v) => setTheme(v as ThemeChoice)} options={themes} align="end" />
          </li>
          <li className={cn(rowClass, 'flex-wrap')}>
            <span className="flex-1" id="s8-locale-label">
              {t('uiLanguage')}
            </span>
            <LocaleSwitcher size="md" className="w-full sm:w-56" id="s8-locale" />
          </li>
        </Group>

        <Group id="s8-tien-do" title={t('groupProgress')}>
          <li>
            <button type="button" className={rowBtn} onClick={doExport}>
              <span className="flex-1 group-hover:underline">{t('export')}</span>
            </button>
          </li>
          <li>
            <button type="button" className={rowBtn} onClick={() => fileInput.current?.click()}>
              <span className="flex-1 group-hover:underline">{t('import')}</span>
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
            <button type="button" className={cn(rowBtn, 'text-danger')} aria-haspopup="dialog" onClick={confirmDelete}>
              <span className="flex-1 group-hover:underline">{t('deleteRow', { lang: name(language, true) })}</span>
            </button>
          </li>
        </Group>

        <Group id="s8-tai-khoan" title={t('groupAccount')}>
          <li className={rowClass}>
            <span className="flex-1">{t('email')}</span>
            <span className="min-w-0 truncate text-data text-muted-foreground" data-testid="s8-email">
              {user?.email}
            </span>
          </li>
          <li>
            <button type="button" className={rowBtn} onClick={() => void signOut()}>
              <LogOut className="size-4 flex-none" aria-hidden />
              <span className="flex-1 group-hover:underline">{t('signOut')}</span>
            </button>
          </li>
        </Group>

        <Group id="s8-tro-giup" title={t('groupHelp')}>
          <li>
            <button type="button" className={rowBtn} onClick={() => nav('hoc', { 'huong-dan': 1 })}>
              <span className="flex-1 group-hover:underline">{t('replayGuide')}</span>
              <ChevronRight className="size-5 flex-none text-muted-foreground" aria-hidden />
            </button>
          </li>
          <li className={rowClass}>
            <span className="flex-1 text-muted-foreground" data-testid="s8-version">
              {t('version', { version: process.env.NEXT_PUBLIC_APP_VERSION ?? '' })}
            </span>
          </li>
        </Group>
      </div>
    </section>
  );
}
