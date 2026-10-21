# Bản cũ: nguồn và mức tin cậy

Thư mục này mô tả mini app "ĐA NGÔN NGỮ" đang chạy, dựng lại bằng cách đọc ngược trang thật (không có tài liệu hay mã nguồn từ khách). Đây là tài liệu tham khảo hành vi, không phải yêu cầu cho bản mới.

| File | Nội dung |
|---|---|
| `navigation.md` | Sơ đồ điều hướng cửa sổ của bản cũ |
| `ui-spec.md` | Danh sách màn hình, cửa sổ, điều khiển; cấu trúc trang |
| `api-and-storage.md` | Lời gọi mạng, file dữ liệu, khóa localStorage |

## Đối tượng mô tả

- Trang học chính: `https://language.pomaskhoahocnaobo.com`. Trang đăng ký công khai `/register?refId=…` ("Master English in 3–6 Months"), chọn Level A1 đến B2, xác minh bằng thanh kéo "Drag To Verify", nút "SIGN UP NOW"; đăng nhập ở `/`.
- Mini app: `https://vitasr-focus-160-pwa.t6dbgc79hk.chatgpt.site/`, phiên bản 1.9.40 (tên cache service worker `vitasr-demo-1.9.40-ve360`).

## Cách lấy thông tin và mức tin cậy

| Phần | Nguồn | Mức tin cậy |
|---|---|---|
| Mini app: màn hình, hành vi, dữ liệu, API, lưu trữ | Đọc từng file JS, JSON công khai trên trang thật (danh sách lấy từ `sw.js`), ngày 07/10/2026; kiểm lại 08/10/2026 vẫn là bản 1.9.40 | Cao cho những gì có trong code. Chưa bấm qua giao diện; chỗ ghi "cần xác nhận" là cửa sổ có trong code nhưng chưa rõ nút mở |
| Backend chia sẻ | Gọi thử `GET /api/sharing/session` trên trang thật | Cao |
| Trang đăng ký | Đọc trang công khai `/register?refId=849`, ngày 08/10/2026 | Cao |
| Bộ dữ liệu | Khách gửi `data.zip` ngày 08/10/2026 (xuất từ trang thật ngày 07/10/2026; 40 file, 12 MB; mã băm khớp manifest theo `_inventory.json`). Lưu ở `public/data/` (đến Đợt 5 là `fe/public/data/`) | Cao |
| Hướng dẫn chi tiết 12 bước | Đọc `demo/quick-guide.js` trên trang thật, ngày 08/10/2026; khớp với đoạn nhóm chép từ giao diện | Cao |
| Trang học sau đăng nhập và cách mở mini app | Mô tả của nhóm: sau khi đăng nhập, bấm nút góc trên bên trái, chọn "Đa ngôn ngữ"; mini app mở ở trang mới, không nhúng iframe (nhóm trả lời 10/10/2026) | Cách mở: **đã xác nhận**. Vị trí menu: chờ xác nhận (xem mục dưới) |

## Đang chờ xác nhận trên trang thật

Cần đăng nhập để kiểm. Mỗi mục khi xác nhận xong thì cập nhật file tương ứng và xóa khỏi danh sách này. (Câu hỏi về kích thước khung chứa mini app đã được nhóm trả lời ngày 08/10/2026: bản mới thiết kế responsive, ưu tiên web, không phụ thuộc khung.)

1. Nút góc trên bên trái mở ra gì (menu hay danh sách mini app), và mục "Đa ngôn ngữ" nằm ở đâu trong đó.
2. URL trang chính mở có đúng là địa chỉ mini app ở trên không, và có gắn tham số gì không. Không chặn bản mới: app bỏ qua mọi tham số (APP-09).

Đã xác nhận ngày 10/10/2026 (nhóm trả lời): trang chính mở mini app bằng trang mới (tab mới, chuyển thẳng trang), không nhúng iframe, nên không có postMessage giữa hai trang. Bản mới thêm nút về trang học chính (APP-12).

## Phát hiện quan trọng

- Mini app gần như chạy hoàn toàn ở trình duyệt: dữ liệu học là JSON tĩnh, tiến độ lưu localStorage, giọng đọc dùng `speechSynthesis`.
- Backend duy nhất của mini app là `/api/sharing/*` cho tính năng Chia sẻ, đăng nhập bằng tài khoản ChatGPT (`/signin-with-chatgpt`). Mini app không gọi API nào của trang học chính, nên trong code không thấy chỗ nào phụ thuộc đăng nhập của trang chính.
- `demo/index.html` vẫn chứa nguyên markup app gốc (Collocation, Listening Boost, FlashWord, trò chơi, thanh toán). Khi chạy, `demo/feature-removal.js` xóa khoảng 25 modal và vô hiệu khoảng 30 hàm; `user_v1.focus*.js` và các module `/demo/` dời node, dịch chữ, gắn thêm nút.
- Tiếng Anh có hai bộ nội dung: English Fluency (4.096 câu, chỉ có `id`, `hierarchy`, `en`, `vi`; trường `en` chứa câu gốc ở mọi ngôn ngữ) và Global English (4.608 câu, có thêm `noteVi`, `topic`, `situation`, `unitId`). Các ngôn ngữ khác chỉ có bộ Fluency. Gói âm thanh ngoại tuyến chỉ có tiếng Lào.
