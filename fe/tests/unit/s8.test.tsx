import { describe, expect, it, vi, afterEach } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { appReload, registerServiceWorker, signalUpdate as signalUpdateForTest } from '../../src/app/updates';
import { fileIO } from '../../src/pages/S8-cai-dat/S8CaiDat';
import { NOW, PROGRESS_30, fakeSpeech, hash, memoryBackend, progressSeed, renderApp, settingsSeed, settle } from './helpers';

afterEach(() => vi.restoreAllMocks());

const GLOBAL = { packByLang: { en: 'global' } };
const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
const progressKey = 'vitasr2.progress.fluency.en';

async function openVoices() {
  fireEvent.click(screen.getByRole('button', { name: /Giọng đọc/ }));
  await settle();
  return screen.getByRole('dialog', { name: 'Giọng đọc' });
}

describe('S8 Cài đặt', () => {
  // @ac S8-AC01
  it('mục tiêu tuần trong khoảng 1 đến 21; đổi thành 7 thì T1 hiện x/7; chạm Ngôn ngữ đang học mở sheet', async () => {
    let r = await renderApp('#/cai-dat', { seed: settingsSeed({ weeklyGoal: 2 }) });
    const minus = () => screen.getByRole('button', { name: 'Giảm mục tiêu' });
    const plus = () => screen.getByRole('button', { name: 'Tăng mục tiêu' });
    fireEvent.click(minus());
    await settle();
    expect(screen.getByTestId('s8-goal')).toHaveTextContent('1 phiên');
    expect(minus()).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(minus());
    await settle();
    expect(screen.getByTestId('s8-goal')).toHaveTextContent('1 phiên');
    r.unmount();
    r = await renderApp('#/cai-dat', { seed: settingsSeed({ weeklyGoal: 20 }) });
    fireEvent.click(plus());
    fireEvent.click(plus());
    await settle();
    expect(screen.getByTestId('s8-goal')).toHaveTextContent('21 phiên');
    expect(plus()).toHaveAttribute('aria-disabled', 'true');
    r.unmount();
    r = await renderApp('#/cai-dat', { seed: settingsSeed() });
    fireEvent.click(plus());
    fireEvent.click(plus());
    await settle();
    expect(JSON.parse(r.mem.get('vitasr2.settings')!).weeklyGoal).toBe(7);
    fireEvent.click(screen.getByRole('button', { name: /Ngôn ngữ đang học/ }));
    await settle();
    expect(screen.getByRole('dialog', { name: 'Đổi ngôn ngữ hoặc bộ nội dung' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Đóng' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await settle();
    expect(hash()).toBe('#/hoc');
    expect(screen.getByText('Tuần này: 0/7 phiên')).toBeInTheDocument();
  });

  // @ac S8-AC02
  it('Giọng đọc: liệt kê giọng theo ngôn ngữ; chọn giọng và tốc độ 1,25x thì thẻ câu đọc đúng giọng và rate', async () => {
    const synth = fakeSpeech([
      { lang: 'en-US', voiceURI: 'us', name: 'Giọng US' },
      { lang: 'en-GB', voiceURI: 'gb', name: 'Giọng GB' },
      { lang: 'en-AU', voiceURI: 'au', name: 'Giọng AU' },
      { lang: 'vi-VN', voiceURI: 'vi', name: 'Giọng VI' },
    ]);
    await renderApp('#/cai-dat', { seed: settingsSeed() });
    const dialog = await openVoices();
    const names = () => within(dialog).getAllByRole('radio', { name: /Giọng|Tự động/ }).map((r) => r.closest('label')!.textContent);
    // Đang học bộ English Fluency (en-US): Tự động chọn giọng en-US như thẻ câu khi không có giọng Google (S8-02).
    expect(names()).toEqual(['Tự độngĐang dùng Giọng US', 'Giọng USen-US', 'Giọng GBen-GB', 'Giọng AUen-AU']);
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Tiếng Việt' }));
    await settle();
    expect(names()).toEqual(['Tự độngĐang dùng Giọng VI', 'Giọng VIvi-VN']);
    fireEvent.click(within(dialog).getByRole('radio', { name: 'Tiếng Anh' }));
    await settle();
    fireEvent.click(within(dialog).getByRole('radio', { name: /Giọng GB/ }));
    fireEvent.click(within(dialog).getByRole('radio', { name: '1,25x' }));
    await settle();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Nghe thử Giọng GB' }));
    expect((synth.speak.mock.calls.at(-1)![0] as { voice: { voiceURI: string } }).voice.voiceURI).toBe('gb');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xong' }));
    await settle();
    expect(screen.getByRole('button', { name: /Giọng đọc/ })).toHaveTextContent('Giọng GB');
    fireEvent.click(screen.getByRole('link', { name: 'Học' }));
    await settle(30);
    synth.speak.mockClear();
    fireEvent.click(screen.getByRole('button', { name: /^Nghe$/ }));
    const u = synth.speak.mock.calls[0][0] as { voice: { voiceURI: string }; rate: number; text: string };
    expect(u.voice.voiceURI).toBe('gb');
    expect(u.rate).toBe(1.25);
  });

  // @ac S8-AC02
  it('không có giọng cho ngôn ngữ: hiện câu hướng dẫn; mở từ liên kết ?giong=1 thì mở sẵn sheet', async () => {
    fakeSpeech([{ lang: 'vi-VN', voiceURI: 'vi', name: 'Giọng VI' }]);
    await renderApp('#/cai-dat?giong=1', { seed: settingsSeed() });
    const dialog = screen.getByRole('dialog', { name: 'Giọng đọc' });
    expect(dialog).toHaveTextContent('Thiết bị chưa có giọng tiếng Anh. Thêm giọng trong cài đặt hệ thống của thiết bị rồi mở lại app.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xong' }));
    await settle();
    expect(hash()).toBe('#/cai-dat');
  });

  // @ac S8-AC04
  it('tiếng Anh không có mục Âm thanh ngoại tuyến', async () => {
    await renderApp('#/cai-dat', { seed: settingsSeed() });
    expect(screen.getByText('Giọng đọc')).toBeInTheDocument();
    expect(screen.queryByText(/Âm thanh ngoại tuyến/)).toBeNull();
  });

  // @ac S8-AC05
  it('chọn Tối thì áp dụng ngay và giữ sau khi tải lại', async () => {
    const { backend, mem } = memoryBackend(settingsSeed());
    const r = await renderApp('#/cai-dat', { backend });
    fireEvent.click(screen.getByRole('radio', { name: 'Tối' }));
    await settle();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(JSON.parse(mem.get('vitasr2.settings')!).theme).toBe('dark');
    r.unmount();
    document.documentElement.removeAttribute('data-theme');
    await renderApp('#/cai-dat', { backend });
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(screen.getByRole('radio', { name: 'Tối' })).toBeChecked();
  });

  // @ac S8-AC06
  it('xuất rồi xóa rồi nhập lại: tiến độ như cũ; file sai hoặc của ngôn ngữ khác: báo lỗi, không đổi; Xóa chỉ mở khi gõ đúng tên', async () => {
    let exported = { name: '', text: '' };
    vi.spyOn(fileIO, 'download').mockImplementation((name, text) => void (exported = { name, text }));
    const r = await renderApp('#/cai-dat', { seed: { ...settingsSeed(), ...progressSeed() } });
    const before = r.mem.get(progressKey)!;
    fireEvent.click(screen.getByRole('button', { name: 'Xuất tiến độ' }));
    expect(exported.name).toBe('vitasr-tien-do-en-2026-10-08.json');
    expect(JSON.parse(exported.text).progress).toEqual(PROGRESS_30);
    expect(JSON.parse(exported.text).settings.lang).toBe('en');

    // Xóa: nút khóa tới khi gõ đúng tên ngôn ngữ.
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tiến độ tiếng Anh' }));
    await settle();
    let dialog = screen.getByRole('dialog', { name: 'Xóa tiến độ tiếng Anh' });
    const del = within(dialog).getByRole('button', { name: 'Xóa' });
    expect(del).toHaveAttribute('aria-disabled', 'true');
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Tên ngôn ngữ' }), { target: { value: 'Tiếng Nhật' } });
    await settle();
    expect(del).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(del);
    expect(r.mem.get(progressKey)).toBe(before);
    fireEvent.change(within(dialog).getByRole('textbox', { name: 'Tên ngôn ngữ' }), { target: { value: 'Tiếng Anh' } });
    await settle();
    expect(del).not.toHaveAttribute('aria-disabled');
    fireEvent.click(del);
    await settle();
    expect(hash()).toBe('#/hoc');
    expect(screen.getByText('Đã xóa tiến độ')).toBeInTheDocument();
    expect(JSON.parse(r.mem.get(progressKey)!)).toEqual({ schema: 1, sessions: [], attempts: [], items: {} });

    // Nhập lại file vừa xuất.
    fireEvent.click(screen.getByRole('link', { name: 'Cài đặt' }));
    await settle(30);
    const input = () => screen.getByTestId('s8-import') as HTMLInputElement;
    fireEvent.change(input(), { target: { files: [new File([exported.text], 'tien-do.json', { type: 'application/json' })] } });
    await settle(50);
    dialog = screen.getByRole('dialog', { name: 'Nhập tiến độ' });
    expect(dialog).toHaveTextContent('Thay tiến độ tiếng Anh (English Fluency) hiện tại bằng tệp này?');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Nhập tiến độ' }));
    await settle();
    expect(screen.getByText('Đã nhập tiến độ')).toBeInTheDocument();
    expect(JSON.parse(r.mem.get(progressKey)!)).toEqual(JSON.parse(before));

    // Tệp của ngôn ngữ khác, của bộ nội dung khác và tệp JSON bất kỳ.
    const after = r.mem.get(progressKey);
    const other = JSON.stringify({ ...JSON.parse(exported.text), lang: 'ja' });
    const otherPack = JSON.stringify({ ...JSON.parse(exported.text), pack: 'global' });
    for (const text of [other, otherPack, '{"hello": "world"}']) {
      fireEvent.change(input(), { target: { files: [new File([text], 'x.json', { type: 'application/json' })] } });
      await settle(50);
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Tệp này không phải tệp tiến độ học tiếng Anh (English Fluency) của VITASR. Chọn tệp đã xuất bằng Xuất tiến độ khi đang học tiếng Anh (English Fluency).',
      );
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(r.mem.get(progressKey)).toBe(after);
    }
  });

  // @ac S8-AC08, S9-AC05
  it('Xem lại hướng dẫn: về T1, bắt đầu từ bước 1, bước 3 có Xong; dòng phiên bản khớp package.json', async () => {
    await renderApp('#/cai-dat', { seed: settingsSeed() });
    expect(screen.getByTestId('s8-version')).toHaveTextContent(`Phiên bản ${pkg.version}`);
    fireEvent.click(screen.getByRole('button', { name: 'Xem lại hướng dẫn' }));
    await settle(80);
    expect(hash()).toBe('#/hoc?huong-dan=1');
    expect(screen.getByText('Bước 1/3')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    await settle();
    expect(screen.getByText('Bước 3/3')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xong' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Bắt đầu học' })).toBeNull();
  });

  // @ac S8-AC10
  it('Global English: hiện Tiếng Anh và Global English; sheet Đổi ngôn ngữ có hai dòng Tiếng Anh', async () => {
    await renderApp('#/cai-dat', { seed: settingsSeed(GLOBAL) });
    const row = screen.getByRole('button', { name: /Ngôn ngữ đang học/ });
    expect(row).toHaveTextContent('Tiếng Anh');
    expect(row).toHaveTextContent('Global English');
    fireEvent.click(row);
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Đổi ngôn ngữ hoặc bộ nội dung' });
    expect(within(dialog).getByText('Tiếng Anh, Global English')).toBeInTheDocument();
    expect(within(dialog).getByText('Tiếng Anh, English Fluency')).toBeInTheDocument();
  });

  it('S8 có nút Quay lại thay cho tên ngôn ngữ, thanh tab vẫn hiện và không mục nào đang chọn', async () => {
    await renderApp('#/thu-vien', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('link', { name: 'Cài đặt' }));
    await settle(30);
    expect(document.querySelector('.topbar__lang')).toBeNull();
    expect(screen.getByRole('button', { name: 'Quay lại' })).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Điều hướng chính' });
    expect(nav.querySelector('[aria-current="page"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await settle();
    expect(hash()).toBe('#/thu-vien');
  });
});

describe('APP-10 bản cập nhật', () => {
  function fakeContainer() {
    const worker = Object.assign(new EventTarget(), { state: 'installing' });
    const reg = Object.assign(new EventTarget(), { installing: worker });
    return {
      container: { controller: {}, register: vi.fn(async () => reg as unknown as ServiceWorkerRegistration) },
      activate: () => {
        reg.dispatchEvent(new Event('updatefound'));
        worker.state = 'activated';
        worker.dispatchEvent(new Event('statechange'));
      },
    };
  }

  // @ac APP-AC15
  it('có bản mới: thông báo hiện ở T1, không hiện khi đang ở S3; trang không tự tải lại', async () => {
    const reload = vi.spyOn(appReload, 'run').mockImplementation(() => {});
    await renderApp('#/hoc', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    expect(hash()).toMatch(/^#\/phien-hoc/);
    const sw = fakeContainer();
    registerServiceWorker(sw.container);
    await settle();
    expect(sw.container.register).toHaveBeenCalledWith('./sw.js');
    await act(async () => sw.activate());
    await settle();
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    expect(reload).not.toHaveBeenCalled();
    // Rời S3 về T1: thông báo hiện, có nút Cập nhật; chỉ tải lại khi bấm.
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dừng' }));
    await settle();
    expect(hash()).toBe('#/hoc');
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cập nhật' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  // @ac APP-AC15
  it('lần cài đầu tiên (chưa có service worker nào) thì không báo cập nhật mà nạp dữ liệu vào bộ nhớ ngoại tuyến', async () => {
    await renderApp('#/hoc', { seed: settingsSeed() });
    const sw = fakeContainer();
    sw.container.controller = null as unknown as object;
    const warm = vi.fn();
    registerServiceWorker(sw.container, { onFirstControl: warm });
    await settle();
    await act(async () => sw.activate());
    await settle();
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    expect(warm).toHaveBeenCalledTimes(1);
    expect(NOW).toBeGreaterThan(0);
  });
});

describe('APP-11 khi hướng dẫn đang mở', () => {
  // @ac APP-AC16
  it('Tab chỉ đi trong bong bóng hướng dẫn, không tới được nút mở sheet Đổi ngôn ngữ', async () => {
    await renderApp('#/hoc', { seed: settingsSeed({ guideSeen: false }) });
    expect(screen.getByText('Bước 1/3')).toBeInTheDocument();
    const lang = document.querySelector('.topbar__lang')!;
    const seen = new Set<Element | null>();
    for (let i = 0; i < 6; i++) {
      fireEvent.keyDown(window, { key: 'Tab' });
      seen.add(document.activeElement);
    }
    expect(seen.has(lang)).toBe(false);
    expect([...seen].every((el) => el?.closest('.guide__bubble'))).toBe(true);
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });
});

describe('APP-10 thông báo cập nhật khi vào S3', () => {
  // @ac APP-AC15
  it('đang hiện thông báo ở T1 mà vào S3 thì thông báo ẩn, về T1 thì hiện lại', async () => {
    vi.spyOn(appReload, 'run').mockImplementation(() => {});
    await renderApp('#/hoc', { seed: settingsSeed() });
    signalUpdateForTest();
    await settle();
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    expect(hash()).toMatch(/^#\/phien-hoc/);
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dừng' }));
    await settle(30);
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
  });
});
