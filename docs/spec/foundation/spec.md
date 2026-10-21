---
id: FND
title: Nền tảng thiết kế
status: nháp
version: 1.1
---

# FND Nền tảng thiết kế

Token màu, chữ, khoảng cách, bo góc, icon, chuyển động, giọng văn, quy tắc tránh giao diện kiểu AI và trợ năng chung. Mọi thành phần và trang dùng các token ở đây; không viết giá trị màu hay cỡ chữ trực tiếp trong code thành phần. Từ Đợt 6 token theo rule giao diện của nhóm (Tailwind 4): bảng màu ở `src/styles/theme.css`, class chữ ngữ nghĩa ở `src/styles/typography.css`.

## Hướng thẩm mỹ

Tên hướng: **Thẻ câu**. Mọi thứ trên màn hình phục vụ câu đang học. Câu đặt chữ lớn, rõ, nhiều khoảng trắng; nghĩa tiếng Việt dùng kiểu chữ khác hẳn để mắt tách được hai ngôn ngữ. Phần còn lại lùi về phía sau: nền phẳng, ít khung, ít màu. Điểm nhấn duy nhất là dải 8 ô (C2), khớp với mỗi unit 8 câu của dữ liệu. Màu lấy từ logo POMAS/VITASR hiện có (navy và đỏ cam).

## Yêu cầu

### FND-01 Token màu

Bảng màu nằm duy nhất ở `src/styles/theme.css` (`:root` cho sáng, `.dark` cho tối) và được ánh xạ thành class Tailwind (`bg-background`, `text-primary`...). View chỉ dùng class token, không viết mã màu.

| Token | Sáng | Tối | Dùng cho (tên cũ) |
|---|---|---|---|
| `foreground` | `#0F1E3D` | `#E6EAF2` | Chữ chính, câu đang học (`--ink`) |
| `muted-foreground` | `#556079` | `#A3ADC2` | Chữ phụ, nhãn, mô tả (`--muted`) |
| `background` | `#F4F6F9` | `#0D1424` | Nền trang (`--paper`) |
| `card` | `#FFFFFF` | `#162039` | Thẻ câu, panel, sheet (`--surface`) |
| `muted` | `#E9EDF3` | `#1F2A45` | Nền phụ: nút ghost, ô hover, khối che câu gốc |
| `border` | `#DCE1EA` | `#28324D` | Đường kẻ, viền ô nhập (`--line`) |
| `primary` / `primary-foreground` | `#C9301A` / trắng | `#FF6A4D` / `#0D1424` | Nút chính, ô đang học trong dải 8 ô, viền focus (`--brand`, `--on-brand`) |
| `sidebar`, `sidebar-accent` | trắng, `#FBE9E5` | `#111A2E`, `#3A1E1E` | Thanh bên, nền mục đang chọn (C5) |
| `success` | `#1E7A4C` | `#5CCB8F` | "Đã nhớ", trả lời đúng (`--known`) |
| `warning` / `warning-soft` | `#A35F00` / `#FCF4E6` | `#F0B54A` / `#33280F` | "Cần ôn" (`--review`) |
| `danger` / `danger-soft` | `#C8102E` / `#FBECEE` | `#FF8A8A` / `#3A1E27` | Trả lời chưa đúng: viền, icon và chữ báo; nền nhạt (`--wrong`, `--wrong-soft`); lỗi nhập ở ô; nút và dòng xóa |
| `danger-foreground` | trắng | `#0D1424` | Chữ trên nút xóa nền `danger` |
| `info` / `info-soft` | `#2457A6` / `#E7EEFA` | `#8DB4F0` / `#1B2A4A` | Thông tin, dải ngoại tuyến |
| `scrim` | `foreground` độ mờ 40% | đen độ mờ 60% | Lớp nền sau sheet, menu trượt và hướng dẫn |

Màu Badge trạng thái lấy từ `statusBadgeClass` (`src/utils/status-badge-colors.ts`); trạng thái học của câu ánh xạ tone ở `src/domain/status-tone.ts`. Không có gradient.

### FND-02 Quy tắc dùng màu

