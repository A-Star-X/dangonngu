# Hướng dẫn cho Claude khi làm việc trong repo này

Repo làm lại giao diện app học câu VITASR Đa ngôn ngữ thành website Next.js (QD-01). Spec là nguồn chân lý duy nhất. Đọc `docs/QUY-TRINH.md` trước khi làm bất cứ việc gì.

## Quy tắc bắt buộc

1. Không tự sửa `spec.md` hay nội dung yêu cầu trong `acceptance.md`. Thấy spec sai, thiếu hoặc mâu thuẫn: ghi vào mục "Câu hỏi mở" của spec đó (commit riêng, tiền tố `spec-question:`), dừng phần code liên quan và báo cho người.
2. Mọi file hoặc khối code hiện thực một yêu cầu phải có ghi chú `@spec <ID>`. Mọi test tự động phải có `@ac <ID>`.
3. Không thêm chức năng không có trong spec, kể cả khi thấy hữu ích. Đề xuất thì ghi vào "Câu hỏi mở".
4. Sau mỗi lượt sửa code, chạy `npm run spec:check`. Còn lỗi thì chưa xong.
5. Chỉ đánh dấu `[x]` cho mục `[claude]` và `[auto]`, và chỉ khi có bằng chứng (ảnh chụp trong `docs/evidence/`, kết quả test, commit). Không bao giờ đánh dấu mục `[human]`.
6. Khi spec thay đổi: đọc diff, sửa code, bỏ dấu `[x]` của các mục acceptance bị ảnh hưởng, kiểm lại phần của mình.

## Ràng buộc kỹ thuật cần nhớ

- Cấu trúc code theo bộ quy tắc leader (20/10/2026): route mỏng ở `src/app/[locale]/(public|workspace)/`, giao diện ở `src/views/<trang>/`, thành phần ở `src/components/{ui,status,layout,learning}/`, gọi dịch vụ ở `src/services/<tên>-services/{api-url,api,type}.ts`. Câu chữ giao diện đặt trong `src/messages/vi.json` và `en.json` (cùng khóa), không viết cứng trong code; chạy `npm run messages:check`.
- Không dùng `#` trong URL. Đi giữa các màn qua `useNav` hoặc `AppLink` để giữ cơ chế hỏi trước khi rời phiên học (APP-07).
- Trang học chính: liên kết "Trang học chính" lấy từ `NEXT_PUBLIC_HOST_URL` (APP-12). App không cần token hay postMessage từ trang chính, không dùng `window.top` (APP-09).
- Tài khoản và đồng bộ qua Supabase (QD-06, DATA-14), cấu hình bằng biến môi trường; không có khóa thì chạy chế độ trên máy (AU-06). Test không bao giờ gọi Supabase thật. Không ghi khóa, mật khẩu hay tài khoản thật vào repo.
- Dữ liệu câu là file JSON tĩnh (xem `docs/spec/data/spec.md`). Tiến độ lưu localStorage theo từng người trên máy (DATA-14), đồng bộ lên tài khoản khi có Supabase. Giọng đọc dùng `speechSynthesis`.
- Tiếng Anh có hai bộ nội dung với cấu trúc khác nhau: English Fluency (chỉ `id`, `hierarchy`, `en`, `vi`) và Global English (thêm `noteVi`, `topic`, `situation`, `unitId`). Các trường tùy chọn có thể vắng mặt tùy bộ; không giả định có hay không có (`docs/legacy/api-and-storage.md`).
- Không gọi `/api/sharing/*` hay bất kỳ endpoint nào của bản cũ.
- Bộ dữ liệu đầy đủ khách cho phép dùng nằm ở `public/data/` (phát triển, demo); test đơn vị dùng tập con `fixtures/data/`, sinh bằng `node scripts/make-fixtures.mjs`, không sửa tay.
- Trường câu gốc luôn tên `en` ở mọi file ngôn ngữ, kể cả tiếng Đức, Nhật…; ngôn ngữ thật lấy từ `languageId`.
- Giai đoạn đầu ưu tiên web trên máy tính (1440, 1280 px), responsive xuống điện thoại.

## Nhánh và pull request

Tạo nhánh từ `staging`, mở pull request vào `staging`, không vào `main`. `main` chỉ nhận PR phát hành từ `staging` (QD-11). Các bước kiểm và phát hành: `docs/QUY-TRINH.md` mục 8.

## Lệnh kiểm trước khi báo xong

`npm run lint`, `npm run typecheck`, `npm run messages:check`, `npm test`, `npm run build`, `npm run test:e2e`, `npm run spec:check`. Ảnh bằng chứng cho mục `[claude]`: `npm run evidence` (ghi vào `docs/evidence/<mã mục>/`), xem lại ảnh rồi mới đánh dấu.

## Tài liệu tham khảo

- Bản cũ: `docs/legacy/` (chỉ tham khảo hành vi, không phải yêu cầu).
- Đối chiếu cũ và mới: `docs/new/mapping-legacy.md`.
- Quyết định kỹ thuật: `docs/QUYET-DINH.md`.
