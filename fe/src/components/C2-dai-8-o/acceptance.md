# Acceptance: C2 Dải 8 ô

- [x] C2-AC01 [auto] C2-01: Truyền 8 câu thì có 8 ô, truyền 5 câu thì có 5 ô; mỗi ô 10 x 10 px, khoảng cách 4 px.
  - Bằng chứng: test fe/tests/e2e/app.spec.ts pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa
- [x] C2-AC02 [claude] C2-02: Ảnh chụp phóng to dải có đủ 4 trạng thái, sáng và tối: đúng màu token; ô Cần ôn có vạch chéo; ảnh chuyển sang thang xám vẫn phân biệt được ô Cần ôn với ô Đã nhớ.
  - Bằng chứng: ảnh docs/evidence/C2-AC02/ (phóng 6 lần, sáng, tối, thang xám), Claude, 2026-10-08, commit 97e85fa; ảnh chụp lại 18/10 với bản Đợt 4, commit 5ed137c
- [x] C2-AC03 [auto] C2-03: Dải có nhãn trợ năng đúng mẫu; mỗi ô có nhãn "Câu n, <trạng thái>"; không ô nào nằm trong thứ tự Tab.
  - Bằng chứng: test fe/tests/unit/components.test.tsx pass (npm test, npm run test:e2e), Claude, 2026-10-08, commit 97e85fa; kiểm lại 18/10 với bản Đợt 4 (npm test, npm run test:e2e), commit 5ed137c
