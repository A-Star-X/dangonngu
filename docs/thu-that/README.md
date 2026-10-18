# Kịch bản thử thật cho 23 mục nghiệm thu `[human]`

Cập nhật 18/10/2026 (thêm S8-AC12 sau Đợt 4). Các mục `[human]` chỉ người trong nhóm được đánh dấu (`docs/QUY-TRINH.md` mục 5): cần thiết bị thật, người học thật, người ngoài nhóm, khách hoặc trang học chính thật. File này gom 22 mục đó thành 4 buổi thử, mỗi mục có cách làm và điều kiện đạt. Tình trạng hiện tại của từng mục: `npm run spec:acceptance` rồi mở `docs/generated/acceptance-report.md`.

## Chuẩn bị chung

**Bản để thử.** Dùng bản trên GitHub Pages: `https://nguyendinhdat2207.github.io/dangonngu/` (workflow `.github/workflows/pages.yml` tự đưa lên sau mỗi lần CI trên main đạt). Lần đầu, chủ repo phải vào Settings > Pages > Build and deployment chọn Source là "GitHub Actions", rồi thêm biến repo `PAGES_ENABLED` = `true` (Settings > Secrets and variables > Actions > Variables). Lưu ý: bật Pages nghĩa là app và bộ dữ liệu của khách có thêm một địa chỉ web công khai; dữ liệu này vốn đã công khai trong repo. Không dùng `npm run dev` qua mạng LAN để thử trên điện thoại: service worker (APP-10) chỉ chạy trên HTTPS hoặc localhost.

**Thiết bị tối thiểu** (`docs/QUY-TRINH.md` mục 7): một iPhone (Safari), một điện thoại Android (Chrome), một máy Windows (Chrome hoặc Edge). Ghi lại đời máy và phiên bản hệ điều hành, trình duyệt.

**Dữ liệu sạch.** Trước mỗi người học: mở bằng cửa sổ ẩn danh, hoặc vào Cài đặt > Tiến độ > Xóa tiến độ. Muốn thấy lại hướng dẫn lần đầu: Cài đặt > Xem lại hướng dẫn.

**Cách đánh dấu.** Đạt thì đổi `- [ ]` thành `- [x]` trong `acceptance.md` của khu vực đó và thêm ngay bên dưới một dòng thụt vào:

```
  - Bằng chứng: <ảnh hoặc ghi chép trong docs/evidence/<mã mục>/>, <thiết bị hoặc người tham gia>, <tên người kiểm>, <yyyy-mm-dd>
```

Ảnh chụp màn hình và ghi chép để trong `docs/evidence/<mã mục>/` (ví dụ `docs/evidence/APP-AC14/iphone-ngoai-tuyen.jpg`, `docs/evidence/G-AC01/ghi-chep.md`). Không ghi họ tên đầy đủ hay thông tin liên lạc của người học; dùng "Người học 1" đến "Người học 5". Chưa đạt thì để `[ ]`, ghi lỗi vào issue hoặc vào mục "Lỗi tìm thấy" cuối file này để sửa.

## Buổi 1: thiết bị thật (9 mục)

Người làm: người trong nhóm. Thời gian khoảng 1 giờ cho cả ba thiết bị.

