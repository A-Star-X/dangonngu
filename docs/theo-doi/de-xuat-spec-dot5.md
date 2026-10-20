# Đề xuất sửa spec Đợt 5: việc 3, 1, 8, 10, 6

Trạng thái: chờ duyệt (20/10/2026). Soạn bởi Claude để nhóm duyệt một lần. Sau khi duyệt, mỗi việc áp đúng phần của nó vào các file `spec.md`, `acceptance.md` và commit `spec:` trên nhánh của việc đó, rồi mới code. Mã có chữ "(mới)" là mã chưa tồn tại, sẽ tạo khi áp.

Ràng buộc đã xét: FND-13 cấm lưới thẻ giống hệt nhau, nên danh sách Unit là các dòng có dải 8 ô (C2), không phải lưới card; mỗi màn tối đa một nút chính (FND-02); route vẫn dùng hash (QD-02); không thêm backend ngoài QD-06.

Thứ tự làm: 3 → 1 → 8 → 10 → 6. Việc 1 dùng lại dòng Unit của việc 3; việc 10 rà cả route mới của việc 3; việc 6 rà bố cục cuối cùng.

---

## Việc 3: Thư viện theo Unit và màn Chi tiết Unit

### T3: hai cách xem, mặc định là Unit

Bố cục (375 px):

```
┌───────────────────────────┐
│ Tiếng Anh ▾          ⚙    │
│ Thư viện                  │  tiêu đề màn (FND-15)
│ [ Unit | Câu ]            │  chọn cách xem
│ 576 unit · đã học 12      │  dòng tổng quan
│ A1 A2 B1 B2 C1 C2         │  trình độ (chỉ khi có unitId)
│                           │
│ Unit 1 · A1               │
│ Find your classroom       │
│ Tìm đúng phòng học        │
│ ■■■■■□□□          5/8     │  dải 8 ô và số câu đã nhớ
│ ───────────────────────── │
│ Unit 2 · A1               │
│ ...                       │
│ ‹ Trước   1/24    Sau ›   │
└───────────────────────────┘
```

Từ 900 px: các dòng Unit xếp thành lưới tự xuống hàng (cột tối thiểu 320 px), ngăn bằng đường kẻ, không có khung thẻ.

**T3-01 đến T3-07 (sửa):** giữ nguyên nội dung, chỉ áp cho cách xem "Câu" (`#/thu-vien?xem=cau`). Trang hiện tại giữ trong route (`?trang=`) để Back và tải lại không mất vị trí (gộp với việc 10).

**T3-08 Chọn cách xem (mới):** đầu màn có tiêu đề "Thư viện" và nút chọn hai cách xem "Unit" và "Câu", kiểu giống bộ chọn khoảng ở T4-01. Mặc định là Unit. Cách xem giữ trong route (`?xem=unit|cau`). Ô tìm câu chỉ có ở cách xem Câu; gõ tìm ở đó như T3-02.

**T3-09 Danh sách Unit (mới):** mỗi trang 24 unit. Mỗi dòng: "Unit n" (`--t-sm`, `--muted`) kèm mã trình độ khi có; `title` của unit (`--t-body` đậm 600, font theo ngôn ngữ đích); `translation` (Literata `--t-sm`, `--muted`); dải 8 ô (C2) theo trạng thái các câu của unit và số "x/N" câu đã nhớ bên phải. Unit chưa học câu nào: dải ô toàn ô trống, không có số. Chạm dòng mở Chi tiết Unit (`#/unit?so=n`). Không hiện từng câu ở danh sách này.

**T3-10 Tổng quan Unit (mới):** phía trên danh sách là một dòng "N unit · đã học x · đang học dở y" (đã học: mọi câu đã qua bước ghi nhớ; dở: có câu đã học nhưng chưa đủ). Khi bộ nội dung có `unitId`: hàng nút trình độ A1 đến C2 (chỉ trình độ có trong dữ liệu), mặc định trình độ của unit đang học trong lộ trình, giữ trong route (`?trinh-do=`).

