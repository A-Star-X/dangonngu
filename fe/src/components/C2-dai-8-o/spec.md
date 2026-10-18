---
id: C2
title: Dải 8 ô
status: nháp
version: 0.1
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
| Chưa học | Viền 1,5 px `--line`, nền trong suốt |
| Đang học | Nền `--brand` |
| Đã nhớ | Nền `--known` |
| Cần ôn | Nền `--review` và một vạch chéo 1,5 px màu `--surface` để phân biệt không cần màu |

Đổi trạng thái có chuyển động 150 ms (FND-11).

### C2-03 Trợ năng

Cả dải có nhãn "Tiến độ nhóm câu: đã học x trên N câu". Mỗi ô có nhãn riêng, ví dụ "Câu 3, đã nhớ". Ô không nhận focus.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (18/10/2026): nhãn trợ năng của dải đổi thành "Tiến độ nhóm câu: đã học x trên N câu" (theo phản hồi người dùng do nhóm chuyển).
