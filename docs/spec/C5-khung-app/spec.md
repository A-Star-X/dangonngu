---
id: C5
title: Khung khu học
status: nháp
version: 0.6
depends: FND, APP
---

# C5 Khung khu học

Khung bọc mọi trang cần đăng nhập (rule giao diện của nhóm, mục "Layout workspace"): header cố định ở trên, thanh bên cố định ở trái, nội dung ở giữa. Trang công khai (Landing, Đăng nhập, Đăng ký) không dùng khung này (LP-01, AU-01).

## Yêu cầu

### C5-01 Thanh bên

Từ `md` (768 px): thanh bên cố định bên trái, rộng 240 px, cao hết màn, nền `sidebar`, viền phải. Hàng đầu cao 56 px có logo cao 32 px. Dưới logo là nút ngôn ngữ đang học (mở sheet Đổi ngôn ngữ, APP-06), rồi các nhóm mục: "Học tập" gồm Học, Luyện tập, Thư viện, Tiến độ (APP-01); "Tài khoản" gồm Cài đặt, Đăng xuất. Nhãn nhóm chữ hoa cỡ 12 px. Mỗi mục: icon 16 px, `px-3 py-2`, chữ 14 px, bo góc dropdown, cao tối thiểu 40 px. Danh sách mục tự cuộn dọc khi dài. Chưa chọn ngôn ngữ (APP-05) thì không hiện nhóm "Học tập".

### C5-02 Menu trượt trên màn hẹp

Dưới `md`: thanh bên nằm ngoài màn, nút menu trên header mở thanh bên trượt vào, kèm lớp phủ toàn màn (`z-40`, dưới thanh bên `z-50`). Đóng bằng nút đóng trong thanh bên, bấm lớp phủ, chọn một mục, đổi màn hoặc phím Escape (focus về nút menu). Khi mở, header và vùng nội dung phía sau không nhận focus hay chạm (`inert`); khi đóng, thanh bên không nhận focus bàn phím.

### C5-03 Mục đang chọn

Mục ứng với màn đang mở: nền accent của thanh bên, chữ đậm, có `aria-current="page"`; mục khác chữ muted, hover nền muted. Chi tiết Unit (S10) thuộc mục Thư viện. Vùng điều hướng có nhãn trợ năng "Điều hướng chính".

### C5-04 Mục có số

Mục Luyện tập hiện số câu cần ôn hôm nay (DATA-07) trong một nhãn nhỏ màu cảnh báo khi số đó lớn hơn 0. Nhãn trợ năng của mục: "Luyện tập, 12 câu cần ôn".

### C5-05 Header

Header cố định ở trên, cao 56 px, `z-30`, viền dưới, nền gần đặc có làm mờ phía sau. Từ `md` mép trái header trùng mép phải thanh bên. Dưới `md` header có nút menu và logo bên trái. Bên phải: chọn ngôn ngữ giao diện (APP-15) và nút sáng, tối là ô 36 px, bo góc dropdown, viền, nền card (FND-03).

### C5-06 Vùng nội dung

Nội dung có `pt-14` để không nằm dưới header, từ `md` thêm `pl-60` để không nằm dưới thanh bên. Khối trong rộng tối đa 1024 px, căn giữa, `px-4 py-6`, các khối cách nhau 16 px. Header và thanh bên luôn cố định; chỉ nội dung và danh sách mục cuộn, không cuộn ngang cả trang. Dải trạng thái APP-08 nằm đầu vùng nội dung.

### C5-07 Chân thanh bên

Cuối thanh bên: liên kết "Trang chủ" về Landing của website (APP-12), email của tài khoản đang đăng nhập, và ở chế độ trên máy (AU-06) dòng "Chế độ thử: tài khoản và tiến độ chỉ lưu trên máy này." Bản dùng thử: AU-08.

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (18/10/2026): đổi tên mục T4 thành "Tiến độ"; nhãn trợ năng của thanh là "Điều hướng chính" (theo phản hồi người dùng do nhóm chuyển).
- 0.3 (21/10/2026): Đợt 6: theo rule giao diện của nhóm, thanh tab dưới đáy và thanh dọc 220 px thay bằng khung header 56 px, thanh bên 240 px, menu trượt dưới `md`; thêm C5-05 đến C5-07. Đổi tên khu vực từ "Thanh tab" thành "Khung khu học".
- 0.4 (21/10/2026): theo rà soát code độc lập Đợt 6: C5-02 header và nội dung `inert` khi menu trượt mở.
- 0.5 (21/10/2026): theo người dùng: C5-07 liên kết cuối thanh bên là "Trang chủ" về Landing, không còn về trang học chính (APP-12).
- 0.6 (21/10/2026): theo leader: chân thanh bên của bản dùng thử theo AU-08.
