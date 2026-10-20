---
id: APP
title: Khung app
status: nháp
version: 0.1
depends: FND, DATA, C5, C6, C7
legacy: L-S0, L-S2 (header), pwa-update
---

# APP Khung app

Khung bao quanh mọi trang: điều hướng, route, thanh trên cùng, bố cục theo khổ màn hình, trạng thái toàn cục, cách trang học chính mở app và đường quay về trang học chính.

## Yêu cầu

### APP-01 Bốn khu chính

App có đúng 4 khu chính, theo thứ tự: T1 Học, T2 Luyện tập, T3 Thư viện, T4 Tiến độ. Dưới 900 px chuyển khu bằng thanh tab dưới đáy (C5). Từ 900 px trở lên dùng thanh điều hướng dọc bên trái rộng 220 px, cùng 4 mục và cùng thứ tự.

### APP-02 Thanh trên cùng

Mọi khu chính có thanh trên cùng cao 56 px gồm: ngoài cùng bên trái là nút về trang học chính (APP-12), tiếp theo là tên ngôn ngữ đang học kèm mũi tên xuống, và với ngôn ngữ có nhiều bộ nội dung thì thêm tên bộ ở dòng nhỏ bên dưới (`--t-sm`, `--muted`, ví dụ "Global English") (chạm mở sheet Đổi ngôn ngữ, APP-06); bên phải là nút Cài đặt (icon bánh răng, nhãn trợ năng "Cài đặt") mở S8.

### APP-03 Màn toàn trang

S1 Chọn ngôn ngữ, S3 Phiên học, S5 Kiểm tra nhanh chiếm toàn bộ khung, ẩn thanh tab và thanh trên cùng. S3 và S5 có nút "Thoát" ở góc trên bên trái.

### APP-04 Bảng route

Route dùng hash (QD-02). Đây là nguồn chân lý cho điều hướng.

| Route | Màn | Ghi chú |
|---|---|---|
| `#/chon-ngon-ngu` | S1 | |
| `#/hoc` | T1 | Route mặc định khi đã chọn ngôn ngữ |
| `#/luyen-tap` | T2 | |
| `#/thu-vien` | T3 | Tham số tùy chọn `?xem=unit|cau`, `?trinh-do=`, `?unit=`, `?q=` |
| `#/unit` | S10 | Tham số `?so=`; thuộc khu Thư viện: có thanh trên cùng, thanh tab với mục Thư viện đang chọn |
| `#/tien-bo` | T4 | Tham số tùy chọn `?khoang=1|7|30` |
| `#/cai-dat` | S8 | Mở như một khu, có nút quay lại |
| `#/phien-hoc` | S3 | Tham số `?nguon=lo-trinh|on-tap|tu-khoa|cau|unit` và tham số theo nguồn |
| `#/kiem-tra` | S5 | Tham số tùy chọn `?unit=` |

Route không hợp lệ chuyển về `#/hoc` (hoặc `#/chon-ngon-ngu` nếu chưa chọn ngôn ngữ). Nút Back của trình duyệt đi ngược đúng lịch sử route.

### APP-05 Khởi động

Khi mở app: nếu chưa có ngôn ngữ đã lưu thì vào S1; nếu đã có thì vào T1 với ngôn ngữ đó. Trong lúc tải dữ liệu, hiện khung xương (APP-08), không hiện màn trắng quá 300 ms.

### APP-06 Sheet Đổi ngôn ngữ

Sheet (C6) "Đổi ngôn ngữ hoặc bộ nội dung" liệt kê các ngôn ngữ như S1 (cùng nội dung dòng, S1-02 và S1-03); ngôn ngữ có nhiều bộ được tách thành một dòng cho mỗi bộ ("Tiếng Anh, Global English", "Tiếng Anh, English Fluency"). Dòng đang dùng được đánh dấu. Chọn dòng khác thì đóng sheet, tải dữ liệu ngôn ngữ hoặc bộ đó và về T1. Tiến độ của từng cặp bộ và ngôn ngữ giữ riêng (DATA-06).

### APP-07 Bố cục theo khổ màn hình

App dùng được cả trên web và trên điện thoại, thiết kế responsive. Giai đoạn đầu ưu tiên web trên máy tính: thiết kế và nghiệm thu khổ máy tính trước (1440 và 1280 px), sau đó tới máy tính bảng và điện thoại.

| Chiều rộng | Bố cục |
|---|---|
| 320 đến 599 px | Một cột, lề 16 px, thanh tab dưới đáy, sheet trượt từ dưới lên |
| 600 đến 899 px | Một cột, lề 24 px, nội dung rộng tối đa 560 px nằm giữa, chữ trong khối vẫn căn trái |
| 900 px trở lên | Thanh điều hướng dọc trái 220 px; T1 và T3 hai cột (nêu trong spec trang); S3 và S5 có khối nội dung giữa màn rộng tối đa 720 px; sheet hiển thị thành hộp thoại giữa màn |
| 1440 px trở lên | Như trên; vùng nội dung bên phải thanh điều hướng rộng tối đa 1120 px, căn giữa |

Không có thanh cuộn ngang ở bất kỳ khổ nào từ 320 px.

### APP-08 Trạng thái toàn cục

| Trạng thái | Hiển thị |
|---|---|
| Đang tải dữ liệu | Khung xương đúng hình khối sẽ hiện (thẻ câu, danh sách); không dùng vòng xoay giữa màn |
| Lỗi tải dữ liệu | "Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại." và nút "Thử lại" |
| Ngoại tuyến | Dải mỏng ngay dưới thanh trên cùng: "Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy." Tự ẩn khi có mạng lại |
| Bộ nhớ trình duyệt bị chặn | Dải cảnh báo: "Trình duyệt đang chặn lưu tiến độ, tiến độ sẽ mất khi đóng app. Cho phép trang này lưu trên máy trong cài đặt trình duyệt rồi mở lại app." |

