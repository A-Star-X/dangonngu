'use client';
// @spec APP-01, APP-02, APP-06, APP-12, C5-01, C5-02, C5-03, C5-04, AU-05, AU-06, AU-08, C5-08
// Khung khu học (rule giao diện "Layout workspace"): header cố định 56 px, thanh bên cố định 240 px từ md,
// dưới md thanh bên là menu trượt có lớp phủ. Nội dung rộng tối đa 1024 px, px 16, py 24, các khối cách 16 px.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BookOpen, ChartLine, ChevronDown, Library, LogOut, Menu, Settings, Target, X, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { dueItemIds, packInfo } from '@/domain';
import { ValueLoading } from '@/components/status/value-loading';
import { AppLink } from '@/components/ui/app-link';
import { useLanguageName } from '@/hooks/use-language-name';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useRoute } from '@/hooks/use-route';
import { href, navOf, type RouteName } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { statusBadgeClass } from '@/utils/status-badge-colors';
import { useAuth } from '@/providers/auth-provider';
import { useLearning } from '@/providers/learning-provider';
import { Brand } from './brand';
import { HomeLink } from './home-link';
import { PartnerLogos } from './partner-logos';
import { languageButtonClass, useLanguageSheet } from './language-sheet';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';

const LEARN: { route: RouteName; key: string; Icon: LucideIcon }[] = [
  { route: 'hoc', key: 'hoc', Icon: BookOpen },
  { route: 'luyen-tap', key: 'luyenTap', Icon: Target },
  { route: 'thu-vien', key: 'thuVien', Icon: Library },
  { route: 'tien-do', key: 'tienDo', Icon: ChartLine },
];

const itemClass = (active: boolean) =>
  cn(
    'flex min-h-10 w-full items-center gap-3 rounded-dropdown px-3 py-2 text-sm',
    active ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
  );

function NavGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</p>
      <ul className="flex flex-col gap-0.5">{children}</ul>
    </div>
  );
}