`primary` chỉ dùng cho tối đa một nút chính trên mỗi màn và cho ô đang học của dải 8 ô; không dùng làm nền khối lớn. Ngoại lệ: cột hôm nay của biểu đồ T4-04. Trả lời sai dùng đỏ `danger` (viền, icon dấu x, chữ "Chưa đúng") trên nền nhạt `danger-soft` để người học thấy ngay; `danger` là đỏ thuần, khác `primary` đỏ cam, và chỉ dùng cho trả lời chưa đúng, lỗi nhập ở ô (AU-03, S8-05) và hành động xóa (nút xóa nền `danger`, chữ `danger-foreground`). Trạng thái "Cần ôn" dùng `warning`. Ngoại lệ thêm của Đợt 6: nền accent (`sidebar-accent`) cho mục đang chọn (thanh bên, nút chọn cách xem và khoảng, dòng đang xem ở T3), ô icon tính năng và số thứ tự ba bước (T2, Landing), khối lời mời cuối Landing; icon nhỏ màu `primary` trên nền đó; viền `primary` nhạt quanh dòng Tiếng Anh ở S1 (S1-01); dấu tích màu `primary` của lựa chọn đang chọn (C8, sheet Đổi ngôn ngữ) và của danh sách ý ở trang đăng nhập, đăng ký. Lớp hướng dẫn S9 không có nút nền `primary`: nút chính của màn là nút đang được làm nổi bên dưới. Mọi cặp chữ/nền đạt tương phản tối thiểu 4.5:1, chữ lớn từ 24 px tối thiểu 3:1.

### FND-03 Sáng và tối

Sáng và tối qua class `.dark` trên thẻ `html`. Mặc định theo cài đặt hệ thống (`prefers-color-scheme`). Người dùng ghi đè được trong S8 (Theo thiết bị, Sáng, Tối) và bằng nút sáng tối trên header (C5-05, LP-01); lựa chọn lưu riêng ở `vitasr2.theme` (không thuộc tài khoản, dùng được cả ở trang công khai), áp dụng ngay khi mở trang bằng đoạn mã chạy trước khi vẽ nội dung, không nhấp nháy giao diện sai.

### FND-04 Font

| Vai trò | Font |
|---|---|
| Giao diện và câu ngôn ngữ đích (chữ Latinh) | Lexend, dự phòng `system-ui, sans-serif` |
| Nghĩa tiếng Việt | Literata, dự phòng `Georgia, serif` |
| Câu ngôn ngữ đích mà Lexend không hỗ trợ | `ja` Noto Sans JP, `zh` Noto Sans SC, `ko` Noto Sans KR, `th` Noto Sans Thai, `lo` Noto Sans Lao, `hi` Noto Sans Devanagari, `ta` Noto Sans Tamil, `ru` Noto Sans (bảng chữ Kirin; Lexend chỉ có Latinh và tiếng Việt) |

Font được tự host trong bản build (QD-05): Lexend và Literata nạp ở layout gốc từ `@fontsource`; font Noto được chép vào `public/fonts` lúc build (`scripts/copy-fonts.mjs`) và chỉ tải khi ngôn ngữ đang học cần đến. Dấu tiếng Việt hiển thị đúng, không chồng dấu, ở mọi cỡ trong FND-05.

### FND-05 Thang chữ

Thang chữ theo rule giao diện của nhóm, cỡ bằng px:

| Token Tailwind | Cỡ / dòng (px) | Dùng cho |
|---|---|---|
| `text-xs` | 12 / 16 | Nhãn nhóm trên thanh bên (chữ hoa), chữ phụ rất nhỏ |
| `text-sm` | 14 / 20 | Mô tả, chú thích, nút, nhãn |
| `text-base` | 16 / 26 | Nội dung giao diện |
| `text-lg` | 18 / 28 | Nghĩa trên thẻ câu |
| `text-xl` | 20 / 30 | Tiêu đề khối lớn, câu dài trên thẻ |
| `text-2xl` | 24 / 32 | Tiêu đề màn (`h1`), câu vừa trên thẻ, số liệu |
| `text-display-lg` | 32 / 40 | Ngoại lệ có chủ ý: câu ngắn trên thẻ (FND-06) và số liệu lớn ở tổng kết S3 |

Class ngữ nghĩa: `text-data` 16 px (nội dung bảng, giá trị), `text-label` 14 px đậm 500 (nhãn), `text-description` 14 px màu muted (mô tả, tiêu đề section). Không dùng cỡ chữ ngoài thang này. Khoảng dòng từ 1,3 lần cỡ chữ trở lên để dấu tiếng Việt chồng hai tầng ("ễ", "ộ") không chạm dòng trên; riêng `text-display-lg` (32/40, 1,25 lần) dùng cho câu ngắn một hai dòng, đã kiểm dấu không chạm (FND-AC05).

