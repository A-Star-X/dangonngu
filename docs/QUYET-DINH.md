# Quyết định kỹ thuật

Mỗi quyết định có trạng thái: **Đề xuất** (chờ nhóm chốt), **Đã chốt**, **Bỏ**. Quyết định ở trạng thái Đề xuất chưa được dùng để viết code.

## QD-01 Công nghệ front-end

Trạng thái: Đã chốt (08/10/2026, nhóm đồng ý khi bắt đầu code)

Phiên bản dùng: Vite 6.4, React 18.3, TypeScript 5.6, Vitest 4.1 (jsdom), Testing Library, Playwright 1.49 với axe-core. `.npmrc` bật `legacy-peer-deps` vì npm 10 lỗi khi giải phụ thuộc ngang hàng tùy chọn của jsdom; không ảnh hưởng bản build.

Đề xuất: Vite, React 18, TypeScript. Test đơn vị bằng Vitest, test giao diện bằng Playwright (Chromium và WebKit để có hành vi gần Safari iOS).

Lý do: app tĩnh, mở bằng một URL (trang mới, vẫn chạy được trong iframe), không cần render phía server; Vite cho bản build tĩnh gọn để khách tự host. TypeScript giúp giữ đúng hợp đồng dữ liệu khi khách đổi nguồn dữ liệu. Playwright chụp được ảnh ở nhiều khổ màn hình để làm bằng chứng cho mục acceptance `[claude]`.

Phương án khác: Vue 3 hoặc Svelte đều phù hợp. Chọn theo kỹ năng của người sẽ bảo trì sau bàn giao.

## QD-02 Điều hướng bằng hash

Trạng thái: Đã chốt (08/10/2026)

Dùng route dạng `#/hoc`, `#/thu-vien`. App được host tĩnh và trang học chính mở nó bằng một URL ở trang mới (APP-09, chốt 10/10/2026; app vẫn chạy được trong iframe); route bằng hash không cần cấu hình server và không làm hỏng URL mà trang chính nạp vào. Bảng route nằm ở `fe/src/app/spec.md` (APP-04).

## QD-03 Không phụ thuộc backend

Trạng thái: Đã chốt. Đợt 5: QD-06 (đề xuất) thay phần đăng nhập và tiến độ; dữ liệu câu vẫn là file tĩnh.

Khách không cung cấp mã nguồn và không mở API, nhưng đã gửi bộ dữ liệu đầy đủ (lưu ở `fe/public/data/`). Mọi dữ liệu đọc qua lớp `DataSource` (DATA-05): khi phát triển và demo đọc bộ đầy đủ, khi test đọc fixture. Tính năng Chia sẻ của bản cũ (cần `/api/sharing/*`) bị bỏ.

## QD-04 Bộ icon

Trạng thái: Đã chốt (08/10/2026)

Phosphor Icons, nét Regular. Bản cũ cũng đã tải Phosphor, nên khách quen với hình dạng icon này. Dùng gói `@phosphor-icons/react`.

## QD-05 Font

Trạng thái: Đã chốt (08/10/2026)

Lexend cho giao diện và câu gốc, Literata cho nghĩa tiếng Việt, Noto Sans theo từng hệ chữ khác (FND-04). Tự host font trong bản build để app chạy được ngoại tuyến và không phụ thuộc Google Fonts. Dùng các gói `@fontsource/*`; Lexend và Literata nạp sẵn (phần chữ Latinh và tiếng Việt), Noto nạp khi chọn ngôn ngữ cần (`fe/src/foundation/fonts.ts`).

## QD-06 Đăng nhập và lưu tiến độ bằng Supabase

Trạng thái: Đề xuất (20/10/2026, Đợt 5). Khi chốt, QD-03 hết hiệu lực ở phần đăng nhập và tiến độ; dữ liệu câu vẫn là file JSON tĩnh như QD-03.

Bối cảnh: danh sách việc Đợt 5 của công ty yêu cầu website có đăng ký, đăng nhập (việc 5) và phân biệt trang công khai với trang cần đăng nhập. Nhóm chọn dùng dịch vụ có sẵn thay vì tự viết server, và lưu tiến độ lên server để học tiếp được trên máy khác.

Đề xuất:

