import { describe, expect, it } from 'vitest';
import {
  chunkCount,
  chunkLabel,
  chunkSentence,
  dailyCounts,
  emptyProgress,
  exportFileName,
  loadCatalog,
  loadLanguageData,
  makeExport,
  parseImport,
  rangeStats,
  reviewSchedule,
  shuffleOrder,
  defaultSettings,
  type Progress,
} from '@/domain';
import { FixtureSource } from './fixture-source';
import { NOW, PROGRESS_30, SO_LIEU_30 } from './helpers';

const P = PROGRESS_30 as unknown as Progress;

describe('DATA-09 tiến độ mẫu 30 ngày', () => {
  it('đồng hồ của test khớp mốc "bây giờ" của tiến độ mẫu', () => {
    expect(NOW).toBe(Date.parse(SO_LIEU_30.now));
  });

  // @ac T4-AC02, T4-AC06
  it('số liệu tính từ tiến độ mẫu khớp file số liệu tính tay', async () => {
    const src = new FixtureSource();
    const d = await loadLanguageData(src, await loadCatalog(src), 'en', 'fluency');
    const valid = (id: number) => d.byId.has(id);
    for (const k of [1, 7, 30] as const) {
      const exp = SO_LIEU_30.ranges[String(k) as '1' | '7' | '30'];
      const s = rangeStats(P, NOW, k, valid);
      expect({ k, sessions: s.sessions, items: s.items }).toEqual({ k, sessions: exp.sessions, items: exp.items });
      expect(s.dueToday).toBe(SO_LIEU_30.dueToday);
      if (exp.chart) expect(dailyCounts(P, NOW, k, valid).map((c) => c.count)).toEqual(exp.chart);
    }
    expect(reviewSchedule(P, NOW, valid)).toEqual(SO_LIEU_30.schedule);
  });
});

describe('S5 chia cụm và xáo cụm', () => {
  const sentence = (n: number) => Array.from({ length: n }, (_, i) => `w${i + 1}`).join(' ') + '.';

  // @ac S5-AC04
  it('câu 1, 3, 7, 8, 12 từ cho 1, 2, 3, 4, 4 cụm; ghép lại đúng câu gốc; phần dư dồn vào cụm đầu', () => {
    const counts = [1, 3, 7, 8, 12].map((n) => chunkSentence(sentence(n), 'en').length);
    expect(counts).toEqual([1, 2, 3, 4, 4]);
    for (const n of [1, 2, 3, 4, 5, 7, 8, 9, 12, 20]) expect(chunkSentence(sentence(n), 'en').join('')).toBe(sentence(n));
    expect(chunkSentence(sentence(7), 'en').map(chunkLabel)).toEqual(['w1 w2 w3', 'w4 w5', 'w6 w7.']);
    expect([0, 1, 2, 3, 4, 7, 8].map(chunkCount)).toEqual([1, 1, 2, 2, 3, 3, 4]);
    // Dấu câu đầu và cuối đi theo cụm, ghép lại vẫn đúng.
    const s = '"Well, I\'d rather stay at home," she said.';
    expect(chunkSentence(s, 'en').join('')).toBe(s);
    // Tiếng Nhật không có khoảng trắng vẫn chia được theo từ.
    const ja = '何が起きたのか知りたい';
    const jc = chunkSentence(ja, 'ja');
    expect(jc.join('')).toBe(ja);
    expect(jc.length).toBeGreaterThan(1);
  });

  // @ac S5-AC05
  it('thứ tự xáo khác thứ tự đúng và giống nhau giữa hai lần', () => {
    for (const n of [2, 3, 5, 8, 12]) {
      const chunks = chunkSentence(sentence(n), 'en');
      for (const id of [1, 2, 3, 257, 769, 1793]) {
        const a = shuffleOrder(chunks, `fluency:en:${id}`);
        const b = shuffleOrder(chunks, `fluency:en:${id}`);
        expect(a).toEqual(b);
        expect([...a].sort()).toEqual(chunks.map((_, i) => i));
        expect(a.map((i) => chunkLabel(chunks[i]))).not.toEqual(chunks.map(chunkLabel));
      }
    }
  });
});

describe('S8 xuất và nhập tiến độ', () => {
  // @ac S8-AC06
  it('file xuất đọc lại được; file của ngôn ngữ hoặc bộ khác, JSON bất kỳ, sai cấu trúc đều bị từ chối', () => {
    const file = makeExport('fluency', 'en', defaultSettings(), P, NOW);
    const text = JSON.stringify(file);
    expect(exportFileName('en', NOW)).toBe('vitasr-tien-do-en-2026-10-08.json');
    expect(parseImport(text, 'fluency', 'en')).toEqual(P);
    expect(parseImport(text, 'fluency', 'ja')).toBeNull();
    expect(parseImport(text, 'global', 'en')).toBeNull();
    expect(parseImport('{"a":1}', 'fluency', 'en')).toBeNull();
    expect(parseImport('không phải json', 'fluency', 'en')).toBeNull();
    const broken = { ...file, progress: { ...P, attempts: [{ sessionId: 1, itemId: 'x' }] } };
    expect(parseImport(JSON.stringify(broken), 'fluency', 'en')).toBeNull();
    const empty = makeExport('fluency', 'en', defaultSettings(), emptyProgress(), NOW);
    expect(parseImport(JSON.stringify(empty), 'fluency', 'en')).toEqual(emptyProgress());
  });
});
