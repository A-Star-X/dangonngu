---
id: C2
title: Dải 8 ô
status: nháp
version: 1.1
depends: FND
legacy: không có
---

# C2 Dải 8 ô

Điểm nhấn thị giác của app. Mỗi ô là một câu trong nhóm đang học (một unit có tối đa 8 câu). Dùng ở C1, S3, tổng kết phiên S3c và lịch sử phiên T4.

## Yêu cầu

### C2-01 Kích thước và số ô

Số ô bằng số câu trong nhóm (tối đa 8). Mỗi ô vuông 10 x 10 px, cách nhau 4 px, xếp một hàng ngang, căn trái.

### C2-02 Trạng thái ô

| Trạng thái | Hiển thị |
|---|---|
| Chưa học | Viền 1,5 px `muted-foreground` độ mờ 70%, nền trong suốt (viền `border` gần như không thấy ở giao diện tối) |
| Đang học | Nền `primary` |
| Đã nhớ | Nền `success` |
| Cần ôn | Nền `warning` và một vạch chéo 1,5 px màu `card` để phân biệt không cần màu |

Đổi trạng thái có chuyển động 150 ms (FND-11).

### C2-03 Trợ năng

Cả dải có nhãn "Tiến độ nhóm câu: đã học x trên N câu". Mỗi ô có nhãn riêng, ví dụ "Câu 3, đã nhớ". Ô không nhận focus.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (18/10/2026): nhãn trợ năng của dải đổi thành "Tiến độ nhóm câu: đã học x trên N câu" (theo phản hồi người dùng do nhóm chuyển).
- 1.0 (21/10/2026): Đợt 6 (Next.js, rule giao diện của nhóm): route là đường dẫn, token theo FND mới; màn nằm trong khung khu học (APP-03).
- 1.1 (21/10/2026): theo rà soát ảnh bằng chứng Đợt 6: C2-02 ô chưa học viền `muted-foreground` 70% để thấy được ở giao diện tối.