| Mục | Làm gì | Đạt khi |
|---|---|---|
| APP-AC13 | Trên Chrome, Edge, Safari ở máy tính và trên iPhone, Android: chọn ngôn ngữ, học hết một phiên 8 câu, mở Tiến độ | Ở mọi nơi hiển thị đủ, không nút nào bị che hay tràn, không cuộn ngang. Chụp mỗi nơi một ảnh T1 và một ảnh T4 |
| APP-AC14 | Trên iPhone và Android: mở app khi có mạng, học vài câu, đợi khoảng 10 giây; bật chế độ máy bay; đóng hẳn trình duyệt rồi mở lại địa chỉ app | App mở được, có dải "Đang ngoại tuyến", học tiếp được ngôn ngữ đã tải. Nên mở app có mạng hai lần trước khi tắt mạng nếu thử tiếng Nhật, Thái... (font Noto lưu từ lần thứ hai, APP-10) |
| C1-AC05 | Trên iPhone, Android, Windows: ở thẻ câu bấm "Nghe", rồi "Nghe lặp", rồi "Dừng" | "Nghe" đọc đúng câu bằng giọng tiếng Anh; "Nghe lặp" lặp lại cách nhau khoảng 1,5 giây; "Dừng" dừng ngay |
| C3-AC03 | Trên điện thoại, cầm một tay, trong phiên học bấm xen kẽ "Tôi nhớ" và "Cần ôn lại" 20 lần (qua nhiều câu) | Không lần nào bấm nhầm nút |
| C6-AC03 | Trên điện thoại: mở sheet Đổi ngôn ngữ và sheet Học theo từ khóa có nhiều kết quả; vuốt xuống trên tay nắm; vuốt lên xuống trong nội dung | Vuốt trên tay nắm đóng được sheet; cuộn trong nội dung không vô tình đóng sheet |
| FND-AC11 | Trên điện thoại: chạm khối che để hiện câu gốc, mở và đóng vài sheet | Cảm giác phản hồi ngay, không chậm, không giật |
| FND-AC17 | Bật VoiceOver (iPhone) và TalkBack (Android), học hết một phiên chỉ bằng trình đọc màn hình | Câu tiếng Anh được đọc bằng giọng tiếng Anh, nghĩa bằng giọng tiếng Việt; đi hết được phiên |
| S8-AC03 | Trên iPhone, Android, Windows: Cài đặt > Giọng đọc, chạm "Nghe thử" ở vài giọng | Danh sách đúng các giọng tiếng Anh có trên máy; "Nghe thử" phát đúng giọng vừa chạm |
| S8-AC07 | Trên iPhone (Safari) và Android (Chrome): học vài câu, Cài đặt > Xuất tiến độ; Xóa tiến độ; Nhập tiến độ và chọn đúng tệp vừa tải | Tải được tệp về máy, chọn lại được tệp đó, tiến độ trở lại như trước khi xóa |

## Buổi 2: người học thật (10 mục)

Người tham gia: 5 người học chưa từng thấy app, mỗi người khoảng 20 phút trên điện thoại của họ hoặc của nhóm. Một người trong nhóm dẫn, một người ghi. Không hướng dẫn trước; chỉ nói "Bạn muốn học tiếng Anh với app này". Xóa dữ liệu trước mỗi người.

Trình tự cho mỗi người và mục được kiểm:

1. Mở app lần đầu, chọn ngôn ngữ. Ghi lần chạm đầu tiên có trúng Tiếng Anh không (S1-AC06).
2. Đọc 3 bước hướng dẫn; bấm giờ từ lúc hiện bước 1 tới lúc bấm "Bắt đầu học"; hỏi "Ôn tập nằm ở đâu?" (S9-AC06: dưới 20 giây và trả lời đúng).
3. Bắt đầu phiên học đầu tiên không hỏi ai; đếm số lần chạm từ lúc chọn ngôn ngữ tới câu đầu tiên của phiên (G-AC01: 5/5 người làm được, không quá 2 lần chạm).
4. Học hết một phiên 8 câu. Quan sát và ghi lần nào bấm nhầm giữa "Tôi nhớ" và "Cần ôn lại" (G-AC03: không ai bấm nhầm). Ghi thời gian phiên; hỏi sau phiên bước kiểm tra lặp lại có vô nghĩa hay khó chịu không (S3-AC11, cần 3 người).
5. Quay lại màn Học; hỏi "Khi nào bạn bấm nút đỏ, khi nào chạm dòng câu cần ôn?" (T1-AC09).
6. Nhờ tự tìm màn Tiến độ; hỏi "Câu cần ôn là gì?", "Con số "câu cần ôn hôm nay" và "Lịch ôn tập" nghĩa là gì?" (G-AC02: 4/5 người tìm được và giải thích đúng; T4-AC10).
7. Vào Luyện tập > Kiểm tra nhanh, làm cả 3 bước; ghi câu nào họ thấy chia cụm vô lý (S5-AC10, cần 3 người; nhóm quyết định giữ hay đổi quy tắc chia cụm).
8. Chỉ làm trên Chrome máy tính có mạng (Windows hoặc Mac), với dữ liệu trang đã xóa: mở Cài đặt > Giọng đọc, ghi tên giọng ở dòng "Tự động" (phải là giọng Google, ví dụ "Google UK English Female" với Global English); nhấn "Nghe thử" ở dòng "Tự động" rồi ở giọng mặc định của máy (Microsoft trên Windows, Samantha hoặc Daniel trên Mac); hỏi giọng nào dễ nghe hơn (S8-AC12: ít nhất 3 người chọn giọng Google).

