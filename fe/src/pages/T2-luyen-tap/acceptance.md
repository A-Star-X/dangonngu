# Acceptance: T2 Luyện tập

- [x] T2-AC01 [claude] T2-01: Ảnh chụp ở 375 px và 1280 px, sáng và tối: ba mục đúng thứ tự, ngăn bằng đường kẻ, không có khung thẻ, không có nút nền `--brand`.
  - Bằng chứng: ảnh docs/evidence/T2-AC01/ (375 và 1280 px, sáng và tối): ba mục Ôn câu cần ôn, Học theo từ khóa, Kiểm tra nhanh đúng thứ tự, ngăn bằng đường kẻ, không khung thẻ, không nút nền --brand, Claude, 2026-10-10, commit 757a784; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] T2-AC02 [auto] T2-02: Với 12 câu cần ôn: mục hiện "12", chạm mở `#/phien-hoc?nguon=on-tap`. Với 0 câu: mục bị khóa, mô tả "Hôm nay không có câu nào cần ôn."
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T2-AC03 [auto] T2-03: Gõ "dat phong" trong sheet: sau 250 ms hiện số câu khớp theo DATA-12 và tối đa 5 câu xem trước; chạm chip "sân bay" điền "sân bay" vào ô tìm; "Học 8 câu đầu" mở đúng route với `q` và `nhom=1`; từ khóa chỉ khớp 1 đến 7 câu thì nút là "Học N câu".
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 9aaf1ed; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T2-AC04 [auto] T2-04: Chạm Kiểm tra nhanh mở `#/kiem-tra` với unit đang học trong lộ trình.
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 20/10 với bản Đợt 5: test fe/tests/unit/t2-t4.test.tsx pass sau khi thêm mở lại bài kiểm tra dở (npm test), commit 77d7fd6
- [x] T2-AC05 [auto] T2-05: Gõ "xyzxyz": hiện đúng câu thông báo không có kết quả và nút "Học 8 câu đầu" bị khóa.
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T2-AC06 [claude] T2-03, T2-05: Ảnh chụp sheet Học theo từ khóa ở 375 px với 40 kết quả và với 0 kết quả.
  - Bằng chứng: ảnh docs/evidence/T2-AC06/ (375 px, Global English): 40 kết quả với từ khóa "bus" và 0 kết quả với "xyzxyz" (nút Học 8 câu đầu bị khóa), sáng và tối, ở 375 x 812 và 375 x 667, Claude, 2026-10-10, commit 757a784; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] T2-AC07 [auto] T2-03: Với fixture Global English, chip là các `topic` xếp theo số câu giảm dần, tối đa 6; với fixture English Fluency, chip là 4 chip cố định.
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T2-AC08 [claude] T2-06: Ảnh 1280 và 1440 px, sáng và tối: các khối xếp nhiều cột tự xuống hàng, đúng thứ tự đọc, không có khung thẻ; ở 1024 px một cột.
  - Bằng chứng: ảnh docs/evidence/T2-AC08/ (1024, 1280, 1440 px, sáng và tối): từ 1280 px ba mục xếp ngang, ngăn bằng đường kẻ, không khung thẻ; 1024 px một cột, Claude, 2026-10-20, commit 9036fa6
