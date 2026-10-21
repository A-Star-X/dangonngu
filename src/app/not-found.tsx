// Đường dẫn không qua được proxy ngôn ngữ (hiếm): trang 404 tối giản.
import Link from 'next/link';

export default function NotFound() {
  return (
    <html lang="vi">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 24 }}>
        <h1>404</h1>
        <p>
          <Link href="/">VITASR</Link>
        </p>
      </body>
    </html>
  );
}
