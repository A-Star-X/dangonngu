---
id: DATA
title: Dữ liệu và tiến độ
status: nháp
version: 1.1
legacy: docs/legacy/api-and-storage.md
---

# DATA Dữ liệu và tiến độ

Hợp đồng dữ liệu mà giao diện cần, cách đọc dữ liệu, cách lưu tiến độ, các quy tắc tính toán dùng chung (lộ trình, câu cần ôn, đáp án nhiễu, tìm kiếm) và fixture.

Khách không cung cấp mã nguồn và không mở API (QD-03), nhưng đã gửi bộ dữ liệu đầy đủ và cho phép dùng cho phát triển và demo (08/10/2026). Bộ này nằm ở `public/data/` (40 file, khoảng 12 MB, giữ nguyên đường dẫn `data/fluency/…`, `data/global/…`, `data/audio/…` như bản cũ; `_inventory.json` ghi mã băm từng file). Mọi cấu trúc dưới đây đã kiểm trên bộ dữ liệu này. Giao diện chỉ phụ thuộc vào hợp đồng, không phụ thuộc vị trí file.

## Yêu cầu

### DATA-01 Manifest

Mỗi bộ nội dung (DATA-13) có một manifest riêng. Hai dạng đang có:

```json
// English Fluency: /data/fluency/manifest.json
{ "schema": 1, "version": "1.8.0", "count": 4096,
  "languages": [ { "id": "en", "name": "Tiếng Anh", "locale": "en-US", "file": "en.json", "units": "units-en.json", "sha256": "…" } ] }

// Global English: /data/global/manifest.json
{ "languages": [ { "id": "en", "name": "Tiếng Anh", "locale": "en-GB", "file": "en.json", "units": "units-en.json" } ] }
```

Giao diện chỉ dựa vào `languages[].id`, `name`, `locale`, `file`, `units`. `count`, `version`, `sha256` có thể vắng; số câu của một ngôn ngữ lấy từ `itemCount` của file ngôn ngữ khi đã tải. Thứ tự ngôn ngữ hiển thị do S1-01 quyết định, không theo thứ tự trong file.

Manifest Fluency có 15 ngôn ngữ: `en`, `de`, `ja`, `lo`, `ko`, `zh`, `id`, `hi`, `ta`, `ru`, `fr`, `es`, `th`, `pt`, `it`. Bộ Fluency có thêm `source-index.json` với `languageId`, `name`, `shortName`, `nativeName`, `locale`, `itemCount` cho cả 15 ngôn ngữ; S1-02 lấy tên gốc từ đây.

### DATA-02 File ngôn ngữ

```json
{ "languageId": "en", "locale": "en-GB", "itemCount": 4608,
  "items": [ { "id": 1, "en": "Where is room twelve?", "vi": "Phòng số mười hai ở đâu?",
               "noteVi": "Where is + địa điểm số ít để hỏi vị trí.", "topic": "Trường học",
               "situation": "Bạn mới đến trường và hỏi một bạn học về phòng học tiếng Anh.",
               "hierarchy": "Core", "unitId": "A1-01" } ] }
```

Mỗi item bắt buộc có `id` (số), `en` và `vi`. **Trường câu gốc luôn tên là `en` ở mọi file**, kể cả khi ngôn ngữ không phải tiếng Anh (ví dụ trong `de.json`: `{"id": 1, "en": "Ich möchte ...", "vi": "Tôi muốn..."}`); ngôn ngữ của câu gốc là `languageId` của file. `vi` là nghĩa tiếng Việt. Mỗi file Fluency có 4.096 câu (450 KB đến 1,2 MB), file Global English có 4.608 câu (1,9 MB); chỉ tải file của ngôn ngữ và bộ đang học. `hierarchy` có ở cả hai bộ nhưng viết khác nhau (Fluency: `core`, `expansion`, `leaf`, `bridge`; Global: `Core`, `Expansion 1`, `Expansion 2`, `Leaf 1` đến `Leaf 4`, `Bridge`); giao diện bản đầu không hiển thị trường này. Các trường khác xem DATA-04.

