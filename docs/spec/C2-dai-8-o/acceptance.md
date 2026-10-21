# Acceptance: C2 Dải 8 ô

- [x] C2-AC01 [auto] C2-01: Truyền 8 câu thì có 8 ô, truyền 5 câu thì có 5 ô; mỗi ô 10 x 10 px, khoảng cách 4 px.
  - Bằng chứng: test tests/e2e/app.spec.ts pass trên bản Next.js (npm run test:e2e), Claude, 2026-10-21, commit d720f7d
- [x] C2-AC02 [claude] C2-02: Ảnh chụp phóng to dải có đủ 4 trạng thái, sáng và tối: đúng màu token; ô Cần ôn có vạch chéo; ảnh chuyển sang thang xám vẫn phân biệt được ô Cần ôn với ô Đã nhớ.
  - Bằng chứng: ảnh và số đo docs/evidence/C2-AC02/ (phóng to 6 lần, sáng và tối, màu và thang xám): đủ 4 trạng thái đúng token (Đã nhớ success, Cần ôn warning có vạch chéo 1,5 px màu card, Đang học primary, Chưa học viền muted-foreground 70% theo C2-02 bản 1.1, thấy rõ ở giao diện tối); ảnh thang xám phân biệt Cần ôn với Đã nhớ nhờ vạch chéo; người kiểm độc lập xem từng ảnh, Claude, 2026-10-21, commit d720f7d
- [x] C2-AC03 [auto] C2-03: Dải có nhãn trợ năng đúng mẫu; mỗi ô có nhãn "Câu n, <trạng thái>"; không ô nào nằm trong thứ tự Tab.
  - Bằng chứng: test tests/unit/components.test.tsx pass trên bản Next.js (npm test), Claude, 2026-10-21, commit d720f7d
