---
id: T4
title: Tiến độ
status: nháp
version: 1.1
route: "/tien-do"
depends: APP, FND, DATA, C2, C6
legacy: L-D3
---

# T4 Tiến độ

Cho người học thấy mình đã học bao nhiêu, còn bao nhiêu câu cần ôn, và có giữ được nhịp học không.

## Bố cục

```
┌───────────────────────────┐
│ Tiếng Anh ▾          ⚙    │
│ Tiến độ   [1 ngày|7 ngày|30 ngày] │
│                           │
│ 23        184       12    │
│ phiên     câu đã    cần ôn│
│           học       hôm nay│
│                           │
│ Mục tiêu mỗi tuần 3/5 phiên│
│ ▓▓▓▓▓▓░░░░                │
│                           │
│ Số câu đã học mỗi ngày    │
│ ▅  ▃  ▇  ▂  ▆  ·  ▇       │
│ T5 T6 T7 CN T2 T3 T4      │
│                           │
│ Lịch ôn tập               │
│ Hôm nay      12 câu       │
│ Ngày mai      8 câu       │
│ 7 ngày tới   31 câu       │
│                           │
│ Các phiên học             │
│ 14:05  Học theo lộ trình  │
│        ■■■■■■□■           │
│ ...                       │
└───────────────────────────┘
```

## Yêu cầu

### T4-01 Khoảng thời gian

Bộ chọn ba nút liền nhau "1 ngày", "7 ngày", "30 ngày", mặc định 7 ngày, giữ trong route (`?khoang=`). Khoảng tính theo ngày lịch của máy, kết thúc ở hôm nay.

### T4-02 Ba chỉ số

Ba số liệu cạnh nhau trong một khối, ngăn bằng đường kẻ: số phiên hoàn tất trong khoảng; số câu khác nhau đã học trong khoảng (có ít nhất một lượt làm); số câu cần ôn hôm nay (DATA-07, không phụ thuộc khoảng). Nhãn mỗi số nằm dưới số: "phiên học", "câu đã học", "câu cần ôn hôm nay".

### T4-03 Mục tiêu mỗi tuần

Tiêu đề section "Mục tiêu mỗi tuần" (cùng tên với mục ở Cài đặt, S8-01), trong panel là số "x/y phiên" và thanh tiến độ; từ `lg` panel cao bằng panel Lịch ôn tập bên cạnh; tính như T1-03 (luôn 7 ngày gần nhất, không phụ thuộc khoảng). Thanh dùng `foreground`; khi đạt mục tiêu dùng `success`.

### T4-04 Biểu đồ theo ngày

Với khoảng 7 hoặc 30 ngày: biểu đồ cột số câu đã học mỗi ngày, cột hôm nay màu `primary`, các cột khác `foreground` độ mờ 60%, ngày không học là một chấm. Trục ngang ghi thứ (7 ngày) hoặc ngày trong tháng mỗi 5 ngày (30 ngày). Với khoảng 1 ngày: không có biểu đồ. Biểu đồ có bảng số liệu tương đương cho trình đọc màn hình. Cột hôm nay dùng `primary` là ngoại lệ được phép của FND-02. Ở khoảng 30 ngày trên màn hẹp, cột có số liệu vẫn chạm được dù hẹp hơn 44 px (ngoại lệ của FND-14); danh sách "Các phiên học" bên dưới là đường thay thế để xem từng ngày.

### T4-05 Lịch ôn tập

Ba dòng: "Hôm nay", "Ngày mai", "7 ngày tới", mỗi dòng là số câu đến hạn ôn theo DATA-07 (câu đã đến hạn trước hôm nay tính vào "Hôm nay"). "7 ngày tới" là số câu đến hạn từ ngày mai tới hết ngày thứ 7 tính từ hôm nay, nên gồm cả số của dòng "Ngày mai".

### T4-06 Các phiên học

Bảng phiên hoàn tất trong khoảng (`Table` trong `CardCustom`, rule giao diện), mới nhất trước, ba cột Giờ, Cách học, Kết quả: giờ (và ngày nếu khác hôm nay), nguồn ("Học theo lộ trình", "Ôn tập", "Học theo từ khóa", "Học một câu", "Học theo unit", "Kiểm tra nhanh", trùng tên lối vào của từng cách học), dải ô (C2) thể hiện kết quả từng câu. Dưới `sm` cột Cách học gộp vào dưới giờ trong cột đầu để dải ô không bị cắt. Tối đa 20 phiên, có nút "Xem thêm".

### T4-07 Chi tiết ngày

Chạm một cột của biểu đồ mở sheet (C6) "[Thứ], [ngày]/[tháng]": các phiên của ngày đó (như T4-06) và danh sách câu đã học trong ngày (câu gốc, trạng thái).

### T4-08 Chưa có dữ liệu

Khi chưa có phiên nào: thay toàn bộ nội dung dưới bộ chọn khoảng bằng "Bạn chưa hoàn thành phiên học nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến độ." và nút chính "Học 8 câu" (mở `/phien-hoc?nguon=lo-trinh`). "Chưa có phiên nào" nghĩa là chưa từng hoàn tất phiên nào; khi đã có phiên nhưng khoảng đang chọn không có phiên, màn vẫn hiện các chỉ số (bằng 0) và ẩn mục "Các phiên học".

### T4-09 Bố cục máy tính

Từ `lg`, sau đầu màn và ba chỉ số (vẫn rộng hết vùng nội dung), các khối mục tiêu tuần và lịch ôn tập xếp hai cột, biểu đồ rộng hết, các phiên học theo sau; thứ tự đọc giữ nguyên.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| T4-05: "7 ngày tới" có gồm "Ngày mai" không | Có, giữ như code đang làm | T4-05 |
| T4-04: cột hôm nay dùng `primary` trái FND-02 | Giữ, ghi là ngoại lệ của FND-02 | T4-04, FND-02 |
| T4-04: cột 30 ngày trên màn 320 px hẹp hơn vùng chạm 44 px | Giữ; danh sách Các phiên là đường thay thế, ghi là ngoại lệ của FND-14 | T4-04, FND-14 |
| T4-08: "chưa có phiên nào" nghĩa là gì | Chưa từng hoàn tất phiên nào, như code đang làm | T4-08 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (10/10/2026): chốt các câu hỏi mở (Claude quyết định theo ủy quyền của nhóm).
- 0.3 (18/10/2026): đổi tên khu thành "Tiến độ"; nhãn "phiên học", "câu cần ôn hôm nay", "Lịch ôn tập", "Các phiên học"; tên nguồn phiên trùng tên lối vào; câu khi chưa có phiên (theo phản hồi người dùng do nhóm chuyển); T4-03 đổi thành "Mục tiêu mỗi tuần" cho cùng tên với Cài đặt.
- 0.4 (20/10/2026): T4-06 thêm tên nguồn "Học theo unit" (Đợt 5 việc 3).
- 0.5 (20/10/2026): thêm T4-09 bố cục từ 1200 px (Đợt 5 việc 6).
- 1.0 (21/10/2026): Đợt 6 (Next.js, rule giao diện của nhóm): các phiên học là bảng (`Table`), ba chỉ số là panel, bố cục hai cột từ `lg`; route `/tien-do`.
- 1.1 (21/10/2026): theo rà soát ảnh bằng chứng Đợt 6: T4-02 ba chỉ số trong một khối; T4-06 bảng phiên trên màn hẹp; bảng phiên rộng hết vùng nội dung từ `lg` (T4-09). T4-03 mục tiêu tuần có tiêu đề section như Lịch ôn tập.
