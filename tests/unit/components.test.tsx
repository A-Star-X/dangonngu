import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { loadCatalog, loadLanguageData } from '@/domain';
import { SentenceCard } from '@/components/learning/sentence-card';
import { Strip } from '@/components/learning/strip';
import { Choices } from '@/components/learning/choices';
import { Button } from '@/components/ui/button';
import { SheetProvider, useSheet } from '@/components/ui/sheet';
import { DropdownSelect } from '@/components/ui/dropdown-select';
import { ToastProvider } from '@/providers/toast-provider';
import { dismiss, notify } from '@/lib/toast';
import { FixtureSource, fakeSpeech, settle, withIntl, withProviders } from './helpers';

afterEach(() => {
  vi.useRealTimers();
});

const plain = { id: 1, en: 'I want to...', vi: 'Tôi muốn...' };
const card = (c: HTMLElement) => c.querySelector<HTMLElement>('[data-testid="sentence-card"]')!;
/** Dòng báo thiếu giọng: dòng chứa liên kết hoặc dòng giữ chỗ cùng nội dung. */
const noVoiceLine = (c: HTMLElement) => [...card(c).querySelectorAll('p')].find((p) => p.textContent?.startsWith('Thiết bị chưa có giọng'));

describe('C1 Thẻ câu', () => {
  // @ac C1-AC02
  it('chế độ che: nút Nghe khóa; nhấn khối che, Space, Enter đều hiện câu gốc, sự kiện phát một lần mỗi lượt', async () => {
    for (const how of ['click', 'space', 'enter'] as const) {
      const onReveal = vi.fn();
      const { unmount, container } = withProviders(<SentenceCard item={plain} lang="en" langName="tiếng Anh" covered onReveal={onReveal} />);
      await settle();
      expect(screen.getByRole('button', { name: /^Nghe$/ })).toHaveAttribute('aria-disabled', 'true');
      if (how === 'click') fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
      else fireEvent.keyDown(card(container), { key: how === 'space' ? ' ' : 'Enter' });
      expect(onReveal).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  // @ac C1-AC03
  it('sau khi hiện, không phần tử nào trong thẻ che lại câu gốc', async () => {
    withProviders(<SentenceCard item={plain} lang="en" langName="tiếng Anh" />);
    await settle();
    for (const b of screen.getAllByRole('button')) fireEvent.click(b);
    expect(screen.getByText('I want to...')).toBeInTheDocument();
    expect(screen.queryByText('Nhấn để hiện câu gốc')).toBeNull();
  });

  // @ac C1-AC04
  it('Nghe gọi speak với lang, giọng, rate đã chọn; gỡ thẻ thì cancel', async () => {
    const synth = fakeSpeech([
      { lang: 'en-US', voiceURI: 'us', name: 'US' },
      { lang: 'en-GB', voiceURI: 'gb', name: 'GB' },
    ]);
    const seed = { 'vitasr2.settings': { schema: 1, packByLang: {}, voiceByLang: { en: 'gb' }, rate: 1.25, weeklyGoal: 5, guideSeen: true } };
    const { unmount } = withProviders(<SentenceCard item={plain} lang="en" langName="tiếng Anh" />, { seed });
    await settle();
    fireEvent.click(screen.getByRole('button', { name: /^Nghe$/ }));
    expect(synth.speak).toHaveBeenCalledTimes(1);
    const u = synth.speak.mock.calls[0][0] as { lang: string; rate: number; voice: { voiceURI: string }; text: string };
    expect(u.text).toBe('I want to...');
    expect(u.lang).toBe('en-GB');
    expect(u.voice.voiceURI).toBe('gb');
    expect(u.rate).toBe(1.25);
    expect(screen.getAllByText('Dừng')).toHaveLength(1);
    synth.cancel.mockClear();
    unmount();
    expect(synth.cancel).toHaveBeenCalled();
  });

  // @ac C1-AC11
  it('tô sáng chữ trình duyệt báo đang đọc; bỏ tô khi đọc xong, Dừng, giữa hai lượt Nghe lặp; không báo vị trí thì không tô', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const synth = fakeSpeech([{ lang: 'en-US', voiceURI: 'us', name: 'US' }]);
    type U = { text: string; onboundary?: (e: unknown) => void; onend: (() => void) | null };
    const last = () => synth.speak.mock.calls.at(-1)![0] as U;
    const sentence = { id: 2, en: "I'd like to book a table for two.", vi: 'Tôi muốn đặt một bàn cho hai người.' };
    const { container, unmount } = withProviders(<SentenceCard item={sentence} lang="en" langName="tiếng Anh" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const source = () => card(container).querySelector<HTMLElement>('[data-testid="source-text"]')!;
    const marks = () => source().querySelectorAll('mark');
    const boundary = (charIndex: number, charLength?: number) => act(() => last().onboundary?.({ name: 'word', charIndex, charLength }));

    fireEvent.click(screen.getByRole('button', { name: /^Nghe$/ }));
    boundary(sentence.en.indexOf('table'), 5);
    expect(marks()).toHaveLength(1);
    expect(marks()[0]).toHaveTextContent(/^table$/);
    expect(source()).toHaveTextContent(sentence.en);
    // Không có charLength: tự tìm hết chữ, không lấy dấu chấm.
    boundary(sentence.en.indexOf('two'));
    expect(marks()[0]).toHaveTextContent(/^two$/);
    act(() => last().onend?.());
    expect(marks()).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /^Nghe$/ }));
    boundary(0, 3);
    fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    expect(marks()).toHaveLength(0);

    fireEvent.click(screen.getByRole('button', { name: /Nghe lặp/ }));
    boundary(sentence.en.indexOf('book'), 4);
    expect(marks()[0]).toHaveTextContent(/^book$/);
    act(() => last().onend?.());
    expect(marks()).toHaveLength(0);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500);
    });
    expect(synth.speak).toHaveBeenCalledTimes(4);
    // Lượt mới chưa bắt đầu phát (chưa có onstart) và chưa báo vị trí: chưa tô.
    expect(marks()).toHaveLength(0);
    unmount();

    // Câu có furigana (ruby) thì không tô.
    const ja = { id: 3, en: '日本語', vi: 'Tiếng Nhật', furigana: [['日本語', 'にほんご']] as [string, string][] };
    const jaSynth = fakeSpeech([{ lang: 'ja-JP', voiceURI: 'ja', name: 'JA' }]);
    const r = withProviders(<SentenceCard item={ja} lang="ja" langName="tiếng Nhật" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    fireEvent.click(screen.getByRole('button', { name: /^Nghe$/ }));
    act(() => (jaSynth.speak.mock.calls.at(-1)![0] as U).onboundary?.({ name: 'word', charIndex: 0, charLength: 3 }));
    expect(card(r.container).querySelector('ruby')).not.toBeNull();
    expect(card(r.container).querySelector('mark')).toBeNull();
  });

  // @ac C1-AC15
  it('Nghe chậm: đọc lần lượt từng chữ, nghỉ 0,4 giây giữa hai chữ, tô đúng chữ đang đọc; Dừng và Nghe thay lượt đọc chậm', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const synth = fakeSpeech([{ lang: 'en-US', voiceURI: 'us', name: 'US' }]);
    type U = { text: string; onend: (() => void) | null };
    const said = () => synth.speak.mock.calls.map((c) => (c[0] as U).text);
    const last = () => synth.speak.mock.calls.at(-1)![0] as U;
    const sentence = { id: 2, en: "I'd like to book a table for two.", vi: 'Tôi muốn đặt một bàn cho hai người.' };
    const words = ["I'd", 'like', 'to', 'book', 'a', 'table', 'for', 'two'];
    const { container } = withProviders(<SentenceCard item={sentence} lang="en" langName="tiếng Anh" />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });
    const mark = () => card(container).querySelector('[data-testid="source-text"] mark');

    fireEvent.click(screen.getByRole('button', { name: 'Nghe chậm' }));
    expect(said()).toEqual(["I'd"]);
    expect(mark()).toHaveTextContent(/^I'd$/);
    expect(screen.getAllByText('Dừng')).toHaveLength(1);
    for (let i = 1; i < words.length; i++) {
      act(() => last().onend?.());
      // Chưa hết khoảng nghỉ thì chưa đọc chữ sau.
      act(() => vi.advanceTimersByTime(399));
      expect(said()).toHaveLength(i);
      act(() => vi.advanceTimersByTime(1));
      expect(said().at(-1)).toBe(words[i]);
      expect(mark()).toHaveTextContent(new RegExp(`^${words[i]}$`));
    }
    act(() => last().onend?.());
    expect(mark()).toBeNull();
    expect(screen.queryByText('Dừng')).toBeNull();
    expect(screen.getByRole('button', { name: 'Nghe chậm' })).toBeInTheDocument();

    // Dừng giữa chừng: không đọc chữ tiếp.
    synth.speak.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Nghe chậm' }));
    fireEvent.click(screen.getByRole('button', { name: 'Dừng' }));
    act(() => last().onend?.());
    act(() => vi.advanceTimersByTime(2000));
    expect(said()).toEqual(["I'd"]);
    expect(mark()).toBeNull();

    // Bấm Nghe khi đang đọc chậm: chỉ còn lượt đọc cả câu.
    synth.speak.mockClear();
    fireEvent.click(screen.getByRole('button', { name: 'Nghe chậm' }));
    const slowFirst = last();
    fireEvent.click(screen.getByRole('button', { name: /^Nghe$/ }));
    expect(said()).toEqual(["I'd", sentence.en]);
    act(() => slowFirst.onend?.());
    act(() => vi.advanceTimersByTime(2000));
    expect(said()).toHaveLength(2);
    expect(screen.getAllByText('Dừng')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Nghe chậm' })).toBeInTheDocument();
  });

  // @ac C1-AC06
  it('không có giọng ngôn ngữ đích: nút khóa, có câu thông báo và liên kết mở Giọng đọc', async () => {
    fakeSpeech([{ lang: 'vi-VN', voiceURI: 'vi', name: 'VI' }]);
    const open = vi.fn();
    withProviders(<SentenceCard item={plain} lang="en" langName="tiếng Anh" onOpenVoices={open} />);
    await settle();
    expect(screen.getByRole('button', { name: /^Nghe$/ })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: /Nghe lặp/ })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByText(/Thiết bị chưa có giọng tiếng Anh\. Mở/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cài đặt > Giọng đọc' }));
    expect(open).toHaveBeenCalled();
  });

  // @ac C1-AC06
  it('đang nạp danh sách giọng: giữ chỗ bằng dòng ẩn cùng nội dung; hết 1,5 giây không có giọng thì câu báo hiện đúng chỗ đó; có giọng thì không có dòng nào', async () => {
    vi.useFakeTimers();
    fakeSpeech([]);
    const a = withProviders(<SentenceCard item={plain} lang="en" langName="tiếng Anh" />);
    await act(async () => {});
    const text = 'Thiết bị chưa có giọng tiếng Anh. Mở Cài đặt > Giọng đọc.';
    const audioRow = () => screen.getByRole('button', { name: /Nghe lặp/ }).parentElement;
    const pending = noVoiceLine(a.container)!;
    expect(pending).toHaveAttribute('aria-hidden', 'true');
    expect(pending).toHaveClass('invisible');
    expect(pending).toHaveTextContent(text);
    expect(pending.previousElementSibling).toBe(audioRow());
    expect(screen.queryByRole('button', { name: 'Cài đặt > Giọng đọc' })).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    const shown = noVoiceLine(a.container)!;
    expect(shown).not.toHaveAttribute('aria-hidden');
    expect(shown).not.toHaveClass('invisible');
    expect(shown).toHaveTextContent(text);
    expect(shown.previousElementSibling).toBe(audioRow());
    expect(screen.getByRole('button', { name: 'Cài đặt > Giọng đọc' })).toBeInTheDocument();
    a.unmount();

    fakeSpeech([{ lang: 'en-US', voiceURI: 'en', name: 'EN' }]);
    const b = withProviders(<SentenceCard item={plain} lang="en" langName="tiếng Anh" />);
    await act(async () => {});
    expect(noVoiceLine(b.container)).toBeUndefined();
  });

  // @ac C1-AC07, DATA-AC04
  it('Cách dùng và ruby chỉ có khi item có trường tương ứng', async () => {
    const src = new FixtureSource();
    const cat = await loadCatalog(src);
    const ja = await loadLanguageData(src, cat, 'ja', 'fluency');
    const g = await loadLanguageData(src, cat, 'en', 'global');
    const f = await loadLanguageData(src, cat, 'en', 'fluency');
    const a = withProviders(<SentenceCard item={g.items[0]} lang="en" langName="tiếng Anh" />);
    await settle();
    expect(screen.getByText(/^Cách dùng: /)).toBeInTheDocument();
    a.unmount();
    const kanji = ja.items.find((i) => i.furigana?.some((seg) => seg.length === 2))!;
    const b = withProviders(<SentenceCard item={kanji} lang="ja" langName="tiếng Nhật" />);
    await settle();
    expect(b.container.querySelector('ruby')).not.toBeNull();
    b.unmount();
    const c = withProviders(<SentenceCard item={f.items[0]} lang="en" langName="tiếng Anh" />);
    await settle();
    expect(screen.queryByText(/^Cách dùng: /)).toBeNull();
    expect(c.container.querySelector('ruby')).toBeNull();
    // Không có phiên âm: dưới câu gốc chỉ có chính câu gốc.
    expect(screen.getByTestId('card-source').children).toHaveLength(1);
  });

  // @ac C1-AC08
  it('thuộc tính lang của câu gốc và nghĩa', async () => {
    const { container, unmount } = withProviders(<SentenceCard item={plain} lang="en" langName="tiếng Anh" />);
    await settle();
    expect(screen.getByTestId('source-text')).toHaveAttribute('lang', 'en');
    expect(within(card(container)).getByText('Tôi muốn...')).toHaveAttribute('lang', 'vi');
    unmount();
    withProviders(<SentenceCard item={{ id: 2, en: '何', vi: 'Gì' }} lang="ja" langName="tiếng Nhật" />);
    await settle();
    expect(screen.getByTestId('source-text')).toHaveAttribute('lang', 'ja');
  });
});

