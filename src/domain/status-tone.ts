// @spec T3-01, T3-05, FND-02
// Trạng thái học của một câu → tone màu Badge (rule: trạng thái mới map trong helper của domain).
import type { StatusTone } from '@/utils/status-badge-colors';
import type { DisplayStatus } from './review';

export const LEARN_STATUS_TONE: Record<DisplayStatus, StatusTone> = {
  'chua-hoc': 'neutral',
  'da-nho': 'success',
  'can-on': 'warning',
};
