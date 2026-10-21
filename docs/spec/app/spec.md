---
id: APP
title: Khung app
status: nháp
version: 1.1
depends: FND, DATA, C5, C6, C7, C8, AU
legacy: L-S0, L-S2 (header), pwa-update
---

# APP Khung app

Khung bao quanh mọi trang: điều hướng, route, header, bố cục theo khổ màn hình, trạng thái toàn cục, ngôn ngữ giao diện, SEO, cách trang học chính mở app và đường quay về trang học chính. Từ Đợt 6 app là website Next.js (QD-01): trang công khai (LP, AU) và khu học cần đăng nhập (AU-05) bọc trong khung C5.

## Yêu cầu

### APP-01 Bốn khu chính

Khu học có đúng 4 khu chính, theo thứ tự: T1 Học, T2 Luyện tập, T3 Thư viện, T4 Tiến độ, chuyển khu bằng thanh bên (C5-01; dưới `md` là menu trượt, C5-02). Màn cấp hai của một khu (S10 Chi tiết Unit thuộc Thư viện) giữ mục của khu đó ở trạng thái đang chọn (C5-03).

### APP-02 Header

Mọi trang của khu học có header cố định cao 56 px (C5-05). Ngôn ngữ đang học và bộ nội dung (với ngôn ngữ có nhiều bộ thì thêm tên bộ ở dòng nhỏ, ví dụ "Global English") hiện ở nút đầu thanh bên, chạm mở sheet Đổi ngôn ngữ (APP-06). Cài đặt (S8) mở từ mục "Cài đặt" của nhóm Tài khoản trên thanh bên.

### APP-03 Màn học tập trung

S1 Chọn ngôn ngữ, S3 Phiên học, S5 Kiểm tra nhanh nằm trong khung khu học như các màn khác (rule giao diện: mọi route đã đăng nhập bọc khung). S3 và S5 có nút "Thoát" ở đầu khối nội dung, khối nội dung rộng tối đa 672 px giữa vùng nội dung; rời màn bằng thanh bên hay nút Back khi đang làm dở thì hỏi trước (S3-07, S5-08).

### APP-04 Bảng route

Route là đường dẫn thật, không có dấu `#` (QD-02), không có tiền tố ngôn ngữ giao diện (APP-15). Đây là nguồn chân lý cho điều hướng.

| Route | Màn | Cần đăng nhập | Ghi chú |
|---|---|---|---|
| `/` | Landing (LP) | Không | |
| `/dang-nhap` | Đăng nhập (AU-01) | Không | Tham số tùy chọn `?tiep=` (AU-05) |
| `/dang-ky` | Đăng ký (AU-02) | Không | Tham số tùy chọn `?tiep=` |
| `/chon-ngon-ngu` | S1 | Có | |
| `/hoc` | T1 | Có | Route mặc định sau khi đăng nhập; `?huong-dan=1` mở lại S9 |
| `/luyen-tap` | T2 | Có | |
| `/thu-vien` | T3 | Có | Tham số tùy chọn `?xem=unit|cau`, `?trinh-do=`, `?unit=`, `?q=`, `?trang=` |
| `/thu-vien/unit` | S10 | Có | Tham số `?so=`; thuộc khu Thư viện |
| `/tien-do` | T4 | Có | Tham số tùy chọn `?khoang=1|7|30` |
| `/cai-dat` | S8 | Có | `?giong=1` mở thẳng sheet Giọng đọc |
| `/phien-hoc` | S3 | Có | Tham số `?nguon=lo-trinh|on-tap|tu-khoa|cau|unit`, tham số theo nguồn và `?phien=` |
| `/kiem-tra` | S5 | Có | Tham số tùy chọn `?unit=`, `?tiep=1` |

