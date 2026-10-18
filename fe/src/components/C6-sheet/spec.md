---
id: C6
title: Sheet
status: nháp
version: 0.1
depends: FND
---

# C6 Sheet

Lớp phủ dùng cho: Đổi ngôn ngữ (APP-06), Tìm câu theo từ khóa (T2-03), Chi tiết câu (T3-05), Chi tiết ngày (T4-07), Giọng đọc (S8-02), xác nhận thoát phiên (S3-07, S5-08) và xác nhận xóa tiến độ (S8-05).

## Yêu cầu

### C6-01 Dạng hiển thị

Dưới 900 px: trượt từ dưới lên (220 ms), rộng hết màn, cao tối đa 90% khung, bo góc trên 16 px, có tay nắm 36 x 4 px ở giữa mép trên, nền `--surface`, đổ bóng (FND-09); phía sau là lớp nền `--scrim`: `--ink` độ mờ 40% ở giao diện sáng, đen độ mờ 60% ở giao diện tối, để màn phía sau tối lại chứ không sáng bạc đi. Từ 900 px: hộp thoại giữa màn, rộng tối đa 560 px, bo góc 16 px.

### C6-02 Tiêu đề và đóng

Mỗi sheet có tiêu đề `--t-lg` và nút đóng (icon x, nhãn trợ năng "Đóng") ở góc trên bên phải của sheet. Đóng được bằng: nút đóng, chạm lớp nền phía sau, phím Esc, và vuốt xuống trên tay nắm (dưới 900 px). Sheet xác nhận (thoát phiên, xóa tiến độ) không đóng khi chạm lớp nền, chỉ đóng bằng các nút của nó hoặc Esc. Đổi màn (kể cả nút Back của trình duyệt hay điện thoại) thì sheet đang mở đóng lại; khi màn đang chặn việc rời đi (S3-07, S5-08) thì màn không đổi và sheet xác nhận của màn đó hiện ra.

### C6-03 Focus

Khi mở: focus chuyển vào phần tử đầu tiên có thể thao tác trong sheet; Tab không ra ngoài sheet. Khi đóng: focus trả về phần tử đã mở sheet. Sheet có `role="dialog"`, `aria-modal="true"` và `aria-labelledby` trỏ tới tiêu đề.

### C6-04 Nội dung dài

Nội dung vượt chiều cao thì cuộn bên trong sheet; tiêu đề và nút hành động chính (nếu có) đứng yên. Cuộn trong sheet không làm cuộn trang phía sau.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| Lớp nền sau sheet ở giao diện tối làm màn phía sau sáng bạc đi | Dùng token `--scrim` riêng: giao diện tối là đen độ mờ 60%; giao diện sáng giữ `--ink` độ mờ 40%. Hướng dẫn S9 dùng cùng token | C6-01, S9-02 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (10/10/2026): lớp nền sau sheet dùng `--scrim`, ở giao diện tối là đen độ mờ 60% (Claude quyết định theo ủy quyền của nhóm).
- 0.3 (18/10/2026): C6-02 đổi màn thì đóng sheet đang mở (sửa lỗi tìm thấy khi rà soát code).
