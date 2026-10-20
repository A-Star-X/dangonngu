# Ánh xạ sơ đồ điều hướng sang spec

File sinh tự động bởi `node scripts/spec.mjs trace` lúc 2026-10-20 14:48 UTC từ các dòng `%% @spec` trong docs/new/navigation.md. Không sửa tay.

Tổng: 107 mũi tên; 106 gắn yêu cầu, 1 ngoài phạm vi.

## 1. Sơ đồ tổng quát

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| Trang học chính (ngoài phạm vi) → Khởi động kiểm tra lần đầu | chọn Đa ngôn ngữ, mở trang mới | Ngoài phạm vi: trang chính ngoài phạm vi, xem docs/legacy/README.md | - | docs/new/navigation.md:18 |
| Khởi động kiểm tra lần đầu → S1 Chọn ngôn ngữ và bộ nội dung | lần đầu | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md))<br>S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/app/`<br>`fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:20 |
| Khởi động kiểm tra lần đầu → 4 khu chính, chuyển bằng thanh tab | đã chọn ngôn ngữ | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:22 |
| S1 Chọn ngôn ngữ và bộ nội dung → 4 khu chính, chuyển bằng thanh tab | - | S1-04 Chọn ([fe/src/pages/S1-chon-ngon-ngu/spec.md:52](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:24 |
| 4 khu chính, chuyển bằng thanh tab → Màn toàn trang S3 Phiên học, S5 Kiểm tra nhanh | - | APP-03 Màn toàn trang ([fe/src/app/spec.md:24](../../fe/src/app/spec.md))<br>T1-02 Nút chính đổi chữ theo ngữ cảnh ([fe/src/pages/T1-hoc/spec.md:72](../../fe/src/pages/T1-hoc/spec.md))<br>T2-04 Kiểm tra nhanh ([fe/src/pages/T2-luyen-tap/spec.md:53](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/app/`<br>`fe/src/pages/T1-hoc/`<br>`fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:34 |
| 4 khu chính, chuyển bằng thanh tab → S8 Cài đặt | - | APP-02 Thanh trên cùng ([fe/src/app/spec.md:20](../../fe/src/app/spec.md))<br>APP-04 Bảng route ([fe/src/app/spec.md:28](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:36 |
| 4 khu chính, chuyển bằng thanh tab → Sheet đổi ngôn ngữ, từ khóa, chi tiết câu, chi tiết ngày, giọng đọc, xác nhận | - | APP-11 Một lớp phủ tại một thời điểm ([fe/src/app/spec.md:84](../../fe/src/app/spec.md))<br>C6-01 Dạng hiển thị ([fe/src/components/C6-sheet/spec.md:15](../../fe/src/components/C6-sheet/spec.md)) | `fe/src/app/`<br>`fe/src/components/C6-sheet/` | docs/new/navigation.md:38 |
| 4 khu chính, chuyển bằng thanh tab → Trang học chính (ngoài phạm vi) | Quay lại trang học | APP-12 Nút về trang học chính ([fe/src/app/spec.md:88](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:40 |
| S1 Chọn ngôn ngữ và bộ nội dung → Trang học chính (ngoài phạm vi) | Quay lại trang học | APP-12 Nút về trang học chính ([fe/src/app/spec.md:88](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:42 |

## 2. Luồng khởi động

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| Mở mini app → Khởi động hiện khung xương, tải danh sách ngôn ngữ | - | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:52 |
| Khởi động hiện khung xương, tải danh sách ngôn ngữ → Tải được? | - | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:54 |
| Tải được? → Lỗi tải Không tải được danh sách câu nút Thử lại | Không | APP-08 Trạng thái toàn cục ([fe/src/app/spec.md:67](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:56 |
| Lỗi tải Không tải được danh sách câu nút Thử lại → Khởi động hiện khung xương, tải danh sách ngôn ngữ | Thử lại | APP-08 Trạng thái toàn cục ([fe/src/app/spec.md:67](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:58 |
| Tải được? → Đã lưu ngôn ngữ đang học? | Có | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:60 |
| Đã lưu ngôn ngữ đang học? → S1 Chọn ngôn ngữ | Chưa: lần đầu | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:62 |
| S1 Chọn ngôn ngữ → Ngôn ngữ có nhiều bộ nội dung? | chạm một ngôn ngữ | S1-04 Chọn ([fe/src/pages/S1-chon-ngon-ngu/spec.md:52](../../fe/src/pages/S1-chon-ngon-ngu/spec.md))<br>DATA-13 Bộ nội dung ([fe/src/data/spec.md:130](../../fe/src/data/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/`<br>`fe/src/data/` | docs/new/navigation.md:64 |
| Ngôn ngữ có nhiều bộ nội dung? → S1 bước 2 Chọn bộ nội dung | Có: tiếng Anh | S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:66 |
| S1 bước 2 Chọn bộ nội dung → Tải câu và unit của bộ và ngôn ngữ đó | chạm Global English hoặc English Fluency | S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md))<br>DATA-05 Nguồn dữ liệu thay được ([fe/src/data/spec.md:72](../../fe/src/data/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/`<br>`fe/src/data/` | docs/new/navigation.md:68 |
| Ngôn ngữ có nhiều bộ nội dung? → Tải câu và unit của bộ và ngôn ngữ đó | Không | S1-04 Chọn ([fe/src/pages/S1-chon-ngon-ngu/spec.md:52](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:70 |
| S1 bước 2 Chọn bộ nội dung → S1 Chọn ngôn ngữ | Quay lại | S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:72 |
| Đã lưu ngôn ngữ đang học? → Tải câu và unit của bộ và ngôn ngữ đó | Rồi | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:74 |
| Tải câu và unit của bộ và ngôn ngữ đó → Tải được? | - | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md))<br>S1-04 Chọn ([fe/src/pages/S1-chon-ngon-ngu/spec.md:52](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/app/`<br>`fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:76 |
| Tải được? → Lỗi tải Không tải được danh sách câu nút Thử lại | Không | APP-08 Trạng thái toàn cục ([fe/src/app/spec.md:67](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:78 |
| Tải được? → Đã xem hướng dẫn? | Có | S9-01 Khi nào hiện ([fe/src/pages/S9-huong-dan/spec.md:17](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:80 |
| Đã xem hướng dẫn? → T1 Học kèm S9 Hướng dẫn 3 bước | Chưa: lần đầu | S9-01 Khi nào hiện ([fe/src/pages/S9-huong-dan/spec.md:17](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:82 |
| T1 Học kèm S9 Hướng dẫn 3 bước → T1 Học | Bỏ qua hoặc Esc | S9-03 Điều khiển ([fe/src/pages/S9-huong-dan/spec.md:31](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:84 |
| T1 Học kèm S9 Hướng dẫn 3 bước → S3 Phiên học | Bắt đầu học ở bước 3 | S9-03 Điều khiển ([fe/src/pages/S9-huong-dan/spec.md:31](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:86 |
| Đã xem hướng dẫn? → T1 Học | Rồi | S9-04 Không hiện lại ([fe/src/pages/S9-huong-dan/spec.md:35](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:88 |

## 3. Điều hướng giữa các màn

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| Khởi động kiểm tra lần đầu, xem mục 2 → S1 Chọn ngôn ngữ | lần đầu | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:98 |
| S1 Chọn ngôn ngữ → 4 khu chính, chuyển bằng thanh tab | chạm ngôn ngữ chỉ có một bộ | S1-04 Chọn ([fe/src/pages/S1-chon-ngon-ngu/spec.md:52](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:100 |
| S1 Chọn ngôn ngữ → S1 bước 2 Chọn bộ nội dung | chạm Tiếng Anh | S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:102 |
| S1 bước 2 Chọn bộ nội dung → 4 khu chính, chuyển bằng thanh tab | chạm một bộ | S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:104 |
| Khởi động kiểm tra lần đầu, xem mục 2 → 4 khu chính, chuyển bằng thanh tab | đã chọn ngôn ngữ | APP-05 Khởi động ([fe/src/app/spec.md:46](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:106 |
| 4 khu chính, chuyển bằng thanh tab → Sheet Đổi ngôn ngữ hoặc bộ nội dung | tên ngôn ngữ | APP-02 Thanh trên cùng ([fe/src/app/spec.md:20](../../fe/src/app/spec.md))<br>APP-06 Sheet Đổi ngôn ngữ ([fe/src/app/spec.md:50](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:118 |
| 4 khu chính, chuyển bằng thanh tab → S8 Cài đặt | Cài đặt | APP-02 Thanh trên cùng ([fe/src/app/spec.md:20](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:120 |
| T1 Học → S3 Phiên học | Học 8 câu / Tiếp tục N câu cần ôn hôm nay | T1-02 Nút chính đổi chữ theo ngữ cảnh ([fe/src/pages/T1-hoc/spec.md:72](../../fe/src/pages/T1-hoc/spec.md))<br>T1-04 Câu cần ôn ([fe/src/pages/T1-hoc/spec.md:82](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:123 |
| T1 Học → T2 Luyện tập | Mở Luyện tập, khi học hết lộ trình | T1-05 Học hết lộ trình ([fe/src/pages/T1-hoc/spec.md:86](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:125 |
| T1 Học → S10 Chi tiết Unit | tên unit trên thẻ, Unit tiếp theo | T1-01 Thẻ câu tiếp theo ([fe/src/pages/T1-hoc/spec.md:68](../../fe/src/pages/T1-hoc/spec.md))<br>T1-08 Unit tiếp theo ([fe/src/pages/T1-hoc/spec.md:98](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:127 |
| T1 Học → T3 Thư viện | Xem tất cả unit | T1-08 Unit tiếp theo ([fe/src/pages/T1-hoc/spec.md:98](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:129 |
| T1 Học → T4 Tiến độ | Xem tiến độ | T1-09 Tiến độ của bạn ([fe/src/pages/T1-hoc/spec.md:102](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:131 |
| T2 Luyện tập → S3 Phiên học | Ôn tập hôm nay | T2-02 Ôn tập hôm nay ([fe/src/pages/T2-luyen-tap/spec.md:45](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:133 |
| T2 Luyện tập → Sheet Học theo từ khóa | Học theo từ khóa | T2-03 Học theo từ khóa ([fe/src/pages/T2-luyen-tap/spec.md:49](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:135 |
| Sheet Học theo từ khóa → S3 Phiên học | Học 8 câu đầu | T2-03 Học theo từ khóa ([fe/src/pages/T2-luyen-tap/spec.md:49](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:137 |
| T2 Luyện tập → S5 Kiểm tra nhanh | Kiểm tra nhanh | T2-04 Kiểm tra nhanh ([fe/src/pages/T2-luyen-tap/spec.md:53](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:139 |
| S5 Kiểm tra nhanh → S5 Kết quả | xong bước cuối | S5-07 Kết quả ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:57](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:141 |
| T3 Thư viện → Sheet Chi tiết câu | chạm vào câu | T3-05 Chi tiết câu ([fe/src/pages/T3-thu-vien/spec.md:93](../../fe/src/pages/T3-thu-vien/spec.md)) | `fe/src/pages/T3-thu-vien/` | docs/new/navigation.md:143 |
| Sheet Chi tiết câu → S3 Phiên học | Học câu này | T3-05 Chi tiết câu ([fe/src/pages/T3-thu-vien/spec.md:93](../../fe/src/pages/T3-thu-vien/spec.md)) | `fe/src/pages/T3-thu-vien/` | docs/new/navigation.md:145 |
| T3 Thư viện → S10 Chi tiết Unit | chạm vào unit | T3-09 Danh sách Unit ([fe/src/pages/T3-thu-vien/spec.md:109](../../fe/src/pages/T3-thu-vien/spec.md)) | `fe/src/pages/T3-thu-vien/` | docs/new/navigation.md:147 |
| S10 Chi tiết Unit → S3 Phiên học | Học unit này | S10-04 Hành động ([fe/src/pages/S10-chi-tiet-unit/spec.md:55](../../fe/src/pages/S10-chi-tiet-unit/spec.md)) | `fe/src/pages/S10-chi-tiet-unit/` | docs/new/navigation.md:149 |
| S10 Chi tiết Unit → S5 Kiểm tra nhanh | Kiểm tra nhanh unit này | S10-04 Hành động ([fe/src/pages/S10-chi-tiet-unit/spec.md:55](../../fe/src/pages/S10-chi-tiet-unit/spec.md)) | `fe/src/pages/S10-chi-tiet-unit/` | docs/new/navigation.md:151 |
| S10 Chi tiết Unit → Sheet Chi tiết câu | chạm vào câu | S10-05 Danh sách câu ([fe/src/pages/S10-chi-tiet-unit/spec.md:59](../../fe/src/pages/S10-chi-tiet-unit/spec.md)) | `fe/src/pages/S10-chi-tiet-unit/` | docs/new/navigation.md:153 |
| T4 Tiến độ → Sheet Chi tiết ngày | chạm vào cột ngày | T4-07 Chi tiết ngày ([fe/src/pages/T4-tien-bo/spec.md:71](../../fe/src/pages/T4-tien-bo/spec.md)) | `fe/src/pages/T4-tien-bo/` | docs/new/navigation.md:155 |
| T4 Tiến độ → S3 Phiên học | Học 8 câu, khi chưa có phiên | T4-08 Chưa có dữ liệu ([fe/src/pages/T4-tien-bo/spec.md:75](../../fe/src/pages/T4-tien-bo/spec.md)) | `fe/src/pages/T4-tien-bo/` | docs/new/navigation.md:157 |
| S3 Phiên học → S3c Tổng kết phiên | xong câu cuối | S3-02 Khung phiên ([fe/src/pages/S3-phien-hoc/spec.md:100](../../fe/src/pages/S3-phien-hoc/spec.md))<br>S3-06 Tổng kết phiên ([fe/src/pages/S3-phien-hoc/spec.md:116](../../fe/src/pages/S3-phien-hoc/spec.md)) | `fe/src/pages/S3-phien-hoc/` | docs/new/navigation.md:159 |
| S8 Cài đặt → Sheet Giọng đọc | Giọng đọc | S8-02 Giọng đọc ([fe/src/pages/S8-cai-dat/spec.md:21](../../fe/src/pages/S8-cai-dat/spec.md)) | `fe/src/pages/S8-cai-dat/` | docs/new/navigation.md:161 |
| T1 Học → Sheet Giọng đọc | Cài đặt > Giọng đọc, khi thiết bị thiếu giọng | C1-05 Không có giọng đọc ([fe/src/components/C1-the-cau/spec.md:48](../../fe/src/components/C1-the-cau/spec.md)) | `fe/src/components/C1-the-cau/` | docs/new/navigation.md:163 |
| S8 Cài đặt → T1 kèm S9 Hướng dẫn | Xem lại hướng dẫn | S8-06 Trợ giúp ([fe/src/pages/S8-cai-dat/spec.md:47](../../fe/src/pages/S8-cai-dat/spec.md))<br>S9-05 Xem lại ([fe/src/pages/S9-huong-dan/spec.md:39](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S8-cai-dat/`<br>`fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:165 |

## 4.1 Chọn ngôn ngữ, bộ nội dung và hướng dẫn lần đầu

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «list item» Tiếng Anh → «window» S1 bước 2: Chọn bộ nội dung | Click | S1-04 Chọn ([fe/src/pages/S1-chon-ngon-ngu/spec.md:52](../../fe/src/pages/S1-chon-ngon-ngu/spec.md))<br>S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/` | docs/new/navigation.md:228 |
| «list item» Global English → «overlay» S9 Hướng dẫn trên T1 | Click | S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md))<br>S9-01 Khi nào hiện ([fe/src/pages/S9-huong-dan/spec.md:17](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/`<br>`fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:230 |
| «list item» English Fluency → «overlay» S9 Hướng dẫn trên T1 | Click | S1-07 Chọn bộ nội dung ([fe/src/pages/S1-chon-ngon-ngu/spec.md:64](../../fe/src/pages/S1-chon-ngon-ngu/spec.md))<br>S9-01 Khi nào hiện ([fe/src/pages/S9-huong-dan/spec.md:17](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/`<br>`fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:232 |
| «list item» Ngôn ngữ khác → «overlay» S9 Hướng dẫn trên T1 | Click | S1-04 Chọn ([fe/src/pages/S1-chon-ngon-ngu/spec.md:52](../../fe/src/pages/S1-chon-ngon-ngu/spec.md))<br>S9-01 Khi nào hiện ([fe/src/pages/S9-huong-dan/spec.md:17](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S1-chon-ngon-ngu/`<br>`fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:234 |
| «button» Bỏ qua → «window» T1 Học | Click | S9-03 Điều khiển ([fe/src/pages/S9-huong-dan/spec.md:31](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:236 |
| «button» Bắt đầu học → «window» S3 Phiên học | Click | S9-03 Điều khiển ([fe/src/pages/S9-huong-dan/spec.md:31](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:238 |

## 4.2 T1 Học và thanh tab

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «button» Tên ngôn ngữ ▾ → «sheet» Đổi ngôn ngữ hoặc bộ nội dung | Click | APP-02 Thanh trên cùng ([fe/src/app/spec.md:20](../../fe/src/app/spec.md))<br>APP-06 Sheet Đổi ngôn ngữ ([fe/src/app/spec.md:50](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:292 |
| «button» Cài đặt → «window» S8 Cài đặt | Click | APP-02 Thanh trên cùng ([fe/src/app/spec.md:20](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:294 |
| «button» Học 8 câu / Tiếp tục → «window» S3 Phiên học | Click | T1-02 Nút chính đổi chữ theo ngữ cảnh ([fe/src/pages/T1-hoc/spec.md:72](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:296 |
| «hyperlink» N câu cần ôn hôm nay → «window» S3 Phiên học | Click | T1-04 Câu cần ôn ([fe/src/pages/T1-hoc/spec.md:82](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:298 |
| «tab» Luyện tập → «window» T2 Luyện tập | Click | APP-01 Bốn khu chính ([fe/src/app/spec.md:16](../../fe/src/app/spec.md))<br>C5-01 Thanh dưới đáy ([fe/src/components/C5-thanh-tab/spec.md:15](../../fe/src/components/C5-thanh-tab/spec.md)) | `fe/src/app/`<br>`fe/src/components/C5-thanh-tab/` | docs/new/navigation.md:300 |
| «tab» Thư viện → «window» T3 Thư viện | Click | APP-01 Bốn khu chính ([fe/src/app/spec.md:16](../../fe/src/app/spec.md))<br>C5-01 Thanh dưới đáy ([fe/src/components/C5-thanh-tab/spec.md:15](../../fe/src/components/C5-thanh-tab/spec.md)) | `fe/src/app/`<br>`fe/src/components/C5-thanh-tab/` | docs/new/navigation.md:302 |
| «tab» Tiến độ → «window» T4 Tiến độ | Click | APP-01 Bốn khu chính ([fe/src/app/spec.md:16](../../fe/src/app/spec.md))<br>C5-01 Thanh dưới đáy ([fe/src/components/C5-thanh-tab/spec.md:15](../../fe/src/components/C5-thanh-tab/spec.md)) | `fe/src/app/`<br>`fe/src/components/C5-thanh-tab/` | docs/new/navigation.md:304 |
| «list item» Ngôn ngữ hoặc bộ khác → «window» T1 Học, ngôn ngữ hoặc bộ mới | Click | APP-06 Sheet Đổi ngôn ngữ ([fe/src/app/spec.md:50](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:306 |
| «button» Mở Luyện tập, khi học hết → «window» T2 Luyện tập | Click | T1-05 Học hết lộ trình ([fe/src/pages/T1-hoc/spec.md:86](../../fe/src/pages/T1-hoc/spec.md)) | `fe/src/pages/T1-hoc/` | docs/new/navigation.md:308 |
| «hyperlink» Cài đặt > Giọng đọc, khi thiếu giọng → «sheet» Giọng đọc | Click | C1-05 Không có giọng đọc ([fe/src/components/C1-the-cau/spec.md:48](../../fe/src/components/C1-the-cau/spec.md)) | `fe/src/components/C1-the-cau/` | docs/new/navigation.md:310 |

## 4.3 S3 Phiên học

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «button» Cần ôn lại → «window» S3b Kiểm tra | Click | S3-03 Bước ghi nhớ ([fe/src/pages/S3-phien-hoc/spec.md:104](../../fe/src/pages/S3-phien-hoc/spec.md))<br>C3-03 Cặp nút đánh giá ([fe/src/components/C3-nut/spec.md:21](../../fe/src/components/C3-nut/spec.md)) | `fe/src/pages/S3-phien-hoc/`<br>`fe/src/components/C3-nut/` | docs/new/navigation.md:359 |
| «button» Tôi nhớ → «window» S3b Kiểm tra | Click | S3-03 Bước ghi nhớ ([fe/src/pages/S3-phien-hoc/spec.md:104](../../fe/src/pages/S3-phien-hoc/spec.md))<br>C3-03 Cặp nút đánh giá ([fe/src/components/C3-nut/spec.md:21](../../fe/src/components/C3-nut/spec.md)) | `fe/src/pages/S3-phien-hoc/`<br>`fe/src/components/C3-nut/` | docs/new/navigation.md:361 |
| «button» Xem tổng kết, ở câu cuối → «window» S3c Tổng kết phiên | Click | S3-04 Bước kiểm tra ([fe/src/pages/S3-phien-hoc/spec.md:108](../../fe/src/pages/S3-phien-hoc/spec.md)) | `fe/src/pages/S3-phien-hoc/` | docs/new/navigation.md:363 |
| «button» Thoát → «sheet» Dừng phiên học? | Click | S3-07 Thoát giữa phiên ([fe/src/pages/S3-phien-hoc/spec.md:120](../../fe/src/pages/S3-phien-hoc/spec.md)) | `fe/src/pages/S3-phien-hoc/` | docs/new/navigation.md:365 |
| «button» Thoát → «sheet» Dừng phiên học? | Click | S3-07 Thoát giữa phiên ([fe/src/pages/S3-phien-hoc/spec.md:120](../../fe/src/pages/S3-phien-hoc/spec.md)) | `fe/src/pages/S3-phien-hoc/` | docs/new/navigation.md:367 |
| «button» Dừng → «window» Màn đã mở phiên | Click | S3-07 Thoát giữa phiên ([fe/src/pages/S3-phien-hoc/spec.md:120](../../fe/src/pages/S3-phien-hoc/spec.md)) | `fe/src/pages/S3-phien-hoc/` | docs/new/navigation.md:369 |
| «hyperlink» Xem tiến độ → «window» T4 Tiến độ | Click | S3-06 Tổng kết phiên ([fe/src/pages/S3-phien-hoc/spec.md:116](../../fe/src/pages/S3-phien-hoc/spec.md)) | `fe/src/pages/S3-phien-hoc/` | docs/new/navigation.md:371 |
| «hyperlink» Xong → «window» T1 Học | Click | S3-06 Tổng kết phiên ([fe/src/pages/S3-phien-hoc/spec.md:116](../../fe/src/pages/S3-phien-hoc/spec.md)) | `fe/src/pages/S3-phien-hoc/` | docs/new/navigation.md:373 |

## 4.4 T2 Luyện tập và S5 Kiểm tra nhanh

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «list item» Ôn tập hôm nay → «window» S3 Phiên học | Click | T2-02 Ôn tập hôm nay ([fe/src/pages/T2-luyen-tap/spec.md:45](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:421 |
| «list item» Học theo từ khóa → «sheet» Học theo từ khóa | Click | T2-03 Học theo từ khóa ([fe/src/pages/T2-luyen-tap/spec.md:49](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:423 |
| «button» Học 8 câu đầu → «window» S3 Phiên học | Click | T2-03 Học theo từ khóa ([fe/src/pages/T2-luyen-tap/spec.md:49](../../fe/src/pages/T2-luyen-tap/spec.md)) | `fe/src/pages/T2-luyen-tap/` | docs/new/navigation.md:425 |
| «list item» Kiểm tra nhanh → «window» S5 Bắt đầu kiểm tra | Click | T2-04 Kiểm tra nhanh ([fe/src/pages/T2-luyen-tap/spec.md:53](../../fe/src/pages/T2-luyen-tap/spec.md))<br>S5-01 Màn bắt đầu ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:33](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/T2-luyen-tap/`<br>`fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:427 |
| «button» Làm cả 3 bước → «window» S5 Đang kiểm tra | Click | S5-01 Màn bắt đầu ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:33](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:429 |
| «hyperlink» Chỉ làm một bước → «window» S5 Đang kiểm tra | Click | S5-01 Màn bắt đầu ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:33](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:431 |
| «button» Thoát → «sheet» Dừng kiểm tra? | Click | S5-08 Thoát giữa chừng ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:61](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:433 |
| «button» Dừng → «window» T2 Luyện tập | Click | S5-08 Thoát giữa chừng ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:61](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:435 |
| «button» Câu tiếp, ở câu cuối → «window» S5 Kết quả | Click | S5-07 Kết quả ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:57](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:437 |
| «hyperlink» Xong → «window» T2 Luyện tập | Click | S5-07 Kết quả ([fe/src/pages/S5-kiem-tra-nhanh/spec.md:57](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md)) | `fe/src/pages/S5-kiem-tra-nhanh/` | docs/new/navigation.md:439 |

## 4.5 T3 Thư viện

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «list item» Dòng unit (cách xem Unit) → «window» S10 Chi tiết Unit | Click | T3-09 Danh sách Unit ([fe/src/pages/T3-thu-vien/spec.md:109](../../fe/src/pages/T3-thu-vien/spec.md)) | `fe/src/pages/T3-thu-vien/` | docs/new/navigation.md:478 |
| «list item» Dòng câu (cách xem Câu) → «sheet» Chi tiết câu | Click | T3-05 Chi tiết câu ([fe/src/pages/T3-thu-vien/spec.md:93](../../fe/src/pages/T3-thu-vien/spec.md)) | `fe/src/pages/T3-thu-vien/` | docs/new/navigation.md:480 |
| «button» Học câu này → «window» S3 Phiên học | Click | T3-05 Chi tiết câu ([fe/src/pages/T3-thu-vien/spec.md:93](../../fe/src/pages/T3-thu-vien/spec.md)) | `fe/src/pages/T3-thu-vien/` | docs/new/navigation.md:482 |
| «button» Học unit này → «window» S3 Phiên học | Click | S10-04 Hành động ([fe/src/pages/S10-chi-tiet-unit/spec.md:55](../../fe/src/pages/S10-chi-tiet-unit/spec.md)) | `fe/src/pages/S10-chi-tiet-unit/` | docs/new/navigation.md:484 |
| «button» Kiểm tra nhanh unit này → «window» S5 Kiểm tra nhanh | Click | S10-04 Hành động ([fe/src/pages/S10-chi-tiet-unit/spec.md:55](../../fe/src/pages/S10-chi-tiet-unit/spec.md)) | `fe/src/pages/S10-chi-tiet-unit/` | docs/new/navigation.md:486 |
| «list item» Dòng câu → «sheet» Chi tiết câu | Click | S10-05 Danh sách câu ([fe/src/pages/S10-chi-tiet-unit/spec.md:59](../../fe/src/pages/S10-chi-tiet-unit/spec.md)) | `fe/src/pages/S10-chi-tiet-unit/` | docs/new/navigation.md:488 |
| «link» Thư viện → «window» T3 Thư viện | Click | S10-01 Route và khung ([fe/src/pages/S10-chi-tiet-unit/spec.md:43](../../fe/src/pages/S10-chi-tiet-unit/spec.md)) | `fe/src/pages/S10-chi-tiet-unit/` | docs/new/navigation.md:490 |

## 4.6 T4 Tiến độ

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «chart bar» Cột ngày → «sheet» Chi tiết ngày | Click | T4-07 Chi tiết ngày ([fe/src/pages/T4-tien-bo/spec.md:71](../../fe/src/pages/T4-tien-bo/spec.md)) | `fe/src/pages/T4-tien-bo/` | docs/new/navigation.md:519 |
| «button» Học 8 câu, khi chưa có phiên → «window» S3 Phiên học | Click | T4-08 Chưa có dữ liệu ([fe/src/pages/T4-tien-bo/spec.md:75](../../fe/src/pages/T4-tien-bo/spec.md)) | `fe/src/pages/T4-tien-bo/` | docs/new/navigation.md:521 |

## 4.7 S8 Cài đặt

| Mũi tên | Thao tác | Yêu cầu (bằng chứng) | Thư mục spec / code | Dòng sơ đồ |
|---|---|---|---|---|
| «button» Quay lại → «window» Màn trước đó | Click | APP-04 Bảng route ([fe/src/app/spec.md:28](../../fe/src/app/spec.md)) | `fe/src/app/` | docs/new/navigation.md:567 |
| «list item» Ngôn ngữ đang học → «sheet» Đổi ngôn ngữ hoặc bộ nội dung | Click | S8-01 Học tập ([fe/src/pages/S8-cai-dat/spec.md:17](../../fe/src/pages/S8-cai-dat/spec.md)) | `fe/src/pages/S8-cai-dat/` | docs/new/navigation.md:569 |
| «list item» Giọng đọc → «sheet» Giọng đọc | Click | S8-02 Giọng đọc ([fe/src/pages/S8-cai-dat/spec.md:21](../../fe/src/pages/S8-cai-dat/spec.md)) | `fe/src/pages/S8-cai-dat/` | docs/new/navigation.md:571 |
| «list item» Nhập tiến độ → «sheet» Xác nhận nhập tiến độ | Click, sau khi chọn file | S8-05 Tiến độ ([fe/src/pages/S8-cai-dat/spec.md:40](../../fe/src/pages/S8-cai-dat/spec.md)) | `fe/src/pages/S8-cai-dat/` | docs/new/navigation.md:573 |
| «list item» Xóa tiến độ → «sheet» Xác nhận xóa tiến độ | Click | S8-05 Tiến độ ([fe/src/pages/S8-cai-dat/spec.md:40](../../fe/src/pages/S8-cai-dat/spec.md)) | `fe/src/pages/S8-cai-dat/` | docs/new/navigation.md:575 |
| «button» Xóa → «window» T1 Học | Click, khi gõ đúng tên ngôn ngữ | S8-05 Tiến độ ([fe/src/pages/S8-cai-dat/spec.md:40](../../fe/src/pages/S8-cai-dat/spec.md)) | `fe/src/pages/S8-cai-dat/` | docs/new/navigation.md:577 |
| «hyperlink» Xem lại hướng dẫn → «overlay» S9 Hướng dẫn trên T1 | Click | S8-06 Trợ giúp ([fe/src/pages/S8-cai-dat/spec.md:47](../../fe/src/pages/S8-cai-dat/spec.md))<br>S9-05 Xem lại ([fe/src/pages/S9-huong-dan/spec.md:39](../../fe/src/pages/S9-huong-dan/spec.md)) | `fe/src/pages/S8-cai-dat/`<br>`fe/src/pages/S9-huong-dan/` | docs/new/navigation.md:579 |
