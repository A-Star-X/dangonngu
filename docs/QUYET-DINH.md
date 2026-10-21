# Quyết định kỹ thuật

Mỗi quyết định có trạng thái: **Đề xuất** (chờ nhóm chốt), **Đã chốt**, **Bỏ**. Quyết định ở trạng thái Đề xuất chưa được dùng để viết code.

## QD-01 Công nghệ front-end

Trạng thái: Đã chốt lại (20/10/2026, Đợt 6). Bản 08/10/2026 (Vite 6, React 18) thay bằng bản dưới đây để theo rule công nghệ chung của nhóm (`technologies.md` do leader gửi); người giữ repo chọn "Chuyển sang Next.js" khi được hỏi ngày 20/10/2026.

Phiên bản dùng: Next.js 16.2.9 (App Router, Turbopack), React 19.2.4, TypeScript 5 (`strict`), Tailwind CSS 4 (`@tailwindcss/postcss`), next-intl 4, @tanstack/react-query 5, react-hook-form 7 với @hookform/resolvers 5 và zod 4, react-toastify 11, lucide-react, clsx và tailwind-merge (`cn` ở `src/lib/utils.ts`), ESLint 9 với eslint-config-next 16.2.9. Test đơn vị bằng Vitest 4 (jsdom) và Testing Library; test giao diện bằng Playwright với axe-core (Chromium; WebKit chạy riêng, không chặn gộp).

Cấu trúc theo rule: route mỏng trong `src/app` (nhóm `(public)` và `(workspace)`), giao diện trong `src/views/<trang>`, thành phần dùng chung trong `src/components/ui`, `src/components/status`, `src/components/layout`, `src/components/learning`; gọi dịch vụ trong `src/services/<chức-năng>-services/{api-url,api,type}.ts`; helper thuần trong `src/utils`; quy tắc học (lộ trình, ôn tập, phiên, tiến độ) giữ nguyên từ bản cũ trong `src/domain`. Thứ tự provider: query client → theme → auth → toast.

Lý do: thống nhất với các dự án khác của nhóm (cùng cấu trúc, cùng component, cùng cách review), có SEO cho Landing (metadata, sitemap, ảnh chia sẻ) mà bản Vite tĩnh không làm gọn được, và có route thật không cần dấu `#` (việc 10).

## QD-02 Route là đường dẫn thật

Trạng thái: Đã chốt lại (20/10/2026, Đợt 6). Thay quyết định 08/10/2026 (route bằng hash `#/hoc`).

Route là đường dẫn (`/hoc`, `/thu-vien?xem=cau`), không có tiền tố ngôn ngữ giao diện (next-intl `localePrefix: "never"`, QD-09). Bảng route ở `docs/spec/app/spec.md` (APP-04). Liên kết cũ dạng `#/...` được chuyển sang đường dẫn mới khi mở (APP-04), để đường dẫn người học đã lưu vẫn dùng được. Lý do: việc 10 của danh sách cải thiện (dấu `#` trên URL, liên kết neo), SEO cho trang công khai (QD-07), và rule công nghệ dùng Next.js App Router. Hệ quả: website cần máy chủ chạy Next.js (QD-10), không còn host trên GitHub Pages.

## QD-03 Không phụ thuộc backend

Trạng thái: Đã chốt (08/10/2026). Từ Đợt 6 phần đăng nhập và tiến độ theo QD-06; dữ liệu câu vẫn là file tĩnh.

Khách không cung cấp mã nguồn và không mở API, nhưng đã gửi bộ dữ liệu đầy đủ (lưu ở `public/data/`). Mọi dữ liệu câu đọc qua lớp `DataSource` (DATA-05): website đọc bộ đầy đủ, test đơn vị đọc fixture. Tính năng Chia sẻ của bản cũ (cần `/api/sharing/*`) bị bỏ. Không tạo `src/app/api` làm bản sao backend (rule services).

## QD-04 Bộ icon

Trạng thái: Đã chốt lại (20/10/2026, Đợt 6). Thay Phosphor (08/10/2026).

`lucide-react` theo rule công nghệ của nhóm. Icon 16 px trên thanh bên và nút nhỏ, 20 px trong nút và dòng (FND-10).

## QD-05 Font

Trạng thái: Đã chốt (08/10/2026); cách nạp cập nhật ở Đợt 6.

Lexend cho giao diện và câu gốc, Literata cho nghĩa tiếng Việt, Noto Sans theo từng hệ chữ khác (FND-04). Tự host font để app chạy được ngoại tuyến và không phụ thuộc Google Fonts. Dùng các gói `@fontsource/*`: Lexend và Literata (phần chữ Latinh và tiếng Việt) nạp ở layout gốc (`src/styles/fonts.ts`); Noto chép vào `public/fonts` lúc build (`scripts/copy-fonts.mjs`, không đưa lên git) và nạp khi chọn ngôn ngữ cần (`src/lib/script-fonts.ts`).

