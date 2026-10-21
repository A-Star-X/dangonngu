# Acceptance: G Tổng quan

Các mục này kiểm bằng buổi test với người dùng thật sau khi mọi khu vực khác đã đạt. Kịch bản test: đưa người học điện thoại đã mở app ở trạng thái chưa chọn ngôn ngữ, giao nhiệm vụ bằng lời, không giải thích giao diện.

- [ ] G-AC01 [human] G-01: Ít nhất 5/5 người học bắt đầu được phiên học đầu tiên mà không hỏi người hướng dẫn; ghi lại số lần chạm từ lúc chọn ngôn ngữ tới câu đầu tiên của phiên (yêu cầu không quá 2).
- [ ] G-AC02 [human] G-02: Ít nhất 4/5 người học tự tìm được màn Tiến độ và giải thích đúng "câu cần ôn" bằng lời của họ.
- [ ] G-AC03 [human] G-03: Trong toàn bộ buổi test, không ai bấm nhầm giữa "Tôi nhớ" và "Cần ôn lại" (người học tự nói ra hoặc quan sát thấy bấm rồi muốn sửa).
- [x] G-AC04 [claude] G-04: Đối chiếu bảng route APP-04 và mã nguồn: khu học chỉ có 4 khu chính, màn Cài đặt, 3 màn học tập trung và màn Chi tiết Unit; phần công khai chỉ có Landing, Đăng nhập, Đăng ký; không có chỗ nào mở một sheet hoặc hộp thoại khi đang có sheet hoặc hộp thoại khác mở.
  - Bằng chứng: đối chiếu `src/lib/routes.ts` với APP-04: khu học có đúng 9 route: 4 khu chính trên thanh bên (`NAV_ROUTES`: hoc, luyen-tap, thu-vien, tien-do), cai-dat, 3 màn học tập trung (chon-ngon-ngu, phien-hoc, kiem-tra) và `/thu-vien/unit`; `src/app/[locale]/(public)` chỉ có `/`, `/dang-nhap`, `/dang-ky`; route khác chuyển về `/hoc` (`[...rest]`). Sheet chỉ mở qua `SheetProvider` giữ một sheet duy nhất (mở sheet mới thay sheet cũ); sheet xác nhận S3, S5 kiểm `sheet.isOpen` trước khi mở; menu trượt đóng trước khi mở sheet Đổi ngôn ngữ; lớp hướng dẫn S9 phủ cả màn (không bấm được phần tử bên dưới) và giữ focus trong bong bóng, Claude, 2026-10-21, chưa commit (Đợt 6)
- [ ] G-AC05 [human] G-05: Hai người ngoài nhóm thiết kế xem ảnh chụp 5 màn chính (T1, S3a, T3, T4, S8) và không chỉ ra được dấu hiệu nào trong danh sách FND-13.
