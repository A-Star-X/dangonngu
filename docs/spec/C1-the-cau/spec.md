---
id: C1
title: Thẻ câu
status: nháp
version: 1.3
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
│  (◉ Nghe) (🐌 Nghe chậm)  (↻ Nghe lặp)  │
└─────────────────────────────────────────┘
```

Nền `card`, bo góc 8 px (FND-08), đệm 24 px (16 px dưới `sm`). Thứ tự đọc: nghĩa trước, câu gốc sau.

## Yêu cầu

### C1-01 Cấu trúc

Thẻ gồm, từ trên xuống: dải 8 ô và nhãn "Câu n/N" (chỉ khi được truyền vào), nghĩa, câu gốc, hàng nút gồm "Nghe" và "Nghe chậm" bên trái, "Nghe lặp" bên phải; màn hẹp không đủ chỗ thì "Nghe lặp" xuống dòng, không tràn ngang. Nghĩa dùng Literata `text-lg`; câu gốc dùng font theo FND-04 và cỡ theo FND-06.

### C1-02 Trạng thái che câu gốc

Khi thẻ ở chế độ che: vùng câu gốc là một khối nền `muted` cao bằng một dòng câu, có chữ "Nhấn để hiện câu gốc"; nút Nghe và Nghe lặp bị khóa. Chạm vào khối, chạm vào thẻ, hoặc nhấn Space / Enter khi thẻ có focus thì hiện câu gốc (chuyển động 180 ms, FND-11) và phát sự kiện "đã hiện". Nếu focus đang ở thẻ thì chuyển sang câu gốc vừa hiện (không có viền focus vì không phải điều khiển), để bàn phím không rơi về đầu trang và trình đọc màn hình đọc được câu.

### C1-03 Trạng thái hiện đầy đủ

Câu gốc hiện đầy đủ, nút Nghe và Nghe lặp dùng được. Không có cách nào che lại câu gốc trong cùng một lượt hiển thị câu.

### C1-04 Phát âm

"Nghe" đọc câu gốc một lần bằng giọng đã chọn cho ngôn ngữ đó, hoặc giọng tự động khi chưa chọn (S8-02), và tốc độ đã chọn. Khi đang đọc, nút đổi thành "Dừng". "Nghe lặp" đọc lặp lại câu cách nhau 1,5 giây cho tới khi bấm "Dừng" hoặc rời khỏi thẻ. Rời thẻ (đổi câu, đổi màn) thì dừng đọc ngay và nút trở về "Nghe", "Nghe lặp". Bấm một nút nghe khác khi đang đọc thì chỉ còn lượt mới: không có hai lượt đọc chồng nhau, nút không tự đổi chữ vì lượt cũ.

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

- Giọng không báo vị trí (giọng Google cần mạng trên Chrome, giọng "Tự động" mặc định của S8-02): ước lượng theo thời gian. Khi giọng bắt đầu phát, chia thời gian đọc cho từng chữ (tách chữ bằng `Intl.Segmenter` theo ngôn ngữ đích) theo độ dài chữ, cộng thêm khoảng nghỉ sau dấu phẩy, dấu chấm, dấu hỏi; tính theo tốc độ đọc đã chọn. Mỗi lần đọc hết câu (không bị dừng giữa chừng), đo thời gian thật của giọng đó để chỉnh ước lượng cho các lần đọc sau trong lần mở app. Ước lượng có thể lệch so với giọng thật, nhất là câu dài và lần đọc đầu.
- Đang ước lượng mà trình duyệt báo vị trí thật thì bỏ ước lượng, dùng vị trí thật cho phần còn lại của lượt đọc.
- Câu gốc hiển thị bằng `ruby` (C1-07) thì không tô.

### C1-10 Nghe chậm từng chữ

"Nghe" đọc cả câu liền mạch (đọc nhanh); "Nghe chậm" đọc lần lượt từng chữ của câu gốc (word by word). Chữ tách như C1-09; mỗi chữ là một lượt đọc riêng bằng giọng và tốc độ đã chọn (C1-04), đọc xong chữ này nghỉ 0,4 giây rồi đọc chữ sau. Chữ đang đọc được tô như C1-09 và luôn đúng chữ với mọi giọng, kể cả giọng Google, vì app tự đọc từng chữ (không cần ước lượng). Khi đang đọc, nút đổi thành "Dừng". Đọc xong chữ cuối thì bỏ tô, nút trở về "Nghe chậm". Dừng, đổi câu, rời thẻ, bấm "Nghe" hoặc "Nghe lặp" khi đang đọc chậm: như C1-04. Câu có `furigana` vẫn đọc từng chữ nhưng không tô (C1-09).

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
- 1.2 (21/10/2026): theo người dùng: C1-09 giọng không báo vị trí (giọng Google) thì tô theo ước lượng thời gian thay vì không tô.
- 1.3 (21/10/2026): theo leader ("đọc nhanh câu và đọc chậm word by word"): thêm C1-10 nút "Nghe chậm" đọc từng chữ; C1-01 hàng nút có ba nút.
