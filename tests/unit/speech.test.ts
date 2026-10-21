// Chọn giọng "Tự động" (S8-02) và đọc lại bằng giọng trên máy khi giọng cần mạng lỗi.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { autoVoice, pickVoice, speak } from '@/lib/speech';
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
  it('ưu tiên giọng chất lượng cao, giọng đúng vùng, giọng mặc định; giọng Google xếp cuối', () => {
    expect(autoVoice('en', 'en-US', chromeWin, true)?.name).toBe('Microsoft David - English (United States)');
    expect(autoVoice('en', 'en-GB', chromeWin, true)?.name).toBe('Microsoft Hazel - English (United Kingdom)');
    expect(autoVoice('en', 'en-AU', chromeWin, true)?.name).toBe('Microsoft David - English (United States)');
    // Chỉ còn giọng Google: chọn giọng Google đúng vùng.
    const googleOnly = asVoices(chromeWin.filter((x) => x.name.startsWith('Google')) as unknown as V[]);
    expect(autoVoice('en', 'en-US', googleOnly, true)?.name).toBe('Google US English');
    expect(autoVoice('en', 'en-GB', googleOnly, true)?.name).toBe('Google UK English Female');
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
    expect(pickVoice('en', 'en-US', chromeWin, 'khong-con')?.name).toBe('Microsoft David - English (United States)');
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
  it('giọng Google đã chọn lỗi mạng trước khi đọc: đọc lại một lần bằng giọng trên máy; lỗi do dừng thì không đọc lại', () => {
    const spoken = install(chromeWin);
    const onEnd = vi.fn();
    speak({ text: 'Hello', lang: 'en', locale: 'en-US', voiceURI: 'Google US English', rate: 1, onEnd });
    expect(spoken).toHaveLength(1);
    expect(spoken[0].voice?.name).toBe('Google US English');
    spoken[0].onerror!({ error: 'network' });
    expect(spoken).toHaveLength(2);
    expect(spoken[1].voice?.name).toBe('Microsoft David - English (United States)');
    expect(onEnd).not.toHaveBeenCalled();
    spoken[1].onend!();
    expect(onEnd).toHaveBeenCalledTimes(1);

    speak({ text: 'Hello', lang: 'en', locale: 'en-US', voiceURI: 'Google US English', rate: 1, onEnd });
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
