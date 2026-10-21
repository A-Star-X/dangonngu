import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import {
  DataContractError,
  buildLanguageData,
  loadCatalog,
  loadLanguageData,
  buildChoices,
  normalizeMeaning,
  searchItems,
  applyMemorize,
  applyCheck,
  displayStatus,
  dueItemIds,
  DAY,
  nextItemId,
  sessionGroup,
  emptyProgress,
  recordMemorize,
  SafeStorage,
  loadProgress,
  saveProgress,
  progressKey,
  startSession,
  type DataSource,
  type PackId,
} from '@/domain';
import { StaticFileSource } from '@/services/content-services/api';
import { FixtureSource } from './fixture-source';

const fixture = new FixtureSource();

async function fixtureLang(lang: string, pack: PackId) {
  const cat = await loadCatalog(fixture);
  return loadLanguageData(fixture, cat, lang, pack);
}

describe('DATA hợp đồng và nguồn', () => {
  // @ac DATA-AC01
  it('đọc toàn bộ fixture: mọi câu có id, en, vi; mọi id trong unit khớp một câu', async () => {
    const cat = await loadCatalog(fixture);
    let checked = 0;
    for (const l of cat.languages) {
      for (const pack of l.packs) {
        const d = await loadLanguageData(fixture, cat, l.id, pack);
        for (const it of d.items) {
          expect(typeof it.id).toBe('number');
          expect(it.en.length).toBeGreaterThan(0);
          expect(it.vi.length).toBeGreaterThan(0);
        }
        for (const u of d.units) for (const id of u.ids) expect(d.byId.has(id)).toBe(true);
        checked++;
      }
    }
    // en có hai bộ, ja, ru, th mỗi ngôn ngữ một bộ.
    expect(checked).toBe(5);
    const ja = await fixtureLang('ja', 'fluency');
    expect(ja.items[0].en).toMatch(/[぀-ヿ一-鿿]/);
  });

  // @ac DATA-AC02
  it('item thiếu vi hoặc id dạng chữ bị báo sai hợp đồng', () => {
    const lang = { id: 'en', name: 'Tiếng Anh', locale: 'en-US', file: 'en.json', units: 'units-en.json' };
    const units = { units: [{ number: 1, ids: [1] }] };
    expect(() => buildLanguageData('fluency', lang, { items: [{ id: 1, en: 'Hi' }] }, units)).toThrow(DataContractError);
    expect(() => buildLanguageData('fluency', lang, { items: [{ id: 'abc', en: 'Hi', vi: 'Chào' }] }, units)).toThrow(DataContractError);
    expect(() => buildLanguageData('fluency', lang, { items: [{ id: 1, en: 'Hi', vi: 'Chào' }] }, { units: [{ ids: ['x1'] }] })).toThrow(
      DataContractError,
    );
  });

  // @ac DATA-AC03
  it('unit 5 câu tạo phiên 5 câu; id "0001" khớp item id 1', async () => {
    const d = await fixtureLang('en', 'fluency');
    expect(d.units[0].ids[0]).toBe(1);
    expect(d.byId.get(1)?.en).toBe('I want to...');
    let p = emptyProgress();
    for (const u of d.units.slice(0, 3)) for (const id of u.ids) p = recordMemorize(p, 's', id, 'nho', 0);
    const g = sessionGroup('lo-trinh', {}, d, p, 0);
    expect(g.itemIds).toHaveLength(5);
    expect(g.itemIds).toEqual(d.units[3].ids);
  });

  // @ac DATA-AC16
  it('manifest Global không có count vẫn hợp lệ; danh sách bộ đúng theo ngôn ngữ', async () => {
    const cat = await loadCatalog(fixture);
    expect(cat.manifests.global?.count).toBeUndefined();
    const en = cat.languages.find((l) => l.id === 'en')!;
    expect(en.packs).toEqual(['global', 'fluency']);
    expect(cat.languages.find((l) => l.id === 'ja')!.packs).toEqual(['fluency']);
    const g = await fixtureLang('en', 'global');
    expect(g.units[0].ids[0]).toBe(1);
    expect(g.byId.get(1)).toBeDefined();
    const f = await fixtureLang('en', 'fluency');
    expect(f.byId.get(f.units[0].ids[0])?.id).toBe(1);
  });

  // @ac DATA-AC19
  it('đọc toàn bộ public/data qua StaticFileSource', async () => {
    const root = path.resolve(process.cwd(), 'public') + '/';
    const fetchFromDisk = (async (url: string) => {
      try {
        const body = readFileSync(root + url.replace(/^\//, ''));
        return new Response(body, { status: 200 });
      } catch {
        return new Response('', { status: 404 });
      }
    }) as unknown as typeof fetch;
    const src = new StaticFileSource(fetchFromDisk);
    const cat = await loadCatalog(src);
    expect(cat.manifests.fluency?.languages).toHaveLength(15);
    for (const l of cat.manifests.fluency!.languages) {
      const d = await loadLanguageData(src, cat, l.id, 'fluency');
      expect(d.items).toHaveLength(4096);
      expect(d.units).toHaveLength(512);
    }
    const g = await loadLanguageData(src, cat, 'en', 'global');
    expect(g.items).toHaveLength(4608);
    expect(g.units).toHaveLength(576);
    const inv = JSON.parse(readFileSync(root + 'data/_inventory.json', 'utf8')) as { files: { path: string; sha256: string }[] };
    expect(inv.files.filter((x) => x.path.startsWith('data/')).length).toBe(38);
    for (const f of inv.files.filter((x) => x.path.startsWith('data/'))) {
      // Máy Windows có core.autocrlf đổi LF thành CRLF khi checkout; mã băm tính trên bản LF như trong git.
      const lf = Buffer.from(readFileSync(root + f.path).toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
      const sha = createHash('sha256').update(lf).digest('hex');
      expect(sha, f.path).toBe(f.sha256);
    }
  }, 60000);
});

describe('DATA quy tắc', () => {
  // @ac DATA-AC08
  it('quy tắc ôn: chuỗi Tôi nhớ cho due sau 1, 3, 7, 14, 30, 30 ngày; Cần ôn lại, sai, gợi ý đưa streak về 0', () => {
    const t0 = new Date(2026, 9, 1, 9, 0).getTime();
    let s = undefined as ReturnType<typeof applyMemorize> | undefined;
    const gaps: number[] = [];
    for (let i = 0; i < 6; i++) {
      s = applyMemorize(s, 'nho', t0);
      gaps.push((s.due - t0) / DAY);
    }
    expect(gaps).toEqual([1, 3, 7, 14, 30, 30]);
    expect(displayStatus(s, t0)).toBe('da-nho');

    const r1 = applyMemorize(s, 'can-on', t0);
    expect(r1.streak).toBe(0);
    expect(displayStatus(r1, t0)).toBe('can-on');
    const r2 = applyCheck(s, false, false, t0)!;
    expect(r2.streak).toBe(0);
    expect(displayStatus(r2, t0)).toBe('can-on');
    const r3 = applyCheck(s, true, true, t0)!;
    expect(r3.streak).toBe(0);
    expect(displayStatus(r3, t0)).toBe('can-on');
    expect(applyCheck(s, true, false, t0)).toBe(s);
    expect(displayStatus(undefined, t0)).toBe('chua-hoc');

    // Học hôm nay với streak 1 thì ngày mai thành Cần ôn.
    const one = applyMemorize(undefined, 'nho', t0);
    expect(displayStatus(one, t0)).toBe('da-nho');
    expect(displayStatus(one, t0 + DAY)).toBe('can-on');
    const p = { ...emptyProgress(), items: { 5: one, 6: r1 } };
    expect(dueItemIds(p, t0)).toEqual([6]);
    expect(dueItemIds(p, t0 + DAY)).toEqual([6, 5]);
  });

  // @ac DATA-AC10
  it('đáp án nhiễu: 4 lựa chọn, một đúng, không trùng sau chuẩn hóa, tất định', async () => {
    for (const pack of ['fluency', 'global'] as const) {
      const d = await fixtureLang('en', pack);
      for (const it of d.items) {
        const a = buildChoices(d, it);
        expect(a).toHaveLength(4);
        expect(a.filter((c) => c.correct)).toHaveLength(1);
        expect(a.find((c) => c.correct)!.text).toBe(it.vi);
        expect(new Set(a.map((c) => normalizeMeaning(c.text))).size).toBe(4);
        expect(buildChoices(d, it)).toEqual(a);
      }
    }
  });

  // @ac DATA-AC14
  it('lộ trình: tiến độ trống bắt đầu ở câu đầu unit 1; xong unit 1 thì sang câu đầu unit 2', async () => {
    const d = await fixtureLang('en', 'fluency');
    let p = emptyProgress();
    expect(nextItemId(d, p)).toBe(d.units[0].ids[0]);
    for (const id of d.units[0].ids) p = recordMemorize(p, 's', id, id % 2 ? 'nho' : 'can-on', 0);
    expect(nextItemId(d, p)).toBe(d.units[1].ids[0]);
  });

  // @ac DATA-AC15
  it('tìm kiếm không dấu, không phân biệt hoa thường, theo thứ tự id', async () => {
    const data = {
      items: [
        { id: 3, en: 'Book a room', vi: 'Đặt phòng' },
        { id: 1, en: 'I would like to book', vi: 'Tôi muốn đặt' },
        { id: 2, en: 'Hello', vi: 'Xin chào' },
      ],
    };
    expect(searchItems(data, 'dat phong').map((i) => i.id)).toEqual([3]);
    expect(searchItems(data, 'BOOK').map((i) => i.id)).toEqual([1, 3]);
    const g = await fixtureLang('en', 'global');
    const school = searchItems(g, 'truong hoc');
    expect(school.length).toBeGreaterThan(0);
    expect(g.items.filter((i) => i.topic === 'Trường học').every((i) => school.includes(i))).toBe(true);
    const f = await fixtureLang('en', 'fluency');
    expect(() => searchItems(f, 'truong hoc')).not.toThrow();
  });
});

describe('DATA tiến độ', () => {
  // @ac DATA-AC17
  it('tiến độ của hai bộ tiếng Anh giữ riêng', () => {
    const mem = new Map<string, string>();
    const backend = {
      getItem: (k: string) => mem.get(k) ?? null,
      setItem: (k: string, v: string) => void mem.set(k, v),
      removeItem: (k: string) => void mem.delete(k),
    } as unknown as Storage;
    const store = new SafeStorage(backend);
    let g = loadProgress(store, 'global', 'en');
    g = recordMemorize(startSession(g, 'lo-trinh', [1], {}, 1).progress, 'x', 1, 'nho', 1);
    saveProgress(store, 'global', 'en', g);
    let f = loadProgress(store, 'fluency', 'en');
    expect(f.attempts).toHaveLength(0);
    f = recordMemorize(f, 'y', 1, 'can-on', 2);
    saveProgress(store, 'fluency', 'en', f);
    expect([...mem.keys()].sort()).toEqual([progressKey('fluency', 'en'), progressKey('global', 'en')]);
    expect(loadProgress(store, 'global', 'en')).toEqual(g);
    expect(loadProgress(store, 'global', 'en').items[1].streak).toBe(1);
  });

  it('localStorage ném lỗi thì chuyển sang bộ nhớ tạm và báo bị chặn', () => {
    const backend = {
      getItem: () => null,
      setItem: () => {
        throw new Error('QuotaExceeded');
      },
      removeItem: () => undefined,
    } as unknown as Storage;
    const store = new SafeStorage(backend);
    expect(store.isBlocked()).toBe(true);
    store.set('vitasr2.settings', '{"a":1}');
    expect(store.get('vitasr2.settings')).toBe('{"a":1}');
  });

  it('DataSource lỗi mạng ném lỗi tải, không treo', async () => {
    const bad: DataSource = new StaticFileSource((async () => {
      throw new TypeError('Failed to fetch');
    }) as unknown as typeof fetch);
    await expect(loadCatalog(bad)).rejects.toThrow();
  });
});
