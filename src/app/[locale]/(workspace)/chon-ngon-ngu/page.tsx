import { makeMetadata, makePage } from '@/lib/page';
import { ChonNgonNguView } from '@/views/chon-ngon-ngu';

export const generateMetadata = makeMetadata('chonNgonNgu', '/chon-ngon-ngu', false);
export default makePage(ChonNgonNguView);
