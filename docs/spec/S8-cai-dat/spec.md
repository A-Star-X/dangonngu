---
id: S8
title: Cài đặt
status: nháp
version: 1.1
route: "/cai-dat"
depends: APP, FND, DATA, C3, C6, C7
legacy: L-D4, L-D8, nút giao diện ở header L-S2
---

# S8 Cài đặt

Mở từ mục "Cài đặt" trong nhóm Tài khoản của thanh bên (APP-02); mục đó ở trạng thái đang chọn. Đầu màn có nút "Quay lại" về màn đã mở trước khi vào Cài đặt, rồi tiêu đề màn và mô tả (`PageHeader`). Các nhóm là panel (`CardCustom`) với tiêu đề section.

## Yêu cầu

### S8-01 Học tập

Nhóm "Học tập" gồm: "Mục tiêu mỗi tuần" với bộ tăng giảm từ 1 đến 21 phiên (mặc định 5), lưu ngay khi đổi; "Ngôn ngữ đang học" hiện tên ngôn ngữ (và tên bộ nội dung khi ngôn ngữ có nhiều bộ), chạm mở sheet Đổi ngôn ngữ (APP-06), nơi đổi được cả ngôn ngữ lẫn bộ nội dung.

### S8-02 Giọng đọc

Nhóm "Âm thanh", mục "Giọng đọc" hiện tên giọng đang dùng ("Tự động ([tên giọng])" khi người học chưa chọn); chạm mở sheet (C6) "Giọng đọc" gồm:
- Ô chọn (C8) "Chọn giọng cho": ngôn ngữ đang học hoặc Tiếng Việt.
- Ô chọn giọng (C8) gồm các giọng có trên thiết bị khớp ngôn ngữ đó (theo `lang` của giọng, dòng phụ là mã vùng); lựa chọn đầu là "Tự động", kèm dòng phụ "Đang dùng [tên giọng]" cho biết giọng sẽ được dùng. Có ô lọc khi nhiều hơn 8 giọng. Cạnh ô chọn là nút "Nghe thử" đọc một câu mẫu của ngôn ngữ đó bằng giọng đang chọn.

Giọng "Tự động" (mặc định khi người học chưa chọn giọng nào), chọn trong các giọng khớp ngôn ngữ theo thứ tự (vùng lấy theo bộ nội dung đang học, giống thẻ câu: Global English `en-GB`, English Fluency `en-US`): giọng Google đúng vùng (ví dụ "Google US English" cho `en-US`, "Google UK English Female" cho `en-GB`); giọng Google khác cùng ngôn ngữ; giọng có tên chứa Natural, Neural, Online, Enhanced hoặc Premium (đúng vùng trước); giọng đúng vùng; giọng mặc định của thiết bị; giọng đầu tiên. Giọng Google trên Chrome cần mạng: khi đang ngoại tuyến, "Tự động" bỏ qua các giọng cần mạng; khi một giọng cần mạng báo lỗi trước lúc đọc, app đọc lại câu đó một lần bằng giọng có sẵn trên máy theo cùng thứ tự.
- Ô chọn (C8) "Tốc độ đọc": 0,75x, 1x, 1,25x (mặc định 1x).
- Nút chính "Xong".
Khi không có giọng nào: "Thiết bị chưa có giọng [tên ngôn ngữ]. Thêm giọng trong cài đặt hệ thống của thiết bị rồi mở lại app." Lựa chọn lưu theo từng ngôn ngữ (DATA-06). Bản này chưa có chỗ nào đọc nghĩa tiếng Việt thành tiếng; giọng Tiếng Việt chọn được để dùng khi có tính năng đó.

### S8-03 Âm thanh ngoại tuyến

Mục "Âm thanh ngoại tuyến" chỉ hiển thị khi ngôn ngữ đang học có gói âm thanh dựng sẵn. Bản đầu chưa hỗ trợ tải gói, nên mục này không hiển thị với mọi ngôn ngữ (dữ liệu hiện chỉ có gói tiếng Lào).

### S8-04 Giao diện

Nhóm "Giao diện" gồm ô chọn (C8) "Sáng, tối" với ba lựa chọn "Theo thiết bị", "Sáng", "Tối" (FND-03) và ô chọn "Ngôn ngữ giao diện" (Tiếng Việt, English; APP-15). Đổi là áp dụng ngay.

### S8-05 Tiến độ

