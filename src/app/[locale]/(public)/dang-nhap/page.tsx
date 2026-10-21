import { makeMetadata, makePage } from '@/lib/page';
import { DangNhapView } from '@/views/dang-nhap';

// Trang đăng nhập không cho index (rule SEO).
export const generateMetadata = makeMetadata('login', '/dang-nhap', false);
export default makePage(DangNhapView);
