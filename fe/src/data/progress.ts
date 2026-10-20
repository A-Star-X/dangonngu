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
}

export type ThemeChoice = 'system' | 'light' | 'dark';

export interface Settings {
  schema: 1;
  lang?: string;
  packByLang: Record<string, PackId>;
  theme: ThemeChoice;
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
  theme: 'system',
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
  return { schema: 1, sessions: v.sessions.filter(validSession), attempts: v.attempts.filter(validAttempt), items };
}

export function loadSettings(store: SafeStorage): Settings {
  const raw = store.getJSON<Partial<Settings>>(SETTINGS_KEY);
  const base = defaultSettings();
  if (!isObj(raw)) return base;
  return {
    ...base,
    ...raw,
    schema: 1,
    packByLang: isObj(raw.packByLang) ? (raw.packByLang as Record<string, PackId>) : {},
    voiceByLang: isObj(raw.voiceByLang) ? (raw.voiceByLang as Record<string, string>) : {},
    theme: raw.theme === 'light' || raw.theme === 'dark' ? raw.theme : 'system',
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
export const newSessionId = (now: number) => `s${now.toString(36)}${(counter++).toString(36)}`;
