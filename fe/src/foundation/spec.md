---
id: FND
title: Nền tảng thiết kế
status: nháp
version: 0.1
---

# FND Nền tảng thiết kế

Token màu, chữ, khoảng cách, bo góc, icon, chuyển động, giọng văn, quy tắc tránh giao diện kiểu AI và trợ năng chung. Mọi thành phần và trang dùng các token ở đây; không viết giá trị màu hay cỡ chữ trực tiếp trong code thành phần.

## Hướng thẩm mỹ

Tên hướng: **Thẻ câu**. Mọi thứ trên màn hình phục vụ câu đang học. Câu đặt chữ lớn, rõ, nhiều khoảng trắng; nghĩa tiếng Việt dùng kiểu chữ khác hẳn để mắt tách được hai ngôn ngữ. Phần còn lại lùi về phía sau: nền phẳng, ít khung, ít màu. Điểm nhấn duy nhất là dải 8 ô (C2), khớp với mỗi unit 8 câu của dữ liệu. Màu lấy từ logo POMAS/VITASR hiện có (navy và đỏ cam).

## Yêu cầu

### FND-01 Token màu

| Token | Sáng | Tối | Dùng cho |
|---|---|---|---|
| `--ink` | `#0F1E3D` | `#E6EAF2` | Chữ chính, câu đang học |
| `--muted` | `#5A6683` | `#98A3BA` | Chữ phụ, nhãn |
| `--paper` | `#F4F6F9` | `#0D1424` | Nền trang |
| `--surface` | `#FFFFFF` | `#162039` | Thẻ câu, sheet |
| `--line` | `#DCE1EA` | `#28324D` | Đường kẻ, viền ô nhập |
| `--brand` | `#C9301A` | `#FF6A4D` | Nút chính, ô đang học trong dải 8 ô |
| `--on-brand` | `#FFFFFF` | `#0D1424` | Chữ trên nút chính |
| `--known` | `#1E7A4C` | `#5CCB8F` | "Đã nhớ", trả lời đúng |
| `--review` | `#A35F00` | `#F0B54A` | "Cần ôn" |
| `--wrong` | `#C8102E` | `#FF8A8A` | Trả lời chưa đúng: viền, icon và chữ báo (C4-02, S5-05) |
| `--wrong-soft` | `#FBECEE` | `#3A1E27` | Nền của lựa chọn hoặc cụm trả lời chưa đúng |
| `--scrim` | `--ink` độ mờ 40% | đen độ mờ 60% | Lớp nền sau sheet và hướng dẫn (C6-01, S9-02) |

Code thành phần và trang chỉ dùng các token này. Không có gradient.

### FND-02 Quy tắc dùng màu

`--brand` chỉ dùng cho tối đa một nút chính trên mỗi màn và cho ô đang học của dải 8 ô; không dùng làm nền khối lớn. Ngoại lệ: cột hôm nay của biểu đồ T4-04. Trả lời sai dùng đỏ `--wrong` (viền, icon dấu x, chữ "Chưa đúng") trên nền nhạt `--wrong-soft` để người học thấy ngay; `--wrong` là đỏ thuần, khác `--brand` đỏ cam, và chỉ dùng cho trả lời chưa đúng. Trạng thái "Cần ôn" vẫn dùng `--review`. Mọi cặp chữ/nền đạt tương phản tối thiểu 4.5:1, chữ lớn từ 24 px tối thiểu 3:1.

### FND-03 Sáng và tối

Mặc định theo cài đặt hệ thống (`prefers-color-scheme`). Người dùng ghi đè được trong S8 (Theo thiết bị, Sáng, Tối); lựa chọn được lưu và áp dụng ngay khi mở app, không nhấp nháy giao diện sai trước khi áp dụng.

### FND-04 Font

| Vai trò | Font |
|---|---|
| Giao diện và câu ngôn ngữ đích (chữ Latinh) | Lexend, dự phòng `system-ui, sans-serif` |
| Nghĩa tiếng Việt | Literata, dự phòng `Georgia, serif` |
| Câu ngôn ngữ đích mà Lexend không hỗ trợ | `ja` Noto Sans JP, `zh` Noto Sans SC, `ko` Noto Sans KR, `th` Noto Sans Thai, `lo` Noto Sans Lao, `hi` Noto Sans Devanagari, `ta` Noto Sans Tamil, `ru` Noto Sans (bảng chữ Kirin; Lexend chỉ có Latinh và tiếng Việt) |

Font được tự host trong bản build (QD-05). Font Noto chỉ tải khi ngôn ngữ đang học cần đến. Dấu tiếng Việt hiển thị đúng, không chồng dấu, ở mọi cỡ trong FND-05.

