# Chuỗi giao diện (FND-AC12, FND-AC13)

Ngày 21/10/2026, Đợt 6 (bản Next.js). Từ Đợt 6 mọi chữ người học nhìn hoặc nghe thấy nằm trong `src/messages/vi.json` (tiếng Việt, mặc định) và `src/messages/en.json` (tiếng Anh), cùng khóa; `npm run messages:check` báo khi hai file lệch khóa, lệch biến hoặc code dùng khóa không có. Danh sách dưới đây sinh từ hai file đó, xếp theo khu vực. Phần trong `{...}` được thay bằng số, tên hay câu khi chạy; thẻ `<link>`, `<vi>` đánh dấu phần chữ thành liên kết hoặc phần tiếng Việt.

Người thử ở buổi FND-AC13 (`docs/thu-that/README.md`) đọc cột tiếng Việt; cột tiếng Anh để đối chiếu nghĩa.

## Đã sửa ở Đợt 6

| Trước | Sau | Lý do |
|---|---|---|
| "Không tải được dữ liệu. …", "Chưa có dữ liệu." | "Không tải được nội dung. …", "Chưa có nội dung để hiện." | FND-12 không dùng "dữ liệu" với người học |
| "Mở thư và bấm liên kết xác nhận" | "Mở thư và nhấn liên kết xác nhận" | FND-12 dùng "nhấn" |
| "ghi chú cách dùng và tình huống" (Landing) | "kèm cách dùng và tình huống" | FND-12 dùng "Cách dùng", không dùng "ghi chú" |

## Tiêu đề trang, mô tả cho máy tìm kiếm (`meta`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `description` | Học câu giao tiếp 15 ngôn ngữ bằng nghĩa tiếng Việt: mỗi phiên 8 câu, nghe giọng đọc, ôn đúng lúc, kiểm tra nhanh. | Learn everyday sentences in 15 languages with Vietnamese meanings: 8 sentences per session, listen to a voice, review at the right time, quick tests. |
| `pages.home` | Học câu giao tiếp 15 ngôn ngữ | Learn everyday sentences in 15 languages |
| `pages.login` | Đăng nhập | Sign in |
| `pages.register` | Đăng ký | Sign up |
| `pages.hoc` | Học | Learn |
| `pages.chonNgonNgu` | Chọn ngôn ngữ | Choose a language |
| `pages.phienHoc` | Phiên học | Study session |
| `pages.luyenTap` | Luyện tập | Practice |
| `pages.kiemTra` | Kiểm tra nhanh | Quick test |
| `pages.thuVien` | Thư viện | Library |
| `pages.unit` | Chi tiết unit | Unit details |
| `pages.tienDo` | Tiến độ | Progress |
| `pages.caiDat` | Cài đặt | Settings |

## Dùng chung (`common`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `search` | Tìm | Search |
| `noMatch` | Không có mục nào khớp. | No matching items. |
| `close` | Đóng | Close |

## Trạng thái tải, lỗi, không có nội dung (`statusDisplay`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `loading` | Đang tải | Loading |
| `failed` | Không tải được nội dung. Kiểm tra kết nối rồi nhấn Thử lại. | Could not load the data. Check your connection, then tap Try again. |
| `dataFailed` | Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại. | Could not load the sentence list. Check your connection, then tap Try again. |
| `retry` | Thử lại | Try again |
| `noData` | Chưa có nội dung để hiện. | No data yet. |
| `na` | Chưa có | Not available |

## Lỗi từ máy chủ tài khoản, đồng bộ (`apiError`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `invalid-credentials` | Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi đăng nhập. | The email or password is not correct. Check them and sign in again. |
| `email-taken` | Email này đã có tài khoản. Đăng nhập bằng email này hoặc dùng email khác. | This email already has an account. Sign in with it or use another email. |
| `weak-password` | Mật khẩu chưa đủ mạnh. Dùng mật khẩu dài hơn, có cả chữ và số. | The password is not strong enough. Use a longer password with letters and numbers. |
| `email-not-confirmed` | Email chưa được xác nhận. Mở thư xác nhận trong hộp thư rồi đăng nhập lại. | Your email is not confirmed yet. Open the confirmation email, then sign in again. |
| `rate-limit` | Bạn thử quá nhiều lần. Đợi một lát rồi thử lại. | Too many attempts. Wait a moment, then try again. |
| `network` | Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại. | Could not reach the server. Check your connection and try again. |
| `sync-failed` | Chưa đồng bộ được tiến độ lên tài khoản. Tiến độ vẫn lưu trên máy này và sẽ gửi lại sau. | Your progress has not been synced to your account yet. It is still saved on this device and will be sent later. |
| `unknown` | Có lỗi xảy ra. Thử lại sau ít phút. | Something went wrong. Try again in a few minutes. |

