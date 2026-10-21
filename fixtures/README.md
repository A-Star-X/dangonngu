# fixtures

Tập con của bộ dữ liệu thật trong `public/data/`, dùng cho test tự động (DATA-09). Cấu trúc đường dẫn giống hệt bộ đầy đủ (`data/fluency/…`, `data/global/…`), nên `FixtureSource` và `StaticFileSource` đọc cùng một định dạng.

Không sửa tay. Tạo lại bằng:

```bash
node scripts/make-fixtures.mjs
```

| Bộ | Ngôn ngữ | Nội dung |
|---|---|---|
| English Fluency | `en` | Unit 1 đến 3 đủ 8 câu; unit 4 cắt còn 5 câu (có `_fixtureNote`) để thử unit thiếu câu |
| English Fluency | `ja` | Unit 1, có `reading` và `furigana` |
| English Fluency | `th` | Unit 1, chữ Thái |
| English Fluency | `ru` | Unit 1, chữ Kirin (Lexend không hỗ trợ, phải dùng font dự phòng FND-04) |
| Global English | `en` | Unit 1, 2 (A1, hai chủ đề) và unit 377 (B2) chứa câu tiếng Anh dài nhất bộ (138 ký tự) |

Manifest Fluency trong fixture chỉ liệt kê 4 ngôn ngữ trên nhưng giữ `count` 4096 như bản thật; `itemCount` trong từng file ngôn ngữ là số câu thật của tập con.

Bộ tiến độ mẫu 30 ngày cho English Fluency tiếng Anh nằm ở `progress/` (script cũng sinh file tiến độ); số liệu T4 phải hiển thị được tính tay và ghi riêng, xem `progress/README.md`.