function Sidebar({ open, onClose, desktop }: { open: boolean; onClose: () => void; desktop: boolean }) {
  const t = useTranslations('shell');
  const tl = useTranslations('language');
  const route = useRoute();
  const current = navOf(route.name);
  const { language, pack, data, progress, deps, catalog, settings } = useLearning();
  // Danh mục đang tải mà đã chọn ngôn ngữ từ trước: giữ chỗ cho tên ngôn ngữ và nhóm Học tập (APP-08), không báo "Chọn ngôn ngữ".
  const pending = catalog.status === 'loading' && Boolean(settings.lang);
  const { user, mode, signOut } = useAuth();
  const name = useLanguageName();
  const openLanguageSheet = useLanguageSheet();
  const ready = data?.status === 'ready';
  const reviewCount = ready ? dueItemIds(progress, deps.now(), (id) => data.value.byId.has(id)).length : 0;
  const hidden = !desktop && !open;

  return (
    <aside
      id="app-sidebar"
      className={cn(
        'fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-200 md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full',
      )}
      aria-label={t('sidebar')}
      inert={hidden || undefined}
      data-open={open || undefined}
    >
      <div className="flex h-14 flex-none items-center justify-between gap-2 px-4">
        <AppLink href={href('hoc')} className="inline-flex min-h-10 items-center rounded-dropdown" onClick={onClose} aria-label={t('home')}>
          <Brand />
        </AppLink>
        <button type="button" className="inline-flex size-11 items-center justify-center rounded-dropdown hover:bg-muted md:hidden" onClick={onClose} aria-label={t('closeMenu')}>
          <X className="size-5" aria-hidden />
        </button>
      </div>
      <nav className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3" aria-label={t('navLabel')} data-guide="nav">
        <div className="px-1 pt-1">
          <p className="px-2 pb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{t('learning')}</p>
          <button
            type="button"
            className={languageButtonClass()}
            onClick={() => {
              onClose();
              openLanguageSheet();
            }}
            aria-haspopup="dialog"
            data-testid="language-button"
          >
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-semibold">{language ? name(language) : pending ? <ValueLoading /> : tl('choose')}</span>
              {language && language.packs.length > 1 && pack && <span className="truncate text-xs text-muted-foreground">{packInfo(pack).name}</span>}
            </span>
            <ChevronDown className="size-4 flex-none text-muted-foreground" aria-hidden />
          </button>
        </div>
        {(language || pending) && (
          <NavGroup label={t('groupLearn')}>
            {LEARN.map(({ route: r, key, Icon }) => {
              const active = current === r;
              const count = r === 'luyen-tap' && reviewCount > 0 ? reviewCount : 0;
              return (
                <li key={r}>
                  <AppLink
                    href={href(r)}
                    className={itemClass(active)}
                    aria-current={active ? 'page' : undefined}
                    onClick={onClose}
                    data-nav={r}
                  >
                    <Icon className="size-4 flex-none" aria-hidden />
                    {/* Tên đọc lấy từ nội dung (không dùng aria-label) để khớp chữ đang hiện (WCAG 2.5.3); phần đọc thêm nằm
                        trong cùng span với tên mục để trình đọc màn hình đọc liền "Luyện tập, 12 câu cần ôn". */}
                    <span className="flex-1">
                      {t(`nav.${key}`)}
                      {count > 0 && <span className="sr-only">, {t('reviewBadge', { count })}</span>}
                    </span>
                    {count > 0 && (
                      <span className={cn('num min-w-6 rounded-full border px-1.5 text-center text-xs leading-5 font-semibold', statusBadgeClass('warning'))} aria-hidden="true">
                        {count}
                      </span>
                    )}
                  </AppLink>
                </li>
              );
            })}
          </NavGroup>
        )}
        <NavGroup label={t('groupAccount')}>
          <li>
            <AppLink href={href('cai-dat')} className={itemClass(current === 'cai-dat')} aria-current={current === 'cai-dat' ? 'page' : undefined} onClick={onClose} data-nav="cai-dat">
              <Settings className="size-4 flex-none" aria-hidden />
              <span className="flex-1">{t('nav.caiDat')}</span>
            </AppLink>
          </li>
          {/* AU-08: bản dùng thử không có tài khoản nên không có Đăng xuất. */}
          {mode !== 'demo' && (
            <li>
              <button type="button" className={itemClass(false)} onClick={() => void signOut()} data-testid="sign-out">
                <LogOut className="size-4 flex-none" aria-hidden />
                <span className="flex-1 text-left">{t('signOut')}</span>
              </button>
            </li>
          )}
        </NavGroup>
      </nav>
      <div className="flex flex-none flex-col gap-1 border-t border-sidebar-border px-3 py-3">
        <HomeLink onClick={onClose} />
        {/* C5-08: logo đơn vị đồng hành ngay dưới "Trang chủ", thẳng lề với dòng đó; cùng chỗ ở thanh bên và menu trượt. */}
        <PartnerLogos size="sm" className="px-3 pb-1" />
        {user && mode !== 'demo' && (
          <p className="truncate px-3 text-xs text-muted-foreground" title={user.email} data-testid="user-email">
            {user.email}
          </p>
        )}
        {mode === 'local' && (
          <p className="px-3 text-xs text-muted-foreground" data-testid="local-mode">
            {t('localMode')}
          </p>
        )}
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const t = useTranslations('shell');
  const desktop = useMediaQuery('(min-width: 768px)');
  const route = useRoute();
  // Menu trượt mở cho đúng màn đang xem: đổi màn hay chuyển sang màn rộng thì tự đóng.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = !desktop && openOn === route.raw;
  const setOpen = (v: boolean) => setOpenOn(v ? route.raw : null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const sidebar = document.getElementById('app-sidebar');
    sidebar?.querySelector<HTMLElement>('a, button')?.focus();
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenOn(null);
        // Chờ header hết `inert` (sau lần vẽ đóng menu) rồi mới trả focus về nút menu.
        window.setTimeout(() => menuBtn.current?.focus(), 0);
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [open]);

  return (
    <div className="min-h-screen bg-background">
      {/* Menu trượt đang mở: header và nội dung phía sau không nhận focus hay chạm (C5-02). */}
      <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:left-60" inert={open || undefined}>
        <div className="flex min-w-0 items-center gap-2">
          <button
            ref={menuBtn}
            type="button"
            className="-ml-2 inline-flex size-11 items-center justify-center rounded-dropdown hover:bg-muted md:hidden"
            onClick={() => setOpen(true)}
            aria-label={t('openMenu')}
            aria-expanded={open}
            aria-controls="app-sidebar"
            data-guide="nav"
            data-testid="menu-button"
          >
            <Menu className="size-5" aria-hidden />
          </button>
          {/* Logo chữ thẳng hàng giữa trong hàng 56 px; vùng chạm cao 40 px (FND-14). */}
          <AppLink href={href('hoc')} className="flex min-h-10 items-center rounded-dropdown md:hidden" aria-label={t('home')}>
            <Brand />
          </AppLink>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <ThemeToggle />
        </div>
      </header>
      {open && !desktop && <div className="fixed inset-0 z-40 bg-scrim md:hidden" onClick={() => setOpen(false)} aria-hidden="true" data-testid="menu-overlay" />}
      <Sidebar open={open} onClose={() => setOpen(false)} desktop={desktop} />
      <main id="main" className="pt-14 md:pl-60" inert={open || undefined}>
        <div className="mx-auto flex w-full max-w-[1024px] min-w-0 flex-col gap-4 px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
