import { makeMetadata, makePage } from '@/lib/page';
import { KiemTraView } from '@/views/kiem-tra';

export const generateMetadata = makeMetadata('kiemTra', '/kiem-tra', false);
export default makePage(KiemTraView);