Đường dẫn không có trong bảng chuyển về `/hoc` (chưa đăng nhập thì AU-05, chưa chọn ngôn ngữ thì APP-05). Liên kết kiểu cũ có dấu `#` (ví dụ `/#/thu-vien?xem=cau`, `#/tien-bo`) chuyển sang đường dẫn mới tương ứng (`#/unit` thành `/thu-vien/unit`, `#/tien-bo` thành `/tien-do`). Nút Back và Forward của trình duyệt đi đúng lịch sử route, kể cả chuỗi T3 → S10 → S3. Trạng thái màn mà người học muốn quay lại được đều nằm trong route: ở T3 là cách xem, trình độ, unit, từ khóa và trang đang xem (đổi trang, đổi bộ lọc thì thay route, không thêm lịch sử); ở S10 là số unit. Tải lại trang ở bất kỳ route nào thì hiện đúng màn và đúng các trạng thái đó; sheet đang mở thì đóng.

### APP-05 Khởi động

Khi mở một route của khu học: chưa đăng nhập thì AU-05. Đã đăng nhập: chưa có ngôn ngữ đã lưu thì vào S1 (máy mới của tài khoản đã có ngôn ngữ thì chờ lấy dữ liệu tài khoản trước, DATA-14); đã có thì mở đúng route với ngôn ngữ đó. Trong lúc tải dữ liệu, hiện khung xương (APP-08), không hiện màn trắng quá 300 ms.

### APP-06 Sheet Đổi ngôn ngữ

Sheet (C6) "Đổi ngôn ngữ hoặc bộ nội dung" liệt kê các ngôn ngữ như S1 (cùng nội dung dòng, S1-02 và S1-03); ngôn ngữ có nhiều bộ được tách thành một dòng cho mỗi bộ ("Tiếng Anh, Global English", "Tiếng Anh, English Fluency"). Dòng đang dùng được đánh dấu. Chọn dòng khác thì tải dữ liệu ngôn ngữ hoặc bộ đó, đóng sheet và về T1; tải lỗi thì thông báo lỗi có nút "Thử lại". Tiến độ của từng cặp bộ và ngôn ngữ giữ riêng (DATA-06). Mở từ nút ngôn ngữ trên thanh bên (APP-02) và từ S8-01.

### APP-07 Bố cục theo khổ màn hình

Thiết kế mobile trước: style mặc định cho màn hẹp, `sm:` / `md:` / `lg:` / `wide:` (1200 px) nới cho màn rộng. Mốc kiểm tra: khoảng 375 px (đọc được, bấm được, không vỡ) và khoảng 1280 px (không trống, thứ bậc rõ).

| Chiều rộng | Bố cục |
|---|---|
| Dưới 768 px (`md`) | Khung C5 với menu trượt; một cột; sheet trượt từ dưới lên |
| Từ 768 px | Thanh bên 240 px cố định; nội dung rộng tối đa 1024 px giữa vùng còn lại; sheet là hộp thoại giữa màn |
| Từ 1200 px (`wide`) | Các khu chính dùng thêm chiều ngang theo spec trang (T1-06, T3-07, T2-06, T4-09, S8-07), lưới tự xuống hàng, thứ tự đọc giữ như một cột |

Không có thanh cuộn ngang ở bất kỳ khổ nào từ 320 px. Không bố cục hai cột cố định dưới 1200 px (việc 6 của danh sách cải thiện).

### APP-08 Trạng thái toàn cục

| Trạng thái | Hiển thị |
|---|---|
| Đang tải dữ liệu | Khung xương đúng hình khối sẽ hiện (thẻ câu, danh sách); không dùng vòng xoay giữa màn |
| Lỗi tải dữ liệu | "Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại." và nút "Thử lại" |
| Ngoại tuyến | Dải mỏng đầu vùng nội dung: "Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy." Tự ẩn khi có mạng lại |
| Bộ nhớ trình duyệt bị chặn | Dải cảnh báo: "Trình duyệt đang chặn lưu tiến độ, tiến độ sẽ mất khi đóng app. Cho phép trang này lưu trên máy trong cài đặt trình duyệt rồi mở lại app." |

