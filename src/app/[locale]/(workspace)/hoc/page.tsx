import { makeMetadata, makePage } from '@/lib/page';
import { HocView } from '@/views/hoc';

export const generateMetadata = makeMetadata('hoc', '/hoc', false);
export default makePage(HocView);
