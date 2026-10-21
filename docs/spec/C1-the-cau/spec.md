---
id: C1
title: Thẻ câu
status: nháp
version: 1.1
depends: FND, C2, C3
legacy: thẻ "Câu đang học" trong L-S2, L-D2
---

# C1 Thẻ câu

Thành phần trung tâm của app: hiển thị một câu với nghĩa, câu gốc và nút nghe. Dùng ở T1, S3a, sheet Chi tiết câu (T3).

## Bố cục

```
┌─────────────────────────────────────────┐
│ ■ ■ ■ ▣ □ □ □ □          Câu 4/8        │  dải 8 ô (C2), tùy chọn
│                                         │
│ Tôi muốn đặt một bàn cho hai người.     │  nghĩa (Literata, text-lg)
│                                         │
│ I'd like to book a table for two.       │  câu gốc (Lexend, FND-06)
│                                         │
│  (◉ Nghe)                (↻ Nghe lặp)   │
└─────────────────────────────────────────┘
```

Nền `card`, bo góc 8 px (FND-08), đệm 24 px (16 px dưới `sm`). Thứ tự đọc: nghĩa trước, câu gốc sau.

## Yêu cầu

### C1-01 Cấu trúc

Thẻ gồm, từ trên xuống: dải 8 ô và nhãn "Câu n/N" (chỉ khi được truyền vào), nghĩa, câu gốc, hàng nút gồm "Nghe" bên trái và "Nghe lặp" bên phải. Nghĩa dùng Literata `text-lg`; câu gốc dùng font theo FND-04 và cỡ theo FND-06.

### C1-02 Trạng thái che câu gốc

Khi thẻ ở chế độ che: vùng câu gốc là một khối nền `muted` cao bằng một dòng câu, có chữ "Nhấn để hiện câu gốc"; nút Nghe và Nghe lặp bị khóa. Chạm vào khối, chạm vào thẻ, hoặc nhấn Space / Enter khi thẻ có focus thì hiện câu gốc (chuyển động 180 ms, FND-11) và phát sự kiện "đã hiện". Nếu focus đang ở thẻ thì chuyển sang câu gốc vừa hiện (không có viền focus vì không phải điều khiển), để bàn phím không rơi về đầu trang và trình đọc màn hình đọc được câu.

### C1-03 Trạng thái hiện đầy đủ

Câu gốc hiện đầy đủ, nút Nghe và Nghe lặp dùng được. Không có cách nào che lại câu gốc trong cùng một lượt hiển thị câu.

### C1-04 Phát âm

"Nghe" đọc câu gốc một lần bằng giọng đã chọn cho ngôn ngữ đó, hoặc giọng tự động khi chưa chọn (S8-02), và tốc độ đã chọn. Khi đang đọc, nút đổi thành "Dừng". "Nghe lặp" đọc lặp lại câu cách nhau 1,5 giây cho tới khi bấm "Dừng" hoặc rời khỏi thẻ. Rời thẻ (đổi câu, đổi màn) thì dừng đọc ngay và nút trở về "Nghe", "Nghe lặp". Bấm nút kia khi đang đọc thì chỉ còn lượt mới: không có hai vòng lặp chồng nhau, nút không tự đổi chữ vì lượt cũ.

### C1-05 Không có giọng đọc

Khi thiết bị không có giọng nào cho ngôn ngữ đích: nút Nghe và Nghe lặp bị khóa, dưới hàng nút hiện "Thiết bị chưa có giọng [tên ngôn ngữ]. Mở Cài đặt > Giọng đọc." ([tên ngôn ngữ] viết thường chữ đầu theo FND-12, ví dụ "tiếng Anh") Phần "Cài đặt > Giọng đọc" là liên kết mở sheet Giọng đọc (S8-02). Liên kết này nằm trong dòng chữ nên được miễn vùng chạm 44 px của FND-14. Khi chưa biết thiết bị có giọng hay không (đang nạp danh sách giọng), dòng này được giữ chỗ nhưng ẩn, để lúc hiện ra không đẩy các nút bên dưới.

### C1-06 Dòng Cách dùng

Chỉ khi item có `noteVi` (DATA-04): hiện thêm dòng "Cách dùng: …" dưới câu gốc, Literata `text-sm`, màu `muted-foreground`. Không có `noteVi` thì không có khoảng trống thay thế.

### C1-07 Phiên âm

Chỉ khi item có `furigana`: câu gốc hiển thị bằng thẻ `ruby`. Chỉ khi có `reading` (và không có `furigana`): hiện phiên âm dưới câu gốc, `text-sm`.

### C1-08 Thuộc tính ngôn ngữ

Phần tử câu gốc có `lang` bằng mã ngôn ngữ đích (ví dụ `en`); phần tử nghĩa có `lang="vi"`.

### C1-09 Tô sáng chữ đang đọc

Khi "Nghe" hoặc "Nghe lặp" đang đọc và trình duyệt báo vị trí chữ đang đọc (sự kiện `boundary` loại `word` của `speechSynthesis`), chữ đó trong câu gốc được tô nền `sidebar-accent` và gạch chân màu `primary` dày 2 px (phần tử `mark`, bo góc nhỏ), để thấy rõ cả ở giao diện sáng. Áp dụng ở mọi chỗ hiện câu gốc kèm nút nghe: thẻ câu, bước chọn nghĩa của phiên học (S3) và câu gốc hiện sau khi trả lời ở bước nghe và chọn nghĩa của Kiểm tra nhanh (S5-03). Tô sáng chỉ đổi nền và gạch chân: không đổi cỡ chữ, độ đậm hay vị trí các chữ khác. Đọc xong câu, bấm "Dừng", đổi câu, và khoảng nghỉ giữa hai lượt "Nghe lặp" thì bỏ tô.

- Trình duyệt hoặc giọng không báo vị trí (ví dụ giọng Google cần mạng trên Chrome): đọc bình thường, không tô, không báo gì thêm.
- Câu gốc hiển thị bằng `ruby` (C1-07) thì không tô.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| Liên kết "Cài đặt > Giọng đọc" trong câu báo thiếu giọng thấp hơn 44 px | Giữ dạng liên kết trong câu; được miễn vùng chạm như liên kết trong đoạn văn | C1-05, FND-14 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (10/10/2026): chốt câu hỏi về liên kết trong câu báo thiếu giọng; ghi việc giữ chỗ cho câu báo khi đang nạp giọng (Claude quyết định theo ủy quyền của nhóm).
- 0.3 (18/10/2026): C1-02 đổi chữ thành "Nhấn để hiện câu gốc"; C1-04 dùng giọng tự động khi chưa chọn giọng; C1-05 ghi cách viết tên ngôn ngữ (theo phản hồi người dùng do nhóm chuyển); C1-02 chuyển focus sang câu gốc vừa hiện; C1-04 đổi Nghe và Nghe lặp khi đang đọc, đổi câu thì nút về trạng thái đầu (sửa lỗi tìm thấy khi rà soát code).
- 1.0 (21/10/2026): Đợt 6 (Next.js, rule giao diện của nhóm): bo góc 8 px, token và route theo FND, APP mới.
- 1.1 (21/10/2026): theo leader: thêm C1-09 tô sáng chữ đang đọc khi Nghe, Nghe lặp (như bản cũ có "vừa đọc vừa nhảy đến chữ đang đọc").
