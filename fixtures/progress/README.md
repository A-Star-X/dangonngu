# Tiến độ mẫu 30 ngày (DATA-09)

Bộ tiến độ English Fluency tiếng Anh dùng cho test T4 Tiến độ và các số "cần ôn" ở T1, T2, T3.

| File | Ai tạo | Nội dung |
|---|---|---|
| `fluency-en-30-ngay.json` | `node scripts/make-fixtures.mjs` (không sửa tay) | Tiến độ đúng cấu trúc DATA-06, ghi vào khóa `vitasr2.progress.fluency.en` |
| `fluency-en-30-ngay.so-lieu.json` | Viết tay | Số liệu T4 phải hiển thị, tính tay theo bảng dưới |

Giờ Việt Nam (UTC+7). "Bây giờ" là thứ Năm 08/10/2026 lúc 10:00. Test đơn vị chạy với `TZ=Asia/Ho_Chi_Minh` (xem `package.json`), test trình duyệt đặt `timezoneId` cùng giá trị.

## Câu dùng trong kế hoạch

Fixture English Fluency tiếng Anh có 29 câu:

| Unit | id |
|---|---|
| U1 | 1, 257, 769, 770, 258, 771, 772, 1793 |
| U2 | 2, 259, 773, 774, 260, 775, 776, 1794 |
| U3 | 3, 261, 777, 778, 262, 779, 780, 1795 |
| U4 (cắt còn 5) | 4, 263, 781, 782, 264 |

## Kế hoạch học

Mỗi phiên bắt đầu 6 phút trước giờ xong; bước ghi nhớ ghi lúc trừ 4 phút, bước kiểm tra lúc trừ 2 phút. Phiên Kiểm tra (S5) ghi hai lượt đúng mỗi câu (nghe-chon, sap-xep) nên không đổi trạng thái câu (DATA-07: đúng mà không dùng gợi ý thì giữ nguyên).

| # | Ngày | Giờ xong | Nguồn | Câu | Khác thường |
|---|---|---|---|---|---|
| 1 | 03/9 | 20:00 | Lộ trình | U1 | |
| 2 | 08/9 | 08:00 | Kiểm tra | U1 | |
| 3 | 09/9 | 08:00 | Kiểm tra | U1 | |
| 4 | 11/9 | 08:00 | Kiểm tra | U1 | |
| 5 | 13/9 | 20:00 | Lộ trình | U2 | |
| 6 | 14/9 | 20:00 | Một câu (id 2) | U2 | |
| 7 | 15/9 | 08:00 | Kiểm tra | U2 | |
| 8 | 16/9 | 08:00 | Kiểm tra | U2 | |
| 9 | 17/9 | 20:00 | Một câu (id 2) | U2 | |
| 10 | 19/9 | 08:00 | Kiểm tra | U2 | |
| 11 | 21/9 | 08:00 | Kiểm tra | U1 | |
| 12 | 22/9 | 08:00 | Kiểm tra | U2 | |
| 13 | 24/9 | 20:00 | Một câu (id 2) | U2 | |
| 14 | 26/9 | 08:00 | Kiểm tra | U2 | |
| 15 | 28/9 | 20:00 | Lộ trình | U3 | id 3 trả lời sai ở trắc nghiệm |
| 16 | 29/9 | 08:00 | Kiểm tra | U3 | |
| 17 | 30/9 | 20:00 | Một câu (id 2) | U2 | |
| 18 | 01/10 | 08:00 | Kiểm tra | U2 | |
| 19 | 02/10 | 08:00 | Kiểm tra | U3 | |
| 20 | 02/10 | 20:00 | Ôn tập | U1 | id 1793 chọn "Cần ôn lại" |
| 21 | 04/10 | (21:00 bắt đầu) | Lộ trình | U4 | Bỏ dở, không có lượt nào; bị thay khi bắt đầu phiên 23 |
| 22 | 05/10 | 08:00 | Kiểm tra | U1 | |
| 23 | 06/10 | 20:00 | Một câu (id 1) | U1 | |
| 24 | 07/10 | 19:00 | Ôn tập | U3 | |
| 25 | 08/10 | 08:00 | Lộ trình | U4 | |
| 26 | 08/10 | 09:00 | Kiểm tra | U4 | |

## Trạng thái cuối của từng câu

Khoảng ôn theo streak 1, 2, 3, 4, 5: 1, 3, 7, 14, 30 ngày (DATA-07).

