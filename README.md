# VITASR Đa ngôn ngữ: làm lại giao diện

Làm lại giao diện app học câu "ĐA NGÔN NGỮ" của VITASR thành một website: trang giới thiệu cho khách, đăng ký, đăng nhập, và khu học cho người đã đăng nhập. Repo gồm: tài liệu bản cũ, spec bản mới chia theo từng trang và thành phần, điều kiện nghiệm thu cho từng phần, code (Next.js, React, TypeScript, Tailwind) viết theo spec, test tự động gắn với mục nghiệm thu, và một script giữ ánh xạ giữa spec, code và nghiệm thu.

**Spec là nguồn chân lý duy nhất.** Người sửa spec, code đi theo spec. Quy trình đầy đủ: `docs/QUY-TRINH.md`. Quyết định kỹ thuật: `docs/QUYET-DINH.md`.

## Đọc theo thứ tự này

1. `docs/legacy/README.md`: bản cũ là gì, lấy thông tin bằng cách nào, mức tin cậy.
2. `docs/legacy/navigation.md` và `docs/legacy/ui-spec.md`: sơ đồ điều hướng và spec giao diện bản cũ.
3. `docs/new/san-pham.md`: sản phẩm là gì, cho ai, gồm những trang nào.
4. `docs/new/ui-spec.md`: tổng quan bản mới, mục tiêu, phạm vi, chỉ mục spec.
5. `docs/new/navigation.md`: sơ đồ điều hướng bản mới.
6. `docs/new/mapping-legacy.md`: đối chiếu từng chức năng mới với bản cũ và nguồn dữ liệu.
7. `spec.md` và `acceptance.md` trong từng thư mục dưới `docs/spec/`.

## Cấu trúc