## QD-06 Đăng nhập và lưu tiến độ bằng Supabase

Trạng thái: Đã chốt (20/10/2026): người giữ repo chọn "Supabase theo QD-06". QD-03 hết hiệu lực ở phần đăng nhập và tiến độ; dữ liệu câu vẫn là file JSON tĩnh như QD-03. Đã làm ở Đợt 6: AU (tài khoản), DATA-14 (đồng bộ).

Bối cảnh: danh sách việc Đợt 5 của công ty yêu cầu website có đăng ký, đăng nhập (việc 5) và phân biệt trang công khai với trang cần đăng nhập. Nhóm chọn dùng dịch vụ có sẵn thay vì tự viết server, và lưu tiến độ lên server để học tiếp được trên máy khác.

Đề xuất:

- Supabase Auth, đăng nhập bằng email và mật khẩu. Thư viện `@supabase/supabase-js` bản 2.
- Tiến độ và cài đặt lưu ở hai bảng Postgres của Supabase (`user_settings`, `user_progress`), mỗi dòng gắn `user_id`; bật Row Level Security để mỗi người chỉ đọc và ghi được dòng của mình. File tạo bảng: `supabase/migrations/0001_init.sql`. Cách gộp khi đồng bộ: DATA-14.
- localStorage vẫn giữ làm bản trên máy để app chạy khi ngoại tuyến (APP-10) và đồng bộ lên tài khoản khi có mạng lại (DATA-14).
- Cấu hình bằng `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` (`.env.local` khi chạy trên máy, biến môi trường của Vercel khi triển khai). Anon key được phép nằm trong mã phía trình duyệt vì quyền truy cập do Row Level Security quyết định; không bao giờ đưa service role key vào repo hay bản build.
- Chưa cấu hình hai biến trên thì app chạy chế độ thử, tài khoản lưu trên máy (AU-06). Test tự động chạy ở chế độ này, không gọi Supabase thật.
- Website chạy trên máy chủ Next.js (QD-10); Supabase là phần backend duy nhất.

Project Supabase (20/10/2026): giai đoạn phát triển dùng project Supabase cá nhân của Nguyễn Đình Đạt. Project chính thức của công ty tính sau; khi chuyển chỉ đổi `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` và chạy lại file tạo bảng, không sửa code. Vì vậy:

- Không đưa URL hay key của project cá nhân vào repo: đặt trong `.env.local` (đã có trong `.gitignore`) hoặc biến môi trường của Vercel. `.env.example` chỉ ghi tên biến.
- Mọi bảng, Row Level Security và cấu hình Auth phải ghi thành file SQL trong repo, không chỉ bấm tay trên giao diện Supabase, để dựng lại y hệt trên project của công ty.
- Tài khoản và tiến độ tạo trên project cá nhân là dữ liệu thử, không chuyển sang project của công ty.

Còn cần công ty quyết khi chuyển sang project chính thức: ai giữ tài khoản, gói miễn phí hay trả phí, có bắt xác nhận email khi đăng ký không, địa chỉ trang cho email đặt lại mật khẩu.

Rủi ro: trang học chính `language.pomaskhoahocnaobo.com` đã có tài khoản riêng (`docs/legacy/README.md`). Nếu người học vẫn vào app từ trang học chính thì họ phải có hai tài khoản. Cần công ty xác nhận website mới thay thế hay chạy song song với trang học chính.

Phương án khác: Firebase Auth với Firestore (tương đương, dữ liệu dạng document thay vì bảng); tự viết server Node với SQLite (toàn quyền nhưng phải tự host và tự lo bảo mật).

## QD-07 Website có Landing, trang công khai và trang cần đăng nhập

Trạng thái: Đã chốt (20/10/2026) cùng QD-06; làm ở Đợt 6: LP (Landing), AU (đăng nhập, đăng ký), APP-04, APP-09 đã sửa theo.

Bối cảnh: việc 4 và 6 của Đợt 5 định hướng "App phục vụ học thường xuyên, Web phục vụ giới thiệu sản phẩm, tiếp cận khách hàng và bán hàng". Sản phẩm chuyển từ mini app mở từ trang học chính sang website độc lập có trang giới thiệu.

Đề xuất:

- Route công khai: `/` Landing, `/dang-nhap`, `/dang-ky` (QD-02 bản mới: đường dẫn thật). Mọi route khu học trong APP-04 cần đăng nhập.
- Chưa đăng nhập mà mở route cần đăng nhập: chuyển tới `/dang-nhap?tiep=...`, đăng nhập xong quay về đúng route đã định mở. Đã đăng nhập mà mở `/dang-nhap` hoặc `/dang-ky`: chuyển vào `/hoc` (hoặc S1 nếu chưa chọn ngôn ngữ, APP-05). Đã đăng nhập vẫn xem được Landing (header hiện "Vào học").
- Landing và hai trang đăng nhập, đăng ký nằm ngoài khung khu học (C5), có header công khai riêng, dùng chung token màu, chữ, nút của FND và C3.
- Landing chỉ dùng thông tin có thật: số ngôn ngữ và số câu lấy từ dữ liệu, ảnh chụp màn hình thật của app. Chưa có thông tin đối tác thì không hiện phần Đối tác, không dựng logo hay lời nhận xét mẫu.
- Liên kết về trang học chính (APP-12) giữ ở chân thanh bên và chân trang; đặt `NEXT_PUBLIC_HOST_URL` rỗng để bỏ khi công ty trả lời website mới thay thế trang học chính (câu hỏi rủi ro của QD-06). Cập nhật 21/10/2026 theo người dùng: bỏ liên kết tới trang học chính và biến `NEXT_PUBLIC_HOST_URL`; chân thanh bên có liên kết "Trang chủ" về Landing (APP-12 bản 1.2).

## QD-08 AI nhận xét bài luyện tập

Trạng thái: Đã chốt để sau (20/10/2026): người giữ repo chọn "Để sau". Không làm trong Đợt 6.

Việc 9 của Đợt 5 (AI phân tích câu trả lời và góp ý) cần gọi một mô hình AI bằng khóa bí mật. Khóa không được nằm trong mã phía trình duyệt, nên phải có một hàm chạy phía server (ví dụ Supabase Edge Function). Ngoài ra còn phải chốt chi phí cho mỗi lượt gọi, dạng bài nào được nhận xét (dạng hiện có chủ yếu là trắc nghiệm và sắp xếp, ít chỗ để nhận xét tự do) và tiêu chí nhận xét. Ghi ở mục Câu hỏi mở của `docs/new/ui-spec.md`.

## QD-09 Hai ngôn ngữ giao diện

Trạng thái: Đã chốt (20/10/2026): người giữ repo chọn thêm tiếng Anh.

Giao diện tiếng Việt (mặc định) và tiếng Anh bằng next-intl 4 (APP-15): cookie `NEXT_LOCALE`, không tiền tố trên URL, chưa chọn thì tiếng Việt (không đoán theo ngôn ngữ trình duyệt vì người học là người Việt). Câu chữ ở `src/messages/vi.json` và `en.json`, viết tiếng Việt trước; `npm run messages:check` kiểm hai file cùng khóa, cùng biến và mọi khóa code dùng đều có. Nội dung học (nghĩa tiếng Việt, chủ đề, tình huống) không dịch.

## QD-10 Triển khai trên Vercel

Trạng thái: Đã chốt (20/10/2026, Đợt 6), theo QD-01, QD-02.

Next.js cần máy chủ (cookie ngôn ngữ, proxy chuyển route, ảnh tối ưu), nên website triển khai trên Vercel thay cho GitHub Pages; workflow `pages.yml` bỏ. Biến môi trường trên Vercel: `NEXT_PUBLIC_SITE_URL` (địa chỉ website, cho SEO), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, tùy chọn `NEXT_PUBLIC_DATA_BASE_URL`. Cách làm chi tiết: README mục Triển khai. Chạy được trên máy chủ Node bất kỳ bằng `npm run build && npm start` nếu công ty không dùng Vercel.

## QD-11 Ba môi trường: production, staging, demo

Trạng thái: Đã chốt (21/10/2026), theo yêu cầu của leader; người giữ repo chọn cách làm.

Bối cảnh: leader yêu cầu tách production, staging và demo thành các địa chỉ riêng; demo không có đăng nhập để người dùng vào dùng thử ngay.

Quyết định:

- Một repo, một bộ code. Môi trường chọn lúc build bằng `NEXT_PUBLIC_APP_ENV` (`production`, `staging`, `demo`; APP-17).
- Production: project Vercel hiện có, nhánh `main`, `NEXT_PUBLIC_APP_ENV=production`, có Supabase.
- Staging: cùng project Vercel, nhánh `staging` gắn địa chỉ riêng, biến môi trường Preview cho riêng nhánh `staging` với `NEXT_PUBLIC_APP_ENV=staging`. Việc mới vào `staging` trước; kiểm xong mới mở PR từ `staging` vào `main`.
- Demo: project Vercel thứ hai cùng repo, nhánh `main`, `NEXT_PUBLIC_APP_ENV=demo`, không đặt biến Supabase (AU-08). Demo luôn cùng bản với production.
- Staging và demo không cho máy tìm kiếm index (APP-17).

Còn cần quyết: staging dùng chung project Supabase với production hay project riêng (khuyên dùng riêng khi có project của công ty, QD-06); tên miền thật của công ty cho ba môi trường (tạm dùng địa chỉ `*.vercel.app`).

Phương án khác: mỗi môi trường một nhánh (`demo` riêng): linh hoạt hơn nhưng phải merge tay sang `demo`, dễ lệch với production; demo đi theo `staging`: có tính năng mới sớm hơn nhưng có thể chưa ổn định khi đưa khách xem.

