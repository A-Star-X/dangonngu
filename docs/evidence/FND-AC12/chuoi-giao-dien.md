# Rà soát chuỗi giao diện (FND-AC12)

Ngày 18/10/2026, Claude, rà lại toàn bộ sau phản hồi của người dùng ("Tiến bộ" nghe không tự nhiên, câu sai cần dễ thấy hơn). Danh sách gồm mọi chuỗi người học nhìn hoặc nghe thấy trong `fe/src`, rút bằng cây cú pháp TypeScript: chữ trong JSX (ghép cả phần xuống dòng và phần chèn biến), các thuộc tính `aria-label`, `placeholder`, `title`, và chuỗi trong mã có dấu tiếng Việt hoặc có dạng câu. Phần trong `{...}` hoặc `${...}` được thay bằng số, tên hay câu khi chạy. Không tính thông báo lỗi chỉ dành cho lập trình viên (`fe/src/data/contract.ts`, `source.ts`, `throw new Error`). Chuỗi một chữ không dấu nằm trong biểu thức (ví dụ "Nghe" trong `active ? 'Dừng' : 'Nghe'`) có thể không có trong danh sách; người thử ở buổi FND-AC13 nên dùng thêm app.

## Đã sửa trong đợt này

| Trước | Sau | Lý do |
|---|---|---|
| Tên khu "Tiến bộ", "Xem tiến bộ", "theo dõi tiến bộ" | "Tiến độ", "Xem tiến độ", "theo dõi tiến độ" | "Tiến bộ" nói về sự giỏi lên, không phải nơi xem số phiên, số câu, lịch ôn; "Tiến độ" khớp với nhóm "Tiến độ" ở Cài đặt (xuất, nhập, xóa tiến độ) |
| "Chạm để hiện câu gốc", "Chạm từng cụm…", "Chạm các cụm…", "bấm Thử lại" | "Nhấn …" | App ưu tiên máy tính; "nhấn" đúng cho cả chuột lẫn màn cảm ứng (FND-12) |
| "Thiết bị chưa có giọng Tiếng Anh", "Xóa tiến độ Tiếng Anh", "tiến độ VITASR của Tiếng Anh (…)" | "tiếng Anh"; câu báo tệp sai viết lại thành "Tệp này không phải tệp tiến độ học tiếng Anh (…) của VITASR. …" | Tên ngôn ngữ giữa câu viết thường chữ đầu (FND-12); câu cũ đọc ngượng |
| "Ôn câu cần ôn" | "Ôn tập hôm nay" | Bỏ lặp chữ "ôn"; khớp tên nguồn phiên "Ôn tập" ở danh sách phiên |
| "Tìm câu có chữ như đặt phòng…" | "Tìm câu theo từ bạn cần, ví dụ đặt phòng…" | Câu cũ khó hiểu |
| "Nghe hiểu, nghe theo cụm, sắp xếp câu." | "Nghe và chọn nghĩa, nghe theo cụm, sắp xếp câu." | Trùng tên ba bước của Kiểm tra nhanh |
| "Ví dụ: đặt phòng, airport"; "Thử từ khác hoặc từ tiếng Anh." | "Ví dụ: đặt phòng, sân bay"; "Thử từ khác bằng tiếng Việt hoặc [ngôn ngữ đang học]." | Câu cũ luôn nói tiếng Anh dù đang học tiếng Nhật, Đức… |
| "Không có câu cần ôn hôm nay." | "Hôm nay không có câu nào cần ôn." | Tự nhiên hơn |
| "Lộ trình", "Từ khóa", "Một câu", "Kiểm tra" (nguồn phiên ở Tiến độ) | "Học theo lộ trình", "Học theo từ khóa", "Học một câu", "Kiểm tra nhanh" | Trùng tên lối vào của từng cách học |
| "phiên", "cần ôn hôm nay", "Lịch ôn", "Các phiên" (Tiến độ) | "phiên học", "câu cần ôn hôm nay", "Lịch ôn tập", "Các phiên học" | Đủ nghĩa khi đọc riêng từng nhãn |
| "Chưa có phiên nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến bộ." | "Bạn chưa hoàn thành phiên học nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến độ." | Gọi người học là "bạn", nói rõ "hoàn thành" |
| "Dừng phiên?" / "Tiến độ 3/8 câu được giữ lại." | "Dừng phiên học?" / "Bạn đã học 3/8 câu. Kết quả các câu này vẫn được lưu." (chưa xong câu nào: "Bạn chưa học xong câu nào.") | Câu cũ khó hiểu; giống câu của Dừng kiểm tra |
| "Xong phiên" | "Xong phiên học" | Đủ nghĩa |
| "Có thể đổi sau ở thanh trên cùng." | "Bạn có thể đổi ngôn ngữ sau ở thanh trên cùng hoặc trong Cài đặt." | Gọi người học là "bạn"; giống dòng ghi chú của bước chọn bộ |
| "Đang ngoại tuyến. …" | "Bạn đang ngoại tuyến. …" | Gọi người học là "bạn" |
| Hướng dẫn: "Chạm Nghe để nghe phát âm.", "Mỗi phiên có 8 câu, khoảng 5 phút.", "Ôn lại và kiểm tra nằm ở Luyện tập. Kết quả nằm ở Tiến bộ." | "Nút Nghe sẽ đọc to câu này cho bạn.", "Mỗi phiên học có 8 câu, mất khoảng 5 phút.", "Ôn tập và kiểm tra nằm ở mục Luyện tập. Kết quả học nằm ở mục Tiến độ." | Lớp hướng dẫn che nút Nghe nên không bảo bấm; tên khu mới |
| "Giọng cho", "Mặc định của thiết bị" | "Chọn giọng cho", "Tự động" (kèm "Đang dùng [tên giọng]") | Giọng mặc định nay là giọng tự chọn (S8-02) |
| "Mục tiêu tuần" (Tiến độ) | "Mục tiêu mỗi tuần" | Cùng tên với mục ở Cài đặt |
| Nhãn trợ năng "Tiến độ nhóm câu: 3 trên 8 đã học" | "Tiến độ nhóm câu: đã học 3 trên 8 câu" | Đọc tự nhiên hơn |
| Nhãn trợ năng "Khu chính" | "Điều hướng chính" | Rõ nghĩa với trình đọc màn hình |
| (mới) | "Đúng", "Chưa đúng" cạnh lựa chọn; "Chưa đúng. Nhấn các cụm có dấu x để đưa về hàng cụm, rồi xếp lại." | Câu sai dễ thấy hơn (FND-02) |