### S10 Chi tiết Unit (khu mới, `fe/src/pages/S10-chi-tiet-unit/`)

```
┌───────────────────────────┐
│ ‹ Thư viện / Unit 12      │  đường dẫn (việc 10)
│ Unit 12 · A1              │
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
└───────────────────────────┘
```

**S10-01 Route và khung (mới):** route `#/unit?so=n`. Nằm trong khu Thư viện: có thanh trên cùng, thanh tab với mục Thư viện đang chọn (APP-01). `so` không hợp lệ thì chuyển về `#/thu-vien`.

**S10-02 Đầu màn (mới):** dòng "Unit n · trình độ" (`--t-sm`, `--muted`); `title` là tiêu đề màn (`h1`, `--t-xl`, font ngôn ngữ đích, có `lang`); `translation` (Literata `--t-body`, `--muted`); `situation` khi có (Literata `--t-sm`).

**S10-03 Tiến độ unit (mới):** dải 8 ô (C2) và dòng "Đã nhớ x · Cần ôn y · Chưa học z" (DATA-07).

**S10-04 Hành động (mới):** nút chính "Học unit này" mở `#/phien-hoc?nguon=unit&so=n`; khi mọi câu đã nhớ thì chữ nút là "Ôn lại unit này" (cùng hành động). Nút dạng chữ "Kiểm tra nhanh unit này" mở `#/kiem-tra?unit=n`.

**S10-05 Danh sách câu (mới):** tiêu đề khối "Các câu trong unit", các dòng như T3-01. Chạm dòng mở sheet Chi tiết câu như T3-05 (cả ở máy tính, không chia cột).

**S10-06 Unit trước và sau (mới):** cuối màn: "‹ Unit n-1" và "Unit n+1 ›", ẩn ở unit đầu và cuối.

### Sửa khu khác vì việc 3

- **S3-01:** thêm nguồn `unit`: các câu của unit số `so`.
- **DATA-06:** `nguon` của phiên thêm `unit`; `params` lưu thêm `so`.
- **T4-06:** tên nguồn phiên `unit` là "Học theo unit".
- **APP-04:** bảng route thêm `#/unit` (tham số `so`) và tham số `xem`, `trang`, `trinh-do` của `#/thu-vien`.
- **`docs/new/navigation.md`:** thêm mũi tên T3 → S10, S10 → S3, S10 → S5, S10 → T3.
- **`docs/new/ui-spec.md` mục 4:** thêm dòng S10 vào chỉ mục (G-04 đang chờ công ty, câu hỏi mở 3).

### Acceptance việc 3

- T3-AC (mới) [auto] T3-08: mở `#/thu-vien` thấy cách xem Unit; chọn Câu thì route có `?xem=cau` và danh sách câu như cũ; tải lại giữ cách xem.
- T3-AC (mới) [auto] T3-09: trang 1 có 24 dòng unit, dòng có tiến độ fixture hiện dải ô và "x/8" đúng; chạm dòng mở `#/unit?so=n`.
- T3-AC (mới) [auto] T3-10: dòng tổng quan đúng số với tiến độ fixture; Global English có nút trình độ, chọn B2 chỉ còn unit B2.
- T3-AC (mới) [claude] T3-09: ảnh 375, 1280, 1440 px sáng và tối; từ 900 px nhiều cột tự xuống hàng, không khung thẻ, không cuộn ngang.
- S10-AC (mới) [auto] S10-01 đến S10-06: đủ phần tử, đếm trạng thái đúng fixture, "Học unit này" mở đúng route, unit trước sau đúng, `so=9999` về T3.
- S10-AC (mới) [auto] S10-04, S3-01: phiên `nguon=unit` có đúng các câu của unit, tổng kết ghi nguồn "Học theo unit" ở T4.
- S10-AC (mới) [claude]: ảnh 375 và 1280 px, sáng và tối.
- Các mục T3-AC01 đến T3-AC10 hiện có: đổi đường dẫn mở thành `?xem=cau`, bỏ dấu đạt và kiểm lại.