### APP-09 Cách trang chính mở app

Trang học chính mở mini app bằng một trang mới (tab mới hoặc chuyển thẳng trang), không nhúng iframe (nhóm chốt ngày 10/10/2026). App không đọc hay ghi `window.top` / `window.parent`, không dựa vào postMessage, không yêu cầu đăng nhập và bỏ qua mọi tham số URL mà trang chính gửi kèm. App vẫn chạy đúng khi bị nhúng trong iframe, để nếu sau này đổi cách mở thì không phải sửa code. Tôn trọng vùng an toàn của màn hình (`env(safe-area-inset-*)`). Đường quay về trang học chính: APP-12.

### APP-10 Ngoại tuyến và cập nhật

Sau lần mở đầu tiên có mạng, app mở lại được khi ngoại tuyến với ngôn ngữ đã tải. Khi có bản mới, hiện thông báo ngắn (C7) "Có bản cập nhật" với nút "Cập nhật"; chỉ tải lại khi người dùng bấm, và không hiện thông báo này khi đang ở S3 hoặc S5. Bản mới tự kích hoạt trong service worker nhưng trang đang mở không tự tải lại. Ở lần mở đầu tiên có mạng, ngay khi service worker nhận trang, app tải lại các file dữ liệu đã dùng để lưu ngoại tuyến; font Noto của ngôn ngữ không dùng chữ Latinh được lưu từ lần mở có mạng thứ hai, trước đó câu hiện bằng font sẵn có của máy.

### APP-11 Một lớp phủ tại một thời điểm

Tại mỗi thời điểm có tối đa một sheet hoặc hộp thoại mở. Mở sheet mới thì sheet đang mở phải đóng trước.

### APP-12 Nút về trang học chính

Vì app mở bằng trang mới (APP-09), app có một nút để người học quay về trang học chính.

- Vị trí: ngoài cùng bên trái thanh trên cùng của T1 đến T4 (APP-02), trước tên ngôn ngữ; và góc trên bên trái của S1 bước 1 (danh sách ngôn ngữ). Không có ở S1 bước 2 (đã có "Quay lại" về danh sách ngôn ngữ), S3 và S5 (đã có "Thoát"), S8 (đã có "Quay lại" về khu chính).
- Hiển thị: icon mũi tên trái (FND-10), nhãn trợ năng "Quay lại trang học", vùng chạm tối thiểu 44 x 44 px (FND-14). Từ 600 px hiện thêm chữ "Trang học" cạnh icon.
- Hành động: là một liên kết thường, mở địa chỉ trang học chính ngay trong trang đang xem. Địa chỉ cấu hình lúc build (`VITE_HOST_URL`), mặc định là trang chủ `https://language.pomaskhoahocnaobo.com/`; khi có đường dẫn chính xác của Trung tâm ứng dụng thì đổi biến này, không sửa code. Không dùng `history.back()`: lịch sử route hash của app nằm trước trang học chính, và khi app mở bằng tab mới thì tab không có trang trước.
- Bấm khi đang có phiên dở thì không hỏi; tiến độ đã lưu trên máy (DATA-06) và phiên dở mở lại được lần sau (S3-08).
- Nếu trang chính mở app bằng tab mới thì bấm nút sẽ mở trang học chính ngay trong tab của app, tab trang học cũ vẫn còn. Không đóng tab bằng mã (`window.close()` chỉ chạy được trong một số trường hợp) và không đọc `window.opener` (APP-09).

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| APP-12: nút về trang chủ hay về thẳng Trung tâm ứng dụng | Về trang chủ `https://language.pomaskhoahocnaobo.com/`; đổi bằng `VITE_HOST_URL` khi có đường dẫn Trung tâm ứng dụng | APP-12 |
| APP-10: cách kích hoạt bản mới và lưu font ngoại tuyến | Giữ cách đang làm | APP-10 |
| APP-09, APP-12: trang chính mở app bằng tab mới hay chuyển thẳng trang | Giữ liên kết mở trang học chính trong tab đang xem; không đóng tab bằng mã. Cách trang chính mở app kiểm ở APP-AC20 | APP-12 |
| APP-08: câu cảnh báo bộ nhớ bị chặn chưa có hướng xử lý (phát hiện khi rà FND-AC12) | Thêm hướng xử lý, bỏ chữ "dữ liệu" | APP-08 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.3 (08/10/2026): cập nhật theo bộ dữ liệu khách gửi và câu trả lời của nhóm (ưu tiên web, responsive; đủ 15 ngôn ngữ; không đọc tiến độ bản cũ).
- 0.4 (10/10/2026): chốt cách trang chính mở app là trang mới, không nhúng iframe (APP-09, đổi tên từ "Chạy trong iframe"); thêm nút về trang học chính (APP-12); APP-02 có thêm nút này ở bên trái.
- 0.5 (10/10/2026): chốt các câu hỏi mở (Claude quyết định theo ủy quyền của nhóm): APP-10 ghi rõ cách kích hoạt bản mới và lưu ngoại tuyến; APP-12 chốt địa chỉ mặc định và trường hợp trang chính mở tab mới; APP-08 đổi câu cảnh báo bộ nhớ bị chặn cho có hướng xử lý (FND-12).
- 0.6 (18/10/2026): T4 đổi tên thành "Tiến độ"; câu lỗi tải dùng "nhấn"; câu ngoại tuyến gọi người học là "bạn" (theo phản hồi người dùng do nhóm chuyển).
- 0.7 (20/10/2026): APP-04 thêm route `#/unit` (S10) và tham số cách xem, trình độ của T3; nguồn phiên `unit` (Đợt 5 việc 3).
