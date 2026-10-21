// @spec FND-02, T3-04
// Màu Badge trạng thái lấy từ token chung; view không tự đặt bg-* / text-* cho trạng thái.
export type StatusTone = 'success' | 'warning' | 'danger' | 'deactivated' | 'info' | 'progress' | 'contract' | 'neutral';

const CLASS: Record<StatusTone, string> = {
  success: 'bg-success/12 text-success border-success/30',
  warning: 'bg-warning-soft text-warning border-warning/30',
  danger: 'bg-danger-soft text-danger border-danger/30',
  deactivated: 'bg-muted text-muted-foreground border-border',
  info: 'bg-info-soft text-info border-info/30',
  progress: 'bg-info-soft text-info border-info/30',
  contract: 'bg-sidebar-accent text-foreground border-border',
  neutral: 'bg-neutral-soft text-muted-foreground border-border',
};

export function statusBadgeClass(tone: StatusTone): string {
  return CLASS[tone] ?? CLASS.neutral;
}
