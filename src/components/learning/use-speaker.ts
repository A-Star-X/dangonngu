'use client';
// @spec C1-04, C1-05, C1-09, C1-10
import { useCallback, useEffect, useRef, useState } from 'react';
import { speak, stopSpeaking, voicesFor, wordSlots } from '@/lib/speech';
import { useLearning } from '@/providers/learning-provider';

export type Playing = 'idle' | 'once' | 'loop' | 'slow';

/** C1-10: nghỉ giữa hai chữ khi Nghe chậm. */
export const SLOW_GAP_MS = 400;

/** Đọc câu gốc bằng giọng và tốc độ đã chọn. Đổi câu hoặc rời màn thì dừng ngay. */
export function useSpeaker(text: string, lang: string, locale?: string) {
  const { settings, voices, voicesReady } = useLearning();
  const [playing, setPlaying] = useState<Playing>('idle');
  /** C1-09: khoảng [start, end) của chữ đang đọc; null khi không đọc hoặc trình duyệt không báo vị trí. */
  const [word, setWord] = useState<[number, number] | null>(null);
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
    setWord(null);
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
    setWord(null);
    const once = (): boolean =>
      speak({
        text,
        lang,
        locale,
        voiceURI: settings.voiceByLang[lang],
        rate: settings.rate,
        onWord: (s, e) => {
          if (g === gen.current) setWord([s, e]);
        },
        onEnd: () => {
          if (g !== gen.current) return;
          setWord(null);
          if (mode.current === 'loop') timer.current = window.setTimeout(once, 1500);
          else if (mode.current === 'once') {
            mode.current = 'idle';
            setPlaying('idle');
          }
        },
      });
    // C1-10: Nghe chậm đọc từng chữ một lượt riêng; chữ đang đọc là chữ vừa gửi đi nên luôn tô đúng.
    const slow = (i: number): boolean => {
      const w = slots[i];
      setWord([w.start, w.end]);
      return speak({
        text: text.slice(w.start, w.end),
        lang,
        locale,
        voiceURI: settings.voiceByLang[lang],
        rate: settings.rate,
        onEnd: () => {
          if (g !== gen.current) return;
          if (i + 1 < slots.length) timer.current = window.setTimeout(() => slow(i + 1), SLOW_GAP_MS);
          else {
            mode.current = 'idle';
            setPlaying('idle');
            setWord(null);
          }
        },
      });
    };
    const slots = m === 'slow' ? wordSlots(text, lang) : [];
    if (m === 'slow' ? slots.length === 0 || !slow(0) : !once()) stop();
  };

  return {
    playing,
    word,
    noVoice,
    ready: voicesReady,
    toggle: (m: Exclude<Playing, 'idle'>) => (mode.current === m ? stop() : start(m)),
    stop,
  };
}
