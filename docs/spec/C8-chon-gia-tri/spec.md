---
id: C8
title: Ô chọn một giá trị
status: nháp
version: 0.1
depends: FND
---

# C8 Ô chọn một giá trị (DropdownSelect)

Cách chọn một giá trị duy nhất trong danh sách (rule giao diện: dùng `DropdownSelect`, không dùng `Select`). Dùng ở: bộ lọc Thư viện (T3-03), giọng đọc, tốc độ, sáng tối, ngôn ngữ giao diện (S8, C5-05). Chọn khoảng thời gian ở T4 và cách xem ở T3 vẫn là nhóm nút liền nhau vì chỉ có 2, 3 lựa chọn ngắn luôn hiện.

## Yêu cầu

### C8-01 Nút mở

Nút mở bo góc 6 px, viền, nền card, cao 44 px (36 px trên header), hiện nhãn của lựa chọn đang chọn và mũi tên. Hover và khi đang mở: viền màu primary. Có nhãn trợ năng (nhãn hiển thị liên kết bằng `aria-labelledby`, hoặc `aria-label`).

### C8-02 Danh sách và bàn phím

Theo mẫu "select-only combobox" của WAI-ARIA: nút có `role="combobox"` và `aria-expanded`, danh sách `role="listbox"`, mỗi lựa chọn `role="option"` với `aria-selected`. Mũi tên lên xuống, Home, End để di chuyển; Enter chọn; Escape đóng và đưa focus về nút; Tab đóng. Bấm ra ngoài thì đóng. Lựa chọn đang chọn có dấu tích. Mỗi dòng cao tối thiểu 44 px; dòng có thể có dòng phụ (ví dụ số câu).

### C8-03 Ô lọc trong danh sách dài

Danh sách dài (Unit, Chủ đề, giọng đọc khi nhiều hơn 8) có ô lọc ở đầu: gõ thì chỉ còn lựa chọn khớp (không phân biệt dấu với chữ Latinh, DATA-12); không khớp gì thì hiện "Không có mục nào khớp.". Escape trong ô lọc đóng danh sách nhưng không đóng sheet chứa nó.

## Lịch sử thay đổi

- 0.1 (21/10/2026): bản đầu (Đợt 6, rule giao diện của nhóm).
