# Acceptance: C5 Thanh tab

- [x] C5-AC01 [claude] C5-01: Ảnh chụp 375 px trên khung giả lập iPhone có vùng an toàn đáy: thanh cao 64 px cộng vùng an toàn, 4 mục chia đều, nhãn không bị cắt ở 320 px.
  - Bằng chứng: ảnh và số đo docs/evidence/C5-AC01/ (Chromium giả lập vùng an toàn trên 47 px, đáy 34 px qua Emulation.setSafeAreaInsetsOverride): thanh cao 64 px + 34 px vùng an toàn + viền trên 1 px = 99 px, sát đáy khung; 4 mục rộng bằng nhau (94 px ở 375, 80 px ở 320); nhãn không bị cắt ở 320 px, Claude, 2026-10-10, commit 757a784; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C5-AC02 [claude] C5-02: Ảnh chụp 1280 px: thanh dọc 220 px bên trái, mục cao 48 px, căn trái.
  - Bằng chứng: ảnh và số đo docs/evidence/C5-AC02/do-dac.json: thanh dọc rộng 220 px, mỗi mục cao 48 px, căn trái (justify-content: flex-start), Claude, 2026-10-10, commit 757a784; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C5-AC03 [auto] C5-03: Ở mỗi route T1 đến T4, đúng một mục có `aria-current="page"` và đó là mục tương ứng.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] C5-AC04 [auto] C5-04: Với 12 câu cần ôn, mục Luyện tập hiện "12" và có nhãn trợ năng "Luyện tập, 12 câu cần ôn"; với 0 câu thì không có nhãn số.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa
