---
id: S9
title: Hướng dẫn lần đầu
status: nháp
version: 0.1
route: lớp phủ trên "#/hoc"
depends: APP, FND, DATA, C3
legacy: L-D9
---

# S9 Hướng dẫn lần đầu

Ba gợi ý tại chỗ trên T1, thay cho hướng dẫn 12 bước và 2 video của bản cũ.

## Yêu cầu

### S9-01 Khi nào hiện

Hiện một lần, ngay khi T1 tải xong lần đầu sau khi người học chọn ngôn ngữ ở S1. Không hiện khi T1 đang ở trạng thái học hết lộ trình (T1-05).

### S9-02 Ba bước

Mỗi bước làm nổi một phần tử của T1 (phần còn lại phủ lớp nền `--scrim` như sheet, C6-01) và hiện một bong bóng chữ cạnh phần tử đó:

| Bước | Phần tử | Chữ |
|---|---|---|
| 1/3 | Thẻ câu | "Đây là câu bạn sẽ học. Nút Nghe sẽ đọc to câu này cho bạn." |
| 2/3 | Nút chính | "Mỗi phiên học có 8 câu, mất khoảng 5 phút." |
| 3/3 | Thanh tab | "Ôn tập và kiểm tra nằm ở mục Luyện tập. Kết quả học nằm ở mục Tiến độ." |

### S9-03 Điều khiển

Mỗi bong bóng có "Bước n/3", nút chính "Tiếp" (bước cuối: "Bắt đầu học") và nút dạng chữ "Bỏ qua". Esc tương đương "Bỏ qua". "Bắt đầu học" đóng hướng dẫn và mở phiên học như T1-02.

### S9-04 Không hiện lại

Sau khi xong hoặc bỏ qua, ghi vào cài đặt (DATA-06) và không tự hiện lại, kể cả khi đổi ngôn ngữ.

### S9-05 Xem lại

Mở lại được từ S8-06; khi đó bắt đầu từ bước 1 và "Bắt đầu học" ở bước cuối được thay bằng "Xong".

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (10/10/2026): lớp phủ dùng chung token `--scrim` với sheet (C6-01).
- 0.3 (18/10/2026): viết lại chữ ba bước theo FND-12, khu T4 tên "Tiến độ" (theo phản hồi người dùng do nhóm chuyển); bước 1 không còn bảo bấm nút Nghe vì lớp hướng dẫn che nút đó (sửa lỗi tìm thấy khi rà soát code).
