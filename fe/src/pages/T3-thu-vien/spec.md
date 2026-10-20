---
id: T3
title: Thư viện
status: nháp
version: 0.1
route: "#/thu-vien"
depends: APP, FND, DATA, C1, C6
legacy: Danh sách dữ liệu trong L-S2
---

# T3 Thư viện

Toàn bộ unit và câu của ngôn ngữ đang học. Có hai cách xem: theo Unit (mặc định, xem tổng quan rồi mở Chi tiết Unit S10) và theo Câu (tìm, lọc và xem chi tiết từng câu).

## Bố cục

Cách xem Unit (375 px):

```
┌───────────────────────────┐
│ Tiếng Anh ▾          ⚙    │
│ Thư viện                  │  tiêu đề màn (FND-15)
│ [ Unit | Câu ]            │  chọn cách xem (T3-08)
│ 576 unit · đã học 12 · đang học dở 1 │  tổng quan (T3-10)
│ A1 A2 B1 B2 C1 C2         │  trình độ, khi có unitId
│                           │
│ Unit 1 · A1               │
│ Find your classroom       │
│ Tìm đúng phòng học        │
│ ■■■■■□□□           5/8    │  dải 8 ô và số câu đã nhớ
│ ───────────────────────── │
│ Unit 2 · A1               │
│ ...                       │
│ ‹ Trước   1/4    Sau ›    │
└───────────────────────────┘
```

Cách xem Câu (375 px):

```
┌───────────────────────────┐
│ Tiếng Anh ▾          ⚙    │
│ [ Tìm câu hoặc nghĩa    ] │
│ Unit ▾   Trạng thái ▾     │
│ 4.096 câu                 │
│                           │
│ 0001  I want to...      ○ │  ○ chưa học, ✓ đã nhớ, ↻ cần ôn
│       Tôi muốn...         │
│ 0257  want to know...   ✓ │
│       muốn biết...        │
│ ...                       │
│                           │
│ ‹ Trước   1/128    Sau ›  │
└───────────────────────────┘
```

Khổ máy tính (1280 px):

```
┌──────────────┬──────────────────────────────┬───────────────────────────────┐
│ VITASR       │ [ Tìm câu hoặc nghĩa       ] │ Câu 0001                      │
│              │ Unit ▾ Trạng thái ▾          │ Unit 1 · A1: Find your        │
│  Học         │ Chủ đề ▾ Trình độ ▾          │ classroom                     │
│  Luyện tập   │ 4.608 câu                    │ ┌───────────────────────────┐ │
│ ▌Thư viện    │ 0001 Where is room twelve? ○ │ │ Phòng số mười hai ở đâu?  │ │
│  Tiến độ     │      Phòng số mười hai ở đâu?│ │ Where is room twelve?     │ │
│              │ 0002 It is on the first..  ✓ │ │ Cách dùng: ...            │ │
│              │      Phòng đó ở tầng ...     │ │ (◉ Nghe)                  │ │
│              │ ...                          │ └───────────────────────────┘ │
│              │ ‹ Trước   1/144   Sau ›      │ Chưa học                      │
│              │                              │ [ Học câu này ]               │
└──────────────┴──────────────────────────────┴───────────────────────────────┘
```

## Yêu cầu

### T3-01 Danh sách câu

Các yêu cầu T3-01 đến T3-07 áp cho cách xem Câu (`#/thu-vien?xem=cau`). Mỗi trang 32 câu. Mỗi dòng: số `id` 4 chữ số (`--t-sm`, `--muted`, chữ số đều độ rộng), câu gốc (`--t-body`, cắt ở 2 dòng), nghĩa (Literata `--t-sm`, cắt ở 1 dòng), và biểu tượng trạng thái học bên phải (DATA-07): vòng rỗng `--muted` cho Chưa học, dấu tích `--known` cho Đã nhớ, vòng lặp `--review` cho Cần ôn. Các dòng ngăn bằng đường kẻ `--line`. Phía trên danh sách là số câu khớp ("4.096 câu").

### T3-02 Tìm kiếm

Ô tìm ở đầu màn, placeholder "Tìm câu hoặc nghĩa", có nút xóa khi có chữ. Tìm theo DATA-12, cập nhật sau khi ngừng gõ 250 ms. Từ khóa giữ trong route (`?q=`).

### T3-03 Bộ lọc

Các bộ lọc dạng nút mở danh sách chọn: "Unit" (Tất cả, rồi từng unit "Unit n: title"), "Trạng thái" (Tất cả, Chưa học, Đã nhớ, Cần ôn), "Chủ đề" (Tất cả, rồi các `topic` theo thứ tự chữ cái, kèm số câu, có ô tìm trong danh sách vì có tới 177 chủ đề) chỉ hiện khi bộ nội dung có `topic`, và "Trình độ" (Tất cả, A1, A2, B1, B2, C1, C2) chỉ hiện khi có `unitId` (DATA-04). Bộ lọc đang dùng hiện tên giá trị thay cho nhãn mặc định. Unit giữ trong route (`?unit=`); Trạng thái, Chủ đề, Trình độ không giữ trong route nên mất khi tải lại trang. Danh sách chọn của mỗi bộ lọc mở bằng sheet (C6). Bộ lọc Trình độ chỉ liệt kê các trình độ có trong dữ liệu. Tìm kiếm và bộ lọc kết hợp với nhau.

