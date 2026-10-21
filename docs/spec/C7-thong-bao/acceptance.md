# Acceptance: C7 Thông báo ngắn

- [x] C7-AC01 [claude] C7-01: Ảnh chụp thông báo xác nhận và thông báo lỗi ở T1 và S3, 375 px và 1280 px, sáng và tối: giữa đáy màn, cách đáy 16 px, rộng không quá 480 px (375 px: hết chiều ngang trừ lề), nền `card`, chữ `foreground` 14 px, bo góc 8 px; thông báo lỗi có viền trái `danger`.
  - Bằng chứng: ảnh và số đo docs/evidence/C7-AC01/ (xác nhận ở T1, lỗi có nút "Thử lại" ở S3, 375 và 1280 px, sáng và tối): giữa đáy, cách đáy 16 px, rộng 343 px ở 375 (lề 16 px) và 480 px ở 1280, nền card, chữ foreground Lexend 14 px, bo 8 px, thông báo lỗi có viền trái 4 px danger; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] C7-AC02 [auto] C7-02: Với đồng hồ giả: thông báo thường ẩn sau 3 giây, thông báo có nút ẩn sau 6 giây; gọi hai thông báo liên tiếp thì DOM chỉ có thông báo sau.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] C7-AC03 [auto] C7-03: Thông báo xác nhận có `role="status"`, thông báo lỗi có `role="alert"`; `document.activeElement` không đổi khi thông báo hiện.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
