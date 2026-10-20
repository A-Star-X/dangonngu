# Báo cáo acceptance

File sinh tự động bởi `node scripts/spec.mjs acceptance` lúc 2026-10-20 14:53 UTC. Không sửa tay.

Một khu vực **Đạt** khi mọi mục trong acceptance.md của nó đã được đánh dấu [x].

| Khu vực | Tên | Đã đạt | auto | claude | human | Trạng thái |
|---|---|---|---|---|---|---|
| G | Tổng quan giao diện bản mới | 1/5 | - | 1/1 | 0/4 | Chưa |
| APP | Khung app | 17/20 | 11/11 | 6/6 | 0/3 | Chưa |
| FND | Nền tảng thiết kế | 16/19 | 8/8 | 8/8 | 0/3 | Chưa |
| DATA | Dữ liệu và tiến độ | 20/21 | 18/18 | 2/2 | 0/1 | Chưa |
| C1 | Thẻ câu | 9/10 | 8/8 | 1/1 | 0/1 | Chưa |
| C2 | Dải 8 ô | 3/3 | 2/2 | 1/1 | - | Đạt |
| C3 | Nút | 3/4 | 1/1 | 2/2 | 0/1 | Chưa |
| C4 | Lựa chọn trắc nghiệm | 3/3 | 2/2 | 1/1 | - | Đạt |
| C5 | Thanh tab | 4/4 | 2/2 | 2/2 | - | Đạt |
| C6 | Sheet | 5/6 | 3/3 | 2/2 | 0/1 | Chưa |
| C7 | Thông báo ngắn | 3/3 | 2/2 | 1/1 | - | Đạt |
| S1 | Chọn ngôn ngữ | 7/8 | 5/5 | 2/2 | 0/1 | Chưa |
| S10 | Chi tiết Unit | 0/8 | 0/7 | 0/1 | - | Chưa |
| S3 | Phiên học | 12/13 | 11/11 | 1/1 | 0/1 | Chưa |
| S5 | Kiểm tra nhanh | 7/15 | 5/11 | 2/3 | 0/1 | Chưa |
| S8 | Cài đặt | 10/13 | 9/9 | 1/1 | 0/3 | Chưa |
| S9 | Hướng dẫn lần đầu | 5/6 | 4/4 | 1/1 | 0/1 | Chưa |
| T1 | Học | 7/13 | 6/10 | 1/2 | 0/1 | Chưa |
| T2 | Luyện tập | 6/7 | 4/5 | 2/2 | - | Chưa |
| T3 | Thư viện | 0/14 | 0/11 | 0/3 | - | Chưa |
| T4 | Tiến độ | 9/10 | 8/8 | 1/1 | 0/1 | Chưa |

Tổng: 147/205 mục đã đạt.

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

### S10 Chi tiết Unit

- S10-AC01 [auto] (S10-01): Mở `#/unit?so=2` thấy thanh tab với mục Thư viện đang chọn; liên kết "Thư viện" mở `#/thu-vien` ở cách xem Unit; mở `#/unit?so=9999` thì route thành `#/thu-vien`.
- S10-AC02 [auto] (S10-02): Với fixture Global English, đầu màn có "Unit n · A1", tiêu đề màn là `title` có `lang` đúng, `translation` và `situation` của unit.
- S10-AC03 [auto] (S10-03): Với tiến độ fixture, dải 8 ô và dòng "Đã nhớ x · Cần ôn y · Chưa học z" đúng trạng thái từng câu; phần có số 0 không hiện.
- S10-AC04 [auto] (S10-04, S3-01): "Học unit này" mở `#/phien-hoc?nguon=unit&so=n`, phiên có đúng các câu của unit n; thoát phiên thì về `#/unit?so=n`; unit đã nhớ hết thì nút là "Ôn lại unit này"; "Kiểm tra nhanh unit này" mở `#/kiem-tra?unit=n`.
- S10-AC05 [auto] (S10-05): Danh sách có đúng các câu của unit; chạm một dòng mở sheet "Câu [id]" ở cả 375 và 1280 px.
- S10-AC06 [auto] (S10-06): Ở unit 1 không có liên kết unit trước; ở unit cuối không có liên kết unit sau; "Unit n+1" mở `#/unit?so=n+1`.
- S10-AC07 [auto] (S10-04, T4-06): Hoàn tất một phiên `nguon=unit` thì T4 liệt kê phiên đó với tên nguồn "Học theo unit".
- S10-AC08 [claude] (S10-01, S10-02, S10-03): Ảnh 375 và 1280 px, sáng và tối, với unit đang học dở: thứ bậc chữ theo FND-15, một nút chính, không cuộn ngang.

### S3 Phiên học

- S3-AC11 [human] (S3-03, S3-04): Ba người học làm một phiên trên điện thoại thật; không ai thấy bước kiểm tra lặp lại vô nghĩa hay gây khó chịu (hỏi sau phiên). Ghi lại thời gian mỗi phiên.