### FND-06 Cỡ câu theo độ dài

Câu ngôn ngữ đích trên thẻ câu chọn cỡ theo số ký tự: dưới 40 dùng `text-display-lg` (32 px); 40 đến 90 dùng `text-2xl` (24 px); trên 90 dùng `text-xl` (20 px). Câu luôn căn trái.

### FND-07 Khoảng cách và lề

Lưới 4 px. Khung khu học (C5-06): nội dung `px-4 py-6`, các khối cách nhau 16 px; panel (`CardCustom`) lề trong 16 px, thẻ câu 16 px dưới `sm` và 24 px từ `sm`. Trang công khai `px-4 py-6`, các phần lớn của Landing cách nhau 64 px.

| Khoảng giữa | Giá trị |
|---|---|
| Tiêu đề màn và nội dung đầu tiên | 16 px (khoảng chung giữa các khối) |
| Tiêu đề section (`h2`) và nội dung của section | 12 px |
| Các dòng cùng nhóm (tên mục và mô tả) | 4 px |

Dòng chạm được trong danh sách cao tối thiểu 44 px (FND-14).

### FND-08 Bo góc theo vai trò

Theo rule giao diện: nút (`rounded-button`) 8 px; thẻ, panel, sheet (`rounded-card`) 8 px; ô nhập, ô chọn (C8), chip, mục thanh bên (`rounded-dropdown`) 6 px. Ngoại lệ: nút nghe, nhãn số và chấm bước tròn hẳn.

### FND-09 Đổ bóng

Chỉ sheet đang mở, hộp thoại (kể cả bong bóng hướng dẫn S9), danh sách đang mở của ô chọn (C8) và khung ảnh chụp app ở Landing (LP-01) có đổ bóng. Thẻ câu tách khỏi nền bằng màu `card`, không có bóng.

### FND-10 Icon

Một bộ icon duy nhất: `lucide-react` (QD-04), cỡ 16 px trên thanh bên và trong nút nhỏ, 20 px trong nút và dòng. Không dùng emoji, không dùng ảnh bitmap làm icon.

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

Không gradient, không hiệu ứng kính mờ làm nền khối (ngoại lệ theo rule giao diện: header cố định có nền gần đặc làm mờ phía sau), không họa tiết trang trí. Lưới thẻ chỉ dùng khi mỗi thẻ mang nội dung riêng (unit, tính năng); nhóm thông tin bằng khoảng trắng và đường phân cách trước, khung sau. Không emoji. Không viết hoa toàn bộ cho nhãn và nút (ngoại lệ theo rule: nhãn nhóm trên thanh bên chữ hoa 12 px). Không căn giữa đoạn văn bản dài. Không câu khẩu hiệu cổ vũ chung chung; thay bằng số liệu cụ thể của người học. Mỗi màn tối đa một nút chính.

### FND-14 Trợ năng chung

Mọi thao tác làm được bằng bàn phím; viền focus 2 px màu `ring` (primary), cách phần tử 2 px, chỉ hiện khi dùng bàn phím (`:focus-visible`). Vùng chạm khoảng 40 đến 44 px (rule giao diện): nút, ô nhập, dòng chạm được từ 44 px; mục thanh bên từ 40 px; ngoại lệ là liên kết nằm trong dòng chữ (C1-05), cột biểu đồ 30 ngày trên màn hẹp (T4-04), và ô 36 px trên header (nút sáng tối, chọn ngôn ngữ giao diện, C5-05) theo rule giao diện. Phần tử chứa câu ngôn ngữ đích có `lang` đúng mã ngôn ngữ; nghĩa có `lang="vi"`. Màu không bao giờ là tín hiệu duy nhất. Phóng chữ 200% không làm mất nội dung hay chức năng.

### FND-15 Thứ bậc chữ

Mỗi vai trò chữ chỉ có một kiểu trên mọi màn (rule giao diện: `PageHeader`, tiêu đề section):

| Vai trò | Kiểu |
|---|---|
| Tiêu đề màn (`h1`, `PageHeader`) | 24 px, đậm 700, `foreground`; mô tả tùy chọn bằng `text-description` |
| Tiêu đề section (`h2`) | `text-description` (14 px, `muted-foreground`), đậm 500 |
| Tên mục trong danh sách, tiêu đề thẻ, số liệu trong dòng | 16 px, đậm 600 |
| Nhãn ô nhập, nhãn nhóm | `text-label` (14 px, đậm 500) |
| Nội dung | 16 px, đậm 400 |
| Mô tả, chú thích, số thứ tự | 14 px, `muted-foreground` |
| Số liệu lớn | `text-2xl` đậm 700 (T4), `text-display-lg` (tổng kết S3) |