## Kết quả rà theo FND-12

- Không còn từ trong cột "Không dùng" (File, dữ liệu, record, Text, original, Bản dịch, translation, Note, ghi chú, Sai, chưa thuộc, Session, lesson, TEST NOW, Test3, Tiến bộ).
- Nút và thông báo cùng luồng dùng cùng động từ: Nhập tiến độ / Đã nhập tiến độ; Xóa tiến độ / Xóa / Đã xóa tiến độ; Dừng phiên học? / Dừng, Học tiếp; Dừng kiểm tra? / Dừng, Làm tiếp; Có bản cập nhật / Cập nhật; Không có câu nào khớp... / Xóa tìm kiếm và bộ lọc.
- Mọi thông báo lỗi có hướng xử lý: lỗi tải (nhấn Thử lại), bộ nhớ bị chặn (cho phép trang này lưu trên máy...), nhập tiến độ sai tệp (chọn tệp đã xuất bằng Xuất tiến độ...), chọn sai nghĩa (thử lại), xếp sai (nhấn các cụm có dấu x...), thiếu giọng (mở Cài đặt > Giọng đọc; thêm giọng trong cài đặt hệ thống...), không tìm thấy câu (thử từ khác...).
- Giữ nguyên có chủ ý: "Unit" (tên trong dữ liệu khách, người học quen từ sách); "Tuần này: x/y phiên" ở Học (tính 7 ngày gần nhất theo T1-03).

## Danh sách chuỗi

## C1-the-cau

- Nhấn để hiện câu gốc
- Cách dùng: {item.noteVi}
- Dừng
- Nghe lặp
- Thiết bị chưa có giọng {lowerFirst(langName)}. Mở Cài đặt > Giọng đọc.
- Thiết bị chưa có giọng {lowerFirst(langName)}. Mở Cài đặt > Giọng đọc .

## C2-dai-8-o

- chưa học
- đang học
- đã nhớ
- cần ôn
- Tiến độ nhóm câu: đã học ${learned} trên ${shown.length} câu
- Câu ${i + 1}, ${LABEL[c]}

## C3-nut

- Cần ôn lại
- Tôi nhớ

## C4-lua-chon

- Đúng
- Chưa đúng, thử lại
- Chưa đúng

## C5-thanh-tab

- Học
- Luyện tập
- Thư viện
- Tiến độ
- Điều hướng chính
- VITASR
- ${label}, ${count} câu cần ôn

## C6-sheet

- Đóng

## S1-chon-ngon-ngu

- Quay lại
- Học {lowerFirst(lang.name)} với bộ nào?
- Đang tải
- Bạn có thể đổi bộ sau ở thanh trên cùng hoặc trong Cài đặt.
- {l.packs.length} bộ
- VITASR
- Bạn muốn học ngôn ngữ nào?
- Bạn có thể đổi ngôn ngữ sau ở thanh trên cùng hoặc trong Cài đặt.