### T3-04 Phân trang

Dưới danh sách: "Trước", "Trang x/y", "Sau"; "Trước" khóa ở trang đầu, "Sau" khóa ở trang cuối. Đổi từ khóa hoặc bộ lọc thì về trang 1. Chuyển trang thì cuộn về đầu danh sách. Ẩn phân trang khi chỉ có một trang.

### T3-05 Chi tiết câu

Chạm một dòng mở sheet (C6) "Câu [id]": thẻ câu (C1) hiện đầy đủ, dòng "Unit n: title", trạng thái học bằng chữ và lần học gần nhất ("Học lần cuối: 3 ngày trước" hoặc "Chưa học"), nút chính "Học câu này" mở `#/phien-hoc?nguon=cau&id=[id]`.

### T3-06 Không có kết quả

Khi không có câu nào khớp: "Không có câu nào khớp với tìm kiếm và bộ lọc hiện tại." và nút phụ "Xóa tìm kiếm và bộ lọc".

### T3-07 Bố cục máy tính

Ở cách xem Câu, từ 1200 px: hai cột. Danh sách bên trái (tối đa 480 px); chi tiết câu (nội dung như T3-05) hiển thị ở cột phải thay cho sheet, mặc định là câu đầu của trang. Dưới 1200 px dùng sheet như T3-05.

### T3-08 Chọn cách xem

Đầu màn là tiêu đề màn "Thư viện" (FND-15) và nút chọn hai cách xem "Unit" và "Câu", kiểu như bộ chọn khoảng ở T4-01. Mặc định là Unit. Cách xem giữ trong route (`?xem=unit|cau`), tải lại trang giữ cách xem. Ô tìm và các bộ lọc của T3-02, T3-03 chỉ có ở cách xem Câu.

### T3-09 Danh sách Unit

Cách xem Unit, mỗi trang 24 unit, phân trang như T3-04. Mỗi dòng: "Unit n" (`--t-sm`, `--muted`) kèm mã trình độ khi có (T1-01); `title` của unit (`--t-body` đậm 600, font theo ngôn ngữ đích, có `lang`); `translation` (Literata `--t-sm`, `--muted`); dải 8 ô (C2) theo trạng thái các câu của unit (Đã nhớ, Cần ôn, Chưa học) và số "x/N" câu đã nhớ bên phải dải ô. Unit chưa học câu nào không có số. Các dòng ngăn bằng đường kẻ `--line`, không có khung thẻ (FND-13); từ 900 px các dòng xếp vào lưới tự xuống hàng, cột rộng tối thiểu 320 px. Chạm dòng mở Chi tiết Unit `#/unit?so=n` (S10). Danh sách này không hiện từng câu.

### T3-10 Tổng quan Unit

Phía trên danh sách Unit là dòng "N unit · đã học x · đang học dở y" (`--t-sm`, `--muted`), tính trong các unit đang hiện: đã học là unit có mọi câu đã qua bước ghi nhớ; đang học dở là unit có ít nhất một câu đã học nhưng chưa đủ. Khi bộ nội dung có `unitId` (DATA-04): hàng nút trình độ (chỉ các trình độ có trong dữ liệu), chọn một trình độ thì chỉ hiện unit của trình độ đó; mặc định là trình độ của unit đang học trong lộ trình (DATA-11), học hết lộ trình thì là trình độ đầu. Trình độ giữ trong route (`?trinh-do=`). Đổi trình độ thì về trang 1.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| T3-03: có giữ Trạng thái, Chủ đề, Trình độ trong route không | Không; chỉ Unit và từ khóa giữ trong route | T3-03 |
| T3-03: bộ lọc Trình độ chỉ liệt kê trình độ có trong dữ liệu | Giữ như code đang làm | T3-03 |
| T3-03: danh sách chọn của bộ lọc hiện ở đâu | Mở bằng sheet (C6) | T3-03 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.3 (08/10/2026): cập nhật theo bộ dữ liệu khách gửi và câu trả lời của nhóm (ưu tiên web, responsive; đủ 15 ngôn ngữ; không đọc tiến độ bản cũ).
- 0.4 (10/10/2026): chốt các câu hỏi về bộ lọc (Claude quyết định theo ủy quyền của nhóm).
- 0.5 (18/10/2026): sơ đồ ghi tên khu T4 là "Tiến độ" (theo phản hồi người dùng do nhóm chuyển).
- 0.6 (20/10/2026): Đợt 5 việc 3: thêm cách xem Unit làm mặc định (T3-08, T3-09, T3-10), T3-01 đến T3-07 áp cho cách xem Câu.
- 0.7 (20/10/2026): T3-07 hai cột từ 1200 px thay cho 900 px (Đợt 5 việc 6).
