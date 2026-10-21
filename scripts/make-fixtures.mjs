#!/usr/bin/env node
// Tạo fixture cho test (DATA-09) từ bộ dữ liệu đầy đủ trong public/data.
// Chạy lại được bất cứ lúc nào: node scripts/make-fixtures.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC = path.join(ROOT, 'public/data');
const OUT = path.join(ROOT, 'fixtures/data');
const read = (p) => JSON.parse(fs.readFileSync(path.join(SRC, p), 'utf8'));
const write = (p, v) => {
  fs.mkdirSync(path.dirname(path.join(OUT, p)), { recursive: true });
  fs.writeFileSync(path.join(OUT, p), JSON.stringify(v, null, 2) + '\n');
};
const num = (id) => Number(id);

function subset(pack, lang, unitNumbers, truncate = {}) {
  const file = read(`${pack}/${lang}.json`);
  const units = read(`${pack}/units-${lang}.json`);
  const picked = units.units.filter((u) => unitNumbers.includes(u.number)).map((u) => {
    const n = truncate[u.number];
    return n ? { ...u, ids: u.ids.slice(0, n), _fixtureNote: `cắt còn ${n} câu để thử unit thiếu câu` } : u;
  });
  const keep = new Set(picked.flatMap((u) => u.ids.map(num)));
  const items = file.items.filter((it) => keep.has(it.id));
  write(`${pack}/${lang}.json`, { ...file, itemCount: items.length, items, _fixtureNote: `tập con của ${pack}/${lang}.json` });
  write(`${pack}/units-${lang}.json`, { ...units, ...(units.unitCount ? { unitCount: picked.length } : {}), ...(units.itemCount ? { itemCount: items.length } : {}), units: picked });
  return items;
}

// English Fluency: unit 1 đến 3 đủ 8 câu, unit 4 cắt còn 5 câu; tiếng Nhật (furigana), Thái, Nga (chữ Kirin): unit 1.
const LANGS = ['en', 'ja', 'th', 'ru'];
const man = read('fluency/manifest.json');
write('fluency/manifest.json', { ...man, languages: man.languages.filter((l) => LANGS.includes(l.id)) });
const idx = read('fluency/source-index.json');
write('fluency/source-index.json', { ...idx, languageCount: LANGS.length, languages: idx.languages.filter((l) => LANGS.includes(l.languageId)) });
subset('fluency', 'en', [1, 2, 3, 4], { 4: 5 });
for (const l of ['ja', 'th', 'ru']) subset('fluency', l, [1]);

// Global English: unit 1, unit 2 (chủ đề khác) và unit chứa câu tiếng Anh dài nhất (trình độ khác).
const g = read('global/en.json');
const longest = g.items.reduce((a, b) => (b.en.length > a.en.length ? b : a));
const gUnits = read('global/units-en.json').units;
const longUnit = gUnits.find((u) => u.ids.includes(longest.id)).number;
write('global/manifest.json', read('global/manifest.json'));
const gi = subset('global', 'en', [...new Set([1, 2, longUnit])]);

console.log(`Fixture: fluency ${LANGS.join(', ')}; global unit 1, 2 và ${longUnit} (câu dài nhất ${longest.en.length} ký tự, id ${longest.id}); ${gi.length} câu Global.`);

// ---------------------------------------------------------------------------
// Bộ tiến độ mẫu 30 ngày cho English Fluency tiếng Anh (DATA-09, dùng cho T4).
// Kế hoạch học viết tường minh dưới đây; script chỉ phát lại kế hoạch theo quy tắc DATA-07
// (viết lại độc lập, không dùng code của app). Số liệu T4 phải hiển thị được tính tay và ghi
// riêng ở fixtures/progress/fluency-en-30-ngay.so-lieu.json; script không ghi file đó.
// Mốc thời gian theo giờ Việt Nam (UTC+7), "bây giờ" là 2026-10-08 10:00.
const PROGRESS_OUT = path.join(ROOT, 'fixtures/progress');
const unitsEn = read('fluency/units-en.json').units;
const U = Object.fromEntries([1, 2, 3, 4].map((n) => [n, unitsEn.find((u) => u.number === n).ids.map(num).slice(0, n === 4 ? 5 : 8)]));
const MIN = 60 * 1000;
const DAY = 24 * 60 * MIN;
const INTERVAL_DAYS = [1, 3, 7, 14, 30];
const at = (date, time) => Date.parse(`2026-${date}T${time}:00+07:00`);

