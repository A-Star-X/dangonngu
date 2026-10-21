// @spec APP-15
// Kiểm file ngôn ngữ giao diện: vi.json và en.json có cùng khóa, cùng biến {var}; mọi khóa code dùng đều có trong file.
// Chạy: npm run messages:check (CI chạy cùng spec:check).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const load = (l) => JSON.parse(readFileSync(join(root, 'src', 'messages', `${l}.json`), 'utf8'));
const vi = load('vi');
const en = load('en');
const problems = [];

function flat(obj, prefix = '', out = new Map()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flat(v, key, out);
    else out.set(key, v);
  }
  return out;
}

/** Tên biến trong câu ICU: {name}, {count, plural, ...}; bỏ thẻ <link>. */
function vars(msg) {
  if (typeof msg !== 'string') return [];
  const names = new Set();
  for (const m of msg.matchAll(/\{\s*([a-zA-Z_][\w]*)\s*(?:,|\})/g)) names.add(m[1]);
  return [...names].sort();
}

const fv = flat(vi);
const fe = flat(en);
for (const k of fv.keys()) if (!fe.has(k)) problems.push(`en.json thiếu khóa ${k}`);
for (const k of fe.keys()) if (!fv.has(k)) problems.push(`vi.json thiếu khóa ${k} (có ở en.json)`);
for (const [k, v] of fv) {
  if (!fe.has(k)) continue;
  const a = vars(v).join(',');
  const b = vars(fe.get(k)).join(',');
  if (a !== b) problems.push(`${k}: biến khác nhau (vi: ${a || '-'}; en: ${b || '-'})`);
}

const hasPath = (obj, path) => path.split('.').reduce((o, p) => (o && typeof o === 'object' ? o[p] : undefined), obj) !== undefined;

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (/\.(tsx?|mts)$/.test(f)) out.push(p);
  }
  return out;
}

for (const file of walk(join(root, 'src'))) {
  const text = readFileSync(file, 'utf8');
  const ns = new Map();
  for (const m of text.matchAll(/const\s+(\w+)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:'([\w-]+)'|\{[^}]*namespace:\s*'([\w-]+)'[^}]*\})\s*\)/g)) ns.set(m[1], m[2] ?? m[3]);
  for (const [v, n] of ns) {
    if (!hasPath(vi, n)) problems.push(`${relative(root, file)}: namespace ${n} không có trong vi.json`);
    const re = new RegExp(`\\b${v}(?:\\.(?:rich|raw|markup|has))?\\(\\s*(?:'([^']+)'|\`([^\`]+)\`)`, 'g');
    for (const m of text.matchAll(re)) {
      if (m[1]) {
        if (!hasPath(vi, `${n}.${m[1]}`)) problems.push(`${relative(root, file)}: thiếu khóa ${n}.${m[1]}`);
      } else {
        const prefix = m[2].split('${')[0].replace(/\.$/, '');
        if (prefix && !hasPath(vi, `${n}.${prefix}`)) problems.push(`${relative(root, file)}: thiếu nhóm khóa ${n}.${prefix}`);
      }
    }
  }
}

if (problems.length) {
  console.error(`Lỗi file ngôn ngữ (${problems.length}):\n- ${problems.join('\n- ')}`);
  process.exit(1);
}
console.log(`messages: ${fv.size} khóa, vi và en khớp nhau, mọi khóa code dùng đều có.`);
