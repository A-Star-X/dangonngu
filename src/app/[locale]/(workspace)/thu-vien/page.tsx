import { makeMetadata, makePage } from '@/lib/page';
import { ThuVienView } from '@/views/thu-vien';

export const generateMetadata = makeMetadata('thuVien', '/thu-vien', false);
export default makePage(ThuVienView);
