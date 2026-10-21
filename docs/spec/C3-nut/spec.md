---
id: C3
title: Nút
status: nháp
version: 1.0
depends: FND
---

# C3 Nút

## Yêu cầu

### C3-01 Nút chính

Theo rule giao diện (`Button`, `tone="primary"`): nền `primary`, chữ `primary-foreground`, chữ 14 px đậm 600, `px-4 py-2.5`, cao tối thiểu 44 px, bo góc 8 px. Nút chính của màn học (T1, S10, S5) rộng hết khối dưới `sm`. Mỗi màn có tối đa một nút chính (FND-02).

### C3-02 Nút phụ

Nền trong suốt, viền 1 px `border`, chữ `foreground`, cao tối thiểu 44 px (`tone="outline"`); `tone="ghost"` nền `muted`. Nút dạng chữ (`tone="link"`, không viền) dùng cho hành động thứ ba trở đi, gạch chân khi hover.

### C3-03 Cặp nút đánh giá

Dùng ở bước ghi nhớ của S3: "Cần ôn lại" bên trái (viền 1,5 px `warning`, chữ `warning`, icon vòng lặp) và "Tôi nhớ" bên phải (nền `success`, chữ `card` ở chế độ sáng và `background` ở chế độ tối, icon dấu tích). Hai nút cao 48 px, chia đều chiều rộng, cách nhau 12 px. Khi bị khóa: độ mờ 40%, không nhận chạm.

### C3-04 Trạng thái chung

Mọi nút có trạng thái: thường, hover (chỉ thiết bị có chuột), nhấn (tối hơn 8%), focus bàn phím (FND-14), khóa (độ mờ 40%, `aria-disabled`), đang xử lý (chữ giữ nguyên, thêm chỉ báo nhỏ, không nhận chạm). Vùng chạm tối thiểu 44 x 44 px.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 1.0 (21/10/2026): Đợt 6 (Next.js, rule giao diện của nhóm): kiểu nút theo `Button` của rule giao diện (14 px đậm, bo góc 8 px, cao tối thiểu 44 px).