- Supabase Auth, đăng nhập bằng email và mật khẩu. Thư viện `@supabase/supabase-js` bản 2.
- Tiến độ và cài đặt lưu ở hai bảng Postgres của Supabase, mỗi dòng gắn `user_id`; bật Row Level Security để mỗi người chỉ đọc và ghi được dòng của mình. Thiết kế bảng ghi ở DATA-06 khi sửa spec DATA.
- Lớp `ProgressStore` (DATA-06) có thêm một cài đặt dùng Supabase. localStorage vẫn giữ làm bản sao trên máy để app chạy khi ngoại tuyến (APP-10) và đồng bộ lên server khi có mạng lại.
- Cấu hình lúc build bằng `VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY`. Anon key được phép nằm trong mã phía trình duyệt vì quyền truy cập do Row Level Security quyết định; không bao giờ đưa service role key vào repo hay bản build.
- Test tự động không gọi Supabase thật: chế độ fixture dùng một cài đặt đăng nhập và tiến độ chạy trong bộ nhớ, để CI chạy được không cần tài khoản.
- App vẫn là trang tĩnh nên vẫn host được trên GitHub Pages; Supabase là phần backend duy nhất.

Cần công ty cung cấp: một project Supabase (ai giữ tài khoản, gói miễn phí hay trả phí), URL và anon key cho bản chạy thử, có bắt xác nhận email khi đăng ký không, địa chỉ trang cho email đặt lại mật khẩu.

Rủi ro: trang học chính `language.pomaskhoahocnaobo.com` đã có tài khoản riêng (`docs/legacy/README.md`). Nếu người học vẫn vào app từ trang học chính thì họ phải có hai tài khoản. Cần công ty xác nhận website mới thay thế hay chạy song song với trang học chính.

Phương án khác: Firebase Auth với Firestore (tương đương, dữ liệu dạng document thay vì bảng); tự viết server Node với SQLite (toàn quyền nhưng phải tự host và tự lo bảo mật).

## QD-07 Website có Landing, trang công khai và trang cần đăng nhập

Trạng thái: Đề xuất (20/10/2026, Đợt 5). Khi chốt, APP-09 (app chạy không cần đăng nhập) và mục Phạm vi của `docs/new/ui-spec.md` (đăng ký, đăng nhập ngoài phạm vi) phải sửa theo.

Bối cảnh: việc 4 và 6 của Đợt 5 định hướng "App phục vụ học thường xuyên, Web phục vụ giới thiệu sản phẩm, tiếp cận khách hàng và bán hàng". Sản phẩm chuyển từ mini app mở từ trang học chính sang website độc lập có trang giới thiệu.

Đề xuất:

- Giữ route bằng hash (QD-02) vì app vẫn host tĩnh. Thêm route công khai: `#/` Landing, `#/dang-nhap`, `#/dang-ky`. Mọi route hiện có trong APP-04 thành route cần đăng nhập.
- Chưa đăng nhập mà mở route cần đăng nhập: chuyển tới `#/dang-nhap`, đăng nhập xong quay về đúng route đã định mở. Đã đăng nhập mà mở `#/`, `#/dang-nhap` hoặc `#/dang-ky`: chuyển vào `#/hoc` (hoặc `#/chon-ngon-ngu` nếu chưa chọn ngôn ngữ, APP-05).
- Landing và hai trang đăng nhập, đăng ký nằm ngoài khung app (không có thanh tab, thanh điều hướng dọc), dùng chung token màu, chữ, nút của FND và C3.
- Landing chỉ dùng thông tin có thật: số ngôn ngữ và số câu lấy từ dữ liệu, ảnh chụp màn hình thật của app. Chưa có thông tin đối tác thì không hiện phần Đối tác, không dựng logo hay lời nhận xét mẫu.
- Nút "Quay lại trang học" (APP-12) giữ hay bỏ: chờ công ty trả lời ở câu hỏi rủi ro của QD-06.

## QD-08 AI nhận xét bài luyện tập

Trạng thái: Đề xuất (20/10/2026). Để sau, không làm trong Đợt 5.

Việc 9 của Đợt 5 (AI phân tích câu trả lời và góp ý) cần gọi một mô hình AI bằng khóa bí mật. Khóa không được nằm trong mã phía trình duyệt, nên phải có một hàm chạy phía server (ví dụ Supabase Edge Function, sau khi QD-06 chốt). Ngoài ra còn phải chốt chi phí cho mỗi lượt gọi, dạng bài nào được nhận xét (dạng hiện có chủ yếu là trắc nghiệm và sắp xếp, ít chỗ để nhận xét tự do) và tiêu chí nhận xét. Ghi ở mục Câu hỏi mở của `docs/new/ui-spec.md`.
