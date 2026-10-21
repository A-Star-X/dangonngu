# Báo cáo Đợt 6 (21/10/2026)

**Kết quả:** chuyển toàn bộ app sang Next.js theo bộ quy tắc leader gửi ngày 20/10/2026 (`ui.md`, `technologies.md`, `rules.md`), làm nốt việc 4 (Landing) và việc 5 (Đăng nhập, Đăng ký), thêm giao diện tiếng Anh. 11/12 việc đã xong; việc 9 (AI nhận xét) để sau theo quyết định ngày 20/10. Code nằm ở nhánh `dot6-nextjs`, **chưa commit, chưa push**: người giữ repo commit theo lệnh gửi kèm.

## Kiểm lại báo cáo Đợt 5

Báo cáo Đợt 5 ghi 9/12 việc xong, nhưng 9 việc đó không phải 9 việc đầu: việc 4 và 5 chưa làm, còn việc 11 mới nằm ở PR #13 (chưa gộp vào main). Lần chạy CI #28 trên main (gộp PR #20) báo lỗi dù cùng code với lần #27 đã đạt, nhiều khả năng là test trình duyệt chập chờn của bản Vite; Đợt 6 viết lại toàn bộ test trình duyệt nên lỗi đó không còn áp dụng.

## 12 việc

| # | Việc | Trạng thái | Đợt 6 làm gì |
|---|---|---|---|
| 1 | Trang Học | Xong | Chuyển sang Next.js, giữ khối "Unit tiếp theo", "Tiến độ của bạn", lưới nhiều cột từ 1200 px |
| 2 | Chữ và khoảng cách | Xong | Thang chữ theo rule giao diện (12 đến 24 px, một cỡ hiển thị 32 px), nhịp khoảng cách theo khung khu học |
| 3 | Thư viện theo Unit | Xong | Bộ lọc dùng ô chọn chung (C8), Chi tiết Unit ở `/thu-vien/unit?so=n` |
| 4 | Landing Page | **Xong ở Đợt 6** | `/`: giới thiệu, người dùng hướng tới, số liệu thật lấy từ dữ liệu, tính năng, ba bước bắt đầu, ảnh chụp app thật; không có phần Đối tác vì chưa có thông tin thật (LP-01 đến LP-07) |
| 5 | Đăng nhập, Đăng ký | **Xong ở Đợt 6** | `/dang-nhap`, `/dang-ky` bằng Supabase, kiểm dữ liệu nhập bằng react-hook-form và zod, khu học cần đăng nhập, đồng bộ cài đặt và tiến độ theo tài khoản (AU, DATA-14). Chưa có khóa Supabase thì chạy chế độ thử trên máy |
| 6 | Responsive | Xong | Khung khu học có thanh bên từ 768 px, menu trượt dưới 768 px; kiểm lại 320 đến 1440 px |
| 7 | Rà soát UI | Xong | Áp rule giao diện của leader (khung, màu, chữ, bo góc, trạng thái, bảng, ô chọn) |
| 8 | Luyện tập | Xong | Chuyển sang Next.js, giữ Tạm dừng, Làm tiếp, Câu cần xem lại |
| 9 | AI nhận xét bài | **Để sau** | Đã chốt ngày 20/10 (QD-08) |
| 10 | Điều hướng | Xong | URL là đường dẫn thật, không còn `#`; liên kết cũ dạng `#/...` tự chuyển; Back khi đang học dở vẫn hỏi trước |
| 11 | Sitemap, user flow, mô tả sản phẩm | Xong | Nội dung PR #13 (`docs/new/san-pham.md`) đã đưa vào nhánh này và cập nhật; thêm `sitemap.xml`, `robots.txt`, ảnh chia sẻ cho SEO |
| 12 | Kiểm thử | Xong | Xem mục Kiểm thử |

## Đối chiếu bộ quy tắc của leader

