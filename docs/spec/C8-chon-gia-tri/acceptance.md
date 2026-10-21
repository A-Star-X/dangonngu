# Acceptance: C8 Ô chọn một giá trị

- [x] C8-AC01 [auto] C8-01, C8-02: Nút có `role="combobox"`, nhãn trợ năng, hiện nhãn lựa chọn đang chọn; mở bằng phím mũi tên xuống, di chuyển bằng mũi tên, Enter chọn và gọi `onValueChange`, Escape đóng và trả focus về nút; lựa chọn đang chọn có `aria-selected="true"`.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] C8-AC02 [auto] C8-03: Gõ vào ô lọc chỉ còn lựa chọn khớp (gõ không dấu vẫn khớp chữ có dấu); không khớp gì thì hiện "Không có mục nào khớp."; Escape trong ô lọc không đóng sheet bao ngoài.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] C8-AC03 [claude] C8-01: Ảnh chụp sáng và tối: nút bo góc 6 px, viền primary khi đang mở, danh sách có dấu tích ở lựa chọn đang chọn.
  - Bằng chứng: ảnh và số đo docs/evidence/C8-AC03/ (ô chọn ngôn ngữ giao diện ở S8 đang mở, 375 và 1280 px, sáng và tối): nút bo 6 px, viền primary khi mở, danh sách bo 6 px có bóng, lựa chọn đang chọn có dấu tích; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, chưa commit (Đợt 6)
