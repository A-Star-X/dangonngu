# Acceptance: C3 Nút

- [x] C3-AC01 [claude] C3-01, C3-02: Ảnh chụp bảng mẫu nút chính và nút phụ ở 375 px và 1280 px, sáng và tối: đúng kích thước, màu token, nút chính rộng hết khối ở 375 px.
  - Bằng chứng: ảnh và số đo docs/evidence/C3-AC01/ (nút chính ở T1 và S10, nút phụ viền ở S10, 375 và 1280 px, sáng và tối): nút chính nền primary (#C9301A, tối #FF6A4D) chữ primary-foreground, nút phụ trong suốt viền border chữ foreground, chữ 14 px đậm 600, bo 8 px, cao 44 đến 48 px; ở 375 px nút chính rộng hết khối cha (343/343, 311/311); người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] C3-AC02 [claude] C3-03: Ảnh chụp cặp nút đánh giá ở 320 px và 375 px: hai nút bằng nhau, cách 12 px, cao 48 px, có icon và chữ; ở trạng thái khóa cả hai mờ.
  - Bằng chứng: ảnh và số đo docs/evidence/C3-AC02/ (320 và 375 px, sáng và tối, khóa và mở): hai nút bằng nhau (138 px ở 320, 166 px ở 375), cách 12 px, cao 48 px theo C3-03, có icon và chữ; khóa thì cả hai mờ 0,4; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [ ] C3-AC03 [human] C3-03: Trên điện thoại thật, dùng một tay bấm 20 lần xen kẽ hai nút đánh giá: không lần nào bấm nhầm.
- [x] C3-AC04 [auto] C3-04: Nút ở trạng thái khóa có `aria-disabled="true"` và không phát sự kiện click; mọi nút có kích thước vùng chạm tối thiểu 44 x 44 px.
  - Bằng chứng: test tests/e2e/app.spec.ts, tests/unit/components.test.tsx pass trên bản Next.js (npm run test:e2e, npm test), Claude, 2026-10-21, commit d720f7d
