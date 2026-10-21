---
id: S1
title: Chọn ngôn ngữ
status: nháp
version: 1.0
route: "/chon-ngon-ngu"
depends: APP, FND, DATA
legacy: L-S1
---

# S1 Chọn ngôn ngữ

Màn học tập trung trong khung khu học (APP-03), hiện khi tài khoản chưa có ngôn ngữ đã lưu (APP-05).

## Bố cục

```
┌───────────────────────────┐
│ VITASR                    │
│                           │
│ Bạn muốn học              │
│ ngôn ngữ nào?             │
│                           │
│ ┌───────────────────────┐ │
│ │ Tiếng Anh       2 bộ ›│ │
│ │ English               │ │
│ └───────────────────────┘ │
│  Tiếng Bồ Đào Nha  4.096  │
│  Português                │
│  ... (danh sách cuộn)     │
│                           │
│ Bạn có thể đổi ngôn ngữ   │
│ sau ở thanh bên hoặc      │
│ trong Cài đặt.            │
└───────────────────────────┘
```

## Yêu cầu

### S1-01 Danh sách và thứ tự

Liệt kê mọi ngôn ngữ trong manifest (DATA-01). Tiếng Anh đứng đầu, nằm trong panel riêng có viền `primary` nhạt để nổi lên; các ngôn ngữ còn lại xếp theo tên tiếng Việt A đến Z.

### S1-02 Nội dung mỗi dòng

Mỗi dòng có tên tiếng Việt (`name`, `text-base` đậm 600) và tên gốc bên dưới (`text-sm`, `muted-foreground`). Tên gốc lấy từ `nativeName` trong `source-index.json` (DATA-01), ví dụ "日本語", "Русский", "ພາສາລາວ". Ngôn ngữ không có trong file đó thì dùng `Intl.DisplayNames` theo `locale`; nếu cũng không có thì bỏ dòng tên gốc.

### S1-03 Số câu

Bên phải mỗi dòng là số câu định dạng kiểu Việt Nam ("4.096"), lấy từ `count` của manifest khi có. Ngôn ngữ có nhiều bộ nội dung (DATA-13) hiện "[n] bộ" và mũi tên thay cho số câu.

### S1-04 Chọn

Chạm một dòng là chọn ngay: lưu ngôn ngữ (DATA-06) và chuyển sang `/hoc`. Không có nút xác nhận. Ngôn ngữ có nhiều bộ nội dung thì chạm dòng chuyển sang bước chọn bộ (S1-07) thay vì vào thẳng T1. Trong lúc tải dữ liệu ngôn ngữ đó, dòng vừa chạm hiện chỉ báo đang tải và các dòng khác bị khóa.

### S1-05 Chú thích

Cuối danh sách có dòng "Bạn có thể đổi ngôn ngữ sau ở thanh bên hoặc trong Cài đặt." `text-sm`, `muted-foreground`.

### S1-06 Tải và lỗi

Khi đang tải manifest: khung xương 6 dòng. Lỗi tải: theo APP-08.

### S1-07 Chọn bộ nội dung

Bước thứ hai của S1, chỉ hiện với ngôn ngữ có nhiều bộ (DATA-13). Tiêu đề "Học tiếng Anh với bộ nào?", nút "Quay lại" về danh sách ngôn ngữ. Mỗi bộ là một dòng lớn: tên bộ (`text-base` đậm 600) và mô tả ngắn theo DATA-13 (`text-sm`, `muted-foreground`). Thứ tự: Global English, English Fluency. Chạm một dòng là lưu ngôn ngữ và bộ (DATA-06), tải dữ liệu bộ đó và chuyển sang `/hoc`. Dưới danh sách có dòng "Bạn có thể đổi bộ sau ở thanh bên hoặc trong Cài đặt."

```
┌───────────────────────────┐
│ ‹ Quay lại                │
│                           │
│ Học tiếng Anh với bộ nào? │
│                           │
│ Global English            │
│ Câu theo chủ đề và tình   │
│ huống, có giải thích cách │
│ dùng.                     │
│ ───────────────────────── │
│ English Fluency           │
│ Câu luyện nói theo mẫu    │
│ câu.                      │
│                           │
│ Bạn có thể đổi bộ sau ở   │
│ thanh bên hoặc trong      │
│ Cài đặt.                  │
└───────────────────────────┘
```

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| Có cần chế độ "Tiếng Việt (từ tiếng Anh)" đảo chiều câu gốc và nghĩa không | Không có ở bản này; khách cần thì làm thành đợt riêng | `docs/new/ui-spec.md` mục 3 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.3 (08/10/2026): cập nhật theo bộ dữ liệu khách gửi và câu trả lời của nhóm (ưu tiên web, responsive; đủ 15 ngôn ngữ; không đọc tiến độ bản cũ).
- 0.4 (10/10/2026): chốt không có chế độ đảo chiều ở bản này (Claude quyết định theo ủy quyền của nhóm).
- 0.5 (18/10/2026): hai dòng ghi chú cuối danh sách gọi người học là "bạn" (theo phản hồi người dùng do nhóm chuyển); dòng ghi chú danh sách ngôn ngữ nhắc thêm Cài đặt.
- 1.0 (21/10/2026): Đợt 6 (Next.js, rule giao diện của nhóm): S1 nằm trong khung khu học (APP-03), danh sách trong panel, tiêu đề màn theo `PageHeader`; liên kết về trang học chính chuyển xuống chân thanh bên (APP-12).
