# Acceptance: S10 Chi tiết Unit

Khổ kiểm mặc định và quy tắc đánh dấu: `docs/QUY-TRINH.md` mục 5 và 7.

- [x] S10-AC01 [auto] S10-01: Mở `#/unit?so=2` thấy thanh tab với mục Thư viện đang chọn; đường dẫn có liên kết "Thư viện" mở `#/thu-vien` ở cách xem Unit và phần "Unit 2" có `aria-current="page"`; mở `#/unit?so=9999` thì route thành `#/thu-vien`.
  - Bằng chứng: test fe/tests/unit/dot5-unit.test.tsx pass (npm test), Claude, 2026-10-20, commit 3229c5f
- [x] S10-AC02 [auto] S10-02: Với fixture Global English, đường dẫn kết thúc bằng "Unit n · A1", tiêu đề màn là `title` có `lang` đúng, `translation` và `situation` của unit.
  - Bằng chứng: test fe/tests/unit/dot5-unit.test.tsx pass (npm test), Claude, 2026-10-20, commit edaf896
- [x] S10-AC03 [auto] S10-03: Với tiến độ fixture, dải 8 ô và dòng "Đã nhớ x · Cần ôn y · Chưa học z" đúng trạng thái từng câu; phần có số 0 không hiện.
  - Bằng chứng: test fe/tests/unit/dot5-unit.test.tsx pass (npm test), Claude, 2026-10-20, commit edaf896
- [x] S10-AC04 [auto] S10-04, S3-01: "Học unit này" mở `#/phien-hoc?nguon=unit&so=n`, phiên có đúng các câu của unit n; thoát phiên thì về `#/unit?so=n`; unit đã nhớ hết thì nút là "Ôn lại unit này"; "Kiểm tra nhanh unit này" mở `#/kiem-tra?unit=n`.
  - Bằng chứng: test fe/tests/unit/dot5-unit.test.tsx pass (npm test), Claude, 2026-10-20, commit edaf896
- [x] S10-AC05 [auto] S10-05: Danh sách có đúng các câu của unit; chạm một dòng mở sheet "Câu [id]" ở cả 375 và 1280 px.
  - Bằng chứng: test fe/tests/unit/dot5-unit.test.tsx pass (npm test); S10 không đổi theo khổ màn hình (luôn mở sheet), Claude, 2026-10-20, commit edaf896
- [x] S10-AC06 [auto] S10-06: Ở unit 1 không có liên kết unit trước; ở unit cuối không có liên kết unit sau; "Unit n+1" mở `#/unit?so=n+1`.
  - Bằng chứng: test fe/tests/unit/dot5-unit.test.tsx pass (npm test), Claude, 2026-10-20, commit edaf896
- [x] S10-AC07 [auto] S10-04, T4-06: Hoàn tất một phiên `nguon=unit` thì T4 liệt kê phiên đó với tên nguồn "Học theo unit".
  - Bằng chứng: test fe/tests/unit/dot5-unit.test.tsx pass (đi hết một phiên nguon=unit rồi mở T4; npm test), Claude, 2026-10-20, commit edaf896
- [x] S10-AC08 [claude] S10-01, S10-02, S10-03: Ảnh 375 và 1280 px, sáng và tối, với unit đang học dở: thứ bậc chữ theo FND-15, một nút chính, không cuộn ngang.
  - Bằng chứng: ảnh và số đo docs/evidence/S10-AC08/ (Global English unit 4 đang học dở, 375 và 1280 px, sáng và tối): h1 25 px, h2 20 px, một nút chính, không cuộn ngang, Claude, 2026-10-20, commit 3229c5f
