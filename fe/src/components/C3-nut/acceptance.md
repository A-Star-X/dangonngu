# Acceptance: C3 Nút

- [x] C3-AC01 [claude] C3-01, C3-02: Ảnh chụp bảng mẫu nút chính và nút phụ ở 375 px và 1280 px, sáng và tối: đúng kích thước, màu token, nút chính rộng hết khối ở 375 px.
  - Bằng chứng: ảnh docs/evidence/C3-AC01/ (sheet Dừng phiên: nút chính và nút phụ), Claude, 2026-10-08, commit 97e85fa; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C3-AC02 [claude] C3-03: Ảnh chụp cặp nút đánh giá ở 320 px và 375 px: hai nút bằng nhau, cách 12 px, cao 56 px, có icon và chữ; ở trạng thái khóa cả hai mờ.
  - Bằng chứng: ảnh docs/evidence/C3-AC02/, Claude, 2026-10-08, commit 97e85fa; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [ ] C3-AC03 [human] C3-03: Trên điện thoại thật, dùng một tay bấm 20 lần xen kẽ hai nút đánh giá: không lần nào bấm nhầm.
- [x] C3-AC04 [auto] C3-04: Nút ở trạng thái khóa có `aria-disabled="true"` và không phát sự kiện click; mọi nút có kích thước vùng chạm tối thiểu 44 x 44 px.
  - Bằng chứng: test fe/tests/unit/components.test.tsx, fe/tests/e2e/app.spec.ts pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa
