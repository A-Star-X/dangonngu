// @spec C5-01, C5-02, C5-03, C5-04, APP-01
import { BookOpen, Books, ChartLineUp, Target } from '@phosphor-icons/react';
import { href, type RouteName } from '../../app/router';
import './tabbar.css';

const TABS: { route: RouteName; label: string; Icon: typeof BookOpen }[] = [
  { route: 'hoc', label: 'Học', Icon: BookOpen },
  { route: 'luyen-tap', label: 'Luyện tập', Icon: Target },
  { route: 'thu-vien', label: 'Thư viện', Icon: Books },
  { route: 'tien-bo', label: 'Tiến độ', Icon: ChartLineUp },
];

export function TabBar({ current, reviewCount, brand }: { current: RouteName | null; reviewCount: number; brand?: boolean }) {
  return (
    <nav className="tabbar" aria-label="Điều hướng chính" data-guide="tabbar">
      {brand && <p className="tabbar__brand t-lg">VITASR</p>}
      <ul className="tabbar__list">
        {TABS.map(({ route, label, Icon }) => {
          const active = current === route;
          const count = route === 'luyen-tap' && reviewCount > 0 ? reviewCount : 0;
          return (
            <li key={route} className="tabbar__item">
              <a
                href={href(route)}
                className={`tabbar__link ${active ? 'is-active' : ''}`}
                aria-current={active ? 'page' : undefined}
                aria-label={count ? `${label}, ${count} câu cần ôn` : undefined}
              >
                <span className="tabbar__icon">
                  <Icon size={24} weight="regular" aria-hidden />
                  {count > 0 && (
                    <span className="tabbar__badge t-sm num" aria-hidden="true">
                      {count}
                    </span>
                  )}
                </span>
                <span className="tabbar__label">{label}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