Thành phần hiển thị trạng thái dùng chung `Failed`, `Loading`, `NoData`, `ValueLoading`, `NAValue`, `DataWithStatus`, `ValueWithStatus` (rule status-display), câu chữ ở namespace `statusDisplay`.

### APP-09 Cách trang chính mở app

Trang học chính mở app bằng một trang mới (tab mới hoặc chuyển thẳng trang), không nhúng iframe (nhóm chốt ngày 10/10/2026). App không đọc hay ghi `window.top` / `window.parent`, không dựa vào postMessage và bỏ qua mọi tham số URL mà trang chính gửi kèm. Từ Đợt 6 khu học cần đăng nhập tài khoản của website (AU-05); quan hệ với tài khoản của trang học chính chờ công ty trả lời (QD-06). Tôn trọng vùng an toàn của màn hình. Đường quay về trang học chính: APP-12.

### APP-10 Ngoại tuyến và cập nhật

Sau lần mở đầu tiên có mạng, app mở lại được khi ngoại tuyến với ngôn ngữ đã tải: service worker (`/sw.js`, dựng lúc build kèm mã bản build) lưu sẵn các trang của khu học và file JS, CSS của chúng; trang lấy mạng trước, mất mạng thì dùng bản đã lưu; dữ liệu câu lấy mạng trước rồi bản đã lưu; font Noto và ảnh lưu khi dùng tới, có bản lưu thì dùng ngay và tải bản mới ở nền. Bộ nhớ đệm theo bản build: giữ bản hiện tại và bản ngay trước (trang cũ còn mở vẫn chạy được khi mất mạng), xóa bản cũ hơn; dữ liệu câu lưu riêng, không mất khi đổi bản. Khi có bản mới, hiện thông báo ngắn (C7) "Có bản cập nhật" với nút "Cập nhật"; chỉ tải lại khi người dùng bấm, và không hiện thông báo này khi đang ở S3 hoặc S5. Ở lần mở đầu tiên có mạng, ngay khi service worker nhận trang, app tải lại các file dữ liệu đã dùng để lưu ngoại tuyến. Đăng nhập lần đầu cần mạng; khi đã đăng nhập, mất mạng vẫn học được, đồng bộ khi có mạng lại (DATA-14).

### APP-11 Một lớp phủ tại một thời điểm

Tại mỗi thời điểm có tối đa một sheet hoặc hộp thoại mở. Mở sheet mới thì sheet đang mở phải đóng trước.

### APP-12 Liên kết về trang học chính

Vì app mở bằng trang mới (APP-09), có liên kết để người học quay về trang học chính: ở chân thanh bên (C5-07) và chân trang công khai (LP-06), chữ "Trang học chính" kèm icon mũi tên trái.

- Hành động: là một liên kết thường, mở địa chỉ trang học chính ngay trong trang đang xem. Địa chỉ cấu hình lúc build (`NEXT_PUBLIC_HOST_URL`), mặc định `https://language.pomaskhoahocnaobo.com/`; đặt rỗng thì không hiện liên kết (khi website thay thế trang học chính, QD-06). Không dùng `history.back()`.
- Bấm khi đang có phiên dở thì không hỏi; tiến độ đã lưu (DATA-06) và phiên dở mở lại được lần sau (S3-08).
- Không đóng tab bằng mã và không đọc `window.opener` (APP-09).

### APP-13 Không dùng liên kết neo

Không dùng `href` bắt đầu bằng `#` để trỏ tới một phần trong trang. Nhảy tới một phần trong trang thì cuộn bằng mã, không đổi địa chỉ. Liên kết trong khu học là thẻ `<a>` thật có `href` là đường dẫn (mở được ở tab mới).

### APP-14 Đường dẫn

Màn cấp hai trong một khu (S10 Chi tiết Unit trong Thư viện) có dòng đường dẫn đầu màn: tên khu là liên kết, rồi dấu phân cách, rồi tên màn đang xem (có `aria-current="page"`), ví dụ "Thư viện › Unit 12 · A1". Liên kết tên khu mở lại khu đó đúng route đã xem trước khi vào màn cấp hai (cùng cách xem, trình độ, trang); chưa xem lần nào trong lần mở app này thì mở route mặc định của khu (với S10 là cách xem Unit đúng trình độ của unit). Dòng đường dẫn nằm trong vùng `nav` có nhãn trợ năng "Đường dẫn", vùng chạm của liên kết từ 44 px. Khu chính T1 đến T4 không có đường dẫn.

### APP-15 Ngôn ngữ giao diện

Giao diện có hai ngôn ngữ: tiếng Việt (mặc định) và tiếng Anh (next-intl). Ngôn ngữ đã chọn lưu bằng cookie `NEXT_LOCALE`, URL không có tiền tố ngôn ngữ; chưa chọn thì dùng tiếng Việt, không đoán theo ngôn ngữ trình duyệt. Đổi ở header (C5-05, LP-01) và ở S8-08 (rule i18n: giữ nút đổi ngôn ngữ trên trang tài khoản); đổi xong trang hiện lại bằng ngôn ngữ mới, giữ nguyên route, tiến độ và cài đặt. Thẻ `html` có `lang` đúng ngôn ngữ giao diện. Mọi câu chữ giao diện nằm ở `src/messages/vi.json` và `en.json` (viết tiếng Việt trước, cùng khóa và cùng biến `{var}` ở hai file). Nội dung học (nghĩa tiếng Việt, chủ đề, tình huống) không đổi theo ngôn ngữ giao diện. Tên ngôn ngữ đang học theo ngôn ngữ giao diện ("Tiếng Nhật" / "Japanese"). Ngày, số theo ngôn ngữ giao diện; múi giờ khai báo một nơi (`Asia/Ho_Chi_Minh`, `src/i18n/routing.ts`).

### APP-16 SEO

Metadata dùng chung: `metadataBase` lấy từ `NEXT_PUBLIC_SITE_URL`, tiêu đề dạng "[tên trang] | VITASR", mô tả, Open Graph, Twitter, đường dẫn chuẩn (canonical). Trang công khai Landing và Đăng ký cho index và có trong `sitemap.xml`; trang Đăng nhập và mọi trang khu học có `noindex`. `robots.txt` cho phép phần công khai, chặn phần riêng, trỏ tới sitemap. Có ảnh chia sẻ 1200 × 630, icon và apple icon.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| APP-12: nút về trang chủ hay về thẳng Trung tâm ứng dụng | Về trang chủ `https://language.pomaskhoahocnaobo.com/`; đổi bằng `VITE_HOST_URL` (từ Đợt 6: `NEXT_PUBLIC_HOST_URL`) khi có đường dẫn Trung tâm ứng dụng | APP-12 |
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
- 0.8 (20/10/2026): Đợt 5 việc 10: APP-04 giữ trạng thái màn trong route, tải lại và Back, Forward đúng; APP-01 màn cấp hai giữ mục khu đang chọn; thêm APP-13 không dùng liên kết neo, APP-14 đường dẫn.
- 0.9 (20/10/2026): Đợt 5 việc 6: APP-07 bỏ hai cột cố định từ 900 px, thêm mốc 1200 px với lưới tự xuống hàng, nội dung ở 1440 px trải từ 80% vùng nội dung.
- 1.0 (21/10/2026): Đợt 6: chuyển sang Next.js (QD-01), route là đường dẫn không có `#` (QD-02), khu học cần đăng nhập (AU-05) và bọc khung C5 (thanh bên, header) thay thanh tab; S1, S3, S5 nằm trong khung (APP-03); APP-07 theo mốc `md` và 1024 px; APP-12 thành liên kết ở chân thanh bên; thêm APP-15 ngôn ngữ giao diện, APP-16 SEO.
- 1.1 (21/10/2026): theo rà soát code độc lập Đợt 6: APP-10 bộ nhớ đệm theo bản build, giữ bản ngay trước, dữ liệu câu lưu riêng.