Nhấn mạnh bằng cỡ và độ đậm, không bằng màu; màu dành cho trạng thái (FND-02). Mỗi màn có đúng một tiêu đề màn (`h1`); màn mà spec trang không vẽ tiêu đề thì tiêu đề màn ẩn khỏi khung hình nhưng trình đọc màn hình vẫn đọc được. Câu ngôn ngữ đích và nghĩa trên thẻ theo C1 và FND-06, không theo bảng này.

### FND-16 Ô tìm kiếm chờ ngừng gõ

Mọi ô tìm kiếm cập nhật chữ trong ô ngay khi gõ, nhưng chỉ giá trị đã chờ ngừng gõ mới đi vào bộ lọc hay truy vấn (`useDebouncedValue`, `src/hooks/use-debounced-value.ts`). Thời gian chờ mặc định 3000 ms theo rule chung; ô tìm câu ở T3 và ô từ khóa ở T2 dùng 300 ms để kết quả theo kịp lúc gõ (ngoại lệ có chủ ý, ghi ở T2-03, T3-02). Nút hành động dựa trên kết quả tìm (ví dụ "Học 8 câu đầu" ở T2) khóa cho tới khi hết thời gian chờ, để không chạy theo từ khóa cũ.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.3 (08/10/2026): cập nhật theo bộ dữ liệu khách gửi và câu trả lời của nhóm (ưu tiên web, responsive; đủ 15 ngôn ngữ; không đọc tiến độ bản cũ).
- 0.4 (10/10/2026): FND-01 thêm token `--scrim`; FND-02 ghi ngoại lệ cột hôm nay của T4; FND-03 dùng "Theo thiết bị" như S8-04; FND-14 ghi hai ngoại lệ vùng chạm (Claude quyết định theo ủy quyền của nhóm).
- 0.5 (18/10/2026): FND-01 thêm token `--wrong`, `--wrong-soft`; FND-02 đổi màu trả lời sai sang đỏ; FND-12 thêm quy tắc viết tên ngôn ngữ giữa câu, dùng "nhấn", tên khu T4 là "Tiến độ" (theo phản hồi người dùng do nhóm chuyển).
- 0.6 (20/10/2026): Đợt 5 việc 2: FND-05 nâng `--t-sm` lên 14 px, nới khoảng dòng, giãn chữ âm cho chữ lớn; FND-07 thêm nhịp dọc; thêm FND-15 thứ bậc chữ (theo rà soát `docs/theo-doi/ra-soat-ui-dot5.md`). Sửa câu khoảng dòng cho khớp bảng: 1,4 lần cho `--t-sm` đến `--t-lg`, 1,2 lần từ `--t-xl` (bản đầu ghi 1,5 cho mọi chữ giao diện, mâu thuẫn với `--t-sm` 14/20 và tiêu đề màn 25/34, phát hiện khi đo FND-AC19).
- 1.0 (21/10/2026): Đợt 6, theo rule giao diện của nhóm: token Tailwind trong `src/styles/theme.css` (FND-01), thang chữ 12 đến 24 px với một cỡ hiển thị 32 px (FND-05, FND-06), bo góc 8/8/6 px (FND-08), icon lucide (FND-10), nhịp khoảng cách theo khung C5 (FND-07), vùng chạm 40 đến 44 px và ô 36 px trên header (FND-14), thứ bậc chữ theo PageHeader (FND-15); thêm FND-16 ô tìm kiếm chờ ngừng gõ. FND-09 ghi thêm các chỗ có bóng (danh sách ô chọn, bong bóng S9, ảnh chụp ở Landing) cho khớp FND-AC08. FND-01 `warning-soft` sáng đổi `#FBF1E1` thành `#FCF4E6` để chữ `warning` trên nền này đạt 4.5:1 (FND-AC02).
- 1.1 (21/10/2026): theo rà soát ảnh bằng chứng Đợt 6: FND-02 liệt kê đủ chỗ dùng nền accent; FND-05 ghi khoảng dòng của `text-display-lg`. FND-01 thêm `danger-foreground`; FND-02 ghi đủ các chỗ dùng `primary`, `danger` (lỗi nhập ở ô, nút xóa) và lớp hướng dẫn S9.
