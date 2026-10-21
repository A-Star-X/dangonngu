// @spec DATA-05
// Địa chỉ bộ dữ liệu câu tĩnh. Mặc định /data (thư mục public/data); đổi bằng NEXT_PUBLIC_DATA_BASE_URL.
import { checkFile } from '@/domain/source';
import type { PackId } from './type';

export const DATA_BASE_URL = (process.env.NEXT_PUBLIC_DATA_BASE_URL || '/data').replace(/\/$/, '');

export const contentFileUrl = (pack: PackId, file: string) => `${DATA_BASE_URL}/${pack}/${checkFile(file)}`;