Nhóm "Tiến độ" gồm:
- "Xuất tiến độ": tải file `vitasr-tien-do-[mã ngôn ngữ]-[yyyy-mm-dd].json` chứa tiến độ của ngôn ngữ đang học và cài đặt.
- "Nhập tiến độ": chọn tệp JSON; kiểm tra đúng cấu trúc DATA-06 (kể cả giá trị: `streak` là số nguyên không âm, `position` trong khoảng 0 đến số câu, `step` hợp lệ), đúng ngôn ngữ và đúng bộ nội dung đang học (tiếng Anh có hai bộ dùng chung dải id câu); tệp lớn hơn 8 MB coi là tệp sai, không đọc; sheet xác nhận "Thay tiến độ [tên] hiện tại bằng tệp này?" với nút "Hủy" và "Nhập tiến độ"; xong thì thông báo ngắn "Đã nhập tiến độ". Tệp sai: thông báo lỗi "Tệp này không phải tệp tiến độ học [tên] của VITASR. Chọn tệp đã xuất bằng Xuất tiến độ khi đang học [tên]." và không thay đổi gì. [tên] là tên ngôn ngữ viết thường chữ đầu (FND-12), kèm tên bộ trong ngoặc khi ngôn ngữ có nhiều bộ, ví dụ "tiếng Anh (Global English)". Nhãn mục xóa là "Xóa tiến độ [tên ngôn ngữ]" với tên viết thường chữ đầu, ví dụ "Xóa tiến độ tiếng Anh"; trong câu "Gõ "[tên ngôn ngữ]" để xác nhận" giữ đúng tên như danh sách ngôn ngữ.
- "Xóa tiến độ [tên ngôn ngữ]": sheet xác nhận có dòng "Gõ "[tên ngôn ngữ]" để xác nhận. Tiến độ đã xóa không lấy lại được.", ô gõ, nút "Hủy" và "Xóa"; "Xóa" chỉ mở khi gõ đúng tên ngôn ngữ (không phân biệt hoa thường nhưng phải đủ dấu); xong thì thông báo ngắn "Đã xóa tiến độ" và về T1.

### S8-06 Trợ giúp

Nhóm "Trợ giúp" gồm "Xem lại hướng dẫn" (mở S9 trên T1) và dòng "Phiên bản [số phiên bản app]" không chạm được.

### S8-07 Bố cục máy tính

Từ `lg` (1024 px), các nhóm cài đặt xếp vào lưới hai cột, thứ tự đọc giữ nguyên; dưới `lg` một cột.


### S8-08 Tài khoản

Nhóm "Tài khoản" gồm dòng "Email" hiện email đang đăng nhập (không chạm được) và "Đăng xuất" (AU-05). Bản dùng thử không có nhóm này (AU-08). Mục "Xóa tiến độ" trong nhóm Tiến độ dùng màu `danger` vì không lấy lại được.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| S8-04 ghi "Theo thiết bị", FND-03 ghi "Theo hệ thống" | Dùng "Theo thiết bị" ở cả hai chỗ | S8-04, FND-03 |
| S8-05: câu báo lỗi nhập tệp chưa có hướng xử lý, có chữ "File" | Câu mới có hướng xử lý, dùng "tệp"; nhóm đổi tên thành "Tiến độ" | S8-05, FND-12 |
| S8-05: tiếng Anh có hai bộ dùng chung dải id câu | Chỉ nhận tệp đúng cả ngôn ngữ lẫn bộ nội dung đang học | S8-05 |
| S8-05: tên nút trong hai sheet xác nhận | Ghi vào spec đúng như code: "Hủy"/"Nhập tiến độ", "Hủy"/"Xóa" | S8-05 |
| S8-02: có cần nút nghe nghĩa tiếng Việt không | Không ở bản này; giữ lựa chọn giọng Tiếng Việt | S8-02, `docs/new/ui-spec.md` mục 3 |
| S8: thanh trên cùng khi đang ở S8 | Chỉ có nút "Quay lại" bên trái, không có nút Cài đặt | Phần mở đầu S8 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.3 (10/10/2026): chốt các câu hỏi mở (Claude quyết định theo ủy quyền của nhóm): nhóm "Dữ liệu" đổi tên thành "Tiến độ"; câu báo lỗi nhập tệp có hướng xử lý; ghi tên nút sheet xác nhận; không có nghe nghĩa ở bản này.
- 0.4 (18/10/2026): S8-02 thay "Mặc định của thiết bị" bằng "Tự động", ưu tiên giọng Google rồi giọng chất lượng cao, đọc lại bằng giọng trên máy khi giọng cần mạng lỗi; "Giọng cho" thành "Chọn giọng cho"; S8-05 viết tên ngôn ngữ theo FND-12 (theo phản hồi người dùng do nhóm chuyển); S8-05 kiểm cả giá trị trong tệp nhập và giới hạn 8 MB (sửa lỗi tìm thấy khi rà soát code); giọng Tự động lấy vùng theo bộ đang học; câu báo tệp sai viết lại.
- 0.5 (20/10/2026): thêm S8-07 bố cục từ 1200 px (Đợt 5 việc 6).
- 1.0 (21/10/2026): Đợt 6 (Next.js, rule giao diện của nhóm): S8 mở từ thanh bên; giọng đọc, tốc độ, sáng tối dùng ô chọn C8 thay radio, một nút "Nghe thử" cho giọng đang chọn; thêm ngôn ngữ giao diện (APP-15) và S8-08 Tài khoản; S8-07 hai cột từ `lg`.
- 1.1 (21/10/2026): theo leader: S8-08 bản dùng thử không có nhóm Tài khoản (AU-08).
