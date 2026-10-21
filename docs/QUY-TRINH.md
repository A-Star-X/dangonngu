# Quy trình làm việc giữa spec, code và acceptance

Tài liệu này quy định cách nhóm và Claude cùng làm việc trên repo. Mục tiêu: spec là nguồn chân lý duy nhất, mọi dòng code truy ngược được về một yêu cầu, và mọi yêu cầu có điều kiện nghiệm thu rõ ràng.

## 1. Ba loại file và vai trò

| File | Ai sửa | Vai trò |
|---|---|---|
| `spec.md` trong mỗi thư mục khu vực (`docs/spec/<khu vực>/`) | Nhóm (người) | Mô tả giao diện và hành vi phải có. Là nguồn chân lý. |
| `acceptance.md` cạnh mỗi `spec.md` | Nhóm viết mục kiểm; người kiểm đánh dấu | Điều kiện để chấp nhận phần code của khu vực đó. |
| Code trong `src/`, test trong `tests/` | Claude (hoặc dev) | Hiện thực spec. Mỗi phần gắn ghi chú `@spec`, mỗi test gắn `@ac`. |

Tài liệu trong `docs/legacy/` mô tả bản cũ, chỉ để tham khảo, không phải yêu cầu. `docs/generated/` do script sinh ra, không sửa tay.

## 2. Khu vực và ID

Mỗi thư mục có `spec.md` là một **khu vực**, có `id` trong frontmatter:

| Nhóm | ID khu vực | Thư mục |
|---|---|---|
| Mục tiêu sản phẩm | `G` | `docs/new/` |
| Khung app (điều hướng, bố cục, trạng thái toàn cục) | `APP` | `docs/spec/app/` |
| Nền tảng thiết kế (token, chữ, giọng văn, trợ năng) | `FND` | `docs/spec/foundation/` |
| Dữ liệu (hợp đồng, nguồn, tiến độ, đồng bộ) | `DATA` | `docs/spec/data/` |
| Thành phần | `C1` đến `C8` | `docs/spec/C<n>-<tên>/` |
| Trang công khai | `LP` Landing, `AU` Tài khoản | `docs/spec/LP-landing/`, `docs/spec/AU-tai-khoan/` |
| Màn trong khu học | `S1`, `T1`, `S3`, `T2`, `S5`, `T3`, `S10`, `T4`, `S8`, `S9` | `docs/spec/<ID>-<tên>/` |

Từ Đợt 6 (21/10/2026) spec tách khỏi code: spec nằm ở `docs/spec/`, code theo cấu trúc Next.js của bộ quy tắc leader (`src/app` route, `src/views` giao diện từng trang, `src/components`, `src/services`). Ghi chú `@spec` và `@ac` là cầu nối giữa hai nơi.

Quy ước ID:

- **Yêu cầu**: `<khu vực>-<2 chữ số>`, viết thành tiêu đề cấp 3 trong `spec.md`: `### T1-02 Nút chính đổi chữ theo ngữ cảnh`.
- **Mục acceptance**: `<khu vực>-AC<2 chữ số>`, viết thành checkbox trong `acceptance.md`:
  `- [ ] T1-AC03 [human] T1-02: Mô tả cách kiểm.`
- ID không bao giờ được dùng lại. Bỏ một yêu cầu thì xóa tiêu đề của nó và ghi vào mục "Lịch sử thay đổi" của spec; ID đó coi như đã chết.
- Sửa nội dung yêu cầu mà ý nghĩa không đổi: giữ ID. Đổi ý nghĩa hẳn: bỏ ID cũ, tạo ID mới.

ID của bản cũ có tiền tố `L-` (ví dụ `L-D6`) để không trùng với ID bản mới.

## 3. Ánh xạ hai chiều

**Code sang spec.** Mỗi file hoặc khối code hiện thực một yêu cầu phải có ghi chú:

```ts
// @spec T1-02, T1-04
export function StartButton() { ... }
```

Test tự động gắn ghi chú tới mục acceptance mà nó kiểm:

```ts
// @ac T1-AC03
test('nút chính đổi chữ khi có phiên dở', ...)
```

**Spec sang code.** Không ghi đường dẫn code vào `spec.md` (nó sẽ lỗi thời ngay). Thay vào đó chạy:

```bash
npm run spec:trace
```

Script đọc toàn bộ spec, acceptance và ghi chú trong code, rồi sinh `docs/generated/traceability.md`: mỗi yêu cầu nằm ở file code nào, được mục acceptance nào kiểm, có test nào.

