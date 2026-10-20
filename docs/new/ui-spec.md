---
id: G
title: Tổng quan giao diện bản mới
status: nháp
version: 0.1
---

# Spec giao diện bản mới: tổng quan

File này là điểm vào của spec bản mới. Nó chứa mục tiêu sản phẩm (yêu cầu `G-xx`), bối cảnh, phạm vi và chỉ mục tới spec chi tiết của từng khu vực. Yêu cầu chi tiết của mỗi trang, thành phần, khung app, nền tảng thiết kế và dữ liệu nằm trong `spec.md` của thư mục tương ứng dưới `fe/src/`, và chỉ nằm ở đó.

## 1. Bối cảnh

Người học người Việt mở app trên điện thoại, học một nhóm 8 câu tiếng Anh trong 5 đến 10 phút, nghe được câu, tự kiểm tra mình nhớ hay chưa, và thấy được tiến bộ qua các ngày.

- Người học: người Việt học ngoại ngữ, từ mất gốc đến nâng cao, học lẻ tẻ trong ngày. Giao diện bằng tiếng Việt, nội dung học là một trong 15 ngôn ngữ của bộ English Fluency, riêng tiếng Anh có thêm bộ Global English (A1 đến C2).
- Thiết bị: dùng được cả trên web và trên điện thoại (responsive). Giai đoạn đầu ưu tiên web trên máy tính.
- Môi trường chạy: website tĩnh có trang giới thiệu (Landing) cho khách và phần học cho người đã đăng nhập (QD-07). Đăng nhập và tiến độ lưu trên Supabase (QD-06); dữ liệu câu vẫn là file tĩnh. Trước Đợt 5, app là mini app do trang học chính mở bằng trang mới, không có backend; quan hệ giữa website mới và trang học chính đang chờ công ty trả lời (mục 5).

## 2. Mục tiêu

### G-01 Giao diện dễ hiểu dễ nhìn để sử dụng

Người mới dùng có thể dễ dàng nhìn hiểu cách sử dụng.

### G-02 Hiểu được tiến bộ của mình

Người học tìm được màn Tiến độ và giải thích đúng "câu cần ôn" nghĩa là gì.

### G-03 Không nhầm thao tác đánh giá

Trong phiên học, người học không bấm nhầm giữa "Tôi nhớ" và "Cần ôn lại".

### G-04 Gọn hơn bản cũ

Toàn bộ chức năng nằm trong 4 khu chính, màn Cài đặt và 3 màn toàn trang; không có hộp thoại mở chồng lên hộp thoại khác (APP-11).

### G-05 Không mang dấu hiệu giao diện do AI dựng mặc định

Người xem đánh giá giao diện là được thiết kế có chủ đích cho app học câu tiếng Việt, không phải mẫu chung. Quy tắc cụ thể ở FND-13.

## 3. Phạm vi

Giữ trong bản đầu: chọn ngôn ngữ và bộ nội dung (tiếng Anh có hai bộ: Global English và English Fluency), thẻ câu và nghe, phiên học 8 câu, ôn câu cần ôn, kiểm tra nhanh 3 bước, học theo từ khóa, thư viện câu, tiến bộ, cài đặt (giọng đọc, giao diện, mục tiêu, dữ liệu), hướng dẫn lần đầu.

Bỏ khỏi bản đầu: Chia sẻ thư viện và lời mời (cần backend `/api/sharing/*`), Góp ý, Khảo sát và Trò chuyện, Thông tin bản chạy thử.

Thêm từ Đợt 5 (20/10/2026): trang giới thiệu (Landing), đăng ký, đăng nhập, lưu tiến độ theo tài khoản (QD-06, QD-07).

Ngoài phạm vi: trang học chính, thanh toán; lấy dữ liệu thật từ khách; AI nhận xét bài luyện tập (QD-08, để sau). Bản này cũng không có: Chia sẻ, chọn trình độ bắt đầu cho Global English, chế độ đảo chiều "Tiếng Việt (từ tiếng Anh)", nghe nghĩa tiếng Việt, mục pháp lý của bản cũ 1.9.45 (chốt 10/10/2026; khách cần thì làm thành đợt riêng).

Đối chiếu từng chức năng với bản cũ: `mapping-legacy.md`. Sơ đồ điều hướng: `navigation.md`.

## 4. Chỉ mục spec

| ID | Khu vực | Spec | Phụ thuộc |
|---|---|---|---|
| APP | Khung app: điều hướng, route, bố cục, trạng thái toàn cục | `fe/src/app/spec.md` | FND, DATA, C5, C6, C7 |
| FND | Nền tảng thiết kế: màu, chữ, khoảng cách, icon, chuyển động, giọng văn, trợ năng | `fe/src/foundation/spec.md` | |
| DATA | Hợp đồng dữ liệu, nguồn dữ liệu, lưu tiến độ, fixture | `fe/src/data/spec.md` | |
| C1 | Thẻ câu | `fe/src/components/C1-the-cau/spec.md` | C2, C3 |
| C2 | Dải 8 ô | `fe/src/components/C2-dai-8-o/spec.md` | |
| C3 | Nút | `fe/src/components/C3-nut/spec.md` | |
| C4 | Lựa chọn trắc nghiệm | `fe/src/components/C4-lua-chon/spec.md` | |
| C5 | Thanh tab | `fe/src/components/C5-thanh-tab/spec.md` | |
| C6 | Sheet | `fe/src/components/C6-sheet/spec.md` | |
| C7 | Thông báo ngắn | `fe/src/components/C7-thong-bao/spec.md` | |
| S1 | Chọn ngôn ngữ | `fe/src/pages/S1-chon-ngon-ngu/spec.md` | C3 |
| T1 | Học | `fe/src/pages/T1-hoc/spec.md` | C1, C2, C3 |
| S3 | Phiên học | `fe/src/pages/S3-phien-hoc/spec.md` | C1, C2, C3, C4 |
| T2 | Luyện tập | `fe/src/pages/T2-luyen-tap/spec.md` | C3, C6 |
| S5 | Kiểm tra nhanh | `fe/src/pages/S5-kiem-tra-nhanh/spec.md` | C3, C4 |
| T3 | Thư viện | `fe/src/pages/T3-thu-vien/spec.md` | C1, C6 |
| T4 | Tiến độ | `fe/src/pages/T4-tien-bo/spec.md` | C2 |
| S8 | Cài đặt | `fe/src/pages/S8-cai-dat/spec.md` | C3, C6, C7 |
| S9 | Hướng dẫn lần đầu | `fe/src/pages/S9-huong-dan/spec.md` | C3 |

