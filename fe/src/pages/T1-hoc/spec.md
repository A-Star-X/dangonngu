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

Khổ máy tính từ 1200 px (Đợt 5):

```
┌──────────────┬───────────────────────────────────────────────────────────────┐
│ VITASR       │ Tiếng Anh ▾                                              ⚙    │
│              │                                                               │
│ ▌Học         │ ┌──────────────────────────────────┐  Tuần này: 3/5 phiên     │
│  Luyện tập   │ │ ■■■□□□□□          Câu 4/8         │  12 câu cần ôn hôm nay › │
│  Thư viện    │ │ Unit 1 · A1 (liên kết)            │                          │
│  Tiến độ     │ │ Find your classroom               │  Unit tiếp theo          │
│              │ │ ...                               │  Unit 2 · A1  ■□□□□□□□   │
│              │ │ (◉ Nghe)              (↻ Nghe lặp) │  Unit 3 · A1  □□□□□□□□   │
│              │ └──────────────────────────────────┘  Unit 4 · A1  □□□□□□□□   │
│              │ [ Tiếp tục: 5 câu còn lại          ]  Xem tất cả unit        │
│              │                                                              │
│              │                                       Tiến độ của bạn        │
│              │                                       29/4.096 câu  ▓░░░░░   │
│              │                                       3 unit đã học          │
│              │                                       Xem tiến độ            │
└──────────────┴───────────────────────────────────────────────────────────────┘
```

## Yêu cầu

### T1-01 Thẻ câu tiếp theo

Hiện thẻ câu (C1) của câu tiếp theo trong lộ trình (DATA-11), ở trạng thái hiện đầy đủ (C1-03). Phía trên nghĩa trong thẻ là tên unit: "Unit n" (`--t-sm`, `--muted`; n là `number` hoặc vị trí, DATA-03), kèm mã trình độ lấy từ phần đầu `unitId` khi có (ví dụ "A1"), rồi `title` và `translation` của unit (`--t-body`). Khi câu có `situation` (DATA-04), hiện thêm tình huống dưới tên unit (Literata `--t-sm`, `--muted`). Dải 8 ô (C2) thể hiện trạng thái các câu của unit đó, ô của câu đang hiện ở trạng thái Đang học. Dòng "Unit n" là liên kết mở Chi tiết Unit của unit đó (`#/unit?so=n`, S10).

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

Dưới 1200 px: một cột theo thứ tự mục tiêu tuần, thẻ câu, nút chính, câu cần ôn, Unit tiếp theo (T1-08), Tiến độ của bạn (T1-09). Từ 1200 px: cột chính (thẻ và nút chính, tối đa 560 px) và cột phụ (mục tiêu tuần, câu cần ôn, Unit tiếp theo, Tiến độ của bạn) rộng tối thiểu 320 px, giãn theo phần còn lại của vùng nội dung. Các khối trong cột phụ cách nhau theo nhịp dọc (FND-07).

### T1-07 Không đổi câu trên T1

T1 chỉ hiện một câu; không có vuốt hay nút để xem câu trước/sau. Xem câu khác thì dùng T3.

### T1-08 Unit tiếp theo

Khối có tiêu đề khối "Unit tiếp theo" (FND-15): tối đa 3 unit ngay sau unit đang học trong lộ trình (DATA-11), mỗi unit là một dòng như T3-09 (chạm mở S10). Dưới các dòng là liên kết "Xem tất cả unit" mở `#/thu-vien`. Ẩn khối khi không còn unit nào sau unit đang học hoặc đã học hết lộ trình (T1-05).

### T1-09 Tiến độ của bạn

Khối có tiêu đề khối "Tiến độ của bạn": dòng "x/N câu" với x là số câu đã qua bước ghi nhớ (DATA-06 trạng thái `da-hoc`) và N là tổng số câu của bộ nội dung đang học, số viết theo FND-12 (ví dụ "29/4.096 câu"); thanh tiến độ cùng tỉ lệ (như thanh mục tiêu ở T4-03); dòng "y unit đã học" (unit có mọi câu đã qua bước ghi nhớ, như T3-10), ẩn khi y = 0; liên kết "Xem tiến độ" mở `#/tien-bo`. Khối có cả khi đã học hết lộ trình.

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
- 0.5 (20/10/2026): Đợt 5 việc 1: tên unit trên thẻ mở Chi tiết Unit (T1-01); bố cục mới từ 1200 px (T1-06); thêm Unit tiếp theo (T1-08) và Tiến độ của bạn (T1-09).
