# Acceptance: C6 Sheet

- [x] C6-AC01 [claude] C6-01: Ảnh chụp sheet ở 375 px (trượt từ dưới, có tay nắm, cao không quá 90%) và 1280 px (hộp thoại giữa màn, rộng không quá 560 px), sáng và tối; ở giao diện tối lớp nền làm màn phía sau tối đi, không sáng lên.
  - Bằng chứng: ảnh docs/evidence/C6-AC01/ chụp lại sau khi đổi lớp nền (375 và 1280 px, sáng và tối): ở 375 px sheet trượt từ dưới, có tay nắm, cao không quá 90%; ở 1280 px hộp thoại giữa màn rộng không quá 560 px; ở giao diện tối lớp nền đen độ mờ 60% làm màn phía sau tối đi, Claude, 2026-10-10, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C6-AC02 [auto] C6-02: Sheet thường đóng được bằng nút đóng, chạm lớp nền, phím Esc; sheet xác nhận không đóng khi chạm lớp nền nhưng đóng bằng Esc.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
- [ ] C6-AC03 [human] C6-02: Trên điện thoại thật, vuốt xuống trên tay nắm đóng được sheet, và vuốt lên xuống trong nội dung không vô tình đóng sheet.
- [x] C6-AC04 [auto] C6-03: Khi mở, `document.activeElement` nằm trong sheet; nhấn Tab liên tục không ra ngoài sheet; khi đóng, focus về nút đã mở; thuộc tính `role`, `aria-modal`, `aria-labelledby` đúng.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa
- [x] C6-AC05 [claude] C6-04: Mở sheet Tìm câu theo từ khóa với 40 kết quả ở 375 px: nội dung cuộn trong sheet, tiêu đề đứng yên, trang phía sau không cuộn.
  - Bằng chứng: ảnh và số đo docs/evidence/C6-AC05/ (375 x 667, 40 kết quả "bus"): thân sheet cuộn (scrollHeight 804 > clientHeight 443), tiêu đề và nút "Học 8 câu đầu" đứng yên, trang phía sau scrollY 0, body overflow hidden, Claude, 2026-10-10, commit 757a784; ảnh chụp lại 10/10 với bản Đợt 3, commit 9aaf1ed; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C6-AC06 [auto] C6-02: Sheet Đổi ngôn ngữ đang mở ở T3, route đổi sang T4 (như bấm Back): sheet đóng, trang hết bị khóa cuộn.
  - Bằng chứng: test fe/tests/unit/ra-soat.test.tsx pass (npm test), Claude, 2026-10-18, commit 5ed137c
