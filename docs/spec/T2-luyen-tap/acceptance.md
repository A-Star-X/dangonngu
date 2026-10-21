# Acceptance: T2 Luyện tập

- [x] T2-AC01 [claude] T2-01: Ảnh chụp ở 375 px và 1280 px, sáng và tối: ba mục đúng thứ tự, mỗi mục là panel viền mảnh có icon, tên và một dòng mô tả; không có nút nền `primary`.
  - Bằng chứng: ảnh và số đo docs/evidence/T2-AC01/ (375 và 1280 px, sáng và tối): ba mục đúng thứ tự Ôn tập hôm nay, Học theo từ khóa, Kiểm tra nhanh, mỗi mục là panel viền 1 px bo 8 px có icon, tên đậm, mô tả đúng T2-01; không có nút nền primary, không cuộn ngang; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] T2-AC02 [auto] T2-02: Với 12 câu cần ôn: mục hiện "12", chạm mở `/phien-hoc?nguon=on-tap`. Với 0 câu: mục bị khóa, mô tả "Hôm nay không có câu nào cần ôn."
  - Bằng chứng: test tests/unit/t2-t4.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] T2-AC03 [auto] T2-03: Gõ "dat phong" trong sheet: sau 300 ms ngừng gõ hiện số câu khớp theo DATA-12 và tối đa 5 câu xem trước; chạm chip "sân bay" điền "sân bay" vào ô tìm; "Học 8 câu đầu" mở đúng route với `q` và `nhom=1`; từ khóa chỉ khớp 1 đến 7 câu thì nút là "Học N câu".
  - Bằng chứng: test tests/unit/t2-t4.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] T2-AC04 [auto] T2-04: Chạm Kiểm tra nhanh mở `/kiem-tra` với unit đang học trong lộ trình.
  - Bằng chứng: test tests/unit/t2-t4.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] T2-AC05 [auto] T2-05: Gõ "xyzxyz": hiện đúng câu thông báo không có kết quả và nút "Học 8 câu đầu" bị khóa.
  - Bằng chứng: test tests/unit/t2-t4.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] T2-AC06 [claude] T2-03, T2-05: Ảnh chụp sheet Học theo từ khóa ở 375 px với 40 kết quả và với 0 kết quả.
  - Bằng chứng: ảnh docs/evidence/T2-AC06/ (375 x 812 và 375 x 667, sáng và tối): với "bus" sheet có ô tìm, một hàng chip cuộn ngang, "Tìm thấy 40 câu", 5 câu xem trước (cuộn trong sheet ở 375 x 667), nút "Học 8 câu đầu" bật; với "xyzxyz" câu không có kết quả hiện trọn và nút bị khóa; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] T2-AC07 [auto] T2-03: Với fixture Global English, chip là các `topic` xếp theo số câu giảm dần, tối đa 6; với fixture English Fluency, chip là 4 chip cố định.
  - Bằng chứng: test tests/unit/t2-t4.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] T2-AC08 [claude] T2-06: Ảnh 375, 1024, 1280 và 1440 px, sáng và tối: 375 px một cột, 1024 px hai cột, từ 1280 px ba cột; đúng thứ tự đọc.
  - Bằng chứng: ảnh và số đo docs/evidence/T2-AC08/ (375, 1024, 1280, 1440 px, sáng và tối): 375 px một cột; 1024 px hai cột, mục 3 xuống hàng; 1280 và 1440 px ba cột 323 px; thứ tự đọc giữ nguyên, không cuộn ngang; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, chưa commit (Đợt 6)
