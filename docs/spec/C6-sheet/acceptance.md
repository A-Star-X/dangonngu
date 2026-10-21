# Acceptance: C6 Sheet

- [x] C6-AC01 [claude] C6-01: Ảnh chụp sheet ở 375 px (trượt từ dưới, có tay nắm, cao không quá 90%) và 1280 px (hộp thoại giữa màn, rộng không quá 560 px), sáng và tối; ở giao diện tối lớp nền làm màn phía sau tối đi, không sáng lên.
  - Bằng chứng: ảnh và số đo docs/evidence/C6-AC01/ (sheet Đổi ngôn ngữ ở 375 và 1280 px, sáng và tối): ở 375 px sheet sát đáy, cao 731/812 px (90%), có tay nắm và bóng; ở 1280 px hộp thoại giữa màn rộng 560 px; lớp nền rgba(15,30,61,0.4) sáng, rgba(0,0,0,0.6) tối, màn phía sau tối đi; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] C6-AC02 [auto] C6-02: Sheet thường đóng được bằng nút đóng, chạm lớp nền, phím Esc; sheet xác nhận không đóng khi chạm lớp nền nhưng đóng bằng Esc.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [ ] C6-AC03 [human] C6-02: Trên điện thoại thật, vuốt xuống trên tay nắm đóng được sheet, và vuốt lên xuống trong nội dung không vô tình đóng sheet.
- [x] C6-AC04 [auto] C6-03: Khi mở, `document.activeElement` nằm trong sheet; nhấn Tab liên tục không ra ngoài sheet; khi đóng, focus về nút đã mở; thuộc tính `role`, `aria-modal`, `aria-labelledby` đúng.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] C6-AC05 [claude] C6-04: Mở sheet Đổi ngôn ngữ (16 dòng) ở 375 px và cuộn hết danh sách: nội dung cuộn trong sheet, tiêu đề đứng yên, trang phía sau không cuộn.
  - Bằng chứng: ảnh và số đo docs/evidence/C6-AC05/ (sheet Đổi ngôn ngữ 16 dòng ở 375 x 667, sáng và tối, trước và sau khi cuộn): danh sách cuộn trong sheet (scrollTop 0 tới 659 = 1167 trừ 508), dòng cuối hiện đủ, tiêu đề đứng yên ở y 91, window.scrollY 0, body overflow hidden; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, chưa commit (Đợt 6)
- [x] C6-AC06 [auto] C6-02: Sheet Đổi ngôn ngữ đang mở ở T3, route đổi sang T4 (như bấm Back): sheet đóng, trang hết bị khóa cuộn.
  - Bằng chứng: test tests/unit/ra-soat.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, chưa commit (Đợt 6)
