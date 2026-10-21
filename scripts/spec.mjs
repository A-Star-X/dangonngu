#!/usr/bin/env node
// Công cụ truy vết spec <-> code <-> acceptance. Chỉ dùng thư viện chuẩn của Node (>= 18).
//
//   node scripts/spec.mjs trace       ghi docs/generated/traceability.md
//   node scripts/spec.mjs acceptance  ghi docs/generated/acceptance-report.md
//   node scripts/spec.mjs check       chạy cả hai, thoát mã 1 nếu có lỗi định dạng hoặc ánh xạ
//
// Quy ước (chi tiết trong docs/QUY-TRINH.md):
//   spec.md        yêu cầu là tiêu đề "### <ID> <tên>", ví dụ "### T1-02 Nút chính đổi chữ"
//   acceptance.md  mục kiểm là "- [ ] <AC-ID> [auto|claude|human] <ID yêu cầu, ...>: <mô tả>"
//   code           ghi chú "@spec T1-02" (hoặc nhiều ID cách nhau dấu phẩy) trong file nguồn
//   test           ghi chú "@ac T1-AC03" trong file test
//   sơ đồ          trong khối mermaid của docs/new/navigation.md, mỗi mũi tên có dòng "%% @spec <ID>"
//                  (hoặc "%% @none <lý do>") ngay bên dưới

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SPEC_ROOTS = ['docs/new', 'docs/spec'];
const CODE_ROOTS = ['src', 'tests', 'scripts', 'supabase'];
const OUT_DIR = 'docs/generated';
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.git', 'coverage', 'fixtures']);
const CODE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.vue', '.svelte', '.css', '.scss', '.html', '.sql']);

const REQ_RE = /^###\s+([A-Z]+\d*-\d{2,3})\b\s*(.*)$/;
const AC_LINE_RE = /^\s*- \[( |x|X)\]\s+([A-Z]+\d*-AC\d{2,3})\s+\[(auto|claude|human)\]\s+([^:]+):\s*(.*)$/;
const AC_LOOSE_RE = /^\s*- \[[ xX]\]\s+[A-Z]+\d*-AC/;
const ID_RE = /[A-Z]+\d*-(?:AC)?\d{2,3}/g;
const TAG_RE = /@(spec|ac)\s+([A-Z0-9][A-Z0-9 ,\-]*)/g;

const errors = [];
const warnings = [];
const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return fm;
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return fm;
}

// ---------- đọc spec ----------
const areas = new Map(); // areaId -> { id, title, status, dir, specFile, accFile, reqs: Map, acs: [] }
const reqIndex = new Map(); // reqId -> { area, title, file, line }

const specFiles = SPEC_ROOTS.flatMap((r) => walk(path.join(ROOT, r))).filter((f) => /(^|\/)(spec|ui-spec)\.md$/.test(f.split(path.sep).join('/')));

for (const file of specFiles) {
  const text = fs.readFileSync(file, 'utf8');
  const fm = frontmatter(text);
  if (!fm.id) {
    warnings.push(`${rel(file)}: thiếu "id" trong frontmatter, bỏ qua`);
    continue;
  }
  const area = { id: fm.id, title: fm.title || '', status: fm.status || '', dir: path.dirname(file), specFile: file, accFile: null, reqs: new Map(), acs: [] };
  if (areas.has(fm.id)) errors.push(`Trùng id khu vực "${fm.id}": ${rel(areas.get(fm.id).specFile)} và ${rel(file)}`);
  areas.set(fm.id, area);
  text.split('\n').forEach((line, i) => {
    const m = line.match(REQ_RE);
    if (!m) return;
    const [, id, title] = m;
    if (reqIndex.has(id)) errors.push(`Trùng ID yêu cầu ${id}: ${reqIndex.get(id).file}:${reqIndex.get(id).line} và ${rel(file)}:${i + 1}`);
    if (!id.startsWith(fm.id + '-')) warnings.push(`${rel(file)}:${i + 1}: ${id} không bắt đầu bằng "${fm.id}-"`);
    const req = { id, title: title.trim(), area: fm.id, file: rel(file), line: i + 1, acs: [], code: new Set(), tests: new Set() };
    area.reqs.set(id, req);
    reqIndex.set(id, req);
  });
}

