# Acceptance: C7 Thông báo ngắn

- [x] C7-AC01 [claude] C7-01: Ảnh chụp thông báo ở T1 (có thanh tab) và S3 (không có thanh tab) ở 375 px và 1280 px: vị trí đúng, không che thanh tab, rộng không quá 480 px.
  - Bằng chứng: ảnh và số đo docs/evidence/C7-AC01/: ở T1 375 px thông báo nằm trên thanh tab (đáy 736 < đỉnh thanh tab 747), rộng 343 px; ở S3 và ở 1280 px cách đáy 16 px, rộng 480 px, Claude, 2026-10-10, commit 757a784; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C7-AC02 [auto] C7-02: Với đồng hồ giả: thông báo thường ẩn sau 3 giây, thông báo có nút ẩn sau 6 giây; gọi hai thông báo liên tiếp thì DOM chỉ có thông báo sau.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa
- [x] C7-AC03 [auto] C7-03: Thông báo xác nhận có `role="status"`, thông báo lỗi có `role="alert"`; `document.activeElement` không đổi khi thông báo hiện.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa
