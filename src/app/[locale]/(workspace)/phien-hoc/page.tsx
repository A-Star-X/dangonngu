import { makeMetadata, makePage } from '@/lib/page';
import { PhienHocView } from '@/views/phien-hoc';

export const generateMetadata = makeMetadata('phienHoc', '/phien-hoc', false);
export default makePage(PhienHocView);