## 5. Câu hỏi mở

Đợt 5 (20/10/2026), chờ công ty trả lời:

1. Website mới thay thế hay chạy song song với trang học chính `language.pomaskhoahocnaobo.com`? Nếu song song, người học có hai tài khoản (QD-06). Câu trả lời quyết định giữ hay bỏ nút "Quay lại trang học" (APP-12).
2. Project Supabase do ai tạo và giữ; có bắt xác nhận email khi đăng ký không (QD-06).
3. G-04 giới hạn toàn bộ chức năng trong 4 khu chính, Cài đặt và 3 màn toàn trang. Đợt 5 thêm Landing, Đăng nhập, Đăng ký và màn Chi tiết Unit (việc 3). Sửa G-04 thành giới hạn mới nào?
4. Có đối tác nào được phép nêu tên và hiện logo ở Landing không (việc 4)? Chưa có thì ẩn phần Đối tác.
5. AI nhận xét bài luyện tập (việc 9, QD-08): để sau Đợt 5. Khi làm cần chốt dạng bài nào được nhận xét, chi phí mỗi lượt và tiêu chí.

Các câu ở bảng 10/10/2026 do Claude quyết định theo ủy quyền của nhóm để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

### Đã trả lời (08/10/2026)

| Câu hỏi | Trả lời | Đã áp dụng vào |
|---|---|---|
| Kích thước khung iframe ở desktop, vị trí nút đóng của trang chính | Thiết kế phù hợp cả app và web, responsive; trước mắt làm theo web | APP-02, APP-07, `docs/QUY-TRINH.md` mục 7 |
| Có đọc lại tiến độ học cũ không | Không cần | DATA-06 |
| Bản đầu chỉ tiếng Anh hay cả ngôn ngữ khác | Có đủ các ngôn ngữ trong dữ liệu | Bối cảnh, DATA-01, FND-04 |
| Được dùng mẫu dữ liệu nào | Dùng được bộ dữ liệu khách gửi | DATA-05, DATA-09, `fe/public/data/`, `fe/fixtures/` |

### Đã trả lời (10/10/2026)

| Câu hỏi | Trả lời | Đã áp dụng vào |
|---|---|---|
| Có giữ Chia sẻ không; nếu có, backend do bên nào cung cấp | Không có ở bản này. Nếu khách cần, khách cung cấp backend và làm thành đợt riêng | Mục 3 |
| Ai duyệt thiết kế, ở những mốc nào | Nhóm duyệt nội bộ qua ảnh bằng chứng (`docs/evidence/`) và bản chạy thử trên GitHub Pages; khách duyệt một lần khi bàn giao, yêu cầu sửa sau đó làm thành đợt riêng | Bàn giao |
| Global English có cho chọn trình độ bắt đầu không | Không ở bản này; trình độ khác học qua bộ lọc Trình độ ở Thư viện | DATA-11, mục 3 |
| Có chế độ đảo chiều "Tiếng Việt (từ tiếng Anh)" như bản cũ không | Không ở bản này | Mục 3 |
| Có đưa mục pháp lý xuất hiện ở bản cũ 1.9.45 vào không | Không, vì chưa có nội dung từ khách | Mục 3 |
| Trang chính mở mini app bằng iframe hay tab mới, có truyền gì cho mini app không | Mở trang mới (tab mới, chuyển thẳng trang), không nhúng iframe. Giữ nút quay lại để về trang học chính. Chưa rõ trang chính có gắn tham số URL không; app bỏ qua mọi tham số nên việc này không chặn gì | APP-09, APP-12, `docs/new/navigation.md`, `docs/legacy/README.md` |

## 6. Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): thêm câu hỏi mở 7 về cách trang chính mở mini app.
- 0.3 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.4 (08/10/2026): cập nhật theo bộ dữ liệu khách gửi và câu trả lời của nhóm (ưu tiên web, responsive; đủ 15 ngôn ngữ; không đọc tiến độ bản cũ).
- 0.5 (10/10/2026): nhóm trả lời câu hỏi về cách trang chính mở mini app: mở trang mới, không nhúng iframe, có nút về trang học chính (APP-09, APP-12). Câu hỏi 4 cũ thành câu 3.
- 0.6 (10/10/2026): chốt các câu hỏi còn lại cho khách (Claude quyết định theo ủy quyền của nhóm): không có Chia sẻ, chọn trình độ bắt đầu, chế độ đảo chiều, nghe nghĩa, mục pháp lý ở bản này; quy trình duyệt thiết kế.
- 0.7 (20/10/2026): Đợt 5: website có Landing, đăng ký, đăng nhập, tiến độ theo tài khoản (QD-06, QD-07); AI nhận xét để sau (QD-08); thêm câu hỏi mở cho công ty.
