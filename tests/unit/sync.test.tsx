// Đồng bộ dữ liệu học với tài khoản (DATA-14) qua dịch vụ đồng bộ giả.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { configure, fireEvent, screen, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import type { Progress, Settings } from '@/domain';
import { ApiError } from '@/lib/api-error';
import type { RemoteProgressRow, SyncApi } from '@/services/sync-services/type';
import { NOW, TEST_USER, fakeAuth, here, makeDeps, renderSite, settingsSeed, settle } from './helpers';
import { correctChoice, drainHistory, rateCurrent } from './page-helpers';
import { routerCalls } from './router-mock';

// Máy chạy test bận (nhiều file chạy song song) thì việc băm mật khẩu, nạp dữ liệu chậm hơn: chờ tối đa 3 giây.
configure({ asyncUtilTimeout: 3000 });
vi.setConfig({ testTimeout: 20000 });

const DAY = 86400000;
const KEY = 'vitasr2.progress.fluency.en';
const SYNC_TEXT = 'Chưa đồng bộ được tiến độ lên tài khoản. Tiến độ vẫn lưu trên máy này và sẽ gửi lại sau.';

const learnedItems = (ids: number[]) => Object.fromEntries(ids.map((id) => [id, { status: 'da-hoc', streak: 1, due: NOW + DAY, lastAt: NOW - DAY }]));
const progress = (ids: number[]): Progress => ({ schema: 1, sessions: [], attempts: [], items: learnedItems(ids) }) as unknown as Progress;

function fakeSync(over: Partial<{ [K in keyof SyncApi]: SyncApi[K] }> = {}) {
  return {
    fetchSettings: vi.fn(over.fetchSettings ?? (async () => null)),
    saveSettings: vi.fn(over.saveSettings ?? (async () => undefined)),
    fetchAllProgress: vi.fn(over.fetchAllProgress ?? (async (): Promise<RemoteProgressRow[]> => [])),
    fetchProgress: vi.fn(over.fetchProgress ?? (async () => null)),
    saveProgress: vi.fn(over.saveProgress ?? (async () => undefined)),
  };
}

/** Học một câu ở S3 (lộ trình): mở phiên từ T1, chấm Tôi nhớ, chọn đúng nghĩa. */
async function learnOneSentence() {
  fireEvent.click(screen.getByRole('button', { name: /^Học \d câu$/ }));
  await settle();
  expect(here()).toMatch(/^\/phien-hoc\?/);
  await rateCurrent();
  fireEvent.click(correctChoice());
  await settle();
}

afterEach(async () => {
  await drainHistory();
  vi.restoreAllMocks();
});

