// Chọn giọng "Tự động" (S8-02), đọc lại bằng giọng trên máy khi giọng cần mạng lỗi, ước lượng chữ đang đọc (C1-09).
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { autoVoice, pickVoice, resetSpeechEstimates, speak, stopSpeaking, wordSlots } from '@/lib/speech';
import { lowerFirst } from '@/domain';
import { inSentence, languageName } from '@/lib/language-name';

type V = Partial<SpeechSynthesisVoice> & { name: string; lang: string; voiceURI: string };
const v = (name: string, lang: string, extra: Partial<SpeechSynthesisVoice> = {}): V => ({ name, lang, voiceURI: name, default: false, localService: true, ...extra });
const asVoices = (list: V[]) => list as unknown as SpeechSynthesisVoice[];

// Danh sách giống Chrome trên Windows: giọng Microsoft trên máy đứng trước, giọng Google cần mạng đứng sau.
const chromeWin = asVoices([
  v('Microsoft David - English (United States)', 'en-US', { default: true }),
  v('Microsoft Zira - English (United States)', 'en-US'),
  v('Microsoft Hazel - English (United Kingdom)', 'en-GB'),
  v('Google US English', 'en-US', { localService: false }),
  v('Google UK English Female', 'en-GB', { localService: false }),
  v('Google UK English Male', 'en-GB', { localService: false }),
  // Chrome máy tính không có giọng Google tiếng Việt; giọng tiếng Việt là giọng của máy.
  v('Microsoft An - Vietnamese (Vietnam)', 'vi-VN'),
]);
// Edge: không có giọng Google, có giọng tự nhiên cần mạng.
const edge = asVoices([
  v('Microsoft David - English (United States)', 'en-US', { default: true }),
  v('Microsoft Aria Online (Natural) - English (United States)', 'en-US', { localService: false }),
]);
// Safari: chỉ có giọng trên máy.
const safari = asVoices([v('Daniel', 'en-GB'), v('Samantha', 'en-US', { default: true }), v('Karen', 'en-AU')]);

describe('S8-02 giọng Tự động', () => {
  // @ac S8-AC11
  it('ưu tiên giọng Google đúng vùng, rồi giọng Google khác, rồi giọng chất lượng cao, rồi giọng mặc định', () => {
    expect(autoVoice('en', 'en-US', chromeWin, true)?.name).toBe('Google US English');
    expect(autoVoice('en', 'en-GB', chromeWin, true)?.name).toBe('Google UK English Female');
    expect(autoVoice('en', 'en-AU', chromeWin, true)?.name).toBe('Google US English');
    expect(autoVoice('vi', 'vi-VN', chromeWin, true)?.name).toBe('Microsoft An - Vietnamese (Vietnam)');
    expect(autoVoice('en', 'en-US', edge, true)?.name).toBe('Microsoft Aria Online (Natural) - English (United States)');
    expect(autoVoice('en', 'en-US', safari, true)?.name).toBe('Samantha');
    expect(autoVoice('en', 'en-GB', safari, true)?.name).toBe('Daniel');
    expect(autoVoice('ja', 'ja-JP', chromeWin, true)).toBeUndefined();
  });

  // @ac S8-AC11
  it('ngoại tuyến: bỏ qua giọng cần mạng; giọng đã chọn vẫn được dùng nếu còn trên máy', () => {
    expect(autoVoice('en', 'en-US', chromeWin, false)?.name).toBe('Microsoft David - English (United States)');
    expect(autoVoice('en', 'en-GB', chromeWin, false)?.name).toBe('Microsoft Hazel - English (United Kingdom)');
    expect(pickVoice('en', 'en-US', chromeWin, 'Microsoft Zira - English (United States)')?.name).toBe('Microsoft Zira - English (United States)');
    // Giọng đã chọn không còn trên máy: về Tự động.
    expect(pickVoice('en', 'en-US', chromeWin, 'khong-con')?.name).toBe('Google US English');
  });
});

describe('S8-02 đọc lại khi giọng cần mạng lỗi', () => {
  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    delete (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  });

  function install(voices: SpeechSynthesisVoice[]) {
    const spoken: { voice: SpeechSynthesisVoice | null; onerror: ((e: unknown) => void) | null; onend: (() => void) | null; onstart: (() => void) | null }[] = [];
    class Utter {
      text: string;
      lang = '';
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onstart: (() => void) | null = null;
      constructor(t: string) {
        this.text = t;
      }
    }
    (window as unknown as Record<string, unknown>).speechSynthesis = { speak: (u: (typeof spoken)[number]) => spoken.push(u), cancel: vi.fn(), getVoices: () => voices };
    (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = Utter;
    return spoken;
  }

  // @ac S8-AC11
  it('giọng Google lỗi mạng trước khi đọc: đọc lại một lần bằng giọng trên máy; lỗi do dừng thì không đọc lại', () => {
    const spoken = install(chromeWin);
    const onEnd = vi.fn();
    speak({ text: 'Hello', lang: 'en', locale: 'en-US', rate: 1, onEnd });
    expect(spoken).toHaveLength(1);
    expect(spoken[0].voice?.name).toBe('Google US English');
    spoken[0].onerror!({ error: 'network' });
    expect(spoken).toHaveLength(2);
    expect(spoken[1].voice?.name).toBe('Microsoft David - English (United States)');
    expect(onEnd).not.toHaveBeenCalled();
    spoken[1].onend!();
    expect(onEnd).toHaveBeenCalledTimes(1);

    speak({ text: 'Hello', lang: 'en', locale: 'en-US', rate: 1, onEnd });
    spoken[2].onerror!({ error: 'interrupted' });
    expect(spoken).toHaveLength(3);
    expect(onEnd).toHaveBeenCalledTimes(2);
  });
});

