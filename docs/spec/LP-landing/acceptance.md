# Acceptance: LP Landing

- [x] LP-AC01 [auto] LP-01: Trang `/` có một `h1`, nút "Bắt đầu học" trỏ tới `/dang-ky`, "Khám phá các bộ câu" trỏ tới `/thu-vien`, liên kết "Đăng nhập" trỏ tới `/dang-nhap`; không có liên kết `#`.
  - Bằng chứng: test tests/e2e/dot6-web.spec.ts pass trên bản Next.js (npm run test:e2e), Claude, 2026-10-21, commit d720f7d
- [x] LP-AC02 [auto] LP-03: Số ngôn ngữ, số câu, số unit trên trang bằng số tính từ `public/data` (15 ngôn ngữ; English Fluency 4.096 câu và 512 unit mỗi ngôn ngữ; Global English 4.608 câu, 576 unit với bộ dữ liệu hiện tại).
  - Bằng chứng: test tests/unit/debounce-and-content.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] LP-AC03 [claude] LP-01, LP-02, LP-04, LP-05, LP-06, LP-07: Ảnh chụp `/` ở 375 px và 1280 px, sáng và tối: đủ các phần, ảnh chụp app thật, không phần Đối tác, không cuộn ngang, không khối nhỏ giữa vùng trắng.
  - Bằng chứng: ảnh cả trang và số đo docs/evidence/LP-AC03/ (375 và 1280 px, sáng và tối): đủ header (có Đăng nhập), phần mở đầu, Dành cho ai, Nội dung có sẵn (15 ngôn ngữ, 4.096 và 4.608 câu), Bạn học như thế nào, Ba bước, lời mời cuối trang, chân trang; ảnh chụp màn Học thật đúng giao diện sáng hoặc tối; không có phần Đối tác; không cuộn ngang; ở 1280 px các phần rộng 736 px trong cột 768 px, không khối nhỏ giữa vùng trắng; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [ ] LP-AC04 [human] LP-01, LP-02, LP-04: Nhóm đọc lại toàn bộ câu chữ ở Landing (tiếng Việt và tiếng Anh): đúng với sản phẩm, không hứa điều app không làm.
