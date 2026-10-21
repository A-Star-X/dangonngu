// @spec C1-04, C1-05, C1-09, S8-02
// Bọc speechSynthesis. Không có giọng đọc thì báo để giao diện khóa nút (C1-05). Chọn giọng tự động theo S8-02.
import { useEffect, useState } from 'react';

const synth = (): SpeechSynthesis | null => (typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null);

const norm = (s: string) => s.replace('_', '-').toLowerCase();

export function voicesFor(lang: string, all: SpeechSynthesisVoice[]): SpeechSynthesisVoice[] {
  const l = norm(lang).split('-')[0];
  return all.filter((v) => norm(v.lang).split('-')[0] === l);
}

/** Danh sách giọng của thiết bị; `ready` sau khi trình duyệt đã nạp giọng (hoặc đã chờ đủ lâu). */
export function useVoices(): { voices: SpeechSynthesisVoice[]; ready: boolean } {
  const s = synth();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => s?.getVoices() ?? []);
  const [ready, setReady] = useState(() => !s || voices.length > 0);
  useEffect(() => {
    if (!s) return;
    const update = () => {
      const v = s.getVoices();
      setVoices(v);
      if (v.length > 0) setReady(true);
    };
    update();
    s.addEventListener?.('voiceschanged', update);
    const t = window.setTimeout(() => setReady(true), 1500);
    return () => {
      s.removeEventListener?.('voiceschanged', update);
      window.clearTimeout(t);
    };
  }, [s]);
  return { voices, ready };
}

/** Tên giọng thường là giọng chất lượng cao: giọng tự nhiên của Edge ("Online (Natural)"), giọng "Enhanced"/"Premium" của Apple. */
const QUALITY = /\b(natural|neural|online|enhanced|premium)\b/i;
const isGoogle = (v: SpeechSynthesisVoice) => /^google\b/i.test(v.name);

/**
 * S8-02: giọng dùng khi người học để "Tự động". Thứ tự ưu tiên: giọng Google đúng vùng (ví dụ "Google US English"
 * cho en-US), giọng Google khác cùng ngôn ngữ, giọng chất lượng cao, giọng đúng vùng, giọng mặc định của thiết bị,
 * rồi giọng đầu tiên. Khi đang ngoại tuyến bỏ qua giọng cần mạng (giọng Google trên Chrome).
 */
export function autoVoice(lang: string, locale: string | undefined, all: SpeechSynthesisVoice[], online = navigatorOnline()): SpeechSynthesisVoice | undefined {
  let list = voicesFor(lang, all);
  if (!online) {
    const local = list.filter((v) => v.localService !== false);
    if (local.length > 0) list = local;
  }
  const loc = locale ? norm(locale) : undefined;
  const sameLoc = (v: SpeechSynthesisVoice) => loc !== undefined && norm(v.lang) === loc;
  const rank = (v: SpeechSynthesisVoice) => {
    if (isGoogle(v)) return sameLoc(v) ? 0 : 1;
    if (QUALITY.test(v.name)) return sameLoc(v) ? 2 : 3;
    if (sameLoc(v)) return v.default ? 4 : 5;
    return v.default ? 6 : 7;
  };
  let best: SpeechSynthesisVoice | undefined;
  for (const v of list) if (!best || rank(v) < rank(best)) best = v;
  return best;
}

/** Giọng sẽ dùng: giọng người học đã chọn nếu còn trên thiết bị, không thì giọng tự động. */
export function pickVoice(lang: string, locale: string | undefined, all: SpeechSynthesisVoice[], voiceURI?: string): SpeechSynthesisVoice | undefined {
  const chosen = voiceURI ? voicesFor(lang, all).find((v) => v.voiceURI === voiceURI) : undefined;
  return chosen ?? autoVoice(lang, locale, all);
}

function navigatorOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine !== false;
}

export interface SpeakOptions {
  text: string;
  lang: string;
  locale?: string;
  voiceURI?: string;
  rate: number;
  onEnd?: () => void;
  /** C1-09: trình duyệt báo đang đọc tới chữ nằm trong khoảng [start, end) của `text`. */
  onWord?: (start: number, end: number) => void;
}

/** Một chữ trong câu và phần thời gian đọc ước lượng của nó (C1-09). */
export interface WordSlot {
  start: number;
  end: number;
  /** Đơn vị thời gian: độ dài chữ cộng phần nghỉ sau chữ. */
  units: number;
}

/**
 * C1-09: chia câu thành chữ (Intl.Segmenter theo ngôn ngữ đích, không có thì theo khoảng trắng) và gán phần thời gian
 * cho từng chữ: dài theo số ký tự, cộng thêm khoảng nghỉ sau dấu phẩy, dấu chấm.
 */