### DATA-03 File unit

```json
// English Fluency (mọi ngôn ngữ): 512 unit, mỗi unit 8 câu
{ "languageId": "en", "itemCount": 4096, "unitCount": 512,
  "units": [ { "number": 1, "title": "I want to...", "translation": "Tôi muốn...", "ids": ["0001", "0257", "0769", "0770", "0258", "0771", "0772", "1793"] } ] }

// Global English: 576 unit, mỗi unit 8 câu, id liên tiếp từ 1 đến 4608
{ "units": [ { "number": 1, "title": "Find your classroom", "translation": "Tìm đúng phòng học", "ids": [1, 2, 3, 4, 5, 6, 7, 8] } ] }
```

`ids` có thể là chuỗi có số 0 ở đầu (Fluency) hoặc số (Global); lớp dữ liệu chuẩn hóa về số và so khớp với `items[].id` theo giá trị. `number` có ở cả hai bộ; nếu vắng thì số thứ tự unit là vị trí trong mảng (bắt đầu từ 1). Trong dữ liệu hiện có mọi unit đều đủ 8 câu, nhưng giao diện vẫn phải chạy đúng khi một unit có ít hơn 8 câu.

### DATA-04 Trường tùy chọn

| Trường | Có ở | Dùng cho |
|---|---|---|
| `noteVi` | Global English | Dòng Cách dùng (C1-06), tìm kiếm (DATA-12) |
| `topic` | Global English | 177 chủ đề, phân bố lệch (6 chủ đề có 384 câu, nhiều chủ đề chỉ 8 đến 16 câu). Bộ lọc Chủ đề (T3-03), chip gợi ý (T2-03), tìm kiếm |
| `situation` | Global English | Dòng tình huống của unit (T1-01), tìm kiếm |
| `unitId` | Global English | Dạng `A1-01` đến `C2-96`: 6 trình độ A1, A2, B1, B2, C1, C2, mỗi trình độ 96 unit. Dùng cho mã trình độ (T1-01) và bộ lọc Trình độ (T3-03) |
| `reading`, `furigana` | Tiếng Nhật bộ Fluency (cả 4.096 câu) | Phiên âm (C1-07). `furigana` là mảng các đoạn, mỗi đoạn `[chữ]` hoặc `[chữ, cách đọc]`, ví dụ `[["何", "なに"], ["が"], ["起き", "おき"]]` |
| `phrases` | Có thể có ở bộ khác | Không dùng trong bản đầu |

Bộ English Fluency tiếng Anh không có trường nào trong bảng. Giao diện phải chạy đúng khi bất kỳ trường nào vắng mặt, và chỉ hiển thị phần liên quan khi có.

### DATA-05 Nguồn dữ liệu thay được

Giao diện chỉ đọc dữ liệu qua một interface `DataSource` gồm ba thao tác: lấy manifest của một bộ nội dung, lấy file ngôn ngữ và lấy file unit theo cặp (bộ nội dung, ngôn ngữ). Có hai cài đặt:

- `FixtureSource` (`tests/unit/fixture-source.ts`): đọc tập con trong `fixtures/data/`, dùng cho test đơn vị.
- `StaticFileSource` (`src/services/content-services/api.ts`): đọc từ base URL `NEXT_PUBLIC_DATA_BASE_URL` (mặc định `/data`, tức bộ đầy đủ `public/data/` phục vụ tĩnh cùng website). Test trên trình duyệt chạy trên bản build với bộ đầy đủ.

Danh mục và dữ liệu ngôn ngữ tải qua react-query (cache theo cặp bộ, ngôn ngữ; không tự tải lại vì file tĩnh theo phiên bản).

