// Đăng nhập, đăng ký và cổng khu học (AU): chạy cả website để chuyển qua lại giữa trang công khai và khu học.
import { describe, expect, it, vi } from 'vitest';
import { configure, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { ApiError } from '@/lib/api-error';
import { localAuthApi } from '@/services/auth-services/api';
import { MESSAGES, NOW, TEST_SESSION, fakeAuth, here, makeDeps, memoryBackend, renderSite, settingsSeed, settle } from './helpers';

// Máy chạy test bận (nhiều file chạy song song) thì việc băm mật khẩu, nạp dữ liệu chậm hơn: chờ tối đa 3 giây.
configure({ asyncUtilTimeout: 3000 });
vi.setConfig({ testTimeout: 20000 });

const DAY = 86400000;

const email = () => screen.getByLabelText('Email');
const password = () => screen.getByLabelText('Mật khẩu');
const confirm = () => screen.getByLabelText('Nhập lại mật khẩu');
const type = (el: HTMLElement, value: string) => fireEvent.input(el, { target: { value } });

async function submitLogin(e: string, p: string) {
  type(email(), e);
  type(password(), p);
  fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
  await settle();
  await settle();
}

async function submitRegister(e: string, p: string, c = p) {
  type(email(), e);
  type(password(), p);
  type(confirm(), c);
  fireEvent.click(screen.getByRole('button', { name: 'Tạo tài khoản' }));
  await settle();
  await settle();
}

const signedOut = (extra: Parameters<typeof fakeAuth>[0] = {}) => fakeAuth({ session: null, ...extra });

describe('AU Đăng nhập', () => {
  // @ac AU-AC01
  it('đăng nhập đúng thì vào /hoc', async () => {
    const signIn = vi.fn(async () => TEST_SESSION);
    await renderSite('/dang-nhap', { auth: signedOut({ signIn }), seed: settingsSeed() });
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    await submitLogin('hoc@vitasr.test', 'matkhau123');
    expect(signIn).toHaveBeenCalledWith('hoc@vitasr.test', 'matkhau123');
    await waitFor(() => expect(here()).toBe('/hoc'));
    await waitFor(() => expect(screen.getByTestId('sentence-card')).toBeInTheDocument());
  });

  // @ac AU-AC01
  it('mở /thu-vien?xem=cau khi chưa đăng nhập: sang trang đăng nhập giữ địa chỉ, đăng nhập xong về đúng chỗ; tiep ngoài app bị bỏ qua', async () => {
    const a = await renderSite('/thu-vien?xem=cau', { auth: signedOut(), seed: settingsSeed() });
    expect(here()).toBe('/dang-nhap?tiep=%2Fthu-vien%3Fxem%3Dcau');
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    // Liên kết sang Đăng ký cũng giữ địa chỉ để quay lại.
    expect(screen.getByRole('link', { name: 'Đăng ký' })).toHaveAttribute('href', '/dang-ky?tiep=%2Fthu-vien%3Fxem%3Dcau');
    await submitLogin('hoc@vitasr.test', 'matkhau123');
    await waitFor(() => expect(here()).toBe('/thu-vien?xem=cau'));
    a.unmount();
    for (const bad of ['//vi.du', 'https://vi.du/hoc', '/\\vi.du', '/\t/vi.du', '/.//vi.du', '/hoc/..//vi.du', '/%2e//vi.du', '/khong-co-trang-nay']) {
      const r = await renderSite(`/dang-nhap?tiep=${encodeURIComponent(bad)}`, { auth: signedOut(), seed: settingsSeed() });
      await submitLogin('hoc@vitasr.test', 'matkhau123');
      await waitFor(() => expect(here()).toBe('/hoc'));
      r.unmount();
    }
  });

  // @ac AU-AC02
  it('ô trống báo lỗi dưới ô, aria-invalid; email sai dạng; không gọi dịch vụ khi còn lỗi', async () => {
    const signIn = vi.fn(async () => TEST_SESSION);
    await renderSite('/dang-nhap', { auth: signedOut({ signIn }) });
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await settle();
    expect(await screen.findByText('Nhập email.')).toBeInTheDocument();
    expect(screen.getByText('Nhập mật khẩu.')).toBeInTheDocument();
    expect(email()).toHaveAttribute('aria-invalid', 'true');
    expect(password()).toHaveAttribute('aria-invalid', 'true');
    // Lỗi gắn với ô qua aria-describedby.
    expect(email()).toHaveAccessibleDescription('Nhập email.');
    expect(password()).toHaveAccessibleDescription('Nhập mật khẩu.');
    type(email(), 'abc');
    type(password(), 'matkhau123');
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));
    await settle();
    expect(await screen.findByText('Email chưa đúng dạng, ví dụ ten@gmail.com.')).toBeInTheDocument();
    expect(password()).not.toHaveAttribute('aria-invalid');
    expect(signIn).not.toHaveBeenCalled();
    expect(here()).toBe('/dang-nhap');
  });

  // @ac AU-AC04
  it('sai mật khẩu: thông báo role="alert", vẫn ở /dang-nhap, email đã nhập còn nguyên', async () => {
    const signIn = vi.fn(async () => {
      throw new ApiError('invalid-credentials');
    });
    await renderSite('/dang-nhap', { auth: signedOut({ signIn }) });
    await submitLogin('hoc@vitasr.test', 'sai-mat-khau');
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi đăng nhập.');
    expect(here()).toBe('/dang-nhap');
    expect(email()).toHaveValue('hoc@vitasr.test');
  });
});