describe('C2 Dải 8 ô', () => {
  // Kích thước ô 10 x 10 px và khoảng cách 4 px kiểm trong test giao diện (C2-AC01).
  it('số ô bằng số câu', () => {
    const a = withIntl(<Strip cells={Array(8).fill('chua')} />);
    expect(a.container.querySelectorAll('li')).toHaveLength(8);
    a.unmount();
    const b = withIntl(<Strip cells={Array(5).fill('chua')} />);
    expect(b.container.querySelectorAll('li')).toHaveLength(5);
  });

  // @ac C2-AC03
  it('nhãn trợ năng của dải và từng ô; không ô nào nhận focus', () => {
    withIntl(<Strip cells={['nho', 'can-on', 'dang', 'chua']} />);
    expect(screen.getByRole('list', { name: 'Tiến độ nhóm câu: đã học 2 trên 4 câu' })).toBeInTheDocument();
    expect(screen.getByLabelText('Câu 1, đã nhớ')).toBeInTheDocument();
    expect(screen.getByLabelText('Câu 2, cần ôn')).toBeInTheDocument();
    expect(screen.getByLabelText('Câu 3, đang học')).toBeInTheDocument();
    for (const li of screen.getAllByRole('listitem')) expect(li).not.toHaveAttribute('tabindex');
  });
});

