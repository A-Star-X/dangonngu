import { makeMetadata, makePage } from '@/lib/page';
import { ChiTietUnitView } from '@/views/chi-tiet-unit';

export const generateMetadata = makeMetadata('unit', '/thu-vien/unit', false);
export default makePage(ChiTietUnitView);
