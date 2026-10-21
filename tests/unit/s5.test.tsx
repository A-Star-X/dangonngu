import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { chunkLabel, chunkSentence, type PackId } from '@/domain';
import { FixtureSource, fakeSpeech, here, renderApp, settingsSeed, settle } from './helpers';
import { KEY, browserBack, drainHistory, fixtureData, positionLabel, savedProgress } from './page-helpers';

afterEach(drainHistory);

const EN_VOICE = [{ lang: 'en-US', voiceURI: 'us', name: 'US' }];
const U1 = [1, 257, 769, 770, 258, 771, 772, 1793];
const dots = () => [...document.querySelectorAll<HTMLElement>('ol[aria-label^="Bước"] > li')].map((d) => d.dataset.state);
const stepName = () => screen.queryByTestId('s5-step-name')?.textContent ?? null;
const task = () => document.querySelector<HTMLElement>('[data-item-id]')!;
const itemId = () => Number(task().dataset.itemId);
const label = () => positionLabel()!;
const quizChoices = () => [...document.querySelectorAll<HTMLButtonElement>('ul[aria-labelledby="s5-q"] button')];
const pool = () => [...document.querySelectorAll<HTMLButtonElement>('[data-testid="s5-pool"] button')];
const answer = () => [...document.querySelectorAll<HTMLButtonElement>('[data-testid="s5-answer"] button')];
const resultLines = () => [...document.querySelectorAll('[data-testid="s5-result"] > li')].map((l) => l.textContent);

let enById: Map<number, string> | null = null;
async function enOf(id: number) {
  if (!enById) enById = new Map((await fixtureData()).items.map((i) => [i.id, i.en]));
  return enById.get(id)!;
}
async function currentChunks() {
  return chunkSentence(await enOf(itemId()), 'en').map(chunkLabel);
}

/** Làm xong câu hiện tại của bước đang làm. wrongFirst: chọn sai một lần trước khi đúng (bước 1) hoặc xếp sai một lần (bước 3). */
async function doItem(opts: { wrongFirst?: boolean } = {}) {
  const step = stepName();
  if (step === 'Nghe và chọn nghĩa') {
    if (opts.wrongFirst) fireEvent.click(quizChoices().find((b) => !b.hasAttribute('data-correct'))!);
    fireEvent.click(quizChoices().find((b) => b.dataset.correct === 'true')!);
  } else if (step === 'Nghe theo cụm') {
    for (const b of [...document.querySelectorAll<HTMLElement>('button[data-state="covered"]')]) fireEvent.click(b);
  } else {
    const labels = await currentChunks();
    if (opts.wrongFirst) {
      // Xếp ngược rồi kiểm tra, sau đó trả hết về hàng cụm.
      for (const l of [...labels].reverse()) fireEvent.click(pool().find((b) => b.textContent === l)!);
      fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
      await settle();
      for (const b of answer()) fireEvent.click(b);
    }
    for (const l of labels) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
  }
  await settle();
  fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
  await settle();
}

const reload = async (r: { mem: Map<string, string>; unmount: () => void }, url: string) => {
  const saved = savedProgress(r.mem);
  r.unmount();
  await drainHistory();
  return renderApp(url, { seed: { ...settingsSeed(), [KEY]: saved } });
};

