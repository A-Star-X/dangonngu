import { makeMetadata, makePage } from '@/lib/page';
import { TienDoView } from '@/views/tien-do';

export const generateMetadata = makeMetadata('tienDo', '/tien-do', false);
export default makePage(TienDoView);
