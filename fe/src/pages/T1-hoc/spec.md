---
id: T1
title: Học
status: nháp
version: 0.1
route: "#/hoc"
depends: APP, FND, DATA, C1, C2, C3
legacy: L-S2
---

# T1 Học

Màn chính. Cho người học thấy câu tiếp theo trong lộ trình và bắt đầu học trong một lần chạm.

## Bố cục

```
┌───────────────────────────┐
│ Tiếng Anh ▾          ⚙    │  thanh trên cùng (APP-02)
│                           │
│ Tuần này: 3/5 phiên       │
│                           │
│ ┌───────────────────────┐ │
│ │ ■■■□□□□□   Câu 4/8    │ │
│ │ Unit 12               │ │
│ │ I'd like to...        │ │
│ │ Tôi muốn...           │ │
│ │                       │ │
│ │ Tôi muốn đặt một bàn  │ │
│ │ cho hai người.        │ │
│ │ I'd like to book a    │ │
│ │ table for two.        │ │
│ │ (◉ Nghe)              │ │
│ └───────────────────────┘ │
│                           │
│ [Tiếp tục: 5 câu còn lại] │  nút chính
│                           │
│ 12 câu cần ôn hôm nay   › │
├───────────────────────────┤
│ Học Luyện tập T.viện T.bộ │  thanh tab (C5)
└───────────────────────────┘
```

Khổ máy tính (1280 px, ưu tiên giai đoạn đầu):

```
┌──────────────┬──────────────────────────────────────────────────────────────┐
│ VITASR       │ Tiếng Anh ▾                                             ⚙    │
│              │ Global English                                               │
│ ▌Học         │                                                              │
│  Luyện tập   │ ┌──────────────────────────────────┐   Tuần này: 3/5 phiên   │
│  Thư viện    │ │ ■■■□□□□□          Câu 4/8         │   ▓▓▓▓▓▓░░░░            │
│  Tiến độ     │ │ Unit 1 · A1                       │                         │
│              │ │ Find your classroom               │   12 câu cần ôn       › │
│              │ │ Tìm đúng phòng học                │                         │
│              │ │ Bạn mới đến trường và hỏi...      │                         │
│              │ │                                   │                         │
│              │ │ Phòng số mười hai ở đâu?          │                         │
│              │ │ Where is room twelve?             │                         │
│              │ │ Cách dùng: Where is + địa điểm... │                         │
│              │ │ (◉ Nghe)              (↻ Nghe lặp) │                         │
│              │ └──────────────────────────────────┘                          │
│              │ [ Tiếp tục: 5 câu còn lại          ]                          │
└──────────────┴──────────────────────────────────────────────────────────────┘
```

## Yêu cầu

### T1-01 Thẻ câu tiếp theo

Hiện thẻ câu (C1) của câu tiếp theo trong lộ trình (DATA-11), ở trạng thái hiện đầy đủ (C1-03). Phía trên nghĩa trong thẻ là tên unit: "Unit n" (`--t-sm`, `--muted`; n là `number` hoặc vị trí, DATA-03), kèm mã trình độ lấy từ phần đầu `unitId` khi có (ví dụ "A1"), rồi `title` và `translation` của unit (`--t-body`). Khi câu có `situation` (DATA-04), hiện thêm tình huống dưới tên unit (Literata `--t-sm`, `--muted`). Dải 8 ô (C2) thể hiện trạng thái các câu của unit đó, ô của câu đang hiện ở trạng thái Đang học.

### T1-02 Nút chính đổi chữ theo ngữ cảnh

Dưới thẻ là nút chính duy nhất của màn (C3-01):
- Không có phiên dở: "Học 8 câu" (hoặc "Học N câu" khi unit có N < 8 câu). Bấm mở `#/phien-hoc?nguon=lo-trinh`.
- Có phiên dở (S3-08): "Tiếp tục: N câu còn lại". Bấm mở lại đúng phiên đó ở câu đang dở.

### T1-03 Mục tiêu tuần

Phía trên thẻ là dòng "Tuần này: x/y phiên", trong đó x là số phiên hoàn tất trong 7 ngày gần nhất (tính cả hôm nay), y là mục tiêu (S8-01). Khi x ≥ y: "Tuần này: đã đạt mục tiêu x/y phiên". Phiên hoàn tất là mọi phiên đã xong (lộ trình, ôn tập, từ khóa, học một câu, kiểm tra nhanh); phiên dừng giữa chừng không tính.

### T1-04 Câu cần ôn

Dưới nút chính là dòng có thể chạm "N câu cần ôn hôm nay", N theo DATA-07, kèm mũi tên. Chạm mở `#/phien-hoc?nguon=on-tap`. Chỉ hiện khi N > 0.

### T1-05 Học hết lộ trình

Khi không còn câu chưa học: thay thẻ và nút chính bằng đoạn "Bạn đã học hết [count] câu [tên ngôn ngữ]. Vào Luyện tập để ôn lại." và nút chính "Mở Luyện tập".

### T1-06 Bố cục máy tính

Từ 900 px: hai cột. Cột trái (tối đa 560 px) là thẻ và nút chính; cột phải là mục tiêu tuần và dòng câu cần ôn.

### T1-07 Không đổi câu trên T1

T1 chỉ hiện một câu; không có vuốt hay nút để xem câu trước/sau. Xem câu khác thì dùng T3.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| T1-03: phiên nào tính vào mục tiêu tuần | Mọi phiên đã xong, không tính phiên dừng giữa chừng (như code đang làm) | T1-03 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.3 (10/10/2026): chốt cách đếm phiên hoàn tất cho mục tiêu tuần (Claude quyết định theo ủy quyền của nhóm).
- 0.4 (18/10/2026): sơ đồ ghi tên khu T4 là "Tiến độ" (theo phản hồi người dùng do nhóm chuyển).
