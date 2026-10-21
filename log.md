# Nhật ký thay đổi

Mới nhất ở trên. Mỗi mục: `## [YYYY-MM-DD] loại | mô tả`. Chi tiết từng đợt: `docs/theo-doi/`.

## [2026-10-21] fix | Đợt 6: sửa 9 lỗi từ rà soát code độc lập (chuyển hướng `?tiep=` ra ngoài, đồng bộ chồng nhau, đăng xuất làm rơi phần chưa gửi, Back sau khi Dừng, service worker, menu trượt, cài đặt từ tài khoản, mật khẩu chế độ thử) và các lỗi giao diện từ rà soát ảnh bằng chứng; mã phiên có phần ngẫu nhiên

## [2026-10-21] docs | Đợt 6: README, CLAUDE.md, QUY-TRINH, chỉ mục spec theo cấu trúc mới; kịch bản thử thật thêm buổi Supabase và Landing; báo cáo `docs/theo-doi/bao-cao-dot6.md`

## [2026-10-21] test | Đợt 6: chuyển test Vitest và Playwright sang bản Next.js; thêm test cho đăng nhập, đăng ký, đồng bộ, đổi ngôn ngữ giao diện, chặn rời phiên, Landing, SEO

## [2026-10-21] feat | Đợt 6: Landing, Đăng nhập, Đăng ký (Supabase, có chế độ thử trên máy khi chưa có khóa), khu học cần đăng nhập, đồng bộ cài đặt và tiến độ theo tài khoản

## [2026-10-21] feat | Đợt 6: giao diện tiếng Việt và tiếng Anh (next-intl), nút đổi ngôn ngữ ở header và trang Cài đặt

## [2026-10-21] refactor | Đợt 6: chuyển từ Vite sang Next.js App Router theo bộ quy tắc leader (cấu trúc `src/app`, `src/views`, `src/components`, `src/services`; Tailwind 4, react-query, react-hook-form và zod, react-toastify, lucide-react); URL không còn `#`, đường dẫn cũ tự chuyển

## [2026-10-21] chore | Đợt 6: CI thêm lint, kiểm kiểu, kiểm câu chữ hai ngôn ngữ; bỏ workflow GitHub Pages, triển khai bằng Vercel; thêm `supabase/migrations/0001_init.sql`, `.env.example`

## [2026-10-21] spec | Đợt 6: thêm khu vực C8 Ô chọn, AU Tài khoản, LP Landing; C5 thành khung khu học (thanh bên); cập nhật APP, FND, DATA, S8 và route các trang; QD-01, QD-02 sửa, QD-06, QD-07 chốt, thêm QD-09, QD-10

## [2026-10-20] feat | Đợt 5: chữ và khoảng cách, Thư viện theo Unit và màn Chi tiết Unit, trang Học nối tới Unit, Kiểm tra nhanh tạm dừng và làm tiếp, trạng thái màn trong URL, bố cục từ 1200 px (`docs/theo-doi/bao-cao-dot5.md`)

## [2026-10-18] fix | Đợt 4: sửa theo phản hồi người dùng (câu sai màu đỏ, đổi "Tiến bộ" thành "Tiến độ", giọng mặc định ưu tiên Google) và các lỗi tìm thấy khi rà soát code

## [2026-10-10] feat | Đợt 2 và 3: T2 Luyện tập, S5 Kiểm tra nhanh, T3 Thư viện, T4 Tiến độ, S8 Cài đặt; service worker; sửa theo các câu hỏi đã chốt

## [2026-10-08] feat | Đợt 1: khung app, S1 Chọn ngôn ngữ, T1 Học, S3 Phiên học, S9 Hướng dẫn lần đầu