Không thành phần giao diện nào gọi `fetch` trực tiếp tới file dữ liệu (rule services: view không gọi `fetch`, không import `api.ts`). Dữ liệu sai hợp đồng (thiếu trường bắt buộc, sai kiểu) được coi là lỗi tải (APP-08), không làm app trắng màn.

### DATA-06 Lưu tiến độ

Tiến độ và cài đặt lưu localStorage (bản trên máy, dùng được khi ngoại tuyến), với tiền tố khóa `vitasr2.` để không đụng khóa của bản cũ; khi có tài khoản Supabase thì đồng bộ lên tài khoản theo DATA-14:

- `vitasr2.settings`: ngôn ngữ đang học, bộ nội dung đang dùng cho từng ngôn ngữ, giọng đọc theo ngôn ngữ, tốc độ đọc, mục tiêu tuần, đã xem hướng dẫn. Giao diện sáng tối lưu riêng ở `vitasr2.theme` (FND-03); bản cũ có `theme` trong cài đặt thì đọc sang.
- `vitasr2.auth` (chế độ trên máy, AU-06) hoặc `vitasr2.auth.supabase`: phiên đăng nhập; `vitasr2.owner`: tài khoản sở hữu dữ liệu học trên máy, `vitasr2.stash.{id}`: dữ liệu học đã cất của người khác dùng cùng máy (AU-07).
- `vitasr2.progress.{bộ}.{lang}` (ví dụ `vitasr2.progress.global.en`): tiến độ giữ riêng cho từng cặp bộ nội dung và ngôn ngữ, `{ schema: 1, sessions: [], attempts: [], items: { [id]: { status, streak, due, lastAt } }, baseAt? }` (`baseAt`: mốc xóa hay nhập tiến độ, DATA-14).
  - Session: `id`, `nguon` (lo-trinh, on-tap, tu-khoa, cau, unit, kiem-tra), `itemIds`, `startedAt`, `completedAt`, `position`.
  - Attempt: `sessionId`, `itemId`, `at`, `kind` (ghi-nho, trac-nghiem, nghe-chon, sap-xep), `outcome` (nho, can-on, dung, sai), `hinted`. Bước Nghe theo cụm của S5 không ghi lượt.
  - Session lưu thêm `step` (bước đang làm, `ghi-nho` hoặc `kiem-tra`, để mở lại đúng chỗ, S3-08), `abandonedAt` (phiên dở bị thay bằng phiên mới, S3-08) và `params` (`q`, `nhom`, `id`, `so` để mở lại đúng phiên), `hintedItemId` (câu ở `position` đã mở gợi ý, S3-05). Phiên `kiem-tra` lưu trong `params` thêm `buoc` (các bước đã chọn, cách nhau bằng dấu phẩy) và `buocSo` (thứ tự bước đang làm, từ 0); `position` là câu đang làm trong bước đó (S5-09). Mỗi ngôn ngữ có tối đa một phiên S3 dở và một phiên `kiem-tra` dở.
  - Trạng thái lưu của câu (`status`): `da-hoc` khi câu đã qua bước ghi nhớ, `kiem-tra` khi câu mới chỉ gặp ở bài kiểm tra. Mốc thời gian lưu dạng số mili giây.

Khi đọc tiến độ đã lưu, phần tử hỏng (câu có `streak` không phải số nguyên không âm, phiên có `position` ngoài 0 đến số câu hoặc thiếu `step`, lượt sai cấu trúc) bị bỏ, phần còn lại giữ nguyên, để một dòng hỏng không làm app không mở được. App có thể mở ở nhiều tab cùng lúc: tab khác ghi tiến độ hay cài đặt thì tab này nạp lại (riêng ngôn ngữ và bộ đang học giữ theo tab đang xem), và mỗi lần ghi tiến độ đều đọc lại bản đang lưu trước, để tab này không ghi đè mất phần của tab kia. Mọi ghi đều bọc xử lý lỗi; khi localStorage không dùng được, app vẫn chạy với bộ nhớ tạm trong phiên và hiện cảnh báo (APP-08). Không đọc tiến độ của bản cũ (đã chốt 08/10/2026).

