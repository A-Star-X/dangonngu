---
id: S3
title: Phiên học
status: nháp
version: 0.1
route: "#/phien-hoc"
depends: APP, FND, DATA, C1, C2, C3, C4, C6
legacy: L-D1, L-D2, L-D2b
---

# S3 Phiên học

Màn toàn trang (APP-03). Người học đi qua một nhóm tối đa 8 câu; với mỗi câu: tự nhớ câu gốc từ nghĩa (S3a), rồi kiểm tra nhận diện (S3b). Kết thúc ở tổng kết (S3c).

## Bố cục

S3a Ghi nhớ:

```
┌───────────────────────────┐
│ ✕ Thoát        Câu 4/8    │
│ ■■■▣□□□□                  │
│                           │
│ Tôi muốn đặt một bàn      │
│ cho hai người.            │
│                           │
│ ┌───────────────────────┐ │
│ │ Nhấn để hiện câu gốc  │ │
│ └───────────────────────┘ │
│                           │
│ [Cần ôn lại]   [Tôi nhớ]  │  khóa tới khi hiện câu gốc
└───────────────────────────┘
```

S3b Kiểm tra:

```
┌───────────────────────────┐
│ ✕ Thoát        Câu 4/8    │
│ ■■■▣□□□□                  │
│ Câu này nghĩa là gì?      │
│ I'd like to book a table  │
│ for two.         (◉ Nghe) │
│                           │
│ 1 Tôi muốn đặt một bàn... │
│ 2 Tôi muốn biết...        │
│ 3 ...                     │
│ 4 ...                     │
│            Xem gợi ý      │
└───────────────────────────┘
```

S3c Tổng kết:

```
┌───────────────────────────┐
│ Xong phiên học            │
│ ■■■■■■■■                  │
│ 6/8                       │  --t-3xl
│ câu nhớ được không cần    │
│ gợi ý                     │
│ Cần ôn lại:               │
│  I'd like to book...      │
│  Could you tell me...     │
│ [   Học tiếp 8 câu    ]   │
│  Xem tiến độ     Xong     │
└───────────────────────────┘
```

