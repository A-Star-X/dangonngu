// @spec APP-15
// Tên ngôn ngữ đang học theo ngôn ngữ giao diện. Giao diện tiếng Việt dùng tên trong dữ liệu ("Tiếng Nhật");
// giao diện tiếng Anh dùng tên của trình duyệt (Intl.DisplayNames), không có thì dùng tên trong dữ liệu.
import type { CatalogLanguage } from '@/domain';

const cache = new Map<string, string>();

export function languageName(lang: Pick<CatalogLanguage, 'id' | 'name'>, uiLocale: string): string {
  if (uiLocale === 'vi') return lang.name;
  const key = `${uiLocale}:${lang.id}`;
  const hit = cache.get(key);
  if (hit) return hit;
  let name = lang.name;
  try {
    const dn = new Intl.DisplayNames([uiLocale], { type: 'language' });
    const v = dn.of(lang.id);
    if (v && v !== lang.id) name = v.charAt(0).toLocaleUpperCase(uiLocale) + v.slice(1);
  } catch {
    // Trình duyệt cũ không có Intl.DisplayNames.
  }
  cache.set(key, name);
  return name;
}

/** "Tiếng Nhật" → "tiếng Nhật" khi đứng giữa câu tiếng Việt; tên tiếng Anh giữ nguyên chữ hoa. */
export function inSentence(name: string, uiLocale: string): string {
  if (uiLocale !== 'vi' || !name) return name;
  return name.charAt(0).toLocaleLowerCase('vi') + name.slice(1);
}
