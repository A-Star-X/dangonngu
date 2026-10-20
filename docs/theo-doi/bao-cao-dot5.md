# Báo cáo Đợt 5 (20/10/2026)

**Kết quả:** 9/12 việc đã xong. Chưa làm 3 việc: 4 (Landing), 5 (Đăng nhập, Đăng ký) và 9 (AI). Code đang nằm ở 5 nhánh trên máy, **chưa push, chưa mở PR**. Riêng tài liệu bước 0 và việc 11 đã có PR #13.

## 12 việc

| # | Việc | Trạng thái | Đã làm |
|---|---|---|---|
| 1 | Trang Học | Xong | Tên unit trên thẻ bấm được; thêm khối "Unit tiếp theo" và "Tiến độ của bạn"; từ 1200 px chia hai cột, hết khoảng trống bên phải |
| 2 | Chữ và khoảng cách | Xong | Chữ nhỏ nhất 14 px, dòng thoáng hơn; mỗi cấp tiêu đề chỉ còn một kiểu; nhịp khoảng cách chung cho mọi màn |
| 3 | Thư viện theo Unit | Xong | Thư viện có hai cách xem Unit / Câu (mặc định Unit), mỗi unit có dải 8 ô tiến độ; màn mới **Chi tiết Unit** với nút "Học unit này" và "Kiểm tra nhanh unit này" |
| 4 | Landing Page | **Chưa làm** | Chờ chốt QD-07 và các câu hỏi cho công ty |
| 5 | Đăng nhập, Đăng ký | **Chưa làm** | Chờ chốt QD-06 và project Supabase (Đạt tạo project cá nhân để phát triển) |
| 6 | Responsive | Xong | Bỏ hai cột cố định từ 900 px; từ 1200 px các màn chia nhiều cột co giãn; đã kiểm 7 màn ở 6 khổ, từ 320 đến 1440 px |
| 7 | Rà soát UI | Xong | Báo cáo `docs/theo-doi/ra-soat-ui-dot5.md`: 12 vấn đề, chia thành giữ, sửa, thay |
| 8 | Luyện tập | Xong | Kiểm tra nhanh có **Tạm dừng / Làm tiếp** đúng bước và câu; Luyện tập hiện dòng "Đang làm dở…"; màn kết quả có khối "Câu cần xem lại" |
| 9 | AI nhận xét bài | **Chưa làm** | Để sau (QD-08): cần server giữ khóa API, chốt chi phí và tiêu chí |
| 10 | Điều hướng | Xong | Trang và cách xem của Thư viện lưu trong URL, nên F5, Back, Forward không mất chỗ; Chi tiết Unit có đường dẫn "Thư viện / Unit 12" |
| 11 | Sitemap, user flow, mô tả sản phẩm | Xong | `docs/new/san-pham.md` (PR #13) |
| 12 | Kiểm thử | Xong | Xem mục dưới |

## Kiểm thử

- `npm test` 216/216, `npm run test:e2e` 41/41, `npm run build` và `npm run spec:check` đều đạt.
- Nghiệm thu: **191/214 mục đạt**. 23 mục còn lại là `[human]`, phải thử trên thiết bị thật hoặc với người học thật (`docs/thu-that/README.md`).
- Ảnh trước và sau khi sửa: `docs/evidence/FND-AC19/so-sanh-*.png`. Ảnh các màn mới: `docs/evidence/` (T3-AC14, S10-AC08, S5-AC15, APP-AC26).

## Cần nhóm làm

1. Duyệt và gộp PR #13, sau đó tới các nhánh `feature/dot5-chu-va-khoang-cach` → `feature/dot5-thu-vien-unit` → `feature/dot5-trang-hoc` → `feature/dot5-luyen-tap` → `fix/dot5-dieu-huong` → `fix/dot5-responsive`. Các nhánh nối tiếp nhau, nên gộp theo đúng thứ tự này.
2. Hỏi công ty 5 câu ở `docs/new/ui-spec.md` mục 5. Quan trọng nhất là câu: website mới **thay thế hay chạy song song** với trang học chính (nếu song song thì người học sẽ phải có hai tài khoản).
3. Chốt QD-06, QD-07 thì mới làm được việc 4 và 5.
4. Thử 23 mục `[human]` trên iPhone, Android và máy Windows.

## Lưu ý

- Trang Luyện tập trên máy tính vẫn trống phía dưới, vì màn này chỉ có ba mục. Muốn lấp chỗ trống thì cần thêm nội dung vào spec.
- Bấm Back ngay sau khi "Dừng" phiên học sẽ quay lại phiên đó. Đây là hành vi có từ trước, Đợt 5 không đổi.