### DATA-07 Quy tắc câu cần ôn

Mỗi câu có một trong ba trạng thái hiển thị: **Chưa học**, **Đã nhớ**, **Cần ôn**.

- Sau bước ghi nhớ: chọn "Tôi nhớ" thì `streak` tăng 1; chọn "Cần ôn lại" thì `streak` về 0.
- Sau bước trắc nghiệm hoặc kiểm tra: trả lời sai hoặc dùng gợi ý thì `streak` về 0; trả lời đúng mà không dùng gợi ý thì giữ nguyên `streak` và `due`.
- Ngày ôn tiếp (`due`): `streak` 0 thì đến hạn ngay; `streak` 1, 2, 3, 4, từ 5 trở lên thì sau 1, 3, 7, 14, 30 ngày tính từ lần làm cuối (khoảng ôn đã chốt), cộng theo ngày lịch và giữ giờ trên đồng hồ, để máy ở nơi có giờ mùa hè không lệch thành đến hạn sớm một giờ.
- Câu **Cần ôn** trong ngày D là câu đã học có `due` không muộn hơn cuối ngày D (giờ máy). Câu đã học còn lại là **Đã nhớ**.

Chỉ có một khái niệm "cần ôn" trong toàn app; T1, T2, T3, T4 cùng dùng quy tắc này.

### DATA-08 Đáp án nhiễu

Câu trắc nghiệm chọn nghĩa có 4 lựa chọn: nghĩa đúng và 3 nghĩa của các câu khác cùng ngôn ngữ. Ba nghĩa nhiễu khác nghĩa đúng và khác nhau sau khi chuẩn hóa (bỏ khoảng trắng thừa, không phân biệt hoa thường, bỏ dấu câu cuối), ưu tiên lấy từ unit khác. Cách chọn là tất định theo `id` câu (cùng câu cho cùng bộ lựa chọn) để kiểm thử được; thứ tự hiển thị 4 lựa chọn cũng tất định theo `id`.

### DATA-09 Fixture

`fixtures/data/` là tập con của bộ dữ liệu thật, cùng cấu trúc đường dẫn, sinh bằng `node scripts/make-fixtures.mjs` (không sửa tay). Gồm ít nhất:

- English Fluency tiếng Anh: 3 unit đủ 8 câu và 1 unit cắt còn 5 câu.
- English Fluency tiếng Nhật (có `reading`, `furigana`), tiếng Thái, tiếng Nga (chữ Kirin): mỗi ngôn ngữ 1 unit.
- Global English: ít nhất 3 unit thuộc ít nhất 2 trình độ và 3 chủ đề, trong đó có câu tiếng Anh dài nhất bộ (138 ký tự).
- Một bộ tiến độ mẫu 30 ngày cho tiếng Anh (đúng cấu trúc DATA-06), kèm file ghi các số liệu tính tay mà T4 phải hiển thị cho từng khoảng 1, 7, 30 ngày.

### DATA-10 Không gọi mạng ngoài phạm vi

App chỉ gọi mạng tới file của chính nó, base URL dữ liệu (DATA-05) và, khi đã cấu hình, project Supabase của nhóm (AU, DATA-14). Không gọi `/api/sharing/*`, `/get-data-lesson` hay bất kỳ endpoint nào của bản cũ; dữ liệu người học chỉ gửi tới tài khoản của chính người đó trên Supabase. Ở chế độ trên máy (AU-06) không gửi dữ liệu người học đi đâu.

### DATA-11 Lộ trình học

Lộ trình là thứ tự unit trong file unit của bộ nội dung đang dùng. Câu tiếp theo trên T1 là câu chưa học đầu tiên của unit đầu tiên còn câu chưa học. Phiên học theo lộ trình lấy toàn bộ câu của unit đó (tối đa 8). Unit hoàn thành khi mọi câu của nó đã qua bước ghi nhớ ít nhất một lần. Bản này không cho chọn trình độ bắt đầu: lộ trình Global English đi từ A1-01; muốn học trình độ khác thì lọc theo Trình độ ở Thư viện (T3-03).

