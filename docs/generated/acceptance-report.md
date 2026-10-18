# Báo cáo acceptance

File sinh tự động bởi `node scripts/spec.mjs acceptance` lúc 2026-10-18 17:19 UTC. Không sửa tay.

Một khu vực **Đạt** khi mọi mục trong acceptance.md của nó đã được đánh dấu [x].

| Khu vực | Tên | Đã đạt | auto | claude | human | Trạng thái |
|---|---|---|---|---|---|---|
| G | Tổng quan giao diện bản mới | 1/5 | - | 1/1 | 0/4 | Chưa |
| APP | Khung app | 17/20 | 11/11 | 6/6 | 0/3 | Chưa |
| FND | Nền tảng thiết kế | 14/17 | 7/7 | 7/7 | 0/3 | Chưa |
| DATA | Dữ liệu và tiến độ | 20/21 | 18/18 | 2/2 | 0/1 | Chưa |
| C1 | Thẻ câu | 9/10 | 8/8 | 1/1 | 0/1 | Chưa |
| C2 | Dải 8 ô | 3/3 | 2/2 | 1/1 | - | Đạt |
| C3 | Nút | 3/4 | 1/1 | 2/2 | 0/1 | Chưa |
| C4 | Lựa chọn trắc nghiệm | 3/3 | 2/2 | 1/1 | - | Đạt |
| C5 | Thanh tab | 4/4 | 2/2 | 2/2 | - | Đạt |
| C6 | Sheet | 5/6 | 3/3 | 2/2 | 0/1 | Chưa |
| C7 | Thông báo ngắn | 3/3 | 2/2 | 1/1 | - | Đạt |
| S1 | Chọn ngôn ngữ | 7/8 | 5/5 | 2/2 | 0/1 | Chưa |
| S3 | Phiên học | 12/13 | 11/11 | 1/1 | 0/1 | Chưa |
| S5 | Kiểm tra nhanh | 10/11 | 8/8 | 2/2 | 0/1 | Chưa |
| S8 | Cài đặt | 10/13 | 9/9 | 1/1 | 0/3 | Chưa |
| S9 | Hướng dẫn lần đầu | 5/6 | 4/4 | 1/1 | 0/1 | Chưa |
| T1 | Học | 9/10 | 7/7 | 2/2 | 0/1 | Chưa |
| T2 | Luyện tập | 7/7 | 5/5 | 2/2 | - | Đạt |
| T3 | Thư viện | 10/10 | 8/8 | 2/2 | - | Đạt |
| T4 | Tiến độ | 9/10 | 8/8 | 1/1 | 0/1 | Chưa |

Tổng: 161/184 mục đã đạt.

## Mục còn mở

### G Tổng quan giao diện bản mới

- G-AC01 [human] (G-01): Ít nhất 5/5 người học bắt đầu được phiên học đầu tiên mà không hỏi người hướng dẫn; ghi lại số lần chạm từ lúc chọn ngôn ngữ tới câu đầu tiên của phiên (yêu cầu không quá 2).
- G-AC02 [human] (G-02): Ít nhất 4/5 người học tự tìm được màn Tiến độ và giải thích đúng "câu cần ôn" bằng lời của họ.
- G-AC03 [human] (G-03): Trong toàn bộ buổi test, không ai bấm nhầm giữa "Tôi nhớ" và "Cần ôn lại" (người học tự nói ra hoặc quan sát thấy bấm rồi muốn sửa).
- G-AC05 [human] (G-05): Hai người ngoài nhóm thiết kế xem ảnh chụp 5 màn chính (T1, S3a, T3, T4, S8) và không chỉ ra được dấu hiệu nào trong danh sách FND-13.

### APP Khung app

- APP-AC13 [human] (APP-07, APP-09): Mở app trên trình duyệt máy tính (Chrome, Edge, Safari) và trên điện thoại (iPhone, Android), mỗi nơi đi hết luồng chọn ngôn ngữ, học một phiên, xem tiến độ: hiển thị đủ, không có điều khiển bị che hay tràn.
- APP-AC14 [human] (APP-10): Trên điện thoại thật: mở app có mạng, tắt mạng, đóng và mở lại app: vẫn học được ngôn ngữ đã tải.
- APP-AC20 [human] (APP-09, APP-12): Trên trang học chính thật, đăng nhập, mở Đa ngôn ngữ: app mở ở trang mới. Bấm "Quay lại trang học": về đúng trang học chính và vẫn đăng nhập.

