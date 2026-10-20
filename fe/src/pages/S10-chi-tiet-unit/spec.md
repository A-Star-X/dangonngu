---
id: S10
title: Chi tiết Unit
status: nháp
version: 0.1
route: "#/unit"
depends: APP, FND, DATA, C1, C2, C3, C6
legacy: không có ở bản cũ
---

# S10 Chi tiết Unit

Một unit với tiến độ của nó, các câu trong unit và lối vào học hoặc kiểm tra đúng unit đó. Mở từ dòng unit ở Thư viện (T3-09). Thêm ở Đợt 5 (việc 3).

## Bố cục

```
┌───────────────────────────┐
│ Tiếng Anh ▾          ⚙    │
│ Thư viện / Unit 12 · A1   │  đường dẫn (APP-14)
│ Order at a café           │  tiêu đề màn: title, font ngôn ngữ đích
│ Gọi món ở quán cà phê     │
│ Bạn vào quán và gọi...    │  situation, khi có
│                           │
│ ■■■■■↻□□                  │
│ Đã nhớ 5 · Cần ôn 1 · Chưa học 2 │
│ [ Học unit này          ] │  nút chính
│ Kiểm tra nhanh unit này   │  nút dạng chữ
│                           │
│ Các câu trong unit        │  tiêu đề khối
│ 0089 Can I get a...     ✓ │
│      Cho tôi một...       │
│ ...                       │
│ ‹ Unit 11      Unit 13 ›  │
├───────────────────────────┤
│ Học Luyện tập T.viện T.độ │  thanh tab, Thư viện đang chọn
└───────────────────────────┘
```

## Yêu cầu

### S10-01 Route và khung

Route `#/unit?so=n` với `n` là số thứ tự unit (DATA-03). Màn thuộc khu Thư viện: có thanh trên cùng (APP-02) và thanh tab với mục Thư viện đang chọn (APP-01). Đầu màn là dòng đường dẫn "Thư viện / Unit n" (APP-14). `so` không phải số unit có trong dữ liệu thì chuyển về `#/thu-vien` (thay route, không thêm lịch sử).

### S10-02 Đầu màn

Từ trên xuống: dòng đường dẫn (S10-01) với phần cuối là "Unit n" kèm mã trình độ khi có (`--t-sm`); `title` của unit là tiêu đề màn (`h1`, `--t-xl` đậm 600, font theo ngôn ngữ đích, có `lang`), unit không có `title` thì tiêu đề màn là "Unit n"; `translation` (Literata `--t-body`, `--muted`) khi có; `situation` của câu đầu unit (Literata `--t-sm`, `--muted`) khi có (DATA-04).

### S10-03 Tiến độ unit

Dải 8 ô (C2) theo trạng thái các câu của unit, và dòng "Đã nhớ x · Cần ôn y · Chưa học z" (DATA-07), bỏ phần có số 0.

### S10-04 Hành động

Nút chính "Học unit này" mở `#/phien-hoc?nguon=unit&so=n` (S3-01); khi mọi câu của unit đã nhớ thì chữ nút là "Ôn lại unit này", cùng hành động. Dưới nút chính là nút dạng chữ "Kiểm tra nhanh unit này", mở `#/kiem-tra?unit=n` (S5-01). Thoát giữa phiên học mở từ đây thì về lại S10 của unit này (S3-07).

### S10-05 Danh sách câu

Tiêu đề khối "Các câu trong unit" (FND-15), rồi các câu của unit, mỗi dòng như T3-01. Chạm dòng mở sheet Chi tiết câu như T3-05, ở mọi khổ màn hình.

### S10-06 Unit trước và sau

Cuối màn là hai liên kết "Unit n-1" (icon mũi tên trái) và "Unit n+1" (icon mũi tên phải), mở S10 của unit đó; ẩn liên kết trước ở unit đầu, liên kết sau ở unit cuối.

## Câu hỏi mở

Không có.

## Lịch sử thay đổi

- 0.1 (20/10/2026): bản đầu (Đợt 5 việc 3, theo đề xuất `docs/theo-doi/de-xuat-spec-dot5.md` đã duyệt).
- 0.2 (20/10/2026): S10-01, S10-02 dùng dòng đường dẫn theo APP-14 thay cho liên kết Thư viện và dòng Unit n riêng (Đợt 5 việc 10).