### S5 Kiểm tra nhanh

- S5-AC01 [auto] (S5-01): Mở `#/kiem-tra` không tham số thì nhóm câu là unit đang học; với `?unit=2` là unit 2. Bốn nút bắt đầu đúng nhãn; mỗi nút chạy đúng bước tương ứng.
- S5-AC07 [auto] (S5-07): Làm cả 3 bước với 1 câu sai ở bước 1: kết quả hiện đúng số liệu từng bước; câu sai thành Cần ôn trong tiến độ; ở unit cuối không có nút "Kiểm tra unit tiếp theo".
- S5-AC08 [auto] (S5-08): Thoát giữa bước 2: sheet xác nhận đúng chữ; "Dừng" về T2 Luyện tập (`#/luyen-tap`), kể cả khi mở thẳng `#/kiem-tra`; kết quả các câu đã làm có trong tiến độ; mở lại `#/kiem-tra` bắt đầu từ màn bắt đầu.
- S5-AC10 [human] (S5-04, S5-05): Ba người học làm cả 3 bước trên điện thoại thật; ghi lại câu nào họ thấy cách chia cụm vô lý. Nhóm quyết định chấp nhận hay đổi quy tắc chia cụm.
- S5-AC12 [auto] (S5-08, S5-09): Làm cả 3 bước, tạm dừng ở bước 3 câu 2 rồi tải lại trang: T2 hiện "Đang làm dở: Unit n, bước sắp xếp câu, câu 2/N"; chạm mục Kiểm tra nhanh mở lại đúng bước 3, câu 2, chỉ báo có hai bước đầu đã xong; làm hết thì màn kết quả tính cả các câu làm trước khi tạm dừng.
- S5-AC13 [auto] (S5-09): Có bài dở ở unit n: màn bắt đầu của unit n có "Làm tiếp" và "Làm lại từ đầu"; "Làm lại từ đầu" kết thúc bài dở (T2 không còn dòng làm dở) và hiện lại "Làm cả 3 bước"; bắt đầu bài ở unit khác thì bài dở cũ kết thúc; phiên học dở của S3 không bị ảnh hưởng.
- S5-AC14 [auto] (S5-07): Sai ngay lần đầu ở câu 2 bước 1 và câu 5 bước 3: khối "Câu cần xem lại" có đúng hai câu đó theo thứ tự, câu gốc có `lang`, có nút Nghe; làm đúng hết thì không có khối.
- S5-AC15 [claude] (S5-08, S5-09, S5-07): Ảnh 375 và 1280 px, sáng và tối: sheet Tạm dừng kiểm tra, dòng làm dở ở T2, màn bắt đầu có Làm tiếp, khối Câu cần xem lại.

### S8 Cài đặt

- S8-AC03 [human] (S8-02): Trên iPhone, Android và Windows: danh sách giọng hiện đúng các giọng của máy; "Nghe thử" phát đúng giọng đã chạm.
- S8-AC07 [human] (S8-05): Trên iPhone (Safari) và Android (Chrome): "Xuất tiến độ" tải được file về máy và "Nhập tiến độ" chọn được chính file đó.
- S8-AC12 [human] (S8-02): Trên Chrome máy tính (Windows hoặc Mac) có mạng, xóa dữ liệu trang rồi mở app lần đầu, không chọn giọng: câu tiếng Anh được đọc bằng giọng Google; ít nhất 3 người thử thấy giọng này dễ nghe hơn giọng mặc định của máy (so bằng "Nghe thử" trong Cài đặt > Giọng đọc).

### S9 Hướng dẫn lần đầu

- S9-AC06 [human] (S9-02): Người học mới đọc hết 3 bước trong dưới 20 giây và nói lại được Ôn tập nằm ở đâu.

### T1 Học

- T1-AC01 [auto] (T1-01): Với tiến độ trống, thẻ hiện câu đầu của unit 1 trong fixture ở trạng thái hiện đầy đủ, có "Unit 1", title và translation của unit; dải có ô đầu ở trạng thái Đang học.
- T1-AC07 [claude] (T1-06): Ảnh chụp 1280 và 1440 px: cột chính rộng không quá 560 px, cột phụ có mục tiêu tuần, câu cần ôn, Unit tiếp theo, Tiến độ của bạn; ở 1440 px không còn khoảng trống lớn bên phải. Ảnh 375 và 1024 px: một cột đúng thứ tự T1-06.
- T1-AC09 [human] (T1-02, T1-04): Trên điện thoại thật, người học hiểu được khi nào nên bấm nút chính và khi nào nên chạm dòng câu cần ôn (hỏi lại sau khi họ thao tác).
- T1-AC11 [auto] (T1-01): Dòng "Unit n" trên thẻ là liên kết tới `#/unit?so=n` của unit đang học.
- T1-AC12 [auto] (T1-08): Với tiến độ fixture đang học unit 2, khối "Unit tiếp theo" có đúng unit 3 và 4 (fixture có 4 unit), mỗi dòng mở `#/unit?so=n`, liên kết "Xem tất cả unit" mở `#/thu-vien`; đang học unit cuối thì không có khối.
- T1-AC13 [auto] (T1-09): Với tiến độ mẫu 30 ngày, khối "Tiến độ của bạn" hiện đúng số câu đã học trên tổng số câu của bộ, thanh tiến độ đúng tỉ lệ, đúng số unit đã học; "Xem tiến độ" mở `#/tien-bo`; khối vẫn có khi đã học hết lộ trình.

