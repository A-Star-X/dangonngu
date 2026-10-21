// @spec DATA-06
// Cài đặt và tiến độ. Khóa có tiền tố vitasr2. để không đụng khóa của bản cũ; không đọc tiến độ bản cũ.
import type { SafeStorage } from './storage';
import type { PackId } from './types';

export type Nguon = 'lo-trinh' | 'on-tap' | 'tu-khoa' | 'cau' | 'unit' | 'kiem-tra';
export type AttemptKind = 'ghi-nho' | 'trac-nghiem' | 'nghe-chon' | 'sap-xep';
export type Outcome = 'nho' | 'can-on' | 'dung' | 'sai';
export type SessionStep = 'ghi-nho' | 'kiem-tra';

export interface Session {
  id: string;
  nguon: Nguon;
  itemIds: number[];
  startedAt: number;
  completedAt?: number;
  /** Chỉ số câu đang làm (0 .. itemIds.length). */
  position: number;
  /** Bước hiện tại của câu ở `position` (S3-08). */
  step: SessionStep;
  /** Phiên dở bị thay bằng phiên mới (S3-08). */
  abandonedAt?: number;
  /** Tham số route của phiên (q, nhom, id) để mở lại đúng. */
  params?: Record<string, string>;
  /** Câu ở `position` đã mở gợi ý (S3-05), để tải lại trang vẫn tính là dùng gợi ý. */
  hintedItemId?: number;
}

export interface Attempt {
  sessionId: string;
  itemId: number;
  at: number;
  kind: AttemptKind;
  outcome: Outcome;
  hinted: boolean;
}

export interface ItemState {
  /** da-hoc: đã qua bước ghi nhớ ít nhất một lần (DATA-11). kiem-tra: mới chỉ gặp ở bài kiểm tra. */
  status: 'da-hoc' | 'kiem-tra';
  streak: number;
  due: number;
  lastAt: number;
}

export interface Progress {
  schema: 1;
  sessions: Session[];
  attempts: Attempt[];
  items: Record<string, ItemState>;
  /**
   * DATA-14: mốc người học xóa tiến độ hoặc nhập tiến độ từ tệp (S8-05). Khi gộp với bản trên máy khác,
   * mọi thứ cũ hơn mốc này ở bản kia bị bỏ, để phần đã xóa không quay lại.
   */
  baseAt?: number;
}

/** Giao diện sáng, tối (FND-03). Lưu riêng ở khóa THEME_KEY vì áp dụng cả ở trang công khai, trước khi đăng nhập. */
export type ThemeChoice = 'system' | 'light' | 'dark';
export const THEME_KEY = 'vitasr2.theme';

export interface Settings {
  schema: 1;
  lang?: string;
  packByLang: Record<string, PackId>;
  /** Tên giọng (voiceURI) theo mã ngôn ngữ, gồm cả "vi". */
  voiceByLang: Record<string, string>;
  rate: number;
  weeklyGoal: number;
  guideSeen: boolean;
}

export const SETTINGS_KEY = 'vitasr2.settings';
export const progressKey = (pack: PackId, lang: string) => `vitasr2.progress.${pack}.${lang}`;

export const defaultSettings = (): Settings => ({
  schema: 1,
  packByLang: {},
  voiceByLang: {},
  rate: 1,
  weeklyGoal: 5,
  guideSeen: false,
});

export const emptyProgress = (): Progress => ({ schema: 1, sessions: [], attempts: [], items: {} });

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

export function isProgress(v: unknown): v is Progress {
  return isObj(v) && v.schema === 1 && Array.isArray(v.sessions) && Array.isArray(v.attempts) && isObj(v.items);
}