describe('DATA-14 Đồng bộ tài khoản', () => {
  // @ac DATA-AC24
  it('máy mới: cài đặt và tiến độ của tài khoản hiện ra, vào thẳng T1; học một câu thì sau 1,5 giây có một lần gửi tiến độ đã gộp', async () => {
    const errors = vi.spyOn(toast, 'error');
    const remoteSettings = settingsSeed()['vitasr2.settings'] as Partial<Settings>;
    const sync = fakeSync({
      fetchSettings: async () => remoteSettings,
      fetchAllProgress: async () => [{ pack: 'fluency', lang: 'en', data: progress([1, 257, 769]) }],
      // Trong lúc đó máy khác học thêm câu 2: bản trên tài khoản lúc gửi có thêm câu này.
      fetchProgress: async () => progress([1, 257, 769, 2]),
    });
    const { deps, mem } = makeDeps();
    deps.sync = sync;
    await renderSite('/hoc', { deps });
    await waitFor(() => expect(screen.getByTestId('t1-learned')).toHaveTextContent('3/29 câu'));
    expect(here()).toBe('/hoc');
    expect(routerCalls.map((c) => c.href)).not.toContain('/chon-ngon-ngu');
    expect(screen.queryByRole('heading', { name: 'Bạn muốn học ngôn ngữ nào?' })).toBeNull();
    expect(screen.getByTestId('language-button')).toHaveTextContent('Tiếng Anh');
    expect(sync.fetchSettings).toHaveBeenCalledWith(TEST_USER.id);
    expect(sync.fetchAllProgress).toHaveBeenCalledWith(TEST_USER.id);
    expect(JSON.parse(mem.get('vitasr2.settings')!).lang).toBe('en');
    expect(Object.keys(JSON.parse(mem.get(KEY)!).items).sort()).toEqual(['1', '257', '769']);
    // Lần lấy đầu xong: tiến độ máy giống tài khoản nên chưa gửi tiến độ.
    await settle(50);
    expect(sync.saveProgress).not.toHaveBeenCalled();

    await learnOneSentence();
    const local = JSON.parse(mem.get(KEY)!) as Progress;
    // Một câu: một lần ghi nhớ và một lần trắc nghiệm, ghi trên máy ngay.
    expect(local.attempts.map((a) => a.kind)).toEqual(['ghi-nho', 'trac-nghiem']);
    const learnedNow = String(local.attempts[0].itemId);
    await settle(1000);
    expect(sync.saveProgress).not.toHaveBeenCalled();
    await waitFor(() => expect(sync.saveProgress).toHaveBeenCalledTimes(1), { timeout: 3000 });
    const [uid, pack, lang, sent] = sync.saveProgress.mock.calls[0] as unknown as [string, string, string, Progress];
    expect([uid, pack, lang]).toEqual([TEST_USER.id, 'fluency', 'en']);
    // Đã gộp: có câu vừa học trên máy và câu máy khác vừa học.
    expect(Object.keys(sent.items).sort()).toEqual([...new Set(['1', '2', '257', '769', learnedNow])].sort());
    expect(sent.attempts).toEqual(local.attempts);
    expect(sent.sessions.map((x) => x.id)).toEqual(local.sessions.map((x) => x.id));
    await settle(1700);
    expect(sync.saveProgress).toHaveBeenCalledTimes(1);
    expect(errors).not.toHaveBeenCalled();
    // Bản trên máy nhận phần của máy khác.
    expect(Object.keys(JSON.parse(mem.get(KEY)!).items)).toContain('2');
  });

  // @ac DATA-AC24
  it('dịch vụ lỗi: đúng một thông báo lỗi; tiến độ vẫn trên máy', async () => {
    const errors = vi.spyOn(toast, 'error');
    const sync = fakeSync({
      saveSettings: async () => {
        throw new ApiError('sync-failed');
      },
      saveProgress: async () => {
        throw new ApiError('sync-failed');
      },
    });
    const { deps, mem } = makeDeps({ seed: { ...settingsSeed(), [KEY]: progress([1]) } });
    deps.sync = sync;
    await renderSite('/hoc', { deps });
    expect(screen.getByTestId('sentence-card')).toBeInTheDocument();
    // Lần gửi đầu (tiến độ máy có mà tài khoản chưa có) lỗi, thử lại một lần rồi báo.
    expect(await screen.findByRole('alert', {}, { timeout: 3000 })).toHaveTextContent(SYNC_TEXT);
    expect(errors).toHaveBeenCalledTimes(1);

    await learnOneSentence();
    const saved = JSON.parse(mem.get(KEY)!) as Progress;
    expect(saved.attempts.map((a) => a.kind)).toEqual(['ghi-nho', 'trac-nghiem']);
    // Lần gửi sau (1,5 giây, thêm một lần thử lại) cũng lỗi: không báo thêm.
    await waitFor(() => expect(sync.saveProgress.mock.calls.length).toBeGreaterThanOrEqual(4), { timeout: 4500 });
    await settle(50);
    expect(errors).toHaveBeenCalledTimes(1);
    expect(JSON.parse(mem.get(KEY)!)).toEqual(saved);
    // Vẫn học tiếp được: phiên còn mở, nút sang câu kế vẫn dùng được.
    expect(here()).toMatch(/^\/phien-hoc\?/);
    expect(screen.getByRole('button', { name: 'Câu tiếp' })).not.toHaveAttribute('aria-disabled');
  });

  // @ac DATA-AC24
  it('học một câu rồi đăng xuất ngay (chưa tới 1,5 giây): phần vừa học được gửi trước khi đăng xuất', async () => {
    const sync = fakeSync({ fetchAllProgress: async () => [{ pack: 'fluency', lang: 'en', data: progress([1]) }] });
    const { deps, mem } = makeDeps({ seed: { ...settingsSeed(), [KEY]: progress([1]) } });
    deps.sync = sync;
    const auth = fakeAuth();
    await renderSite('/hoc', { deps, auth });
    await waitFor(() => expect(screen.getByTestId('t1-learned')).toHaveTextContent('1/29 câu'));
    await settle(50);
    expect(sync.saveProgress).not.toHaveBeenCalled();

    await learnOneSentence();
    fireEvent.click(screen.getByTestId('sign-out'));
    await waitFor(() => expect(auth.signOut).toHaveBeenCalledTimes(1));
    expect(sync.saveProgress).toHaveBeenCalledTimes(1);
    expect(sync.saveProgress.mock.invocationCallOrder[0]).toBeLessThan(auth.signOut.mock.invocationCallOrder[0]);
    const sent = sync.saveProgress.mock.calls[0][3] as unknown as Progress;
    expect(sent.attempts).toEqual((JSON.parse(mem.get(KEY)!) as Progress).attempts);
    await waitFor(() => expect(window.location.pathname).toBe('/dang-nhap'));
    expect(window.location.search).toBe('');
  });
});