| Quy tắc | Cách làm trong code |
|---|---|
| Công nghệ: Next.js App Router, React 19, TypeScript, Tailwind 4, react-query, react-hook-form + zod, react-toastify, lucide-react, clsx + tailwind-merge, next-intl | Đúng các thư viện này (QD-01, `package.json`) |
| Cấu trúc thư mục | Route mỏng ở `src/app/[locale]/(public)` và `(workspace)`; giao diện ở `src/views/<trang>`; `src/components/{ui,status,layout,learning}`; `src/services/<tên>-services/{api-url,api,type}.ts`; `src/hooks`, `src/utils`, `src/lib` |
| Thứ tự provider | QueryClient → Theme → Auth → Toast (`src/providers/app-providers.tsx`) |
| Khung trang đã đăng nhập | Header cao 56 px (`z-30`), thanh bên 240 px (`z-50`), dưới `md` là menu trượt có lớp phủ (`z-40`); nội dung rộng tối đa 1024 px, `px-4 py-6`, các khối cách 16 px (C5) |
| Trang công khai | Header riêng, nội dung rộng tối đa `max-w-3xl` |
| Ô chọn | `DropdownSelect` thay cho thẻ `select` (C8) |
| Trạng thái dữ liệu | `Loading`, `Failed`, `NoData`, `DataWithStatus`; bảng nằm trong `CardCustom` |
| Tiêu đề | `PageHeader`, `SectionTitle` (FND-15) |
| Form và lỗi | react-hook-form + zod; lỗi từ dịch vụ qua `showApiError` (AU-03, AU-04) |
| Ô tìm kiếm | Chờ ngừng gõ (`useDebouncedValue`, mặc định 3000 ms, ô tìm 300 ms, FND-16) |
| Ngôn ngữ | Câu chữ ở `src/messages/vi.json` và `en.json` cùng khóa (`npm run messages:check`); nút đổi ngôn ngữ ở header và trang Cài đặt (APP-15) |
| SEO | Metadata chung, `robots.txt`, `sitemap.xml`, ảnh chia sẻ, icon; trang đăng nhập và khu học `noindex` (APP-16) |
| Nhật ký | `log.md` ở gốc repo, mới nhất ở trên |

## Kiểm thử

- `npm run lint`, `npm run typecheck`, `npm run messages:check` (404 khóa, vi và en khớp), `npm run spec:check` đều đạt.
- `npm test`: 233/233 test Vitest trong 22 file. `npm run test:e2e`: 59/59 test Playwright trên bản build (Chromium), không test nào chập chờn qua các lần chạy lại. `npm run build` đạt.
- Spec: 24 khu vực, 178 yêu cầu, 242 mục nghiệm thu. **216/242 mục đạt**: 163 mục `[auto]` (mỗi mục có test gắn `@ac` đã pass trên bản Next.js) và 53 mục `[claude]` (ảnh và số đo trong `docs/evidence/*/d6-*`, chấm bởi người kiểm độc lập như mục dưới, hoặc rà mã nguồn). 26 mục còn lại đều là `[human]` (thiết bị thật, người học thật, người ngoài nhóm, khách, Supabase thật); cách thử ở `docs/thu-that/README.md`.
- Mọi dấu đạt của bản Vite đã được bỏ và kiểm lại từ đầu trên bản Next.js.

## Rà soát độc lập

Một agent chưa tham gia viết code đọc lại toàn bộ code (đăng nhập, đồng bộ, điều hướng, service worker, trợ năng) và tìm ra 9 lỗi. Cả 9 lỗi đã sửa, có test chống tái phát cho các lỗi logic:

| # | Lỗi | Mức | Đã sửa |
|---|---|---|---|
| 1 | `?tiep=/.//host` sau khi chuẩn hóa thành `//host`, đăng nhập xong bị đưa sang trang ngoài | Cao | `tiep` chỉ nhận route của khu học (AU-05) |
| 2 | Hai lần gửi tiến độ chạy song song, lần cũ ghi đè lần mới | Trung bình | Các lần gửi chạy lần lượt (DATA-14); trường hợp hai máy xem mục Lưu ý |
| 3 | Đăng xuất hay rời khu học ngay sau khi trả lời làm rơi phần đang gửi | Trung bình | Chờ lần đang gửi, gửi nốt phần chờ trước khi đăng xuất; rời khu học thì gửi ngay |
| 4 | Đăng nhập lại trong cùng tab dùng bản tài khoản cũ | Trung bình | Mỗi lần vào khu học lấy lại bản mới |
| 5 | Dừng phiên rồi bấm Back thì quay lại phiên, bấm tiếp bị kẹt | Trung bình | Dừng, Tạm dừng thay mục lịch sử (S3-07, S5-08) |
| 6 | Tab khác bắt đầu phiên mới thì tab đang học hiện màn trống | Trung bình thấp | Báo và về màn trước (S3-08) |
| 7 | Service worker không lưu được trang (sao chép body muộn), bộ nhớ đệm không dọn, font và ảnh không bao giờ cập nhật | Thấp trung bình | Sao chép ngay, bộ nhớ theo bản build, tải bản mới ở nền (APP-10) |
| 8 | Menu trượt mở mà phím Tab vẫn đi ra nội dung phía sau | Thấp | Header và nội dung `inert` khi menu mở (C5-02) |
| 9 | Cài đặt từ tài khoản không được kiểm; mật khẩu chế độ thử băm không muối | Thấp | Kiểm như cài đặt trên máy; PBKDF2 có muối, tài khoản thử cũ tự nâng |

