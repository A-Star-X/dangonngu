import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp, settingsSeed } from './helpers';

describe('khung test', () => {
  it('mở trang Học với dữ liệu fixture', async () => {
    await renderApp('/hoc', { seed: settingsSeed() });
    expect(screen.getByRole('heading', { level: 1, name: 'Học' })).toBeInTheDocument();
    expect(screen.getByTestId('sentence-card')).toBeInTheDocument();
  });
  it('chưa đăng nhập thì về trang đăng nhập', async () => {
    const { fakeAuth } = await import('./helpers');
    await renderApp('/thu-vien?xem=cau', { seed: settingsSeed(), auth: fakeAuth({ session: null }) });
    expect(window.location.pathname).toBe('/dang-nhap');
    expect(new URLSearchParams(window.location.search).get('tiep')).toBe('/thu-vien?xem=cau');
  });
});
