// Trợ giúp cho test cấp trang (S3, S5, S8, T2, T3, T4, S10): thao tác qua vai trò, nhãn và data-*, không qua lớp CSS.
import { fireEvent, screen, within } from '@testing-library/react';
import { loadCatalog, loadLanguageData, type LanguageData, type PackId } from '@/domain';
import { FixtureSource, settle } from './helpers';

export const DAY = 86400000;
export const KEY = 'vitasr2.progress.fluency.en';
export const GLOBAL = { packByLang: { en: 'global' } };

/** Tiến độ seed với các phần mặc định trống. */
export const prog = (p: Record<string, unknown>, key = KEY) => ({ [key]: { schema: 1, sessions: [], attempts: [], items: {}, ...p } });

/** Bộ dữ liệu fixture đã nạp như app nạp (để test tự tính số kết quả, nhóm, cụm). */
export async function fixtureData(pack: PackId = 'fluency', lang = 'en'): Promise<LanguageData> {
  const source = new FixtureSource();
  return loadLanguageData(source, await loadCatalog(source), lang, pack);
}

/** Đọc tiến độ đã lưu. */
export const savedProgress = (mem: Map<string, string>, key = KEY) => JSON.parse(mem.get(key) ?? 'null');

/** Dòng "Câu n/N" của S3. */
export const positionLabel = () => screen.queryByText(/^Câu \d+\/\d+$/)?.textContent ?? null;

/** Các lựa chọn của bước trắc nghiệm (C4). */
export const choiceButtons = (root: ParentNode = document) =>
  [...root.querySelectorAll<HTMLButtonElement>('ul[aria-labelledby] > li > button')].filter((b) => b.querySelector('.vi'));
export const correctChoice = (root: ParentNode = document) => root.querySelector<HTMLButtonElement>('button[data-correct="true"]')!;
export const wrongChoice = (root: ParentNode = document) => choiceButtons(root).find((b) => !b.hasAttribute('data-correct'))!;

/** Các ô của dải 8 ô đầu tiên trong vùng (C2). */
export const stripStates = (root: ParentNode = document) =>
  [...root.querySelector('ol[aria-label^="Tiến độ nhóm câu"]')!.querySelectorAll('li[data-state]')].map((c) => c.getAttribute('data-state'));

/** Hiện câu gốc rồi chấm ở S3a. */
export async function rateCurrent(review = false) {
  fireEvent.click(screen.getByRole('button', { name: 'Nhấn để hiện câu gốc' }));
  fireEvent.click(screen.getByRole('button', { name: review ? /Cần ôn lại/ : /Tôi nhớ/ }));
  await settle();
}

/** Làm trọn một câu S3 (ghi nhớ rồi chọn đúng) và sang câu kế. */
export async function doSentence() {
  await rateCurrent();
  fireEvent.click(correctChoice());
  fireEvent.click(screen.getByRole('button', { name: /^(Câu tiếp|Xem tổng kết)$/ }));
  await settle();
}

/** Đi hết phiên S3 đang mở. review: chọn "Cần ôn lại"; wrong: chọn sai trước; hint: mở gợi ý (theo số thứ tự câu). */
export async function finishSession(opts: { review?: number[]; wrong?: number[]; hint?: number[] } = {}) {
  for (let i = 0; i < 80; i++) {
    if (screen.queryByText('Xong phiên học')) return;
    const pos = Number(positionLabel()?.match(/Câu (\d+)/)?.[1] ?? 0);
    const cover = screen.queryByRole('button', { name: 'Nhấn để hiện câu gốc' });
    if (cover) {
      await rateCurrent(opts.review?.includes(pos));
      continue;
    }
    const next = screen.queryByRole('button', { name: /^(Câu tiếp|Xem tổng kết)$/ });
    if (next) {
      fireEvent.click(next);
      await settle();
      continue;
    }
    if (opts.hint?.includes(pos) && screen.queryByRole('button', { name: 'Xem gợi ý' })) {
      fireEvent.click(screen.getByRole('button', { name: 'Xem gợi ý' }));
      await settle();
    }
    if (opts.wrong?.includes(pos) && !document.querySelector('button[data-state="wrong"]')) {
      fireEvent.click(wrongChoice());
      await settle();
    }
    const right = document.querySelector<HTMLButtonElement>('button[data-correct="true"]');
    if (!right) throw new Error(`finishSession: không thấy lựa chọn ở câu ${pos}`);
    fireEvent.click(right);
    await settle();
  }
  throw new Error('finishSession: phiên không kết thúc');
}

/** Chọn một giá trị ở ô chọn C8 (combobox) theo tên của ô và tên lựa chọn. */
export async function chooseOption(combobox: string | RegExp, option: string | RegExp, root: HTMLElement = document.body) {
  fireEvent.click(within(root).getByRole('combobox', { name: combobox }));
  await settle();
  const list = screen.getByRole('listbox');
  fireEvent.click(within(list).getByRole('option', { name: option }));
  await settle();
}

/** Nhãn các lựa chọn của ô chọn C8 (mở danh sách, đọc, đóng bằng Esc). */
export async function optionsOf(combobox: string | RegExp) {
  fireEvent.click(screen.getByRole('combobox', { name: combobox }));
  await settle();
  const names = within(screen.getByRole('listbox'))
    .getAllByRole('option')
    .map((o) => o.querySelector('span > span')?.textContent?.trim() ?? '');
  fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
  await settle();
  return names;
}

/**
 * Chờ các lần lùi lịch sử còn treo (chặn rời màn bỏ mục trùng khi phiên xong) chạy hết trước khi gỡ màn,
 * để popstate của test trước không đổi địa chỉ của test sau (jsdom giữ một lịch sử cho cả file).
 * Dùng: afterEach(drainHistory).
 */
export async function drainHistory() {
  await settle(30);
}

/** Bấm nút Back của trình duyệt và chờ sự kiện popstate. */
export async function browserBack() {
  window.history.back();
  await settle(30);
}
