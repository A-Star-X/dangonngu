# Acceptance: C4 Lựa chọn trắc nghiệm

- [x] C4-AC01 [claude] C4-01: Ảnh chụp với nghĩa dài trên 120 ký tự ở 320 px: chữ xuống dòng đủ, không bị cắt; số thứ tự chỉ hiện ở 1280 px.
  - Bằng chứng: ảnh docs/evidence/C4-AC01/: nghĩa 154 ký tự (câu 3010) ở 320 px xuống dòng đủ, không cắt; số thứ tự 1 đến 4 chỉ có ở 1280 px, Claude, 2026-10-10, commit 757a784; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C4-AC02 [auto] C4-02: Chọn sai rồi chọn đúng: sự kiện "sai" phát một lần, sự kiện "đúng" phát một lần; sau khi đúng, mọi lựa chọn bị khóa. Phím 1 đến 4 chọn đúng lựa chọn tương ứng.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [x] C4-AC03 [auto] C4-03: Vùng `aria-live` nhận chuỗi "Đúng" và "Chưa đúng, thử lại" tương ứng; lựa chọn đúng và sai có icon khác nhau trong DOM; lựa chọn sai có lớp màu `--wrong` và chữ "Chưa đúng" nhìn thấy được, lựa chọn đúng có chữ "Đúng".
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
