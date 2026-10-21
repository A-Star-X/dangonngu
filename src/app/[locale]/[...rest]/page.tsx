// @spec APP-04
// Đường dẫn không có trong bảng route: về trang Học (chưa đăng nhập thì cổng khu học chuyển sang Đăng nhập).
import { redirect } from '@/i18n/navigation';

export default async function Unknown({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  redirect({ href: '/hoc', locale });
}
