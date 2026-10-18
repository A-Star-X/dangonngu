// @spec APP-06
import { useCallback, useState } from 'react';
import { useSheet } from '../components/C6-sheet/SheetHost';
import { useToast } from '../components/C7-thong-bao/ToastHost';
import type { PackId } from '../data';
import { SwitchList } from './LanguageList';
import { navigate } from './router';
import { useApp } from './state';

function SwitchBody({ close }: { close: () => void }) {
  const { catalog, language, pack, chooseLanguage } = useApp();
  const toast = useToast();
  const [busy, setBusy] = useState<string | null>(null);
  if (catalog.status !== 'ready') return null;
  const pick = async (lang: string, p: PackId) => {
    setBusy(`${p}.${lang}`);
    try {
      await chooseLanguage(lang, p);
      close();
      navigate('hoc');
    } catch {
      setBusy(null);
      toast.show({ text: 'Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.', kind: 'alert', action: { label: 'Thử lại', onClick: () => pick(lang, p) } });
    }
  };
  return <SwitchList languages={catalog.value.languages} current={language ? { lang: language.id, pack } : undefined} busy={busy} onPick={pick} />;
}

export function useLanguageSheet() {
  const sheet = useSheet();
  return useCallback(() => {
    sheet.open({ title: 'Đổi ngôn ngữ hoặc bộ nội dung', body: (close) => <SwitchBody close={close} /> });
  }, [sheet]);
}
