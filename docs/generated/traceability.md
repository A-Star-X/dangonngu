# Ma trận truy vết spec, code và acceptance

File sinh tự động bởi `node scripts/spec.mjs trace` lúc 2026-10-18 17:19 UTC. Không sửa tay.

Tổng: 135 yêu cầu, 184 mục acceptance, 448 ghi chú @spec/@ac trong code.

Yêu cầu chưa có code gắn @spec: 9/135.

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

Spec: [fe/src/app/spec.md](../../fe/src/app/spec.md) · Acceptance: [fe/src/app/acceptance.md](../../fe/src/app/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| APP-01 | Bốn khu chính | APP-AC01, APP-AC02 | docs/new/navigation.md:110<br>docs/new/navigation.md:286<br>docs/new/navigation.md:288<br>docs/new/navigation.md:290 | fe/src/app/App.tsx:1<br>fe/src/app/app.css:1<br>fe/src/components/C5-thanh-tab/TabBar.tsx:1 | fe/tests/e2e/app.spec.ts:108 |
| APP-02 | Thanh trên cùng | APP-AC03, APP-AC17, APP-AC19 | docs/new/navigation.md:36<br>docs/new/navigation.md:118<br>docs/new/navigation.md:120<br>docs/new/navigation.md:278<br>docs/new/navigation.md:280 | fe/src/app/TopBar.tsx:1<br>fe/src/app/app.css:1 | fe/tests/unit/app.test.tsx:198 |
| APP-03 | Màn toàn trang | APP-AC04 | docs/new/navigation.md:34 | fe/src/app/App.tsx:1<br>fe/src/app/app.css:1<br>fe/src/pages/S3-phien-hoc/s3.css:1<br>fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1 | fe/tests/unit/app.test.tsx:123 |
| APP-04 | Bảng route | APP-AC02, APP-AC05 | docs/new/navigation.md:36<br>docs/new/navigation.md:531 | fe/src/app/App.tsx:1<br>fe/src/app/router.ts:1 | fe/tests/e2e/app.spec.ts:108<br>fe/tests/e2e/app.spec.ts:124<br>fe/tests/unit/app.test.tsx:175 |
| APP-05 | Khởi động | APP-AC06, APP-AC07 | docs/new/navigation.md:20<br>docs/new/navigation.md:22<br>docs/new/navigation.md:52<br>docs/new/navigation.md:54<br>docs/new/navigation.md:60<br>docs/new/navigation.md:62<br>docs/new/navigation.md:74<br>docs/new/navigation.md:76<br>docs/new/navigation.md:98<br>docs/new/navigation.md:106 | fe/src/app/App.tsx:1<br>fe/src/app/state.tsx:1 | fe/tests/unit/app.test.tsx:184 |
| APP-06 | Sheet Đổi ngôn ngữ | APP-AC08, APP-AC17 | docs/new/navigation.md:118<br>docs/new/navigation.md:278<br>docs/new/navigation.md:292 | fe/src/app/LanguageList.tsx:1<br>fe/src/app/TopBar.tsx:1<br>fe/src/app/state.tsx:1<br>fe/src/app/useLanguageSheet.tsx:1 | fe/tests/unit/app.test.tsx:198 |
| APP-07 | Bố cục theo khổ màn hình | APP-AC09, APP-AC13 | - | fe/src/app/App.tsx:1<br>fe/src/app/app.css:1<br>fe/src/pages/S3-phien-hoc/s3.css:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1<br>fe/src/pages/T3-thu-vien/t3.css:1 | fe/tests/e2e/dot2.spec.ts:120 |
| APP-08 | Trạng thái toàn cục | APP-AC07, APP-AC10, APP-AC11 | docs/new/navigation.md:56<br>docs/new/navigation.md:58<br>docs/new/navigation.md:78 | fe/src/app/App.tsx:1<br>fe/src/app/States.tsx:1<br>fe/src/app/app.css:1<br>fe/src/app/state.tsx:1<br>fe/src/data/storage.ts:1 | fe/tests/unit/app.test.tsx:223<br>fe/tests/unit/app.test.tsx:234<br>fe/tests/unit/app.test.tsx:243 |
| APP-09 | Cách trang chính mở app | APP-AC12, APP-AC13, APP-AC20 | - | fe/src/app/App.tsx:1<br>fe/src/app/HostBack.tsx:1<br>fe/src/app/app.css:1 | - |
| APP-10 | Ngoại tuyến và cập nhật | APP-AC14, APP-AC15 | - | fe/src/app/App.tsx:1<br>fe/src/app/sw.js:1<br>fe/src/app/updates.ts:1<br>fe/src/data/source.ts:1<br>fe/src/main.tsx:1 | fe/tests/unit/s8.test.tsx:242<br>fe/tests/unit/s8.test.tsx:269<br>fe/tests/unit/s8.test.tsx:303 |
| APP-11 | Một lớp phủ tại một thời điểm | APP-AC16 | docs/new/navigation.md:38 | fe/src/components/C6-sheet/SheetHost.tsx:1<br>fe/src/pages/S9-huong-dan/S9HuongDan.tsx:1 | fe/tests/unit/s8.test.tsx:286<br>fe/tests/unit/t3.test.tsx:171 |
| APP-12 | Nút về trang học chính | APP-AC18, APP-AC19, APP-AC20 | docs/new/navigation.md:40<br>docs/new/navigation.md:42 | fe/src/app/HostBack.tsx:1<br>fe/src/app/TopBar.tsx:1<br>fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1<br>fe/src/pages/S1-chon-ngon-ngu/s1.css:1 | fe/tests/unit/app.test.tsx:140 |

## FND Nền tảng thiết kế

Spec: [fe/src/foundation/spec.md](../../fe/src/foundation/spec.md) · Acceptance: [fe/src/foundation/acceptance.md](../../fe/src/foundation/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| FND-01 | Token màu | FND-AC01, FND-AC02 | - | fe/src/foundation/tokens.css:1 | fe/tests/unit/foundation.test.ts:40<br>fe/tests/unit/foundation.test.ts:53 |
| FND-02 | Quy tắc dùng màu | FND-AC02, FND-AC03 | - | - | fe/tests/unit/foundation.test.ts:53 |
| FND-03 | Sáng và tối | FND-AC04 | - | fe/index.html:7<br>fe/src/app/state.tsx:1<br>fe/src/foundation/tokens.css:1 | fe/tests/e2e/app.spec.ts:70 |
| FND-04 | Font | FND-AC05 | - | fe/src/foundation/base.css:1<br>fe/src/foundation/fonts.ts:1 | - |
| FND-05 | Thang chữ | FND-AC06 | - | fe/src/foundation/base.css:1<br>fe/src/foundation/tokens.css:1 | fe/tests/unit/foundation.test.ts:93 |
| FND-06 | Cỡ câu theo độ dài | FND-AC07 | - | fe/src/foundation/typography.ts:1 | fe/tests/unit/foundation.test.ts:104 |
| FND-07 | Khoảng cách và lề | FND-AC08 | - | fe/src/foundation/base.css:1<br>fe/src/foundation/tokens.css:1 | - |
| FND-08 | Bo góc theo vai trò | FND-AC08 | - | fe/src/foundation/tokens.css:1 | - |
| FND-09 | Đổ bóng | FND-AC08 | - | fe/src/foundation/tokens.css:1 | - |
| FND-10 | Icon | FND-AC09 | - | - | - |
| FND-11 | Chuyển động | FND-AC10, FND-AC11 | - | fe/src/foundation/base.css:1<br>fe/src/foundation/tokens.css:1 | fe/tests/e2e/app.spec.ts:93 |
| FND-12 | Giọng văn và từ ngữ | FND-AC12, FND-AC13 | - | fe/src/data/text.ts:29 | fe/tests/unit/speech.test.ts:99 |
| FND-13 | Quy tắc tránh giao diện kiểu AI | FND-AC14 | - | - | - |
| FND-14 | Trợ năng chung | FND-AC15, FND-AC16, FND-AC17 | - | fe/src/foundation/base.css:1 | fe/tests/e2e/app.spec.ts:156<br>fe/tests/e2e/dot2.spec.ts:26 |

## DATA Dữ liệu và tiến độ

Spec: [fe/src/data/spec.md](../../fe/src/data/spec.md) · Acceptance: [fe/src/data/acceptance.md](../../fe/src/data/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| DATA-01 | Manifest | DATA-AC01, DATA-AC16, DATA-AC19 | - | fe/src/data/catalog.ts:1<br>fe/src/data/contract.ts:1<br>fe/src/data/types.ts:1 | fe/tests/unit/data.test.ts:41<br>fe/tests/unit/data.test.ts:86<br>fe/tests/unit/data.test.ts:100 |
| DATA-02 | File ngôn ngữ | DATA-AC01, DATA-AC02, DATA-AC19 | - | fe/src/data/contract.ts:1<br>fe/src/data/types.ts:1 | fe/tests/unit/app.test.tsx:264<br>fe/tests/unit/data.test.ts:41<br>fe/tests/unit/data.test.ts:63<br>fe/tests/unit/data.test.ts:100 |
| DATA-03 | File unit | DATA-AC01, DATA-AC03, DATA-AC16, DATA-AC19 | - | fe/src/data/contract.ts:1<br>fe/src/data/types.ts:1 | fe/tests/unit/data.test.ts:41<br>fe/tests/unit/data.test.ts:74<br>fe/tests/unit/data.test.ts:86<br>fe/tests/unit/data.test.ts:100 |
| DATA-04 | Trường tùy chọn | DATA-AC04, DATA-AC18 | - | fe/src/data/contract.ts:1<br>fe/src/data/types.ts:1<br>fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1<br>fe/src/pages/T3-thu-vien/filter.ts:1 | fe/tests/unit/app.test.tsx:405<br>fe/tests/unit/components.test.tsx:113<br>fe/tests/unit/t3.test.tsx:188<br>fe/tests/unit/t3.test.tsx:203 |
| DATA-05 | Nguồn dữ liệu thay được | DATA-AC02, DATA-AC05 | docs/new/navigation.md:68 | fe/src/app/state.tsx:1<br>fe/src/data/contract.ts:1<br>fe/src/data/source.ts:1 | fe/tests/unit/app.test.tsx:264<br>fe/tests/unit/app.test.tsx:278<br>fe/tests/unit/data.test.ts:63 |
| DATA-06 | Lưu tiến độ | DATA-AC06, DATA-AC07, DATA-AC17, DATA-AC20 | - | fe/src/app/state.tsx:1<br>fe/src/data/progress.ts:1<br>fe/src/data/session.ts:1<br>fe/src/data/storage.ts:1<br>fe/src/data/transfer.ts:1 | fe/tests/unit/app.test.tsx:243<br>fe/tests/unit/data.test.ts:212<br>fe/tests/unit/ra-soat.test.tsx:14<br>fe/tests/unit/ra-soat.test.tsx:36<br>fe/tests/unit/s3.test.tsx:215<br>fe/tests/unit/s3.test.tsx:232 |
| DATA-07 | Quy tắc câu cần ôn | DATA-AC08, DATA-AC09, DATA-AC21 | - | fe/src/data/review.ts:1<br>fe/src/data/session.ts:1<br>fe/src/data/stats.ts:1<br>fe/src/pages/T3-thu-vien/filter.ts:1 | fe/tests/unit/app.test.tsx:365<br>fe/tests/unit/data.test.ts:134<br>fe/tests/unit/ra-soat.test.tsx:51<br>fe/tests/unit/ra-soat.test.tsx:64<br>fe/tests/unit/t2-t4.test.tsx:264 |
| DATA-08 | Đáp án nhiễu | DATA-AC10 | - | fe/src/data/distractors.ts:1<br>fe/src/data/text.ts:1 | fe/tests/unit/data.test.ts:167 |
| DATA-09 | Fixture | DATA-AC11, DATA-AC12 | - | - | - |
| DATA-10 | Không gọi mạng ngoài phạm vi | DATA-AC13 | - | fe/src/data/source.ts:1 | fe/tests/e2e/app.spec.ts:136<br>fe/tests/e2e/dot2.spec.ts:99 |
| DATA-11 | Lộ trình học | DATA-AC14 | - | fe/src/data/path.ts:1 | fe/tests/unit/data.test.ts:182 |
| DATA-12 | Tìm kiếm | DATA-AC15, DATA-AC21 | - | fe/src/data/search.ts:1<br>fe/src/data/text.ts:1<br>fe/src/pages/T3-thu-vien/filter.ts:1 | fe/tests/unit/data.test.ts:191<br>fe/tests/unit/ra-soat.test.tsx:51<br>fe/tests/unit/ra-soat.test.tsx:64 |
| DATA-13 | Bộ nội dung | DATA-AC16, DATA-AC17 | docs/new/navigation.md:64 | fe/src/app/state.tsx:1<br>fe/src/data/catalog.ts:1<br>fe/src/data/types.ts:1 | fe/tests/unit/data.test.ts:86<br>fe/tests/unit/data.test.ts:212<br>fe/tests/unit/s3.test.tsx:232 |

## C1 Thẻ câu

Spec: [fe/src/components/C1-the-cau/spec.md](../../fe/src/components/C1-the-cau/spec.md) · Acceptance: [fe/src/components/C1-the-cau/acceptance.md](../../fe/src/components/C1-the-cau/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C1-01 | Cấu trúc | C1-AC01 | - | fe/src/components/C1-the-cau/SentenceCard.tsx:1<br>fe/src/components/C1-the-cau/card.css:1 | - |
| C1-02 | Trạng thái che câu gốc | C1-AC02, C1-AC10 | - | fe/src/components/C1-the-cau/SentenceCard.tsx:1<br>fe/src/components/C1-the-cau/card.css:1 | fe/tests/unit/components.test.tsx:24<br>fe/tests/unit/ra-soat.test.tsx:165 |
| C1-03 | Trạng thái hiện đầy đủ | C1-AC03 | - | fe/src/components/C1-the-cau/SentenceCard.tsx:1<br>fe/src/components/C1-the-cau/card.css:1 | fe/tests/unit/components.test.tsx:39 |
| C1-04 | Phát âm | C1-AC04, C1-AC05, C1-AC09 | - | fe/src/app/speech.ts:1<br>fe/src/components/C1-the-cau/SentenceCard.tsx:1<br>fe/src/components/C1-the-cau/useSpeaker.ts:1 | fe/tests/unit/components.test.tsx:48<br>fe/tests/unit/ra-soat.test.tsx:133 |
| C1-05 | Không có giọng đọc | C1-AC06 | docs/new/navigation.md:149<br>docs/new/navigation.md:296 | fe/src/app/speech.ts:1<br>fe/src/components/C1-the-cau/SentenceCard.tsx:1<br>fe/src/components/C1-the-cau/card.css:1<br>fe/src/components/C1-the-cau/useSpeaker.ts:1 | fe/tests/e2e/app.spec.ts:192<br>fe/tests/unit/components.test.tsx:70<br>fe/tests/unit/components.test.tsx:83 |
| C1-06 | Dòng Cách dùng | C1-AC07 | - | fe/src/components/C1-the-cau/SentenceCard.tsx:1 | fe/tests/unit/components.test.tsx:113 |
| C1-07 | Phiên âm | C1-AC07 | - | fe/src/components/C1-the-cau/SentenceCard.tsx:1 | fe/tests/unit/components.test.tsx:113 |
| C1-08 | Thuộc tính ngôn ngữ | C1-AC08 | - | fe/src/components/C1-the-cau/SentenceCard.tsx:1 | fe/tests/unit/components.test.tsx:136 |

## C2 Dải 8 ô

Spec: [fe/src/components/C2-dai-8-o/spec.md](../../fe/src/components/C2-dai-8-o/spec.md) · Acceptance: [fe/src/components/C2-dai-8-o/acceptance.md](../../fe/src/components/C2-dai-8-o/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C2-01 | Kích thước và số ô | C2-AC01 | - | fe/src/components/C2-dai-8-o/Strip.tsx:1<br>fe/src/components/C2-dai-8-o/strip.css:1 | fe/tests/e2e/app.spec.ts:30 |
| C2-02 | Trạng thái ô | C2-AC02 | - | fe/src/components/C2-dai-8-o/Strip.tsx:1<br>fe/src/components/C2-dai-8-o/strip.css:1 | - |
| C2-03 | Trợ năng | C2-AC03 | - | fe/src/components/C2-dai-8-o/Strip.tsx:1 | fe/tests/unit/components.test.tsx:158 |

## C3 Nút

Spec: [fe/src/components/C3-nut/spec.md](../../fe/src/components/C3-nut/spec.md) · Acceptance: [fe/src/components/C3-nut/acceptance.md](../../fe/src/components/C3-nut/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C3-01 | Nút chính | C3-AC01 | - | fe/src/components/C3-nut/Button.tsx:1<br>fe/src/components/C3-nut/button.css:1 | - |
| C3-02 | Nút phụ | C3-AC01 | - | fe/src/components/C3-nut/Button.tsx:1<br>fe/src/components/C3-nut/button.css:1 | - |
| C3-03 | Cặp nút đánh giá | C3-AC02, C3-AC03 | docs/new/navigation.md:345<br>docs/new/navigation.md:347 | fe/src/components/C3-nut/RatePair.tsx:1<br>fe/src/components/C3-nut/button.css:1 | - |
| C3-04 | Trạng thái chung | C3-AC04 | - | fe/src/components/C3-nut/Button.tsx:1<br>fe/src/components/C3-nut/button.css:1 | fe/tests/e2e/app.spec.ts:44<br>fe/tests/unit/components.test.tsx:170 |

## C4 Lựa chọn trắc nghiệm

Spec: [fe/src/components/C4-lua-chon/spec.md](../../fe/src/components/C4-lua-chon/spec.md) · Acceptance: [fe/src/components/C4-lua-chon/acceptance.md](../../fe/src/components/C4-lua-chon/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C4-01 | Bố cục | C4-AC01 | - | fe/src/components/C4-lua-chon/Choices.tsx:1<br>fe/src/components/C4-lua-chon/choices.css:1 | - |
| C4-02 | Chọn đáp án | C4-AC02 | - | fe/src/components/C4-lua-chon/Choices.tsx:1<br>fe/src/components/C4-lua-chon/choices.css:1 | fe/tests/unit/components.test.tsx:192<br>fe/tests/unit/components.test.tsx:218 |
| C4-03 | Thông báo kết quả | C4-AC03 | - | fe/src/components/C4-lua-chon/Choices.tsx:1 | fe/tests/unit/components.test.tsx:207<br>fe/tests/unit/components.test.tsx:219 |

## C5 Thanh tab

Spec: [fe/src/components/C5-thanh-tab/spec.md](../../fe/src/components/C5-thanh-tab/spec.md) · Acceptance: [fe/src/components/C5-thanh-tab/acceptance.md](../../fe/src/components/C5-thanh-tab/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C5-01 | Thanh dưới đáy | C5-AC01 | docs/new/navigation.md:110<br>docs/new/navigation.md:286<br>docs/new/navigation.md:288<br>docs/new/navigation.md:290 | fe/src/components/C5-thanh-tab/TabBar.tsx:1<br>fe/src/components/C5-thanh-tab/tabbar.css:1 | - |
| C5-02 | Thanh dọc | C5-AC02 | - | fe/src/components/C5-thanh-tab/TabBar.tsx:1<br>fe/src/components/C5-thanh-tab/tabbar.css:1 | - |
| C5-03 | Mục đang chọn | C5-AC03 | - | fe/src/components/C5-thanh-tab/TabBar.tsx:1<br>fe/src/components/C5-thanh-tab/tabbar.css:1 | fe/tests/unit/components.test.tsx:235 |
| C5-04 | Mục có số | C5-AC04 | - | fe/src/components/C5-thanh-tab/TabBar.tsx:1<br>fe/src/components/C5-thanh-tab/tabbar.css:1 | fe/tests/unit/components.test.tsx:246 |

## C6 Sheet

Spec: [fe/src/components/C6-sheet/spec.md](../../fe/src/components/C6-sheet/spec.md) · Acceptance: [fe/src/components/C6-sheet/acceptance.md](../../fe/src/components/C6-sheet/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C6-01 | Dạng hiển thị | C6-AC01 | docs/new/navigation.md:38 | fe/src/components/C6-sheet/SheetHost.tsx:1<br>fe/src/components/C6-sheet/sheet.css:1 | - |
| C6-02 | Tiêu đề và đóng | C6-AC02, C6-AC03, C6-AC06 | - | fe/src/app/App.tsx:1<br>fe/src/components/C6-sheet/SheetHost.tsx:1 | fe/tests/unit/components.test.tsx:266<br>fe/tests/unit/ra-soat.test.tsx:198 |
| C6-03 | Focus | C6-AC04 | - | fe/src/components/C6-sheet/SheetHost.tsx:1 | fe/tests/unit/components.test.tsx:298 |
| C6-04 | Nội dung dài | C6-AC05 | - | fe/src/components/C6-sheet/SheetHost.tsx:1<br>fe/src/components/C6-sheet/sheet.css:1<br>fe/src/pages/T2-luyen-tap/t2.css:1 | - |

## C7 Thông báo ngắn

Spec: [fe/src/components/C7-thong-bao/spec.md](../../fe/src/components/C7-thong-bao/spec.md) · Acceptance: [fe/src/components/C7-thong-bao/acceptance.md](../../fe/src/components/C7-thong-bao/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| C7-01 | Vị trí và hiển thị | C7-AC01 | - | fe/src/components/C7-thong-bao/ToastHost.tsx:1<br>fe/src/components/C7-thong-bao/toast.css:1 | - |
| C7-02 | Thời gian và hành động | C7-AC02 | - | fe/src/components/C7-thong-bao/ToastHost.tsx:1 | fe/tests/unit/components.test.tsx:344 |
| C7-03 | Trợ năng | C7-AC03 | - | fe/src/components/C7-thong-bao/ToastHost.tsx:1 | fe/tests/unit/components.test.tsx:368 |

## S1 Chọn ngôn ngữ

Spec: [fe/src/pages/S1-chon-ngon-ngu/spec.md](../../fe/src/pages/S1-chon-ngon-ngu/spec.md) · Acceptance: [fe/src/pages/S1-chon-ngon-ngu/acceptance.md](../../fe/src/pages/S1-chon-ngon-ngu/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S1-01 | Danh sách và thứ tự | S1-AC01, S1-AC02, S1-AC06 | - | fe/src/data/catalog.ts:1<br>fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1<br>fe/src/pages/S1-chon-ngon-ngu/s1.css:1 | fe/tests/unit/app.test.tsx:37 |
| S1-02 | Nội dung mỗi dòng | S1-AC02, S1-AC03 | - | fe/src/app/LanguageList.tsx:1<br>fe/src/data/catalog.ts:1<br>fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1 | fe/tests/unit/app.test.tsx:47 |
| S1-03 | Số câu | S1-AC02 | - | fe/src/app/LanguageList.tsx:1<br>fe/src/data/catalog.ts:1<br>fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1 | - |
| S1-04 | Chọn | S1-AC04, S1-AC06, S1-AC07 | docs/new/navigation.md:24<br>docs/new/navigation.md:64<br>docs/new/navigation.md:70<br>docs/new/navigation.md:76<br>docs/new/navigation.md:100<br>docs/new/navigation.md:214<br>docs/new/navigation.md:220 | fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1 | fe/tests/unit/app.test.tsx:69<br>fe/tests/unit/app.test.tsx:102 |
| S1-05 | Chú thích | S1-AC02 | - | fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1<br>fe/src/pages/S1-chon-ngon-ngu/s1.css:1 | - |
| S1-06 | Tải và lỗi | S1-AC05 | - | fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1 | fe/tests/unit/app.test.tsx:89 |
| S1-07 | Chọn bộ nội dung | S1-AC07, S1-AC08 | docs/new/navigation.md:20<br>docs/new/navigation.md:66<br>docs/new/navigation.md:68<br>docs/new/navigation.md:72<br>docs/new/navigation.md:102<br>docs/new/navigation.md:104<br>docs/new/navigation.md:214<br>docs/new/navigation.md:216<br>docs/new/navigation.md:218 | fe/src/pages/S1-chon-ngon-ngu/S1ChonNgonNgu.tsx:1<br>fe/src/pages/S1-chon-ngon-ngu/s1.css:1 | fe/tests/unit/app.test.tsx:102 |

## S3 Phiên học

Spec: [fe/src/pages/S3-phien-hoc/spec.md](../../fe/src/pages/S3-phien-hoc/spec.md) · Acceptance: [fe/src/pages/S3-phien-hoc/acceptance.md](../../fe/src/pages/S3-phien-hoc/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S3-01 | Nguồn câu của phiên | S3-AC01 | - | fe/src/data/path.ts:1<br>fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1 | fe/tests/unit/s3.test.tsx:14 |
| S3-02 | Khung phiên | S3-AC02, S3-AC07 | docs/new/navigation.md:145 | fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1<br>fe/src/pages/S3-phien-hoc/s3.css:1 | fe/tests/unit/s3.test.tsx:38 |
| S3-03 | Bước ghi nhớ | S3-AC03, S3-AC07, S3-AC11 | docs/new/navigation.md:345<br>docs/new/navigation.md:347 | fe/src/data/session.ts:1<br>fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1 | fe/tests/unit/s3.test.tsx:38 |
| S3-04 | Bước kiểm tra | S3-AC04, S3-AC07, S3-AC11 | docs/new/navigation.md:349 | fe/src/data/session.ts:1<br>fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1<br>fe/src/pages/S3-phien-hoc/s3.css:1 | fe/tests/unit/s3.test.tsx:70 |
| S3-05 | Gợi ý | S3-AC05, S3-AC12 | - | fe/src/data/session.ts:1<br>fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1 | fe/tests/unit/ra-soat.test.tsx:90<br>fe/tests/unit/s3.test.tsx:88 |
| S3-06 | Tổng kết phiên | S3-AC06, S3-AC07 | docs/new/navigation.md:145<br>docs/new/navigation.md:357<br>docs/new/navigation.md:359 | fe/src/data/session.ts:1<br>fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1<br>fe/src/pages/S3-phien-hoc/s3.css:1 | fe/tests/unit/s3.test.tsx:104 |
| S3-07 | Thoát giữa phiên | S3-AC08 | docs/new/navigation.md:351<br>docs/new/navigation.md:353<br>docs/new/navigation.md:355 | fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1 | fe/tests/e2e/app.spec.ts:6<br>fe/tests/unit/s3.test.tsx:168 |
| S3-08 | Phiên dở | S3-AC09 | - | fe/src/data/session.ts:1<br>fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1 | fe/tests/unit/s3.test.tsx:133 |
| S3-09 | Điều khiển | S3-AC10, S3-AC13 | - | fe/src/pages/S3-phien-hoc/S3PhienHoc.tsx:1 | fe/tests/unit/ra-soat.test.tsx:111<br>fe/tests/unit/s3.test.tsx:194 |

## S5 Kiểm tra nhanh

Spec: [fe/src/pages/S5-kiem-tra-nhanh/spec.md](../../fe/src/pages/S5-kiem-tra-nhanh/spec.md) · Acceptance: [fe/src/pages/S5-kiem-tra-nhanh/acceptance.md](../../fe/src/pages/S5-kiem-tra-nhanh/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S5-01 | Màn bắt đầu | S5-AC01, S5-AC09 | docs/new/navigation.md:413<br>docs/new/navigation.md:415<br>docs/new/navigation.md:417 | fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1 | fe/tests/unit/s5.test.tsx:48 |
| S5-02 | Chỉ báo bước | S5-AC02 | - | fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1 | fe/tests/unit/s5.test.tsx:73 |
| S5-03 | Bước 1: Nghe và chọn nghĩa | S5-AC03, S5-AC09 | - | fe/src/app/hooks.ts:1<br>fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1 | fe/tests/unit/s5.test.tsx:91<br>fe/tests/unit/s5.test.tsx:119 |
| S5-04 | Bước 2: Nghe theo cụm | S5-AC04, S5-AC09, S5-AC10 | - | fe/src/app/hooks.ts:1<br>fe/src/data/chunks.ts:1<br>fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1 | fe/tests/unit/dot2-data.test.ts:48<br>fe/tests/unit/s5.test.tsx:135<br>fe/tests/unit/s5.test.tsx:152 |
| S5-05 | Bước 3: Sắp xếp câu | S5-AC05, S5-AC09, S5-AC10, S5-AC11 | - | fe/src/data/chunks.ts:1<br>fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1 | fe/tests/unit/dot2-data.test.ts:65<br>fe/tests/unit/ra-soat.test.tsx:211<br>fe/tests/unit/s5.test.tsx:169 |
| S5-06 | Nghĩa hiển thị | S5-AC06 | - | fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1 | - |
| S5-07 | Kết quả | S5-AC07, S5-AC09 | docs/new/navigation.md:135<br>docs/new/navigation.md:423<br>docs/new/navigation.md:425 | fe/src/data/session.ts:1<br>fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1<br>fe/src/pages/S5-kiem-tra-nhanh/s5.css:1 | fe/tests/unit/s5.test.tsx:214<br>fe/tests/unit/s5.test.tsx:239 |
| S5-08 | Thoát giữa chừng | S5-AC08 | docs/new/navigation.md:419<br>docs/new/navigation.md:421 | fe/src/data/session.ts:1<br>fe/src/pages/S5-kiem-tra-nhanh/S5KiemTra.tsx:1 | fe/tests/unit/s5.test.tsx:255<br>fe/tests/unit/s5.test.tsx:286<br>fe/tests/unit/s5.test.tsx:306 |

## S8 Cài đặt

Spec: [fe/src/pages/S8-cai-dat/spec.md](../../fe/src/pages/S8-cai-dat/spec.md) · Acceptance: [fe/src/pages/S8-cai-dat/acceptance.md](../../fe/src/pages/S8-cai-dat/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S8-01 | Học tập | S8-AC01, S8-AC09, S8-AC10 | docs/new/navigation.md:533 | fe/src/app/TopBar.tsx:1<br>fe/src/app/router.ts:1<br>fe/src/pages/S8-cai-dat/S8CaiDat.tsx:1<br>fe/src/pages/S8-cai-dat/s8.css:1 | fe/tests/unit/s8.test.tsx:21<br>fe/tests/unit/s8.test.tsx:201 |
| S8-02 | Giọng đọc | S8-AC02, S8-AC03, S8-AC09, S8-AC11, S8-AC12 | docs/new/navigation.md:147<br>docs/new/navigation.md:535 | fe/src/app/hooks.ts:1<br>fe/src/app/speech.ts:1<br>fe/src/pages/S8-cai-dat/S8CaiDat.tsx:1<br>fe/src/pages/S8-cai-dat/s8.css:1 | fe/tests/unit/ra-soat.test.tsx:183<br>fe/tests/unit/s8.test.tsx:57<br>fe/tests/unit/s8.test.tsx:92<br>fe/tests/unit/speech.test.ts:30<br>fe/tests/unit/speech.test.ts:42<br>fe/tests/unit/speech.test.ts:77 |
| S8-03 | Âm thanh ngoại tuyến | S8-AC04 | - | fe/src/pages/S8-cai-dat/S8CaiDat.tsx:1 | fe/tests/unit/s8.test.tsx:103 |
| S8-04 | Giao diện | S8-AC05, S8-AC09 | - | fe/src/pages/S8-cai-dat/S8CaiDat.tsx:1<br>fe/src/pages/S8-cai-dat/s8.css:1 | fe/tests/unit/s8.test.tsx:110 |
| S8-05 | Tiến độ | S8-AC06, S8-AC07, S8-AC09, S8-AC13 | docs/new/navigation.md:537<br>docs/new/navigation.md:539<br>docs/new/navigation.md:541 | fe/src/app/hooks.ts:1<br>fe/src/data/transfer.ts:1<br>fe/src/pages/S8-cai-dat/S8CaiDat.tsx:1<br>fe/src/pages/S8-cai-dat/s8.css:1 | fe/tests/unit/dot2-data.test.ts:81<br>fe/tests/unit/ra-soat.test.tsx:78<br>fe/tests/unit/s8.test.tsx:125 |
| S8-06 | Trợ giúp | S8-AC08, S8-AC09 | docs/new/navigation.md:151<br>docs/new/navigation.md:543 | fe/src/pages/S8-cai-dat/S8CaiDat.tsx:1<br>fe/src/pages/S8-cai-dat/s8.css:1 | fe/tests/unit/s8.test.tsx:184 |

## S9 Hướng dẫn lần đầu

Spec: [fe/src/pages/S9-huong-dan/spec.md](../../fe/src/pages/S9-huong-dan/spec.md) · Acceptance: [fe/src/pages/S9-huong-dan/acceptance.md](../../fe/src/pages/S9-huong-dan/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| S9-01 | Khi nào hiện | S9-AC01 | docs/new/navigation.md:80<br>docs/new/navigation.md:82<br>docs/new/navigation.md:216<br>docs/new/navigation.md:218<br>docs/new/navigation.md:220 | fe/src/pages/S9-huong-dan/S9HuongDan.tsx:1 | fe/tests/unit/app.test.tsx:421 |
| S9-02 | Ba bước | S9-AC02, S9-AC06 | - | fe/src/pages/S9-huong-dan/S9HuongDan.tsx:1<br>fe/src/pages/S9-huong-dan/s9.css:1 | - |
| S9-03 | Điều khiển | S9-AC03 | docs/new/navigation.md:84<br>docs/new/navigation.md:86<br>docs/new/navigation.md:222<br>docs/new/navigation.md:224 | fe/src/pages/S9-huong-dan/S9HuongDan.tsx:1 | fe/tests/unit/app.test.tsx:429 |
| S9-04 | Không hiện lại | S9-AC04 | docs/new/navigation.md:88 | fe/src/pages/S9-huong-dan/S9HuongDan.tsx:1 | fe/tests/unit/app.test.tsx:450 |
| S9-05 | Xem lại | S9-AC05 | docs/new/navigation.md:151<br>docs/new/navigation.md:543 | fe/src/pages/S9-huong-dan/S9HuongDan.tsx:1 | fe/tests/unit/s8.test.tsx:184 |

## T1 Học

Spec: [fe/src/pages/T1-hoc/spec.md](../../fe/src/pages/T1-hoc/spec.md) · Acceptance: [fe/src/pages/T1-hoc/acceptance.md](../../fe/src/pages/T1-hoc/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T1-01 | Thẻ câu tiếp theo | T1-AC01, T1-AC02, T1-AC10 | - | fe/src/pages/T1-hoc/T1Hoc.tsx:1<br>fe/src/pages/T1-hoc/t1.css:1 | fe/tests/unit/app.test.tsx:323<br>fe/tests/unit/app.test.tsx:405 |
| T1-02 | Nút chính đổi chữ theo ngữ cảnh | T1-AC03, T1-AC09 | docs/new/navigation.md:34<br>docs/new/navigation.md:123<br>docs/new/navigation.md:282 | fe/src/pages/T1-hoc/T1Hoc.tsx:1 | fe/tests/unit/app.test.tsx:335 |
| T1-03 | Mục tiêu tuần | T1-AC04 | - | fe/src/data/path.ts:1<br>fe/src/pages/T1-hoc/T1Hoc.tsx:1<br>fe/src/pages/T1-hoc/t1.css:1 | fe/tests/unit/app.test.tsx:355 |
| T1-04 | Câu cần ôn | T1-AC05, T1-AC09 | docs/new/navigation.md:123<br>docs/new/navigation.md:284 | fe/src/pages/T1-hoc/T1Hoc.tsx:1<br>fe/src/pages/T1-hoc/t1.css:1 | fe/tests/unit/app.test.tsx:365 |
| T1-05 | Học hết lộ trình | T1-AC06 | docs/new/navigation.md:125<br>docs/new/navigation.md:294 | fe/src/pages/T1-hoc/T1Hoc.tsx:1 | fe/tests/unit/app.test.tsx:378 |
| T1-06 | Bố cục máy tính | T1-AC07 | - | fe/src/pages/T1-hoc/T1Hoc.tsx:1<br>fe/src/pages/T1-hoc/t1.css:1 | - |
| T1-07 | Không đổi câu trên T1 | T1-AC08 | - | fe/src/pages/T1-hoc/T1Hoc.tsx:1 | fe/tests/unit/app.test.tsx:391 |

## T2 Luyện tập

Spec: [fe/src/pages/T2-luyen-tap/spec.md](../../fe/src/pages/T2-luyen-tap/spec.md) · Acceptance: [fe/src/pages/T2-luyen-tap/acceptance.md](../../fe/src/pages/T2-luyen-tap/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T2-01 | Danh sách cách luyện | T2-AC01 | - | fe/src/pages/T2-luyen-tap/T2LuyenTap.tsx:1<br>fe/src/pages/T2-luyen-tap/t2.css:1 | - |
| T2-02 | Ôn tập hôm nay | T2-AC02 | docs/new/navigation.md:127<br>docs/new/navigation.md:407 | fe/src/pages/T2-luyen-tap/T2LuyenTap.tsx:1 | fe/tests/unit/t2-t4.test.tsx:24 |
| T2-03 | Học theo từ khóa | T2-AC03, T2-AC06, T2-AC07 | docs/new/navigation.md:129<br>docs/new/navigation.md:131<br>docs/new/navigation.md:409<br>docs/new/navigation.md:411 | fe/src/app/hooks.ts:1<br>fe/src/pages/T2-luyen-tap/T2LuyenTap.tsx:1<br>fe/src/pages/T2-luyen-tap/t2.css:1 | fe/tests/unit/t2-t4.test.tsx:42<br>fe/tests/unit/t2-t4.test.tsx:64<br>fe/tests/unit/t2-t4.test.tsx:81<br>fe/tests/unit/t2-t4.test.tsx:114<br>fe/tests/unit/t2-t4.test.tsx:289 |
| T2-04 | Kiểm tra nhanh | T2-AC04 | docs/new/navigation.md:34<br>docs/new/navigation.md:133<br>docs/new/navigation.md:413 | fe/src/pages/T2-luyen-tap/T2LuyenTap.tsx:1 | fe/tests/unit/t2-t4.test.tsx:90 |
| T2-05 | Không có kết quả | T2-AC05, T2-AC06 | - | fe/src/pages/T2-luyen-tap/T2LuyenTap.tsx:1<br>fe/src/pages/T2-luyen-tap/t2.css:1 | fe/tests/unit/t2-t4.test.tsx:104 |

## T3 Thư viện

Spec: [fe/src/pages/T3-thu-vien/spec.md](../../fe/src/pages/T3-thu-vien/spec.md) · Acceptance: [fe/src/pages/T3-thu-vien/acceptance.md](../../fe/src/pages/T3-thu-vien/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T3-01 | Danh sách câu | T3-AC01, T3-AC02 | - | fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1<br>fe/src/pages/T3-thu-vien/t3.css:1 | fe/tests/unit/t3.test.tsx:21 |
| T3-02 | Tìm kiếm | T3-AC03 | - | fe/src/app/hooks.ts:1<br>fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1<br>fe/src/pages/T3-thu-vien/filter.ts:1<br>fe/src/pages/T3-thu-vien/t3.css:1 | fe/tests/unit/t3.test.tsx:42<br>fe/tests/unit/t3.test.tsx:220 |
| T3-03 | Bộ lọc | T3-AC04, T3-AC09, T3-AC10 | - | fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1<br>fe/src/pages/T3-thu-vien/filter.ts:1<br>fe/src/pages/T3-thu-vien/t3.css:1 | fe/tests/unit/t3.test.tsx:61<br>fe/tests/unit/t3.test.tsx:134<br>fe/tests/unit/t3.test.tsx:146 |
| T3-04 | Phân trang | T3-AC05 | - | fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1<br>fe/src/pages/T3-thu-vien/filter.ts:1<br>fe/src/pages/T3-thu-vien/t3.css:1 | fe/tests/unit/t3.test.tsx:77 |
| T3-05 | Chi tiết câu | T3-AC06 | docs/new/navigation.md:137<br>docs/new/navigation.md:139<br>docs/new/navigation.md:453<br>docs/new/navigation.md:455 | fe/src/data/stats.ts:1<br>fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1 | fe/tests/unit/t3.test.tsx:103 |
| T3-06 | Không có kết quả | T3-AC07 | - | fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1<br>fe/src/pages/T3-thu-vien/t3.css:1 | fe/tests/unit/t3.test.tsx:121 |
| T3-07 | Bố cục máy tính | T3-AC08 | - | fe/src/app/hooks.ts:1<br>fe/src/pages/T3-thu-vien/T3ThuVien.tsx:1<br>fe/src/pages/T3-thu-vien/t3.css:1 | fe/tests/e2e/dot2.spec.ts:119 |

## T4 Tiến độ

Spec: [fe/src/pages/T4-tien-bo/spec.md](../../fe/src/pages/T4-tien-bo/spec.md) · Acceptance: [fe/src/pages/T4-tien-bo/acceptance.md](../../fe/src/pages/T4-tien-bo/acceptance.md)

| Yêu cầu | Tên | Acceptance | Sơ đồ | Code (@spec) | Test (@ac) |
|---|---|---|---|---|---|
| T4-01 | Khoảng thời gian | T4-AC01 | - | fe/src/data/stats.ts:1<br>fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/t2-t4.test.tsx:137 |
| T4-02 | Ba chỉ số | T4-AC02, T4-AC10 | - | fe/src/data/stats.ts:1<br>fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/dot2-data.test.ts:29<br>fe/tests/unit/t2-t4.test.tsx:152 |
| T4-03 | Mục tiêu mỗi tuần | T4-AC03 | - | fe/src/data/stats.ts:1<br>fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/t2-t4.test.tsx:167 |
| T4-04 | Biểu đồ theo ngày | T4-AC04, T4-AC05 | - | fe/src/data/stats.ts:1<br>fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/t2-t4.test.tsx:184 |
| T4-05 | Lịch ôn tập | T4-AC06, T4-AC10 | - | fe/src/data/stats.ts:1<br>fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/dot2-data.test.ts:29<br>fe/tests/unit/t2-t4.test.tsx:204 |
| T4-06 | Các phiên học | T4-AC07 | - | fe/src/data/stats.ts:1<br>fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/t2-t4.test.tsx:214 |
| T4-07 | Chi tiết ngày | T4-AC08 | docs/new/navigation.md:141<br>docs/new/navigation.md:483 | fe/src/data/stats.ts:1<br>fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/t2-t4.test.tsx:230 |
| T4-08 | Chưa có dữ liệu | T4-AC09 | docs/new/navigation.md:143<br>docs/new/navigation.md:485 | fe/src/pages/T4-tien-bo/T4TienBo.tsx:1<br>fe/src/pages/T4-tien-bo/t4.css:1 | fe/tests/unit/t2-t4.test.tsx:250 |
