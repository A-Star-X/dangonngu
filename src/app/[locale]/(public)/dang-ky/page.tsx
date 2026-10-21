import { makeMetadata, makePage } from '@/lib/page';
import { DangKyView } from '@/views/dang-ky';

export const generateMetadata = makeMetadata('register', '/dang-ky', true);
export default makePage(DangKyView);
