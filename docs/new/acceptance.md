# Acceptance: G Tổng quan

Các mục này kiểm bằng buổi test với người dùng thật sau khi mọi khu vực khác đã đạt. Kịch bản test: đưa người học điện thoại đã mở app ở trạng thái chưa chọn ngôn ngữ, giao nhiệm vụ bằng lời, không giải thích giao diện.

- [ ] G-AC01 [human] G-01: Ít nhất 5/5 người học bắt đầu được phiên học đầu tiên mà không hỏi người hướng dẫn; ghi lại số lần chạm từ lúc chọn ngôn ngữ tới câu đầu tiên của phiên (yêu cầu không quá 2).
- [ ] G-AC02 [human] G-02: Ít nhất 4/5 người học tự tìm được màn Tiến độ và giải thích đúng "câu cần ôn" bằng lời của họ.
- [ ] G-AC03 [human] G-03: Trong toàn bộ buổi test, không ai bấm nhầm giữa "Tôi nhớ" và "Cần ôn lại" (người học tự nói ra hoặc quan sát thấy bấm rồi muốn sửa).
- [x] G-AC04 [claude] G-04: Đối chiếu bảng route APP-04 và mã nguồn: chỉ có 4 tab, màn Cài đặt và 3 màn toàn trang; không có chỗ nào mở một sheet hoặc hộp thoại khi đang có sheet hoặc hộp thoại khác mở.
  - Bằng chứng: đối chiếu fe/src/app/router.ts với APP-04: đúng 8 route, TAB_ROUTES là 4 khu chính, FULLSCREEN_ROUTES là S1, S3, S5, cộng S8. Mọi sheet mở qua SheetHost (mở sheet mới thì đóng sheet cũ), sheet xác nhận S3 và S5 kiểm sheet.isOpen trước khi mở, hướng dẫn S9 giữ focus trong bong bóng nên bàn phím không mở được sheet khác; test APP-AC16 (fe/tests/unit/t3.test.tsx, s8.test.tsx) pass, Claude, 2026-10-10, commit 757a784
- [ ] G-AC05 [human] G-05: Hai người ngoài nhóm thiết kế xem ảnh chụp 5 màn chính (T1, S3a, T3, T4, S8) và không chỉ ra được dấu hiệu nào trong danh sách FND-13.
