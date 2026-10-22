import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen, within } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { appReload, registerServiceWorker, signalUpdate } from '@/lib/updates';
import { fileIO } from '@/views/cai-dat/utils/file-io';
import { PROGRESS_30, TEST_USER, fakeAuth, fakeSpeech, here, memoryBackend, progressSeed, renderApp, settingsSeed, settle } from './helpers';
import { routerCalls } from './router-mock';
import { GLOBAL, KEY, chooseOption, drainHistory } from './page-helpers';

afterEach(async () => {
  await drainHistory();
  vi.restoreAllMocks();
});

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };

async function openVoices() {
  fireEvent.click(screen.getByTestId('s8-voice-row'));
  await settle();
  return screen.getByRole('dialog', { name: 'Giọng đọc' });
}

/** Các lựa chọn của ô chọn đang mở: nhãn kèm dòng phụ. */
async function voiceOptions(dialog: HTMLElement) {
  fireEvent.click(within(dialog).getByRole('combobox', { name: /^Giọng / }));
  await settle();
  const list = within(dialog).getByRole('listbox');
  const out = within(list)
    .getAllByRole('option')
    .map((o) => [...o.querySelectorAll('span.block')].map((s) => s.textContent).join(' | '));
  fireEvent.keyDown(document.activeElement!, { key: 'Escape' });
  await settle();
  return out;
}