### DATA-12 Tìm kiếm

Tìm trên câu gốc, nghĩa, và `noteVi`, `topic`, `situation` khi bộ nội dung có các trường này; không phân biệt hoa thường; bỏ dấu tiếng Việt khi so khớp ("dat phong" khớp "đặt phòng"), chỉ bỏ dấu trên chữ Latinh (dấu của chữ Nhật, Hindi, Thái, Kirin là một phần của chữ nên giữ nguyên, "が" không khớp "か"); khớp theo chuỗi con. Kết quả giữ thứ tự theo `id`.

### DATA-13 Bộ nội dung

| Mã bộ | Tên hiển thị | Mô tả ngắn | Ngôn ngữ |
|---|---|---|---|
| `global` | Global English | Câu theo chủ đề và tình huống, có giải thích cách dùng; 6 trình độ A1 đến C2 | Chỉ tiếng Anh |
| `fluency` | English Fluency | Câu luyện nói theo mẫu câu | 15 ngôn ngữ |

Danh sách bộ của một ngôn ngữ được tính từ các manifest: ngôn ngữ có mặt trong manifest nào thì có bộ đó. Ngôn ngữ có từ hai bộ trở lên (hiện chỉ tiếng Anh) thì người học chọn bộ (S1-07) và đổi bộ được (APP-06). Ngôn ngữ chỉ có một bộ thì dùng bộ đó, không hiện lựa chọn. Không có bộ mặc định cho tiếng Anh. Đổi bộ không làm mất tiến độ của bộ kia (DATA-06).

### DATA-14 Đồng bộ với tài khoản

Khi có Supabase (QD-06), cài đặt và tiến độ của người đăng nhập lưu thêm ở hai bảng `user_settings` (một dòng mỗi người) và `user_progress` (một dòng mỗi cặp bộ, ngôn ngữ), cột `data` dạng JSON đúng cấu trúc DATA-06; Row Level Security cho mỗi người chỉ đọc, ghi dòng của mình (`supabase/migrations/0001_init.sql`).

- Lần đầu mở khu học sau khi đăng nhập: lấy dữ liệu của tài khoản và gộp vào bản trên máy, rồi gửi lên phần máy có mà tài khoản chưa có. Cài đặt: giá trị của tài khoản thắng; bộ đã chọn và giọng đã chọn của từng ngôn ngữ gộp lại; đã xem hướng dẫn ở một nơi thì coi như đã xem.
- Mã phiên gồm thời điểm, số đếm và phần ngẫu nhiên, nên hai tab hay hai máy bắt đầu phiên cùng một mili giây vẫn có mã khác nhau.
- Gộp tiến độ không làm mất phần nào: phiên theo `id` (lấy bản đi xa hơn: đã xong hay đã bỏ, rồi vị trí lớn hơn), lượt trả lời theo (phiên, câu, loại, thời điểm), trạng thái câu lấy bản có `lastAt` mới hơn. Kết quả không phụ thuộc thứ tự hai bản và gộp lại nhiều lần vẫn như nhau.
- Xóa tiến độ (S8-05) và nhập tiến độ từ tệp ghi mốc `baseAt`: khi gộp, phần cũ hơn mốc ở bản kia bị bỏ, để phần đã xóa không quay lại từ máy khác.
- Mỗi lần ghi trên máy, sau 1,5 giây không ghi thêm thì gửi phần đổi lên tài khoản: đọc bản trên tài khoản, gộp, ghi lại, rồi gộp kết quả với bản mới nhất trên máy (không ghi đè phần vừa học thêm). Ẩn trang (chuyển tab, đóng app) thì gửi ngay. Đăng xuất khi còn phần chưa gửi hay đang gửi thì gửi xong (chờ tối đa 3 giây) rồi mới đăng xuất; rời khu học khi còn phần chờ thì gửi ngay. Các lần gửi chạy lần lượt, không chồng nhau. Mỗi lần vào khu học lấy lại bản mới của tài khoản. Mất mạng thì giữ lại và gửi khi có mạng.
- Cài đặt lấy từ tài khoản được kiểm như cài đặt trên máy (DATA-06): giá trị sai kiểu hay ngoài phạm vi thì bỏ.
- Lỗi khi lấy hay gửi: báo một lần mỗi lần mở app bằng thông báo lỗi (`showApiError`), tiến độ vẫn lưu trên máy; mất mạng thì không báo.
- Chế độ trên máy (AU-06): không đồng bộ.