**Sơ đồ sang spec.** Trong `docs/new/navigation.md`, mỗi mũi tên của sơ đồ Mermaid có một dòng chú thích ngay bên dưới (không hiện khi render):

```
  t1_start -->|"Click"| W_S3
  %% @spec T1-02
```

Mũi tên nằm ngoài phạm vi ghi `%% @none <lý do>`. Script sinh `docs/generated/navigation-trace.md`: mỗi mũi tên, yêu cầu làm bằng chứng (kèm file và dòng spec) và các file code gắn `@spec` của yêu cầu đó. Cột "Sơ đồ" trong `traceability.md` cho chiều ngược lại.

`npm run spec:check` báo lỗi (thoát mã 1) khi:

- ID yêu cầu hoặc acceptance bị trùng;
- mục acceptance trỏ tới yêu cầu không tồn tại;
- yêu cầu chưa có mục acceptance nào;
- code gắn `@spec` hoặc `@ac` tới ID không tồn tại (thường do spec vừa bỏ yêu cầu đó);
- mũi tên trong sơ đồ điều hướng chưa gắn `%% @spec` / `%% @none`, hoặc gắn tới ID không tồn tại;
- tài liệu trong `docs/new/` nhắc tới một mã yêu cầu hoặc acceptance không tồn tại.

Và cảnh báo khi mục `[auto]` chưa có test gắn `@ac`.

## 4. Vòng làm việc khi spec thay đổi

1. Người sửa `spec.md` (và `acceptance.md` nếu cần), commit riêng với tiền tố `spec:`. Ghi một dòng vào "Lịch sử thay đổi" của spec đó.
2. Claude đọc diff của các file spec trong commit đó, sửa code tương ứng, cập nhật ghi chú `@spec`.
3. Claude chạy `npm run spec:check`. Không có lỗi mới được coi là xong lượt sửa.
4. Claude bỏ dấu `[x]` của các mục acceptance bị ảnh hưởng bởi thay đổi (chúng phải được kiểm lại), rồi tự kiểm lại các mục `[claude]` và `[auto]`.
5. Người kiểm lại các mục `[human]` bị ảnh hưởng.

Claude không tự sửa `spec.md`. Khi thấy spec mâu thuẫn, thiếu hoặc không khả thi, Claude ghi câu hỏi vào mục "Câu hỏi mở" của spec đó trong một commit riêng tiền tố `spec-question:` và dừng phần code liên quan.

## 5. Ai kiểm mục acceptance

| Nhãn | Ai kiểm | Cách kiểm | Ai được đánh dấu [x] |
|---|---|---|---|
| `[auto]` | Máy | Test tự động có ghi chú `@ac <ID>` và đang pass | Claude, sau khi chạy test và thấy pass |
| `[claude]` | Claude | Đọc code, chạy app, chụp màn hình ở các khổ quy định, đối chiếu spec | Claude, kèm dòng bằng chứng |
| `[human]` | Người trong nhóm | Thao tác trên thiết bị thật, đánh giá cảm quan, test với người dùng | Chỉ người |

Khi đánh dấu, thêm một dòng bằng chứng thụt vào ngay dưới mục:

```md
- [x] T1-AC03 [claude] T1-02: Nút chính hiện "Tiếp tục: N câu còn lại" khi có phiên dở.
  - Bằng chứng: ảnh docs/evidence/T1-AC03.png, commit a1b2c3d, Claude, 2026-10-20
```

## 6. Khi nào một phần được chấp nhận

- Một **khu vực** đạt khi mọi mục trong `acceptance.md` của nó đã `[x]`.
- Một **trang** chỉ được nghiệm thu khi trang đó đạt và mọi thành phần nó dùng (ghi ở `depends` trong frontmatter) cũng đạt, cùng với `APP`, `FND`, `DATA`.
- Bản giao cho khách khi tất cả khu vực đạt, kể cả `G` (test với người dùng).

Xem tình trạng hiện tại: `npm run spec:acceptance`, rồi mở `docs/generated/acceptance-report.md`.

## 7. Khổ màn hình dùng để kiểm

Trừ khi mục acceptance ghi khác, kiểm theo thứ tự ưu tiên: máy tính 1440 x 900 và 1280 x 800, máy tính bảng 768 x 1024, điện thoại 375 x 812; cả giao diện sáng và tối. Thiết bị thật tối thiểu cho mục `[human]`: một iPhone (Safari), một điện thoại Android (Chrome), một máy Windows (Chrome hoặc Edge).

