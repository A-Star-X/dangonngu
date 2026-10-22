---
id: AU
title: Tài khoản (đăng ký, đăng nhập)
status: nháp
version: 0.4
depends: FND, APP, DATA
---

# AU Tài khoản

Việc 5 của danh sách cải thiện: đăng nhập, đăng ký, kiểm tra dữ liệu nhập, luồng sau khi đăng nhập, phân biệt trang công khai và trang cần đăng nhập. Dịch vụ: Supabase Auth (QD-06). Trang đăng nhập và đăng ký là trang công khai, nằm ngoài khung khu học (C5), dùng header công khai (LP-01).

## Yêu cầu

### AU-01 Đăng nhập

Route `/dang-nhap`. Form gồm "Email", "Mật khẩu" và nút "Đăng nhập"; cuối form có "Chưa có tài khoản? Đăng ký". Từ `md` trang chia hai cột: bên trái ba ý ngắn về sản phẩm, bên phải form (rộng tối đa `max-w-lg`); dưới `md` form ở trên. Đang gửi thì nút hiện chỉ báo và không nhận bấm. Đăng nhập xong vào địa chỉ đang chờ (AU-05) hoặc `/hoc`.

### AU-02 Đăng ký

Route `/dang-ky`. Form gồm "Email", "Mật khẩu" (gợi ý "Ít nhất 8 ký tự."), "Nhập lại mật khẩu" và nút "Tạo tài khoản"; cuối form có "Đã có tài khoản? Đăng nhập". Đăng ký xong thì đã đăng nhập và vào như AU-01 (tài khoản mới chưa có ngôn ngữ nên sang S1, APP-05). Nếu máy chủ bật xác nhận email (chưa có phiên sau khi đăng ký), form thay bằng câu "Đã gửi thư xác nhận tới [email]. Mở thư và nhấn liên kết xác nhận, rồi quay lại đăng nhập."

### AU-03 Kiểm tra dữ liệu nhập

Kiểm khi bấm nút, lỗi hiện ngay dưới ô (không phải thông báo nổi), ô lỗi có `aria-invalid` và trỏ tới câu lỗi bằng `aria-describedby`. Câu lỗi: email trống "Nhập email.", sai dạng "Email chưa đúng dạng, ví dụ ten@gmail.com."; mật khẩu trống "Nhập mật khẩu."; đăng ký: mật khẩu dưới 8 ký tự "Mật khẩu cần ít nhất 8 ký tự.", ô nhập lại trống "Nhập lại mật khẩu.", hai ô khác nhau "Hai mật khẩu chưa giống nhau.". Email bỏ khoảng trắng hai đầu và viết thường trước khi gửi.

### AU-04 Lỗi từ máy chủ

Lỗi khi gọi dịch vụ tài khoản hiện bằng thông báo lỗi (C7, `role="alert"`), không chuyển trang, giữ nội dung đã nhập (trừ khi tải lại trang). Câu theo loại lỗi: sai email hoặc mật khẩu; email đã có tài khoản; mật khẩu chưa đủ mạnh; email chưa xác nhận; thử quá nhiều lần; không kết nối được máy chủ; lỗi khác. Câu cụ thể nằm trong namespace `apiError` của file ngôn ngữ giao diện.

### AU-05 Trang cần đăng nhập

Mọi route của khu học (APP-04) cần đăng nhập. Chưa đăng nhập mà mở: chuyển (thay route, không thêm lịch sử) tới `/dang-nhap?tiep=[địa chỉ đang mở]`; đăng nhập hay đăng ký xong quay về đúng địa chỉ đó. `tiep` chỉ nhận route của khu học (APP-04), kiểm sau khi chuẩn hóa đường dẫn; giá trị khác (địa chỉ ngoài website, `//host`, `/.//host`, route không có) bị bỏ qua. Đã đăng nhập mà mở `/dang-nhap` hoặc `/dang-ky` thì chuyển vào `/hoc`. "Đăng xuất" (thanh bên, S8-08) xóa phiên rồi về `/dang-nhap` (không kèm `tiep`: người đăng nhập sau có thể là người khác). Phiên đăng nhập lưu trên trình duyệt (token và thông tin người dùng), mở lại app vẫn còn đăng nhập; đăng xuất ở một tab thì các tab khác cũng về trang đăng nhập.

