// @spec APP-08
import { Button } from '../components/C3-nut/Button';

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="load-error" role="alert">
      <p className="t-body">Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.</p>
      <Button variant="secondary" onClick={onRetry}>
        Thử lại
      </Button>
    </div>
  );
}

/** Khung xương đúng hình khối sẽ hiện (thẻ câu hoặc danh sách). Không dùng vòng xoay giữa màn. */
export function Skeleton({ shape, rows = 6 }: { shape: 'card' | 'list'; rows?: number }) {
  if (shape === 'card') {
    return (
      <div className="skeleton skeleton--card" aria-busy="true" aria-label="Đang tải">
        <span className="skeleton__bar" style={{ width: '40%' }} />
        <span className="skeleton__bar skeleton__bar--lg" style={{ width: '85%' }} />
        <span className="skeleton__bar skeleton__bar--xl" style={{ width: '70%' }} />
        <span className="skeleton__bar" style={{ width: '30%' }} />
      </div>
    );
  }
  return (
    <ul className="skeleton skeleton--list" aria-busy="true" aria-label="Đang tải">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="skeleton__row" data-testid="skeleton-row">
          <span className="skeleton__bar" style={{ width: `${50 + ((i * 17) % 35)}%` }} />
          <span className="skeleton__bar skeleton__bar--sm" style={{ width: '25%' }} />
        </li>
      ))}
    </ul>
  );
}
