---
id: C7
title: Thông báo ngắn
status: nháp
version: 1.0
depends: FND
legacy: pwa-update
---

# C7 Thông báo ngắn

Thông báo tạm thời xác nhận thao tác hoặc báo lỗi có thể thử lại.

## Yêu cầu

### C7-01 Vị trí và hiển thị

Dùng react-toastify (rule công nghệ). Hiện giữa đáy màn, cách đáy 16 px, rộng tối đa 480 px (hết chiều ngang trừ lề trên màn hẹp), nền `card`, chữ `foreground`, bo góc 8 px, đổ bóng, chữ 14 px; thông báo lỗi có viền trái `danger`. Trượt vào khi xuất hiện, tắt hiệu ứng khi giảm chuyển động (FND-11).

### C7-02 Thời gian và hành động

Tự ẩn sau 3 giây; thông báo có nút hành động (ví dụ "Cập nhật", "Thử lại") ở lại 6 giây. Tối đa một thông báo tại một thời điểm; thông báo mới thay thông báo cũ.

### C7-03 Trợ năng

Nội dung được đọc qua `role="status"` (xác nhận) hoặc `role="alert"` (lỗi). Thông báo không lấy focus.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 1.0 (21/10/2026): Đợt 6 (Next.js, rule giao diện của nhóm): thông báo dùng react-toastify, vị trí đáy giữa (không còn thanh tab), nền card.