describe('FND-12 tên ngôn ngữ giữa câu', () => {
  // @ac FND-AC12
  it('viết thường chữ đầu', () => {
    expect(lowerFirst('Tiếng Anh')).toBe('tiếng Anh');
    expect(lowerFirst('Tiếng Tamil (Ấn Độ)')).toBe('tiếng Tamil (Ấn Độ)');
    expect(lowerFirst('')).toBe('');
  });

  // @ac FND-AC12
  it('tên ngôn ngữ theo ngôn ngữ giao diện: tiếng Việt dùng tên trong dữ liệu, tiếng Anh dùng tên của trình duyệt', () => {
    const ja = { id: 'ja', name: 'Tiếng Nhật' };
    expect(languageName(ja, 'vi')).toBe('Tiếng Nhật');
    expect(inSentence(languageName(ja, 'vi'), 'vi')).toBe('tiếng Nhật');
    expect(languageName(ja, 'en')).toBe('Japanese');
    // Giữa câu tiếng Anh vẫn viết hoa tên ngôn ngữ.
    expect(inSentence(languageName(ja, 'en'), 'en')).toBe('Japanese');
    // Mã lạ: giữ tên trong dữ liệu.
    expect(languageName({ id: 'zz', name: 'Tiếng ZZ' }, 'en')).toBe('Tiếng ZZ');
  });
});

describe('C1-09 ước lượng chữ đang đọc khi giọng không báo vị trí', () => {
  type U = { text: string; rate: number; onstart: (() => void) | null; onend: (() => void) | null; onboundary: ((e: unknown) => void) | null };
  let spoken: U[] = [];
  beforeEach(() => {
    vi.useFakeTimers();
    resetSpeechEstimates();
    spoken = [];
    class Utter {
      text: string;
      lang = '';
      rate = 1;
      voice: SpeechSynthesisVoice | null = null;
      onstart: (() => void) | null = null;
      onend: (() => void) | null = null;
      onerror: ((e: unknown) => void) | null = null;
      onboundary: ((e: unknown) => void) | null = null;
      constructor(t: string) {
        this.text = t;
      }
    }
    (window as unknown as Record<string, unknown>).speechSynthesis = { speak: (u: U) => spoken.push(u), cancel: vi.fn(), getVoices: () => chromeWin };
    (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance = Utter;
  });
  afterEach(() => {
    vi.useRealTimers();
    delete (window as unknown as Record<string, unknown>).speechSynthesis;
    delete (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
  });

  const TEXT = "I'd like to book a table for two.";
  /** Đọc câu, trả về danh sách [thời điểm, chữ] mà app báo đang đọc. */
  function read(rate = 1) {
    const seen: [number, string][] = [];
    const t0 = Date.now();
    speak({ text: TEXT, lang: 'en', locale: 'en-US', rate, onWord: (s, e) => seen.push([Date.now() - t0, TEXT.slice(s, e)]) });
    const u = spoken.at(-1)!;
    u.onstart!();
    return { seen, u };
  }

  // @ac C1-AC14
  it('chữ đi lần lượt theo thứ tự, chữ dài giữ lâu hơn, tốc độ 2x nhanh gấp đôi', () => {
    expect(wordSlots(TEXT, 'en').map((w) => TEXT.slice(w.start, w.end))).toEqual(["I'd", 'like', 'to', 'book', 'a', 'table', 'for', 'two']);
    const { seen, u } = read();
    vi.advanceTimersByTime(5000);
    expect(seen.map((x) => x[1])).toEqual(["I'd", 'like', 'to', 'book', 'a', 'table', 'for', 'two']);
    const at = Object.fromEntries(seen.map(([t, w]) => [w, t]));
    expect(at['for'] - at['table']).toBeGreaterThan(at['table'] - at['a']);
    u.onend!();
    resetSpeechEstimates();
    const fast = read(2);
    vi.advanceTimersByTime(5000);
    const at2 = Object.fromEntries(fast.seen.map(([t, w]) => [w, t]));
    expect(at2['two']).toBeCloseTo(at['two'] / 2, 0);
  });

  // @ac C1-AC14
  it('đọc hết một lượt dài hơn ước lượng thì lượt sau ước lượng dài hơn; dừng giữa chừng thì không đo', () => {
    const first = read();
    vi.advanceTimersByTime(5000);
    const before = Object.fromEntries(first.seen.map(([t, w]) => [w, t]))['two'];
    // Giọng thật đọc hết câu sau 5 giây, lâu hơn ước lượng (khoảng 2,6 giây).
    first.u.onend!();
    const second = read();
    vi.advanceTimersByTime(8000);
    const after = Object.fromEntries(second.seen.map(([t, w]) => [w, t]))['two'];
    expect(after).toBeGreaterThan(before);
    second.u.onend!();
    // Dừng giữa chừng: thời gian đo ngắn không được dùng.
    const third = read();
    vi.advanceTimersByTime(100);
    stopSpeaking();
    third.u.onend!();
    const fourth = read();
    vi.advanceTimersByTime(8000);
    expect(Object.fromEntries(fourth.seen.map(([t, w]) => [w, t]))['two']).toBe(after);
  });

  // @ac C1-AC14
  it('đang ước lượng mà trình duyệt báo vị trí thật thì dùng vị trí thật', () => {
    const { seen, u } = read();
    vi.advanceTimersByTime(0);
    expect(seen.at(-1)?.[1]).toBe("I'd");
    u.onboundary!({ name: 'word', charIndex: TEXT.indexOf('table'), charLength: 5 });
    vi.advanceTimersByTime(5000);
    expect(seen.map((x) => x[1])).toEqual(["I'd", 'table']);
  });
});