### FND-05 Thang chữ

| Token | Cỡ / dòng (px) | Dùng cho |
|---|---|---|
| `--t-sm` | 14 / 20 | Mô tả, chú thích, số thứ tự câu |
| `--t-body` | 16 / 26 | Nội dung giao diện |
| `--t-lg` | 20 / 30 | Tiêu đề khối, tiêu đề sheet, nghĩa trên thẻ |
| `--t-xl` | 25 / 34 | Tiêu đề màn, câu dài trên thẻ |
| `--t-2xl` | 31 / 42 | Câu ngắn trên thẻ |
| `--t-3xl` | 39 / 48 | Số liệu lớn ở tổng kết (chỉ một chỗ mỗi màn) |

Không dùng cỡ chữ ngoài thang này. Khoảng dòng của chữ cỡ `--t-sm` đến `--t-lg` từ 1,4 lần cỡ chữ trở lên, để dấu tiếng Việt chồng hai tầng ("ễ", "ộ") không chạm dòng trên; chữ từ `--t-xl` trở lên (tiêu đề màn, câu trên thẻ, số liệu lớn) từ 1,2 lần. Chữ từ `--t-xl` trở lên giãn chữ -0,01em vì Lexend rộng và trông thưa ở cỡ lớn; chữ nhỏ hơn giữ giãn chữ mặc định.

### FND-06 Cỡ câu theo độ dài

Câu ngôn ngữ đích trên thẻ câu chọn cỡ theo số ký tự: dưới 40 dùng `--t-2xl`; 40 đến 90 dùng `--t-xl`; trên 90 dùng `--t-lg`. Câu luôn căn trái.

### FND-07 Khoảng cách và lề

Lưới 4 px; chỉ dùng các giá trị 4, 8, 12, 16, 24, 32, 48. Lề hai bên 16 px dưới 600 px, 24 px từ 600 px.

Nhịp dọc dùng chung cho mọi màn:

| Khoảng giữa | Dưới 600 px | Từ 600 px |
|---|---|---|
| Tiêu đề màn và nội dung đầu tiên | 24 | 32 |
| Các khối lớn trong một màn | 32 | 48 |
| Tiêu đề khối và nội dung của khối | 12 | 12 |
| Các dòng cùng nhóm (tên mục và mô tả, tên unit và tên bài) | 4 | 4 |
| Lề trong thẻ câu | 16 | 24 |

Dòng chạm được trong danh sách có lề trên và dưới 12 px, cao tối thiểu 44 px (FND-14).

### FND-08 Bo góc theo vai trò

Ô nhập và chip 6 px; nút thường 10 px; thẻ câu và sheet 16 px; nút nghe tròn hẳn. Không dùng một giá trị bo góc chung cho mọi thứ.

### FND-09 Đổ bóng

Chỉ sheet đang mở và hộp thoại có đổ bóng. Thẻ câu tách khỏi nền bằng màu `--surface`, không có bóng.

### FND-10 Icon

Một bộ icon duy nhất (Phosphor, nét Regular, cỡ 24; QD-04). Không dùng emoji, không dùng ảnh bitmap làm icon.

### FND-11 Chuyển động

Chuyển động chỉ để phản hồi thao tác: hiện câu gốc 180 ms, ô trong dải 8 ô đổi màu 150 ms, sheet trượt lên 220 ms, thông báo ngắn hiện 150 ms. Không có hiệu ứng xuất hiện khi tải trang hay khi cuộn. Khi `prefers-reduced-motion: reduce`, tắt mọi chuyển động, thay đổi trạng thái tức thì.

### FND-12 Giọng văn và từ ngữ

Tiếng Việt, câu ngắn, viết hoa chữ đầu câu, gọi người học là "bạn". Nút nói đúng việc sẽ xảy ra và giữ cùng tên trong cả luồng. Lỗi nói rõ chuyện gì xảy ra và cần làm gì, không xin lỗi, không mơ hồ. Tên ngôn ngữ đứng giữa câu viết thường chữ đầu ("Thiết bị chưa có giọng tiếng Anh"); đứng một mình như nhãn, tiêu đề, lựa chọn thì giữ "Tiếng Anh". Hướng dẫn thao tác dùng "nhấn" (đúng cho cả chuột lẫn màn cảm ứng), không dùng "chạm" hay "bấm". Dùng thống nhất:

| Dùng | Không dùng |
|---|---|
| Câu | File, dữ liệu, record |
| Câu gốc | Text, original |
| Nghĩa | Bản dịch, translation |
| Cách dùng | Note, ghi chú 2 |
| Cần ôn lại | Sai, chưa thuộc |
| Phiên học | Session, lesson |
| Tiến độ (tên khu T4) | Tiến bộ |
| Kiểm tra nhanh | TEST NOW, Test3 |

### FND-13 Quy tắc tránh giao diện kiểu AI

Không gradient, không hiệu ứng kính mờ (`backdrop-filter` làm nền), không họa tiết trang trí. Không lưới thẻ giống hệt nhau; nhóm thông tin bằng khoảng trắng và đường phân cách trước, khung sau. Không emoji. Không viết hoa toàn bộ cho nhãn và nút. Không căn giữa đoạn văn bản dài. Không câu khẩu hiệu cổ vũ chung chung; thay bằng số liệu cụ thể của người học. Mỗi màn tối đa một nút chính.

### FND-14 Trợ năng chung

Mọi thao tác làm được bằng bàn phím; viền focus 2 px `--brand`, cách phần tử 2 px, chỉ hiện khi dùng bàn phím (`:focus-visible`). Vùng chạm tối thiểu 44 x 44 px; ngoại lệ là liên kết nằm trong dòng chữ (C1-05) và cột biểu đồ 30 ngày trên màn hẹp (T4-04). Phần tử chứa câu ngôn ngữ đích có `lang` đúng mã ngôn ngữ; nghĩa có `lang="vi"`. Màu không bao giờ là tín hiệu duy nhất. Phóng chữ 200% không làm mất nội dung hay chức năng.

### FND-15 Thứ bậc chữ

Mỗi vai trò chữ chỉ có một kiểu trên mọi màn:

| Vai trò | Cỡ | Độ đậm | Màu |
|---|---|---|---|
| Tiêu đề màn | `--t-xl` | 600 | `--ink` |
| Tiêu đề khối, tiêu đề sheet | `--t-lg` | 600 | `--ink` |
| Tên mục trong danh sách, nhãn chính, số liệu trong dòng | `--t-body` | 600 | `--ink` |
| Nội dung | `--t-body` | 400 | `--ink` |
| Mô tả, chú thích, số thứ tự | `--t-sm` | 400 | `--muted` |
| Số liệu lớn | `--t-3xl` (một chỗ mỗi màn) hoặc `--t-xl` | 600 | `--ink` |

Chỉ dùng hai độ đậm 400 và 600. Nhấn mạnh bằng cỡ và độ đậm, không bằng màu; màu dành cho trạng thái (FND-02). Tiêu đề khối không viết hoa, không giãn chữ (FND-13). Mỗi màn có đúng một tiêu đề màn (`h1`); màn mà spec trang không vẽ tiêu đề thì tiêu đề màn ẩn khỏi khung hình nhưng trình đọc màn hình vẫn đọc được. Câu ngôn ngữ đích và nghĩa trên thẻ theo C1 và FND-06, không theo bảng này.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.3 (08/10/2026): cập nhật theo bộ dữ liệu khách gửi và câu trả lời của nhóm (ưu tiên web, responsive; đủ 15 ngôn ngữ; không đọc tiến độ bản cũ).
- 0.4 (10/10/2026): FND-01 thêm token `--scrim`; FND-02 ghi ngoại lệ cột hôm nay của T4; FND-03 dùng "Theo thiết bị" như S8-04; FND-14 ghi hai ngoại lệ vùng chạm (Claude quyết định theo ủy quyền của nhóm).
- 0.5 (18/10/2026): FND-01 thêm token `--wrong`, `--wrong-soft`; FND-02 đổi màu trả lời sai sang đỏ; FND-12 thêm quy tắc viết tên ngôn ngữ giữa câu, dùng "nhấn", tên khu T4 là "Tiến độ" (theo phản hồi người dùng do nhóm chuyển).
- 0.6 (20/10/2026): Đợt 5 việc 2: FND-05 nâng `--t-sm` lên 14 px, nới khoảng dòng, giãn chữ âm cho chữ lớn; FND-07 thêm nhịp dọc; thêm FND-15 thứ bậc chữ (theo rà soát `docs/theo-doi/ra-soat-ui-dot5.md`). Sửa câu khoảng dòng cho khớp bảng: 1,4 lần cho `--t-sm` đến `--t-lg`, 1,2 lần từ `--t-xl` (bản đầu ghi 1,5 cho mọi chữ giao diện, mâu thuẫn với `--t-sm` 14/20 và tiêu đề màn 25/34, phát hiện khi đo FND-AC19).
