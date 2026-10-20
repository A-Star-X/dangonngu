# Acceptance: T4 Tiến độ

Dùng một bộ tiến độ mẫu cố định (fixture tiến độ 30 ngày) và đồng hồ giả cho các mục `[auto]`.

- [x] T4-AC01 [auto] T4-01: Mặc định chọn "7 ngày"; chọn "30 ngày" thì route có `?khoang=30` và số liệu đổi theo; tải lại giữ lựa chọn.
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784
- [x] T4-AC02 [auto] T4-02: Với fixture tiến độ, ba chỉ số khớp giá trị tính tay ghi trong file fixture cho cả 3 khoảng; số câu cần ôn giống nhau ở 3 khoảng và bằng số ở T1.
  - Bằng chứng: test fe/tests/unit/dot2-data.test.ts và fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T4-AC03 [auto] T4-03: Mục tiêu mỗi tuần giống T1-03 ở mọi khoảng; khi đạt mục tiêu, thanh dùng màu `--known`.
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T4-AC04 [auto] T4-04: Khoảng 7 ngày có 7 cột, 30 ngày có 30 cột, 1 ngày không có biểu đồ; có bảng số liệu ẩn cho trình đọc màn hình với đúng giá trị.
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T4-AC05 [claude] T4-04: Ảnh chụp biểu đồ 7 và 30 ngày ở 320 px và 1280 px, sáng và tối: cột hôm nay màu `--brand`, nhãn trục không chồng nhau, chiều cao cột đúng tỉ lệ.
  - Bằng chứng: ảnh docs/evidence/T4-AC05/ (320 và 1280 px, sáng và tối, tiến độ mẫu 30 ngày): cột hôm nay màu --brand, nhãn trục 7 ngày (thứ) và 30 ngày (mỗi 5 ngày) không chồng nhau, chiều cao cột đúng tỉ lệ (16 cao gấp đôi 8, 5 bằng khoảng 31% cột cao nhất), Claude, 2026-10-10, commit 757a784; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] T4-AC06 [auto] T4-05: Ba dòng lịch ôn khớp giá trị tính tay theo DATA-07; câu quá hạn tính vào "Hôm nay".
  - Bằng chứng: test fe/tests/unit/dot2-data.test.ts và fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T4-AC07 [auto] T4-06: Danh sách phiên đúng thứ tự mới nhất trước, đúng nhãn nguồn, tối đa 20 dòng rồi có "Xem thêm".
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] T4-AC08 [auto] T4-07: Chạm cột ngày có 2 phiên: sheet tiêu đề đúng thứ và ngày, có 2 phiên và đúng danh sách câu.
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784
- [x] T4-AC09 [auto] T4-08: Tiến độ trống: chỉ có bộ chọn khoảng, đoạn thông báo đúng mẫu và nút "Học 8 câu".
  - Bằng chứng: test fe/tests/unit/t2-t4.test.tsx pass (npm test), Claude, 2026-10-10, commit 757a784; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [ ] T4-AC10 [human] T4-02, T4-05: Người học xem màn này và giải thích đúng con số "câu cần ôn hôm nay" và "Lịch ôn tập" nghĩa là gì (dùng chung buổi test G-AC02).
- [ ] T4-AC11 [claude] T4-09: Ảnh 1280 và 1440 px, sáng và tối: các khối xếp nhiều cột tự xuống hàng, đúng thứ tự đọc, không có khung thẻ; ở 1024 px một cột.