// ---------- đọc acceptance ----------
const acIndex = new Map();
for (const area of areas.values()) {
  const file = path.join(area.dir, 'acceptance.md');
  if (!fs.existsSync(file)) {
    errors.push(`${area.id}: thiếu file ${rel(file)}`);
    continue;
  }
  area.accFile = file;
  fs.readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    const m = line.match(AC_LINE_RE);
    if (!m) {
      if (AC_LOOSE_RE.test(line)) errors.push(`${rel(file)}:${i + 1}: mục acceptance sai định dạng`);
      return;
    }
    const [, mark, id, who, refs, desc] = m;
    const refIds = refs.match(ID_RE) || [];
    if (acIndex.has(id)) errors.push(`Trùng ID acceptance ${id}: ${rel(file)}:${i + 1}`);
    if (!id.startsWith(area.id + '-AC')) warnings.push(`${rel(file)}:${i + 1}: ${id} không bắt đầu bằng "${area.id}-AC"`);
    const ac = { id, done: mark.toLowerCase() === 'x', who, refs: refIds, desc: desc.trim(), area: area.id, file: rel(file), line: i + 1, tests: new Set() };
    acIndex.set(id, ac);
    area.acs.push(ac);
    if (refIds.length === 0) errors.push(`${rel(file)}:${i + 1}: ${id} không trỏ tới yêu cầu nào`);
    for (const r of refIds) {
      const req = reqIndex.get(r);
      if (!req) errors.push(`${rel(file)}:${i + 1}: ${id} trỏ tới yêu cầu không tồn tại ${r}`);
      else req.acs.push(id);
    }
  });
}

for (const req of reqIndex.values()) {
  if (req.acs.length === 0) errors.push(`${req.file}:${req.line}: ${req.id} chưa có mục acceptance nào`);
}

// ---------- đọc ghi chú trong code và test ----------
const codeFiles = CODE_ROOTS.flatMap((r) => walk(path.join(ROOT, r))).filter((f) => CODE_EXT.has(path.extname(f)));
let tagCount = 0;
for (const file of codeFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const m of text.matchAll(TAG_RE)) {
    const kind = m[1];
    const ids = m[2].match(ID_RE) || [];
    const line = text.slice(0, m.index).split('\n').length;
    for (const id of ids) {
      tagCount++;
      if (kind === 'spec') {
        const req = reqIndex.get(id);
        if (!req) errors.push(`${rel(file)}:${line}: @spec ${id} không có trong spec`);
        else req.code.add(`${rel(file)}:${line}`);
      } else {
        const ac = acIndex.get(id);
        if (!ac) errors.push(`${rel(file)}:${line}: @ac ${id} không có trong acceptance`);
        else {
          ac.tests.add(`${rel(file)}:${line}`);
          for (const r of ac.refs) reqIndex.get(r)?.tests.add(`${rel(file)}:${line}`);
        }
      }
    }
  }
}
const autoMissing = [...acIndex.values()].filter((ac) => ac.who === 'auto' && ac.tests.size === 0);

