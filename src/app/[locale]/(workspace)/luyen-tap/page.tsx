import { makeMetadata, makePage } from '@/lib/page';
import { LuyenTapView } from '@/views/luyen-tap';

export const generateMetadata = makeMetadata('luyenTap', '/luyen-tap', false);
export default makePage(LuyenTapView);
