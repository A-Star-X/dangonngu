// @spec APP-16
// Ảnh chia sẻ 1200×630. Màu lấy theo bảng màu sáng ở src/styles/theme.css (ImageResponse không đọc được biến CSS).
import { ImageResponse } from 'next/og';
import { OG_FONT_FAMILY, lexendFonts } from '@/lib/og-font';

export const alt = 'VITASR: học câu giao tiếp 15 ngôn ngữ bằng nghĩa tiếng Việt';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#f4f6f9', color: '#0f1e3d', fontFamily: OG_FONT_FAMILY }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 88, height: 88, borderRadius: 22, background: '#c9301a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', fontSize: 60, fontWeight: 700 }}>V</div>
          <div style={{ fontSize: 48, fontWeight: 700, letterSpacing: 2 }}>VITASR</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.15 }}>Học câu giao tiếp 15 ngôn ngữ</div>
          <div style={{ fontSize: 36, fontWeight: 400, color: '#556079' }}>Mỗi phiên 8 câu, nghe giọng đọc, ôn đúng lúc, kiểm tra nhanh.</div>
        </div>
        <div style={{ display: 'flex', height: 12, width: 240, background: '#c9301a', borderRadius: 6 }} />
      </div>
    ),
    { ...size, fonts: await lexendFonts() },
  );
}