```
.
├── CLAUDE.md                     quy tắc cho Claude khi làm trong repo
├── package.json                  lệnh chạy app, test, build và kiểm spec
├── next.config.ts                cấu hình Next.js (next-intl, mã bản build cho service worker)
├── vitest.config.ts              test đơn vị (jsdom)
├── playwright.config.ts          test giao diện chạy trên bản build
├── .env.example                  biến môi trường, chép thành .env.local
├── supabase/migrations/          bảng và quyền trên Supabase (chạy một lần)
├── scripts/
│   ├── spec.mjs                  truy vết spec, acceptance, code, test (chỉ dùng thư viện chuẩn của Node)
│   ├── check-messages.mjs        kiểm câu chữ vi.json và en.json cùng khóa, cùng biến, không thiếu khóa đang dùng
│   ├── copy-fonts.mjs            chép font chữ viết từ node_modules vào public/fonts (chạy trước dev, build)
│   └── make-fixtures.mjs         tạo fixture từ bộ dữ liệu đầy đủ
├── public/data/                  bộ dữ liệu đầy đủ khách gửi (15 ngôn ngữ Fluency, Global English)
├── fixtures/                     tập con cho test (DATA-09); progress/ là tiến độ mẫu 30 ngày và số liệu tính tay cho T4
├── tests/
│   ├── unit/                     test Vitest (dữ liệu, thành phần, trang), gắn @ac
│   └── e2e/                      test Playwright trên bản build, gắn @ac; evidence*.spec.ts sinh ảnh bằng chứng
├── src/
│   ├── app/                      route của Next.js (mỏng, chỉ gọi view)
│   │   ├── [locale]/(public)/    Landing (/), Đăng nhập (/dang-nhap), Đăng ký (/dang-ky)
│   │   ├── [locale]/(workspace)/ khu học, cần đăng nhập: /hoc, /luyen-tap, /thu-vien, /tien-do, /cai-dat, ...
│   │   ├── robots.ts, sitemap.ts, opengraph-image.tsx, icon.tsx   SEO (APP-16)
│   │   └── sw.js/route.ts        service worker (APP-10)
│   ├── views/                    giao diện từng trang, mỗi trang một thư mục (index.tsx, utils/, hooks/)
│   ├── components/
│   │   ├── ui/                   nút, thẻ, ô nhập, ô chọn, bảng, sheet, tiêu đề trang
│   │   ├── status/               đang tải, lỗi, không có dữ liệu
│   │   ├── layout/               khung khu học, header và footer công khai, đổi ngôn ngữ, đổi giao diện
│   │   └── learning/             thẻ câu, dải 8 ô, lựa chọn trắc nghiệm, thẻ Unit
│   ├── services/                 auth-services, sync-services, content-services (api-url.ts, api.ts, type.ts)
│   ├── providers/                react-query, giao diện sáng tối, tài khoản, thông báo, dữ liệu học
│   ├── domain/                   hợp đồng dữ liệu, tiến độ, phiên học, thống kê (không phụ thuộc React)
│   ├── hooks/, lib/, utils/      hook dùng chung, tiện ích, định dạng ngày và số
│   ├── i18n/, messages/          next-intl; câu chữ tiếng Việt (vi.json) và tiếng Anh (en.json)
│   ├── styles/                   token màu, chữ, khoảng cách (Tailwind 4, @theme)
│   └── proxy.ts                  chọn ngôn ngữ giao diện theo cookie, không thêm tiền tố vào URL
└── docs/
    ├── QUY-TRINH.md              ID, ánh xạ, ai kiểm gì, khi nào được chấp nhận
    ├── QUYET-DINH.md             quyết định kỹ thuật (QD-xx)
    ├── spec/                     spec và nghiệm thu từng khu vực
    │   ├── app/  foundation/  data/                 APP khung app, FND nền tảng thiết kế, DATA dữ liệu
    │   ├── C1-the-cau/ ... C8-chon-gia-tri/         thành phần dùng chung
    │   ├── LP-landing/  AU-tai-khoan/               trang công khai
    │   └── S1-... T1-... S3-... T2-... S5-... T3-... S10-... T4-... S8-... S9-...   màn trong khu học
    ├── legacy/                   bản cũ (tham khảo, không phải yêu cầu)
    ├── new/                      bản mới: tổng quan (khu vực G), sản phẩm, sơ đồ điều hướng, đối chiếu bản cũ
    ├── evidence/                 ảnh chụp, bằng chứng nghiệm thu
    ├── thu-that/                 kịch bản thử thật cho các mục [human]
    ├── theo-doi/                 báo cáo từng đợt, checklist chức năng, bản đồ màn hình
    └── generated/                do script sinh ra, không sửa tay
```

Mỗi thư mục dưới `docs/spec/` có `spec.md` (yêu cầu `<ID>-NN`) và `acceptance.md` (mục kiểm `<ID>-ACNN`). File code ghi `@spec <ID>` cho yêu cầu nó hiện thực, test ghi `@ac <ID>` cho mục nghiệm thu nó kiểm.

## Lệnh

Cần Node 20.9 trở lên.

```bash
npm install               # cài thư viện
cp .env.example .env.local   # điền biến môi trường (để trống Supabase thì chạy chế độ thử trên máy)
npm run dev               # chạy app: http://localhost:3000
npm run lint              # ESLint
npm run typecheck         # kiểm kiểu TypeScript
npm run messages:check    # kiểm câu chữ tiếng Việt và tiếng Anh
npm test                  # test Vitest (tests/unit), chạy theo giờ Việt Nam
npm run build             # build Next.js ra .next/
npm run test:e2e          # test Playwright trên bản build (cần build trước; tự chạy next start ở cổng 4173)
npm run evidence          # chụp ảnh bằng chứng vào docs/evidence/ (cần build trước)
npm run spec:check        # kiểm ánh xạ spec, acceptance, code, test, sơ đồ; thoát mã 1 nếu có lỗi
npm run spec:trace        # sinh docs/generated/traceability.md
npm run spec:acceptance   # sinh docs/generated/acceptance-report.md
```