describe('AU Đăng ký', () => {
  // @ac AU-AC03
  it('mật khẩu 7 ký tự, hai mật khẩu khác nhau báo đúng câu; đăng ký đúng thì đã đăng nhập', async () => {
    const signUp = vi.fn(async () => ({ session: TEST_SESSION, needsConfirm: false }));
    await renderSite('/dang-ky', { auth: signedOut({ signUp }), seed: settingsSeed() });
    expect(screen.getByRole('heading', { level: 1, name: 'Tạo tài khoản' })).toBeInTheDocument();
    await submitRegister('moi@vitasr.test', '1234567');
    expect(screen.getByText('Mật khẩu cần ít nhất 8 ký tự.')).toBeInTheDocument();
    expect(password()).toHaveAttribute('aria-invalid', 'true');
    expect(signUp).not.toHaveBeenCalled();
    await submitRegister('moi@vitasr.test', 'matkhau123', 'matkhau124');
    expect(screen.getByText('Hai mật khẩu chưa giống nhau.')).toBeInTheDocument();
    expect(confirm()).toHaveAttribute('aria-invalid', 'true');
    expect(signUp).not.toHaveBeenCalled();
    await submitRegister('moi@vitasr.test', 'matkhau123');
    expect(signUp).toHaveBeenCalledWith('moi@vitasr.test', 'matkhau123');
    await waitFor(() => expect(here()).toBe('/hoc'));
    expect(screen.getByTestId('user-email')).toBeInTheDocument();
  });

  // @ac AU-AC03
  it('máy chủ yêu cầu xác nhận email: hiện câu đã gửi thư xác nhận, chưa vào khu học', async () => {
    const signUp = vi.fn(async () => ({ session: null, needsConfirm: true }));
    await renderSite('/dang-ky', { auth: { ...signedOut({ signUp }), mode: 'supabase' } });
    await submitRegister('  moi@vitasr.test ', 'matkhau123');
    expect(await screen.findByTestId('confirm-email')).toHaveTextContent(MESSAGES.vi.auth.checkEmail.replace('{email}', 'moi@vitasr.test'));
    expect(screen.getByTestId('confirm-email')).toHaveTextContent(/^Đã gửi thư xác nhận tới moi@vitasr\.test\./);
    expect(screen.getByTestId('confirm-email')).toHaveAttribute('role', 'status');
    expect(here()).toBe('/dang-ky');
  });

  // @ac AU-AC04
  it('email đã có tài khoản: hiện câu tương ứng, vẫn ở /dang-ky', async () => {
    const signUp = vi.fn(async () => {
      throw new ApiError('email-taken');
    });
    await renderSite('/dang-ky', { auth: signedOut({ signUp }) });
    await submitRegister('co@vitasr.test', 'matkhau123');
    expect(await screen.findByRole('alert')).toHaveTextContent('Email này đã có tài khoản. Đăng nhập bằng email này hoặc dùng email khác.');
    expect(here()).toBe('/dang-ky');
    expect(email()).toHaveValue('co@vitasr.test');
  });
});

