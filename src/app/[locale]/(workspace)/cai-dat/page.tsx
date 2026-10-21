import { makeMetadata, makePage } from '@/lib/page';
import { CaiDatView } from '@/views/cai-dat';

export const generateMetadata = makeMetadata('caiDat', '/cai-dat', false);
export default makePage(CaiDatView);