### T2 Luyện tập

- T2-AC04 [auto] (T2-04): Chạm Kiểm tra nhanh mở `#/kiem-tra` với unit đang học trong lộ trình.

### T3 Thư viện

- T3-AC01 [auto] (T3-01): Trang 1 có tối đa 32 dòng; mỗi dòng có id 4 chữ số, câu gốc, nghĩa và biểu tượng trạng thái đúng với tiến độ fixture cho cả 3 trạng thái.
- T3-AC02 [claude] (T3-01): Ảnh chụp ở 320, 375, 1280 px, sáng và tối, với câu dài: câu gốc cắt ở 2 dòng, nghĩa cắt ở 1 dòng, không tràn ngang; biểu tượng trạng thái phân biệt được khi chuyển ảnh sang thang xám.
- T3-AC03 [auto] (T3-02): Gõ "BOOK" hiện các câu chứa "book"; route có `?q=BOOK`; tải lại trang giữ từ khóa; nút xóa làm trống ô và hiện lại toàn bộ.
- T3-AC04 [auto] (T3-03): Lọc Unit 2 và Trạng thái "Chưa học" chỉ hiện câu thuộc unit 2 chưa học; kết hợp thêm từ khóa thì thu hẹp tiếp; nhãn bộ lọc hiện giá trị đang chọn.
- T3-AC05 [auto] (T3-04): Ở trang 2, đổi bộ lọc thì về trang 1; "Trước" khóa ở trang 1, "Sau" khóa ở trang cuối; chỉ một trang thì không có phân trang.
- T3-AC06 [auto] (T3-05): Chạm dòng id 257: sheet tiêu đề "Câu 0257" có thẻ câu, unit, trạng thái, lần học gần nhất; "Học câu này" mở `#/phien-hoc?nguon=cau&id=257`.
- T3-AC07 [auto] (T3-06): Tìm "xyzxyz": hiện đúng câu thông báo; "Xóa tìm kiếm và bộ lọc" đưa về danh sách đầy đủ.
- T3-AC08 [claude] (T3-07): Ảnh chụp 1280 px: danh sách trái rộng không quá 480 px, chi tiết câu ở cột phải, chạm dòng khác thì cột phải đổi, không mở sheet.
- T3-AC09 [auto] (T3-03): Với fixture Global English có bộ lọc Chủ đề, chọn "Trường học" chỉ còn các câu có `topic` đó; với fixture English Fluency không có bộ lọc Chủ đề.
- T3-AC10 [auto] (T3-03): Với fixture Global English, bộ lọc Trình độ có A1 và B2 (các trình độ có trong dữ liệu); chọn B2 chỉ còn 8 câu của unit B2-89; danh sách Chủ đề có ô tìm và số câu mỗi chủ đề.
- T3-AC11 [auto] (T3-08): Mở `#/thu-vien` thấy cách xem Unit; chọn "Câu" thì route có `?xem=cau` và danh sách câu như T3-01; tải lại trang giữ cách xem.
- T3-AC12 [auto] (T3-09): Với tiến độ fixture, trang 1 cách xem Unit có tối đa 24 dòng; dòng của unit đã học có dải 8 ô đúng trạng thái và số "x/N" đúng; unit chưa học không có số; chạm dòng mở `#/unit?so=n` đúng unit.
- T3-AC13 [auto] (T3-10): Dòng tổng quan đúng số unit, số unit đã học và đang học dở theo tiến độ fixture; với fixture Global English có hàng nút trình độ, mặc định là trình độ đang học, chọn B2 chỉ còn unit B2 và route có `?trinh-do=B2`.
- T3-AC14 [claude] (T3-09): Ảnh cách xem Unit ở 375, 1280, 1440 px, sáng và tối: dòng không có khung thẻ, từ 900 px nhiều cột tự xuống hàng, không cuộn ngang.

### T4 Tiến độ

- T4-AC10 [human] (T4-02, T4-05): Người học xem màn này và giải thích đúng con số "câu cần ôn hôm nay" và "Lịch ôn tập" nghĩa là gì (dùng chung buổi test G-AC02).
