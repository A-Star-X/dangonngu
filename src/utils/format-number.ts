// Số đếm theo ngôn ngữ giao diện: 4.096 (vi), 4,096 (en).
export function formatCount(n: number, locale = 'vi'): string {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'vi-VN').format(n);
}