## S3-phien-hoc

- Nghĩa bắt đầu bằng "${first}…", gồm ${words} từ.
- Không có câu nào để học trong nhóm này.
- Dừng phiên học?
- Bạn đã học ${doneCount}/${N} câu. Kết quả các câu này vẫn được lưu.
- Bạn chưa học xong câu nào.
- Dừng
- Học tiếp
- Thoát
- Câu {pos + 1}/{N}
- Câu này nghĩa là gì?
- Xem gợi ý
- Xem tổng kết
- Câu tiếp
- Nhóm tiếp
- Học tiếp ${nextCount} câu
- Xong phiên học
- {results.cleanCount}/{N}
- câu nhớ được không cần gợi ý
- Cần ôn lại:
- Xem tiến độ
- Xong

## S5-kiem-tra-nhanh

- Nghe và chọn nghĩa
- Nghe theo cụm
- Sắp xếp câu
- Dừng kiểm tra?
- Kết quả các câu đã làm vẫn được lưu.
- Dừng
- Làm tiếp
- Thoát
- Kiểm tra nhanh · Unit {unit.number} {level ? ` · ${level}` : ''}
- {items.length} câu
- 1. Nghe và chọn nghĩa
- Nghe câu rồi chọn nghĩa đúng.
- 2. Nghe theo cụm
- Mở từng cụm của câu để nghe.
- 3. Sắp xếp câu
- Xếp các cụm theo đúng thứ tự.
- Làm cả 3 bước
- Chỉ {lowerFirst(STEP_NAME[s])}
- Xong kiểm tra
- Đã kiểm tra {tested} câu.
- Kiểm tra unit tiếp theo
- Xong
- Câu {pos + 1}/{stepItems.length}
- Bước ${current + 1}/${steps.length}
- ${STEP_NAME[s]}, ${state === 'xong' ? 'đã xong' : state === 'dang' ? 'đang làm' : 'chưa làm'}
- Nghe lại
- Thiết bị chưa có giọng đọc, bài này dùng chữ thay cho âm thanh.
- Câu bạn nghe nghĩa là gì?
- Câu tiếp
- Nhấn từng cụm để nghe.
- Cụm ${i + 1}, đang che
- Cụm ${i + 1}
- Đúng
- Chưa đúng. Nhấn các cụm có dấu x để đưa về hàng cụm, rồi xếp lại.
- Câu của bạn
- Nhấn các cụm bên dưới theo đúng thứ tự.
- ${chunkLabel(chunks[idx])}${wrongAt.has(at) ? ', chưa đúng vị trí' : ''}
- Các cụm
- Kiểm tra

## S8-cai-dat

- Theo thiết bị
- Sáng
- Tối
- Giọng đọc
- Xong
- Tệp này không phải tệp tiến độ học ${who} của VITASR. Chọn tệp đã xuất bằng Xuất tiến độ khi đang học ${who}.
- Nhập tiến độ
- Thay tiến độ {who} hiện tại bằng tệp này?
- Hủy
- Đã nhập tiến độ
- Xóa tiến độ ${lowerFirst(language.name)}
- Đã xóa tiến độ
- Cài đặt
- Học tập
- Mục tiêu mỗi tuần
- Giảm mục tiêu
- {settings.weeklyGoal} phiên
- Tăng mục tiêu
- Ngôn ngữ đang học
- Âm thanh
- Tự động (${auto.name})
- Tự động
- Giao diện
- Tiến độ
- Xuất tiến độ
- Xóa tiến độ {lowerFirst(language.name)}
- Trợ giúp
- Xem lại hướng dẫn
- Phiên bản {__APP_VERSION__}
- Gõ "{name}" để xác nhận. Tiến độ đã xóa không lấy lại được.
- Tên ngôn ngữ
- Xóa
- Tiếng Việt
- Chọn giọng cho
- Thiết bị chưa có giọng {lowerFirst(name)}. Thêm giọng trong cài đặt hệ thống của thiết bị rồi mở lại app.
- Giọng ${lowerFirst(name)}
- Đang dùng {auto.name}
- Nghe thử
- Nghe thử giọng tự động
- Nghe thử ${v.name}
- Tốc độ đọc

## S9-huong-dan

- Đây là câu bạn sẽ học. Nút Nghe sẽ đọc to câu này cho bạn.
- Mỗi phiên học có 8 câu, mất khoảng 5 phút.
- Ôn tập và kiểm tra nằm ở mục Luyện tập. Kết quả học nằm ở mục Tiến độ.
- Bước {step + 1}/3
- Bỏ qua
- Tiếp
- Bắt đầu học

## T1-hoc

