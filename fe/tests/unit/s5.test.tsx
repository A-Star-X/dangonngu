import { describe, expect, it } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import { FixtureSource, chunkLabel, chunkSentence, type PackId } from '../../src/data';
import { fakeSpeech, hash, renderApp, settingsSeed, settle } from './helpers';

const EN_VOICE = [{ lang: 'en-US', voiceURI: 'us', name: 'US' }];
const dots = () => [...document.querySelectorAll<HTMLElement>('.s5__dot')].map((d) => d.dataset.state);
const stepName = () => document.querySelector('.s5__bar-step')?.textContent;
const progressOf = (mem: Map<string, string>, pack = 'fluency') => JSON.parse(mem.get(`vitasr2.progress.${pack}.en`) ?? 'null');

/** Làm xong câu hiện tại của bước đang làm. wrongFirst: chọn sai một lần trước khi đúng (bước 1) hoặc xếp sai một lần (bước 3). */
async function doItem(opts: { wrongFirst?: boolean } = {}) {
  const step = stepName();
  if (step === 'Nghe và chọn nghĩa') {
    if (opts.wrongFirst) fireEvent.click(document.querySelector('.choice:not([data-correct])')!);
    fireEvent.click(document.querySelector('.choice[data-correct="true"]')!);
  } else if (step === 'Nghe theo cụm') {
    for (const b of [...document.querySelectorAll<HTMLElement>('.chunk--covered')]) fireEvent.click(b);
  } else {
    const pool = () => [...document.querySelectorAll<HTMLElement>('[data-testid="s5-pool"] .chunk')];
    const labels = (await currentChunks()).map(chunkLabel);
    if (opts.wrongFirst) {
      // Xếp ngược rồi kiểm tra, sau đó trả hết về.
      for (const l of [...labels].reverse()) fireEvent.click(pool().find((b) => b.textContent === l)!);
      fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
      await settle();
      for (const b of [...document.querySelectorAll<HTMLElement>('[data-testid="s5-answer"] .chunk')]) fireEvent.click(b);
    }
    for (const l of labels) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
  }
  await settle();
  fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
  await settle();
}

let enById: Map<number, string> | null = null;
const enOf = (id: number) => enById!.get(id)!;
async function currentChunks(): Promise<string[]> {
  if (!enById) {
    const raw = (await new FixtureSource().getLanguageFile('fluency', 'en.json')) as { items: { id: number; en: string }[] };
    enById = new Map(raw.items.map((i) => [i.id, i.en]));
  }
  const id = Number(document.querySelector<HTMLElement>('.s5__task')!.dataset.itemId);
  return chunkSentence(enById.get(id)!, 'en');
}