### FND Nền tảng thiết kế

- FND-AC11 [human] (FND-11): Trên điện thoại thật, chuyển động hiện câu gốc và mở sheet cho cảm giác phản hồi ngay, không chậm, không giật.
- FND-AC13 [human] (FND-12): Một người không trong nhóm đọc toàn bộ chuỗi giao diện và không thấy câu nào khó hiểu hoặc sai giọng.
- FND-AC17 [human] (FND-14): Bật VoiceOver (iPhone) và TalkBack (Android): câu tiếng Anh được đọc bằng giọng tiếng Anh, nghĩa đọc bằng giọng tiếng Việt; đi được hết luồng học một phiên.

### DATA Dữ liệu và tiến độ

- DATA-AC12 [human] (DATA-09): Xác nhận bằng văn bản từ khách cho phép dùng bộ dữ liệu trong `fe/public/data/` cho phát triển và demo (nhóm đã ghi nhận đồng ý ngày 08/10/2026; người kiểm lưu lại tin nhắn làm bằng chứng).

### C1 Thẻ câu

- C1-AC05 [human] (C1-04): Trên iPhone, Android và Windows: Nghe đọc đúng câu bằng giọng tiếng Anh; Nghe lặp lặp lại và dừng được.

### C3 Nút

- C3-AC03 [human] (C3-03): Trên điện thoại thật, dùng một tay bấm 20 lần xen kẽ hai nút đánh giá: không lần nào bấm nhầm.

### C6 Sheet

- C6-AC03 [human] (C6-02): Trên điện thoại thật, vuốt xuống trên tay nắm đóng được sheet, và vuốt lên xuống trong nội dung không vô tình đóng sheet.

### S1 Chọn ngôn ngữ

- S1-AC06 [human] (S1-01, S1-04): Người học mới (không hướng dẫn) chọn được Tiếng Anh trong lần chạm đầu tiên.

### S3 Phiên học

- S3-AC11 [human] (S3-03, S3-04): Ba người học làm một phiên trên điện thoại thật; không ai thấy bước kiểm tra lặp lại vô nghĩa hay gây khó chịu (hỏi sau phiên). Ghi lại thời gian mỗi phiên.

### S5 Kiểm tra nhanh

- S5-AC10 [human] (S5-04, S5-05): Ba người học làm cả 3 bước trên điện thoại thật; ghi lại câu nào họ thấy cách chia cụm vô lý. Nhóm quyết định chấp nhận hay đổi quy tắc chia cụm.

### S8 Cài đặt

- S8-AC03 [human] (S8-02): Trên iPhone, Android và Windows: danh sách giọng hiện đúng các giọng của máy; "Nghe thử" phát đúng giọng đã chạm.
- S8-AC07 [human] (S8-05): Trên iPhone (Safari) và Android (Chrome): "Xuất tiến độ" tải được file về máy và "Nhập tiến độ" chọn được chính file đó.
- S8-AC12 [human] (S8-02): Trên Chrome máy tính (Windows hoặc Mac) có mạng, xóa dữ liệu trang rồi mở app lần đầu, không chọn giọng: câu tiếng Anh được đọc bằng giọng Google; ít nhất 3 người thử thấy giọng này dễ nghe hơn giọng mặc định của máy (so bằng "Nghe thử" trong Cài đặt > Giọng đọc).

### S9 Hướng dẫn lần đầu

- S9-AC06 [human] (S9-02): Người học mới đọc hết 3 bước trong dưới 20 giây và nói lại được Ôn tập nằm ở đâu.

### T1 Học

- T1-AC09 [human] (T1-02, T1-04): Trên điện thoại thật, người học hiểu được khi nào nên bấm nút chính và khi nào nên chạm dòng câu cần ôn (hỏi lại sau khi họ thao tác).

### T4 Tiến độ

- T4-AC10 [human] (T4-02, T4-05): Người học xem màn này và giải thích đúng con số "câu cần ôn hôm nay" và "Lịch ôn tập" nghĩa là gì (dùng chung buổi test G-AC02).
