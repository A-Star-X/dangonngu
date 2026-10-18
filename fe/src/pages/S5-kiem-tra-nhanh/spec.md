---
id: S5
title: Kiểm tra nhanh
status: nháp
version: 0.1
route: "#/kiem-tra"
depends: APP, FND, DATA, C3, C4, C6
legacy: L-D6, L-D6b
---

# S5 Kiểm tra nhanh

Màn toàn trang (APP-03). Ba dạng bài chạy nối tiếp trên cùng một nhóm câu (một unit). Thay cho TEST NOW (T01, T02, T03) của bản cũ, với tên dễ hiểu.

## Bố cục

```
┌───────────────────────────┐
│ ✕ Thoát   Nghe và chọn nghĩa │
│ ●───○───○   Câu 2/8       │  chỉ báo 3 bước
│                           │
│        (◉ Nghe lại)       │
│                           │
│ 1 Tôi muốn đặt một bàn... │
│ 2 ...                     │
│ 3 ...                     │
│ 4 ...                     │
└───────────────────────────┘
```

## Yêu cầu

### S5-01 Màn bắt đầu

Mở `#/kiem-tra` (nhóm câu là unit trong tham số `unit`, mặc định unit đang học trong lộ trình) hiện: tên unit, số câu, mô tả ngắn ba bước, nút chính "Làm cả 3 bước", và ba nút dạng chữ để chỉ làm một bước: "Chỉ nghe và chọn nghĩa", "Chỉ nghe theo cụm", "Chỉ sắp xếp câu".

### S5-02 Chỉ báo bước

Đầu màn khi đang làm: nút "Thoát", tên bước hiện tại, chỉ báo 3 chấm nối nhau (bước đã xong, đang làm, chưa làm; khi chỉ làm một bước thì chỉ có một chấm) và "Câu n/N".

### S5-03 Bước 1: Nghe và chọn nghĩa

Mỗi câu: tự phát âm câu gốc một lần khi vào câu (không hiện chữ câu gốc), có nút "Nghe lại". Chọn nghĩa trong 4 lựa chọn (C4, DATA-08). Sau khi chọn đúng, hiện chữ câu gốc và nút chính "Câu tiếp". Khi thiết bị không có giọng đọc cho ngôn ngữ đích: hiện chữ câu gốc ngay từ đầu kèm dòng "Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh." Trong lúc trình duyệt còn nạp danh sách giọng (tối đa 1,5 giây), bước 1 chưa hiện câu hỏi, 4 lựa chọn, nút "Nghe lại" lẫn chữ câu gốc; biết có giọng hay không rồi mới hiện tất cả cùng lúc, để không có gì bị đẩy xuống dưới tay người đang bấm.

### S5-04 Bước 2: Nghe theo cụm

Câu gốc được chia thành cụm bằng `Intl.Segmenter` theo từ: câu có tối đa 1 từ thì 1 cụm; 2 đến 3 từ thì 2 cụm; 4 đến 7 từ thì 3 cụm; từ 8 từ thì 4 cụm; số từ chia đều, phần dư dồn vào các cụm đầu. Các cụm hiện thành hàng nút che chữ theo thứ tự; chạm một cụm thì hiện chữ cụm đó và đọc cụm đó. Hiện hết các cụm thì đọc cả câu và hiện nút chính "Câu tiếp". Không thu âm, không chấm phát âm. Câu chỉ có 1 cụm bị bỏ qua ở bước này.

### S5-05 Bước 3: Sắp xếp câu