## Ngôn ngữ giao diện (`locale`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `label` | Ngôn ngữ giao diện | Interface language |
| `name.vi` | Tiếng Việt | Tiếng Việt |
| `name.en` | English | English |

## Khung khu học (thanh bên, header) (`shell`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `sidebar` | Thanh bên | Sidebar |
| `navLabel` | Điều hướng chính | Main navigation |
| `home` | VITASR, về trang Học | VITASR, go to Learn |
| `openMenu` | Mở menu | Open menu |
| `closeMenu` | Đóng menu | Close menu |
| `learning` | Đang học | Learning |
| `groupLearn` | Học tập | Study |
| `groupAccount` | Tài khoản | Account |
| `nav.hoc` | Học | Learn |
| `nav.luyenTap` | Luyện tập | Practice |
| `nav.thuVien` | Thư viện | Library |
| `nav.tienDo` | Tiến độ | Progress |
| `nav.caiDat` | Cài đặt | Settings |
| `reviewBadge` | {count} câu cần ôn | {count, plural, one {# sentence} other {# sentences}} to review |
| `signOut` | Đăng xuất | Sign out |
| `hostLink` | Trang học chính | Main learning site |
| `localMode` | Chế độ thử: tài khoản và tiến độ chỉ lưu trên máy này. | Trial mode: your account and progress are stored on this device only. |
| `toDark` | Chuyển sang giao diện tối | Switch to dark theme |
| `toLight` | Chuyển sang giao diện sáng | Switch to light theme |

## Header và chân trang công khai (`public`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `home` | VITASR, trang chủ | VITASR, home |
| `openApp` | Vào học | Go to app |
| `login` | Đăng nhập | Sign in |
| `register` | Đăng ký | Sign up |
| `hostLink` | Trang học chính | Main learning site |
| `footer` | © {year} VITASR | © {year} VITASR |
| `footerNav` | Liên kết cuối trang | Footer links |

## Dải ngoại tuyến, bộ nhớ bị chặn (`banner`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `offline` | Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy. | You are offline. Your progress is still saved on this device. |
| `storageBlocked` | Trình duyệt đang chặn lưu tiến độ, tiến độ sẽ mất khi đóng app. Cho phép trang này lưu trên máy trong cài đặt trình duyệt rồi mở lại app. | Your browser is blocking storage, so progress will be lost when you close the app. Allow this site to store data in your browser settings, then reopen the app. |

## Bản cập nhật (`update`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `available` | Có bản cập nhật | An update is available |
| `apply` | Cập nhật | Update |

## Đổi ngôn ngữ đang học (`language`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `loading` | Đang tải | Loading |
| `current` | Đang học | Learning now |
| `count` | {count} câu | {count} sentences |
| `choose` | Chọn ngôn ngữ | Choose a language |
| `switchTitle` | Đổi ngôn ngữ hoặc bộ nội dung | Change language or sentence set |
| `loadFailed` | Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại. | Could not load the sentence list. Check your connection, then tap Try again. |
| `retry` | Thử lại | Try again |

## Dải 8 ô (`strip`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `label` | Tiến độ nhóm câu: đã học {learned} trên {total} câu | Group progress: {learned} of {total} sentences learned |
| `cell` | Câu {n}, {state} | Sentence {n}, {state} |
| `state.chua` | chưa học | not learned |
| `state.dang` | đang học | learning |
| `state.nho` | đã nhớ | remembered |
| `state.can-on` | cần ôn | to review |

## Cặp nút đánh giá (`rate`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `review` | Cần ôn lại | Review again |
| `known` | Tôi nhớ | I remember |

## Lựa chọn trắc nghiệm (`choices`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `right` | Đúng | Correct |
| `wrong` | Chưa đúng | Not quite |
| `tryAgain` | Chưa đúng, thử lại | Not quite, try again |

## Thẻ câu (`card`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `reveal` | Nhấn để hiện câu gốc | Tap to show the original sentence |
| `usage` | Cách dùng: {note} | Usage: {note} |
| `listen` | Nghe | Listen |
| `listenLoop` | Nghe lặp | Repeat |
| `stop` | Dừng | Stop |
| `noVoice` | Thiết bị chưa có giọng {lang}. Mở <link>Cài đặt > Giọng đọc</link>. | This device has no {lang} voice yet. Open <link>Settings > Voices</link>. |

## Trạng thái câu (`status`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `chua-hoc` | Chưa học | Not learned |
| `da-nho` | Đã nhớ | Remembered |
| `can-on` | Cần ôn | To review |

## Unit (`unit`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `name` | Unit {n} | Unit {n} |
| `count` | {count} câu | {count, plural, one {# sentence} other {# sentences}} |
| `remembered` | câu đã nhớ | sentences remembered |

## Chi tiết câu (`detail`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `lastStudied` | Học lần cuối: {when} | Last studied: {when} |

## Phân trang (`pager`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `label` | Phân trang | Pagination |
| `prev` | Trước | Previous |
| `next` | Sau | Next |
| `page` | Trang {n}/{total} | Page {n}/{total} |

## Cách học (nguồn phiên) (`nguon`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `lo-trinh` | Học theo lộ trình | Learning path |
| `on-tap` | Ôn tập | Review |
| `tu-khoa` | Học theo từ khóa | By keyword |
| `cau` | Học một câu | Single sentence |
| `unit` | Học theo unit | By unit |
| `kiem-tra` | Kiểm tra nhanh | Quick test |

## S1 Chọn ngôn ngữ (`s1`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Bạn muốn học ngôn ngữ nào? | Which language do you want to learn? |
| `note` | Bạn có thể đổi ngôn ngữ sau ở thanh bên hoặc trong Cài đặt. | You can change the language later in the sidebar or in Settings. |
| `back` | Quay lại | Back |
| `packTitle` | Học {lang} với bộ nào? | Which set do you want for {lang}? |
| `packNote` | Bạn có thể đổi bộ sau ở thanh bên hoặc trong Cài đặt. | You can change the set later in the sidebar or in Settings. |
| `packCount` | {count} bộ | {count, plural, one {# set} other {# sets}} |
| `packDescription.global` | Câu theo chủ đề và tình huống, có giải thích cách dùng; 6 trình độ A1 đến C2. | Sentences by topic and situation, with usage notes; 6 levels from A1 to C2. |
| `packDescription.fluency` | Câu luyện nói theo mẫu câu. | Speaking practice with sentence patterns. |
| `loadFailed` | Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại. | Could not load the sentence list. Check your connection, then tap Try again. |

## T1 Học (`t1`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Học | Learn |
| `goal` | Tuần này: {done}/{goal} phiên | This week: {done}/{goal} sessions |
| `goalReached` | Tuần này: đã đạt mục tiêu {done}/{goal} phiên | This week: goal reached, {done}/{goal} sessions |
| `review` | {count} câu cần ôn hôm nay | {count, plural, one {# sentence} other {# sentences}} to review today |
| `allDone` | Bạn đã học hết {count} câu {lang}. Vào Luyện tập để ôn lại. | You have learned all {count} {lang} sentences. Go to Practice to review. |
| `openPractice` | Mở Luyện tập | Open Practice |
| `position` | Câu {n}/{total} | Sentence {n}/{total} |
| `unitLink` | Unit {n} | Unit {n} |
| `continue` | Tiếp tục: {count} câu còn lại | Continue: {count, plural, one {# sentence} other {# sentences}} left |
| `start` | Học {count} câu | Learn {count} sentences |
| `nextUnits` | Unit tiếp theo | Next units |
| `allUnits` | Xem tất cả unit | See all units |
| `yourProgress` | Tiến độ của bạn | Your progress |
| `learned` | {learned}/{total} câu | {learned}/{total} sentences |
| `learnedLabel` | Số câu đã học | Sentences learned |
| `unitsLearned` | {count} unit đã học | {count} units learned |
| `seeProgress` | Xem tiến độ | See progress |

## S9 Hướng dẫn lần đầu (`s9`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `step` | Bước {n}/{total} | Step {n}/{total} |
| `text.card` | Đây là câu bạn sẽ học. Nút Nghe sẽ đọc to câu này cho bạn. | This is the sentence you will learn. The Listen button reads it aloud for you. |
| `text.start` | Mỗi phiên học có 8 câu, mất khoảng 5 phút. | Each session has 8 sentences and takes about 5 minutes. |
| `text.nav` | Ôn tập và kiểm tra nằm ở mục Luyện tập. Kết quả học nằm ở mục Tiến độ. | Reviews and tests are in Practice. Your results are in Progress. |
| `skip` | Bỏ qua | Skip |
| `next` | Tiếp | Next |
| `done` | Xong | Done |
| `start` | Bắt đầu học | Start learning |

## S3 Phiên học (`s3`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Phiên học | Study session |
| `exit` | Thoát | Exit |
| `position` | Câu {n}/{total} | Sentence {n}/{total} |
| `emptyGroup` | Không có câu nào để học trong nhóm này. | There are no sentences to learn in this group. |
| `exitTitle` | Dừng phiên học? | Stop this session? |
| `exitBody` | Bạn đã học {done}/{total} câu. Kết quả các câu này vẫn được lưu. | You have learned {done}/{total} sentences. Their results are saved. |
| `exitBodyNone` | Bạn chưa học xong câu nào. | You have not finished any sentence yet. |
| `stop` | Dừng | Stop |
| `keepGoing` | Học tiếp | Keep learning |
| `question` | Câu này nghĩa là gì? | What does this sentence mean? |
| `hint` | Nghĩa bắt đầu bằng "{first}…", gồm {words} từ. | The meaning starts with "{first}…" and has {words, plural, one {# word} other {# words}}. |
| `showHint` | Xem gợi ý | Show hint |
| `next` | Câu tiếp | Next sentence |
| `seeSummary` | Xem tổng kết | See summary |
| `doneTitle` | Xong phiên học | Session complete |
| `score` | câu nhớ được không cần gợi ý | sentences remembered without a hint |
| `reviewTitle` | Cần ôn lại | To review |
| `nextGroup` | Nhóm tiếp | Next group |
| `learnMore` | Học tiếp {count} câu | Learn {count} more sentences |
| `seeProgress` | Xem tiến độ | See progress |
| `finish` | Xong | Done |

## T2 Luyện tập (`t2`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Luyện tập | Practice |
| `description` | Ôn câu đến hạn, học theo từ bạn cần, hoặc tự kiểm tra một unit. | Review sentences that are due, learn by keyword, or test yourself on a unit. |
| `reviewTitle` | Ôn tập hôm nay | Today's review |
| `reviewDesc` | Các câu đến hạn ôn hôm nay, gồm cả câu bạn chưa nhớ hoặc trả lời chưa đúng. | Sentences due today, including ones you did not remember or answered incorrectly. |
| `reviewNone` | Hôm nay không có câu nào cần ôn. | There is nothing to review today. |
| `keywordTitle` | Học theo từ khóa | Learn by keyword |
| `keywordDesc` | Tìm câu theo từ bạn cần, ví dụ đặt phòng, ăn uống, sân bay. | Find sentences by the words you need, for example <vi>đặt phòng, ăn uống, sân bay</vi>. |
| `testTitle` | Kiểm tra nhanh | Quick test |
| `testDesc` | Nghe và chọn nghĩa, nghe theo cụm, sắp xếp câu. | Listen and choose the meaning, listen by chunks, put the sentence in order. |
| `paused` | Đang làm dở: Unit {unit}, bước {step}, câu {n}/{total} | In progress: Unit {unit}, step {step}, sentence {n}/{total} |
| `keywordPlaceholder` | Ví dụ: đặt phòng, sân bay | For example: đặt phòng, sân bay |
| `keywordLabel` | Từ khóa | Keyword |
| `clear` | Xóa từ khóa | Clear keyword |
| `suggestions` | Gợi ý | Suggestions |
| `chips[0]` | đặt phòng | đặt phòng |
| `chips[1]` | ăn uống | ăn uống |
| `chips[2]` | sân bay | sân bay |
| `chips[3]` | mua sắm | mua sắm |
| `noResult` | Không có câu nào chứa "{q}". Thử từ khác bằng tiếng Việt hoặc {lang}. | No sentence contains "{q}". Try another word in Vietnamese or {lang}. |
| `found` | Tìm thấy {count} câu | {count} sentences found |
| `learnN` | Học {count} câu | Learn {count, plural, one {# sentence} other {# sentences}} |
| `learn8` | Học 8 câu đầu | Learn the first 8 |

## S5 Kiểm tra nhanh (`s5`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Kiểm tra nhanh | Quick test |
| `exit` | Thoát | Exit |
| `unitLine` | Kiểm tra nhanh · Unit {n} | Quick test · Unit {n} |
| `itemCount` | {count} câu | {count, plural, one {# sentence} other {# sentences}} |
| `step.nghe-chon` | Nghe và chọn nghĩa | Listen and choose |
| `step.nghe-cum` | Nghe theo cụm | Listen by chunks |
| `step.sap-xep` | Sắp xếp câu | Put in order |
| `stepInline.nghe-chon` | nghe và chọn nghĩa | listen and choose |
| `stepInline.nghe-cum` | nghe theo cụm | listen by chunks |
| `stepInline.sap-xep` | sắp xếp câu | put in order |
| `stepDesc.nghe-chon` | Nghe câu rồi chọn nghĩa đúng. | Listen to the sentence, then choose its meaning. |
| `stepDesc.nghe-cum` | Mở từng cụm của câu để nghe. | Open each chunk of the sentence to listen. |
| `stepDesc.sap-xep` | Xếp các cụm theo đúng thứ tự. | Put the chunks in the right order. |
| `allSteps` | Làm cả 3 bước | Do all 3 steps |
| `onlyStep` | Chỉ {step} | Only {step} |
| `resume` | Làm tiếp | Continue |
| `restart` | Làm lại từ đầu | Start over |
| `pauseTitle` | Tạm dừng kiểm tra? | Pause the test? |
| `pauseBody` | Bài làm dở được lưu, lần sau làm tiếp từ câu này. | Your answers so far are saved; next time you continue from this sentence. |
| `pause` | Tạm dừng | Pause |
| `position` | Câu {n}/{total} | Sentence {n}/{total} |
| `dots` | Bước {n}/{total} | Step {n}/{total} |
| `dot` | {step}, {state} | {step}, {state} |
| `dotState.xong` | đã xong | done |
| `dotState.dang` | đang làm | in progress |
| `dotState.chua` | chưa làm | not started |
| `replay` | Nghe lại | Listen again |
| `noVoice` | Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh. | This device has no voice yet, so this test shows text instead of audio. |
| `question` | Câu bạn nghe nghĩa là gì? | What does the sentence you heard mean? |
| `next` | Câu tiếp | Next sentence |
| `tapChunks` | Nhấn từng cụm để nghe. | Tap each chunk to listen. |
| `chunk` | Cụm {n} | Chunk {n} |
| `chunkCovered` | Cụm {n}, đang che | Chunk {n}, hidden |
| `yourSentence` | Câu của bạn | Your sentence |
| `arrangeHint` | Nhấn các cụm bên dưới theo đúng thứ tự. | Tap the chunks below in the right order. |
| `chunks` | Các cụm | Chunks |
| `chunkWrong` | {text}, chưa đúng vị trí | {text}, wrong position |
| `right` | Đúng | Correct |
| `wrong` | Chưa đúng. Nhấn các cụm có dấu x để đưa về hàng cụm, rồi xếp lại. | Not quite. Tap the chunks marked with x to move them back, then try again. |
| `check` | Kiểm tra | Check |
| `doneTitle` | Xong kiểm tra | Test complete |
| `resultLine` | {step}: {n}/{total} | {step}: {n}/{total} |
| `tested` | Đã kiểm tra {count} câu. | {count, plural, one {# sentence} other {# sentences}} tested. |
| `reviewTitle` | Câu cần xem lại | Sentences to look at again |
| `listen` | Nghe | Listen |
| `listenTo` | Nghe: {text} | Listen: {text} |
| `nextUnit` | Kiểm tra unit tiếp theo | Test the next unit |
| `finish` | Xong | Done |

## T3 Thư viện (`t3`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Thư viện | Library |
| `descUnits` | Các unit của bộ câu. Chọn một unit để xem câu và bắt đầu học. | The units of this sentence set. Choose a unit to see its sentences and start learning. |
| `descItems` | Tìm câu theo từ khóa, lọc theo unit, trạng thái, chủ đề, trình độ. | Search sentences by keyword and filter by unit, status, topic or level. |
| `viewLabel` | Cách xem | View |
| `viewUnit` | Unit | Units |
| `viewUnitAria` | Xem theo unit | View by unit |
| `viewItem` | Câu | Sentences |
| `viewItemAria` | Xem theo câu | View by sentence |
| `unitList` | Danh sách unit | Unit list |
| `unitSummary` | {total} unit · đã học {learned} · đang học dở {partial} | {total} units · {learned} learned · {partial} in progress |
| `level` | Trình độ | Level |
| `searchPlaceholder` | Tìm câu hoặc nghĩa | Search sentences or meanings |
| `clear` | Xóa từ khóa | Clear keyword |
| `all` | Tất cả | All |
| `filterUnit` | Unit | Unit |
| `findUnit` | Tìm unit | Find a unit |
| `filterStatus` | Trạng thái | Status |
| `filterTopic` | Chủ đề | Topic |
| `findTopic` | Tìm chủ đề | Find a topic |
| `filterLevel` | Trình độ | Level |
| `topicCount` | {count} câu | {count} sentences |
| `count` | {count} câu | {count} sentences |
| `empty` | Không có câu nào khớp với tìm kiếm và bộ lọc hiện tại. | No sentence matches the current search and filters. |
| `clearAll` | Xóa tìm kiếm và bộ lọc | Clear search and filters |
| `itemTitle` | Câu {id} | Sentence {id} |
| `learnThis` | Học câu này | Learn this sentence |
| `detailLabel` | Chi tiết câu | Sentence details |

## S10 Chi tiết Unit (`s10`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `breadcrumb` | Đường dẫn | Breadcrumb |
| `library` | Thư viện | Library |
| `learnUnit` | Học unit này | Learn this unit |
| `reviewUnit` | Ôn lại unit này | Review this unit |
| `testUnit` | Kiểm tra nhanh unit này | Quick test this unit |
| `items` | Các câu trong unit ({count}) | Sentences in this unit ({count}) |
| `prevNext` | Unit trước và sau | Previous and next unit |

## T4 Tiến độ (`t4`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Tiến độ | Progress |
| `description` | Số phiên, số câu đã học, mục tiêu tuần và lịch ôn tập. | Sessions, sentences learned, your weekly goal and review schedule. |
| `rangeLabel` | Khoảng thời gian | Time range |
| `range` | {count} ngày | {count, plural, one {# day} other {# days}} |
| `empty` | Bạn chưa hoàn thành phiên học nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến độ. | You have not finished a session yet. Learn your first 8 sentences to start tracking progress. |
| `emptyAction` | Học 8 câu | Learn 8 sentences |
| `statSessions` | phiên học | sessions |
| `statItems` | câu đã học | sentences learned |
| `statDue` | câu cần ôn hôm nay | sentences to review today |
| `goal` | Mục tiêu mỗi tuần | Weekly goal |
| `goalValue` | {done}/{goal} phiên | {done}/{goal} sessions |
| `chart` | Số câu đã học mỗi ngày | Sentences learned per day |
| `bar` | {day}: {count} câu | {day}: {count, plural, one {# sentence} other {# sentences}} |
| `day` | Ngày | Day |
| `count` | Số câu | Sentences |
| `schedule` | Lịch ôn tập | Review schedule |
| `when.today` | Hôm nay | Today |
| `when.tomorrow` | Ngày mai | Tomorrow |
| `when.next7` | 7 ngày tới | Next 7 days |
| `itemsCount` | {count} câu | {count} sentences |
| `sessions` | Các phiên học | Sessions |
| `colTime` | Giờ | Time |
| `colSource` | Cách học | Type |
| `colResult` | Kết quả | Result |
| `more` | Xem thêm | Show more |
| `dayItems` | Câu đã học ({count}) | Sentences learned ({count}) |

## S8 Cài đặt (`s8`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `title` | Cài đặt | Settings |
| `description` | Mục tiêu học, giọng đọc, giao diện, tiến độ và tài khoản. | Goals, voices, appearance, progress and account. |
| `back` | Quay lại | Back |
| `groupLearn` | Học tập | Study |
| `goal` | Mục tiêu mỗi tuần | Weekly goal |
| `goalDown` | Giảm mục tiêu | Decrease goal |
| `goalUp` | Tăng mục tiêu | Increase goal |
| `goalValue` | {count} phiên | {count, plural, one {# session} other {# sessions}} |
| `language` | Ngôn ngữ đang học | Language you are learning |
| `groupSound` | Âm thanh | Sound |
| `voices` | Giọng đọc | Voices |
| `auto` | Tự động | Automatic |
| `autoWith` | Tự động ({voice}) | Automatic ({voice}) |
| `autoUsing` | Đang dùng {voice} | Using {voice} |
| `voiceFor` | Chọn giọng cho | Choose a voice for |
| `voiceOf` | Giọng {lang} | {lang} voice |
| `vietnamese` | Tiếng Việt | Vietnamese |
| `vietnameseMid` | tiếng Việt | Vietnamese |
| `noVoices` | Thiết bị chưa có giọng {lang}. Thêm giọng trong cài đặt hệ thống của thiết bị rồi mở lại app. | This device has no {lang} voice yet. Add one in your device's system settings, then reopen the app. |
| `tryVoice` | Nghe thử | Try it |
| `rate` | Tốc độ đọc | Reading speed |
| `done` | Xong | Done |
| `groupDisplay` | Giao diện | Appearance |
| `theme` | Sáng, tối | Light or dark |
| `themeSystem` | Theo thiết bị | Same as device |
| `themeLight` | Sáng | Light |
| `themeDark` | Tối | Dark |
| `uiLanguage` | Ngôn ngữ giao diện | Interface language |
| `groupProgress` | Tiến độ | Progress |
| `export` | Xuất tiến độ | Export progress |
| `import` | Nhập tiến độ | Import progress |
| `importInvalid` | Tệp này không phải tệp tiến độ học {who} của VITASR. Chọn tệp đã xuất bằng Xuất tiến độ khi đang học {who}. | This is not a VITASR progress file for {who}. Choose a file you exported with Export progress while learning {who}. |
| `importConfirm` | Thay tiến độ {who} hiện tại bằng tệp này? | Replace your current {who} progress with this file? |
| `imported` | Đã nhập tiến độ | Progress imported |
| `cancel` | Hủy | Cancel |
| `deleteRow` | Xóa tiến độ {lang} | Delete {lang} progress |
| `deleteTitle` | Xóa tiến độ {lang} | Delete {lang} progress |
| `deleteBody` | Gõ "{name}" để xác nhận. Tiến độ đã xóa không lấy lại được. | Type "{name}" to confirm. Deleted progress cannot be recovered. |
| `deleteLabel` | Tên ngôn ngữ | Language name |
| `deleteMismatch` | Gõ đúng tên ngôn ngữ, đủ dấu, để mở nút Xóa. | Type the language name exactly, with its accents, to enable Delete. |
| `delete` | Xóa | Delete |
| `deleted` | Đã xóa tiến độ | Progress deleted |
| `groupAccount` | Tài khoản | Account |
| `email` | Email | Email |
| `signOut` | Đăng xuất | Sign out |
| `groupHelp` | Trợ giúp | Help |
| `replayGuide` | Xem lại hướng dẫn | Replay the guide |
| `version` | Phiên bản {version} | Version {version} |

## Đăng nhập, đăng ký (`auth`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `signInTitle` | Đăng nhập | Sign in |
| `signInDesc` | Đăng nhập để tiếp tục học và giữ tiến độ của bạn. | Sign in to keep learning and keep your progress. |
| `signUpTitle` | Tạo tài khoản | Create an account |
| `signUpDesc` | Tài khoản giữ tiến độ học của bạn trên mọi máy bạn đăng nhập. | Your account keeps your progress on every device you sign in to. |
| `email` | Email | Email |
| `password` | Mật khẩu | Password |
| `confirm` | Nhập lại mật khẩu | Repeat password |
| `passwordHint` | Ít nhất {min} ký tự. | At least {min} characters. |
| `signIn` | Đăng nhập | Sign in |
| `signUp` | Tạo tài khoản | Create account |
| `noAccount` | Chưa có tài khoản? <link>Đăng ký</link> | No account yet? <link>Sign up</link> |
| `haveAccount` | Đã có tài khoản? <link>Đăng nhập</link> | Already have an account? <link>Sign in</link> |
| `checkEmail` | Đã gửi thư xác nhận tới {email}. Mở thư và nhấn liên kết xác nhận, rồi quay lại đăng nhập. | We sent a confirmation email to {email}. Open it, click the confirmation link, then come back to sign in. |
| `localMode` | Chế độ thử: app chưa nối máy chủ tài khoản, tài khoản và tiến độ chỉ lưu trên máy này. | Trial mode: the app is not connected to an account server, so accounts and progress are stored on this device only. |
| `asideTitle` | Học mỗi ngày, mỗi lần 8 câu | Learn every day, 8 sentences at a time |
| `aside.a` | 15 ngôn ngữ, nghĩa tiếng Việt cho từng câu. | 15 languages, with a Vietnamese meaning for every sentence. |
| `aside.b` | Ôn đúng lúc: câu cần ôn tự xếp lịch theo ngày. | Review at the right time: sentences to review are scheduled by day. |
| `aside.c` | Tiến độ theo tài khoản, đăng nhập máy khác vẫn học tiếp được. | Progress follows your account, so you can continue on another device. |
| `aside.cLocal` | Tiến độ lưu trên máy này; xuất, nhập tiến độ bằng tệp khi đổi máy. | Progress is stored on this device; export and import it with a file when you switch devices. |
| `errors.emailRequired` | Nhập email. | Enter your email. |
| `errors.emailInvalid` | Email chưa đúng dạng, ví dụ ten@gmail.com. | This email does not look right, for example name@gmail.com. |
| `errors.passwordRequired` | Nhập mật khẩu. | Enter your password. |
| `errors.passwordShort` | Mật khẩu cần ít nhất {min} ký tự. | The password needs at least {min} characters. |
| `errors.confirmRequired` | Nhập lại mật khẩu. | Repeat your password. |
| `errors.confirmMismatch` | Hai mật khẩu chưa giống nhau. | The two passwords do not match. |
| `signUpDescLocal` | Tài khoản thử chỉ có trên máy này, tiến độ cũng lưu trên máy này. | Trial accounts exist on this device only, and so does the progress. |

## Landing (`landing`)

| Khóa | Tiếng Việt | Tiếng Anh |
|---|---|---|
| `eyebrow` | VITASR Đa ngôn ngữ | VITASR Multilingual |
| `title` | Học câu giao tiếp dùng được ngay, bằng nghĩa tiếng Việt | Learn everyday sentences you can use right away, with Vietnamese meanings |
| `lead` | {languages} ngôn ngữ. Mỗi phiên 8 câu trong khoảng 5 phút: đọc nghĩa, nghe giọng đọc, tự đánh giá, rồi chọn nghĩa đúng. App nhắc ôn đúng lúc để câu đã học không bị quên. | {languages} languages. Each session is 8 sentences in about 5 minutes: read the meaning, listen to a voice, rate yourself, then choose the right meaning. The app reminds you to review at the right time so you keep what you learned. |
| `ctaStart` | Bắt đầu học | Start learning |
| `ctaExplore` | Khám phá các bộ câu | Explore the sentence sets |
| `ctaRegister` | Tạo tài khoản | Create an account |
| `haveAccount` | Đã có tài khoản? <link>Đăng nhập</link> | Already have an account? <link>Sign in</link> |
| `shotAlt` | Màn Học của VITASR: thẻ câu, nút Nghe, nút Học 8 câu và các unit tiếp theo | The VITASR Learn screen: a sentence card, the Listen button, the Learn 8 sentences button and the next units |
| `audienceTitle` | Dành cho ai | Who it is for |
| `audience.learner.title` | Người Việt học ngoại ngữ | Vietnamese speakers learning a language |
| `audience.learner.body` | Mọi câu có nghĩa tiếng Việt, kèm cách dùng và tình huống, không cần biết trước ngôn ngữ đó. | Every sentence has a Vietnamese meaning, usage notes and a situation; no prior knowledge needed. |
| `audience.busy.title` | Người bận, học từng chút | Busy people learning bit by bit |
| `audience.busy.body` | Mỗi phiên chỉ 8 câu. Dừng giữa chừng vẫn giữ kết quả, lần sau học tiếp đúng chỗ. | Just 8 sentences per session. Stop halfway and your results are kept; next time you continue where you left off. |
| `audience.traveler.title` | Người cần câu cho việc cụ thể | People who need sentences for a task |
| `audience.traveler.body` | Tìm câu theo từ khóa như đặt phòng, sân bay, ăn uống rồi học ngay nhóm câu đó. | Search by keyword such as <vi>đặt phòng, sân bay, ăn uống</vi> and learn that group of sentences right away. |
| `contentTitle` | Nội dung có sẵn | What is available |
| `statLanguages` | ngôn ngữ, kèm nghĩa tiếng Việt | languages, with Vietnamese meanings |
| `statFluency` | English Fluency, mỗi ngôn ngữ {units} unit | English Fluency, {units} units per language |
| `itemsPerLanguage` | {count} câu | {count} sentences |
| `statGlobal` | Global English (tiếng Anh, A1 đến C2), {units} unit | Global English (English, A1 to C2), {units} units |
| `items` | {count} câu | {count} sentences |
| `featuresTitle` | Bạn học như thế nào | How you learn |
| `features.session.title` | Phiên 8 câu | 8-sentence sessions |
| `features.session.body` | Xem nghĩa, nhớ câu gốc, tự chấm "Tôi nhớ" hoặc "Cần ôn lại", rồi chọn nghĩa đúng để kiểm tra. | See the meaning, recall the original, rate "I remember" or "Review again", then choose the right meaning. |
| `features.listen.title` | Nghe giọng đọc | Listen to a voice |
| `features.listen.body` | Nghe một lần hoặc nghe lặp từng câu bằng giọng đọc của thiết bị, chỉnh được tốc độ. | Listen once or on repeat with your device's voice, at the speed you choose. |
| `features.review.title` | Ôn đúng lúc | Review at the right time |
| `features.review.body` | Câu bạn nhớ được ôn lại sau 1, 3, 7, 14 rồi 30 ngày; câu chưa nhớ hoặc trả lời chưa đúng được đưa vào ôn ngay. | Sentences you remember come back after 1, 3, 7, 14 and then 30 days; ones you missed come back right away. |
| `features.test.title` | Kiểm tra nhanh | Quick tests |
| `features.test.body` | Ba bước cho mỗi unit: nghe và chọn nghĩa, nghe theo cụm, sắp xếp câu. Tạm dừng và làm tiếp được. | Three steps per unit: listen and choose, listen by chunks, put in order. Pause and continue any time. |
| `features.library.title` | Thư viện theo unit | A library by unit |
| `features.library.body` | Xem các unit và tiến độ từng unit, tìm câu, lọc theo chủ đề, trình độ, trạng thái. | See units and the progress of each, search sentences, filter by topic, level and status. |
| `features.progress.title` | Theo dõi tiến độ | Track your progress |
| `features.progress.body` | Số câu đã học mỗi ngày, mục tiêu phiên mỗi tuần và lịch ôn của những ngày tới. | Sentences learned per day, a weekly session goal and the review schedule for the days ahead. |
| `stepsTitle` | Bắt đầu trong ba bước | Get started in three steps |
| `steps.choose.title` | Tạo tài khoản và chọn ngôn ngữ | Create an account and choose a language |
| `steps.choose.body` | Chọn một trong các ngôn ngữ; tiếng Anh có hai bộ câu để chọn. | Pick one of the languages; English has two sentence sets to choose from. |
| `steps.learn.title` | Học nhóm 8 câu đầu tiên | Learn your first 8 sentences |
| `steps.learn.body` | App dẫn từng bước trong lần đầu; mỗi nhóm khoảng 5 phút. | The app guides you the first time; each group takes about 5 minutes. |
| `steps.review.title` | Quay lại ôn và kiểm tra | Come back to review and test |
| `steps.review.body` | Mục Luyện tập cho biết hôm nay có bao nhiêu câu cần ôn. | Practice shows how many sentences you have to review today. |
| `finalTitle` | Học 8 câu đầu tiên ngay hôm nay | Learn your first 8 sentences today |
| `finalBody` | Tạo tài khoản, chọn ngôn ngữ và học nhóm câu đầu tiên. | Create an account, choose a language and learn your first group. |