export function wordSlots(text: string, lang: string): WordSlot[] {
  const words: { start: number; end: number }[] = [];
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    for (const s of new Intl.Segmenter(lang, { granularity: 'word' }).segment(text)) {
      if (s.isWordLike) words.push({ start: s.index, end: s.index + s.segment.length });
    }
  } else {
    for (const m of text.matchAll(/\S+/g)) words.push({ start: m.index!, end: m.index! + m[0].length });
  }
  return words.map((w, i) => {
    const gap = text.slice(w.end, words[i + 1]?.start ?? text.length);
    const pause = /[.!?。！？]/.test(gap) ? 6 : /[,;:、，]/.test(gap) ? 3 : 0;
    return { ...w, units: w.end - w.start + 2 + pause };
  });
}

/** Thời gian đọc một đơn vị ở tốc độ 1x, theo từng giọng; chỉnh lại sau mỗi lần đọc hết câu. */
const msPerUnit = new Map<string, number>();
const DEFAULT_MS_PER_UNIT = 55;

/** Lượt đọc đang ước lượng: dừng đọc thì hủy hẹn giờ và không lấy thời gian đo. */
let estimating: { stop: () => void } | null = null;

/** Cuối chữ bắt đầu ở `start`, khi trình duyệt không báo độ dài chữ (`charLength`). */
export function wordEnd(text: string, start: number): number {
  const rest = text.slice(start);
  const m = /^[\p{L}\p{M}\p{N}'’-]+/u.exec(rest) ?? /^\S+/.exec(rest);
  return start + (m ? m[0].length : 0);
}

export function speak(o: SpeakOptions): boolean {
  const s = synth();
  if (!s || typeof SpeechSynthesisUtterance === 'undefined') return false;
  const all = s.getVoices();
  const say = (voice: SpeechSynthesisVoice | undefined, retry: boolean) => {
    const u = new SpeechSynthesisUtterance(o.text);
    u.lang = voice?.lang ?? o.locale ?? o.lang;
    if (voice) u.voice = voice;
    u.rate = o.rate;
    let started = false;
    // C1-09: giọng không báo vị trí chữ (giọng Google trên Chrome) thì ước lượng theo thời gian từ lúc bắt đầu phát.
    const key = voice?.voiceURI ?? u.lang;
    const slots = o.onWord ? wordSlots(o.text, o.lang) : [];
    const timers: number[] = [];
    let startedAt = 0;
    let real = false;
    let canceled = false;
    const clear = () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.length = 0;
    };
    const run = {
      stop: () => {
        canceled = true;
        clear();
      },
    };
    estimating?.stop();
    estimating = run;
    u.onstart = () => {
      started = true;
      if (!o.onWord || slots.length === 0) return;
      startedAt = Date.now();
      const unit = (msPerUnit.get(key) ?? DEFAULT_MS_PER_UNIT) / (o.rate || 1);
      let at = 0;
      for (const w of slots) {
        timers.push(window.setTimeout(() => !real && o.onWord?.(w.start, w.end), at));
        at += w.units * unit;
      }
    };
    u.onend = () => {
      clear();
      // Đọc hết câu bằng ước lượng: lấy thời gian thật để chỉnh ước lượng cho các lần sau.
      if (!real && !canceled && startedAt > 0 && slots.length > 0) {
        const units = slots.reduce((n, w) => n + w.units, 0);
        const cur = msPerUnit.get(key) ?? DEFAULT_MS_PER_UNIT;
        const measured = ((Date.now() - startedAt) * (o.rate || 1)) / units;
        if (measured > cur / 2 && measured < cur * 2) msPerUnit.set(key, (cur + measured) / 2);
      }
      if (estimating === run) estimating = null;
      o.onEnd?.();
    };
    u.onboundary = (e: SpeechSynthesisEvent) => {
      if (!o.onWord || (e.name && e.name !== 'word')) return;
      // Trình duyệt báo vị trí thật: bỏ ước lượng cho phần còn lại.
      real = true;
      clear();
      const start = e.charIndex;
      const end = e.charLength ? start + e.charLength : wordEnd(o.text, start);
      if (end > start) o.onWord(start, end);
    };
    u.onerror = (e: Event) => {
      clear();
      const code = (e as SpeechSynthesisErrorEvent).error;
      // Giọng cần mạng (giọng Google trên Chrome) lỗi khi mất mạng: đọc lại một lần bằng giọng có sẵn trên máy.
      if (retry && !started && voice && voice.localService === false && code !== 'interrupted' && code !== 'canceled') {
        const local = autoVoice(o.lang, o.locale, all, false);
        if (local && local !== voice && local.localService !== false) {
          say(local, false);
          return;
        }
      }
      o.onEnd?.();
    };
    s.speak(u);
  };
  say(pickVoice(o.lang, o.locale, all, o.voiceURI), true);
  return true;
}

export function stopSpeaking() {
  estimating?.stop();
  estimating = null;
  synth()?.cancel();
}

/** Chỉ cho test: xóa thời gian đo được của các giọng. */
export function resetSpeechEstimates() {
  msPerUnit.clear();
}

export const speechSupported = () => synth() !== null;