- Tuần này: đã đạt mục tiêu ${weekCount}/${goal} phiên
- Tuần này: ${weekCount}/${goal} phiên
- {reviewCount} câu cần ôn hôm nay
- Bạn đã học hết {formatCount(total)} câu {lowerFirst(language.name)}. Vào Luyện tập để ôn lại.
- Mở Luyện tập
- Câu ${pos + 1}/${n}
- Unit {unit.number} {level ? ` · ${level}` : ''}
- Tiếp tục: ${remaining} câu còn lại
- Học 8 câu
- Học ${n} câu

## T2-luyen-tap

- đặt phòng
- ăn uống
- sân bay
- mua sắm
- Học theo từ khóa
- Luyện tập
- Ôn tập hôm nay
- Các câu đến hạn ôn hôm nay, gồm cả câu bạn chưa nhớ hoặc trả lời chưa đúng.
- Hôm nay không có câu nào cần ôn.
- ${due} câu
- Tìm câu theo từ bạn cần, ví dụ đặt phòng, ăn uống, sân bay.
- Kiểm tra nhanh
- Nghe và chọn nghĩa, nghe theo cụm, sắp xếp câu.
- Ví dụ: đặt phòng, sân bay
- Từ khóa
- Xóa từ khóa
- Gợi ý
- Không có câu nào chứa "{q}". Thử từ khác bằng tiếng Việt hoặc {lowerFirst(language?.name ?? 'ngôn ngữ đang học')}.
- ngôn ngữ đang học
- Tìm thấy {formatCount(results.length)} câu
- Học ${count} câu
- Học 8 câu đầu

## T3-thu-vien

- Câu ${pad4(it.id)}
- Học câu này
- Unit ${unitObj.number}${unitObj.title ? `: ${unitObj.title}` : ''}
- Tất cả
- Unit ${u.number}${u.title ? `: ${u.title}` : ''}
- Trạng thái
- Chưa học
- Đã nhớ
- Cần ôn
- Chủ đề
- Trình độ
- Tìm câu hoặc nghĩa
- Xóa từ khóa
- {formatCount(results.length)} câu
- Không có câu nào khớp với tìm kiếm và bộ lọc hiện tại.
- Xóa tìm kiếm và bộ lọc
- Phân trang
- Trước
- Trang {cur}/{pages}
- Sau
- Chi tiết câu
- Câu {pad4(detailItem.id)}
- Tìm chủ đề
- ${formatCount(t.count)} câu
- Unit {u.number} {level ? ` · ${level}` : ''} {u.title ? ( <> {': '} <span className="src" lang={d.lang}> {u.title} </span> </> ) : null}
- ${STATUS_LABEL[st]} · Học lần cuối: ${daysAgoText(state.lastAt, now)}

## T4-tien-bo

- Khoảng thời gian
- {r} ngày
- Tiến độ
- Bạn chưa hoàn thành phiên học nào. Học 8 câu đầu tiên để bắt đầu theo dõi tiến độ.
- Học 8 câu
- phiên học
- câu đã học
- câu cần ôn hôm nay
- Mục tiêu mỗi tuần
- {done}/{goal} phiên
- ${done}/${goal} phiên
- Lịch ôn tập
- Hôm nay
- {formatCount(schedule.today)} câu
- Ngày mai
- {formatCount(schedule.tomorrow)} câu
- 7 ngày tới
- {formatCount(schedule.next7)} câu
- Các phiên học
- Xem thêm
- Số câu đã học mỗi ngày
- ${dayTitle(c.day)}: ${c.count} câu
- Ngày
- Số câu
- Câu đã học ({formatCount(ids.length)})

## app

- Bạn đang ngoại tuyến. Tiến độ vẫn được lưu trên máy.
- Trình duyệt đang chặn lưu tiến độ, tiến độ sẽ mất khi đóng app. Cho phép trang này lưu trên máy trong cài đặt trình duyệt rồi mở lại app.
- Quay lại trang học
- Trang học
- Đang tải
- Đang học
- Không tải được danh sách câu. Kiểm tra kết nối rồi nhấn Thử lại.
- Thử lại
- Quay lại
- Chọn ngôn ngữ
- Cài đặt
- Có bản cập nhật
- Cập nhật
- Đổi ngôn ngữ hoặc bộ nội dung

## data

- Global English
- Câu theo chủ đề và tình huống, có giải thích cách dùng; 6 trình độ A1 đến C2.
- English Fluency
- Câu luyện nói theo mẫu câu.
- Học theo lộ trình
- Ôn tập
- Học theo từ khóa
- Học một câu
- Kiểm tra nhanh
- Chủ Nhật
- Thứ Hai
- Thứ Ba
- Thứ Tư
- Thứ Năm
- Thứ Sáu
- Thứ Bảy
- hôm nay
- hôm qua
- ${n} ngày trước