### AU-06 Chế độ trên máy

Khi bản build chưa cấu hình Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` trống), app chạy chế độ thử: tài khoản lưu trên trình duyệt (mật khẩu chỉ lưu dạng băm PBKDF2 có muối riêng cho từng tài khoản; tài khoản thử tạo trước Đợt 6 được nâng khi đăng nhập), tiến độ không đồng bộ. Trang đăng nhập, đăng ký và chân thanh bên (C5-07) có dòng báo chế độ thử. Test tự động chạy ở chế độ này, không gọi Supabase thật.

### AU-07 Nhiều người trên một máy

Dữ liệu học trên máy (cài đặt, tiến độ) thuộc về một tài khoản. Lần đầu đăng nhập trên máy đã có dữ liệu học từ trước khi có đăng nhập: dữ liệu đó thuộc về tài khoản này (người dùng cũ không mất tiến độ). Người khác đăng nhập trên cùng máy: dữ liệu của người trước được cất riêng, người mới thấy dữ liệu của mình (lấy lại phần đã cất nếu có, và từ tài khoản theo DATA-14). Giao diện sáng tối và ngôn ngữ giao diện không thuộc tài khoản.

### AU-08 Bản dùng thử

Bản build cho môi trường demo (`NEXT_PUBLIC_APP_ENV=demo`, APP-17) là bản dùng thử, không cần tài khoản:

- Không có đăng nhập, đăng ký, đăng xuất. Mở khu học là vào ngay, không chuyển sang `/dang-nhap` (thay AU-05); mở `/dang-nhap` hoặc `/dang-ky` thì chuyển (thay route) vào `/hoc`.
- Không dùng Supabase kể cả khi bản build có cấu hình: không gọi dịch vụ tài khoản, không đồng bộ (DATA-14). Cài đặt và tiến độ lưu trên trình duyệt như AU-06.
- Landing giữ đủ các phần (LP), trừ: "Bắt đầu học" và nút ở lời mời cuối trang (chữ "Bắt đầu học", nút viền) trỏ tới `/hoc`; không có dòng "Đã có tài khoản? Đăng nhập"; bước đầu tiên (LP-05) là "Chọn ngôn ngữ"; câu ở lời mời cuối trang là "Chọn ngôn ngữ và học nhóm câu đầu tiên, không cần tài khoản.". Header công khai có nút "Vào học" như khi đã đăng nhập (LP-01). Chân trang không có liên kết Đăng nhập, Đăng ký (LP-06).
- Thanh bên (C5-07) không có email, không có "Đăng xuất", không có dòng báo chế độ; chân thanh bên chỉ có "Trang chủ" và logo đơn vị đồng hành (C5-08). Cài đặt không có nhóm "Tài khoản" (S8-08).

## Lịch sử thay đổi

- 0.1 (21/10/2026): bản đầu (Đợt 6, việc 5; QD-06, QD-07).
- 0.2 (21/10/2026): theo rà soát code độc lập Đợt 6: AU-05 `tiep` chỉ nhận route của khu học, đăng xuất về `/dang-nhap` không kèm `tiep`; AU-06 băm mật khẩu PBKDF2 có muối.
- 0.3 (21/10/2026): theo leader: thêm AU-08 bản dùng thử không cần đăng nhập cho môi trường demo (APP-17, QD-11).
- 0.4 (22/10/2026): theo người dùng: AU-08 bỏ dòng "Bản dùng thử: ..." ở chân thanh bên; chỗ đó là logo đơn vị đồng hành (C5-08).