// Mỗi phiên: ngày, giờ xong, nguồn, unit; mem = kết quả ghi nhớ khác "nho"; check = kết quả kiểm tra khác "dung".
// Phiên kiem-tra ghi hai lượt mỗi câu (nghe-chon, sap-xep), đều đúng, nên không đổi trạng thái câu.
const PLAN = [
  { d: '09-03', t: '20:00', nguon: 'lo-trinh', unit: 1 },
  { d: '09-08', t: '08:00', nguon: 'kiem-tra', unit: 1 },
  { d: '09-09', t: '08:00', nguon: 'kiem-tra', unit: 1 },
  { d: '09-11', t: '08:00', nguon: 'kiem-tra', unit: 1 },
  { d: '09-13', t: '20:00', nguon: 'lo-trinh', unit: 2 },
  { d: '09-14', t: '20:00', nguon: 'cau', unit: 2, params: { id: '2' } },
  { d: '09-15', t: '08:00', nguon: 'kiem-tra', unit: 2 },
  { d: '09-16', t: '08:00', nguon: 'kiem-tra', unit: 2 },
  { d: '09-17', t: '20:00', nguon: 'cau', unit: 2, params: { id: '2' } },
  { d: '09-19', t: '08:00', nguon: 'kiem-tra', unit: 2 },
  { d: '09-21', t: '08:00', nguon: 'kiem-tra', unit: 1 },
  { d: '09-22', t: '08:00', nguon: 'kiem-tra', unit: 2 },
  { d: '09-24', t: '20:00', nguon: 'cau', unit: 2, params: { id: '2' } },
  { d: '09-26', t: '08:00', nguon: 'kiem-tra', unit: 2 },
  { d: '09-28', t: '20:00', nguon: 'lo-trinh', unit: 3, check: { 3: 'sai' } },
  { d: '09-29', t: '08:00', nguon: 'kiem-tra', unit: 3 },
  { d: '09-30', t: '20:00', nguon: 'cau', unit: 2, params: { id: '2' } },
  { d: '10-01', t: '08:00', nguon: 'kiem-tra', unit: 2 },
  { d: '10-02', t: '08:00', nguon: 'kiem-tra', unit: 3 },
  { d: '10-02', t: '20:00', nguon: 'on-tap', unit: 1, mem: { 1793: 'can-on' } },
  { d: '10-04', t: '21:00', nguon: 'lo-trinh', unit: 4, abandoned: true },
  { d: '10-05', t: '08:00', nguon: 'kiem-tra', unit: 1 },
  { d: '10-06', t: '20:00', nguon: 'cau', unit: 1, params: { id: '1' } },
  { d: '10-07', t: '19:00', nguon: 'on-tap', unit: 3 },
  { d: '10-08', t: '08:00', nguon: 'lo-trinh', unit: 4 },
  { d: '10-08', t: '09:00', nguon: 'kiem-tra', unit: 4 },
];

function buildProgress() {
  const sessions = [];
  const attempts = [];
  const items = {};
  PLAN.forEach((p, i) => {
    const end = at(p.d, p.t);
    const start = end - 6 * MIN;
    const ids = U[p.unit];
    const id = `fx${String(i + 1).padStart(2, '0')}`;
    // Bắt đầu phiên học mới thì phiên dở (không phải kiểm tra) bị thay (S3-08).
    if (p.nguon !== 'kiem-tra') for (const s of sessions) if (s.completedAt === undefined && s.abandonedAt === undefined && s.nguon !== 'kiem-tra') s.abandonedAt = start;
    const params = p.nguon === 'kiem-tra' ? { unit: String(p.unit) } : (p.params ?? {});
    if (p.abandoned) {
      sessions.push({ id, nguon: p.nguon, itemIds: ids, startedAt: end, position: 0, step: 'ghi-nho', params });
      return;
    }
    sessions.push({ id, nguon: p.nguon, itemIds: ids, startedAt: start, completedAt: end, position: ids.length, step: 'kiem-tra', params });
    const memAt = end - 4 * MIN;
    const chkAt = end - 2 * MIN;
    for (const itemId of ids) {
      if (p.nguon === 'kiem-tra') {
        attempts.push({ sessionId: id, itemId, at: memAt, kind: 'nghe-chon', outcome: 'dung', hinted: false });
        attempts.push({ sessionId: id, itemId, at: chkAt, kind: 'sap-xep', outcome: 'dung', hinted: false });
        continue;
      }
      const mem = p.mem?.[itemId] ?? 'nho';
      attempts.push({ sessionId: id, itemId, at: memAt, kind: 'ghi-nho', outcome: mem, hinted: false });
      const prev = items[itemId];
      const streak = mem === 'nho' ? (prev?.streak ?? 0) + 1 : 0;
      const due = streak === 0 ? memAt : memAt + INTERVAL_DAYS[Math.min(streak, 5) - 1] * DAY;
      items[itemId] = { status: 'da-hoc', streak, due, lastAt: memAt };
      const chk = p.check?.[itemId] ?? 'dung';
      attempts.push({ sessionId: id, itemId, at: chkAt, kind: 'trac-nghiem', outcome: chk, hinted: false });
      if (chk === 'sai') items[itemId] = { status: items[itemId].status, streak: 0, due: chkAt, lastAt: chkAt };
    }
  });
  return { schema: 1, sessions, attempts, items };
}

fs.mkdirSync(PROGRESS_OUT, { recursive: true });
const progress30 = buildProgress();
fs.writeFileSync(path.join(PROGRESS_OUT, 'fluency-en-30-ngay.json'), JSON.stringify(progress30, null, 2) + '\n');
console.log(`Tiến độ mẫu: ${progress30.sessions.length} phiên, ${progress30.attempts.length} lượt, ${Object.keys(progress30.items).length} câu.`);