Phiếu ghi cho mỗi người (chép vào `docs/evidence/G-AC01/ghi-chep.md`):

| | Người học 1 | Người học 2 | Người học 3 | Người học 4 | Người học 5 |
|---|---|---|---|---|---|
| Thiết bị | | | | | |
| Chạm đầu tiên trúng Tiếng Anh (S1-AC06) | | | | | |
| Thời gian đọc hướng dẫn, trả lời Ôn tập ở đâu (S9-AC06) | | | | | |
| Số lần chạm tới câu đầu tiên (G-AC01) | | | | | |
| Bấm nhầm Tôi nhớ / Cần ôn lại (G-AC03) | | | | | |
| Thời gian phiên, cảm nhận bước kiểm tra (S3-AC11) | | | | | |
| Hiểu nút chính và dòng câu cần ôn (T1-AC09) | | | | | |
| Tìm được Tiến độ, giải thích câu cần ôn, Lịch ôn tập (G-AC02, T4-AC10) | | | | | |
| Câu thấy chia cụm vô lý (S5-AC10) | | | | | |
| Giọng ở dòng Tự động, giọng thấy dễ nghe hơn (S8-AC12) | | | | | |

## Buổi 3: người ngoài nhóm (2 mục)

| Mục | Làm gì | Đạt khi |
|---|---|---|
| FND-AC13 | Một người không trong nhóm đọc danh sách chuỗi giao diện trong `docs/evidence/FND-AC12/chuoi-giao-dien.md` (hoặc dùng app một lượt) | Không thấy câu nào khó hiểu hoặc sai giọng; câu nào bị chỉ ra thì ghi lại để sửa |
| G-AC05 | Hai người không trong nhóm thiết kế xem ảnh 5 màn chính: `docs/evidence/T1-AC02/375-light-cau-ngan.jpg`, `docs/evidence/S3-AC07/375-light-1-S3a-truoc.jpg`, `docs/evidence/T3-AC08/1280-light-cau-dau.jpg`, `docs/evidence/T4-AC05/1280-light-toan-man.jpg`, `docs/evidence/S8-AC09/375-light-cai-dat.jpg`, kèm danh sách FND-13 trong `fe/src/foundation/spec.md` | Không ai chỉ ra được dấu hiệu nào trong danh sách FND-13 |

## Buổi 4: khách và trang học chính thật (2 mục)

| Mục | Làm gì | Đạt khi |
|---|---|---|
| DATA-AC12 | Gửi khách tin nhắn xin xác nhận bằng văn bản việc dùng bộ dữ liệu (`fe/public/data/`) cho phát triển và demo, nói rõ repo đang công khai và bản thử trên GitHub Pages cũng công khai | Có tin nhắn hoặc email đồng ý; lưu ảnh chụp vào `docs/evidence/DATA-AC12/` |
| APP-AC20 | Đặt bản build ở nơi khách chọn và gắn đường dẫn vào trang học chính (hoặc nhờ khách gắn đường dẫn GitHub Pages). Đăng nhập trang học chính, mở Đa ngôn ngữ, bấm "Quay lại trang học" | App mở ở trang mới; bấm nút thì về đúng trang học chính và vẫn đăng nhập. Ghi lại trang chính mở app bằng tab mới hay chuyển thẳng trong cùng tab (câu hỏi đã trả lời ở APP-12) |

## Lỗi tìm thấy

Ghi mỗi lỗi một dòng để Đợt sau sửa: mục, thiết bị hoặc người, mô tả, ảnh.

| Mục | Thiết bị hoặc người | Mô tả | Ảnh |
|---|---|---|---|
| | | | |