---

## Việc 1: Trang Học bớt trống, nối tới Unit

**T1 bố cục mới.** Dưới 1200 px một cột theo thứ tự: mục tiêu tuần, thẻ câu, nút chính, câu cần ôn, Unit tiếp theo, Tiến độ của bạn. Từ 1200 px: cột chính (thẻ và nút chính, tối đa 560 px) và cột phụ (mục tiêu tuần, câu cần ôn, Unit tiếp theo, Tiến độ của bạn) trong lưới tự xuống hàng, không cố định hai cột (gộp với việc 6).

**T1-01 (sửa):** tên unit trong thẻ là liên kết mở Chi tiết Unit của unit đó (S10).

**T1-06 (sửa):** thay "Từ 900 px: hai cột" bằng bố cục mới ở trên.

**T1-07:** giữ (T1 vẫn chỉ hiện một câu).

**T1-08 Unit tiếp theo (mới):** tiêu đề khối "Unit tiếp theo", 3 unit kế tiếp trong lộ trình sau unit đang học, mỗi unit là một dòng như T3-09; liên kết "Xem tất cả unit" mở `#/thu-vien`. Ẩn khi đã học hết lộ trình.

**T1-09 Tiến độ của bạn (mới):** tiêu đề khối "Tiến độ của bạn": số câu đã học trên tổng số câu của bộ (ví dụ "29/4.096 câu"), thanh tiến độ, số unit đã học, liên kết "Xem tiến độ" mở T4. Số liệu lấy như T4-02, không có số mới.

**Acceptance việc 1:** [auto] T1-08 đúng 3 unit kế tiếp và mở đúng S10; [auto] T1-09 đúng số với fixture 30 ngày; [auto] tên unit trong thẻ mở S10; [claude] ảnh 375, 1280, 1440 px: ở 1440 px không còn khoảng trống lớn bên phải; các mục T1-AC hiện có kiểm lại.

---

## Việc 8: Luyện tập dừng, tiếp tục, màn kết thúc

S3 đã có thoát, lưu phiên dở và mở lại đúng câu (S3-07, S3-08) và màn tổng kết (S3-06). Việc 8 đưa các thứ đó sang Kiểm tra nhanh.

**S5-08 (sửa):** sheet xác nhận "Tạm dừng kiểm tra?" với dòng "Bài làm dở được lưu, lần sau làm tiếp từ câu này." và nút "Làm tiếp" (đóng sheet), "Tạm dừng" (lưu rồi về T2). Bỏ câu "Không lưu bài kiểm tra dở để làm tiếp."

**S5-09 Bài kiểm tra dở (mới):** lưu bài dở như S3-08: unit, các bước đã chọn, bước và câu đang làm. Mỗi ngôn ngữ tối đa một bài dở; bắt đầu bài mới thì bài dở cũ coi như kết thúc. Ở T2, mục Kiểm tra nhanh khi có bài dở hiện thêm dòng "Đang làm dở: Unit n, bước tên bước, câu x/N"; chạm thì mở lại đúng bước và câu. Màn bắt đầu S5 của đúng unit đó có nút chính "Làm tiếp" thay cho "Làm cả 3 bước", và nút dạng chữ "Làm lại từ đầu".

**S5-07 (sửa):** thêm khối "Câu cần xem lại": câu gốc và nghĩa của các câu sai ngay lần đầu, mỗi câu có nút Nghe; không có câu sai thì không hiện khối này.

**DATA-06 (sửa):** phiên `kiem-tra` lưu thêm `steps`, `stepIndex` và `position` để mở lại; quy tắc bỏ phần tử hỏng áp như phiên S3.