## 8. Nhánh, pull request và phát hành (QD-11)

Website có ba môi trường, mỗi môi trường một địa chỉ (APP-17):

| Môi trường | Nhánh | Địa chỉ | Ai dùng |
|---|---|---|---|
| production | `main` | `dangonngu-theta.vercel.app` | Người học thật |
| demo | `main` | `dangonngu-demo.vercel.app` | Khách dùng thử, không cần đăng nhập (AU-08) |
| staging | `staging` | bản Vercel của nhánh `staging` (cần đăng nhập Vercel) | Nhóm kiểm trước khi phát hành |

Merge vào `main` là production và demo đổi ngay, nên **không mở PR thẳng vào `main`**. Mọi việc đi theo thứ tự: nhánh việc → `staging` → `main`.

### 8.1 Làm một việc mới

1. Lấy bản mới nhất của `staging` và tạo nhánh từ đó: `git switch staging && git pull`, rồi `git switch -c <loại>/<tên-việc>`. Loại: `feature/` (chức năng), `fix/` (sửa lỗi), `docs/` (tài liệu).
2. Làm theo mục 4: commit `spec:` trước, rồi code, rồi `docs:` nghiệm thu. Chạy đủ lệnh kiểm trong `CLAUDE.md` trước khi đẩy lên.
3. Mở pull request với **base là `staging`** (không phải `main`). Mô tả PR ghi: yêu cầu nào, đã đổi gì, đã kiểm gì, mục `[human]` nào cần người thử.

### 8.2 Kiểm trước khi merge vào `staging`

1. Chờ CI (`kiem-tra`, `webkit`) và Vercel trên PR đều báo đạt.
2. Mở bản xem trước của chính PR đó: trong PR, bình luận của bot **vercel** có nút **Preview** ở dòng `dangonngu`. Bản này bị Vercel Authentication khóa: phải đăng nhập Vercel của project mới mở được.
3. Thử đúng phần vừa đổi, theo mô tả PR và các mục acceptance liên quan. Thấy lỗi thì sửa trên cùng nhánh rồi đẩy lên; PR tự cập nhật.
4. Đạt thì bấm **Merge** vào `staging`. Xóa nhánh việc sau khi merge (nút "Delete branch" trong PR).

### 8.3 Phát hành lên production và demo

Làm theo đợt, khi `staging` đã gom đủ việc muốn phát hành (không cần mỗi PR một lần):

1. Mở bản staging trên Vercel (Active Branches > `staging` > Preview), thử lại các việc vừa gom. Mở `/robots.txt`: phải thấy `Disallow: /` (đúng là bản staging, APP-17).
2. Mở pull request **base `main`, compare `staging`**. Tiêu đề ghi các việc được phát hành, ví dụ "Phát hành: tô sáng chữ đang đọc (C1-09)".
3. Chờ CI đạt rồi merge. Vercel tự deploy production và demo.
4. Kiểm sau phát hành:
   - Production: vẫn có nút Đăng nhập; `/robots.txt` có `Allow: /`.
   - Demo: mở `/hoc` vào thẳng khu học, không hỏi đăng nhập; `/robots.txt` có `Disallow: /`.
   - Phần vừa phát hành chạy đúng trên cả hai.
5. Phát hành có lỗi: vào Vercel > Deployments của project đó, chọn bản trước, **⋯ > Promote to Production** để lui lại ngay; sau đó sửa theo 8.1.

### 8.4 Cấu hình Vercel (đã làm, chỉ cần khi dựng lại)

- Project `dangonngu` nối repo `A-Star-X/dangonngu`, Production Branch `main`. Biến `NEXT_PUBLIC_APP_ENV`: `production` cho Production, `staging` cho Preview của nhánh `staging`. Hai biến Supabase nếu dùng tài khoản thật (QD-06).
- Project `dangonngu-demo` nối cùng repo, nhánh `main`, biến `NEXT_PUBLIC_APP_ENV=demo`, không đặt biến Supabase.
- Biến `NEXT_PUBLIC_...` được gắn vào lúc build: đổi biến xong phải deploy lại (Deployments > ⋯ > Redeploy) mới có tác dụng.
- Mỗi PR được build ở cả hai project; chỉ cần mở bản của `dangonngu` để kiểm.