describe('C3 Nút', () => {
  // @ac C3-AC04
  it('nút khóa có aria-disabled và không phát click', () => {
    const onClick = vi.fn();
    render(
      <Button locked onClick={onClick}>
        Học 8 câu
      </Button>,
    );
    const b = screen.getByRole('button', { name: 'Học 8 câu' });
    expect(b).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(b);
    expect(onClick).not.toHaveBeenCalled();
  });
});

describe('C4 Lựa chọn', () => {
  const options = [
    { key: 1, text: 'A', correct: false },
    { key: 2, text: 'B', correct: true },
    { key: 3, text: 'C', correct: false },
    { key: 4, text: 'D', correct: false },
  ];
  // @ac C4-AC02
  it('sai rồi đúng: mỗi sự kiện một lần, sau khi đúng mọi lựa chọn khóa; phím 1 đến 4', () => {
    const onWrong = vi.fn();
    const onCorrect = vi.fn();
    withIntl(<Choices options={options} onWrong={onWrong} onCorrect={onCorrect} />);
    fireEvent.keyDown(window, { key: '1' });
    fireEvent.keyDown(window, { key: '3' });
    expect(onWrong).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(window, { key: '2' });
    expect(onCorrect).toHaveBeenCalledTimes(1);
    for (const b of screen.getAllByRole('button')) expect(b).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getAllByRole('button')[3]);
    expect(onWrong).toHaveBeenCalledTimes(1);
  });

  // @ac C4-AC03
  it('vùng aria-live báo kết quả; icon đúng và sai khác nhau', () => {
    const { container } = withIntl(<Choices options={options} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByTestId('choices-live')).toHaveTextContent('Chưa đúng, thử lại');
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByTestId('choices-live')).toHaveTextContent('Đúng');
    expect(container.querySelector('[data-icon="sai"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="dung"]')).not.toBeNull();
  });

  // @ac C4-AC02
  // @ac C4-AC03
  it('lựa chọn sai có viền đỏ, nền nhạt và chữ "Chưa đúng" nhìn thấy được; lựa chọn đúng có chữ "Đúng"', () => {
    withIntl(<Choices options={options} />);
    fireEvent.click(screen.getByText('A'));
    const wrong = screen.getByText('A').closest('button')!;
    expect(wrong).toHaveAttribute('data-state', 'wrong');
    expect(wrong).toHaveClass('border-danger', 'bg-danger-soft');
    expect(wrong).toHaveTextContent('Chưa đúng');
    fireEvent.click(screen.getByText('B'));
    const right = screen.getByText('B').closest('button')!;
    expect(right).toHaveAttribute('data-state', 'right');
    expect(right).toHaveClass('border-success');
    expect(right).toHaveTextContent('Đúng');
    expect(screen.getByText('C').closest('button')).not.toHaveTextContent('Đúng');
  });
});

