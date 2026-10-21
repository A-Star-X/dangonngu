// @spec LP-03
// Số liệu thật của bộ câu cho Landing, đọc từ public/data lúc build (không gõ tay con số).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface PackStats {
  id: 'fluency' | 'global';
  languages: number;
  /** Số câu của mỗi ngôn ngữ trong bộ. */
  items: number;
  units: number;
}

export interface ContentStats {
  languages: number;
  /** Ngôn ngữ theo thứ tự trong manifest; tên tiếng Việt lấy từ manifest. */
  list: { id: string; name: string }[];
  packs: PackStats[];
}

const dataDir = () => join(process.cwd(), 'public', 'data');

function readJson<T>(...parts: string[]): T | null {
  try {
    return JSON.parse(readFileSync(join(dataDir(), ...parts), 'utf8')) as T;
  } catch {
    return null;
  }
}

interface Manifest {
  languages: { id: string; name: string; file: string; units: string }[];
}

export function contentStats(): ContentStats {
  const ids = new Map<string, string>();
  const packs: PackStats[] = [];
  for (const id of ['fluency', 'global'] as const) {
    const m = readJson<Manifest>(id, 'manifest.json');
    if (!m || m.languages.length === 0) continue;
    m.languages.forEach((l) => ids.set(l.id, ids.get(l.id) ?? l.name));
    const first = m.languages[0];
    const items = readJson<{ itemCount?: number; items?: unknown[] }>(id, first.file);
    const units = readJson<{ units?: unknown[] }>(id, first.units);
    packs.push({ id, languages: m.languages.length, items: items?.itemCount ?? items?.items?.length ?? 0, units: units?.units?.length ?? 0 });
  }
  return { languages: ids.size, list: [...ids].map(([id, name]) => ({ id, name })), packs };
}