Lần đầu chạy Playwright trên máy mới: `npx playwright install chromium`. Máy đã có sẵn Chromium thì có thể trỏ tới nó bằng biến `PW_CHROMIUM_PATH`. Chạy thêm trên WebKit (gần Safari iOS): `npx playwright install webkit` rồi `PW_WEBKIT=1 npx playwright test --project=webkit`; CI chạy WebKit trong job riêng, chưa chặn việc gộp.

## Biến môi trường

Chép `.env.example` thành `.env.local` (không đưa lên git). Mọi biến đều có thể để trống.

| Biến | Dùng cho | Để trống thì |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Địa chỉ công khai của website: canonical, sitemap, ảnh chia sẻ (APP-16) | Dùng địa chỉ Vercel, nếu không có thì `http://localhost:3000` |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Đăng nhập và đồng bộ tiến độ (QD-06, DATA-14) | Chế độ thử trên máy: tài khoản và tiến độ chỉ nằm trong trình duyệt này (AU-06), trang Cài đặt ghi rõ điều này |
| `NEXT_PUBLIC_DATA_BASE_URL` | Nơi đặt bộ dữ liệu câu (DATA-05) | `/data` (thư mục `public/data`) |
| `NEXT_PUBLIC_HOST_URL` | Liên kết "Trang học chính" (APP-12) | Ẩn liên kết; xóa hẳn dòng này thì dùng `https://language.pomaskhoahocnaobo.com/` |

## Cài Supabase (một lần)

1. Tạo project trên Supabase. Ở Project Settings > API, chép Project URL và khóa `anon` `public` vào hai biến `NEXT_PUBLIC_SUPABASE_*`. Không dùng khóa `service_role` ở app.
2. Ở SQL Editor, chạy nội dung `supabase/migrations/0001_init.sql`: tạo bảng `user_settings`, `user_progress`, bật Row Level Security để mỗi người chỉ đọc, ghi dòng của mình.
3. Ở Authentication > URL Configuration, đặt Site URL là địa chỉ website. Có bật xác nhận email hay không là việc nhóm quyết (câu hỏi mở 2 ở `docs/new/ui-spec.md`); app xử lý được cả hai cách (AU-02, AU-04).

## Triển khai (Vercel)

Nối repo với Vercel (Add New > Project > chọn repo, framework Next.js tự nhận). Ở Settings > Environment Variables, thêm các biến ở bảng trên cho Production và Preview. Mỗi lần push lên main, Vercel build và đưa bản mới lên; mỗi pull request có một bản xem trước. Mã bản build lấy từ commit (`VERCEL_GIT_COMMIT_SHA`), service worker dựa vào đó để báo có bản mới (APP-10). Nối Vercel là đưa app và bộ dữ liệu của khách lên một địa chỉ web công khai, nên làm sau khi nhóm quyết repo công khai hay riêng tư. Bản này dùng để thử trên điện thoại và máy tính thật theo `docs/thu-that/README.md`.

## Trạng thái hiện tại (21/10/2026)

- Đợt 6 (báo cáo ở `docs/theo-doi/bao-cao-dot6.md`): chuyển sang Next.js theo bộ quy tắc leader gửi ngày 20/10/2026; URL không còn `#` (đường dẫn cũ dạng `#/...` tự chuyển sang đường dẫn mới); Landing, đăng ký, đăng nhập, khu học cần đăng nhập; đồng bộ cài đặt và tiến độ với Supabase; giao diện tiếng Việt và tiếng Anh; khung khu học có thanh bên; SEO. AI nhận xét bài luyện tập (QD-08) để sau.
- Spec: 24 khu vực, 178 yêu cầu, 242 mục nghiệm thu; 216 mục đạt, 26 mục `[human]` chờ thử thật. Tình trạng từng mục: `npm run spec:acceptance` rồi mở `docs/generated/acceptance-report.md`.
- Các mục `[human]` cần thiết bị thật, người học thật, người ngoài nhóm, khách hoặc trang học chính thật; cách thử từng mục ở `docs/thu-that/README.md`.
- Câu hỏi còn chờ công ty trả lời: `docs/new/ui-spec.md` mục 5.