describe('S5 Kiểm tra nhanh', () => {
  // @ac S5-AC01
  it('không tham số là unit đang học; ?unit=2 là unit 2; bốn nút bắt đầu chạy đúng bước', async () => {
    let r = await renderApp('#/kiem-tra', { seed: settingsSeed() });
    expect(screen.getByText(/Unit 1\b/)).toBeInTheDocument();
    expect(screen.getByText('8 câu')).toBeInTheDocument();
    for (const name of ['Làm cả 3 bước', 'Chỉ nghe và chọn nghĩa', 'Chỉ nghe theo cụm', 'Chỉ sắp xếp câu']) expect(screen.getByRole('button', { name })).toBeInTheDocument();
    r.unmount();
    r = await renderApp('#/kiem-tra?unit=2', { seed: settingsSeed() });
    expect(screen.getByText(/Unit 2\b/)).toBeInTheDocument();
    r.unmount();
    for (const [btn, step] of [
      ['Làm cả 3 bước', 'Nghe và chọn nghĩa'],
      ['Chỉ nghe và chọn nghĩa', 'Nghe và chọn nghĩa'],
      ['Chỉ nghe theo cụm', 'Nghe theo cụm'],
      ['Chỉ sắp xếp câu', 'Sắp xếp câu'],
    ]) {
      r = await renderApp('#/kiem-tra?unit=2', { seed: settingsSeed() });
      fireEvent.click(screen.getByRole('button', { name: btn }));
      await settle();
      expect(stepName()).toBe(step);
      expect(screen.getByText('Câu 1/8')).toBeInTheDocument();
      r.unmount();
    }
  });

  // @ac S5-AC02
  it('cả 3 bước: 3 chấm, đổi trạng thái khi sang bước; một bước: 1 chấm', async () => {
    let r = await renderApp('#/kiem-tra?unit=4', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    expect(dots()).toEqual(['dang', 'chua', 'chua']);
    for (let i = 0; i < 5; i++) await doItem();
    expect(stepName()).toBe('Nghe theo cụm');
    expect(dots()).toEqual(['xong', 'dang', 'chua']);
    for (let i = 0; i < 5; i++) await doItem();
    expect(dots()).toEqual(['xong', 'xong', 'dang']);
    r.unmount();
    r = await renderApp('#/kiem-tra?unit=4', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    expect(dots()).toEqual(['dang']);
  });

  // @ac S5-AC03
  it('có giọng: vào câu gọi speak một lần, chưa có chữ câu gốc trước khi chọn đúng; không có giọng: hiện chữ ngay và có thông báo', async () => {
    const synth = fakeSpeech(EN_VOICE);
    let r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    expect(synth.speak).toHaveBeenCalledTimes(1);
    expect((synth.speak.mock.calls[0][0] as { text: string }).text).toBe('I want to...');
    expect(screen.queryByTestId('s5-source')).toBeNull();
    expect(screen.queryByText('I want to...')).toBeNull();
    expect(screen.getByRole('button', { name: 'Nghe lại' })).toBeInTheDocument();
    fireEvent.click(document.querySelector('.choice[data-correct="true"]')!);
    await settle();
    expect(screen.getByTestId('s5-source')).toHaveTextContent('I want to...');
    fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
    await settle();
    expect(synth.speak).toHaveBeenCalledTimes(2);
    expect((synth.speak.mock.calls[1][0] as { text: string }).text).toBe('want to know...');
    r.unmount();
    fakeSpeech([{ lang: 'vi-VN', voiceURI: 'vi', name: 'VI' }]);
    r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    expect(screen.getByTestId('s5-source')).toHaveTextContent('I want to...');
    expect(screen.getByText('Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nghe lại' })).toBeNull();
  });

  // @ac S5-AC03
  it('trình duyệt chưa trả danh sách giọng: chưa có câu hỏi và 4 lựa chọn; hết 1,5 giây thì hiện cùng chữ câu gốc', async () => {
    fakeSpeech([]);
    await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    expect(document.querySelector('.s5__task[aria-busy="true"]')).not.toBeNull();
    expect(document.querySelectorAll('.choice')).toHaveLength(0);
    expect(screen.queryByText('Câu bạn nghe nghĩa là gì?')).toBeNull();
    await settle(1600);
    expect(document.querySelectorAll('.choice')).toHaveLength(4);
    expect(screen.getByText('Câu bạn nghe nghĩa là gì?')).toBeInTheDocument();
    expect(screen.getByTestId('s5-source')).toHaveTextContent('I want to...');
    expect(screen.getByText('Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh.')).toBeInTheDocument();
  });

  // @ac S5-AC04
  it('nghe theo cụm: chạm hết cụm thì có Câu tiếp; câu 1 cụm bị bỏ qua', async () => {
    await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe theo cụm' }));
    await settle();
    const covered = [...document.querySelectorAll<HTMLElement>('.chunk--covered')];
    expect(covered).toHaveLength(chunkSentence('I want to...', 'en').length);
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    for (const b of covered.slice(0, -1)) fireEvent.click(b);
    await settle();
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    fireEvent.click(covered[covered.length - 1]);
    await settle();
    expect(screen.getByRole('button', { name: 'Câu tiếp' })).toBeInTheDocument();
    expect([...document.querySelectorAll('.s5__chunks .chunk')].map((b) => b.textContent).join(' ')).toBe('I want to...');
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
    await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed(), source: new OneWord() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe theo cụm' }));
    await settle();
    expect(screen.getByText('Câu 1/7')).toBeInTheDocument();
    expect(document.querySelector('.s5__meaning')).toHaveTextContent('muốn biết...');
  });

  // @ac S5-AC05
  it('sắp xếp: thứ tự xáo khác thứ tự đúng; xếp đúng thành Câu tiếp; xếp sai đánh dấu đúng các cụm sai vị trí', async () => {
    const r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    const chunks = chunkSentence('I want to...', 'en').map(chunkLabel);
    const poolLabels = () => [...document.querySelectorAll('[data-testid="s5-pool"] .chunk')].map((b) => b.textContent);
    const first = poolLabels();
    expect(first).not.toEqual(chunks);
    expect([...first].sort()).toEqual([...chunks].sort());
    expect(screen.getByRole('button', { name: 'Kiểm tra' })).toHaveAttribute('aria-disabled', 'true');
    r.unmount();
    await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    expect(poolLabels()).toEqual(first);
    // Câu 2 có 2 cụm: xếp ngược thì cả 2 sai vị trí.
    await doItem();
    const c2 = chunkSentence('want to know...', 'en').map(chunkLabel);
    const pool = () => [...document.querySelectorAll<HTMLElement>('[data-testid="s5-pool"] .chunk')];
    for (const l of [...c2].reverse()) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await settle();
    const marked = [...document.querySelectorAll('[data-testid="s5-answer"] .chunk')].map((b) => b.getAttribute('data-wrong') === 'true');
    expect(marked).toEqual([true, true]);
    expect(screen.queryByRole('button', { name: 'Câu tiếp' })).toBeNull();
    // Xếp sai: dòng báo nhìn thấy được, màu --wrong (FND-02).
    expect(screen.getByTestId('s5-feedback')).toHaveTextContent('Chưa đúng. Nhấn các cụm có dấu x để đưa về hàng cụm, rồi xếp lại.');
    expect(screen.getByTestId('s5-feedback')).toHaveClass('s5__feedback--wrong');
    // Câu 3 có 5 từ (3 cụm): đổi chỗ hai cụm cuối thì chỉ hai cụm đó bị đánh dấu.
    for (const b of [...document.querySelectorAll<HTMLElement>('[data-testid="s5-answer"] .chunk')]) fireEvent.click(b);
    for (const l of c2) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await settle();
    expect(document.querySelector('[data-testid="s5-answer"]')).toHaveClass('s5__answer--right');
    fireEvent.click(screen.getByRole('button', { name: 'Câu tiếp' }));
    await settle();
    const c3 = chunkSentence('want to know what happened', 'en').map(chunkLabel);
    expect(c3).toHaveLength(3);
    for (const l of [c3[0], c3[2], c3[1]]) fireEvent.click(pool().find((b) => b.textContent === l)!);
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra' }));
    await settle();
    expect([...document.querySelectorAll('[data-testid="s5-answer"] .chunk')].map((b) => b.getAttribute('data-wrong') === 'true')).toEqual([false, true, true]);
  });

  // @ac S5-AC07
  it('cả 3 bước, sai 1 câu ở bước 1: kết quả đúng số liệu, câu sai thành Cần ôn; unit cuối không có nút unit tiếp theo', async () => {
    const r = await renderApp('#/kiem-tra?unit=4', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem({ wrongFirst: true });
    for (let i = 0; i < 4 + 5 + 5; i++) await doItem();
    expect(screen.getByText('Xong kiểm tra')).toBeInTheDocument();
    expect(screen.getByText('Nghe và chọn nghĩa: 4/5')).toBeInTheDocument();
    expect(screen.getByText('Nghe theo cụm: 5/5')).toBeInTheDocument();
    expect(screen.getByText('Sắp xếp câu: 5/5')).toBeInTheDocument();
    expect(screen.getByText('Đã kiểm tra 5 câu.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Kiểm tra unit tiếp theo' })).toBeNull();
    const p = progressOf(r.mem);
    expect(p.items['4']).toMatchObject({ streak: 0, status: 'kiem-tra' });
    expect(Object.keys(p.items)).toEqual(['4']);
    const s = p.sessions[0];
    expect(s.nguon).toBe('kiem-tra');
    expect(s.completedAt).toBeDefined();
    expect(p.attempts.filter((a: { kind: string }) => a.kind === 'nghe-chon')).toHaveLength(5);
    expect(p.attempts.filter((a: { kind: string }) => a.kind === 'sap-xep')).toHaveLength(5);
    fireEvent.click(screen.getByRole('button', { name: 'Xong' }));
    expect(hash()).toBe('#/luyen-tap');
  });

  // @ac S5-AC07
  it('sai lần đầu ở bước 3 cũng thành Cần ôn; có nút Kiểm tra unit tiếp theo khi chưa phải unit cuối', async () => {
    const r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ sắp xếp câu' }));
    await settle();
    await doItem({ wrongFirst: true });
    for (let i = 0; i < 7; i++) await doItem();
    expect(screen.getByText('Sắp xếp câu: 7/8')).toBeInTheDocument();
    expect(progressOf(r.mem).items['1']).toMatchObject({ streak: 0 });
    fireEvent.click(screen.getByRole('button', { name: 'Kiểm tra unit tiếp theo' }));
    await settle();
    expect(hash()).toBe('#/kiem-tra?unit=2');
    expect(screen.getByRole('button', { name: 'Làm cả 3 bước' })).toBeInTheDocument();
    expect(screen.getByText(/Unit 2\b/)).toBeInTheDocument();
  });

  // @ac S5-AC08
  it('thoát giữa bước 2: sheet Tạm dừng đúng chữ; Tạm dừng về T2; kết quả đã làm được lưu; bài dở giữ đúng bước và câu', async () => {
    const r = await renderApp('#/luyen-tap', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra nhanh/ }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem({ wrongFirst: true });
    for (let i = 0; i < 7; i++) await doItem();
    await doItem();
    expect(stepName()).toBe('Nghe theo cụm');
    const at = screen.getByText(/^Câu \d+\/\d+$/).textContent;
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    const dialog = screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' });
    expect(dialog).toHaveTextContent('Bài làm dở được lưu, lần sau làm tiếp từ câu này.');
    expect(within(dialog).getByRole('button', { name: 'Làm tiếp' })).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tạm dừng' }));
    await settle();
    expect(hash()).toBe('#/luyen-tap');
    const p = progressOf(r.mem);
    expect(p.attempts.filter((a: { kind: string }) => a.kind === 'nghe-chon')).toHaveLength(8);
    expect(p.items['1']).toMatchObject({ streak: 0 });
    expect(p.sessions[0].abandonedAt).toBeUndefined();
    expect(p.sessions[0].completedAt).toBeUndefined();
    expect(p.sessions[0].params).toMatchObject({ unit: '1', buoc: 'nghe-chon,nghe-cum,sap-xep', buocSo: '1' });
    fireEvent.click(screen.getByRole('button', { name: /Kiểm tra nhanh/ }));
    await settle();
    expect(stepName()).toBe('Nghe theo cụm');
    expect(screen.getByText(/^Câu \d+\/\d+$/).textContent).toBe(at);
  });
});

describe('S5 thoát khi mở thẳng đường dẫn', () => {
  // @ac S5-AC08
  it('mở thẳng #/kiem-tra: Tạm dừng giữa chừng và Thoát ở màn bắt đầu đều về T2 Luyện tập', async () => {
    let r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).getByRole('button', { name: 'Tạm dừng' }));
    await settle();
    expect(hash()).toBe('#/luyen-tap');
    r.unmount();
    r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(hash()).toBe('#/luyen-tap');
  });
});