## Câu hỏi mở

Không còn câu hỏi mở.

### Đã trả lời (10/10/2026)

Các câu dưới đây do Claude quyết định ngày 10/10/2026 theo ủy quyền của nhóm, để làm xong bản web; khách muốn khác thì sửa ở đợt sau.

| Câu hỏi | Quyết định | Áp dụng vào |
|---|---|---|
| Khoảng ôn 1, 3, 7, 14, 30 ngày là đề xuất | Chốt khoảng ôn này | DATA-07 |
| Global English có cho chọn trình độ bắt đầu không | Không ở bản này; lộ trình đi từ A1-01, trình độ khác học qua bộ lọc của Thư viện | DATA-11, `docs/new/ui-spec.md` mục 5 |
| Trả lời đúng ở bước trắc nghiệm mà không dùng gợi ý | Giữ nguyên `streak` và `due` như code đang làm | DATA-07 |
| Các trường lưu thêm ngoài DATA-06 | Ghi vào DATA-06 | DATA-06 |

## Lịch sử thay đổi

- 0.1 (07/10/2026): bản đầu.
- 0.2 (08/10/2026): hỗ trợ hai bộ nội dung tiếng Anh (English Fluency và Global English).
- 0.3 (08/10/2026): cập nhật theo bộ dữ liệu khách gửi và câu trả lời của nhóm (ưu tiên web, responsive; đủ 15 ngôn ngữ; không đọc tiến độ bản cũ).
- 0.4 (10/10/2026): chốt các câu hỏi mở (Claude quyết định theo ủy quyền của nhóm): khoảng ôn, không chọn trình độ bắt đầu, trả lời đúng không gợi ý giữ nguyên lịch, ghi các trường lưu thêm vào DATA-06.
- 0.5 (18/10/2026): DATA-06 thêm `hintedItemId`, bỏ phần tử hỏng khi đọc tiến độ, đồng bộ giữa các tab; DATA-07 cộng ngày theo lịch; DATA-12 chỉ bỏ dấu chữ Latinh (sửa lỗi tìm thấy khi rà soát code).
- 0.6 (20/10/2026): DATA-06 thêm nguồn phiên `unit` và tham số `so` (Đợt 5 việc 3).
- 0.7 (20/10/2026): DATA-06 lưu bài kiểm tra dở (`buoc`, `buocSo`, `position`), tối đa một phiên dở mỗi loại (Đợt 5 việc 8).
- 1.0 (21/10/2026): Đợt 6: nguồn dữ liệu và fixture theo cấu trúc Next.js (DATA-05, DATA-09); DATA-06 thêm khóa phiên đăng nhập, chủ dữ liệu, giao diện lưu riêng, mốc `baseAt`; DATA-10 cho phép gọi Supabase; thêm DATA-14 đồng bộ với tài khoản (QD-06).
- 1.1 (21/10/2026): theo rà soát code độc lập Đợt 6: DATA-14 gửi lần lượt, chờ lần đang gửi khi đăng xuất, gửi ngay khi rời khu học, lấy lại bản tài khoản mỗi lần vào, kiểm cài đặt từ tài khoản. DATA-14 mã phiên có phần ngẫu nhiên (hai phiên cùng mili giây từng trùng mã).