function SheetDemo({ kind, body }: { kind: 'normal' | 'confirm'; body?: () => React.ReactNode }) {
  const sheet = useSheet();
  return (
    <button type="button" onClick={() => sheet.open({ title: 'Tiêu đề', kind, body: body ?? (() => <button type="button">Bên trong</button>) })}>
      Mở
    </button>
  );
}

const withSheet = (ui: React.ReactNode) => withIntl(<SheetProvider>{ui}</SheetProvider>);

describe('C6 Sheet', () => {
  // @ac C6-AC02
  it('sheet thường đóng bằng nút đóng, lớp nền, Esc; sheet xác nhận không đóng khi nhấn lớp nền', () => {
    withSheet(<SheetDemo kind="normal" />);
    const open = () => fireEvent.click(screen.getByRole('button', { name: 'Mở' }));
    open();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    open();
    fireEvent.click(screen.getByTestId('sheet-scrim'));
    expect(screen.queryByRole('dialog')).toBeNull();
    open();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // @ac C6-AC02
  it('sheet xác nhận', () => {
    withSheet(<SheetDemo kind="confirm" />);
    fireEvent.click(screen.getByRole('button', { name: 'Mở' }));
    fireEvent.click(screen.getByTestId('sheet-scrim'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // @ac C6-AC04
  it('focus vào sheet, Tab không ra ngoài, đóng thì trả focus; thuộc tính trợ năng đúng', async () => {
    withSheet(<SheetDemo kind="normal" />);
    const opener = screen.getByRole('button', { name: 'Mở' });
    opener.focus();
    fireEvent.click(opener);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    const title = within(dialog).getByText('Tiêu đề');
    expect(dialog.getAttribute('aria-labelledby')).toBe(title.id);
    expect(dialog.contains(document.activeElement)).toBe(true);
    for (let i = 0; i < 5; i++) {
      fireEvent.keyDown(window, { key: 'Tab' });
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
    fireEvent.keyDown(window, { key: 'Escape' });
    await act(async () => {
      await new Promise((r) => setTimeout(r, 5));
    });
    expect(document.activeElement).toBe(opener);
  });
});

describe('C7 Thông báo ngắn', () => {
  const renderToasts = () =>
    render(
      <ToastProvider>
        <button type="button" onClick={() => notify('Đã lưu')}>
          A
        </button>
        <button type="button" onClick={() => notify('Có bản cập nhật', { action: { label: 'Cập nhật', onClick: () => {} } })}>
          B
        </button>
        <button type="button" onClick={() => notify('Lỗi', { kind: 'alert' })}>
          C
        </button>
      </ToastProvider>,
    );

  // @ac C7-AC02
  it('ẩn sau 3 giây hoặc 6 giây khi có nút; thông báo mới thay thông báo cũ', async () => {
    vi.useFakeTimers();
    renderToasts();
    await act(async () => {});
    fireEvent.click(screen.getByText('A'));
    await act(async () => void vi.advanceTimersByTime(2900));
    expect(screen.getByText('Đã lưu')).toBeInTheDocument();
    await act(async () => void vi.advanceTimersByTime(200));
    expect(screen.queryByText('Đã lưu')).toBeNull();
    fireEvent.click(screen.getByText('B'));
    await act(async () => void vi.advanceTimersByTime(5900));
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cập nhật' })).toBeInTheDocument();
    await act(async () => void vi.advanceTimersByTime(200));
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    fireEvent.click(screen.getByText('A'));
    await act(async () => {});
    fireEvent.click(screen.getByText('C'));
    await act(async () => {});
    expect(screen.queryByText('Đã lưu')).toBeNull();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
    act(() => dismiss());
  });

  // @ac C7-AC03
  it('role status cho xác nhận, alert cho lỗi; không lấy focus', async () => {
    renderToasts();
    await act(async () => {});
    const a = screen.getByText('A');
    a.focus();
    fireEvent.click(a);
    await act(async () => {});
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu');
    expect(document.activeElement).toBe(a);
    fireEvent.click(screen.getByText('C'));
    await act(async () => {});
    expect(screen.getByRole('alert')).toHaveTextContent('Lỗi');
    expect(document.activeElement).toBe(a);
  });
});

const OPTIONS = [
  { value: 'a', label: 'Đặt phòng', description: '12 câu' },
  { value: 'b', label: 'Ăn uống' },
  { value: 'c', label: 'Sân bay' },
];

describe('C8 Ô chọn một giá trị', () => {
  // @ac C8-AC01
  it('nút combobox có nhãn; mũi tên mở, di chuyển, Enter chọn; Escape đóng và trả focus', () => {
    const onChange = vi.fn();
    withIntl(<DropdownSelect value="a" onValueChange={onChange} options={OPTIONS} ariaLabel="Chủ đề" />);
    const trigger = screen.getByRole('combobox', { name: 'Chủ đề' });
    expect(trigger).toHaveTextContent('Đặt phòng');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    trigger.focus();
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const list = screen.getByRole('listbox');
    expect(document.activeElement).toBe(list);
    expect(screen.getByRole('option', { name: /Đặt phòng/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('option', { name: 'Ăn uống' })).toHaveAttribute('aria-selected', 'false');
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'ArrowDown' });
    fireEvent.keyDown(list, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('c');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    fireEvent.keyDown(trigger, { key: 'ArrowDown' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'End' });
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  // @ac C8-AC01
  it('nhãn hiển thị liên kết bằng labelledBy; bấm ra ngoài thì đóng', () => {
    withIntl(
      <div>
        <span id="nhan">Trạng thái</span>
        <DropdownSelect value="b" onValueChange={() => {}} options={OPTIONS} labelledBy="nhan" />
        <p>ngoài</p>
      </div>,
    );
    const trigger = screen.getByRole('combobox', { name: /Trạng thái/ });
    fireEvent.click(trigger);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByText('ngoài'));
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  // @ac C8-AC02
  it('ô lọc: gõ không dấu vẫn khớp chữ có dấu; không khớp gì thì báo; Escape trong ô lọc không đóng sheet bao ngoài', () => {
    const onChange = vi.fn();
    withSheet(<SheetDemo kind="normal" body={() => <DropdownSelect value="a" onValueChange={onChange} options={OPTIONS} ariaLabel="Chủ đề" searchable />} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mở' }));
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('combobox', { name: 'Chủ đề' }));
    const search = within(dialog).getByRole('searchbox', { name: 'Tìm' });
    expect(document.activeElement).toBe(search);
    fireEvent.change(search, { target: { value: 'an uong' } });
    expect(within(dialog).getAllByRole('option').map((o) => o.textContent)).toEqual(['Ăn uống']);
    fireEvent.keyDown(search, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('b');
    fireEvent.click(within(dialog).getByRole('combobox', { name: 'Chủ đề' }));
    fireEvent.change(within(dialog).getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(within(dialog).queryAllByRole('option')).toHaveLength(0);
    expect(within(dialog).getByText('Không có mục nào khớp.')).toBeInTheDocument();
    fireEvent.keyDown(within(dialog).getByRole('searchbox'), { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
