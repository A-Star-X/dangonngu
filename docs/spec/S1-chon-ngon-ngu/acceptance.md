# Acceptance: S1 Chọn ngôn ngữ

- [x] S1-AC01 [auto] S1-01: Với manifest fixture, dòng đầu là Tiếng Anh; các dòng sau theo thứ tự tên tiếng Việt tăng dần (so sánh `localeCompare` với `vi`).
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] S1-AC02 [claude] S1-01, S1-02, S1-03, S1-05: Ảnh chụp ở 320 px, 375 px, 1280 px, sáng và tối: Tiếng Anh nằm trong khối viền; mỗi dòng có tên Việt, tên gốc, số câu "4.096" (riêng Tiếng Anh hiện "2 bộ" và mũi tên); có dòng chú thích cuối.
  - Bằng chứng: ảnh và số đo docs/evidence/S1-AC02/ (320, 375, 1280 px, sáng và tối): Tiếng Anh đứng đầu trong khối viền primary nhạt, có "English", "2 bộ" và mũi tên; 14 ngôn ngữ còn lại theo tên tiếng Việt, mỗi dòng có tên Việt, tên gốc và "4.096 câu" trên một dòng ở mọi khổ kể cả 320 px; dòng chú thích ở cuối danh sách; không cuộn ngang; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] S1-AC03 [auto] S1-02: Với `source-index.json` của fixture, tên gốc của `ja` là "日本語", `ru` là "Русский", `en` là "English"; khi bỏ `source-index.json` và giả lập không có `Intl.DisplayNames`, dòng tên gốc không render và không lỗi.
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] S1-AC04 [auto] S1-04: Chạm Tiếng Nhật: ngôn ngữ được lưu vào `vitasr2.settings`, đường dẫn thành `/hoc`; trong lúc tải, các dòng khác bị khóa.
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] S1-AC05 [auto] S1-06: Manifest đang tải thì có 6 dòng khung xương; manifest lỗi thì hiện trạng thái lỗi APP-08.
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [ ] S1-AC06 [human] S1-01, S1-04: Người học mới (không hướng dẫn) chọn được Tiếng Anh trong lần chạm đầu tiên.
- [x] S1-AC07 [auto] S1-04, S1-07: Chạm Tiếng Anh hiện bước chọn bộ với hai dòng Global English rồi English Fluency, đúng mô tả; "Quay lại" về danh sách; chọn Global English thì `vitasr2.settings` lưu bộ `global` cho `en` và đường dẫn thành `/hoc`. Chạm Tiếng Nhật thì vào thẳng `/hoc`, không qua bước chọn bộ.
  - Bằng chứng: test tests/unit/app.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
- [x] S1-AC08 [claude] S1-07: Ảnh chụp bước chọn bộ ở 320, 375, 1280 px, sáng và tối.
  - Bằng chứng: ảnh docs/evidence/S1-AC08/ (320, 375, 1280 px, sáng và tối): bước chọn bộ có "Quay lại", tiêu đề "Học tiếng Anh với bộ nào?", dòng Global English rồi English Fluency với mô tả đúng DATA-13 và mũi tên, dòng "Bạn có thể đổi bộ sau ở thanh bên hoặc trong Cài đặt." dưới danh sách, không tràn; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