describe('AU Cổng khu học', () => {
  // @ac AU-AC05
  it('đã đăng nhập mà mở /dang-nhap hoặc /dang-ky thì vào /hoc', async () => {
    for (const url of ['/dang-nhap', '/dang-ky']) {
      const r = await renderSite(url, { seed: settingsSeed() });
      await waitFor(() => expect(here()).toBe('/hoc'));
      r.unmount();
    }
  });

  // @ac AU-AC05
  it('"Đăng xuất" ở thanh bên gọi đăng xuất và về /dang-nhap', async () => {
    const { auth } = await renderSite('/thu-vien', { seed: settingsSeed() });
    fireEvent.click(screen.getByTestId('menu-button'));
    fireEvent.click(within(document.getElementById('app-sidebar')!).getByRole('button', { name: 'Đăng xuất' }));
    await settle();
    expect((auth as ReturnType<typeof fakeAuth>).signOut).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(window.location.pathname).toBe('/dang-nhap'));
    expect(screen.getByRole('heading', { level: 1, name: 'Đăng nhập' })).toBeInTheDocument();
    expect(screen.queryByTestId('menu-button')).toBeNull();
  });

  // @ac AU-AC06
  it('chế độ thử (không có Supabase): đăng ký, đăng xuất, đăng nhập lại qua giao diện; mật khẩu sai báo lỗi; có dòng báo chế độ thử', async () => {
    const { backend } = memoryBackend();
    const auth = localAuthApi(backend);
    await renderSite('/dang-ky', { auth, seed: settingsSeed() });
    expect(screen.getByTestId('local-mode')).toHaveTextContent('Chế độ thử: app chưa nối máy chủ tài khoản, tài khoản và tiến độ chỉ lưu trên máy này.');
    await submitRegister('thu@vi.du', 'matkhau123');
    await waitFor(() => expect(here()).toBe('/hoc'));
    expect(screen.getByTestId('user-email')).toHaveTextContent('thu@vi.du');
    fireEvent.click(screen.getByTestId('sign-out'));
    await waitFor(() => expect(window.location.pathname).toBe('/dang-nhap'));
    expect(screen.getByTestId('local-mode')).toBeInTheDocument();
    await submitLogin('thu@vi.du', 'sai-mat-khau');
    expect(await screen.findByRole('alert')).toHaveTextContent('Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi đăng nhập.');
    expect(window.location.pathname).toBe('/dang-nhap');
    await submitLogin('thu@vi.du', 'matkhau123');
    await waitFor(() => expect(here()).toBe('/hoc'));
    expect(screen.getByTestId('user-email')).toHaveTextContent('thu@vi.du');
  });

  // @ac AU-AC07
  it('tiến độ có sẵn trên máy thuộc người đăng nhập đầu tiên; người thứ hai không thấy; người đầu đăng nhập lại thì thấy lại', async () => {
    // Dữ liệu học và tài khoản thử cùng nằm trong localStorage của trình duyệt, như app thật.
    const store = window.localStorage;
    const items = Object.fromEntries([1, 257, 769].map((id) => [id, { status: 'da-hoc', streak: 1, due: NOW + DAY, lastAt: NOW }]));
    store.setItem('vitasr2.settings', JSON.stringify(settingsSeed()['vitasr2.settings']));
    store.setItem('vitasr2.progress.fluency.en', JSON.stringify({ schema: 1, sessions: [], attempts: [], items }));
    const { deps } = makeDeps({ backend: store });
    const auth = localAuthApi(store);
    const learned = () => screen.getByTestId('t1-learned');

    await renderSite('/dang-ky', { auth, deps });
    await submitRegister('a@vi.du', 'matkhau123');
    await waitFor(() => expect(here()).toBe('/hoc'));
    await waitFor(() => expect(learned()).toHaveTextContent('3/29 câu'));

    fireEvent.click(screen.getByTestId('sign-out'));
    await waitFor(() => expect(window.location.pathname).toBe('/dang-nhap'));
    fireEvent.click(screen.getByRole('link', { name: 'Đăng ký' }));
    await settle();
    expect(window.location.pathname).toBe('/dang-ky');
    await submitRegister('b@vi.du', 'matkhau123');
    // Người thứ hai: máy như mới với người này, phải chọn ngôn ngữ, không có tiến độ của người đầu.
    await waitFor(() => expect(here()).toBe('/chon-ngon-ngu'));
    expect(store.getItem('vitasr2.progress.fluency.en')).toBeNull();

    fireEvent.click(screen.getByTestId('sign-out'));
    await waitFor(() => expect(window.location.pathname).toBe('/dang-nhap'));
    // Tự đăng xuất thì về /dang-nhap không kèm màn cũ (AU-05): người đầu đăng nhập lại vào T1, thấy lại tiến độ của mình.
    expect(window.location.search).toBe('');
    await submitLogin('a@vi.du', 'matkhau123');
    await waitFor(() => expect(here()).toBe('/hoc'));
    await waitFor(() => expect(screen.getByTestId('language-button')).toHaveTextContent('Tiếng Anh'));
    await waitFor(() => expect(learned()).toHaveTextContent('3/29 câu'));
  });
});