Dùng các cụm như S5-04, hiện xáo trộn (xáo tất định theo `id` câu, không trùng thứ tự đúng). Chạm một cụm để đưa xuống hàng đáp án; chạm cụm trong hàng đáp án để trả về. Đủ cụm thì nút chính "Kiểm tra" mở. Đúng: viền `--known` cả hàng, nút thành "Câu tiếp". Sai: cụm sai vị trí viền 2 px `--wrong`, nền `--wrong-soft`, kèm icon dấu x (FND-02); dưới khu xếp hiện dòng chữ `--wrong` "Chưa đúng. Nhấn các cụm có dấu x để đưa về hàng cụm, rồi xếp lại." (cũng là nội dung vùng `aria-live`), cho sắp lại; đổi bất kỳ cụm nào thì bỏ đánh dấu và dòng chữ. Đúng: dòng chữ `--known` "Đúng". Hướng dẫn ở bước 2 là "Nhấn từng cụm để nghe.", ở bước 3 khi hàng đáp án còn trống là "Nhấn các cụm bên dưới theo đúng thứ tự." Câu chỉ có 1 cụm bị bỏ qua ở bước này. Dùng bàn phím: nhấn một cụm đang có focus thì focus chuyển sang cụm kế bên trong cùng hàng; xếp hết cụm thì sang nút "Kiểm tra". Giữ Enter chỉ tính một lần nhấn.

### S5-06 Nghĩa hiển thị

Ở bước 2 và 3 chỉ hiện nghĩa của cả câu (phía trên khu làm bài), không ghép nghĩa cho từng cụm, vì cách chia cụm theo số từ không bảo đảm cụm tiếng Việt khớp nghĩa cụm câu gốc.

### S5-07 Kết quả

Sau bước cuối: tiêu đề "Xong kiểm tra", với mỗi bước đã làm là số câu đúng ngay lần đầu trên số câu của bước đó (ví dụ "Nghe và chọn nghĩa: 6/8"), và tổng số câu đã kiểm tra. Nút chính "Kiểm tra unit tiếp theo" (ẩn ở unit cuối), nút dạng chữ "Xong" (về `#/luyen-tap`). Kết quả từng câu ghi vào tiến độ (DATA-06), câu sai đầu tiên ở bất kỳ bước nào thành Cần ôn (DATA-07). Bước Nghe theo cụm không có đúng sai: kết quả ghi số câu đã làm xong trên số câu của bước (ví dụ "Nghe theo cụm: 8/8") và không ghi lượt vào tiến độ, nên phiên chỉ có bước này được tính là phiên hoàn tất nhưng không tính câu nào là đã học.

### S5-08 Thoát giữa chừng

Như S3-07: sheet xác nhận "Dừng kiểm tra? Kết quả các câu đã làm vẫn được lưu." với nút "Làm tiếp" và "Dừng". Không lưu bài kiểm tra dở để làm tiếp. Bấm "Dừng" thì về T2 Luyện tập (cùng chỗ với nút "Xong" ở S5-07), kể cả khi S5 được mở thẳng bằng đường dẫn; nút "Thoát" ở màn bắt đầu cũng về T2.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| S5-07: cách hiện kết quả bước Nghe theo cụm | Giữ "Nghe theo cụm: x/y" (số câu đã làm xong) | S5-07 |
| Có thêm loại lượt cho bước Nghe theo cụm không | Không thêm; phiên chỉ có bước này tính là phiên hoàn tất, không tính câu đã học | S5-07, DATA-06 |
| S5-08: bấm Dừng thì về đâu | Luôn về T2 Luyện tập, giống nút Xong và sơ đồ điều hướng | S5-08, S5-AC08 |
| S5-03: khối chữ câu gốc đẩy 4 lựa chọn xuống khi hết thời gian chờ giọng | Chỉ hiện câu hỏi và 4 lựa chọn sau khi biết có giọng hay không | S5-03, S5-AC03 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (10/10/2026): chốt các câu hỏi mở (Claude quyết định theo ủy quyền của nhóm): kết quả bước Nghe theo cụm, không thêm loại lượt, Dừng luôn về T2, bước 1 chờ biết có giọng rồi mới hiện lựa chọn.
- 0.3 (18/10/2026): S5-05 cụm xếp sai dùng đỏ `--wrong`, thêm dòng báo nhìn thấy được; chữ hướng dẫn dùng "nhấn" (theo phản hồi người dùng do nhóm chuyển); S5-05 giữ focus khi xếp cụm bằng bàn phím (sửa lỗi tìm thấy khi rà soát code).