Khổ máy tính (1280 px): màn toàn trang, khối nội dung giữa rộng tối đa 720 px (APP-07), các phím tắt hiện cạnh nút tương ứng.

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ✕ Thoát                                                         Câu 4/8    │
│                  ■■■▣□□□□                                                  │
│                  Tôi muốn đặt một bàn cho hai người.                       │
│                  ┌──────────────────────────────────────────┐              │
│                  │ Chạm hoặc nhấn Space để hiện câu gốc     │              │
│                  └──────────────────────────────────────────┘              │
│                  [ Cần ôn lại   1 ]          [ Tôi nhớ   2 ]               │
└────────────────────────────────────────────────────────────────────────────┘
```

## Yêu cầu

### S3-01 Nguồn câu của phiên

Tham số `nguon` quyết định nhóm câu:

| `nguon` | Nhóm câu |
|---|---|
| `lo-trinh` | Các câu của unit tiếp theo trong lộ trình (DATA-11) |
| `on-tap` | Tối đa 8 câu Cần ôn (DATA-07), ưu tiên câu có `due` sớm nhất |
| `tu-khoa` | 8 câu thứ k trong kết quả tìm (tham số `q`, `nhom`), từ T2-03 |
| `cau` | Các câu của unit chứa câu có `id` được truyền (tham số `id`), từ T3-05 |

Nhóm rỗng (ví dụ không còn câu cần ôn): không vào phiên, quay về màn trước và hiện thông báo ngắn (C7) "Không có câu nào để học trong nhóm này."

### S3-02 Khung phiên

Đầu màn: nút "Thoát" bên trái, "Câu n/N" bên phải, dải ô (C2) bên dưới cập nhật theo kết quả từng câu. Mỗi câu đi theo thứ tự S3a rồi S3b; xong S3b của câu cuối thì sang S3c.

### S3-03 Bước ghi nhớ

Hiện thẻ câu (C1) ở trạng thái che câu gốc. Cặp nút đánh giá (C3-03) bị khóa cho tới khi câu gốc được hiện. Chọn "Tôi nhớ" hoặc "Cần ôn lại" ghi kết quả (DATA-06, DATA-07) và chuyển sang S3b của cùng câu.

### S3-04 Bước kiểm tra

Hiện câu gốc (font và cỡ như C1, có nút Nghe) với câu hỏi "Câu này nghĩa là gì?" và 4 lựa chọn (C4) theo DATA-08. Khi chọn đúng, hiện nút chính "Câu tiếp" (câu cuối: "Xem tổng kết").

### S3-05 Gợi ý

Ở S3b có nút dạng chữ "Xem gợi ý". Bấm thì hiện dưới câu gốc: "Nghĩa bắt đầu bằng "[chữ đầu tiên của nghĩa đúng]…", gồm [số từ] từ." Câu đó được ghi là đã dùng gợi ý (`hinted`), tính theo DATA-07; việc mở gợi ý được lưu ngay vào phiên (DATA-06), nên thoát hay tải lại trang rồi làm tiếp vẫn hiện gợi ý và vẫn tính là đã dùng gợi ý. Gợi ý chỉ dùng được một lần mỗi câu.

### S3-06 Tổng kết phiên

S3c hiện: tiêu đề "Xong phiên học"; dải ô cuối cùng; số câu đúng ở S3b lần đầu và không dùng gợi ý, dạng "x/N" cỡ `--t-3xl` kèm dòng "câu nhớ được không cần gợi ý"; danh sách câu gốc của các câu thành Cần ôn trong phiên (nếu có). Nút chính "Học tiếp N câu" (bắt đầu phiên lộ trình tiếp theo; ẩn khi đã học hết lộ trình); riêng phiên có `nguon=tu-khoa` và còn nhóm sau, nút chính là "Nhóm tiếp" (mở nhóm k+1 của cùng từ khóa); nút dạng chữ "Xem tiến độ" (tới `#/tien-bo`) và "Xong" (tới `#/hoc`).

### S3-07 Thoát giữa phiên

Bấm "Thoát" (hoặc Esc, hoặc Back của trình duyệt) khi phiên chưa xong: mở sheet xác nhận (C6) "Dừng phiên học?" với dòng "Bạn đã học n/N câu. Kết quả các câu này vẫn được lưu." (khi chưa xong câu nào: "Bạn chưa học xong câu nào.") với nút "Học tiếp" (đóng sheet) và "Dừng" (về màn đã mở phiên). Kết quả các câu đã làm được giữ.

### S3-08 Phiên dở

Phiên đã dừng được lưu kèm vị trí (`position`) và bước hiện tại. Mở lại từ T1-02 thì tiếp tục đúng câu và đúng bước. Chỉ có tối đa một phiên dở mỗi ngôn ngữ; bắt đầu phiên mới thì phiên dở cũ coi như kết thúc.

### S3-09 Điều khiển

Không dùng vuốt để chuyển câu. Trên bàn phím: Space hiện câu gốc; phím 1 là "Cần ôn lại", phím 2 là "Tôi nhớ" (ở S3a); phím 1 đến 4 chọn đáp án (ở S3b); Enter là nút chính đang hiện. Giữ phím thì chỉ tính một lần nhấn (bỏ qua sự kiện lặp của bàn phím), để phím 1 hay 2 giữ lâu ở S3a không tự chọn đáp án ở S3b.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (18/10/2026): đổi chữ: "Nhấn để hiện câu gốc", "Xong phiên học", "Xem tiến độ", sheet "Dừng phiên học?" (theo phản hồi người dùng do nhóm chuyển); S3-05 lưu việc mở gợi ý vào phiên; S3-09 bỏ qua phím lặp khi giữ phím (sửa lỗi tìm thấy khi rà soát code); sheet dừng có câu riêng khi chưa xong câu nào.