describe('S5 nút Back khi đang làm', () => {
  // @ac S5-AC08
  it('Back sang unit khác giữa bài kiểm tra thì hỏi trước, không rời màn', async () => {
    await renderApp('#/kiem-tra?unit=2', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    window.location.hash = '#/kiem-tra?unit=1';
    await settle(30);
    expect(screen.getByRole('dialog', { name: 'Tạm dừng kiểm tra?' })).toBeInTheDocument();
    expect(hash()).toBe('#/kiem-tra?unit=2');
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Làm tiếp' }));
    await settle();
    expect(stepName()).toBe('Nghe và chọn nghĩa');
  });
});

// Đợt 5 việc 8: bài kiểm tra dở (S5-09) và khối Câu cần xem lại (S5-07).
const label = () => screen.getByText(/^Câu \d+\/\d+$/).textContent!;
const itemId = () => Number(document.querySelector<HTMLElement>('.s5__task')!.dataset.itemId);
const reload = async (r: { mem: Map<string, string>; unmount: () => void }, hashTo: string) => {
  const saved = progressOf(r.mem);
  r.unmount();
  return renderApp(hashTo, { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': saved } });
};

describe('S5 bài kiểm tra dở', () => {
  // @ac S5-AC12
  it('tạm dừng ở bước 3 câu 2, tải lại: T2 có dòng làm dở; chạm mở lại đúng bước và câu; kết quả tính cả phần đã làm', async () => {
    let r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    while (stepName() !== 'Sắp xếp câu') await doItem();
    const n = Number(label().split('/')[1]);
    await doItem();
    expect(label()).toBe(`Câu 2/${n}`);
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tạm dừng' }));
    await settle();
    r = await reload(r, '#/luyen-tap');
    const row = screen.getByTestId('t2-kiem-tra');
    expect(row).toHaveTextContent(`Đang làm dở: Unit 1, bước sắp xếp câu, câu 2/${n}`);
    fireEvent.click(row);
    await settle();
    expect(hash()).toBe('#/kiem-tra?unit=1&tiep=1');
    expect(stepName()).toBe('Sắp xếp câu');
    expect(label()).toBe(`Câu 2/${n}`);
    expect(dots()).toEqual(['xong', 'xong', 'dang']);
    while (stepName() === 'Sắp xếp câu') await doItem();
    const lines = [...document.querySelectorAll('.s5__result > li')].map((l) => l.textContent);
    expect(lines[0]).toBe('Nghe và chọn nghĩa: 8/8');
    expect(lines[1]).toMatch(/^Nghe theo cụm: (\d+)\/\1$/);
    expect(lines[2]).toBe(`Sắp xếp câu: ${n}/${n}`);
  });

  // @ac S5-AC13
  it('màn bắt đầu có Làm tiếp và Làm lại từ đầu; làm lại kết thúc bài dở; bài ở unit khác kết thúc bài dở cũ; phiên học dở của S3 không bị ảnh hưởng', async () => {
    const s3open = { id: 's3-do', nguon: 'lo-trinh', itemIds: [1, 257, 769, 770, 258, 771, 772, 1793], startedAt: 1, position: 2, step: 'ghi-nho', params: {} };
    let r = await renderApp('#/kiem-tra?unit=1', { seed: { ...settingsSeed(), 'vitasr2.progress.fluency.en': { schema: 1, sessions: [s3open], attempts: [], items: {} } } });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem();
    fireEvent.click(screen.getByRole('button', { name: 'Thoát' }));
    await settle();
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Tạm dừng' }));
    await settle();
    r = await reload(r, '#/kiem-tra?unit=1');
    expect(screen.getByRole('button', { name: 'Làm tiếp' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Làm cả 3 bước' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Làm lại từ đầu' }));
    await settle();
    expect(screen.getByRole('button', { name: 'Làm cả 3 bước' })).toBeInTheDocument();
    let p = progressOf(r.mem);
    expect(p.sessions.find((s: { nguon: string }) => s.nguon === 'kiem-tra').abandonedAt).toBeDefined();
    expect(p.sessions.find((s: { id: string }) => s.id === 's3-do').abandonedAt).toBeUndefined();
    r = await reload(r, '#/luyen-tap');
    expect(screen.getByTestId('t2-kiem-tra')).not.toHaveTextContent('Đang làm dở');

    // Bài dở ở unit 1, bắt đầu bài ở unit 2 thì bài dở cũ kết thúc.
    r = await reload(r, '#/kiem-tra?unit=1');
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    await doItem();
    r = await reload(r, '#/kiem-tra?unit=2');
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    p = progressOf(r.mem);
    const open = p.sessions.filter((s: { nguon: string; completedAt?: number; abandonedAt?: number }) => s.nguon === 'kiem-tra' && !s.completedAt && !s.abandonedAt);
    expect(open.map((s: { params: { unit: string } }) => s.params.unit)).toEqual(['2']);
    expect(p.sessions.find((s: { id: string }) => s.id === 's3-do').abandonedAt).toBeUndefined();
  });
});

describe('S5 Câu cần xem lại', () => {
  // @ac S5-AC14
  it('liệt kê đúng các câu sai ngay lần đầu theo thứ tự trong unit, có lang và nút Nghe; đúng hết thì không có khối', async () => {
    fakeSpeech(EN_VOICE);
    const r = await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Làm cả 3 bước' }));
    await settle();
    const wrong: number[] = [];
    while (stepName()) {
      const pos = Number(label().match(/Câu (\d+)/)![1]);
      const hit = (stepName() === 'Nghe và chọn nghĩa' && pos === 2) || (stepName() === 'Sắp xếp câu' && pos === 5);
      if (hit) wrong.push(itemId());
      await doItem({ wrongFirst: hit });
    }
    const order = [1, 257, 769, 770, 258, 771, 772, 1793];
    const block = screen.getByRole('region', { name: 'Câu cần xem lại' });
    const shown = [...block.querySelectorAll('.src')];
    expect(shown.map((e) => e.textContent)).toEqual(order.filter((id) => wrong.includes(id)).map((id) => enOf(id)));
    for (const e of shown) expect(e).toHaveAttribute('lang', 'en');
    expect(within(block).getAllByRole('button', { name: /^Nghe/ })).toHaveLength(2);
    r.unmount();

    await renderApp('#/kiem-tra?unit=1', { seed: settingsSeed() });
    fireEvent.click(screen.getByRole('button', { name: 'Chỉ nghe và chọn nghĩa' }));
    await settle();
    while (stepName()) await doItem();
    expect(screen.getByText('Xong kiểm tra')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: 'Câu cần xem lại' })).toBeNull();
  });
});
