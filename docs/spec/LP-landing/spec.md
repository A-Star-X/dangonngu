---
id: LP
title: Landing
status: nháp
version: 0.7
depends: FND, APP
---

# LP Landing

Việc 4 của danh sách cải thiện: trang giới thiệu cho khách (route `/`), tách khỏi phần học của người đã đăng nhập (QD-07). Trang công khai: cho máy tìm kiếm index, có trong sitemap (APP-16). Chỉ dùng thông tin có thật: số liệu đọc từ bộ dữ liệu lúc build, ảnh chụp màn hình thật của app. Chưa có đối tác được phép nêu tên thì không có phần Đối tác, không dựng logo hay lời nhận xét mẫu.

## Yêu cầu

### LP-01 Header công khai và phần mở đầu

Header công khai: logo trái; phải là chọn ngôn ngữ giao diện, nút sáng tối, và "Đăng nhập" ở mọi khổ màn (đang ở trang Đăng nhập thì là "Đăng ký"; đã đăng nhập thì "Vào học", nút viền); viền dưới. Header, nội dung và chân trang cùng rộng tối đa khoảng 1152 px (`max-w-6xl`), `px-4 py-6`, để trên màn máy tính 1920 px trang không chỉ là một cột hẹp giữa hai vùng trống. Phần mở đầu có tiêu đề chính (`h1`), một đoạn nói rõ sản phẩm là gì và học như thế nào, hai lời mời "Bắt đầu học" (tới `/dang-ky`, nút chính duy nhất của trang, FND-02) và "Khám phá các bộ câu" (tới `/thu-vien`, chưa đăng nhập thì qua đăng nhập theo AU-05), dòng "Đã có tài khoản? Đăng nhập", và ảnh chụp màn Học thật (bản sáng hoặc tối theo giao diện). Từ `lg` phần mở đầu chia hai cột: chữ và lời mời bên trái (khoảng 5/12), ảnh chụp bên phải (khoảng 7/12); dưới `lg` ảnh nằm dưới chữ. Đoạn chữ không trải hết chiều rộng để dòng không quá dài. Logo đơn vị đồng hành (C5-08): từ `sm` nằm sau logo "Đa ngôn ngữ" (APP-18) trong header, ngăn bằng một vạch dọc màu `border` cao 24 px; dưới `sm` header không đủ chỗ nên logo nằm ở chân trang (LP-06), trên dòng bản quyền.

### LP-02 Người dùng hướng tới

Phần "Dành cho ai" nêu ba nhóm người học mà sản phẩm hướng tới, mỗi nhóm một câu nói vì sao app hợp với họ.

### LP-03 Số liệu thật

Phần "Nội dung có sẵn" hiện số ngôn ngữ, số câu và số unit của mỗi bộ nội dung, tính từ `public/data` lúc build (không gõ tay), và tên các ngôn ngữ.

### LP-04 Tính năng và lợi ích

Phần "Bạn học như thế nào": sáu tính năng có trong app (phiên 8 câu, nghe giọng đọc, ôn đúng lúc, kiểm tra nhanh, thư viện theo unit, theo dõi tiến độ), mỗi tính năng một icon, tên và một câu lợi ích đúng với cách app chạy.

### LP-05 Ba bước bắt đầu

Phần "Bắt đầu trong ba bước": tạo tài khoản và chọn ngôn ngữ, học nhóm 8 câu đầu tiên, quay lại ôn và kiểm tra.

### LP-06 Lời mời cuối trang và chân trang

Cuối trang có khối lời mời với nút "Tạo tài khoản". Chân trang có bản quyền, liên kết Đăng nhập và Đăng ký. Landing của bản dùng thử: AU-08.

### LP-07 Bố cục theo khổ màn hình

Một cột trên mobile; các nhóm thẻ (dành cho ai, số liệu, tính năng, ba bước) chia cột từ `sm` hoặc `md`. Không cuộn ngang ở 375 px; ở 1280 px và 1920 px không có khối nhỏ đứng một mình giữa vùng trắng, nội dung chiếm phần lớn chiều ngang thay vì một cột hẹp.

## Lịch sử thay đổi

- 0.1 (21/10/2026): bản đầu (Đợt 6, việc 4; QD-07).
- 0.2 (21/10/2026): theo rà soát ảnh bằng chứng Đợt 6: LP-01 nút Đăng nhập hiện cả trên màn hẹp, không có nút tới chính trang đang mở; một nút chính.
- 0.3 (21/10/2026): theo người dùng: LP-06 chân trang bỏ liên kết tới trang học chính (APP-12).
- 0.4 (21/10/2026): theo leader: Landing của bản dùng thử theo AU-08.
- 0.5 (22/10/2026): theo người dùng: LP-01 logo đơn vị đồng hành trong header công khai (C5-08).
- 0.6 (22/10/2026): theo người dùng: LP-01 logo là chữ "Đa ngôn ngữ" (APP-18).
- 0.7 (28/10/2026): theo người dùng (góp ý của leader: trang quá hẹp trên máy tính): LP-01 trang công khai rộng tối đa khoảng 1152 px thay cho 768 px, phần mở đầu hai cột từ `lg`; LP-07 thêm mốc 1920 px. Trang Đăng nhập, Đăng ký giữ khối rộng khoảng 768 px giữa trang (AU-01).