## Rà soát ảnh bằng chứng

Bốn agent khác (không viết code) mở từng ảnh và số đo trong `docs/evidence/*/d6-*` và chấm từng mục `[claude]` theo chữ của mục đó, qua ba vòng: vòng sau chụp lại sau khi sửa lỗi vòng trước. Các lỗi giao diện tìm ra và đã sửa:

- Landing có hai nút nền `primary`; nút "Đăng nhập" ẩn trên điện thoại; ảnh chụp app trên Landing luôn là bản tiếng Việt; liên kết "Trang học chính" ở chân trang thiếu icon.
- Thông báo ngắn dùng font hệ thống thay vì Lexend.
- Ở 768 px thẻ "Unit tiếp theo" (T1) và ba mục Luyện tập (T2) bị ép quá hẹp, chữ tràn.
- T4: ba chỉ số mỗi số một thẻ; bảng phiên chỉ rộng nửa màn và bị cắt ở 320 px; khối mục tiêu tuần lệch với lịch ôn tập.
- Viền focus của nút chọn cách xem và khoảng thời gian bị cắt; nút đang chọn dùng nền `primary`.
- Khung xương lúc tải chưa đúng hình T1, T3 và trước khi JS chạy trang trắng; nay HTML dựng sẵn có khung khu học và khung xương.
- Dòng chú thích ở S1 nằm trên danh sách thay vì dưới; số câu xuống dòng ở 320 px.
- Hướng dẫn S9: bong bóng che một phần thẻ câu ở màn hẹp, có hai nút nền `primary`, vùng làm nổi rộng cả hàng.
- Sheet Học theo từ khóa trên màn thấp: chip chiếm chỗ kết quả.
- Nhãn "Giọng Tiếng Anh" viết hoa sai (FND-12); nút Xóa tiến độ dùng màu `primary` thay vì `danger`.
- Ô chưa học trong dải 8 ô gần như không thấy ở giao diện tối.
- Tên bước ở đầu Kiểm tra nhanh bị cắt ở 320 px.

Một lỗi dữ liệu tìm ra nhờ ảnh: mã phiên học chỉ dựa vào thời điểm và một số đếm, nên hai lần mở trang bắt đầu phiên cùng một mili giây (hay hai máy) có thể ra cùng mã; khi đó phiên mới bị coi là phiên cũ đã dừng. Mã phiên nay có thêm phần ngẫu nhiên (DATA-14), có test.

## Cần nhóm làm

1. Commit và push theo lệnh gửi kèm, mở PR từ `dot6-nextjs` vào main. PR #13 đã nằm trong nhánh này: đóng PR #13 sau khi gộp.
2. Tạo project Supabase (hoặc dùng project đang có), chạy `supabase/migrations/0001_init.sql`, rồi nối repo với Vercel và đặt biến môi trường (`README.md` mục "Cài Supabase" và "Triển khai").
3. Hỏi công ty các câu còn mở ở `docs/new/ui-spec.md` mục 5, quan trọng nhất là website mới thay thế hay chạy song song với trang học chính.
4. Thử các mục `[human]` theo `docs/thu-that/README.md` (thêm buổi 5 cho Supabase thật và Landing).

## Lưu ý

- `docs/theo-doi/checklist-chuc-nang.md` và `ban-do-man-hinh.html` là bản chụp đến Đợt 4, chưa cập nhật theo bản Next.js; trạng thái mới nhất xem `docs/generated/acceptance-report.md`.
- Ảnh bằng chứng của bản Vite đã được thay bằng ảnh chụp bản Next.js (tên file bắt đầu bằng `d6-`); ảnh cũ vẫn còn trong lịch sử git.
- Hai máy cùng gửi tiến độ của một ngôn ngữ đúng cùng lúc thì bản gửi sau có thể ghi đè phần của máy kia trên tài khoản; phần đó vẫn còn trên máy kia và được gửi lại ở lần học tiếp theo trên máy đó. Muốn chặn hẳn cần một hàm gộp chạy trên Supabase (RPC), để đợt sau.
- Ảnh trong `public/landing/` chụp từ app với tài khoản thử; muốn chụp lại: `SHOTS=1 npx playwright test landing-shots` rồi build lại.