**Acceptance việc 8:** [auto] tạm dừng ở bước 3 câu 2, tải lại, T2 hiện dòng làm dở, chạm mở lại đúng bước và câu; [auto] "Làm lại từ đầu" bỏ bài dở; [auto] màn kết quả liệt kê đúng câu sai lần đầu; [claude] ảnh màn tạm dừng, dòng làm dở ở T2, khối câu cần xem lại.

---

## Việc 10: Điều hướng

**APP-04 (sửa):** mọi trạng thái màn người học muốn quay lại được đều nằm trong route: T3 thêm `xem`, `trang`, `trinh-do`; S10 `so`. Tải lại ở bất kỳ route nào hiện đúng màn và đúng trạng thái đó (trừ sheet đang mở). Back và Forward đi đúng lịch sử route, kể cả giữa T3 → S10 → S3.

**APP-13 Không dùng liên kết neo (mới):** không dùng `href="#..."` trỏ tới một phần trong trang, vì router hiểu phần sau `#` là route. Nhảy tới một phần trong trang phải cuộn bằng mã, không đổi hash.

**APP-14 Đường dẫn (mới):** màn cấp hai trong một khu (S10 trong Thư viện) có dòng đường dẫn đầu màn "Thư viện / Unit n", phần "Thư viện" là liên kết về đúng trang và cách xem đã mở trước đó. Khu chính T1 đến T4 không có đường dẫn (thanh tab đã cho biết đang ở đâu).

**APP-01 (sửa):** khi ở S10, mục Thư viện trên thanh tab ở trạng thái đang chọn.

**Acceptance việc 10:** [auto] test đi hết các mũi tên của `navigation.md`: với mỗi route, tải lại thì đúng màn; chuỗi T1 → T3 (trang 3) → S10 → S3 → Thoát → Back, Forward đúng thứ tự; [auto] quét mã nguồn không có `href="#` ngoài route; [claude] ảnh đường dẫn ở S10.

---

## Việc 6: Responsive

**APP-07 (sửa):** bỏ cách chia "T1 và T3 hai cột" cố định từ 900 px. Thay bằng quy tắc: bố cục nhiều cột chỉ dùng lưới tự xuống hàng theo độ rộng tối thiểu của cột, không cố định số cột; dưới 1200 px các trang T1, T3 một cột. Giữ thanh dọc trái từ 900 px, lề, độ rộng tối đa 1120 px.

**T3-07 (sửa):** chi tiết câu ở cột phải chỉ từ 1200 px; dưới 1200 px dùng sheet như T3-05.

**T2, T4, S8 (sửa):** từ 1200 px các khối của màn xếp vào lưới tự xuống hàng (cột tối thiểu 360 px) thay cho một cột rộng 720 px, để ở 1440 px không còn khoảng trắng lớn bên phải. Thứ tự đọc giữ như một cột.

**Acceptance việc 6:** [auto] đo ở 320, 375, 768, 1024, 1280, 1440 px trên mọi route: không cuộn ngang, vùng chạm từ 44 px, ở 1440 px khối nội dung chiếm từ 80% vùng nội dung trở lên; [claude] ảnh mọi màn ở 6 khổ, sáng và tối.

---

## Việc 12: Kiểm tổng

Không có spec mới. Chạy `npm test`, `npm run build`, `npm run test:e2e`, `npm run spec:check`, `npm run evidence`; xem lại ảnh; đánh dấu các mục `[auto]` và `[claude]` có bằng chứng; liệt kê các mục `[human]` cần người kiểm trên thiết bị thật.

## Câu hỏi cần bạn trả lời khi duyệt

1. T3 mặc định mở cách xem Unit (đề xuất) hay Câu như hiện nay?
2. Mỗi trang 24 unit có hợp không? (Fluency có 512 unit, Global English 576 unit.)
3. Nút trình độ ở T3 mặc định là trình độ đang học (đề xuất) hay "Tất cả"?
4. Kiểm tra nhanh tạm dừng rồi làm tiếp (đề xuất) có đúng ý "Pause, Resume" của việc 8 không?