// ---------- đọc sơ đồ điều hướng ----------
const DIAGRAM_FILES = ['docs/new/navigation.md'];
const EDGE_RE = /^\s*(\w+)(?:\s*(?:\(\[|\[|\{|\()[^]*?(?:\]\)|\]|\}|\)))?\s*(<-->|-->|-\.->|==>)\s*(?:\|"?([^|]*?)"?\|)?\s*(\w+)/;
const DEF_RE = /(\w+)\s*(?:\(\[|\[|\{|\()"([^"]*)"/g;
const SUB_RE = /^\s*subgraph\s+(\w+)\s*\["([^"]*)"\]/;
const navRows = [];
let navEdges = 0;
const clean = (t) => (t || '').replace(/<br\/?>/g, ' ').replace(/\s+/g, ' ').trim();
for (const relFile of DIAGRAM_FILES) {
  const file = path.join(ROOT, relFile);
  if (!fs.existsSync(file)) continue;
  const all = fs.readFileSync(file, 'utf8').split('\n');
  let section = '';
  for (let i = 0; i < all.length; i++) {
    if (/^#{2,4}\s/.test(all[i])) section = all[i].replace(/^#+\s*/, '');
    if (all[i].trim() !== '```mermaid') continue;
    let j = i + 1;
    while (j < all.length && all[j].trim() !== '```') j++;
    const block = all.slice(i + 1, j);
    const labels = new Map();
    for (const ln of block) {
      const sm = ln.match(SUB_RE);
      if (sm) labels.set(sm[1], clean(sm[2]));
      for (const m of ln.matchAll(DEF_RE)) if (!labels.has(m[1]) || !sm) labels.set(m[1], clean(m[2]));
    }
    const consumed = new Set();
    block.forEach((ln, k) => {
      const lineNo = i + 2 + k;
      if (consumed.has(k)) return;
      const tagLine = ln.trim().startsWith('%%') ? ln : null;
      const em = tagLine ? null : ln.match(EDGE_RE);
      if (em) {
        navEdges++;
        let n = k + 1;
        while (n < block.length && block[n].trim() === '') n++;
        const next = (block[n] || '').trim();
        if (next.startsWith('%%')) consumed.add(n);
        const edge = `${labels.get(em[1]) || em[1]} → ${labels.get(em[4]) || em[4]}`;
        const via = clean(em[3]);
        if (/^%%\s*@none\b/.test(next)) {
          navRows.push({ section, edge, via, ids: [], none: next.replace(/^%%\s*@none\s*/, ''), loc: `${relFile}:${lineNo}` });
        } else if (/^%%\s*@spec\b/.test(next)) {
          const ids = next.match(ID_RE) || [];
          navRows.push({ section, edge, via, ids, loc: `${relFile}:${lineNo}` });
          for (const id of ids) {
            const req = reqIndex.get(id);
            if (!req) errors.push(`${relFile}:${lineNo + (n - k)}: sơ đồ trỏ tới yêu cầu không tồn tại ${id}`);
            else (req.diagrams ??= new Set()).add(`${relFile}:${lineNo}`);
          }
        } else {
          errors.push(`${relFile}:${lineNo}: mũi tên "${edge}" chưa gắn %% @spec hoặc %% @none`);
        }
      } else if (tagLine && /@spec\b/.test(tagLine)) {
        for (const id of tagLine.match(ID_RE) || []) {
          const req = reqIndex.get(id);
          if (!req) errors.push(`${relFile}:${lineNo}: sơ đồ trỏ tới yêu cầu không tồn tại ${id}`);
          else (req.diagrams ??= new Set()).add(`${relFile}:${lineNo}`);
        }
      }
    });
    i = j;
  }
}

// ---------- kiểm tra mã yêu cầu nhắc tới trong tài liệu bản mới ----------
const areaIds = new Set(areas.keys());
for (const file of walk(path.join(ROOT, 'docs/new')).filter((f) => f.endsWith('.md'))) {
  fs.readFileSync(file, 'utf8').split('\n').forEach((ln, k) => {
    if (ln.trim().startsWith('%%')) return;
    for (const m of ln.matchAll(/\b([A-Z]+\d*)-(AC)?(\d{2,3})\b/g)) {
      if (!areaIds.has(m[1])) continue;
      if (!reqIndex.has(m[0]) && !acIndex.has(m[0])) errors.push(`${rel(file)}:${k + 1}: nhắc tới ${m[0]} nhưng không có trong spec hay acceptance`);
    }
  });
}

// ---------- xuất báo cáo ----------
const sortedAreas = [...areas.values()].sort((a, b) => order(a.id) - order(b.id) || a.id.localeCompare(b.id));
function order(id) {
  const o = ['G', 'APP', 'FND', 'DATA'];
  if (o.includes(id)) return o.indexOf(id);
  if (/^C\d/.test(id)) return 10 + Number(id.slice(1));
  return 100;
}
const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
const cell = (s) => (s && s.length ? s : '-');
const linkFile = (f) => `[${f}](../../${f})`;

function writeTrace() {
  const lines = [
    '# Ma trận truy vết spec, code và acceptance',
    '',
    `File sinh tự động bởi \`node scripts/spec.mjs trace\` lúc ${stamp} UTC. Không sửa tay.`,
    '',
    `Tổng: ${reqIndex.size} yêu cầu, ${acIndex.size} mục acceptance, ${tagCount} ghi chú @spec/@ac trong code.`,
    '',
  ];
  const noCode = [...reqIndex.values()].filter((r) => r.code.size === 0).length;
  lines.push(`Yêu cầu chưa có code gắn @spec: ${noCode}/${reqIndex.size}.`, '');
  for (const a of sortedAreas) {
    lines.push(`## ${a.id} ${a.title}`, '', `Spec: ${linkFile(rel(a.specFile))}${a.accFile ? ` · Acceptance: ${linkFile(rel(a.accFile))}` : ''}`, '');
    lines.push('| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |', '|---|---|---|---|---|---|');
    for (const r of a.reqs.values()) {
      lines.push(`| ${r.id} | ${r.title} | ${cell(r.acs.join(', '))} | ${cell([...(r.diagrams || [])].join('<br>'))} | ${cell([...r.code].join('<br>'))} | ${cell([...r.tests].join('<br>'))} |`);
    }
    lines.push('');
  }
  if (errors.length || warnings.length) {
    lines.push('## Vấn đề', '');
    errors.forEach((e) => lines.push(`- Lỗi: ${e}`));
    warnings.forEach((w) => lines.push(`- Cảnh báo: ${w}`));
    lines.push('');
  }
  if (autoMissing.length) {
    lines.push(`## Mục [auto] chưa có test gắn @ac (${autoMissing.length})`, '');
    lines.push(autoMissing.map((ac) => ac.id).join(', '), '');
  }
  fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
  fs.writeFileSync(path.join(ROOT, OUT_DIR, 'traceability.md'), lines.join('\n'));
}

function writeNavTrace() {
  const dirOf = (id) => {
    const r = reqIndex.get(id);
    return r ? path.dirname(r.file) + '/' : '';
  };
  const lines = [
    '# Ánh xạ sơ đồ điều hướng sang spec',
    '',
    `File sinh tự động bởi \`node scripts/spec.mjs trace\` lúc ${stamp} UTC từ các dòng \`%% @spec\` trong ${DIAGRAM_FILES.join(', ')}. Không sửa tay.`,
    '',
    `Tổng: ${navEdges} mũi tên; ${navRows.filter((r) => r.ids.length).length} gắn yêu cầu, ${navRows.filter((r) => r.none !== undefined).length} ngoài phạm vi.`,
    '',
  ];
  let sec = null;
  for (const r of navRows) {
    if (r.section !== sec) {
      sec = r.section;
      lines.push(`## ${sec}`, '', '| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |', '|---|---|---|---|---|');
    }
    const ev = r.ids.length
      ? r.ids.map((id) => `${id} ${reqIndex.get(id)?.title || '(không tồn tại)'} ([${reqIndex.get(id)?.file}:${reqIndex.get(id)?.line}](../../${reqIndex.get(id)?.file}))`).join('<br>')
      : `Ngoài phạm vi: ${r.none}`;
    const dirs = [...new Set(r.ids.map(dirOf))].filter(Boolean).map((d) => `\`${d}\``).join('<br>') || '-';
    lines.push(`| ${r.edge} | ${r.via || '-'} | ${ev} | ${dirs} | ${r.loc} |`);
    const nextRow = navRows[navRows.indexOf(r) + 1];
    if (!nextRow || nextRow.section !== sec) lines.push('');
  }
  fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
  fs.writeFileSync(path.join(ROOT, OUT_DIR, 'navigation-trace.md'), lines.join('\n'));
}

function writeAcceptance() {
  const roles = ['auto', 'claude', 'human'];
  const lines = [
    '# Báo cáo acceptance',
    '',
    `File sinh tự động bởi \`node scripts/spec.mjs acceptance\` lúc ${stamp} UTC. Không sửa tay.`,
    '',
    'Một khu vực **Đạt** khi mọi mục trong acceptance.md của nó đã được đánh dấu [x].',
    '',
    '| Khu vực | Tên | Đã đạt | auto | claude | human | Trạng thái |',
    '|---|---|---|---|---|---|---|',
  ];
  let total = 0, done = 0;
  for (const a of sortedAreas) {
    const n = a.acs.length, d = a.acs.filter((x) => x.done).length;
    total += n; done += d;
    const by = roles.map((r) => {
      const all = a.acs.filter((x) => x.who === r);
      return all.length ? `${all.filter((x) => x.done).length}/${all.length}` : '-';
    });
    lines.push(`| ${a.id} | ${a.title} | ${d}/${n} | ${by.join(' | ')} | ${n > 0 && d === n ? 'Đạt' : 'Chưa'} |`);
  }
  lines.push('', `Tổng: ${done}/${total} mục đã đạt.`, '', '## Mục còn mở', '');
  for (const a of sortedAreas) {
    const open = a.acs.filter((x) => !x.done);
    if (!open.length) continue;
    lines.push(`### ${a.id} ${a.title}`, '');
    open.forEach((x) => lines.push(`- ${x.id} [${x.who}] (${x.refs.join(', ')}): ${x.desc}`));
    lines.push('');
  }
  fs.mkdirSync(path.join(ROOT, OUT_DIR), { recursive: true });
  fs.writeFileSync(path.join(ROOT, OUT_DIR, 'acceptance-report.md'), lines.join('\n'));
  return { total, done };
}

const cmd = process.argv[2] || 'check';
if (!['trace', 'acceptance', 'check'].includes(cmd)) {
  console.error('Dùng: node scripts/spec.mjs trace|acceptance|check');
  process.exit(2);
}
if (cmd === 'trace' || cmd === 'check') {
  writeTrace();
  writeNavTrace();
}
let acc;
if (cmd === 'acceptance' || cmd === 'check') acc = writeAcceptance();

console.log(`${areas.size} khu vực, ${reqIndex.size} yêu cầu, ${acIndex.size} mục acceptance, ${tagCount} ghi chú trong code, ${navEdges} mũi tên trong sơ đồ.`);
if (acc) console.log(`Acceptance: ${acc.done}/${acc.total} mục đã đạt.`);
if (autoMissing.length) console.log(`Cảnh báo: ${autoMissing.length} mục [auto] chưa có test gắn @ac (danh sách trong docs/generated/traceability.md).`);
warnings.forEach((w) => console.log('Cảnh báo: ' + w));
errors.forEach((e) => console.log('Lỗi: ' + e));
if (cmd === 'check' && errors.length) process.exit(1);