describe('S5 Kiểm tra nhanh', () => {
  // @ac S5-AC01
  it('không tham số là unit đang học; ?unit=2 là unit 2; bốn nút bắt đầu chạy đúng bước', async () => {
    let r = await renderApp('/kiem-tra', { seed: settingsSeed() });
    expect(screen.getByText('Kiểm tra nhanh · Unit 1')).toBeInTheDocument();
    expect(screen.getByText('8 câu')).toBeInTheDocument();
    for (const name of ['Làm cả 3 bước', 'Chỉ nghe và chọn nghĩa', 'Chỉ nghe theo cụm', 'Chỉ sắp xếp câu']) expect(screen.getByRole('button', { name })).toBeInTheDocument();
    r.unmount();
    // Đang học unit 2 (đã học hết unit 1): không tham số thì là unit 2.
    const learned = Object.fromEntries(U1.map((id) => [id, { status: 'da-hoc', streak: 1, due: Date.UTC(2026, 9, 20), lastAt: Date.UTC(2026, 9, 7) }]));
    r = await renderApp('/kiem-tra', { seed: { ...settingsSeed(), [KEY]: { schema: 1, sessions: [], attempts: [], items: learned } } });
    expect(screen.getByText('Kiểm tra nhanh · Unit 2')).toBeInTheDocument();
    r.unmount();
    r = await renderApp('/kiem-tra?unit=2', { seed: settingsSeed() });
    expect(screen.getByText('Kiểm tra nhanh · Unit 2')).toBeInTheDocument();
    r.unmount();
    for (const [btn, step] of [
      ['Làm cả 3 bước', 'Nghe và chọn nghĩa'],
      ['Chỉ nghe và chọn nghĩa', 'Nghe và chọn nghĩa'],
      ['Chỉ nghe theo cụm', 'Nghe theo cụm'],
      ['Chỉ sắp xếp câu', 'Sắp xếp câu'],
    ]) {
      r = await renderApp('/kiem-tra?unit=2', { seed: settingsSeed() });
      fireEvent.click(screen.getByRole('button', { name: btn }));
      await settle();
      expect(stepName()).toBe(step);
      expect(label()).toBe('Câu 1/8');
      r.unmount();
      await drainHistory();
    }
  });

  // @ac S5-AC02
  it('cả 3 bước: 3 chấm, đổi trạng thái khi sang bước; một bước: 1 chấm', async () => {
    let r = await renderApp('/kiem-tra?unit=4', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    expect(dots()).toEqual(['dang', 'chua', 'chua']);
    expect(screen.getByRole('list', { name: 'Bước 1/3' })).toBeInTheDocument();
    for (let i = 0; i < 5; i++) await doItem();
    expect(stepName()).toBe('Nghe theo cụm');
    expect(dots()).toEqual(['xong', 'dang', 'chua']);
    for (let i = 0; i < 5; i++) await doItem();
    expect(dots()).toEqual(['xong', 'xong', 'dang']);
    r.unmount();
    await drainHistory();
    r = await renderApp('/kiem-tra?unit=4', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    expect(dots()).toEqual(['dang']);
  });

  // @ac S5-AC03
  it('có giọng: vào câu gọi speak một lần, chưa có chữ câu gốc trước khi chọn đúng; không có giọng: hiện chữ ngay và có thông báo', async () => {
    const synth = fakeSpeech(EN_VOICE);
    let r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    expect(synth.speak).toHaveBeenCalledTimes(1);
    expect((synth.speak.mock.calls[0][0] as { text: string }).text).toBe('I want to...');
    expect(screen.queryByTestId('s5-source')).toBeNull();
    expect(screen.queryByText('I want to...')).toBeNull();
    expect(screen.getByRole('button', { name: 'Nghe lại' })).toBeInTheDocument();
    fireEvent.click(quizChoices().find((b) => b.dataset.correct === 'true')!);
    await settle();
    expect(screen.getByTestId('s5-source')).toHaveTextContent('I want to...');
    fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
    await settle();
    expect(synth.speak).toHaveBeenCalledTimes(2);
    expect((synth.speak.mock.calls[1][0] as { text: string }).text).toBe('want to know...');
    r.unmount();
    await drainHistory();
    fakeSpeech([{ lang: 'vi-VN', voiceURI: 'vi', name: 'VI' }]);
    r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    expect(screen.getByTestId('s5-source')).toHaveTextContent('I want to...');
    expect(within(screen.getByTestId('s5-source')).getByText('I want to...')).toHaveAttribute('lang', 'en');
    expect(screen.getByText('Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nghe lại' })).toBeNull();
  });

  // @ac S5-AC03
  it('trình duyệt chưa trả danh sách giọng: chưa có câu hỏi và 4 lựa chọn; hết 1,5 giây thì hiện cùng chữ câu gốc', async () => {
    fakeSpeech([]);
    await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    expect(document.querySelector('[data-item-id][aria-busy="true"]')).not.toBeNull();
    expect(quizChoices()).toHaveLength(0);
    expect(screen.queryByText('Câu bạn nghe nghĩa là gì?')).toBeNull();
    await settle(1600);
    expect(quizChoices()).toHaveLength(4);
    expect(screen.getByText('Câu bạn nghe nghĩa là gì?')).toBeInTheDocument();
    expect(screen.getByTestId('s5-source')).toHaveTextContent('I want to...');
    expect(screen.getByText('Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh.')).toBeInTheDocument();
  });

  // @ac S5-AC04
  it('nghe theo cụm: chạm hết cụm thì có Câu tiếp; ghép các cụm lại bằng đúng câu gốc', async () => {
    await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe theo cụm' }));
    await settle();
    const covered = [...document.querySelectorAll<HTMLElement>('button[data-state="covered"]')];
    expect(covered).toHaveLength(chunkSentence('I want to...', 'en').length);
    expect(covered[0]).toHaveAccessibleName('Cụm 1, đang che');
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    for (const b of covered.slice(0, -1)) fireEvent.click(b);
    await settle();
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    fireEvent.click(covered[covered.length - 1]);
    await settle();
    expect(screen.getByRole('button', { name: 'Câu tiếp' })).toBeInTheDocument();
    expect([...task().querySelectorAll('button[data-state="open"]')].map((b) => b.textContent).join(' ')).toBe('I want to...');
  });

  // @ac S5-AC04
  it('câu chỉ có 1 cụm bị bỏ qua ở bước 2 và 3', async () => {
    // Nguồn bọc fixture, đổi câu id 1 thành câu một từ.
    class OneWord extends FixtureSource {
      async getLanguageFile(pack: PackId, f: string) {
        const raw = (await super.getLanguageFile(pack, f)) as { items: { id: number; en: string }[] };
        raw.items.find((i) => i.id === 1)!.en = 'Hello!';
        return raw;
      }
    }
    const r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed(), source: new OneWord() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe theo cụm' }));
    await settle();
    expect(label()).toBe('Câu 1/7');
    expect(within(task()).getByText('muốn biết...', { selector: 'p.vi' })).toBeInTheDocument();
    r.unmount();
    await drainHistory();
    await renderApp('/kiem-tra?unit=1', { seed: settingsSeed(), source: new OneWord() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    expect(label()).toBe('Câu 1/7');
    expect(itemId()).toBe(257);
  });

  // @ac S5-AC05
  it('sắp xếp: thứ tự xáo khác thứ tự đúng và giống nhau giữa hai lần mở; xếp đúng thành Câu tiếp; xếp sai đánh dấu đúng các cụm sai vị trí', async () => {
    const r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    const chunks = chunkSentence('I want to...', 'en').map(chunkLabel);
    const poolLabels = () => pool().map((b) => b.textContent);
    const first = poolLabels();
    expect(first).not.toEqual(chunks);
    expect([...first].sort()).toEqual([...chunks].sort());
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toHaveAttribute('aria-disabled', 'true');
    r.unmount();
    await drainHistory();
    await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    expect(poolLabels()).toEqual(first);
    // Câu 2 có 2 cụm: xếp ngược thì cả 2 sai vị trí.
    await doItem();
    const c2 = chunkSentence('want to know...', 'en').map(chunkLabel);
    for (const l of [...c2].reverse()) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await settle();
    expect(answer().map((b) => b.getAttribute('data-wrong') === 'true')).toEqual([true, true]);
    expect(answer()[0]).toHaveAccessibleName(`${c2[1]}, chưa đúng vị trí`);
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    // Xếp sai: dòng báo nhìn thấy được, màu --wrong (FND-02).
    const feedback = screen.getByTestId('s5-feedback');
    expect(feedback).toHaveTextContent('Chưa đúng. Nhấn các cụm có dấu x để đưa về hàng cụm, rồi xếp lại.');
    expect(feedback).toHaveClass('text-danger');
    expect(feedback).toHaveAttribute('aria-live', 'polite');
    for (const b of answer()) fireEvent.click(b);
    for (const l of c2) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await settle();
    expect(screen.getByTestId('s5-answer')).toHaveClass('border-success');
    expect(feedback).toHaveTextContent('Đúng');
    fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
    await settle();
    // Câu 3 có 5 từ (3 cụm): đổi chỗ hai cụm cuối thì chỉ hai cụm đó bị đánh dấu.
    const c3 = chunkSentence('want to know what happened', 'en').map(chunkLabel);
    expect(c3).toHaveLength(3);
    for (const l of [c3[0], c3[2], c3[1]]) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await settle();
    expect(answer().map((b) => b.getAttribute('data-wrong') === 'true')).toEqual([false, true, true]);
  });

  // @ac S5-AC07
  it('cả 3 bước, sai 1 câu ở bước 1: kết quả đúng số liệu, câu sai thành Cần ôn; unit cuối không có nút unit tiếp theo', async () => {
    const r = await renderApp('/kiem-tra?unit=4', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem({ wrongFirst: true });
    for (let i = 0; i < 4 + 5 + 5; i++) await doItem();
    expect(screen.getByRole('heading', { level: 1, name: 'Xong kiểm tra' })).toBeInTheDocument();
    expect(resultLines()).toEqual(['Nghe và chọn nghĩa: 4/5', 'Nghe theo cụm: 5/5', 'Sắp xếp câu: 5/5']);
    expect(screen.getByText('Đã kiểm tra 5 câu.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Kiểm tra unit tiếp theo' })).toBeNull();
    const p = savedProgress(r.mem);
    expect(p.items['4']).toMatchObject({ streak: 0 });
    expect(Object.keys(p.items)).toEqual(['4']);
    const s = p.sessions[0];
    expect(s.nguon).toBe('kiem-tra');
    expect(s.completedAt).toBeDefined();
    expect(p.attempts.filter((a: { kind: string }) => a.kind === 'nghe-chon')).toHaveLength(5);
    expect(p.attempts.filter((a: { kind: string }) => a.kind === 'sap-xep')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Xong' }));
    await settle(30);
    expect(here()).toBe('/luyen-tap');
  });

  // @ac S5-AC07
  it('sai lần đầu ở bước 3 cũng thành Cần ôn; có nút Kiểm tra unit tiếp theo khi chưa phải unit cuối', async () => {
    const r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    await doItem({ wrongFirst: true });
    for (let i = 0; i < 7; i++) await doItem();
    expect(resultLines()).toEqual(['Sắp xếp câu: 7/8']);
    expect(savedProgress(r.mem).items['1']).toMatchObject({ streak: 0 });
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra unit tiếp theo' }));
    await settle(30);
    expect(here()).toBe('/kiem-tra?unit=2');
    expect(screen.getByRole('button', { name: 'Làm cả 3 bước' })).toBeInTheDocument();
    expect(screen.getByText('Kiểm tra nhanh · Unit 2')).toBeInTheDocument();
  });

  // @ac S5-AC08
  it('thoát giữa bước 2: sheet Tạm dừng đúng chữ; Tạm dừng về T2; kết quả đã làm được lưu; bài dở giữ đúng bước và câu', async () => {
    const r = await renderApp('/luyen-tap', { seed: settingsSeed() });
    fireEvent.click(screen.getByTestId('t2-kiem-tra'));
    await settle(30);
    expect(here()).toBe('/kiem-tra?unit=1');
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem({ wrongFirst: true });
    for (let i = 0; i < 7; i++) await doItem();
    await doItem();
    expect(stepName()).toBe('Nghe theo cụm');
    const at = label();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' });
    expect(dialog).toHaveTextContent('Bài làm dở được lưu, lần sau làm tiếp từ câu này.');
    expect(within(dialog).getByRole('button', { name: 'Làm tiếp' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạm dừng' }));
    await settle(30);
    expect(here()).toBe('/luyen-tap');
    const p = savedProgress(r.mem);
    expect(p.attempts.filter((a: { kind: string }) => a.kind === 'nghe-chon')).toHaveLength(8);
    expect(p.items['1']).toMatchObject({ streak: 0 });
    expect(p.sessions[0].abandonedAt).toBeUndefined();
    expect(p.sessions[0].completedAt).toBeUndefined();
    expect(p.sessions[0].params).toMatchObject({ unit: '1', buoc: 'nghe-chon,nghe-cum,sap-xep', buocSo: '1' });
    // Tạm dừng thay mục của bài kiểm tra: Back sau đó không quay lại bài, không mở sheet xác nhận.
    await browserBack();
    expect(here()).not.toMatch(/^\/kiem-tra/);
    expect(screen.queryByRole('dialog')).toBeNull();
    await settle(30);
    if (here() !== '/luyen-tap') {
      window.history.pushState(null, '', '/luyen-tap');
      await settle(30);
    }
    fireEvent.click(screen.getByTestId('t2-kiem-tra'));
    await settle(30);
    expect(stepName()).toBe('Nghe theo cụm');
    expect(label()).toBe(at);
  });
});

describe('S5 thoát khi mở thẳng đường dẫn', () => {
  // @ac S5-AC08
  it('mở thẳng /kiem-tra: Tạm dừng giữa chừng và Thoát ở màn bắt đầu đều về T2 Luyện tập; mở lại bắt đầu từ màn bắt đầu', async () => {
    let r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).getByRole('button', { name: 'Tạm dừng' }));
    await settle(30);
    expect(here()).toBe('/luyen-tap');
    r.unmount();
    await drainHistory();
    r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    expect(screen.queryByTestId('s5-step-name')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle(30);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(here()).toBe('/luyen-tap');
  });
});

describe('S5 nút Back khi đang làm', () => {
  // @ac S5-AC08
  it('Back của trình duyệt giữa bài kiểm tra thì hỏi trước, không rời màn; liên kết thanh bên cũng hỏi', async () => {
    await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    // Mục lịch sử trước là unit 1; đang làm bài ở unit 2.
    window.history.pushState(null, '', '/kiem-tra?unit=2');
    await settle(30);
    expect(screen.getByText('Kiểm tra nhanh · Unit 2')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await browserBack();
    expect(screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).toBeInTheDocument();
    expect(here()).toBe('/kiem-tra?unit=2');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Làm tiếp' }));
    await settle();
    expect(stepName()).toBe('Nghe và chọn nghĩa');
    expect(label()).toBe('Câu 1/8');
    // Back lần nữa vẫn hỏi (mục trùng được thêm lại).
    await browserBack();
    expect(here()).toBe('/kiem-tra?unit=2');
    expect(screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Làm tiếp' }));
    await settle();
    fireEvent.click(screen.getByRole('link', { name: 'Thư viện' }));
    await settle(30);
    expect(here()).toBe('/kiem-tra?unit=2');
    expect(screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).toBeInTheDocument();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tạm dừng' }));
    await settle(30);
    expect(here()).toBe('/luyen-tap');
  });
});

describe('S5 bài kiểm tra dở', () => {
  // @ac S5-AC12
  it('tạm dừng ở bước 3 câu 2, tải lại: T2 có dòng làm dở; chạm mở lại đúng bước và câu; kết quả tính cả phần đã làm', async () => {
    let r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    while (stepName() !== 'Sắp xếp câu') await doItem();
    const n = Number(label().split('/')[1]);
    await doItem();
    expect(label()).toBe(`Câu 2/${n}`);
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tạm dừng' }));
    await settle(30);
    r = await reload(r, '/luyen-tap');
    const row = screen.getByTestId('t2-kiem-tra');
    expect(row).toHaveTextContent(`Đang làm dở: Unit 1, bước sắp xếp câu, câu 2/${n}`);
    fireEvent.click(row);
    await settle(30);
    expect(here()).toBe('/kiem-tra?unit=1&tiep=1');
    expect(stepName()).toBe('Sắp xếp câu');
    expect(label()).toBe(`Câu 2/${n}`);
    expect(dots()).toEqual(['xong', 'xong', 'dang']);
    while (stepName() === 'Sắp xếp câu') await doItem();
    const lines = resultLines();
    expect(lines[0]).toBe('Nghe và chọn nghĩa: 8/8');
    expect(lines[1]).toMatch(/^Nghe theo cụm: (\d+)\/\1$/);
    expect(lines[2]).toBe(`Sắp xếp câu: ${n}/${n}`);
    void r;
  });

  // @ac S5-AC13
  it('màn bắt đầu có Làm tiếp và Làm lại từ đầu; làm lại kết thúc bài dở; bài ở unit khác kết thúc bài dở cũ; phiên học dở của S3 không bị ảnh hưởng', async () => {
    const s3open = { id: 's3-do', nguon: 'lo-trinh', itemIds: U1, startedAt: 1, position: 2, step: 'ghi-nho', params: {} };
    let r = await renderApp('/kiem-tra?unit=1', { seed: { ...settingsSeed(), [KEY]: { schema: 1, sessions: [s3open], attempts: [], items: {} } } });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tạm dừng' }));
    await settle(30);
    r = await reload(r, '/kiem-tra?unit=1');
    expect(screen.getByRole('button', { name: 'Làm tiếp' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Làm cả 3 bước' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Làm lại từ đầu' }));
    await settle();
    expect(screen.getByRole('button', { name: 'Làm cả 3 bước' })).toBeInTheDocument();
    let p = savedProgress(r.mem);
    expect(p.sessions.find((s: { nguon: string }) => s.nguon === 'kiem-tra').abandonedAt).toBeDefined();
    expect(p.sessions.find((s: { id: string }) => s.id === 's3-do').abandonedAt).toBeUndefined();
    r = await reload(r, '/luyen-tap');
    expect(screen.getByTestId('t2-kiem-tra')).not.toHaveTextContent('Đang làm dở');

    // Bài dở ở unit 1, bắt đầu bài ở unit 2 thì bài dở cũ kết thúc.
    r = await reload(r, '/kiem-tra?unit=1');
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem();
    r = await reload(r, '/kiem-tra?unit=2');
    expect(screen.getByRole('button', { name: 'Làm cả 3 bước' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    p = savedProgress(r.mem);
    const open = p.sessions.filter((s: { nguon: string; completedAt?: number; abandonedAt?: number }) => s.nguon === 'kiem-tra' && !s.completedAt && !s.abandonedAt);
    expect(open.map((s: { params: { unit: string } }) => s.params.unit)).toEqual(['2']);
    expect(p.sessions.find((s: { id: string }) => s.id === 's3-do').abandonedAt).toBeUndefined();
  });
});

describe('S5 Câu cần xem lại', () => {
  // @ac S5-AC14
  it('liệt kê đúng các câu sai ngay lần đầu theo thứ tự trong unit, có lang và nút Nghe; đúng hết thì không có khối', async () => {
    const synth = fakeSpeech(EN_VOICE);
    const r = await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    const wrong: number[] = [];
    while (stepName()) {
      const pos = Number(label().match(/Câu (\d+)/)![1]);
      const hit = (stepName() === 'Nghe và chọn nghĩa' && pos === 2) || (stepName() === 'Sắp xếp câu' && pos === 5);
      if (hit) wrong.push(itemId());
      await doItem({ wrongFirst: hit });
    }
    expect(wrong).toHaveLength(2);
    const block = screen.getByRole('region', { name: 'Câu cần xem lại' });
    const shown = [...block.querySelectorAll('.src')];
    const expected = await Promise.all(U1.filter((id) => wrong.includes(id)).map((id) => enOf(id)));
    expect(shown.map((e) => e.textContent)).toEqual(expected);
    for (const e of shown) expect(e).toHaveAttribute('lang', 'en');
    const listen = within(block).getAllByRole('button', { name: /^Nghe/ });
    expect(listen).toHaveLength(2);
    synth.speak.mockClear();
    fireEvent.click(listen[0]);
    expect((synth.speak.mock.calls[0][0] as { text: string }).text).toBe(expected[0]);
    r.unmount();
    await drainHistory();

    await renderApp('/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    while (stepName()) await doItem();
    expect(screen.getByText('Xong kiểm tra')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Câu cần xem lại' })).toBeNull();
  });
});
