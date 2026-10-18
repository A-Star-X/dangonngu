// @spec C2-01, C2-02, C2-03
import './strip.css';

export type CellState = 'chua' | 'dang' | 'nho' | 'can-on';

const LABEL: Record<CellState, string> = { chua: 'chưa học', dang: 'đang học', nho: 'đã nhớ', 'can-on': 'cần ôn' };

export function Strip({ cells, className }: { cells: CellState[]; className?: string }) {
  const shown = cells.slice(0, 8);
  const learned = shown.filter((c) => c === 'nho' || c === 'can-on').length;
  return (
    <ol className={`strip ${className ?? ''}`} aria-label={`Tiến độ nhóm câu: đã học ${learned} trên ${shown.length} câu`}>
      {shown.map((c, i) => (
        <li key={i} className={`strip__cell strip__cell--${c}`} aria-label={`Câu ${i + 1}, ${LABEL[c]}`} />
      ))}
    </ol>
  );
}
