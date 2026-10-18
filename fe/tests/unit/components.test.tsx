import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { useEffect } from 'react';
import { Strip } from '../../src/components/C2-dai-8-o/Strip';
import { Button } from '../../src/components/C3-nut/Button';
import { Choices } from '../../src/components/C4-lua-chon/Choices';
import { TabBar } from '../../src/components/C5-thanh-tab/TabBar';
import { SentenceCard } from '../../src/components/C1-the-cau/SentenceCard';
import { SheetProvider, useSheet } from '../../src/components/C6-sheet/SheetHost';
import { ToastProvider, useToast } from '../../src/components/C7-thong-bao/ToastHost';
import { FixtureSource, loadCatalog, loadLanguageData } from '../../src/data';
import { fakeSpeech, settle, withProviders } from './helpers';

afterEach(() => {
  vi.useRealTimers();
  // gỡ speechSynthesis giả nếu có
  delete (window as unknown as Record<string, unknown>).speechSynthesis;
  delete (globalThis as unknown as Record<string, unknown>).SpeechSynthesisUtterance;
});

const plain = { id: 1, en: 'I want to...', vi: 'Tôi muốn...' };

describe('C1 Thẻ câu', () => {
  // @ac C1-AC02
  it('chế độ che: nút Nghe khóa; chạm khối che, Space, Enter đều hiện câu gốc, sự kiện phát một lần mỗi lượt', async () => {
    for (const how of ['click', 'space', 'enter'] as const) {
      const onReveal = vi.fn();
      const { unmount, container } = withProviders(<SentenceCard item={plain} lang="en" langName="Tiếng Anh" covered onReveal={onReveal} />);
      await settle();
      expect(screen.getByRole('button', { name: /Nghe$/ })).toHaveAttribute('aria-disabled', 'true');
      const card = container.querySelector('article')!;
      if (how === 'click') fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
      else fireEvent.keyDown(card, { key: how === 'space' ? ' ' : 'Enter' });
      expect(onReveal).toHaveBeenCalledTimes(1);
      unmount();
    }
  });

  // @ac C1-AC03
  it('sau khi hiện, không phần tử nào trong thẻ che lại câu gốc', async () => {
    withProviders(<SentenceCard item={plain} lang="en" langName="Tiếng Anh" />);
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
    const seed = { 'vitasr2.settings': { schema: 1, packByLang: {}, voiceByLang: { en: 'gb' }, rate: 1.25, theme: 'system', weeklyGoal: 5, guideSeen: true } };
    const { unmount } = withProviders(<SentenceCard item={plain} lang="en" langName="Tiếng Anh" />, { seed });
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

  // @ac C1-AC06
  it('không có giọng ngôn ngữ đích: nút khóa, có câu thông báo và liên kết mở Giọng đọc', async () => {
    fakeSpeech([{ lang: 'vi-VN', voiceURI: 'vi', name: 'VI' }]);
    const open = vi.fn();
    withProviders(<SentenceCard item={plain} lang="en" langName="Tiếng Anh" onOpenVoices={open} />);
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
    const a = withProviders(<SentenceCard item={plain} lang="en" langName="Tiếng Anh" />);
    await act(async () => {});
    const text = 'Thiết bị chưa có giọng tiếng Anh. Mở Cài đặt > Giọng đọc.';
    const pending = a.container.querySelector('.card__novoice');
    expect(pending).toHaveClass('card__novoice--pending');
    expect(pending).toHaveAttribute('aria-hidden', 'true');
    expect(pending).toHaveTextContent(text);
    expect(pending!.previousElementSibling).toHaveClass('card__audio');
    expect(screen.queryByRole('button', { name: 'Cài đặt > Giọng đọc' })).toBeNull();
    await act(async () => {
      vi.advanceTimersByTime(1500);
    });
    const shown = a.container.querySelector('.card__novoice');
    expect(shown).not.toHaveClass('card__novoice--pending');
    expect(shown).not.toHaveAttribute('aria-hidden');
    expect(shown).toHaveTextContent(text);
    expect(shown!.previousElementSibling).toHaveClass('card__audio');
    expect(screen.getByRole('button', { name: 'Cài đặt > Giọng đọc' })).toBeInTheDocument();
    a.unmount();

    fakeSpeech([{ lang: 'en-US', voiceURI: 'en', name: 'EN' }]);
    const b = withProviders(<SentenceCard item={plain} lang="en" langName="Tiếng Anh" />);
    await act(async () => {});
    expect(b.container.querySelector('.card__novoice')).toBeNull();
  });

  // @ac C1-AC07, DATA-AC04
  it('Cách dùng và ruby chỉ có khi item có trường tương ứng', async () => {
    const src = new FixtureSource();
    const cat = await loadCatalog(src);
    const ja = await loadLanguageData(src, cat, 'ja', 'fluency');
    const g = await loadLanguageData(src, cat, 'en', 'global');
    const f = await loadLanguageData(src, cat, 'en', 'fluency');
    const a = withProviders(<SentenceCard item={g.items[0]} lang="en" langName="Tiếng Anh" />);
    await settle();
    expect(screen.getByText(/^Cách dùng: /)).toBeInTheDocument();
    a.unmount();
    const kanji = ja.items.find((i) => i.furigana?.some((seg) => seg.length === 2))!;
    const b = withProviders(<SentenceCard item={kanji} lang="ja" langName="Tiếng Nhật" />);
    await settle();
    expect(b.container.querySelector('ruby')).not.toBeNull();
    b.unmount();
    const c = withProviders(<SentenceCard item={f.items[0]} lang="en" langName="Tiếng Anh" />);
    await settle();
    expect(screen.queryByText(/^Cách dùng: /)).toBeNull();
    expect(c.container.querySelector('ruby')).toBeNull();
    expect(c.container.querySelector('.card__reading')).toBeNull();
  });

  // @ac C1-AC08
  it('thuộc tính lang của câu gốc và nghĩa', async () => {
    const { container, unmount } = withProviders(<SentenceCard item={plain} lang="en" langName="Tiếng Anh" />);
    await settle();
    expect(container.querySelector('.card__source')).toHaveAttribute('lang', 'en');
    expect(container.querySelector('.card__meaning')).toHaveAttribute('lang', 'vi');
    unmount();
    const r = withProviders(<SentenceCard item={{ id: 2, en: '何', vi: 'Gì' }} lang="ja" langName="Tiếng Nhật" />);
    await settle();
    expect(r.container.querySelector('.card__source')).toHaveAttribute('lang', 'ja');
  });
});

describe('C2 Dải 8 ô', () => {
  // Kích thước ô 10 x 10 px và khoảng cách 4 px kiểm trong test giao diện (C2-AC01).
  it('số ô bằng số câu', () => {
    const { container, rerender } = render(<Strip cells={Array(8).fill('chua')} />);
    expect(container.querySelectorAll('li')).toHaveLength(8);
    rerender(<Strip cells={Array(5).fill('chua')} />);
    expect(container.querySelectorAll('li')).toHaveLength(5);
  });

  // @ac C2-AC03
  it('nhãn trợ năng của dải và từng ô; không ô nào nhận focus', () => {
    render(<Strip cells={['nho', 'can-on', 'dang', 'chua']} />);
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
    render(<Choices options={options} onWrong={onWrong} onCorrect={onCorrect} />);
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
    const { container } = render(<Choices options={options} />);
    fireEvent.click(screen.getByText('A'));
    expect(screen.getByTestId('choices-live')).toHaveTextContent('Chưa đúng, thử lại');
    fireEvent.click(screen.getByText('B'));
    expect(screen.getByTestId('choices-live')).toHaveTextContent('Đúng');
    expect(container.querySelector('[data-icon="sai"]')).not.toBeNull();
    expect(container.querySelector('[data-icon="dung"]')).not.toBeNull();
  });

  // @ac C4-AC02
  // @ac C4-AC03
  it('lựa chọn sai có lớp màu đỏ và chữ "Chưa đúng" nhìn thấy được; lựa chọn đúng có chữ "Đúng"', () => {
    render(<Choices options={options} />);
    fireEvent.click(screen.getByText('A'));
    const wrong = screen.getByText('A').closest('button')!;
    expect(wrong).toHaveClass('choice--wrong');
    expect(wrong).toHaveTextContent('Chưa đúng');
    fireEvent.click(screen.getByText('B'));
    const right = screen.getByText('B').closest('button')!;
    expect(right).toHaveClass('choice--right');
    expect(right).toHaveTextContent('Đúng');
    expect(screen.getByText('C').closest('button')).not.toHaveTextContent('Đúng');
  });
});

describe('C5 Thanh tab', () => {
  // @ac C5-AC03
  it('đúng một mục có aria-current ở mỗi route', () => {
    for (const r of ['hoc', 'luyen-tap', 'thu-vien', 'tien-bo'] as const) {
      const { unmount } = render(<TabBar current={r} reviewCount={0} />);
      const cur = screen.getAllByRole('link').filter((a) => a.getAttribute('aria-current') === 'page');
      expect(cur).toHaveLength(1);
      expect(cur[0].getAttribute('href')).toBe(`#/${r}`);
      unmount();
    }
  });

  // @ac C5-AC04
  it('mục Luyện tập hiện số câu cần ôn', () => {
    const { rerender } = render(<TabBar current="hoc" reviewCount={12} />);
    expect(screen.getByRole('link', { name: 'Luyện tập, 12 câu cần ôn' })).toHaveTextContent('12');
    rerender(<TabBar current="hoc" reviewCount={0} />);
    expect(screen.queryByText('12')).toBeNull();
    expect(screen.getByRole('link', { name: 'Luyện tập' })).toBeInTheDocument();
  });
});

function SheetDemo({ kind }: { kind: 'normal' | 'confirm' }) {
  const sheet = useSheet();
  return (
    <button type="button" onClick={() => sheet.open({ title: 'Tiêu đề', kind, body: () => <button type="button">Bên trong</button> })}>
      Mở
    </button>
  );
}

describe('C6 Sheet', () => {
  // @ac C6-AC02
  it('sheet thường đóng bằng nút đóng, lớp nền, Esc; sheet xác nhận không đóng khi chạm lớp nền', () => {
    render(
      <SheetProvider>
        <SheetDemo kind="normal" />
      </SheetProvider>,
    );
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

  it('sheet xác nhận', () => {
    render(
      <SheetProvider>
        <SheetDemo kind="confirm" />
      </SheetProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Mở' }));
    fireEvent.click(screen.getByTestId('sheet-scrim'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  // @ac C6-AC04
  it('focus vào sheet, Tab không ra ngoài, đóng thì trả focus; thuộc tính trợ năng đúng', async () => {
    render(
      <SheetProvider>
        <SheetDemo kind="normal" />
      </SheetProvider>,
    );
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

function ToastDemo() {
  const t = useToast();
  useEffect(() => void 0, []);
  return (
    <>
      <button type="button" onClick={() => t.show({ text: 'Đã lưu' })}>
        A
      </button>
      <button type="button" onClick={() => t.show({ text: 'Có bản cập nhật', action: { label: 'Cập nhật', onClick: () => {} } })}>
        B
      </button>
      <button type="button" onClick={() => t.show({ text: 'Lỗi', kind: 'alert' })}>
        C
      </button>
    </>
  );
}

describe('C7 Thông báo ngắn', () => {
  // @ac C7-AC02
  it('ẩn sau 3 giây hoặc 6 giây khi có nút; thông báo mới thay thông báo cũ', () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByText('A'));
    act(() => void vi.advanceTimersByTime(2900));
    expect(screen.getByText('Đã lưu')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.queryByText('Đã lưu')).toBeNull();
    fireEvent.click(screen.getByText('B'));
    act(() => void vi.advanceTimersByTime(5900));
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    fireEvent.click(screen.getByText('A'));
    fireEvent.click(screen.getByText('C'));
    expect(screen.queryByText('Đã lưu')).toBeNull();
    expect(screen.getAllByRole('alert')).toHaveLength(1);
  });

  // @ac C7-AC03
  it('role status cho xác nhận, alert cho lỗi; không lấy focus', () => {
    render(
      <ToastProvider>
        <ToastDemo />
      </ToastProvider>,
    );
    const a = screen.getByText('A');
    a.focus();
    fireEvent.click(a);
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu');
    expect(document.activeElement).toBe(a);
    fireEvent.click(screen.getByText('C'));
    expect(screen.getByRole('alert')).toHaveTextContent('Lỗi');
  });
});