| Câu | Diễn biến | streak cuối | Đến hạn |
|---|---|---|---|
| U1 trừ 1793 (7 câu) | #1 lên 1; #20 lên 2; #23 lên 3 | 3 | 06/10 19:56 + 7 ngày = 13/10 19:56 |
| 1793 | #1 lên 1; #20 về 0; #23 lên 1 | 1 | 06/10 19:56 + 1 ngày = 07/10 19:56 (quá hạn) |
| U2 (8 câu) | #5, #6, #9, #13, #17 lên 1, 2, 3, 4, 5 | 5 | 30/9 19:56 + 30 ngày = 30/10 19:56 |
| U3 trừ id 3 (7 câu) | #15 lên 1; #24 lên 2 | 2 | 07/10 18:56 + 3 ngày = 10/10 18:56 |
| id 3 | #15 lên 1 rồi sai nên về 0; #24 lên 1 | 1 | 07/10 18:56 + 1 ngày = 08/10 18:56 (hôm nay) |
| U4 (5 câu) | #25 lên 1 | 1 | 08/10 07:56 + 1 ngày = 09/10 07:56 |

Kiểm tra lại lựa chọn câu của hai phiên Ôn tập: ngày 02/10 các câu đến hạn sớm nhất là U1 (04/9) nên phiên lấy đúng 8 câu U1; ngày 07/10 là id 3 (28/9) rồi 7 câu còn lại của U3 (29/9), trước 1793 (07/10 19:56), nên phiên lấy đúng U3.

## Số liệu T4

**Cần ôn hôm nay** (đến hạn trước hết ngày 08/10): 1793 và id 3, tổng **2**. Không phụ thuộc khoảng thời gian. T1, T2 và bộ lọc "Cần ôn" của T3 cũng ra 2.

**Lịch ôn**

- Hôm nay: 2 (như trên).
- Ngày mai (09/10): 5 câu U4.
- 7 ngày tới (từ 09/10 đến hết 15/10): 5 câu U4 + 7 câu U3 (10/10) + 7 câu U1 (13/10) = **19**. U2 đến hạn 30/10 nên không tính.

**Mục tiêu tuần** (7 ngày gần nhất, 02/10 đến 08/10): phiên 19, 20, 22, 23, 24, 25, 26 = **7/5**, đã đạt.

| Khoảng | Ngày | Phiên hoàn tất | Câu khác nhau đã học |
|---|---|---|---|
| 1 ngày | 08/10 | #25, #26 = **2** | U4 = **5** |
| 7 ngày | 02/10 đến 08/10 | #19, #20, #22, #23, #24, #25, #26 = **7** | U1 + U3 + U4 = **21** |
| 30 ngày | 09/9 đến 08/10 | 25 phiên xong trừ #1 (03/9) và #2 (08/9) = **23** | cả 29 câu = **29** |

Phiên 21 bị bỏ dở nên không tính ở đâu.

**Biểu đồ 7 ngày** (số câu khác nhau có lượt làm trong ngày): 02/10 (T6) 16 (U3 ở #19 và U1 ở #20), 03/10 (T7) 0, 04/10 (CN) 0, 05/10 (T2) 8, 06/10 (T3) 8, 07/10 (T4) 8, 08/10 (T5) 5.

**Biểu đồ 30 ngày**, từ 09/9 tới 08/10: 8, 0, 8, 0, 8, 8, 8, 8, 8, 0, 8, 0, 8, 8, 0, 8, 0, 8, 0, 8, 8, 8, 8, 16, 0, 0, 8, 8, 8, 5. Nhãn trục mỗi 5 ngày tính lùi từ hôm nay: 13, 18, 23, 28, 3, 8.

**Danh sách phiên 30 ngày**, mới nhất trước: #26 Kiểm tra (09:00), #25 Lộ trình (08:00), #24 Ôn tập, #23 Một câu, #22 Kiểm tra, #20 Ôn tập, #19 Kiểm tra, #18 Kiểm tra, #17 Một câu, #16 Kiểm tra, #15 Lộ trình, #14 Kiểm tra, #13 Một câu, #12, #11, #10 Kiểm tra, #9 Một câu, #8, #7 Kiểm tra, #6 Một câu (hết 20 dòng đầu), rồi #5 Lộ trình, #4, #3 Kiểm tra. Tổng 23, hiện 20 rồi có "Xem thêm".

**Chi tiết ngày 08/10** ("Thứ Năm, 8/10"): 2 phiên (#26, #25), 5 câu U4. **Ngày 02/10** ("Thứ Sáu, 2/10"): 2 phiên (#20, #19), 16 câu.

**Trạng thái trong T3**: Chưa học 0, Đã nhớ 27, Cần ôn 2 (id 3 và 1793).
