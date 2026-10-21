'use client';
// @spec C1-04, C1-05
import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, stopSpeaking, voicesFor } from '@/lib/speech';
import { useLearning } from '@/providers/learning-provider';

export type Playing = 'idle' | 'once' | 'loop';

/** Đọc câu gốc bằng giọng và tốc độ đã chọn. Đổi câu hoặc rời màn thì dừng ngay. */
export function useSpeaker(text: string, lang: string, locale?: string) {
  const { settings, voices, voicesReady } = useLearning();
  const [playing, setPlaying] = useState<Playing>('idle');
  const mode = useRef<Playing>('idle');
  const timer = useRef<number | undefined>(undefined);
  // Mỗi lượt bấm có một số thứ tự. Trình duyệt báo "đọc xong" cho câu đã bị hủy một lúc sau đó;
  // lượt cũ không được đổi trạng thái của lượt mới (đổi Nghe sang Nghe lặp khi đang đọc).
  const gen = useRef(0);
  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const hasVoice = supported && voicesFor(lang, voices).length > 0;
  const noVoice = voicesReady && !hasVoice;

  const stop = useCallback(() => {
    gen.current++;
    window.clearTimeout(timer.current);
    if (mode.current !== 'idle') stopSpeaking();
    mode.current = 'idle';
    setPlaying('idle');
  }, []);

  useEffect(() => {
    // Đổi câu hoặc rời màn: dừng đọc và đưa nút về "Nghe" (thẻ có thể được dùng lại cho câu khác, ví dụ T3).
    return () => stop();
  }, [text, stop]);

  const start = (m: Exclude<Playing, 'idle'>) => {
    window.clearTimeout(timer.current);
    stopSpeaking();
    const g = ++gen.current;
    mode.current = m;
    setPlaying(m);
    const once = (): boolean =>
      speak({
        text,
        lang,
        locale,
        voiceURI: settings.voiceByLang[lang],
        rate: settings.rate,
        onEnd: () => {
          if (g !== gen.current) return;
          if (mode.current === 'loop') timer.current = window.setTimeout(once, 1500);
          else if (mode.current === 'once') {
            mode.current = 'idle';
            setPlaying('idle');
          }
        },
      });
    if (!once()) stop();
  };

  return {
    playing,
    noVoice,
    ready: voicesReady,
    toggle: (m: Exclude<Playing, 'idle'>) => (mode.current === m ? stop() : start(m)),
    stop,
  };
}
