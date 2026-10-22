// Bản dùng thử (AU-08), môi trường build (APP-17) và logo đơn vị đồng hành ở trang công khai (C5-08): vẽ header, Landing, chân trang công khai.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import robots from '@/app/robots';
import { PublicFooter } from '@/components/layout/public-footer';
import { PublicHeader } from '@/components/layout/public-header';
import { getSupabase } from '@/lib/supabase';
import { pageMetadata } from '@/lib/seo';
import { AppProviders } from '@/providers/app-providers';
import { makeQueryClient } from '@/providers/query-provider';
import { createAuthApi, demoAuthApi } from '@/services/auth-services/api';
import { LandingView } from '@/views/landing';
import { MESSAGES, here, renderSite, settingsSeed } from './helpers';

vi.mock('next-intl/server', async () => {
  const { createTranslator } = await import('next-intl');
  const { MESSAGES: M } = await import('./helpers');
  return {
    getTranslations: async (ns?: string | { namespace?: string }) =>
      createTranslator({ locale: 'vi', messages: M.vi, namespace: (typeof ns === 'string' ? ns : ns?.namespace) as never }),
    getLocale: async () => 'vi',
  };
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const sidebar = () => document.getElementById('app-sidebar')!;

describe('AU-08 Bản dùng thử', () => {
  // @ac AU-AC10
  it('vào thẳng khu học không qua đăng nhập; /dang-nhap, /dang-ky về /hoc; không có tài khoản trên thanh bên và Cài đặt', async () => {
    const a = await renderSite('/hoc', { auth: demoAuthApi() });
    await waitFor(() => expect(here()).toBe('/chon-ngon-ngu'));
    expect(window.location.pathname).not.toBe('/dang-nhap');
    a.unmount();

    for (const url of ['/dang-nhap', '/dang-ky']) {
      const r = await renderSite(url, { auth: demoAuthApi(), seed: settingsSeed() });
      await waitFor(() => expect(here()).toBe('/hoc'));
      r.unmount();
    }

    await renderSite('/cai-dat', { auth: demoAuthApi(), seed: settingsSeed() });
    expect(within(sidebar()).queryByTestId('sign-out')).toBeNull();
    expect(within(sidebar()).queryByTestId('user-email')).toBeNull();
    expect(within(sidebar()).queryByTestId('local-mode')).toBeNull();
    expect(within(sidebar()).getByTestId('demo-mode')).toHaveTextContent('Bản dùng thử: không cần tài khoản, tiến độ chỉ lưu trên máy này.');
    expect(document.getElementById('s8-tai-khoan')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Đăng xuất' })).toBeNull();
  });

  // @ac AU-AC10
  it('bản build demo không dùng Supabase dù có cấu hình', () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://vi-du.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'khoa-thu');
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'demo');
    expect(createAuthApi().mode).toBe('demo');
    expect(getSupabase()).toBeNull();
  });

  // @ac AU-AC11
  it('Landing, header và chân trang của bản demo: lời mời trỏ /hoc, không có liên kết đăng nhập, đăng ký', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'demo');
    const landing = await LandingView();
    const footer = await PublicFooter();
    render(
      <NextIntlClientProvider locale="vi" messages={MESSAGES.vi} timeZone="Asia/Ho_Chi_Minh">
        <AppProviders queryClient={makeQueryClient()} authApi={demoAuthApi()}>
          <PublicHeader />
          {landing}
          {footer}
        </AppProviders>
      </NextIntlClientProvider>,
    );
    expect(screen.getByTestId('lp-start')).toHaveAttribute('href', '/hoc');
    expect(screen.getByTestId('lp-final')).toHaveAttribute('href', '/hoc');
    expect(screen.getByTestId('lp-final')).toHaveTextContent('Bắt đầu học');
    expect(screen.getByText('Chọn ngôn ngữ và học nhóm câu đầu tiên, không cần tài khoản.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: 'Chọn ngôn ngữ' })).toBeInTheDocument();
    expect(document.querySelector('a[href^="/dang-nhap"], a[href^="/dang-ky"]')).toBeNull();
    expect(await screen.findByRole('link', { name: 'Vào học' })).toHaveAttribute('href', '/hoc');
  });
});

describe('APP-17 Môi trường', () => {
  // @ac APP-AC31
  it('staging và demo chặn máy tìm kiếm; không đặt môi trường thì như production', () => {
    for (const env of ['staging', 'demo']) {
      vi.stubEnv('NEXT_PUBLIC_APP_ENV', env);
      expect(robots().rules).toEqual([{ userAgent: '*', disallow: '/' }]);
      expect(pageMetadata({ title: 'Trang chủ', path: '/', index: true }).robots).toEqual({ index: false, follow: false });
    }
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', '');
    const rules = robots().rules as { allow: string[]; disallow: string[] }[];
    expect(rules[0].allow).toEqual(['/', '/dang-ky']);
    expect(rules[0].disallow).toContain('/dang-nhap');
    expect(pageMetadata({ title: 'Trang chủ', path: '/', index: true }).robots).toEqual({ index: true, follow: true });
  });
});

describe('C5-08 Logo đơn vị đồng hành ở trang công khai', () => {
  // @ac C5-AC07
  it('header (từ sm) và chân trang (dưới sm) có logo đúng thứ tự, không trong liên kết', async () => {
    const footer = await PublicFooter();
    render(
      <NextIntlClientProvider locale="vi" messages={MESSAGES.vi} timeZone="Asia/Ho_Chi_Minh">
        <AppProviders queryClient={makeQueryClient()} authApi={demoAuthApi()}>
          <PublicHeader />
          {footer}
        </AppProviders>
      </NextIntlClientProvider>,
    );
    const [inHeader, inFooter] = screen.getAllByTestId('partner-logos');
    expect(inHeader.closest('header')).not.toBeNull();
    expect(inHeader).toHaveClass('hidden', 'sm:flex');
    expect(inFooter.closest('footer')).not.toBeNull();
    expect(inFooter).toHaveClass('sm:hidden');
    for (const g of [inHeader, inFooter]) {
      expect([...g.querySelectorAll('img')].map((i) => i.getAttribute('alt'))).toEqual(['Pháp Luật & Kinh tế – Quốc tế', 'A-STAR', 'A-STAR']);
      expect(g.querySelector('a img')).toBeNull();
    }
  });
});
