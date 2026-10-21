# Ma trận truy vết spec, code và acceptance

File sinh tự động bởi `node scripts/spec.mjs trace` lúc 2026-10-21 10:38 UTC. Không sửa tay.

Tổng: 180 yêu cầu, 246 mục acceptance, 659 ghi chú @spec/@ac trong code.

Yêu cầu chưa có code gắn @spec: 15/180.

## G Tổng quan giao diện bản mới

Spec: [docs/new/ui-spec.md](../../docs/new/ui-spec.md) · Acceptance: [docs/new/acceptance.md](../../docs/new/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| G-01 | Giao diện dễ hiểu dễ nhìn để sử dụng | G-AC01 | - | - | - |
| G-02 | Hiểu được tiến bộ của mình | G-AC02 | - | - | - |
| G-03 | Không nhầm thao tác đánh giá | G-AC03 | - | - | - |
| G-04 | Gọn hơn bản cũ | G-AC04 | - | - | - |
| G-05 | Không mang dấu hiệu giao diện do AI dựng mặc định | G-AC05 | - | - | - |

## APP Khung app

Spec: [docs/spec/app/spec.md](../../docs/spec/app/spec.md) · Acceptance: [docs/spec/app/acceptance.md](../../docs/spec/app/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| APP-01 | Bốn khu chính | APP-AC01, APP-AC02, APP-AC24 | docs/new/navigation.md:130<br>docs/new/navigation.md:322<br>docs/new/navigation.md:324<br>docs/new/navigation.md:326 | src/components/layout/app-shell.tsx:2<br>src/components/layout/brand.tsx:1 | tests/e2e/app.spec.ts:138<br>tests/unit/shell.test.tsx:172 |
| APP-02 | Header | APP-AC03, APP-AC17 | docs/new/navigation.md:56<br>docs/new/navigation.md:138<br>docs/new/navigation.md:140<br>docs/new/navigation.md:314<br>docs/new/navigation.md:316 | src/components/layout/app-shell.tsx:2<br>src/components/layout/theme-toggle.tsx:2 | tests/unit/app.test.tsx:236 |
| APP-03 | Màn học tập trung | APP-AC04 | docs/new/navigation.md:54 | src/components/layout/workspace-frame.tsx:2 | tests/unit/app.test.tsx:158 |
| APP-04 | Bảng route | APP-AC02, APP-AC05, APP-AC21, APP-AC22 | docs/new/navigation.md:56<br>docs/new/navigation.md:589 | src/app/[locale]/[...rest]/page.tsx:1<br>src/components/layout/client-boot.tsx:2<br>src/components/layout/workspace-frame.tsx:2<br>src/hooks/use-nav.ts:2<br>src/hooks/use-route.ts:2<br>src/i18n/navigation.ts:1<br>src/lib/route-memory.ts:1<br>src/lib/routes.ts:1 | tests/e2e/app.spec.ts:138<br>tests/e2e/app.spec.ts:161<br>tests/e2e/app.spec.ts:183<br>tests/e2e/dot5-dieu-huong.spec.ts:16<br>tests/e2e/dot5-dieu-huong.spec.ts:53<br>tests/unit/app.test.tsx:176<br>tests/unit/app.test.tsx:186<br>tests/unit/app.test.tsx:200<br>tests/unit/routes-guard.test.ts:8<br>tests/unit/routes-guard.test.ts:25<br>tests/unit/shell.test.tsx:172 |
| APP-05 | Khởi động | APP-AC06, APP-AC07 | docs/new/navigation.md:40<br>docs/new/navigation.md:42<br>docs/new/navigation.md:72<br>docs/new/navigation.md:74<br>docs/new/navigation.md:80<br>docs/new/navigation.md:82<br>docs/new/navigation.md:94<br>docs/new/navigation.md:96<br>docs/new/navigation.md:118<br>docs/new/navigation.md:126 | src/components/layout/workspace-frame.tsx:2<br>src/providers/learning-provider.tsx:2 | tests/unit/app.test.tsx:219 |
| APP-06 | Sheet Đổi ngôn ngữ | APP-AC08, APP-AC17 | docs/new/navigation.md:138<br>docs/new/navigation.md:314<br>docs/new/navigation.md:328 | src/components/layout/app-shell.tsx:2<br>src/components/layout/language-sheet.tsx:2<br>src/providers/learning-provider.tsx:2 | tests/unit/app.test.tsx:236 |
| APP-07 | Bố cục theo khổ màn hình | APP-AC09, APP-AC13, APP-AC25, APP-AC26 | - | - | tests/e2e/dot2.spec.ts:153<br>tests/e2e/dot5-responsive.spec.ts:17 |
| APP-08 | Trạng thái toàn cục | APP-AC07, APP-AC10, APP-AC11 | docs/new/navigation.md:76<br>docs/new/navigation.md:78<br>docs/new/navigation.md:98 | src/components/layout/banners.tsx:2<br>src/components/layout/workspace-frame.tsx:2<br>src/components/status/failed.tsx:2<br>src/components/status/loading.tsx:2<br>src/domain/storage.ts:1<br>src/hooks/use-online.ts:1<br>src/providers/learning-provider.tsx:2 | tests/unit/app.test.tsx:263<br>tests/unit/app.test.tsx:274<br>tests/unit/app.test.tsx:290 |
| APP-09 | Cách trang chính mở app | APP-AC12, APP-AC13, APP-AC20 | - | - | tests/unit/static-checks.test.ts:106 |
| APP-10 | Ngoại tuyến và cập nhật | APP-AC14, APP-AC15 | - | src/app/sw.js/route.ts:1<br>src/components/layout/client-boot.tsx:2<br>src/hooks/use-update-notice.ts:2<br>src/lib/updates.ts:1<br>src/services/content-services/api.ts:1 | tests/unit/s8.test.tsx:313<br>tests/unit/s8.test.tsx:340<br>tests/unit/s8.test.tsx:354 |
| APP-11 | Một lớp phủ tại một thời điểm | APP-AC16 | docs/new/navigation.md:58 | src/components/ui/sheet.tsx:2<br>src/views/huong-dan/index.tsx:2 | tests/unit/s8.test.tsx:374<br>tests/unit/t3.test.tsx:204 |
| APP-12 | Liên kết về trang chủ website | APP-AC18, APP-AC19 | docs/new/navigation.md:60 | src/components/layout/app-shell.tsx:2<br>src/components/layout/home-link.tsx:2 | tests/unit/shell.test.tsx:136<br>tests/unit/shell.test.tsx:151 |
| APP-13 | Không dùng liên kết neo | APP-AC23 | - | src/components/ui/app-link.tsx:2<br>src/lib/routes.ts:1 | tests/unit/dot5-unit.test.tsx:245<br>tests/unit/static-checks.test.ts:101 |
| APP-14 | Đường dẫn | APP-AC22, APP-AC24 | - | src/lib/route-memory.ts:1<br>src/views/chi-tiet-unit/index.tsx:2 | tests/e2e/dot5-dieu-huong.spec.ts:53 |
| APP-15 | Ngôn ngữ giao diện | S8-AC15, APP-AC27, APP-AC28, APP-AC30 | - | src/app/[locale]/layout.tsx:1<br>src/components/layout/locale-switcher.tsx:2<br>src/i18n/navigation.ts:1<br>src/i18n/request.ts:1<br>src/i18n/routing.ts:1<br>src/lib/language-name.ts:1<br>src/proxy.ts:1<br>src/views/cai-dat/index.tsx:2<br>scripts/check-messages.mjs:1 | tests/e2e/dot6-web.spec.ts:30<br>tests/e2e/dot6-web.spec.ts:57<br>tests/unit/s8.test.tsx:250<br>tests/unit/shell.test.tsx:193<br>tests/unit/static-checks.test.ts:113 |
| APP-16 | SEO | APP-AC29 | - | src/app/[locale]/(workspace)/layout.tsx:1<br>src/app/[locale]/layout.tsx:1<br>src/app/apple-icon.tsx:1<br>src/app/icon.tsx:1<br>src/app/opengraph-image.tsx:1<br>src/app/robots.ts:1<br>src/app/sitemap.ts:1<br>src/lib/page.tsx:1<br>src/lib/seo.ts:1 | tests/e2e/dot6-web.spec.ts:71<br>tests/e2e/dot6-web.spec.ts:83 |
| APP-17 | Môi trường triển khai | APP-AC31, APP-AC32 | - | src/app/robots.ts:1<br>src/lib/app-env.ts:1<br>src/lib/seo.ts:1 | tests/unit/demo.test.tsx:89 |

## FND Nền tảng thiết kế

Spec: [docs/spec/foundation/spec.md](../../docs/spec/foundation/spec.md) · Acceptance: [docs/spec/foundation/acceptance.md](../../docs/spec/foundation/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| FND-01 | Token màu | FND-AC01, FND-AC02 | - | src/styles/globals.css:1<br>src/styles/theme.css:1 | tests/unit/foundation.test.ts:39<br>tests/unit/static-checks.test.ts:52<br>tests/unit/static-checks.test.ts:58<br>tests/unit/static-checks.test.ts:69 |
| FND-02 | Quy tắc dùng màu | FND-AC02, FND-AC03 | - | src/components/learning/status-icon.tsx:2<br>src/domain/status-tone.ts:1<br>src/styles/theme.css:1<br>src/utils/status-badge-colors.ts:1 | tests/unit/foundation.test.ts:39 |
| FND-03 | Sáng và tối | FND-AC04 | - | src/app/[locale]/layout.tsx:1<br>src/components/layout/theme-toggle.tsx:2<br>src/providers/theme-provider.tsx:2<br>src/styles/theme.css:1 | tests/e2e/app.spec.ts:84<br>tests/unit/foundation.test.ts:117<br>tests/unit/foundation.test.ts:136 |
| FND-04 | Font | FND-AC05 | - | src/app/[locale]/layout.tsx:1<br>src/lib/script-fonts.ts:1<br>src/styles/fonts.ts:1<br>src/styles/typography.css:1<br>scripts/copy-fonts.mjs:1 | - |
| FND-05 | Thang chữ | FND-AC06, FND-AC19 | - | src/styles/globals.css:1<br>src/styles/typography.css:1 | tests/unit/static-checks.test.ts:78<br>tests/unit/static-checks.test.ts:84<br>tests/unit/static-checks.test.ts:91 |
| FND-06 | Cỡ câu theo độ dài | FND-AC07 | - | src/lib/typography.ts:1 | tests/unit/foundation.test.ts:91 |
| FND-07 | Khoảng cách và lề | FND-AC08, FND-AC19 | - | - | - |
| FND-08 | Bo góc theo vai trò | FND-AC08 | - | src/styles/theme.css:1 | - |
| FND-09 | Đổ bóng | FND-AC08 | - | src/styles/theme.css:1 | - |
| FND-10 | Icon | FND-AC09 | - | - | - |
| FND-11 | Chuyển động | FND-AC10, FND-AC11 | - | src/providers/toast-provider.tsx:2<br>src/styles/theme.css:1 | tests/e2e/app.spec.ts:115 |
| FND-12 | Giọng văn và từ ngữ | FND-AC12, FND-AC13 | - | src/domain/text.ts:29 | tests/unit/speech.test.ts:100<br>tests/unit/speech.test.ts:107 |
| FND-13 | Quy tắc tránh giao diện kiểu AI | FND-AC14 | - | - | - |
| FND-14 | Trợ năng chung | APP-AC25, FND-AC15, FND-AC16, FND-AC17 | - | src/styles/typography.css:1 | tests/e2e/app.spec.ts:215<br>tests/e2e/dot2.spec.ts:18<br>tests/e2e/dot2.spec.ts:105<br>tests/e2e/dot5-responsive.spec.ts:17 |
| FND-15 | Thứ bậc chữ | FND-AC18 | - | src/styles/typography.css:1<br>src/views/kiem-tra/index.tsx:356<br>src/views/phien-hoc/index.tsx:235 | tests/e2e/dot5-chu.spec.ts:23<br>tests/e2e/dot5-chu.spec.ts:55 |
| FND-16 | Ô tìm kiếm chờ ngừng gõ | FND-AC20 | - | src/hooks/use-debounced-value.ts:1 | tests/unit/debounce-and-content.test.tsx:13<br>tests/unit/debounce-and-content.test.tsx:28<br>tests/unit/t2-t4.test.tsx:160<br>tests/unit/t2-t4.test.tsx:200<br>tests/unit/t3.test.tsx:182 |

## DATA Dữ liệu và tiến độ

Spec: [docs/spec/data/spec.md](../../docs/spec/data/spec.md) · Acceptance: [docs/spec/data/acceptance.md](../../docs/spec/data/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| DATA-01 | Manifest | DATA-AC01, DATA-AC16, DATA-AC19 | - | src/domain/catalog.ts:1<br>src/domain/contract.ts:1<br>src/domain/types.ts:1 | tests/unit/data.test.ts:41<br>tests/unit/data.test.ts:86<br>tests/unit/data.test.ts:100 |
| DATA-02 | File ngôn ngữ | DATA-AC01, DATA-AC02, DATA-AC19 | - | src/domain/contract.ts:1<br>src/domain/types.ts:1 | tests/unit/app.test.tsx:313<br>tests/unit/data.test.ts:41<br>tests/unit/data.test.ts:63<br>tests/unit/data.test.ts:100 |
| DATA-03 | File unit | DATA-AC01, DATA-AC03, DATA-AC16, DATA-AC19 | - | src/domain/contract.ts:1<br>src/domain/types.ts:1 | tests/unit/data.test.ts:41<br>tests/unit/data.test.ts:74<br>tests/unit/data.test.ts:86<br>tests/unit/data.test.ts:100 |
| DATA-04 | Trường tùy chọn | DATA-AC04, DATA-AC18 | - | src/domain/contract.ts:1<br>src/domain/library.ts:1<br>src/domain/types.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/app.test.tsx:439<br>tests/unit/components.test.tsx:113<br>tests/unit/t3.test.tsx:221<br>tests/unit/t3.test.tsx:237 |
| DATA-05 | Nguồn dữ liệu thay được | DATA-AC02, DATA-AC05 | docs/new/navigation.md:88 | src/domain/contract.ts:1<br>src/domain/source.ts:1<br>src/providers/learning-provider.tsx:2<br>src/services/content-services/api-url.ts:1<br>src/services/content-services/api.ts:1<br>src/services/content-services/type.ts:1 | tests/unit/app.test.tsx:313<br>tests/unit/data.test.ts:63 |
| DATA-06 | Lưu tiến độ | DATA-AC06, DATA-AC07, DATA-AC17, DATA-AC20 | - | src/domain/progress.ts:1<br>src/domain/session.ts:1<br>src/domain/storage.ts:1<br>src/domain/transfer.ts:1<br>src/providers/learning-provider.tsx:2 | tests/unit/app.test.tsx:290<br>tests/unit/data.test.ts:212<br>tests/unit/ra-soat.test.tsx:16<br>tests/unit/ra-soat.test.tsx:38<br>tests/unit/s3.test.tsx:256<br>tests/unit/s3.test.tsx:274 |
| DATA-07 | Quy tắc câu cần ôn | DATA-AC08, DATA-AC09, DATA-AC21 | - | src/domain/library.ts:1<br>src/domain/review.ts:1<br>src/domain/session.ts:1<br>src/domain/stats.ts:1<br>src/domain/units.ts:1 | tests/unit/app.test.tsx:392<br>tests/unit/data.test.ts:134<br>tests/unit/ra-soat.test.tsx:58<br>tests/unit/ra-soat.test.tsx:71<br>tests/unit/t2-t4.test.tsx:355 |
| DATA-08 | Đáp án nhiễu | DATA-AC10 | - | src/domain/distractors.ts:1<br>src/domain/text.ts:1 | tests/unit/data.test.ts:167 |
| DATA-09 | Fixture | DATA-AC11, DATA-AC12 | - | - | - |
| DATA-10 | Không gọi mạng ngoài phạm vi | DATA-AC13 | - | src/domain/source.ts:1<br>src/services/content-services/api.ts:1 | tests/e2e/app.spec.ts:193<br>tests/e2e/dot2.spec.ts:129 |
| DATA-11 | Lộ trình học | DATA-AC14 | - | src/domain/path.ts:1 | tests/unit/data.test.ts:182 |
| DATA-12 | Tìm kiếm | DATA-AC15, DATA-AC21 | - | src/domain/library.ts:1<br>src/domain/search.ts:1<br>src/domain/text.ts:1 | tests/unit/data.test.ts:191<br>tests/unit/ra-soat.test.tsx:58<br>tests/unit/ra-soat.test.tsx:71 |
| DATA-13 | Bộ nội dung | DATA-AC16, DATA-AC17 | docs/new/navigation.md:84 | src/domain/catalog.ts:1<br>src/domain/types.ts:1<br>src/providers/learning-provider.tsx:2 | tests/unit/data.test.ts:86<br>tests/unit/data.test.ts:212<br>tests/unit/s3.test.tsx:274 |
| DATA-14 | Đồng bộ với tài khoản | DATA-AC22, DATA-AC23, DATA-AC24, DATA-AC25 | - | src/domain/merge.ts:1<br>src/domain/owner.ts:1<br>src/lib/supabase.ts:1<br>src/providers/learning-provider.tsx:2<br>src/services/sync-services/api-url.ts:1<br>src/services/sync-services/api.ts:1<br>src/services/sync-services/type.ts:1<br>supabase/migrations/0001_init.sql:1 | tests/unit/merge.test.ts:36<br>tests/unit/merge.test.ts:48<br>tests/unit/merge.test.ts:61<br>tests/unit/merge.test.ts:88<br>tests/unit/merge.test.ts:96<br>tests/unit/merge.test.ts:112<br>tests/unit/merge.test.ts:128<br>tests/unit/merge.test.ts:144<br>tests/unit/merge.test.ts:159<br>tests/unit/sync.test.tsx:49<br>tests/unit/sync.test.tsx:96<br>tests/unit/sync.test.tsx:128 |

## C1 Thẻ câu

Spec: [docs/spec/C1-the-cau/spec.md](../../docs/spec/C1-the-cau/spec.md) · Acceptance: [docs/spec/C1-the-cau/acceptance.md](../../docs/spec/C1-the-cau/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C1-01 | Cấu trúc | C1-AC01 | - | src/components/learning/sentence-card.tsx:2 | - |
| C1-02 | Trạng thái che câu gốc | C1-AC02, C1-AC10 | - | src/components/learning/sentence-card.tsx:2 | tests/unit/components.test.tsx:24<br>tests/unit/ra-soat.test.tsx:190 |
| C1-03 | Trạng thái hiện đầy đủ | C1-AC03 | - | src/components/learning/sentence-card.tsx:2 | tests/unit/components.test.tsx:38 |
| C1-04 | Phát âm | C1-AC04, C1-AC05, C1-AC09 | - | src/components/learning/sentence-card.tsx:2<br>src/components/learning/use-speaker.ts:2<br>src/lib/speech.ts:1 | tests/unit/components.test.tsx:47<br>tests/unit/ra-soat.test.tsx:158 |
| C1-05 | Không có giọng đọc | C1-AC06 | docs/new/navigation.md:185<br>docs/new/navigation.md:332 | src/components/learning/sentence-card.tsx:2<br>src/components/learning/use-speaker.ts:2<br>src/lib/speech.ts:1 | tests/e2e/app.spec.ts:263<br>tests/unit/components.test.tsx:69<br>tests/unit/components.test.tsx:82 |
| C1-06 | Dòng Cách dùng | C1-AC07 | - | src/components/learning/sentence-card.tsx:2 | tests/unit/components.test.tsx:113 |
| C1-07 | Phiên âm | C1-AC07 | - | src/components/learning/sentence-card.tsx:2 | tests/unit/components.test.tsx:113 |
| C1-08 | Thuộc tính ngôn ngữ | C1-AC08 | - | src/components/learning/sentence-card.tsx:2 | tests/unit/components.test.tsx:137 |

## C2 Dải 8 ô

Spec: [docs/spec/C2-dai-8-o/spec.md](../../docs/spec/C2-dai-8-o/spec.md) · Acceptance: [docs/spec/C2-dai-8-o/acceptance.md](../../docs/spec/C2-dai-8-o/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C2-01 | Kích thước và số ô | C2-AC01 | - | src/components/learning/strip.tsx:2 | tests/e2e/app.spec.ts:40 |
| C2-02 | Trạng thái ô | C2-AC02 | - | src/components/learning/strip.tsx:2 | - |
| C2-03 | Trợ năng | C2-AC03 | - | src/components/learning/strip.tsx:2 | tests/unit/components.test.tsx:160 |

## C3 Nút

Spec: [docs/spec/C3-nut/spec.md](../../docs/spec/C3-nut/spec.md) · Acceptance: [docs/spec/C3-nut/acceptance.md](../../docs/spec/C3-nut/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C3-01 | Nút chính | C3-AC01 | - | src/components/ui/button-class.ts:1<br>src/components/ui/button.tsx:2 | - |
| C3-02 | Nút phụ | C3-AC01 | - | src/components/ui/button-class.ts:1<br>src/components/ui/button.tsx:2 | - |
| C3-03 | Cặp nút đánh giá | C3-AC02, C3-AC03 | docs/new/navigation.md:381<br>docs/new/navigation.md:383 | src/components/learning/rate-pair.tsx:2 | - |
| C3-04 | Trạng thái chung | C3-AC04 | - | src/components/ui/button.tsx:2 | tests/e2e/app.spec.ts:54<br>tests/unit/components.test.tsx:172 |

## C4 Lựa chọn trắc nghiệm

Spec: [docs/spec/C4-lua-chon/spec.md](../../docs/spec/C4-lua-chon/spec.md) · Acceptance: [docs/spec/C4-lua-chon/acceptance.md](../../docs/spec/C4-lua-chon/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C4-01 | Bố cục | C4-AC01 | - | src/components/learning/choices.tsx:2 | - |
| C4-02 | Chọn đáp án | C4-AC02 | - | src/components/learning/choices.tsx:2 | tests/unit/components.test.tsx:194<br>tests/unit/components.test.tsx:220 |
| C4-03 | Thông báo kết quả | C4-AC03 | - | src/components/learning/choices.tsx:2 | tests/unit/components.test.tsx:209<br>tests/unit/components.test.tsx:221 |

## C5 Khung khu học

Spec: [docs/spec/C5-khung-app/spec.md](../../docs/spec/C5-khung-app/spec.md) · Acceptance: [docs/spec/C5-khung-app/acceptance.md](../../docs/spec/C5-khung-app/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C5-01 | Thanh bên | C5-AC01 | docs/new/navigation.md:130<br>docs/new/navigation.md:322<br>docs/new/navigation.md:324<br>docs/new/navigation.md:326 | src/components/layout/app-shell.tsx:2 | - |
| C5-02 | Menu trượt trên màn hẹp | C5-AC02, C5-AC05 | - | src/components/layout/app-shell.tsx:2 | tests/e2e/dot6-web.spec.ts:194<br>tests/unit/shell.test.tsx:46<br>tests/unit/shell.test.tsx:90 |
| C5-03 | Mục đang chọn | C5-AC03 | - | src/components/layout/app-shell.tsx:2 | tests/e2e/app.spec.ts:139<br>tests/unit/shell.test.tsx:101 |
| C5-04 | Mục có số | C5-AC04 | - | src/components/layout/app-shell.tsx:2 | tests/unit/shell.test.tsx:121 |
| C5-05 | Header | C5-AC01, C5-AC05 | - | - | - |
| C5-06 | Vùng nội dung | C5-AC01 | - | - | - |
| C5-07 | Chân thanh bên | C5-AC06, APP-AC19 | docs/new/navigation.md:60 | src/components/layout/home-link.tsx:2 | tests/unit/shell.test.tsx:136 |

## C6 Sheet

Spec: [docs/spec/C6-sheet/spec.md](../../docs/spec/C6-sheet/spec.md) · Acceptance: [docs/spec/C6-sheet/acceptance.md](../../docs/spec/C6-sheet/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C6-01 | Dạng hiển thị | C6-AC01 | docs/new/navigation.md:58 | src/components/ui/sheet.tsx:2 | - |
| C6-02 | Tiêu đề và đóng | C6-AC02, C6-AC03, C6-AC06 | - | src/components/layout/workspace-frame.tsx:2<br>src/components/ui/sheet.tsx:2 | tests/unit/components.test.tsx:250<br>tests/unit/components.test.tsx:265<br>tests/unit/ra-soat.test.tsx:225<br>tests/unit/ra-soat.test.tsx:238 |
| C6-03 | Focus | C6-AC04 | - | src/components/ui/sheet.tsx:2 | tests/unit/components.test.tsx:275 |
| C6-04 | Nội dung dài | C6-AC05 | - | src/components/ui/sheet.tsx:2 | - |

## C7 Thông báo ngắn

Spec: [docs/spec/C7-thong-bao/spec.md](../../docs/spec/C7-thong-bao/spec.md) · Acceptance: [docs/spec/C7-thong-bao/acceptance.md](../../docs/spec/C7-thong-bao/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C7-01 | Vị trí và hiển thị | C7-AC01 | - | src/lib/toast.tsx:2<br>src/providers/toast-provider.tsx:2<br>src/styles/globals.css:19 | - |
| C7-02 | Thời gian và hành động | C7-AC02 | - | src/hooks/use-update-notice.ts:2<br>src/lib/toast.tsx:2<br>src/providers/toast-provider.tsx:2 | tests/unit/components.test.tsx:314 |
| C7-03 | Trợ năng | C7-AC03 | - | src/lib/toast.tsx:2 | tests/unit/components.test.tsx:339 |

## C8 Ô chọn một giá trị

Spec: [docs/spec/C8-chon-gia-tri/spec.md](../../docs/spec/C8-chon-gia-tri/spec.md) · Acceptance: [docs/spec/C8-chon-gia-tri/acceptance.md](../../docs/spec/C8-chon-gia-tri/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C8-01 | Nút mở | C8-AC01, C8-AC03 | - | src/components/ui/dropdown-select.tsx:2 | tests/unit/components.test.tsx:363<br>tests/unit/components.test.tsx:391 |
| C8-02 | Danh sách và bàn phím | C8-AC01 | - | src/components/ui/dropdown-select.tsx:2 | tests/unit/components.test.tsx:363<br>tests/unit/components.test.tsx:391 |
| C8-03 | Ô lọc trong danh sách dài | C8-AC02 | - | src/components/ui/dropdown-select.tsx:2 | tests/unit/components.test.tsx:407 |

## AU Tài khoản (đăng ký, đăng nhập)

Spec: [docs/spec/AU-tai-khoan/spec.md](../../docs/spec/AU-tai-khoan/spec.md) · Acceptance: [docs/spec/AU-tai-khoan/acceptance.md](../../docs/spec/AU-tai-khoan/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| AU-01 | Đăng nhập | AU-AC01, AU-AC08, AU-AC09 | docs/new/navigation.md:30<br>docs/new/navigation.md:34 | src/app/[locale]/(public)/layout.tsx:1<br>src/components/layout/auth-card.tsx:2<br>src/components/layout/public-header.tsx:2<br>src/lib/supabase.ts:1<br>src/providers/auth-provider.tsx:2<br>src/services/auth-services/api.ts:1<br>src/services/auth-services/type.ts:1<br>src/views/dang-nhap/hooks/mutation/use-sign-in.ts:2<br>src/views/dang-nhap/index.tsx:2<br>supabase/migrations/0001_init.sql:1 | tests/e2e/dot6-web.spec.ts:159<br>tests/unit/auth.test.tsx:39<br>tests/unit/auth.test.tsx:50 |
| AU-02 | Đăng ký | AU-AC03, AU-AC08, AU-AC09 | docs/new/navigation.md:30<br>docs/new/navigation.md:36 | src/components/layout/auth-card.tsx:2<br>src/providers/auth-provider.tsx:2<br>src/services/auth-services/api.ts:1<br>src/services/auth-services/type.ts:1<br>src/views/dang-ky/hooks/mutation/use-sign-up.ts:2<br>src/views/dang-ky/index.tsx:2<br>supabase/migrations/0001_init.sql:1 | tests/unit/auth.test.tsx:106<br>tests/unit/auth.test.tsx:125 |
| AU-03 | Kiểm tra dữ liệu nhập | AU-AC02, AU-AC03 | - | src/utils/email.ts:1<br>src/utils/regex.ts:1<br>src/views/dang-ky/index.tsx:2<br>src/views/dang-ky/utils/schema.ts:1<br>src/views/dang-nhap/index.tsx:2<br>src/views/dang-nhap/utils/schema.ts:1 | tests/e2e/dot6-web.spec.ts:178<br>tests/unit/auth.test.tsx:68<br>tests/unit/auth.test.tsx:106<br>tests/unit/auth.test.tsx:125 |
| AU-04 | Lỗi từ máy chủ | AU-AC04, AU-AC09 | - | src/lib/api-error.ts:1<br>src/lib/toast.tsx:2<br>src/services/auth-services/api.ts:1<br>src/views/dang-ky/hooks/mutation/use-sign-up.ts:2<br>src/views/dang-ky/index.tsx:2<br>src/views/dang-nhap/hooks/mutation/use-sign-in.ts:2<br>src/views/dang-nhap/index.tsx:2 | tests/unit/auth.test.tsx:91<br>tests/unit/auth.test.tsx:136 |
| AU-05 | Trang cần đăng nhập | AU-AC01, AU-AC05 | docs/new/navigation.md:28<br>docs/new/navigation.md:32<br>docs/new/navigation.md:34<br>docs/new/navigation.md:38<br>docs/new/navigation.md:62 | src/app/[locale]/(workspace)/layout.tsx:1<br>src/components/layout/app-shell.tsx:2<br>src/components/layout/workspace-frame.tsx:2<br>src/hooks/use-after-auth.ts:2<br>src/providers/auth-provider.tsx:2<br>src/services/auth-services/api.ts:1<br>src/services/auth-services/type.ts:1<br>src/views/cai-dat/index.tsx:2<br>src/views/dang-ky/index.tsx:2<br>src/views/dang-nhap/index.tsx:2 | tests/e2e/dot6-web.spec.ts:130<br>tests/e2e/dot6-web.spec.ts:159<br>tests/unit/auth.test.tsx:39<br>tests/unit/auth.test.tsx:50<br>tests/unit/auth.test.tsx:150<br>tests/unit/auth.test.tsx:159 |
| AU-06 | Chế độ trên máy | AU-AC06 | - | src/components/layout/app-shell.tsx:2<br>src/components/layout/auth-card.tsx:2<br>src/lib/supabase.ts:1<br>src/providers/auth-provider.tsx:2<br>src/services/auth-services/api-url.ts:1<br>src/services/auth-services/api.ts:1<br>src/services/auth-services/type.ts:1 | tests/e2e/dot6-web.spec.ts:129<br>tests/unit/auth.test.tsx:171<br>tests/unit/owner-auth.test.ts:66<br>tests/unit/owner-auth.test.ts:87<br>tests/unit/owner-auth.test.ts:98<br>tests/unit/owner-auth.test.ts:113 |
| AU-07 | Nhiều người trên một máy | AU-AC07 | - | src/components/layout/workspace-frame.tsx:2<br>src/domain/owner.ts:1 | tests/unit/auth.test.tsx:191<br>tests/unit/owner-auth.test.ts:13<br>tests/unit/owner-auth.test.ts:24<br>tests/unit/owner-auth.test.ts:49 |
| AU-08 | Bản dùng thử | AU-AC10, AU-AC11, APP-AC32 | - | src/components/layout/app-shell.tsx:2<br>src/components/layout/public-footer.tsx:1<br>src/components/layout/public-header.tsx:2<br>src/lib/app-env.ts:1<br>src/lib/supabase.ts:1<br>src/services/auth-services/api.ts:1<br>src/services/auth-services/type.ts:1<br>src/views/cai-dat/index.tsx:2<br>src/views/landing/index.tsx:1 | tests/unit/demo.test.tsx:33<br>tests/unit/demo.test.tsx:55<br>tests/unit/demo.test.tsx:64 |

## LP Landing

Spec: [docs/spec/LP-landing/spec.md](../../docs/spec/LP-landing/spec.md) · Acceptance: [docs/spec/LP-landing/acceptance.md](../../docs/spec/LP-landing/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| LP-01 | Header công khai và phần mở đầu | LP-AC01, LP-AC03, LP-AC04 | docs/new/navigation.md:22<br>docs/new/navigation.md:24<br>docs/new/navigation.md:26<br>docs/new/navigation.md:28 | src/app/[locale]/(public)/layout.tsx:1<br>src/components/layout/brand.tsx:1<br>src/components/layout/public-header.tsx:2<br>src/views/landing/index.tsx:1 | tests/e2e/dot6-web.spec.ts:110 |
| LP-02 | Người dùng hướng tới | LP-AC03, LP-AC04 | - | src/views/landing/index.tsx:1 | - |
| LP-03 | Số liệu thật | LP-AC02 | - | src/views/landing/index.tsx:1<br>src/views/landing/utils/content-stats.ts:1 | tests/unit/debounce-and-content.test.tsx:50<br>tests/unit/debounce-and-content.test.tsx:63 |
| LP-04 | Tính năng và lợi ích | LP-AC03, LP-AC04 | - | src/views/landing/index.tsx:1 | - |
| LP-05 | Ba bước bắt đầu | LP-AC03 | - | src/views/landing/index.tsx:1 | - |
| LP-06 | Lời mời cuối trang và chân trang | LP-AC03 | docs/new/navigation.md:24 | src/components/layout/public-footer.tsx:1<br>src/views/landing/index.tsx:1 | - |
| LP-07 | Bố cục theo khổ màn hình | LP-AC03 | - | - | - |

## S1 Chọn ngôn ngữ

Spec: [docs/spec/S1-chon-ngon-ngu/spec.md](../../docs/spec/S1-chon-ngon-ngu/spec.md) · Acceptance: [docs/spec/S1-chon-ngon-ngu/acceptance.md](../../docs/spec/S1-chon-ngon-ngu/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S1-01 | Danh sách và thứ tự | S1-AC01, S1-AC02, S1-AC06 | - | src/domain/catalog.ts:1<br>src/views/chon-ngon-ngu/index.tsx:2 | tests/unit/app.test.tsx:60 |
| S1-02 | Nội dung mỗi dòng | S1-AC02, S1-AC03 | - | src/components/layout/language-sheet.tsx:2<br>src/domain/catalog.ts:1<br>src/views/chon-ngon-ngu/index.tsx:2 | tests/unit/app.test.tsx:70 |
| S1-03 | Số câu | S1-AC02 | - | src/components/layout/language-sheet.tsx:2<br>src/domain/catalog.ts:1<br>src/views/chon-ngon-ngu/index.tsx:2 | - |
| S1-04 | Chọn | S1-AC04, S1-AC06, S1-AC07 | docs/new/navigation.md:44<br>docs/new/navigation.md:84<br>docs/new/navigation.md:90<br>docs/new/navigation.md:96<br>docs/new/navigation.md:120<br>docs/new/navigation.md:250<br>docs/new/navigation.md:256 | src/views/chon-ngon-ngu/index.tsx:2 | tests/unit/app.test.tsx:92<br>tests/unit/app.test.tsx:104<br>tests/unit/app.test.tsx:127 |
| S1-05 | Chú thích | S1-AC02 | - | src/views/chon-ngon-ngu/index.tsx:2 | - |
| S1-06 | Tải và lỗi | S1-AC05 | - | src/views/chon-ngon-ngu/index.tsx:2 | tests/unit/app.test.tsx:112 |
| S1-07 | Chọn bộ nội dung | S1-AC07, S1-AC08 | docs/new/navigation.md:40<br>docs/new/navigation.md:86<br>docs/new/navigation.md:88<br>docs/new/navigation.md:92<br>docs/new/navigation.md:122<br>docs/new/navigation.md:124<br>docs/new/navigation.md:250<br>docs/new/navigation.md:252<br>docs/new/navigation.md:254 | src/views/chon-ngon-ngu/index.tsx:2 | tests/unit/app.test.tsx:127 |

## S10 Chi tiết Unit

Spec: [docs/spec/S10-chi-tiet-unit/spec.md](../../docs/spec/S10-chi-tiet-unit/spec.md) · Acceptance: [docs/spec/S10-chi-tiet-unit/acceptance.md](../../docs/spec/S10-chi-tiet-unit/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S10-01 | Route và khung | S10-AC01, S10-AC08 | docs/new/navigation.md:512 | src/lib/routes.ts:1<br>src/views/chi-tiet-unit/index.tsx:2 | tests/unit/dot5-unit.test.tsx:84 |
| S10-02 | Đầu màn | S10-AC02, S10-AC08 | - | src/views/chi-tiet-unit/index.tsx:2 | tests/unit/dot5-unit.test.tsx:107 |
| S10-03 | Tiến độ unit | S10-AC03, S10-AC08 | - | src/domain/units.ts:1<br>src/views/chi-tiet-unit/index.tsx:2 | tests/unit/dot5-unit.test.tsx:119 |
| S10-04 | Hành động | S10-AC04, S10-AC07 | docs/new/navigation.md:171<br>docs/new/navigation.md:173<br>docs/new/navigation.md:506<br>docs/new/navigation.md:508 | src/lib/route-memory.ts:1<br>src/views/chi-tiet-unit/index.tsx:2 | tests/unit/dot5-unit.test.tsx:129<br>tests/unit/dot5-unit.test.tsx:183 |
| S10-05 | Danh sách câu | S10-AC05 | docs/new/navigation.md:175<br>docs/new/navigation.md:510 | src/components/learning/item-detail.tsx:2<br>src/views/chi-tiet-unit/index.tsx:2 | tests/unit/dot5-unit.test.tsx:155 |
| S10-06 | Unit trước và sau | S10-AC06 | - | src/views/chi-tiet-unit/index.tsx:2 | tests/unit/dot5-unit.test.tsx:168 |

## S3 Phiên học

Spec: [docs/spec/S3-phien-hoc/spec.md](../../docs/spec/S3-phien-hoc/spec.md) · Acceptance: [docs/spec/S3-phien-hoc/acceptance.md](../../docs/spec/S3-phien-hoc/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S3-01 | Nguồn câu của phiên | S10-AC04, S3-AC01 | - | src/domain/path.ts:1<br>src/views/phien-hoc/index.tsx:2 | tests/unit/dot5-unit.test.tsx:129<br>tests/unit/s3.test.tsx:16 |
| S3-02 | Khung phiên | S3-AC02, S3-AC07 | docs/new/navigation.md:181 | src/views/phien-hoc/index.tsx:2 | tests/unit/s3.test.tsx:47 |
| S3-03 | Bước ghi nhớ | S3-AC03, S3-AC07, S3-AC11 | docs/new/navigation.md:381<br>docs/new/navigation.md:383 | src/domain/session.ts:1<br>src/views/phien-hoc/index.tsx:2 | tests/unit/s3.test.tsx:47 |
| S3-04 | Bước kiểm tra | S3-AC04, S3-AC07, S3-AC11 | docs/new/navigation.md:385 | src/domain/session.ts:1<br>src/views/phien-hoc/index.tsx:2 | tests/unit/s3.test.tsx:81 |
| S3-05 | Gợi ý | S3-AC05, S3-AC12 | - | src/domain/session.ts:1<br>src/views/phien-hoc/index.tsx:2<br>src/views/phien-hoc/utils/hint.ts:1 | tests/unit/ra-soat.test.tsx:110<br>tests/unit/s3.test.tsx:100 |
| S3-06 | Tổng kết phiên | S3-AC06, S3-AC07 | docs/new/navigation.md:181<br>docs/new/navigation.md:393<br>docs/new/navigation.md:395 | src/domain/session.ts:1<br>src/views/phien-hoc/index.tsx:2 | tests/unit/s3.test.tsx:118 |
| S3-07 | Thoát giữa phiên | S3-AC08 | docs/new/navigation.md:387<br>docs/new/navigation.md:389<br>docs/new/navigation.md:391 | src/components/ui/app-link.tsx:2<br>src/hooks/use-nav.ts:2<br>src/lib/nav-guard.ts:1<br>src/views/phien-hoc/index.tsx:2 | tests/e2e/app.spec.ts:6<br>tests/unit/routes-guard.test.ts:64<br>tests/unit/routes-guard.test.ts:90<br>tests/unit/s3.test.tsx:185 |
| S3-08 | Phiên dở | S3-AC09 | - | src/domain/session.ts:1<br>src/views/phien-hoc/index.tsx:2 | tests/unit/s3.test.tsx:153 |
| S3-09 | Điều khiển | S3-AC10, S3-AC13 | - | src/views/phien-hoc/index.tsx:2 | tests/unit/ra-soat.test.tsx:132<br>tests/unit/s3.test.tsx:226 |

## S5 Kiểm tra nhanh

Spec: [docs/spec/S5-kiem-tra-nhanh/spec.md](../../docs/spec/S5-kiem-tra-nhanh/spec.md) · Acceptance: [docs/spec/S5-kiem-tra-nhanh/acceptance.md](../../docs/spec/S5-kiem-tra-nhanh/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S5-01 | Màn bắt đầu | S5-AC01, S5-AC09 | docs/new/navigation.md:449<br>docs/new/navigation.md:451<br>docs/new/navigation.md:453 | src/domain/quick-test.ts:1<br>src/views/kiem-tra/index.tsx:2 | tests/unit/s5.test.tsx:63 |
| S5-02 | Chỉ báo bước | S5-AC02 | - | src/views/kiem-tra/index.tsx:2 | tests/unit/s5.test.tsx:94 |
| S5-03 | Bước 1: Nghe và chọn nghĩa | S5-AC03, S5-AC09 | - | src/views/kiem-tra/index.tsx:2 | tests/unit/s5.test.tsx:114<br>tests/unit/s5.test.tsx:144 |
| S5-04 | Bước 2: Nghe theo cụm | S5-AC04, S5-AC09, S5-AC10 | - | src/domain/chunks.ts:1<br>src/domain/quick-test.ts:1<br>src/hooks/use-say.ts:2<br>src/views/kiem-tra/index.tsx:2 | tests/unit/dot2-data.test.ts:48<br>tests/unit/s5.test.tsx:160<br>tests/unit/s5.test.tsx:178 |
| S5-05 | Bước 3: Sắp xếp câu | S5-AC05, S5-AC09, S5-AC10, S5-AC11 | - | src/domain/chunks.ts:1<br>src/domain/quick-test.ts:1<br>src/views/kiem-tra/index.tsx:2 | tests/unit/dot2-data.test.ts:65<br>tests/unit/ra-soat.test.tsx:256<br>tests/unit/s5.test.tsx:202 |
| S5-06 | Nghĩa hiển thị | S5-AC06 | - | src/views/kiem-tra/index.tsx:2 | - |
| S5-07 | Kết quả | S5-AC07, S5-AC09, S5-AC14, S5-AC15 | docs/new/navigation.md:163<br>docs/new/navigation.md:459<br>docs/new/navigation.md:461 | src/domain/session.ts:1<br>src/hooks/use-say.ts:2<br>src/views/kiem-tra/index.tsx:2 | tests/unit/s5.test.tsx:250<br>tests/unit/s5.test.tsx:274<br>tests/unit/s5.test.tsx:459 |
| S5-08 | Tạm dừng giữa chừng | S5-AC08, S5-AC12, S5-AC15 | docs/new/navigation.md:161<br>docs/new/navigation.md:455<br>docs/new/navigation.md:457 | src/domain/session.ts:1<br>src/hooks/use-nav.ts:2<br>src/lib/nav-guard.ts:1<br>src/views/kiem-tra/index.tsx:2 | tests/unit/s5.test.tsx:290<br>tests/unit/s5.test.tsx:334<br>tests/unit/s5.test.tsx:356<br>tests/unit/s5.test.tsx:389 |
| S5-09 | Bài kiểm tra dở | S5-AC12, S5-AC13, S5-AC15 | docs/new/navigation.md:161 | src/domain/path.ts:1<br>src/domain/quick-test.ts:1<br>src/domain/session.ts:1<br>src/views/kiem-tra/index.tsx:2 | tests/unit/s5.test.tsx:389<br>tests/unit/s5.test.tsx:419 |

## S8 Cài đặt

Spec: [docs/spec/S8-cai-dat/spec.md](../../docs/spec/S8-cai-dat/spec.md) · Acceptance: [docs/spec/S8-cai-dat/acceptance.md](../../docs/spec/S8-cai-dat/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S8-01 | Học tập | S8-AC01, S8-AC09, S8-AC10 | docs/new/navigation.md:591 | src/lib/route-memory.ts:1<br>src/views/cai-dat/index.tsx:2 | tests/unit/s8.test.tsx:37<br>tests/unit/s8.test.tsx:237 |
| S8-02 | Giọng đọc | S8-AC02, S8-AC03, S8-AC09, S8-AC11, S8-AC12 | docs/new/navigation.md:183<br>docs/new/navigation.md:593 | src/lib/speech.ts:1<br>src/views/cai-dat/index.tsx:2<br>src/views/cai-dat/voices.tsx:2 | tests/unit/ra-soat.test.tsx:210<br>tests/unit/s8.test.tsx:76<br>tests/unit/s8.test.tsx:113<br>tests/unit/speech.test.ts:31<br>tests/unit/speech.test.ts:43<br>tests/unit/speech.test.ts:78 |
| S8-03 | Âm thanh ngoại tuyến | S8-AC04 | - | - | tests/unit/s8.test.tsx:124 |
| S8-04 | Giao diện | S8-AC05, S8-AC09 | - | src/views/cai-dat/index.tsx:2 | tests/unit/s8.test.tsx:131 |
| S8-05 | Tiến độ | S8-AC06, S8-AC07, S8-AC09, S8-AC13 | docs/new/navigation.md:595<br>docs/new/navigation.md:597<br>docs/new/navigation.md:599 | src/domain/transfer.ts:1<br>src/views/cai-dat/delete-form.tsx:2<br>src/views/cai-dat/index.tsx:2<br>src/views/cai-dat/utils/file-io.ts:1 | tests/unit/dot2-data.test.ts:81<br>tests/unit/ra-soat.test.tsx:98<br>tests/unit/s8.test.tsx:148 |
| S8-06 | Trợ giúp | S8-AC08, S8-AC09 | docs/new/navigation.md:187<br>docs/new/navigation.md:601 | src/views/cai-dat/index.tsx:2 | tests/unit/s8.test.tsx:215 |
| S8-07 | Bố cục máy tính | S8-AC14 | - | src/views/cai-dat/index.tsx:2 | - |
| S8-08 | Tài khoản | S8-AC09, S8-AC15 | - | src/views/cai-dat/index.tsx:2 | tests/unit/s8.test.tsx:250 |

## S9 Hướng dẫn lần đầu

Spec: [docs/spec/S9-huong-dan/spec.md](../../docs/spec/S9-huong-dan/spec.md) · Acceptance: [docs/spec/S9-huong-dan/acceptance.md](../../docs/spec/S9-huong-dan/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S9-01 | Khi nào hiện | S9-AC01 | docs/new/navigation.md:100<br>docs/new/navigation.md:102<br>docs/new/navigation.md:252<br>docs/new/navigation.md:254<br>docs/new/navigation.md:256 | src/views/huong-dan/index.tsx:2 | tests/unit/app.test.tsx:410<br>tests/unit/app.test.tsx:456 |
| S9-02 | Ba bước | S9-AC02, S9-AC06 | - | src/views/huong-dan/index.tsx:2 | - |
| S9-03 | Điều khiển | S9-AC03 | docs/new/navigation.md:104<br>docs/new/navigation.md:106<br>docs/new/navigation.md:258<br>docs/new/navigation.md:260 | src/views/huong-dan/index.tsx:2 | tests/unit/app.test.tsx:464 |
| S9-04 | Không hiện lại | S9-AC04 | docs/new/navigation.md:108 | src/views/huong-dan/index.tsx:2 | tests/unit/app.test.tsx:485 |
| S9-05 | Xem lại | S9-AC05 | docs/new/navigation.md:187<br>docs/new/navigation.md:601 | src/views/huong-dan/index.tsx:2 | tests/unit/s8.test.tsx:215 |

## T1 Học

Spec: [docs/spec/T1-hoc/spec.md](../../docs/spec/T1-hoc/spec.md) · Acceptance: [docs/spec/T1-hoc/acceptance.md](../../docs/spec/T1-hoc/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T1-01 | Thẻ câu tiếp theo | T1-AC01, T1-AC02, T1-AC10, T1-AC11 | docs/new/navigation.md:147 | src/views/hoc/index.tsx:2 | tests/unit/app.test.tsx:346<br>tests/unit/app.test.tsx:439<br>tests/unit/dot5-unit.test.tsx:202 |
| T1-02 | Nút chính đổi chữ theo ngữ cảnh | T1-AC03, T1-AC09 | docs/new/navigation.md:54<br>docs/new/navigation.md:143<br>docs/new/navigation.md:318 | src/views/hoc/index.tsx:2<br>scripts/spec.mjs:11 | tests/unit/app.test.tsx:360<br>scripts/spec.mjs:12 |
| T1-03 | Mục tiêu tuần | T1-AC04 | - | src/domain/path.ts:1<br>src/views/hoc/index.tsx:2 | tests/unit/app.test.tsx:381 |
| T1-04 | Câu cần ôn | T1-AC05, T1-AC09 | docs/new/navigation.md:143<br>docs/new/navigation.md:320 | src/views/hoc/index.tsx:2 | tests/unit/app.test.tsx:392 |
| T1-05 | Học hết lộ trình | T1-AC06 | docs/new/navigation.md:145<br>docs/new/navigation.md:330 | src/views/hoc/index.tsx:2 | tests/unit/app.test.tsx:410 |
| T1-06 | Bố cục máy tính | T1-AC07 | - | src/views/hoc/index.tsx:2 | - |
| T1-07 | Không đổi câu trên T1 | T1-AC08 | - | src/views/hoc/index.tsx:2 | tests/unit/app.test.tsx:423 |
| T1-08 | Unit tiếp theo | T1-AC12 | docs/new/navigation.md:147<br>docs/new/navigation.md:149 | src/components/learning/unit-card.tsx:2<br>src/views/hoc/index.tsx:2 | tests/unit/dot5-unit.test.tsx:212 |
| T1-09 | Tiến độ của bạn | T1-AC13 | docs/new/navigation.md:151 | src/views/hoc/index.tsx:2 | tests/unit/dot5-unit.test.tsx:225 |

## T2 Luyện tập

Spec: [docs/spec/T2-luyen-tap/spec.md](../../docs/spec/T2-luyen-tap/spec.md) · Acceptance: [docs/spec/T2-luyen-tap/acceptance.md](../../docs/spec/T2-luyen-tap/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T2-01 | Danh sách cách luyện | T2-AC01 | - | src/views/luyen-tap/index.tsx:2 | - |
| T2-02 | Ôn tập hôm nay | T2-AC02 | docs/new/navigation.md:153<br>docs/new/navigation.md:443 | src/views/luyen-tap/index.tsx:2 | tests/unit/t2-t4.test.tsx:33 |
| T2-03 | Học theo từ khóa | T2-AC03, T2-AC06, T2-AC07 | docs/new/navigation.md:155<br>docs/new/navigation.md:157<br>docs/new/navigation.md:445<br>docs/new/navigation.md:447 | src/domain/library.ts:1<br>src/views/luyen-tap/index.tsx:2 | tests/unit/t2-t4.test.tsx:58<br>tests/unit/t2-t4.test.tsx:84<br>tests/unit/t2-t4.test.tsx:101<br>tests/unit/t2-t4.test.tsx:141 |
| T2-04 | Kiểm tra nhanh | T2-AC04 | docs/new/navigation.md:54<br>docs/new/navigation.md:159<br>docs/new/navigation.md:449 | src/domain/quick-test.ts:1<br>src/views/luyen-tap/index.tsx:2 | tests/unit/t2-t4.test.tsx:110 |
| T2-05 | Không có kết quả | T2-AC05, T2-AC06 | - | src/views/luyen-tap/index.tsx:2 | tests/unit/t2-t4.test.tsx:126 |
| T2-06 | Bố cục máy tính | T2-AC08 | - | src/views/luyen-tap/index.tsx:2 | - |

## T3 Thư viện

Spec: [docs/spec/T3-thu-vien/spec.md](../../docs/spec/T3-thu-vien/spec.md) · Acceptance: [docs/spec/T3-thu-vien/acceptance.md](../../docs/spec/T3-thu-vien/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T3-01 | Danh sách câu | T3-AC01, T3-AC02 | - | src/components/learning/status-icon.tsx:2<br>src/domain/status-tone.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/t3.test.tsx:20 |
| T3-02 | Tìm kiếm | T3-AC03 | - | src/domain/library.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/t3.test.tsx:43<br>tests/unit/t3.test.tsx:257 |
| T3-03 | Bộ lọc | T3-AC04, T3-AC09, T3-AC10 | - | src/domain/library.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/t3.test.tsx:62<br>tests/unit/t3.test.tsx:142<br>tests/unit/t3.test.tsx:155 |
| T3-04 | Phân trang | T3-AC05 | - | src/components/ui/pager.tsx:2<br>src/domain/library.ts:1<br>src/utils/status-badge-colors.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/t3.test.tsx:78 |
| T3-05 | Chi tiết câu | T3-AC06 | docs/new/navigation.md:165<br>docs/new/navigation.md:167<br>docs/new/navigation.md:502<br>docs/new/navigation.md:504 | src/components/learning/item-detail.tsx:2<br>src/domain/stats.ts:1<br>src/domain/status-tone.ts:1<br>src/utils/format-date.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/ra-soat.test.tsx:83<br>tests/unit/t3.test.tsx:107 |
| T3-06 | Không có kết quả | T3-AC07 | - | src/views/thu-vien/index.tsx:2 | tests/unit/t3.test.tsx:127 |
| T3-07 | Bố cục máy tính | T3-AC08 | - | src/views/thu-vien/index.tsx:2 | tests/e2e/dot2.spec.ts:152 |
| T3-08 | Chọn cách xem | T3-AC11 | - | src/views/thu-vien/index.tsx:2 | tests/unit/dot5-unit.test.tsx:24 |
| T3-09 | Danh sách Unit | T3-AC12, T3-AC14 | docs/new/navigation.md:169<br>docs/new/navigation.md:500 | src/components/learning/unit-card.tsx:2<br>src/domain/units.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/dot5-unit.test.tsx:43 |
| T3-10 | Tổng quan Unit | T3-AC13 | - | src/domain/units.ts:1<br>src/views/thu-vien/index.tsx:2 | tests/unit/dot5-unit.test.tsx:60 |

## T4 Tiến độ

Spec: [docs/spec/T4-tien-do/spec.md](../../docs/spec/T4-tien-do/spec.md) · Acceptance: [docs/spec/T4-tien-do/acceptance.md](../../docs/spec/T4-tien-do/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T4-01 | Khoảng thời gian | T4-AC01 | - | src/domain/stats.ts:1<br>src/views/tien-do/index.tsx:2 | tests/unit/t2-t4.test.tsx:215 |
| T4-02 | Ba chỉ số | T4-AC02, T4-AC10 | - | src/domain/stats.ts:1<br>src/views/tien-do/index.tsx:2 | tests/unit/dot2-data.test.ts:29<br>tests/unit/t2-t4.test.tsx:232 |
| T4-03 | Mục tiêu mỗi tuần | T4-AC03 | - | src/domain/stats.ts:1<br>src/views/tien-do/index.tsx:2 | tests/unit/t2-t4.test.tsx:247 |
| T4-04 | Biểu đồ theo ngày | T4-AC04, T4-AC05 | - | src/domain/stats.ts:1<br>src/views/tien-do/index.tsx:2 | tests/unit/t2-t4.test.tsx:267 |
| T4-05 | Lịch ôn tập | T4-AC06, T4-AC10 | - | src/domain/stats.ts:1<br>src/views/tien-do/index.tsx:2 | tests/unit/dot2-data.test.ts:29<br>tests/unit/t2-t4.test.tsx:292 |
| T4-06 | Các phiên học | S10-AC07, T4-AC07 | - | src/domain/stats.ts:1<br>src/utils/format-date.ts:1<br>src/views/tien-do/index.tsx:2 | tests/unit/dot5-unit.test.tsx:183<br>tests/unit/t2-t4.test.tsx:302 |
| T4-07 | Chi tiết ngày | T4-AC08 | docs/new/navigation.md:177<br>docs/new/navigation.md:541 | src/domain/stats.ts:1<br>src/utils/format-date.ts:1<br>src/views/tien-do/index.tsx:2 | tests/unit/t2-t4.test.tsx:320 |
| T4-08 | Chưa có dữ liệu | T4-AC09 | docs/new/navigation.md:179<br>docs/new/navigation.md:543 | src/views/tien-do/index.tsx:2 | tests/unit/t2-t4.test.tsx:339 |
| T4-09 | Bố cục máy tính | T4-AC11 | - | src/views/tien-do/index.tsx:2 | - |
