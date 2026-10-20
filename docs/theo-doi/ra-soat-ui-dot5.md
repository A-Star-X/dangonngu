# Rà soát chữ, khoảng cách và UI trước Đợt 5 (việc 2 và 7)

Ngày rà: 20/10/2026, bản `main` sau Đợt 4 (commit `961ee5f`). Người rà: Claude.

Cách rà: chụp 8 màn (S1, T1, T2, T3, T4 khoảng 30 ngày, S8, S3 bước ghi nhớ, S5 màn bắt đầu) ở 1440 và 375 px, giao diện sáng, tiến độ mẫu 30 ngày. Trên mỗi màn, một script đọc cỡ chữ, khoảng dòng, độ đậm thực tế của mọi phần tử có chữ, và mọi khoảng cách (margin, padding, gap) để đối chiếu với FND-05, FND-07. Ảnh và số đo: `docs/evidence/ra-soat-dot5/truoc/` (`do-dac.json`).

## 1. Kết luận chính

Code đang đúng spec: **không phần tử nào dùng cỡ chữ ngoài thang FND-05**, không có cuộn ngang. Khoảng cách lệch lưới chỉ có ở bảng số liệu ẩn dành cho trình đọc màn hình (T4) và phần chừa chỗ cho thanh tab (88 px), đều không thấy được.

Cảm giác "chữ sát, thiếu thứ bậc, rối mắt" đến từ chính cách spec chia cấp chữ, không phải từ code làm sai. Vì vậy việc 2 phải sửa spec FND trước, rồi code theo.

## 2. Vấn đề tìm thấy

| # | Vấn đề | Ở đâu | Bằng chứng |
|---|---|---|---|
| 1 | Cùng là tiêu đề màn nhưng hai cỡ: S1 dùng `--t-xl` (25 px), T2, T4, S8, tổng kết S3 và S5 dùng `--t-lg` (20 px) | S1, T2, T4, S8, S3c, S5 | `<h1>` trong mã các màn |
| 2 | T1 và T3 không có tiêu đề màn (`<h1>`), người dùng trình đọc màn hình không biết đang ở đâu, thứ bậc màn bắt đầu thẳng từ nội dung | T1, T3 | Ảnh `T1-1440.png`, `T3-1440.png` |
| 3 | Tiêu đề khối (cấp 2) có ba kiểu: 13 px màu mờ có giãn chữ (S8), 16 px đậm (T4), 20 px (sheet, chi tiết câu ở T3) | S8, T4, T3, C6 | `<h2>` trong mã |
| 4 | Tiêu đề màn 20 px chỉ hơn nội dung 16 px bốn điểm, nên tiêu đề "Luyện tập", "Tiến độ" chìm giữa các dòng đậm 16 px bên dưới | T2, T4 | `T2-1440.png`, `T4-1440.png` |
| 5 | Tiêu đề khối ở T4 ("Số câu đã học mỗi ngày", "Lịch ôn tập") cùng cỡ và cùng độ đậm với số liệu trong dòng ("21 câu") | T4 | `T4-1440.png` |
| 6 | Chữ 13 px dùng cho nội dung cần đọc, không chỉ chú thích: nghĩa tiếng Việt trong danh sách T3 (69 chỗ mỗi trang), mô tả của các mục T2, nhãn bộ lọc, "Trang 1/128". Literata 13 px màu mờ trên nền sáng khó đọc ở máy tính | T3, T2 | `T3-1440.png` |
| 7 | Khoảng dòng nội dung 24/16 = 1,5 vừa đủ cho chữ Latinh; tiếng Việt có dấu chồng hai tầng ("hiện", "ỗ") nên dòng trông sát khi đoạn xuống hai dòng | Mô tả T2, thông báo | `T2-375.png` |
| 8 | Câu lớn trên thẻ 31/38 (1,23) khi xuống hai dòng thì hai dòng gần như chạm nhau | T1 ở 375 px, S3 | `T1-375.png` ("rather wait a little / longer") |
| 9 | Phần đầu thẻ câu ở T1 xếp bốn dòng sát nhau (Unit 4, tên unit, dịch tên unit, đường kẻ) với khoảng 4 đến 8 px, nhìn như một khối chữ nhỏ | T1 | `T1-1440.png` |
| 10 | Khoảng giữa các khối do từng màn tự đặt, không có quy tắc chung: T4 cách 32 px, T2 cách 16 px nên tiêu đề "Luyện tập" sát danh sách; trong khối T4 thì tiêu đề cách nội dung 12 px | T2, T4 | `t2.css`, `t4.css`; `T2-1440.png` |
| 11 | Số trên nhãn "Luyện tập" (21) đè lên icon và sát chữ ở thanh dọc trái | C5, 1440 px | `T1-1440.png` |
| 12 | Ở máy tính, nội dung dồn về một khối hẹp bên trái, bên phải trống lớn | T1, T2, T4 | Thuộc việc 1 và 6 (bố cục), không sửa trong việc 2 |

## 3. Giữ, sửa, thay

| Thành phần | Quyết định | Lý do |
|---|---|---|
| Màu (FND-01, FND-02) | Giữ | Tương phản đã đạt (FND-AC02); không thấy vấn đề màu trong ảnh |
| Font Lexend và Literata (FND-04) | Giữ | Tách được câu gốc và nghĩa; vấn đề là cỡ và khoảng dòng, không phải font |
| Thang chữ (FND-05) | Sửa | Nâng cỡ nhỏ nhất, nới khoảng dòng (vấn đề 6, 7, 8) |
| Thứ bậc chữ | Thêm yêu cầu mới | Hiện không có quy định vai trò nào dùng cỡ nào (vấn đề 1 đến 5) |
| Khoảng cách (FND-07) | Sửa | Thêm nhịp dọc: khoảng giữa khối, giữa tiêu đề và nội dung (vấn đề 9, 10) |
| Nút (C3) | Giữ | Cùng cỡ, cùng bo góc ở mọi màn |
| Thẻ câu (C1) | Giữ cấu trúc, sửa khoảng cách phần đầu thẻ | Vấn đề 9 |
| Icon Phosphor (FND-10) | Giữ | Cùng bộ, cùng nét (FND-AC09) |
| Số trên thanh điều hướng (C5) | Sửa vị trí | Vấn đề 11 |
| Bố cục máy tính trống | Chuyển sang việc 1, 3, 6 | Đổi bố cục là việc của spec trang |

Đề xuất sửa spec cụ thể: bản nháp trong `fe/src/foundation/spec.md` (FND-05, FND-07, FND-15 mới) và `fe/src/pages/T2-luyen-tap/spec.md` (T2-01), chờ nhóm duyệt.
