# Acceptance: C5 Khung khu học

- [x] C5-AC01 [claude] C5-01, C5-05, C5-06: Ảnh chụp 1280 px: thanh bên 240 px cố định bên trái, hàng logo 56 px, hai nhóm mục có nhãn chữ hoa 12 px, mục cao tối thiểu 40 px; header 56 px bắt đầu sau thanh bên; nội dung rộng tối đa 1024 px.
  - Bằng chứng: ảnh và số đo docs/evidence/C5-AC01/ (1280 px, sáng và tối): thanh bên x 0 rộng 240 px, hàng logo 56 px với logo 32 px, nhãn nhóm chữ hoa 12 px, mục cao 40 px, header 56 px bắt đầu ở x 240, nội dung rộng 1024 px; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] C5-AC02 [auto] C5-02: Dưới `md`: thanh bên ẩn; nút menu mở thanh bên và lớp phủ; bấm lớp phủ, chọn một mục, nhấn Escape đều đóng; thanh bên đóng có thuộc tính `inert`.
  - Bằng chứng: test tests/e2e/dot6-web.spec.ts, tests/unit/shell.test.tsx pass trên bản Next.js (npm run test:e2e, npm test), Claude, 2026-10-21, commit d720f7d
- [x] C5-AC03 [auto] C5-03: Ở mỗi route T1 đến T4 và S10, đúng một mục có `aria-current="page"` và đó là mục tương ứng (S10 là Thư viện).
  - Bằng chứng: test tests/e2e/app.spec.ts, tests/unit/shell.test.tsx pass trên bản Next.js (npm run test:e2e, npm test), Claude, 2026-10-21, commit d720f7d
- [x] C5-AC04 [auto] C5-04: Với 12 câu cần ôn, mục Luyện tập hiện "12" và có nhãn trợ năng "Luyện tập, 12 câu cần ôn"; với 0 câu thì không có nhãn số.
  - Bằng chứng: test tests/unit/shell.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] C5-AC05 [claude] C5-02, C5-05: Ảnh chụp 375 px: header có nút menu, logo, chọn ngôn ngữ giao diện, nút sáng tối 36 px; menu mở trượt từ trái, có lớp phủ; không cuộn ngang.
  - Bằng chứng: ảnh và số đo docs/evidence/C5-AC05/ (375 px, menu đóng và mở, sáng và tối): header có nút menu 44 px, logo, ô chọn ngôn ngữ giao diện 36 px cao, nút sáng tối 36 px; menu mở là thanh bên 240 px từ mép trái kèm lớp phủ; không cuộn ngang; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] C5-AC06 [auto] C5-07: Chân thanh bên có liên kết "Trang chủ" về Landing, email người đang đăng nhập; ở chế độ trên máy có dòng báo chế độ thử.
  - Bằng chứng: test tests/unit/shell.test.tsx pass (npm test, 234/234), Claude, 2026-10-21, commit 36c32ed
- [x] C5-AC07 [auto] C5-08, LP-01: Chân thanh bên (dưới "Trang chủ", header khu học không có), header công khai và chân trang công khai có ảnh logo `alt` "A-STAR" rồi "Pháp Luật & Kinh tế – Quốc tế", mỗi logo trong một khung, không nằm trong liên kết; giao diện tối dùng ảnh A-STAR chữ trắng.
  - Bằng chứng: test tests/unit/shell.test.tsx, tests/unit/demo.test.tsx pass (npm test), Claude, 2026-10-22, commit 36efce6
- [x] C5-AC08 [claude] C5-08, LP-01: Ảnh chụp khu học (1280 px; 375 px menu mở; thường và bản dùng thử) và Landing (1280 px, 375 px cả trang), sáng và tối: A-STAR đứng trước, hai khung logo cùng chiều cao, cách đều, thẳng hàng giữa với logo VITASR, không méo, không tràn ngang; A-STAR đọc rõ trên nền tối.
  - Bằng chứng: ảnh và số đo docs/evidence/C5-AC08/ (khu học 1280 px và 375 px menu mở, bản thường và bản dùng thử; Landing 1280 px và 375 px cả trang; sáng và tối): khu học có hai khung logo cao 32 px ở chân thanh bên ngay dưới "Trang chủ", thẳng lề trái với dòng đó (x = 24 px), header khu học không có logo; bản dùng thử chân thanh bên chỉ có "Trang chủ" và logo; Landing hai khung cao 36 px sau VITASR; A-STAR đứng trước; không tràn ngang; giao diện tối A-STAR chữ trắng; Claude xem từng ảnh, 2026-10-22, commit 36efce6
- [ ] C5-AC09 [human] C5-08: Hai đơn vị đồng hành xác nhận logo, tên và cách đặt đúng nhận diện thương hiệu của họ.
