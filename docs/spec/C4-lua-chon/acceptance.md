# Acceptance: C4 Lựa chọn trắc nghiệm

- [x] C4-AC01 [claude] C4-01: Ảnh chụp với nghĩa dài trên 120 ký tự ở 320 px: chữ xuống dòng đủ, không bị cắt; số thứ tự không hiện ở 320 px, hiện từ 768 px (ảnh 1280 px).
  - Bằng chứng: ảnh và số đo docs/evidence/C4-AC01/ (320 và 1280 px, sáng và tối): ở 320 px nghĩa 154 ký tự xuống 6 dòng, không lựa chọn nào bị cắt, không có số thứ tự; ở 1280 px có số 1 đến 4; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] C4-AC02 [auto] C4-02: Chọn sai rồi chọn đúng: sự kiện "sai" phát một lần, sự kiện "đúng" phát một lần; sau khi đúng, mọi lựa chọn bị khóa. Phím 1 đến 4 chọn đúng lựa chọn tương ứng.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] C4-AC03 [auto] C4-03: Vùng `aria-live` nhận chuỗi "Đúng" và "Chưa đúng, thử lại" tương ứng; lựa chọn đúng và sai có icon khác nhau trong DOM; lựa chọn sai có viền `danger`, nền `danger-soft` và chữ "Chưa đúng" nhìn thấy được, lựa chọn đúng có chữ "Đúng".
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
