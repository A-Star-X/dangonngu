# Ánh xạ sơ đồ điều hướng sang spec

File sinh tự động bởi `node scripts/spec.mjs trace` lúc 2026-10-21 10:38 UTC từ các dòng `%% @spec` trong docs/new/navigation.md. Không sửa tay.

Tổng: 117 mũi tên; 116 gắn yêu cầu, 1 ngoài phạm vi.

## 1. Sơ đồ tổng quát

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| Trang học chính (ngoài phạm vi) → Đã đăng nhập? | chọn Đa ngôn ngữ, mở trang mới | Ngoài phạm vi: trang chính ngoài phạm vi, xem docs/legacy/README.md | - | docs/new/navigation.md:20 |
| Khách mở website → Landing / | - | LP-01 Header công khai và phần mở đầu ([docs/spec/LP-landing/spec.md:15](../../docs/spec/LP-landing/spec.md)) | `docs/spec/LP-landing/` | docs/new/navigation.md:22 |
| Landing / → Đăng ký /dang-ky | Bắt đầu học, Tạo tài khoản | LP-01 Header công khai và phần mở đầu ([docs/spec/LP-landing/spec.md:15](../../docs/spec/LP-landing/spec.md))<br>LP-06 Lời mời cuối trang và chân trang ([docs/spec/LP-landing/spec.md:35](../../docs/spec/LP-landing/spec.md)) | `docs/spec/LP-landing/` | docs/new/navigation.md:24 |
| Landing / → Đăng nhập /dang-nhap | Đăng nhập | LP-01 Header công khai và phần mở đầu ([docs/spec/LP-landing/spec.md:15](../../docs/spec/LP-landing/spec.md)) | `docs/spec/LP-landing/` | docs/new/navigation.md:26 |
| Landing / → Đã đăng nhập? | Khám phá các bộ câu | LP-01 Header công khai và phần mở đầu ([docs/spec/LP-landing/spec.md:15](../../docs/spec/LP-landing/spec.md))<br>AU-05 Trang cần đăng nhập ([docs/spec/AU-tai-khoan/spec.md:31](../../docs/spec/AU-tai-khoan/spec.md)) | `docs/spec/LP-landing/`<br>`docs/spec/AU-tai-khoan/` | docs/new/navigation.md:28 |
| Đăng ký /dang-ky → Đăng nhập /dang-nhap | Đã có tài khoản / Chưa có tài khoản | AU-01 Đăng nhập ([docs/spec/AU-tai-khoan/spec.md:15](../../docs/spec/AU-tai-khoan/spec.md))<br>AU-02 Đăng ký ([docs/spec/AU-tai-khoan/spec.md:19](../../docs/spec/AU-tai-khoan/spec.md)) | `docs/spec/AU-tai-khoan/` | docs/new/navigation.md:30 |
| Đã đăng nhập? → Đăng nhập /dang-nhap | Chưa | AU-05 Trang cần đăng nhập ([docs/spec/AU-tai-khoan/spec.md:31](../../docs/spec/AU-tai-khoan/spec.md)) | `docs/spec/AU-tai-khoan/` | docs/new/navigation.md:32 |
| Đăng nhập /dang-nhap → Khởi động khu học | đăng nhập xong | AU-01 Đăng nhập ([docs/spec/AU-tai-khoan/spec.md:15](../../docs/spec/AU-tai-khoan/spec.md))<br>AU-05 Trang cần đăng nhập ([docs/spec/AU-tai-khoan/spec.md:31](../../docs/spec/AU-tai-khoan/spec.md)) | `docs/spec/AU-tai-khoan/` | docs/new/navigation.md:34 |
| Đăng ký /dang-ky → Khởi động khu học | đăng ký xong | AU-02 Đăng ký ([docs/spec/AU-tai-khoan/spec.md:19](../../docs/spec/AU-tai-khoan/spec.md)) | `docs/spec/AU-tai-khoan/` | docs/new/navigation.md:36 |
| Đã đăng nhập? → Khởi động khu học | Rồi | AU-05 Trang cần đăng nhập ([docs/spec/AU-tai-khoan/spec.md:31](../../docs/spec/AU-tai-khoan/spec.md)) | `docs/spec/AU-tai-khoan/` | docs/new/navigation.md:38 |
| Khởi động khu học → S1 Chọn ngôn ngữ và bộ nội dung | chưa chọn ngôn ngữ | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md))<br>S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/app/`<br>`docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:40 |
| Khởi động khu học → 4 khu chính, chuyển bằng thanh bên | đã chọn ngôn ngữ | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:42 |
| S1 Chọn ngôn ngữ và bộ nội dung → 4 khu chính, chuyển bằng thanh bên | - | S1-04 Chọn ([docs/spec/S1-chon-ngon-ngu/spec.md:52](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:44 |
| 4 khu chính, chuyển bằng thanh bên → Màn học tập trung S3 Phiên học, S5 Kiểm tra nhanh | - | APP-03 Màn học tập trung ([docs/spec/app/spec.md:24](../../docs/spec/app/spec.md))<br>T1-02 Nút chính đổi chữ theo ngữ cảnh ([docs/spec/T1-hoc/spec.md:72](../../docs/spec/T1-hoc/spec.md))<br>T2-04 Kiểm tra nhanh ([docs/spec/T2-luyen-tap/spec.md:53](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/app/`<br>`docs/spec/T1-hoc/`<br>`docs/spec/T2-luyen-tap/` | docs/new/navigation.md:54 |
| 4 khu chính, chuyển bằng thanh bên → S8 Cài đặt | - | APP-02 Header ([docs/spec/app/spec.md:20](../../docs/spec/app/spec.md))<br>APP-04 Bảng route ([docs/spec/app/spec.md:28](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:56 |
| 4 khu chính, chuyển bằng thanh bên → Sheet đổi ngôn ngữ, từ khóa, chi tiết câu, chi tiết ngày, giọng đọc, xác nhận | - | APP-11 Một lớp phủ tại một thời điểm ([docs/spec/app/spec.md:88](../../docs/spec/app/spec.md))<br>C6-01 Dạng hiển thị ([docs/spec/C6-sheet/spec.md:15](../../docs/spec/C6-sheet/spec.md)) | `docs/spec/app/`<br>`docs/spec/C6-sheet/` | docs/new/navigation.md:58 |
| 4 khu chính, chuyển bằng thanh bên → Landing / | Trang chủ, chân thanh bên | APP-12 Liên kết về trang chủ website ([docs/spec/app/spec.md:92](../../docs/spec/app/spec.md))<br>C5-07 Chân thanh bên ([docs/spec/C5-khung-app/spec.md:39](../../docs/spec/C5-khung-app/spec.md)) | `docs/spec/app/`<br>`docs/spec/C5-khung-app/` | docs/new/navigation.md:60 |
| 4 khu chính, chuyển bằng thanh bên → Đăng nhập /dang-nhap | Đăng xuất | AU-05 Trang cần đăng nhập ([docs/spec/AU-tai-khoan/spec.md:31](../../docs/spec/AU-tai-khoan/spec.md)) | `docs/spec/AU-tai-khoan/` | docs/new/navigation.md:62 |

## 2. Luồng khởi động

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| Mở một route khu học, đã đăng nhập (AU-05) → Khởi động hiện khung xương, tải danh sách ngôn ngữ | - | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:72 |
| Khởi động hiện khung xương, tải danh sách ngôn ngữ → Tải được? | - | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:74 |
| Tải được? → Lỗi tải Không tải được danh sách câu nút Thử lại | Không | APP-08 Trạng thái toàn cục ([docs/spec/app/spec.md:69](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:76 |
| Lỗi tải Không tải được danh sách câu nút Thử lại → Khởi động hiện khung xương, tải danh sách ngôn ngữ | Thử lại | APP-08 Trạng thái toàn cục ([docs/spec/app/spec.md:69](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:78 |
| Tải được? → Đã lưu ngôn ngữ đang học? | Có | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:80 |
| Đã lưu ngôn ngữ đang học? → S1 Chọn ngôn ngữ | Chưa: lần đầu | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:82 |
| S1 Chọn ngôn ngữ → Ngôn ngữ có nhiều bộ nội dung? | chạm một ngôn ngữ | S1-04 Chọn ([docs/spec/S1-chon-ngon-ngu/spec.md:52](../../docs/spec/S1-chon-ngon-ngu/spec.md))<br>DATA-13 Bộ nội dung ([docs/spec/data/spec.md:133](../../docs/spec/data/spec.md)) | `docs/spec/S1-chon-ngon-ngu/`<br>`docs/spec/data/` | docs/new/navigation.md:84 |
| Ngôn ngữ có nhiều bộ nội dung? → S1 bước 2 Chọn bộ nội dung | Có: tiếng Anh | S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:86 |
| S1 bước 2 Chọn bộ nội dung → Tải câu và unit của bộ và ngôn ngữ đó | chạm Global English hoặc English Fluency | S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md))<br>DATA-05 Nguồn dữ liệu thay được ([docs/spec/data/spec.md:72](../../docs/spec/data/spec.md)) | `docs/spec/S1-chon-ngon-ngu/`<br>`docs/spec/data/` | docs/new/navigation.md:88 |
| Ngôn ngữ có nhiều bộ nội dung? → Tải câu và unit của bộ và ngôn ngữ đó | Không | S1-04 Chọn ([docs/spec/S1-chon-ngon-ngu/spec.md:52](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:90 |
| S1 bước 2 Chọn bộ nội dung → S1 Chọn ngôn ngữ | Quay lại | S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:92 |
| Đã lưu ngôn ngữ đang học? → Tải câu và unit của bộ và ngôn ngữ đó | Rồi | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:94 |
| Tải câu và unit của bộ và ngôn ngữ đó → Tải được? | - | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md))<br>S1-04 Chọn ([docs/spec/S1-chon-ngon-ngu/spec.md:52](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/app/`<br>`docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:96 |
| Tải được? → Lỗi tải Không tải được danh sách câu nút Thử lại | Không | APP-08 Trạng thái toàn cục ([docs/spec/app/spec.md:69](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:98 |
| Tải được? → Đã xem hướng dẫn? | Có | S9-01 Khi nào hiện ([docs/spec/S9-huong-dan/spec.md:17](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S9-huong-dan/` | docs/new/navigation.md:100 |
| Đã xem hướng dẫn? → T1 Học kèm S9 Hướng dẫn 3 bước | Chưa: lần đầu | S9-01 Khi nào hiện ([docs/spec/S9-huong-dan/spec.md:17](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S9-huong-dan/` | docs/new/navigation.md:102 |
| T1 Học kèm S9 Hướng dẫn 3 bước → T1 Học | Bỏ qua hoặc Esc | S9-03 Điều khiển ([docs/spec/S9-huong-dan/spec.md:31](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S9-huong-dan/` | docs/new/navigation.md:104 |
| T1 Học kèm S9 Hướng dẫn 3 bước → S3 Phiên học | Bắt đầu học ở bước 3 | S9-03 Điều khiển ([docs/spec/S9-huong-dan/spec.md:31](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S9-huong-dan/` | docs/new/navigation.md:106 |
| Đã xem hướng dẫn? → T1 Học | Rồi | S9-04 Không hiện lại ([docs/spec/S9-huong-dan/spec.md:35](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S9-huong-dan/` | docs/new/navigation.md:108 |

## 3. Điều hướng giữa các màn

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| Khởi động kiểm tra lần đầu, xem mục 2 → S1 Chọn ngôn ngữ | lần đầu | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:118 |
| S1 Chọn ngôn ngữ → 4 khu chính, chuyển bằng thanh bên | chạm ngôn ngữ chỉ có một bộ | S1-04 Chọn ([docs/spec/S1-chon-ngon-ngu/spec.md:52](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:120 |
| S1 Chọn ngôn ngữ → S1 bước 2 Chọn bộ nội dung | chạm Tiếng Anh | S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:122 |
| S1 bước 2 Chọn bộ nội dung → 4 khu chính, chuyển bằng thanh bên | chạm một bộ | S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:124 |
| Khởi động kiểm tra lần đầu, xem mục 2 → 4 khu chính, chuyển bằng thanh bên | đã chọn ngôn ngữ | APP-05 Khởi động ([docs/spec/app/spec.md:49](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:126 |
| 4 khu chính, chuyển bằng thanh bên → Sheet Đổi ngôn ngữ hoặc bộ nội dung | nút ngôn ngữ trên thanh bên | APP-02 Header ([docs/spec/app/spec.md:20](../../docs/spec/app/spec.md))<br>APP-06 Sheet Đổi ngôn ngữ ([docs/spec/app/spec.md:53](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:138 |
| 4 khu chính, chuyển bằng thanh bên → S8 Cài đặt | mục Cài đặt trên thanh bên | APP-02 Header ([docs/spec/app/spec.md:20](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:140 |
| T1 Học → S3 Phiên học | Học 8 câu / Tiếp tục N câu cần ôn hôm nay | T1-02 Nút chính đổi chữ theo ngữ cảnh ([docs/spec/T1-hoc/spec.md:72](../../docs/spec/T1-hoc/spec.md))<br>T1-04 Câu cần ôn ([docs/spec/T1-hoc/spec.md:82](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:143 |
| T1 Học → T2 Luyện tập | Mở Luyện tập, khi học hết lộ trình | T1-05 Học hết lộ trình ([docs/spec/T1-hoc/spec.md:86](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:145 |
| T1 Học → S10 Chi tiết Unit | tên unit trên thẻ, Unit tiếp theo | T1-01 Thẻ câu tiếp theo ([docs/spec/T1-hoc/spec.md:68](../../docs/spec/T1-hoc/spec.md))<br>T1-08 Unit tiếp theo ([docs/spec/T1-hoc/spec.md:98](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:147 |
| T1 Học → T3 Thư viện | Xem tất cả unit | T1-08 Unit tiếp theo ([docs/spec/T1-hoc/spec.md:98](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:149 |
| T1 Học → T4 Tiến độ | Xem tiến độ | T1-09 Tiến độ của bạn ([docs/spec/T1-hoc/spec.md:102](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:151 |
| T2 Luyện tập → S3 Phiên học | Ôn tập hôm nay | T2-02 Ôn tập hôm nay ([docs/spec/T2-luyen-tap/spec.md:45](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/T2-luyen-tap/` | docs/new/navigation.md:153 |
| T2 Luyện tập → Sheet Học theo từ khóa | Học theo từ khóa | T2-03 Học theo từ khóa ([docs/spec/T2-luyen-tap/spec.md:49](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/T2-luyen-tap/` | docs/new/navigation.md:155 |
| Sheet Học theo từ khóa → S3 Phiên học | Học 8 câu đầu | T2-03 Học theo từ khóa ([docs/spec/T2-luyen-tap/spec.md:49](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/T2-luyen-tap/` | docs/new/navigation.md:157 |
| T2 Luyện tập → S5 Kiểm tra nhanh | Kiểm tra nhanh | T2-04 Kiểm tra nhanh ([docs/spec/T2-luyen-tap/spec.md:53](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/T2-luyen-tap/` | docs/new/navigation.md:159 |
| S5 Kiểm tra nhanh → T2 Luyện tập | Thoát, Tạm dừng | S5-08 Tạm dừng giữa chừng ([docs/spec/S5-kiem-tra-nhanh/spec.md:61](../../docs/spec/S5-kiem-tra-nhanh/spec.md))<br>S5-09 Bài kiểm tra dở ([docs/spec/S5-kiem-tra-nhanh/spec.md:65](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:161 |
| S5 Kiểm tra nhanh → S5 Kết quả | xong bước cuối | S5-07 Kết quả ([docs/spec/S5-kiem-tra-nhanh/spec.md:57](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:163 |
| T3 Thư viện → Sheet Chi tiết câu | chạm vào câu | T3-05 Chi tiết câu ([docs/spec/T3-thu-vien/spec.md:93](../../docs/spec/T3-thu-vien/spec.md)) | `docs/spec/T3-thu-vien/` | docs/new/navigation.md:165 |
| Sheet Chi tiết câu → S3 Phiên học | Học câu này | T3-05 Chi tiết câu ([docs/spec/T3-thu-vien/spec.md:93](../../docs/spec/T3-thu-vien/spec.md)) | `docs/spec/T3-thu-vien/` | docs/new/navigation.md:167 |
| T3 Thư viện → S10 Chi tiết Unit | chạm vào unit | T3-09 Danh sách Unit ([docs/spec/T3-thu-vien/spec.md:109](../../docs/spec/T3-thu-vien/spec.md)) | `docs/spec/T3-thu-vien/` | docs/new/navigation.md:169 |
| S10 Chi tiết Unit → S3 Phiên học | Học unit này | S10-04 Hành động ([docs/spec/S10-chi-tiet-unit/spec.md:54](../../docs/spec/S10-chi-tiet-unit/spec.md)) | `docs/spec/S10-chi-tiet-unit/` | docs/new/navigation.md:171 |
| S10 Chi tiết Unit → S5 Kiểm tra nhanh | Kiểm tra nhanh unit này | S10-04 Hành động ([docs/spec/S10-chi-tiet-unit/spec.md:54](../../docs/spec/S10-chi-tiet-unit/spec.md)) | `docs/spec/S10-chi-tiet-unit/` | docs/new/navigation.md:173 |
| S10 Chi tiết Unit → Sheet Chi tiết câu | chạm vào câu | S10-05 Danh sách câu ([docs/spec/S10-chi-tiet-unit/spec.md:58](../../docs/spec/S10-chi-tiet-unit/spec.md)) | `docs/spec/S10-chi-tiet-unit/` | docs/new/navigation.md:175 |
| T4 Tiến độ → Sheet Chi tiết ngày | chạm vào cột ngày | T4-07 Chi tiết ngày ([docs/spec/T4-tien-do/spec.md:71](../../docs/spec/T4-tien-do/spec.md)) | `docs/spec/T4-tien-do/` | docs/new/navigation.md:177 |
| T4 Tiến độ → S3 Phiên học | Học 8 câu, khi chưa có phiên | T4-08 Chưa có dữ liệu ([docs/spec/T4-tien-do/spec.md:75](../../docs/spec/T4-tien-do/spec.md)) | `docs/spec/T4-tien-do/` | docs/new/navigation.md:179 |
| S3 Phiên học → S3c Tổng kết phiên | xong câu cuối | S3-02 Khung phiên ([docs/spec/S3-phien-hoc/spec.md:100](../../docs/spec/S3-phien-hoc/spec.md))<br>S3-06 Tổng kết phiên ([docs/spec/S3-phien-hoc/spec.md:116](../../docs/spec/S3-phien-hoc/spec.md)) | `docs/spec/S3-phien-hoc/` | docs/new/navigation.md:181 |
| S8 Cài đặt → Sheet Giọng đọc | Giọng đọc | S8-02 Giọng đọc ([docs/spec/S8-cai-dat/spec.md:21](../../docs/spec/S8-cai-dat/spec.md)) | `docs/spec/S8-cai-dat/` | docs/new/navigation.md:183 |
| T1 Học → Sheet Giọng đọc | Cài đặt > Giọng đọc, khi thiết bị thiếu giọng | C1-05 Không có giọng đọc ([docs/spec/C1-the-cau/spec.md:48](../../docs/spec/C1-the-cau/spec.md)) | `docs/spec/C1-the-cau/` | docs/new/navigation.md:185 |
| S8 Cài đặt → T1 kèm S9 Hướng dẫn | Xem lại hướng dẫn | S8-06 Trợ giúp ([docs/spec/S8-cai-dat/spec.md:47](../../docs/spec/S8-cai-dat/spec.md))<br>S9-05 Xem lại ([docs/spec/S9-huong-dan/spec.md:39](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S8-cai-dat/`<br>`docs/spec/S9-huong-dan/` | docs/new/navigation.md:187 |

## 4.1 Chọn ngôn ngữ, bộ nội dung và hướng dẫn lần đầu

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «list item» Tiếng Anh → «window» S1 bước 2: Chọn bộ nội dung | Click | S1-04 Chọn ([docs/spec/S1-chon-ngon-ngu/spec.md:52](../../docs/spec/S1-chon-ngon-ngu/spec.md))<br>S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md)) | `docs/spec/S1-chon-ngon-ngu/` | docs/new/navigation.md:250 |
| «list item» Global English → «overlay» S9 Hướng dẫn trên T1 | Click | S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md))<br>S9-01 Khi nào hiện ([docs/spec/S9-huong-dan/spec.md:17](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S1-chon-ngon-ngu/`<br>`docs/spec/S9-huong-dan/` | docs/new/navigation.md:252 |
| «list item» English Fluency → «overlay» S9 Hướng dẫn trên T1 | Click | S1-07 Chọn bộ nội dung ([docs/spec/S1-chon-ngon-ngu/spec.md:64](../../docs/spec/S1-chon-ngon-ngu/spec.md))<br>S9-01 Khi nào hiện ([docs/spec/S9-huong-dan/spec.md:17](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S1-chon-ngon-ngu/`<br>`docs/spec/S9-huong-dan/` | docs/new/navigation.md:254 |
| «list item» Ngôn ngữ khác → «overlay» S9 Hướng dẫn trên T1 | Click | S1-04 Chọn ([docs/spec/S1-chon-ngon-ngu/spec.md:52](../../docs/spec/S1-chon-ngon-ngu/spec.md))<br>S9-01 Khi nào hiện ([docs/spec/S9-huong-dan/spec.md:17](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S1-chon-ngon-ngu/`<br>`docs/spec/S9-huong-dan/` | docs/new/navigation.md:256 |
| «button» Bỏ qua → «window» T1 Học | Click | S9-03 Điều khiển ([docs/spec/S9-huong-dan/spec.md:31](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S9-huong-dan/` | docs/new/navigation.md:258 |
| «button» Bắt đầu học → «window» S3 Phiên học | Click | S9-03 Điều khiển ([docs/spec/S9-huong-dan/spec.md:31](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S9-huong-dan/` | docs/new/navigation.md:260 |

## 4.2 T1 Học và thanh bên

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «button» Ngôn ngữ đang học ▾ (thanh bên) → «sheet» Đổi ngôn ngữ hoặc bộ nội dung | Click | APP-02 Header ([docs/spec/app/spec.md:20](../../docs/spec/app/spec.md))<br>APP-06 Sheet Đổi ngôn ngữ ([docs/spec/app/spec.md:53](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:314 |
| «nav item» Cài đặt (thanh bên) → «window» S8 Cài đặt | Click | APP-02 Header ([docs/spec/app/spec.md:20](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:316 |
| «button» Học 8 câu / Tiếp tục → «window» S3 Phiên học | Click | T1-02 Nút chính đổi chữ theo ngữ cảnh ([docs/spec/T1-hoc/spec.md:72](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:318 |
| «hyperlink» N câu cần ôn hôm nay → «window» S3 Phiên học | Click | T1-04 Câu cần ôn ([docs/spec/T1-hoc/spec.md:82](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:320 |
| «nav item» Luyện tập → «window» T2 Luyện tập | Click | APP-01 Bốn khu chính ([docs/spec/app/spec.md:16](../../docs/spec/app/spec.md))<br>C5-01 Thanh bên ([docs/spec/C5-khung-app/spec.md:15](../../docs/spec/C5-khung-app/spec.md)) | `docs/spec/app/`<br>`docs/spec/C5-khung-app/` | docs/new/navigation.md:322 |
| «nav item» Thư viện → «window» T3 Thư viện | Click | APP-01 Bốn khu chính ([docs/spec/app/spec.md:16](../../docs/spec/app/spec.md))<br>C5-01 Thanh bên ([docs/spec/C5-khung-app/spec.md:15](../../docs/spec/C5-khung-app/spec.md)) | `docs/spec/app/`<br>`docs/spec/C5-khung-app/` | docs/new/navigation.md:324 |
| «nav item» Tiến độ → «window» T4 Tiến độ | Click | APP-01 Bốn khu chính ([docs/spec/app/spec.md:16](../../docs/spec/app/spec.md))<br>C5-01 Thanh bên ([docs/spec/C5-khung-app/spec.md:15](../../docs/spec/C5-khung-app/spec.md)) | `docs/spec/app/`<br>`docs/spec/C5-khung-app/` | docs/new/navigation.md:326 |
| «list item» Ngôn ngữ hoặc bộ khác → «window» T1 Học, ngôn ngữ hoặc bộ mới | Click | APP-06 Sheet Đổi ngôn ngữ ([docs/spec/app/spec.md:53](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:328 |
| «button» Mở Luyện tập, khi học hết → «window» T2 Luyện tập | Click | T1-05 Học hết lộ trình ([docs/spec/T1-hoc/spec.md:86](../../docs/spec/T1-hoc/spec.md)) | `docs/spec/T1-hoc/` | docs/new/navigation.md:330 |
| «hyperlink» Cài đặt > Giọng đọc, khi thiếu giọng → «sheet» Giọng đọc | Click | C1-05 Không có giọng đọc ([docs/spec/C1-the-cau/spec.md:48](../../docs/spec/C1-the-cau/spec.md)) | `docs/spec/C1-the-cau/` | docs/new/navigation.md:332 |

## 4.3 S3 Phiên học

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «button» Cần ôn lại → «window» S3b Kiểm tra | Click | S3-03 Bước ghi nhớ ([docs/spec/S3-phien-hoc/spec.md:104](../../docs/spec/S3-phien-hoc/spec.md))<br>C3-03 Cặp nút đánh giá ([docs/spec/C3-nut/spec.md:21](../../docs/spec/C3-nut/spec.md)) | `docs/spec/S3-phien-hoc/`<br>`docs/spec/C3-nut/` | docs/new/navigation.md:381 |
| «button» Tôi nhớ → «window» S3b Kiểm tra | Click | S3-03 Bước ghi nhớ ([docs/spec/S3-phien-hoc/spec.md:104](../../docs/spec/S3-phien-hoc/spec.md))<br>C3-03 Cặp nút đánh giá ([docs/spec/C3-nut/spec.md:21](../../docs/spec/C3-nut/spec.md)) | `docs/spec/S3-phien-hoc/`<br>`docs/spec/C3-nut/` | docs/new/navigation.md:383 |
| «button» Xem tổng kết, ở câu cuối → «window» S3c Tổng kết phiên | Click | S3-04 Bước kiểm tra ([docs/spec/S3-phien-hoc/spec.md:108](../../docs/spec/S3-phien-hoc/spec.md)) | `docs/spec/S3-phien-hoc/` | docs/new/navigation.md:385 |
| «button» Thoát → «sheet» Dừng phiên học? | Click | S3-07 Thoát giữa phiên ([docs/spec/S3-phien-hoc/spec.md:120](../../docs/spec/S3-phien-hoc/spec.md)) | `docs/spec/S3-phien-hoc/` | docs/new/navigation.md:387 |
| «button» Thoát → «sheet» Dừng phiên học? | Click | S3-07 Thoát giữa phiên ([docs/spec/S3-phien-hoc/spec.md:120](../../docs/spec/S3-phien-hoc/spec.md)) | `docs/spec/S3-phien-hoc/` | docs/new/navigation.md:389 |
| «button» Dừng → «window» Màn đã mở phiên | Click | S3-07 Thoát giữa phiên ([docs/spec/S3-phien-hoc/spec.md:120](../../docs/spec/S3-phien-hoc/spec.md)) | `docs/spec/S3-phien-hoc/` | docs/new/navigation.md:391 |
| «hyperlink» Xem tiến độ → «window» T4 Tiến độ | Click | S3-06 Tổng kết phiên ([docs/spec/S3-phien-hoc/spec.md:116](../../docs/spec/S3-phien-hoc/spec.md)) | `docs/spec/S3-phien-hoc/` | docs/new/navigation.md:393 |
| «hyperlink» Xong → «window» T1 Học | Click | S3-06 Tổng kết phiên ([docs/spec/S3-phien-hoc/spec.md:116](../../docs/spec/S3-phien-hoc/spec.md)) | `docs/spec/S3-phien-hoc/` | docs/new/navigation.md:395 |

## 4.4 T2 Luyện tập và S5 Kiểm tra nhanh

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «list item» Ôn tập hôm nay → «window» S3 Phiên học | Click | T2-02 Ôn tập hôm nay ([docs/spec/T2-luyen-tap/spec.md:45](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/T2-luyen-tap/` | docs/new/navigation.md:443 |
| «list item» Học theo từ khóa → «sheet» Học theo từ khóa | Click | T2-03 Học theo từ khóa ([docs/spec/T2-luyen-tap/spec.md:49](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/T2-luyen-tap/` | docs/new/navigation.md:445 |
| «button» Học 8 câu đầu → «window» S3 Phiên học | Click | T2-03 Học theo từ khóa ([docs/spec/T2-luyen-tap/spec.md:49](../../docs/spec/T2-luyen-tap/spec.md)) | `docs/spec/T2-luyen-tap/` | docs/new/navigation.md:447 |
| «list item» Kiểm tra nhanh → «window» S5 Bắt đầu kiểm tra | Click | T2-04 Kiểm tra nhanh ([docs/spec/T2-luyen-tap/spec.md:53](../../docs/spec/T2-luyen-tap/spec.md))<br>S5-01 Màn bắt đầu ([docs/spec/S5-kiem-tra-nhanh/spec.md:33](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/T2-luyen-tap/`<br>`docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:449 |
| «button» Làm cả 3 bước → «window» S5 Đang kiểm tra | Click | S5-01 Màn bắt đầu ([docs/spec/S5-kiem-tra-nhanh/spec.md:33](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:451 |
| «hyperlink» Chỉ làm một bước → «window» S5 Đang kiểm tra | Click | S5-01 Màn bắt đầu ([docs/spec/S5-kiem-tra-nhanh/spec.md:33](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:453 |
| «button» Thoát → «sheet» Dừng kiểm tra? | Click | S5-08 Tạm dừng giữa chừng ([docs/spec/S5-kiem-tra-nhanh/spec.md:61](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:455 |
| «button» Dừng → «window» T2 Luyện tập | Click | S5-08 Tạm dừng giữa chừng ([docs/spec/S5-kiem-tra-nhanh/spec.md:61](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:457 |
| «button» Câu tiếp, ở câu cuối → «window» S5 Kết quả | Click | S5-07 Kết quả ([docs/spec/S5-kiem-tra-nhanh/spec.md:57](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:459 |
| «hyperlink» Xong → «window» T2 Luyện tập | Click | S5-07 Kết quả ([docs/spec/S5-kiem-tra-nhanh/spec.md:57](../../docs/spec/S5-kiem-tra-nhanh/spec.md)) | `docs/spec/S5-kiem-tra-nhanh/` | docs/new/navigation.md:461 |

## 4.5 T3 Thư viện

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «list item» Dòng unit (cách xem Unit) → «window» S10 Chi tiết Unit | Click | T3-09 Danh sách Unit ([docs/spec/T3-thu-vien/spec.md:109](../../docs/spec/T3-thu-vien/spec.md)) | `docs/spec/T3-thu-vien/` | docs/new/navigation.md:500 |
| «list item» Dòng câu (cách xem Câu) → «sheet» Chi tiết câu | Click | T3-05 Chi tiết câu ([docs/spec/T3-thu-vien/spec.md:93](../../docs/spec/T3-thu-vien/spec.md)) | `docs/spec/T3-thu-vien/` | docs/new/navigation.md:502 |
| «button» Học câu này → «window» S3 Phiên học | Click | T3-05 Chi tiết câu ([docs/spec/T3-thu-vien/spec.md:93](../../docs/spec/T3-thu-vien/spec.md)) | `docs/spec/T3-thu-vien/` | docs/new/navigation.md:504 |
| «button» Học unit này → «window» S3 Phiên học | Click | S10-04 Hành động ([docs/spec/S10-chi-tiet-unit/spec.md:54](../../docs/spec/S10-chi-tiet-unit/spec.md)) | `docs/spec/S10-chi-tiet-unit/` | docs/new/navigation.md:506 |
| «button» Kiểm tra nhanh unit này → «window» S5 Kiểm tra nhanh | Click | S10-04 Hành động ([docs/spec/S10-chi-tiet-unit/spec.md:54](../../docs/spec/S10-chi-tiet-unit/spec.md)) | `docs/spec/S10-chi-tiet-unit/` | docs/new/navigation.md:508 |
| «list item» Dòng câu → «sheet» Chi tiết câu | Click | S10-05 Danh sách câu ([docs/spec/S10-chi-tiet-unit/spec.md:58](../../docs/spec/S10-chi-tiet-unit/spec.md)) | `docs/spec/S10-chi-tiet-unit/` | docs/new/navigation.md:510 |
| «link» Thư viện → «window» T3 Thư viện | Click | S10-01 Route và khung ([docs/spec/S10-chi-tiet-unit/spec.md:42](../../docs/spec/S10-chi-tiet-unit/spec.md)) | `docs/spec/S10-chi-tiet-unit/` | docs/new/navigation.md:512 |

## 4.6 T4 Tiến độ

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «chart bar» Cột ngày → «sheet» Chi tiết ngày | Click | T4-07 Chi tiết ngày ([docs/spec/T4-tien-do/spec.md:71](../../docs/spec/T4-tien-do/spec.md)) | `docs/spec/T4-tien-do/` | docs/new/navigation.md:541 |
| «button» Học 8 câu, khi chưa có phiên → «window» S3 Phiên học | Click | T4-08 Chưa có dữ liệu ([docs/spec/T4-tien-do/spec.md:75](../../docs/spec/T4-tien-do/spec.md)) | `docs/spec/T4-tien-do/` | docs/new/navigation.md:543 |

## 4.7 S8 Cài đặt

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «button» Quay lại → «window» Màn trước đó | Click | APP-04 Bảng route ([docs/spec/app/spec.md:28](../../docs/spec/app/spec.md)) | `docs/spec/app/` | docs/new/navigation.md:589 |
| «list item» Ngôn ngữ đang học → «sheet» Đổi ngôn ngữ hoặc bộ nội dung | Click | S8-01 Học tập ([docs/spec/S8-cai-dat/spec.md:17](../../docs/spec/S8-cai-dat/spec.md)) | `docs/spec/S8-cai-dat/` | docs/new/navigation.md:591 |
| «list item» Giọng đọc → «sheet» Giọng đọc | Click | S8-02 Giọng đọc ([docs/spec/S8-cai-dat/spec.md:21](../../docs/spec/S8-cai-dat/spec.md)) | `docs/spec/S8-cai-dat/` | docs/new/navigation.md:593 |
| «list item» Nhập tiến độ → «sheet» Xác nhận nhập tiến độ | Click, sau khi chọn file | S8-05 Tiến độ ([docs/spec/S8-cai-dat/spec.md:40](../../docs/spec/S8-cai-dat/spec.md)) | `docs/spec/S8-cai-dat/` | docs/new/navigation.md:595 |
| «list item» Xóa tiến độ → «sheet» Xác nhận xóa tiến độ | Click | S8-05 Tiến độ ([docs/spec/S8-cai-dat/spec.md:40](../../docs/spec/S8-cai-dat/spec.md)) | `docs/spec/S8-cai-dat/` | docs/new/navigation.md:597 |
| «button» Xóa → «window» T1 Học | Click, khi gõ đúng tên ngôn ngữ | S8-05 Tiến độ ([docs/spec/S8-cai-dat/spec.md:40](../../docs/spec/S8-cai-dat/spec.md)) | `docs/spec/S8-cai-dat/` | docs/new/navigation.md:599 |
| «hyperlink» Xem lại hướng dẫn → «overlay» S9 Hướng dẫn trên T1 | Click | S8-06 Trợ giúp ([docs/spec/S8-cai-dat/spec.md:47](../../docs/spec/S8-cai-dat/spec.md))<br>S9-05 Xem lại ([docs/spec/S9-huong-dan/spec.md:39](../../docs/spec/S9-huong-dan/spec.md)) | `docs/spec/S8-cai-dat/`<br>`docs/spec/S9-huong-dan/` | docs/new/navigation.md:601 |