const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const isInt = (v: unknown): v is number => Number.isInteger(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const oneOf = (v: unknown, list: readonly string[]) => isStr(v) && list.includes(v);
const NGUON = ['lo-trinh', 'on-tap', 'tu-khoa', 'cau', 'unit', 'kiem-tra'] as const;
const KIND = ['ghi-nho', 'trac-nghiem', 'nghe-chon', 'sap-xep'] as const;
const OUTCOME = ['nho', 'can-on', 'dung', 'sai'] as const;
const STEP = ['ghi-nho', 'kiem-tra'] as const;

/** Một phiên đúng cấu trúc DATA-06: vị trí là số nguyên trong khoảng 0 đến số câu, bước hợp lệ. */
export function validSession(s: unknown): s is Session {
  return (
    isObj(s) &&
    isStr(s.id) &&
    oneOf(s.nguon, NGUON) &&
    Array.isArray(s.itemIds) &&
    s.itemIds.every(isInt) &&
    isNum(s.startedAt) &&
    (s.completedAt === undefined || isNum(s.completedAt)) &&
    (s.abandonedAt === undefined || isNum(s.abandonedAt)) &&
    isInt(s.position) &&
    s.position >= 0 &&
    s.position <= s.itemIds.length &&
    oneOf(s.step, STEP) &&
    (s.params === undefined || (isObj(s.params) && Object.values(s.params).every(isStr))) &&
    (s.hintedItemId === undefined || isInt(s.hintedItemId))
  );
}

export function validAttempt(a: unknown): a is Attempt {
  return isObj(a) && isStr(a.sessionId) && isInt(a.itemId) && isNum(a.at) && oneOf(a.kind, KIND) && oneOf(a.outcome, OUTCOME) && typeof a.hinted === 'boolean';
}

/** Trạng thái câu: streak là số nguyên không âm, due và lastAt là mốc thời gian. */
export function validItem(id: string, s: unknown): s is ItemState {
  return /^\d+$/.test(id) && isObj(s) && oneOf(s.status, ['da-hoc', 'kiem-tra']) && isInt(s.streak) && s.streak >= 0 && isNum(s.due) && isNum(s.lastAt);
}

/** Tiến độ đọc từ máy: bỏ các phần tử hỏng thay vì để một dòng lỗi làm hỏng cả app. */
export function sanitizeProgress(v: unknown): Progress | null {
  if (!isProgress(v)) return null;
  const items: Record<string, ItemState> = {};
  for (const [id, s] of Object.entries(v.items)) if (validItem(id, s)) items[id] = s;
  const out: Progress = { schema: 1, sessions: v.sessions.filter(validSession), attempts: v.attempts.filter(validAttempt), items };
  if (isNum(v.baseAt)) out.baseAt = v.baseAt;
  return out;
}

export function loadSettings(store: SafeStorage): Settings {
  return sanitizeSettings(store.getJSON<unknown>(SETTINGS_KEY));
}

const PACK_IDS: readonly string[] = ['global', 'fluency'];
const isLang = (v: unknown): v is string => typeof v === 'string' && /^[a-z]{2,3}$/.test(v);
const stringMap = (v: unknown, ok: (x: string) => boolean): Record<string, string> => {
  if (!isObj(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, x] of Object.entries(v)) if (typeof x === 'string' && ok(x)) out[k] = x;
  return out;
};

/** Cài đặt đọc từ máy hoặc từ tài khoản (DATA-06, DATA-14): giá trị sai kiểu hay ngoài phạm vi thì dùng mặc định. */
export function sanitizeSettings(input: unknown): Settings {
  const raw = input as Partial<Settings>;
  const base = defaultSettings();
  if (!isObj(raw)) return base;
  // Bản cũ lưu giao diện trong cài đặt; nay giao diện lưu ở THEME_KEY (FND-03).
  const { theme: _oldTheme, ...rest } = raw as Partial<Settings> & { theme?: unknown };
  void _oldTheme;
  return {
    ...base,
    ...rest,
    schema: 1,
    lang: isLang(raw.lang) ? raw.lang : undefined,
    packByLang: stringMap(raw.packByLang, (x) => PACK_IDS.includes(x)) as Record<string, PackId>,
    voiceByLang: stringMap(raw.voiceByLang, () => true),
    rate: raw.rate === 0.75 || raw.rate === 1.25 ? raw.rate : 1,
    weeklyGoal: typeof raw.weeklyGoal === 'number' && raw.weeklyGoal >= 1 && raw.weeklyGoal <= 21 ? Math.round(raw.weeklyGoal) : 5,
    guideSeen: raw.guideSeen === true,
  };
}

export function saveSettings(store: SafeStorage, s: Settings) {
  store.setJSON(SETTINGS_KEY, s);
}

export function loadProgress(store: SafeStorage, pack: PackId, lang: string): Progress {
  const raw = store.getJSON<unknown>(progressKey(pack, lang));
  return sanitizeProgress(raw) ?? emptyProgress();
}

export function saveProgress(store: SafeStorage, pack: PackId, lang: string, p: Progress) {
  store.setJSON(progressKey(pack, lang), p);
}

let counter = 0;
const randomPart = () => {
  const c = globalThis.crypto;
  if (typeof c?.getRandomValues === 'function') return c.getRandomValues(new Uint32Array(1))[0].toString(36).padStart(4, '0').slice(0, 5);
  return Math.random().toString(36).slice(2, 7);
};
/**
 * Mã phiên: thời điểm, số đếm trong lần mở này và phần ngẫu nhiên. Phần ngẫu nhiên tránh trùng mã giữa hai tab, hai máy
 * (hay hai lần mở trang) bắt đầu phiên cùng một mili giây; trùng mã thì khi gộp tiến độ (DATA-14) hai phiên khác nhau bị coi là một.
 */
export const newSessionId = (now: number) => `s${now.toString(36)}${(counter++).toString(36)}${randomPart()}`;
