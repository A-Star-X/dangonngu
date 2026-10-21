# Acceptance: S9 Hướng dẫn lần đầu

- [x] S9-AC01 [auto] S9-01: Với localStorage trống, chọn ngôn ngữ ở S1 thì T1 hiện bước 1/3; với tiến độ đã học hết lộ trình thì không hiện.
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] S9-AC02 [claude] S9-02: Ảnh chụp 3 bước ở 320, 375, 1280 px, sáng và tối: phần tử được làm nổi đúng, bong bóng không che chính phần tử đó và không tràn khỏi khung.
  - Bằng chứng: ảnh và số đo docs/evidence/S9-AC02/ (3 bước ở 320, 375, 1280 px, sáng và tối, 18 ảnh): bước 1 làm nổi thẻ câu, bước 2 làm nổi đúng nút "Học 8 câu", bước 3 làm nổi nút menu 44 x 44 (320, 375) hoặc phần điều hướng của thanh bên (1280); bong bóng cách mép vùng làm nổi 8 px ở cả 9 trường hợp, không che phần tử, không tràn khung, chữ khớp bảng S9-02; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] S9-AC03 [auto] S9-03: "Tiếp" sang bước kế; "Bỏ qua" và Esc đóng hướng dẫn; "Bắt đầu học" ở bước 3 mở `/phien-hoc?nguon=lo-trinh`.
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] S9-AC04 [auto] S9-04: Sau khi bỏ qua, tải lại trang và đổi ngôn ngữ: hướng dẫn không hiện lại.
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] S9-AC05 [auto] S9-05: Mở từ S8 "Xem lại hướng dẫn": bắt đầu ở bước 1, bước 3 có nút "Xong" thay cho "Bắt đầu học".
  - Bằng chứng: test tests/unit/s8.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [ ] S9-AC06 [human] S9-02: Người học mới đọc hết 3 bước trong dưới 20 giây và nói lại được Ôn tập nằm ở đâu.
