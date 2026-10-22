// @spec APP-16, APP-18
import { ImageResponse } from 'next/og';
import { OG_FONT_FAMILY, lexendFonts } from '@/lib/og-font';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default async function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', borderRadius: 16, background: '#c9301a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 44, fontWeight: 700, fontFamily: OG_FONT_FAMILY }}>Đ</div>
    ),
    { ...size, fonts: await lexendFonts() },
  );
}