describe('S8 Cài đặt', () => {
  // @ac S8-AC01
  it('mục tiêu tuần trong khoảng 1 đến 21; đổi thành 7 thì T1 hiện x/7; chạm Ngôn ngữ đang học mở sheet', async () => {
    let r = await renderApp('/cai-dat', { seed: settingsSeed({ weeklyGoal: 2 }) });
    const minus = () => screen.getByRole('button', { name: 'Giảm mục tiêu' });
    const plus = () => screen.getByRole('button', { name: 'Tăng mục tiêu' });
    expect(screen.getByRole('group', { name: 'Mục tiêu mỗi tuần' })).toBeInTheDocument();
    fireEvent.click(minus());
    await settle();
    expect(screen.getByTestId('s8-goal')).toHaveTextContent('1 phiên');
    expect(minus()).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(minus());
    await settle();
    expect(screen.getByTestId('s8-goal')).toHaveTextContent('1 phiên');
    r.unmount();
    r = await renderApp('/cai-dat', { seed: settingsSeed({ weeklyGoal: 20 }) });
    fireEvent.click(plus());
    await settle();
    fireEvent.click(plus());
    await settle();
    expect(screen.getByTestId('s8-goal')).toHaveTextContent('21 phiên');
    expect(plus()).toHaveAttribute('aria-disabled', 'true');
    r.unmount();
    r = await renderApp('/cai-dat', { seed: settingsSeed() });
    fireEvent.click(plus());
    await settle();
    fireEvent.click(plus());
    await settle();
    expect(JSON.parse(r.mem.get('vitasr2.settings')!).weeklyGoal).toBe(7);
    fireEvent.click(screen.getByRole('button', { name: /Ngôn ngữ đang học/ }));
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Đổi ngôn ngữ hoặc bộ nội dung' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Đóng' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await settle(30);
    expect(here()).toBe('/hoc');
    expect(screen.getByText('Tuần này: 0/7 phiên')).toBeInTheDocument();
  });

  // @ac S8-AC02
  it('Giọng đọc: liệt kê giọng theo ngôn ngữ; chọn giọng và tốc độ 1,25x thì thẻ câu đọc đúng giọng và rate; Nghe thử đọc bằng giọng đang chọn', async () => {
    const synth = fakeSpeech([
      { lang: 'en-US', voiceURI: 'us', name: 'Giọng US' },
      { lang: 'en-GB', voiceURI: 'gb', name: 'Giọng GB' },
      { lang: 'en-AU', voiceURI: 'au', name: 'Giọng AU' },
      { lang: 'vi-VN', voiceURI: 'vi', name: 'Giọng VI' },
    ]);
    await renderApp('/cai-dat', { seed: settingsSeed() });
    const dialog = await openVoices();
    // Đang học bộ English Fluency (en-US): Tự động chọn giọng en-US như thẻ câu khi không có giọng Google (S8-02).
    expect(await voiceOptions(dialog)).toEqual(['Tự động | Đang dùng Giọng US', 'Giọng US | en-US', 'Giọng GB | en-GB', 'Giọng AU | en-AU']);
    await chooseOption(/^Chọn giọng cho/, 'Tiếng Việt', dialog);
    expect(await voiceOptions(dialog)).toEqual(['Tự động | Đang dùng Giọng VI', 'Giọng VI | vi-VN']);
    await chooseOption(/^Chọn giọng cho/, 'Tiếng Anh', dialog);
    await chooseOption(/^Giọng tiếng Anh/, /^Giọng GB/, dialog);
    await chooseOption(/^Tốc độ đọc/, '1,25x', dialog);
    expect(within(dialog).getByRole('combobox', { name: /^Giọng tiếng Anh/ })).toHaveTextContent('Giọng GB');
    expect(within(dialog).getByRole('combobox', { name: /^Tốc độ đọc/ })).toHaveTextContent('1,25x');
    synth.speak.mockClear();
    fireEvent.click(within(dialog).getByTestId('s8-voice-test'));
    const sample = synth.speak.mock.calls.at(-1)![0] as { voice: { voiceURI: string }; rate: number; text: string };
    expect(sample.voice.voiceURI).toBe('gb');
    expect(sample.rate).toBe(1.25);
    expect(sample.text).toBe('I want to...');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xong' }));
    await settle();
    expect(screen.getByTestId('s8-voice-row')).toHaveTextContent('Giọng GB');
    fireEvent.click(screen.getByRole('link', { name: 'Học' }));
    await settle(30);
    synth.speak.mockClear();
    fireEvent.click(within(screen.getByTestId('sentence-card')).getByRole('button', { name: 'Nghe' }));
    const u = synth.speak.mock.calls[0][0] as { voice: { voiceURI: string }; rate: number; text: string };
    expect(u.voice.voiceURI).toBe('gb');
    expect(u.rate).toBe(1.25);
  });

  // @ac S8-AC02
  it('không có giọng cho ngôn ngữ: hiện câu hướng dẫn; mở từ liên kết ?giong=1 thì mở sẵn sheet', async () => {
    fakeSpeech([{ lang: 'vi-VN', voiceURI: 'vi', name: 'Giọng VI' }]);
    await renderApp('/cai-dat?giong=1', { seed: settingsSeed() });
    const dialog = screen.getByRole('dialog', { name: 'Giọng đọc' });
    expect(dialog).toHaveTextContent('Thiết bị chưa có giọng tiếng Anh. Thêm giọng trong cài đặt hệ thống của thiết bị rồi mở lại app.');
    fireEvent.click(within(dialog).getByRole('button', { name: 'Xong' }));
    await settle(30);
    expect(here()).toBe('/cai-dat');
  });

  // @ac S8-AC04
  it('tiếng Anh không có mục Âm thanh ngoại tuyến', async () => {
    await renderApp('/cai-dat', { seed: settingsSeed() });
    expect(within(screen.getByRole('region', { name: 'Âm thanh' })).getByText('Giọng đọc')).toBeInTheDocument();
    expect(screen.queryByText(/Âm thanh ngoại tuyến/)).toBeNull();
  });

  // @ac S8-AC05
  it('chọn Tối thì áp dụng ngay và giữ sau khi tải lại', async () => {
    const { backend } = memoryBackend(settingsSeed());
    const r = await renderApp('/cai-dat', { backend });
    expect(document.documentElement).not.toHaveClass('dark');
    await chooseOption(/^Sáng, tối/, 'Tối');
    expect(document.documentElement).toHaveClass('dark');
    expect(window.localStorage.getItem('vitasr2.theme')).toBe('dark');
    r.unmount();
    document.documentElement.classList.remove('dark');
    await renderApp('/cai-dat', { backend });
    expect(document.documentElement).toHaveClass('dark');
    expect(screen.getByRole('combobox', { name: /^Sáng, tối/ })).toHaveTextContent('Tối');
    await chooseOption(/^Sáng, tối/, 'Sáng');
    expect(document.documentElement).not.toHaveClass('dark');
  });

  // @ac S8-AC06
  it('xuất rồi xóa rồi nhập lại: tiến độ như cũ; file sai hoặc của ngôn ngữ khác: báo lỗi, không đổi; Xóa chỉ mở khi gõ đúng tên', async () => {
    let exported = { name: '', text: '' };
    vi.spyOn(fileIO, 'download').mockImplementation((name, text) => void (exported = { name, text }));
    const r = await renderApp('/cai-dat', { seed: { ...settingsSeed(), ...progressSeed() } });
    const before = JSON.parse(r.mem.get(KEY)!);
    fireEvent.click(screen.getByRole('button', { name: 'Xuất tiến độ' }));
    expect(exported.name).toBe('vitasr-tien-do-en-2026-10-08.json');
    const file = JSON.parse(exported.text);
    expect(file).toMatchObject({ app: 'vitasr2', kind: 'tien-do', pack: 'fluency', lang: 'en' });
    expect(file.progress).toMatchObject(PROGRESS_30);
    expect(file.settings.lang).toBe('en');

    // Xóa: nút khóa tới khi gõ đúng tên ngôn ngữ.
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tiến độ tiếng Anh' }));
    await settle();
    let dialog = screen.getByRole('dialog', { name: 'Xóa tiến độ tiếng Anh' });
    const del = within(dialog).getByRole('button', { name: 'Xóa' });
    const box = within(dialog).getByRole('textbox', { name: 'Tên ngôn ngữ' });
    expect(del).toHaveAttribute('aria-disabled', 'true');
    fireEvent.change(box, { target: { value: 'Tiếng Nhật' } });
    await settle(20);
    expect(del).toHaveAttribute('aria-disabled', 'true');
    expect(within(dialog).getByRole('alert')).toHaveTextContent('Gõ đúng tên ngôn ngữ, đủ dấu, để mở nút Xóa.');
    fireEvent.click(del);
    await settle(20);
    expect(JSON.parse(r.mem.get(KEY)!)).toEqual(before);
    fireEvent.change(box, { target: { value: 'tiếng anh' } });
    await settle(20);
    expect(del).not.toHaveAttribute('aria-disabled');
    fireEvent.click(del);
    await settle(30);
    expect(here()).toBe('/hoc');
    expect(screen.getByText('Đã xóa tiến độ')).toBeInTheDocument();
    expect(JSON.parse(r.mem.get(KEY)!)).toMatchObject({ schema: 1, sessions: [], attempts: [], items: {} });

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
    const restored = JSON.parse(r.mem.get(KEY)!);
    expect(restored.sessions).toEqual(before.sessions);
    expect(restored.attempts).toEqual(before.attempts);
    expect(restored.items).toEqual(before.items);

    // Tệp của ngôn ngữ khác, của bộ nội dung khác và tệp JSON bất kỳ.
    const after = r.mem.get(KEY);
    const other = JSON.stringify({ ...file, lang: 'ja' });
    const otherPack = JSON.stringify({ ...file, pack: 'global' });
    for (const text of [other, otherPack, '{"hello": "world"}']) {
      fireEvent.change(input(), { target: { files: [new File([text], 'x.json', { type: 'application/json' })] } });
      await settle(50);
      expect(screen.getByRole('alert')).toHaveTextContent(
        'Tệp này không phải tệp tiến độ học tiếng Anh (English Fluency) của Đa ngôn ngữ. Chọn tệp đã xuất bằng Xuất tiến độ khi đang học tiếng Anh (English Fluency).',
      );
      expect(screen.queryByRole('dialog')).toBeNull();
      expect(r.mem.get(KEY)).toBe(after);
    }
  });

  // @ac S8-AC08, S9-AC05
  it('Xem lại hướng dẫn: về T1, bắt đầu từ bước 1, bước 3 có Xong; dòng phiên bản khớp package.json', async () => {
    await renderApp('/cai-dat', { seed: settingsSeed() });
    expect(screen.getByTestId('s8-version')).toHaveTextContent(`Phiên bản ${pkg.version}`);
    fireEvent.click(screen.getByRole('button', { name: 'Xem lại hướng dẫn' }));
    await settle(80);
    expect(here()).toBe('/hoc?huong-dan=1');
    const guide = screen.getByTestId('guide');
    expect(within(guide).getByText('Bước 1/3')).toBeInTheDocument();
    fireEvent.click(within(guide).getByRole('button', { name: 'Tiếp' }));
    await settle();
    fireEvent.click(within(guide).getByRole('button', { name: 'Tiếp' }));
    await settle();
    expect(within(guide).getByText('Bước 3/3')).toBeInTheDocument();
    expect(within(guide).getByRole('button', { name: 'Xong' })).toBeInTheDocument();
    expect(within(guide).queryByRole('button', { name: 'Bắt đầu học' })).toBeNull();
    fireEvent.click(within(guide).getByRole('button', { name: 'Xong' }));
    await settle(30);
    expect(screen.queryByTestId('guide')).toBeNull();
    expect(here()).toBe('/hoc');
  });

  // @ac S8-AC10
  it('Global English: hiện Tiếng Anh và Global English; sheet Đổi ngôn ngữ có hai dòng Tiếng Anh', async () => {
    await renderApp('/cai-dat', { seed: settingsSeed(GLOBAL) });
    const row = screen.getByRole('button', { name: /Ngôn ngữ đang học/ });
    expect(row).toHaveTextContent('Tiếng Anh');
    expect(row).toHaveTextContent('Global English');
    fireEvent.click(row);
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Đổi ngôn ngữ hoặc bộ nội dung' });
    expect(within(dialog).getByText('Tiếng Anh, Global English')).toBeInTheDocument();
    expect(within(dialog).getByText('Tiếng Anh, English Fluency')).toBeInTheDocument();
  });

  // @ac S8-AC15
  it('nhóm Tài khoản hiện email đang đăng nhập; Đăng xuất gọi đăng xuất; Ngôn ngữ giao diện có Tiếng Việt và English, chọn English giữ route /cai-dat', async () => {
    const auth = fakeAuth();
    const r = await renderApp('/cai-dat', { seed: settingsSeed(), auth });
    const account = screen.getByRole('region', { name: 'Tài khoản' });
    expect(within(account).getByTestId('s8-email')).toHaveTextContent(TEST_USER.email);
    const display = screen.getByRole('region', { name: 'Giao diện' });
    expect(within(display).getByText('Ngôn ngữ giao diện')).toBeInTheDocument();
    const trigger = display.querySelector<HTMLElement>('#s8-locale')!;
    expect(trigger).toHaveAttribute('role', 'combobox');
    expect(trigger).toHaveAccessibleName('Ngôn ngữ giao diện');
    expect(trigger).toHaveTextContent('Tiếng Việt');
    fireEvent.click(trigger);
    await settle();
    const list = within(display).getByRole('listbox');
    expect(within(list).getAllByRole('option').map((o) => o.textContent)).toEqual(['Tiếng Việt', 'English']);
    expect(within(list).getByRole('option', { name: 'English' }).querySelector('[lang]')).toHaveAttribute('lang', 'en');
    fireEvent.click(within(list).getByRole('option', { name: 'English' }));
    await settle(30);
    // Đổi ngôn ngữ giao diện qua router của next-intl, cùng đường dẫn, không thêm tiền tố.
    expect(routerCalls).toContainEqual({ kind: 'replace', href: '/cai-dat', locale: 'en' });
    expect(here()).toBe('/cai-dat');
    expect(auth.signOut).not.toHaveBeenCalled();
    fireEvent.click(within(account).getByRole('button', { name: 'Đăng xuất' }));
    await settle(30);
    expect(auth.signOut).toHaveBeenCalledTimes(1);
    expect(window.location.pathname).toBe('/dang-nhap');
    r.unmount();
    // Giao diện tiếng Anh: chữ của S8 đổi theo, route giữ nguyên.
    await renderApp('/cai-dat', { seed: settingsSeed(), locale: 'en' });
    expect(screen.getByRole('heading', { level: 1, name: 'Settings' })).toBeInTheDocument();
    expect(within(screen.getByRole('region', { name: 'Account' })).getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Appearance' }).querySelector('#s8-locale')).toHaveTextContent('English');
    expect(here()).toBe('/cai-dat');
  });

  it('S8 mở từ thanh bên: mục Cài đặt đang chọn; Quay lại về màn trước', async () => {
    await renderApp('/thu-vien', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('link', { name: 'Cài đặt' }));
    await settle(30);
    expect(here()).toBe('/cai-dat');
    expect(screen.getByRole('link', { name: 'Cài đặt' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Thư viện' })).not.toHaveAttribute('aria-current');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await settle(30);
    expect(here()).toBe('/thu-vien');
  });
});

describe('APP-10 bản cập nhật', () => {
  function fakeContainer() {
    const worker = Object.assign(new EventTarget(), { state: 'installing' });
    const reg = Object.assign(new EventTarget(), { installing: worker });
    return {
      container: { controller: {} as unknown, register: vi.fn(async () => reg as unknown as ServiceWorkerRegistration) },
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
    await renderApp('/hoc', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    expect(window.location.pathname).toBe('/phien-hoc');
    const sw = fakeContainer();
    registerServiceWorker(sw.container);
    await settle();
    expect(sw.container.register).toHaveBeenCalledWith('/sw.js', { scope: '/' });
    await act(async () => sw.activate());
    await settle();
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    expect(reload).not.toHaveBeenCalled();
    // Rời S3 về T1: thông báo hiện, có nút Cập nhật; chỉ tải lại khi bấm.
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dừng' }));
    await settle(30);
    expect(here()).toBe('/hoc');
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
    expect(reload).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Cập nhật' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });

  // @ac APP-AC15
  it('lần cài đầu tiên (chưa có service worker nào) thì không báo cập nhật mà nạp dữ liệu vào bộ nhớ ngoại tuyến', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    const sw = fakeContainer();
    sw.container.controller = null;
    const warm = vi.fn();
    registerServiceWorker(sw.container, { onFirstControl: warm });
    await settle();
    await act(async () => sw.activate());
    await settle();
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    expect(warm).toHaveBeenCalledTimes(1);
  });

  // @ac APP-AC15
  it('đang hiện thông báo ở T1 mà vào S3 thì thông báo ẩn, về T1 thì hiện lại', async () => {
    vi.spyOn(appReload, 'run').mockImplementation(() => {});
    await renderApp('/hoc', { seed: settingsSeed() });
    signalUpdate();
    await settle();
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Học 8 câu' }));
    await settle(30);
    expect(window.location.pathname).toBe('/phien-hoc');
    expect(screen.queryByText('Có bản cập nhật')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Dừng' }));
    await settle(30);
    expect(screen.getByText('Có bản cập nhật')).toBeInTheDocument();
  });
});

describe('APP-11 khi hướng dẫn đang mở', () => {
  // @ac APP-AC16
  it('Tab chỉ đi trong bong bóng hướng dẫn, không tới được nút mở sheet Đổi ngôn ngữ', async () => {
    await renderApp('/hoc', { seed: settingsSeed({ guideSeen: false }) });
    const guide = screen.getByTestId('guide');
    expect(within(guide).getByText('Bước 1/3')).toBeInTheDocument();
    const lang = screen.getByTestId('language-button');
    const seen = new Set<Element | null>();
    for (let i = 0; i < 6; i++) {
      fireEvent.keyDown(window, { key: 'Tab' });
      seen.add(document.activeElement);
    }
    expect(seen.has(lang)).toBe(false);
    expect([...seen].every((el) => el !== null && guide.contains(el))).toBe(true);
    expect(document.querySelectorAll('[role="dialog"]')).toHaveLength(1);
  });
});
