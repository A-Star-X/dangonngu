---
id: T2
title: Luyện tập
status: nháp
version: 0.1
route: "#/luyen-tap"
depends: APP, FND, DATA, C3, C6
legacy: L-D6 (lối vào TEST NOW), L-D7
---

# T2 Luyện tập

Gom các cách luyện ngoài lộ trình vào một chỗ.

## Bố cục

```
┌───────────────────────────┐
│ Tiếng Anh ▾          ⚙    │
│ Luyện tập                 │
│                           │
│ Ôn tập hôm nay        12  │
│ Các câu đến hạn ôn hôm    │
│ nay, gồm cả câu bạn chưa  │
│ nhớ hoặc trả lời chưa     │
│ đúng.                     │
│ ───────────────────────── │
│ Học theo từ khóa          │
│ Tìm câu theo từ bạn cần,  │
│ ví dụ đặt phòng, ăn uống, │
│ sân bay.                  │
│ ───────────────────────── │
│ Kiểm tra nhanh            │
│ Nghe và chọn nghĩa, nghe  │
│ theo cụm, sắp xếp câu.    │
└───────────────────────────┘
```

## Yêu cầu

### T2-01 Danh sách cách luyện

Màn có tiêu đề "Luyện tập" (tiêu đề màn, FND-15) và ba mục xếp dọc, ngăn bằng đường kẻ `--line` (không dùng thẻ): Ôn tập hôm nay, Học theo từ khóa, Kiểm tra nhanh. Mỗi mục có tên (`--t-body` đậm 600), một dòng mô tả (`--t-sm`, `--muted`) và cả mục là một vùng chạm. Màn không có nút chính. Dòng mô tả của ba mục lần lượt là: "Các câu đến hạn ôn hôm nay, gồm cả câu bạn chưa nhớ hoặc trả lời chưa đúng." (T2-02 ghi chữ khi không có câu nào); "Tìm câu theo từ bạn cần, ví dụ đặt phòng, ăn uống, sân bay."; "Nghe và chọn nghĩa, nghe theo cụm, sắp xếp câu." (trùng tên ba bước của S5).

### T2-02 Ôn tập hôm nay

Bên phải tên mục là số câu Cần ôn hôm nay (DATA-07). Chạm mở `#/phien-hoc?nguon=on-tap`. Khi số đó là 0: mục bị khóa và mô tả đổi thành "Hôm nay không có câu nào cần ôn."

### T2-03 Học theo từ khóa

Chạm mở sheet (C6) "Học theo từ khóa" gồm: ô tìm (placeholder "Ví dụ: đặt phòng, sân bay"), các chip gợi ý (chạm chip là điền vào ô tìm): khi bộ nội dung có `topic`, chip là tối đa 6 chủ đề có nhiều câu nhất; khi không có, chip cố định "đặt phòng", "ăn uống", "sân bay", "mua sắm"; dòng "Tìm thấy N câu", xem trước tối đa 5 câu đầu (câu gốc và nghĩa), và nút chính "Học 8 câu đầu" (mở `#/phien-hoc?nguon=tu-khoa&q=…&nhom=1`); khi chỉ tìm thấy từ 1 đến 7 câu thì nút là "Học N câu", không tìm thấy câu nào thì nút "Học 8 câu đầu" bị khóa. Các nhóm 8 câu tiếp theo mở từ nút "Nhóm tiếp" ở tổng kết phiên (S3-06). Tìm theo DATA-12 (khớp chuỗi con, nên "bus" khớp cả "busy"), cập nhật sau khi ngừng gõ 250 ms.

### T2-04 Kiểm tra nhanh

Chạm mở `#/kiem-tra` với nhóm câu là unit đang học trong lộ trình. Khi có bài kiểm tra dở (S5-09): mục có thêm dòng "Đang làm dở: …" và chạm thì mở lại bài dở ở đúng bước và câu.

### T2-05 Không có kết quả

Trong sheet T2-03, khi không có câu nào khớp: thay phần xem trước bằng "Không có câu nào chứa "[từ khóa]". Thử từ khác bằng tiếng Việt hoặc [tên ngôn ngữ]." ([tên ngôn ngữ] viết thường chữ đầu, ví dụ "tiếng Nhật") và khóa nút "Học 8 câu đầu".

### T2-06 Bố cục máy tính

Từ 1200 px, ba mục xếp vào lưới tự xuống hàng (cột rộng tối thiểu 320 px) thay cho một cột rộng 720 px; vẫn ngăn bằng đường kẻ, không có khung thẻ (FND-13), thứ tự đọc giữ nguyên.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| T2-03: nút luôn là "Học 8 câu đầu" kể cả khi tìm thấy dưới 8 câu | Đổi thành "Học N câu" khi tìm thấy từ 1 đến 7 câu | T2-03, T2-AC03 |
| T2-03: tìm theo chuỗi con hay theo từ | Giữ tìm theo chuỗi con (DATA-12) | T2-03 |
| Dòng mô tả "trả lời sai" có chữ trong cột Không dùng của FND-12 (phát hiện khi rà FND-AC12) | Đổi thành "Các câu đến hạn ôn hôm nay, kể cả câu bạn chưa nhớ hoặc làm chưa đúng." (đúng với quy tắc câu cần ôn của DATA-07); ngày 18/10/2026 viết lại thành "…gồm cả câu bạn chưa nhớ hoặc trả lời chưa đúng.", xem Lịch sử | Bố cục, T2-01 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.3 (10/10/2026): chốt các câu hỏi mở (Claude quyết định theo ủy quyền của nhóm): nút "Học N câu" khi tìm thấy dưới 8 câu; giữ tìm theo chuỗi con; đổi dòng mô tả Ôn câu cần ôn.
- 0.4 (18/10/2026): mục "Ôn câu cần ôn" đổi tên thành "Ôn tập hôm nay"; viết lại các dòng mô tả; placeholder và câu không có kết quả không còn giả định tiếng Anh (theo phản hồi người dùng do nhóm chuyển).
- 0.5 (20/10/2026): tiêu đề màn theo FND-15 thay cho cỡ ghi riêng (Đợt 5 việc 2).
- 0.6 (20/10/2026): T2-04 mở lại bài kiểm tra dở (Đợt 5 việc 8).
- 0.7 (20/10/2026): thêm T2-06 bố cục từ 1200 px (Đợt 5 việc 6).
