# Đối chiếu bản mới với bản cũ và nguồn dữ liệu

Bản cũ chỉ có một nhóm API backend là `/api/sharing/*` cho tính năng Chia sẻ, đã bỏ khỏi bản mới. Mọi chức năng còn lại, ở cả hai bản, chạy trong trình duyệt: đọc JSON tĩnh, lưu tiến độ vào localStorage, đọc câu bằng `speechSynthesis`. Bản mới không thêm chức năng nào cần backend. Tiến độ chỉ nằm trên một thiết bị, không đồng bộ giữa các máy, giống bản cũ.

Trạng thái:
- **Có sẵn**: bản cũ đã có chức năng và dữ liệu.
- **Mới, chạy ở trình duyệt**: bản cũ chưa có giao diện này nhưng dữ liệu đã đủ.
- **Viết lại logic**: không cần backend nhưng phải dựng lại thuật toán của bản cũ hoặc chốt quy tắc mới.

| Yêu cầu bản mới | Bản cũ | Nguồn dữ liệu | Trạng thái |
|---|---|---|---|
| S1-01 đến S1-06 Chọn ngôn ngữ | L-S1 | `manifest.json`; tên gốc từ `Intl.DisplayNames` | Có sẵn |
| S1-07, APP-06, DATA-13 Chọn và đổi bộ nội dung (Global English, English Fluency) | Bộ nội dung trong khối Tùy chọn học của L-S2 | Manifest của từng bộ | Có sẵn; chuyển lựa chọn bộ từ khối tùy chọn sang bước 2 của S1 và sheet Đổi ngôn ngữ |
| C1-06 Dòng Cách dùng | Công tắc Cách dùng trong L-S2 | `noteVi` (chỉ bộ Global English) | Có sẵn |
| T1-01 Mã trình độ, tình huống của unit | Không hiển thị | `unitId`, `situation` (chỉ bộ Global English) | Mới, chạy ở trình duyệt |
| T1-01 Thẻ câu tiếp theo, nghe, hiện câu gốc | L-S2 thẻ Câu đang học | `{lang}.json`, `speechSynthesis` | Có sẵn |
| T1-01 Tên unit trên thẻ | Không hiển thị | `units-{lang}.json` | Mới, chạy ở trình duyệt |
| T1-03 Mục tiêu tuần | L-D4, L-D3 | localStorage | Có sẵn |
| T1-04 Số câu cần ôn hôm nay | L-D3 Lịch ôn | Lịch sử trả lời, quy tắc DATA-07 | Viết lại logic |
| S3-01 đến S3-09 Phiên học 8 câu | L-D1, L-D2, L-D2b | `units-{lang}.json`, localStorage | Có sẵn; bỏ bước chọn cách lấy câu của L-D1 |
| S3-05 Gợi ý | Xem gợi ý trong L-D2 | Nghĩa của câu | Có sẵn; cách hiển thị gợi ý là mới |
| T2-02 Ôn tập hôm nay | Không có lối vào riêng | Lịch sử trả lời, DATA-07 | Mới, chạy ở trình duyệt |
| T2-03 Học theo từ khóa | L-D7 (ô tìm tự do) | Tìm trên câu gốc và nghĩa | Có sẵn |
| S5-01 đến S5-08 Kiểm tra nhanh | L-D6, L-D6b (T01, T02, T03) | `{lang}.json`; cụm do app tự chia | Có sẵn; viết lại logic chia cụm (S5-04) và đáp án nhiễu (DATA-08) |
| T3-01 đến T3-04 Danh sách, tìm, phân trang | Danh sách dữ liệu trong L-S2 | `{lang}.json` | Có sẵn |
| T3-03 Lọc theo unit, trạng thái học, chủ đề, trình độ | Không có (Tình huống, Chủ đề có trong L-D1) | `units-{lang}.json`, `topic`, localStorage | Mới, chạy ở trình duyệt |
| T3-05 Sheet Chi tiết câu, Học câu này | Không có | `{lang}.json`, `units-{lang}.json` | Mới, chạy ở trình duyệt |
| T4-01 đến T4-08 Tiến độ | L-D3 | localStorage | Có sẵn; bỏ xuất CSV |
| S8-02 Giọng đọc, tốc độ đọc | L-D8 (không có tốc độ) | Giọng trên thiết bị; thuộc tính `rate` | Có sẵn; tốc độ là mới |
| S8-03 Âm thanh ngoại tuyến | L-D8 | `/data/audio/*`, chỉ có tiếng Lào | Ẩn trong bản đầu với mọi ngôn ngữ; tiếng Anh không có gói |
| S8-01, S8-04, S8-05 Mục tiêu, giao diện, dữ liệu | Header, L-D4 | localStorage | Có sẵn |
| S9-01 đến S9-05 Hướng dẫn 3 bước | L-D9 (12 bước, 2 video) | Không cần dữ liệu | Mới, chạy ở trình duyệt |
| APP-08, APP-10 Ngoại tuyến, có bản mới | PWA, `pwa-update` | Service worker | Có sẵn |
| Không có | L-D10, L-D10b, L-D11 Chia sẻ, lời mời | `/api/sharing/*` | Bỏ: cần backend |
| Không có | L-D5 Góp ý | localStorage | Bỏ: không thuộc vòng học |
| Không có | Khảo sát và Trò chuyện | Liên kết ngoài | Bỏ |
| Không có | L-D12 Thông tin bản chạy thử | Không | Bỏ |
| Không có | Chế độ "Tiếng Việt (từ tiếng Anh)" trong L-S1 | Đảo cặp `en` / `vi` | Bỏ khỏi bản đầu; xem câu hỏi mở của S1 |
| Không có | Vuốt trái/phải đổi câu trên màn chính | | Bỏ: không vuốt trong phiên học (S3-09) và trên T1 (T1-07) |
