# Checklist chức năng VITASR Đa ngôn ngữ

> Bản này chụp trạng thái đến Đợt 4 (bản Vite, có thanh tab), chưa cập nhật theo Đợt 5 và Đợt 6. Trạng thái mới nhất: `docs/theo-doi/bao-cao-dot6.md` và `docs/generated/acceptance-report.md`; yêu cầu mới nhất: `docs/spec/`.

Cập nhật 18/10/2026, sau Đợt 4 (sửa theo phản hồi người dùng và lỗi tìm thấy khi rà soát code) · repo `nguyendinhdat2207/dangonngu`

File này liệt kê từng chức năng của mini app theo từng màn, kèm mô tả, chi tiết cần lưu ý, câu hỏi (nay đã trả lời hết), phản hồi của dev và trạng thái. Nguồn: `spec.md` và `acceptance.md` của 20 khu vực trong repo, `docs/generated/acceptance-report.md`, lịch sử commit và báo cáo tổng hợp ngày 10/10.

## Chú thích

**Trạng thái**

| Trạng thái | Nghĩa |
|---|---|
| Hoàn thành | Đã code, mọi mục nghiệm thu của chức năng đã đạt |
| Chờ thử thật | Đã code, mục tự động và mục kiểm bằng ảnh đã đạt; còn mục `[human]` cần điện thoại thật hoặc người học thật |
| Chờ xác nhận | Đã code theo một cách hợp lý; nhóm chỉ cần đồng ý hoặc ghi cách muốn đổi |
| Cần trao đổi | Nhóm hoặc khách phải chọn phương án; câu trả lời có thể đổi code hoặc phạm vi |
| Đã quyết định | Nhóm hoặc khách đã trả lời; ghi chú ngay trong ô trạng thái nói quyết định ra sao, việc còn phải làm ghi ở cột Phản hồi Dev |
| Đã chốt | Đã có quyết định, không cần làm thêm |
| Đang làm | Việc đã bắt đầu, chưa xong |
| Chưa làm | Việc chưa bắt đầu |

**Ưu tiên** (spec không ghi mức ưu tiên; mức dưới đây là đề xuất để nhóm sắp việc, sửa lại nếu cần)

| Mức | Dùng cho |
|---|---|
| Cao | Luồng học chính (chọn ngôn ngữ, học, phiên học), dữ liệu, khung app, hoặc câu hỏi có thể đổi phạm vi hay đang chặn nghiệm thu |
| Trung bình | Các màn phụ (Luyện tập, Thư viện, Tiến độ, Kiểm tra nhanh, Cài đặt) và thành phần dùng chung |
| Thấp | Chi tiết hiển thị, chữ, trường hợp biên |

Cột **Tên chức năng** có ô `[x]` khi chức năng đã hoàn thành. Cột **Phản hồi Dev** ghi đợt code, các mục nghiệm thu đã đạt, mục còn mở và cách code đang làm với các câu hỏi treo.

## Tổng quan tiến độ

Toàn bộ 135 chức năng trong spec đã có code. Mọi câu hỏi mở đã được trả lời ngày 10/10/2026 (Claude quyết định theo ủy quyền của nhóm; xem bảng "Đã trả lời" cuối từng `spec.md`), nên không còn dòng nào ở trạng thái Chờ xác nhận, Cần trao đổi hay Đã quyết định. 151/173 mục nghiệm thu đạt; 22 mục còn lại đều là `[human]`, cách thử từng mục ở `docs/thu-that/README.md`. Sau Đợt 3: 156 test đơn vị và 16 test trình duyệt đạt, `spec:check` không lỗi.

**Đợt 4 (18/10/2026).** Sửa theo phản hồi người dùng: câu trả lời sai đổi sang đỏ (token `--wrong`, nền `--wrong-soft`, thêm chữ "Chưa đúng"; trạng thái Cần ôn vẫn màu cam), rà lại toàn bộ câu chữ (khu "Tiến bộ" đổi tên thành "Tiến độ", hướng dẫn dùng "nhấn", tên ngôn ngữ giữa câu viết thường, xem bảng ở `docs/evidence/FND-AC12/chuoi-giao-dien.md`), giọng đọc mặc định là "Tự động" ưu tiên giọng Google. Cùng đợt sửa 12 lỗi tìm thấy khi rà soát code (mở hai tab ghi đè tiến độ của nhau, nút Nghe lặp chồng lượt, giữ phím chấm nhầm câu, tiến độ hỏng làm trắng màn, giờ mùa hè, tìm kiếm chữ không Latinh, tệp nhập sai giá trị, gợi ý mất khi tải lại, sheet nằm lại khi đổi màn, focus bàn phím, bước 1 hướng dẫn). Nghiệm thu 161/184: 10 mục tự động mới đều đạt; mục mới S8-AC12 (người thử nghe giọng Google) cần người.

| Khu vực | Route | Chức năng | Hoàn thành | Chờ thử thật | Chờ xác nhận | Cần trao đổi | Đã quyết định | Chưa làm | Nghiệm thu đạt |
|---|---|---|---|---|---|---|---|---|---|
| S1 Chọn ngôn ngữ | `#/chon-ngon-ngu` | 7 | 5 | 2 | 0 | 0 | 0 | 0 | 7/8 |
| T1 Học | `#/hoc` | 7 | 5 | 2 | 0 | 0 | 0 | 0 | 9/10 |
| S3 Phiên học | `#/phien-hoc` | 9 | 7 | 2 | 0 | 0 | 0 | 0 | 12/13 |
| T2 Luyện tập | `#/luyen-tap` | 5 | 5 | 0 | 0 | 0 | 0 | 0 | 7/7 |
| S5 Kiểm tra nhanh | `#/kiem-tra` | 8 | 6 | 2 | 0 | 0 | 0 | 0 | 10/11 |
| T3 Thư viện | `#/thu-vien` | 7 | 7 | 0 | 0 | 0 | 0 | 0 | 10/10 |
| T4 Tiến độ | `#/tien-bo` | 8 | 6 | 2 | 0 | 0 | 0 | 0 | 9/10 |
| S8 Cài đặt | `#/cai-dat` | 6 | 4 | 2 | 0 | 0 | 0 | 0 | 10/13 |
| S9 Hướng dẫn lần đầu | (lớp phủ trên T1) | 5 | 4 | 1 | 0 | 0 | 0 | 0 | 5/6 |
| APP Khung app |  | 12 | 8 | 4 | 0 | 0 | 0 | 0 | 17/20 |
| C1 Thẻ câu |  | 8 | 7 | 1 | 0 | 0 | 0 | 0 | 9/10 |
| C2 Dải 8 ô |  | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 3/3 |
| C3 Nút |  | 4 | 3 | 1 | 0 | 0 | 0 | 0 | 3/4 |
| C4 Lựa chọn trắc nghiệm |  | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 3/3 |
| C5 Thanh tab |  | 4 | 4 | 0 | 0 | 0 | 0 | 0 | 4/4 |
| C6 Sheet |  | 4 | 3 | 1 | 0 | 0 | 0 | 0 | 5/6 |
| C7 Thông báo ngắn |  | 3 | 3 | 0 | 0 | 0 | 0 | 0 | 3/3 |
| FND Nền tảng thiết kế |  | 14 | 11 | 3 | 0 | 0 | 0 | 0 | 14/17 |
| DATA Dữ liệu và tiến độ |  | 13 | 12 | 1 | 0 | 0 | 0 | 0 | 20/21 |
| G Mục tiêu sản phẩm |  | 5 | 1 | 4 | 0 | 0 | 0 | 0 | 1/5 |
| **Tổng** | | **135** | **107** | **28** | **0** | **0** | **0** | **0** | **161/184** |

## Các màn của app

### S1 Chọn ngôn ngữ  `#/chon-ngon-ngu`

Màn toàn trang đầu tiên khi chưa chọn ngôn ngữ. Nghiệm thu: **7/8** mục đạt. Chức năng hoàn thành: 5/7.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [ ] **S1-01** Danh sách và thứ tự | Người học thấy danh sách 15 ngôn ngữ để chọn ngôn ngữ muốn học. | Tiếng Anh luôn đứng đầu, có khung viền riêng; các ngôn ngữ khác xếp theo tên tiếng Việt A đến Z. |  | Code Đợt 1 (`97e85fa`). Đạt: S1-AC01, S1-AC02. Còn mở: S1-AC06 [human]. | Chờ thử thật | Cao |
| 2 | [x] **S1-02** Nội dung mỗi dòng | Mỗi dòng hiện tên tiếng Việt và tên gốc của ngôn ngữ. | Tên gốc lấy từ `source-index.json` (ví dụ 日本語, Русский); thiếu thì dùng `Intl.DisplayNames`, vẫn thiếu thì bỏ dòng tên gốc. |  | Code Đợt 1 (`97e85fa`). Đạt: S1-AC02, S1-AC03. | Hoàn thành | Trung bình |
| 3 | [x] **S1-03** Số câu | Hiện số câu của mỗi ngôn ngữ. | Định dạng kiểu Việt Nam (4.096). Tiếng Anh có 2 bộ nên hiện "2 bộ" và mũi tên thay cho số câu. |  | Code Đợt 1 (`97e85fa`). Đạt: S1-AC02. | Hoàn thành | Thấp |
| 4 | [ ] **S1-04** Chọn | Chạm một dòng là chọn ngay, không cần nút xác nhận. | Lưu ngôn ngữ rồi chuyển sang `#/hoc`. Trong lúc tải, dòng vừa chạm có chỉ báo, các dòng khác bị khóa. |  | Code Đợt 1 (`97e85fa`). Đạt: S1-AC04, S1-AC07. Còn mở: S1-AC06 [human]. | Chờ thử thật | Cao |
| 5 | [x] **S1-05** Chú thích | Dòng chú thích cuối danh sách: có thể đổi ngôn ngữ sau. | Chữ "Có thể đổi sau ở thanh trên cùng." |  | Code Đợt 1 (`97e85fa`). Đạt: S1-AC02. | Hoàn thành | Thấp |
| 6 | [x] **S1-06** Tải và lỗi | Có trạng thái đang tải và lỗi tải. | Khung xương 6 dòng khi tải; lỗi theo APP-08 (có nút Thử lại). |  | Code Đợt 1 (`97e85fa`). Đạt: S1-AC05. | Hoàn thành | Trung bình |
| 7 | [x] **S1-07** Chọn bộ nội dung | Bước 2 cho tiếng Anh: chọn bộ Global English hoặc English Fluency. | Chỉ hiện với ngôn ngữ nhiều bộ. Thứ tự: Global English trước. Có nút Quay lại về danh sách ngôn ngữ. |  | Code Đợt 1 (`97e85fa`). Đạt: S1-AC07, S1-AC08. Đã chốt 10/10: không có chế độ đảo chiều ở bản này; khách cần thì làm đợt riêng. | Hoàn thành | Cao |

### T1 Học  `#/hoc`

Khu chính mặc định: thẻ câu tiếp theo và nút bắt đầu phiên. Nghiệm thu: **9/10** mục đạt. Chức năng hoàn thành: 5/7.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **T1-01** Thẻ câu tiếp theo | Màn Học hiện thẻ câu tiếp theo trong lộ trình kèm tên unit. | Có "Unit n", mã trình độ (A1...) và tình huống khi là Global English. Dải 8 ô thể hiện trạng thái các câu trong unit. |  | Code Đợt 1 (`97e85fa`). Đạt: T1-AC01, T1-AC02, T1-AC10. | Hoàn thành | Cao |
| 2 | [ ] **T1-02** Nút chính đổi chữ theo ngữ cảnh | Một nút chính đổi chữ theo ngữ cảnh: "Học 8 câu" hoặc "Tiếp tục: N câu còn lại". | Unit dưới 8 câu thì ghi "Học N câu". Có phiên dở thì mở lại đúng câu đang dở. |  | Code Đợt 1 (`97e85fa`). Đạt: T1-AC03. Còn mở: T1-AC09 [human]. | Chờ thử thật | Cao |
| 3 | [x] **T1-03** Mục tiêu tuần | Dòng mục tiêu tuần "Tuần này: x/y phiên". | x là số phiên hoàn tất trong 7 ngày gần nhất (tính cả hôm nay); y lấy từ Cài đặt. |  | Code Đợt 1 (`97e85fa`). Đạt: T1-AC04. Đã chốt 10/10: đếm mọi phiên đã xong, không tính phiên dừng giữa chừng (như code). | Hoàn thành | Trung bình |
| 4 | [ ] **T1-04** Câu cần ôn | Dòng "N câu cần ôn hôm nay", chạm vào để ôn. | Chỉ hiện khi N > 0; mở `#/phien-hoc?nguon=on-tap`. |  | Code Đợt 1 (`97e85fa`). Đạt: T1-AC05. Còn mở: T1-AC09 [human]. | Chờ thử thật | Cao |
| 5 | [x] **T1-05** Học hết lộ trình | Trạng thái đã học hết lộ trình. | Thay thẻ và nút bằng câu "Bạn đã học hết ... Vào Luyện tập để ôn lại." và nút "Mở Luyện tập". |  | Code Đợt 1 (`97e85fa`). Đạt: T1-AC06. | Hoàn thành | Trung bình |
| 6 | [x] **T1-06** Bố cục máy tính | Bố cục hai cột trên máy tính. | Từ 900 px: cột trái (tối đa 560 px) là thẻ và nút; cột phải là mục tiêu tuần và câu cần ôn. |  | Code Đợt 1 (`97e85fa`). Đạt: T1-AC07. | Hoàn thành | Cao |
| 7 | [x] **T1-07** Không đổi câu trên T1 | T1 chỉ hiện một câu, không vuốt hay bấm để đổi câu. | Muốn xem câu khác thì vào Thư viện (T3). |  | Code Đợt 1 (`97e85fa`). Đạt: T1-AC08. | Hoàn thành | Thấp |

### S3 Phiên học  `#/phien-hoc`

Màn toàn trang học 8 câu: ghi nhớ, kiểm tra, tổng kết. Nghiệm thu: **10/11** mục đạt. Chức năng hoàn thành: 7/9.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **S3-01** Nguồn câu của phiên | Phiên học lấy câu từ 4 nguồn: lộ trình, ôn tập, từ khóa, một câu. | Ôn tập lấy tối đa 8 câu đến hạn sớm nhất. Nhóm rỗng thì không vào phiên, quay lại và báo "Không có câu nào để học trong nhóm này." |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC01. | Hoàn thành | Cao |
| 2 | [x] **S3-02** Khung phiên | Khung phiên: nút Thoát, "Câu n/N", dải 8 ô cập nhật theo kết quả. | Mỗi câu đi qua bước ghi nhớ (S3a) rồi bước kiểm tra (S3b); xong câu cuối thì sang tổng kết (S3c). |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC02, S3-AC07. | Hoàn thành | Cao |
| 3 | [ ] **S3-03** Bước ghi nhớ | Bước ghi nhớ: che câu gốc, người học tự nhớ rồi chấm "Tôi nhớ" hoặc "Cần ôn lại". | Cặp nút đánh giá bị khóa cho tới khi hiện câu gốc. Kết quả ghi vào tiến độ và quy tắc ôn. |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC03, S3-AC07. Còn mở: S3-AC11 [human]. | Chờ thử thật | Cao |
| 4 | [ ] **S3-04** Bước kiểm tra | Bước kiểm tra: chọn nghĩa đúng trong 4 lựa chọn. | Chọn đúng mới hiện nút "Câu tiếp" (câu cuối: "Xem tổng kết"). |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC04, S3-AC07. Còn mở: S3-AC11 [human]. | Chờ thử thật | Cao |
| 5 | [x] **S3-05** Gợi ý | Nút "Xem gợi ý" ở bước kiểm tra. | Gợi ý chữ đầu và số từ của nghĩa; mỗi câu dùng một lần; câu dùng gợi ý bị tính là Cần ôn. |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC05. | Hoàn thành | Trung bình |
| 6 | [x] **S3-06** Tổng kết phiên | Màn tổng kết phiên. | Số câu nhớ được không cần gợi ý (x/N), danh sách câu Cần ôn. Nút "Học tiếp N câu" hoặc "Nhóm tiếp" (phiên từ khóa), kèm "Xem tiến bộ" và "Xong". |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC06, S3-AC07. | Hoàn thành | Cao |
| 7 | [x] **S3-07** Thoát giữa phiên | Thoát giữa phiên phải hỏi xác nhận. | Bấm Thoát, Esc hoặc Back trình duyệt đều mở sheet "Dừng phiên học?" với dòng "Bạn đã học n/N câu. Kết quả các câu này vẫn được lưu." |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC08. | Hoàn thành | Cao |
| 8 | [x] **S3-08** Phiên dở | Lưu phiên dở để học tiếp đúng câu, đúng bước. | Mỗi ngôn ngữ tối đa một phiên dở; bắt đầu phiên mới thì phiên dở cũ kết thúc. |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC09. | Hoàn thành | Cao |
| 9 | [x] **S3-09** Điều khiển | Phím tắt khi học bằng máy tính. | Space hiện câu gốc; 1 = Cần ôn lại, 2 = Tôi nhớ; 1 đến 4 chọn đáp án; Enter là nút chính. Không dùng vuốt. |  | Code Đợt 1 (`97e85fa`). Đạt: S3-AC10. | Hoàn thành | Trung bình |

### T2 Luyện tập  `#/luyen-tap`

Ôn tập hôm nay, học theo từ khóa, mở kiểm tra nhanh. Nghiệm thu: **7/7** mục đạt. Chức năng hoàn thành: 5/5.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **T2-01** Danh sách cách luyện | Màn Luyện tập có 3 cách luyện xếp dọc. | Ôn tập hôm nay, Học theo từ khóa, Kiểm tra nhanh. Ngăn bằng đường kẻ, không dùng thẻ; màn không có nút chính. |  | Code Đợt 2 (`757a784`). Đạt: T2-AC01. Sửa Đợt 3: dòng mô tả Ôn câu cần ôn đổi thành "Các câu đến hạn ôn hôm nay, kể cả câu bạn chưa nhớ hoặc làm chưa đúng." (bỏ chữ "sai", FND-12; đúng với DATA-07). | Hoàn thành | Trung bình |
| 2 | [x] **T2-02** Ôn tập hôm nay | Ôn các câu đến hạn hôm nay. | Hiện số câu cần ôn; bằng 0 thì khóa mục và đổi mô tả thành "Hôm nay không có câu nào cần ôn." |  | Code Đợt 2 (`757a784`). Đạt: T2-AC02. | Hoàn thành | Trung bình |
| 3 | [x] **T2-03** Học theo từ khóa | Học theo từ khóa: tìm câu theo chủ đề rồi học 8 câu đầu. | Sheet có ô tìm, chip gợi ý (6 chủ đề nhiều câu nhất, hoặc 4 chip cố định), xem trước 5 câu. Cập nhật sau 250 ms ngừng gõ. |  | Code Đợt 2 (`757a784`). Đạt: T2-AC03, T2-AC06, T2-AC07. Đã chốt 10/10: nút là "Học N câu" khi tìm thấy 1 đến 7 câu (sửa Đợt 3); giữ tìm theo chuỗi con. | Hoàn thành | Trung bình |
| 4 | [x] **T2-04** Kiểm tra nhanh | Mở Kiểm tra nhanh với unit đang học. | Mở `#/kiem-tra`. |  | Code Đợt 2 (`757a784`). Đạt: T2-AC04. | Hoàn thành | Trung bình |
| 5 | [x] **T2-05** Không có kết quả | Báo khi không tìm thấy câu nào theo từ khóa. | "Không có câu nào chứa ... Thử từ khác, bằng tiếng Việt hoặc [ngôn ngữ đang học]." và khóa nút học. |  | Code Đợt 2 (`757a784`). Đạt: T2-AC05, T2-AC06. | Hoàn thành | Thấp |

### S5 Kiểm tra nhanh  `#/kiem-tra`

Màn toàn trang kiểm tra một unit qua 3 bước. Nghiệm thu: **9/10** mục đạt. Chức năng hoàn thành: 6/8.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **S5-01** Màn bắt đầu | Màn bắt đầu kiểm tra nhanh một unit. | Nút chính "Làm cả 3 bước" và 3 nút để làm riêng từng bước. |  | Code Đợt 2 (`757a784`). Đạt: S5-AC01, S5-AC09. | Hoàn thành | Trung bình |
| 2 | [x] **S5-02** Chỉ báo bước | Chỉ báo bước đang làm. | Nút Thoát, tên bước, 3 chấm nối nhau (1 chấm khi chỉ làm một bước), "Câu n/N". |  | Code Đợt 2 (`757a784`). Đạt: S5-AC02. | Hoàn thành | Thấp |
| 3 | [x] **S5-03** Bước 1: Nghe và chọn nghĩa | Bước 1: nghe câu rồi chọn nghĩa. | Tự đọc một lần, có "Nghe lại". Máy không có giọng thì hiện chữ thay âm thanh. |  | Code Đợt 2 (`757a784`). Đạt: S5-AC03, S5-AC09. Đã chốt 10/10: bước 1 chỉ hiện câu hỏi và 4 lựa chọn sau khi biết có giọng hay không (sửa Đợt 3). | Hoàn thành | Trung bình |
| 4 | [ ] **S5-04** Bước 2: Nghe theo cụm | Bước 2: nghe theo cụm từ. | Câu chia 1 đến 4 cụm theo số từ (Intl.Segmenter). Chạm cụm thì hiện chữ và đọc cụm. Không thu âm, không chấm phát âm. |  | Code Đợt 2 (`757a784`). Đạt: S5-AC04, S5-AC09. Còn mở: S5-AC10 [human]. Đã chốt 10/10: không thêm loại lượt cho Nghe theo cụm; phiên chỉ có bước này tính là phiên hoàn tất, không tính câu đã học. | Chờ thử thật | Trung bình |
| 5 | [ ] **S5-05** Bước 3: Sắp xếp câu | Bước 3: sắp xếp các cụm thành câu đúng. | Xáo tất định theo id câu. Đúng thì viền xanh cả hàng; sai thì đánh dấu cụm sai vị trí và cho sắp lại. |  | Code Đợt 2 (`757a784`). Đạt: S5-AC05, S5-AC09. Còn mở: S5-AC10 [human]. | Chờ thử thật | Trung bình |
| 6 | [x] **S5-06** Nghĩa hiển thị | Chỉ hiện nghĩa cả câu ở bước 2 và 3. | Không ghép nghĩa từng cụm vì cụm tiếng Việt không khớp cụm câu gốc. |  | Code Đợt 2 (`757a784`). Đạt: S5-AC06. | Hoàn thành | Thấp |
| 7 | [x] **S5-07** Kết quả | Kết quả kiểm tra theo từng bước. | Ví dụ "Nghe và chọn nghĩa: 6/8". Câu sai đầu tiên ở bất kỳ bước nào thành Cần ôn. Nút "Kiểm tra unit tiếp theo". |  | Code Đợt 2 (`757a784`). Đạt: S5-AC07, S5-AC09. Đã chốt 10/10: giữ "Nghe theo cụm: x/y". | Hoàn thành | Trung bình |
| 8 | [x] **S5-08** Thoát giữa chừng | Thoát giữa chừng phải hỏi xác nhận. | "Dừng kiểm tra? Kết quả các câu đã làm vẫn được lưu." Không lưu bài dở để làm tiếp. |  | Code Đợt 2 (`757a784`). Đạt: S5-AC08. Đã chốt 10/10: Thoát ở màn bắt đầu và Dừng giữa chừng luôn về T2 Luyện tập, kể cả khi mở thẳng đường dẫn (sửa Đợt 3). | Hoàn thành | Thấp |

### T3 Thư viện  `#/thu-vien`

Tra cứu toàn bộ câu, tìm và lọc, học một câu bất kỳ. Nghiệm thu: **10/10** mục đạt. Chức năng hoàn thành: 7/7.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **T3-01** Danh sách câu | Thư viện liệt kê toàn bộ câu, 32 câu mỗi trang. | Mỗi dòng: id 4 chữ số, câu gốc (2 dòng), nghĩa (1 dòng), biểu tượng trạng thái khác hình dạng: Chưa học, Đã nhớ, Cần ôn. |  | Code Đợt 2 (`757a784`). Đạt: T3-AC01, T3-AC02. | Hoàn thành | Trung bình |
| 2 | [x] **T3-02** Tìm kiếm | Tìm câu hoặc nghĩa. | Cập nhật sau 250 ms ngừng gõ; bỏ dấu khi so khớp; từ khóa giữ trong route (`?q=`). |  | Code Đợt 2 (`757a784`). Đạt: T3-AC03. | Hoàn thành | Trung bình |
| 3 | [x] **T3-03** Bộ lọc | Lọc theo Unit, Trạng thái, Chủ đề, Trình độ. | Chủ đề có ô tìm (177 chủ đề), chỉ hiện với Global English. Tìm và lọc kết hợp được. |  | Code Đợt 2 (`757a784`). Đạt: T3-AC04, T3-AC09, T3-AC10. Đã chốt 10/10: chỉ Unit và từ khóa giữ trong route; danh sách chọn mở bằng sheet; Trình độ liệt kê theo dữ liệu (như code). | Hoàn thành | Trung bình |
| 4 | [x] **T3-04** Phân trang | Phân trang Trước / Trang x/y / Sau. | Đổi từ khóa hoặc bộ lọc thì về trang 1; chỉ có một trang thì ẩn. |  | Code Đợt 2 (`757a784`). Đạt: T3-AC05. | Hoàn thành | Thấp |
| 5 | [x] **T3-05** Chi tiết câu | Xem chi tiết một câu và học ngay câu đó. | Sheet "Câu [id]": thẻ câu, unit, trạng thái, lần học cuối, nút "Học câu này". |  | Code Đợt 2 (`757a784`). Đạt: T3-AC06. | Hoàn thành | Trung bình |
| 6 | [x] **T3-06** Không có kết quả | Báo khi không có câu nào khớp. | Có nút phụ "Xóa tìm kiếm và bộ lọc". |  | Code Đợt 2 (`757a784`). Đạt: T3-AC07. | Hoàn thành | Thấp |
| 7 | [x] **T3-07** Bố cục máy tính | Bố cục hai cột trên máy tính. | Từ 900 px: danh sách bên trái (tối đa 480 px), chi tiết câu ở cột phải thay cho sheet. |  | Code Đợt 2 (`757a784`). Đạt: T3-AC08. | Hoàn thành | Trung bình |

### T4 Tiến độ  `#/tien-bo`

Số liệu học tập, biểu đồ, lịch ôn, các phiên. Nghiệm thu: **9/10** mục đạt. Chức năng hoàn thành: 6/8.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **T4-01** Khoảng thời gian | Chọn khoảng thời gian 1, 7 hoặc 30 ngày. | Mặc định 7 ngày, giữ trong route (`?khoang=`); tính theo ngày lịch của máy. |  | Code Đợt 2 (`757a784`). Đạt: T4-AC01. | Hoàn thành | Trung bình |
| 2 | [ ] **T4-02** Ba chỉ số | Ba chỉ số: số phiên, số câu đã học, số câu cần ôn hôm nay. | Câu cần ôn không phụ thuộc khoảng thời gian. |  | Code Đợt 2 (`757a784`). Đạt: T4-AC02. Còn mở: T4-AC10 [human]. | Chờ thử thật | Cao |
| 3 | [x] **T4-03** Mục tiêu tuần | Mục tiêu tuần có thanh tiến độ. | Luôn tính 7 ngày gần nhất; đạt mục tiêu thì thanh đổi sang màu xanh. |  | Code Đợt 2 (`757a784`). Đạt: T4-AC03. | Hoàn thành | Trung bình |
| 4 | [x] **T4-04** Biểu đồ theo ngày | Biểu đồ cột số câu đã học mỗi ngày. | Có bảng số liệu ẩn cho trình đọc màn hình; khoảng 1 ngày thì không có biểu đồ. |  | Code Đợt 2 (`757a784`). Đạt: T4-AC04, T4-AC05. Đã chốt 10/10: giữ cột hôm nay màu `--brand` (ngoại lệ FND-02); cột 30 ngày hẹp vẫn chạm được, danh sách Các phiên là đường thay thế (ngoại lệ FND-14). | Hoàn thành | Trung bình |
| 5 | [ ] **T4-05** Lịch ôn tập | Lịch ôn tập: Hôm nay, Ngày mai, 7 ngày tới. | Câu quá hạn trước hôm nay tính vào "Hôm nay". |  | Code Đợt 2 (`757a784`). Đạt: T4-AC06. Còn mở: T4-AC10 [human]. Đã chốt 10/10: "7 ngày tới" gồm cả số của "Ngày mai" (như code). | Chờ thử thật | Trung bình |
| 6 | [x] **T4-06** Các phiên | Danh sách các phiên đã học. | Mới nhất trước; có giờ, nguồn, dải ô kết quả; 20 phiên mỗi lần, có "Xem thêm". |  | Code Đợt 2 (`757a784`). Đạt: T4-AC07. | Hoàn thành | Thấp |
| 7 | [x] **T4-07** Chi tiết ngày | Chạm một cột để xem chi tiết ngày. | Sheet gồm các phiên và các câu đã học trong ngày. |  | Code Đợt 2 (`757a784`). Đạt: T4-AC08. | Hoàn thành | Thấp |
| 8 | [x] **T4-08** Chưa có dữ liệu | Trạng thái chưa có dữ liệu. | "Chưa có phiên nào. Học 8 câu đầu tiên..." và nút "Học 8 câu". |  | Code Đợt 2 (`757a784`). Đạt: T4-AC09. Đã chốt 10/10: "Chưa có phiên nào" là chưa từng hoàn tất phiên nào (như code). | Hoàn thành | Thấp |

### S8 Cài đặt  `#/cai-dat`

Mục tiêu tuần, ngôn ngữ, giọng đọc, giao diện, dữ liệu. Nghiệm thu: **8/10** mục đạt. Chức năng hoàn thành: 4/6.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **S8-01** Học tập | Cài đặt học tập: mục tiêu tuần và ngôn ngữ đang học. | Mục tiêu 1 đến 21 phiên (mặc định 5), lưu ngay khi đổi; chạm ngôn ngữ mở sheet Đổi ngôn ngữ. |  | Code Đợt 2 (`757a784`). Đạt: S8-AC01, S8-AC09, S8-AC10. | Hoàn thành | Trung bình |
| 2 | [ ] **S8-02** Giọng đọc | Chọn giọng đọc và tốc độ đọc. | Giọng theo ngôn ngữ đang học hoặc tiếng Việt, có "Nghe thử"; tốc độ 0,75x / 1x / 1,25x. Máy không có giọng thì hướng dẫn thêm giọng. |  | Code Đợt 2 (`757a784`). Đạt: S8-AC02, S8-AC09. Còn mở: S8-AC03 [human]. Đã chốt 10/10: không có nút nghe nghĩa ở bản này; giữ lựa chọn giọng Tiếng Việt. | Chờ thử thật | Trung bình |
| 3 | [x] **S8-03** Âm thanh ngoại tuyến | Âm thanh ngoại tuyến (gói âm thanh dựng sẵn). | Bản đầu chưa hỗ trợ nên mục này ẩn với mọi ngôn ngữ (dữ liệu chỉ có gói tiếng Lào). |  | Code Đợt 2 (`757a784`). Đạt: S8-AC04. | Hoàn thành | Thấp |
| 4 | [x] **S8-04** Giao diện | Chọn giao diện sáng, tối hoặc theo thiết bị. | Áp dụng ngay khi đổi. |  | Code Đợt 2 (`757a784`). Đạt: S8-AC05, S8-AC09. Đã chốt 10/10: dùng "Theo thiết bị" ở cả S8-04 và FND-03. | Hoàn thành | Thấp |
| 5 | [ ] **S8-05** Tiến độ | Xuất, nhập, xóa tiến độ. | Xuất ra file JSON; nhập có sheet xác nhận; xóa phải gõ đúng tên ngôn ngữ (không phân biệt hoa thường, phải đủ dấu). |  | Code Đợt 2 (`757a784`). Đạt: S8-AC06, S8-AC09. Còn mở: S8-AC07 [human]. Đã chốt 10/10: nhóm đổi tên thành "Tiến độ"; câu báo lỗi nhập tệp mới có hướng xử lý, dùng "tệp" (sửa Đợt 3); chỉ nhận tệp đúng cả ngôn ngữ lẫn bộ nội dung; nút sheet: Hủy / Nhập tiến độ, Hủy / Xóa. | Chờ thử thật | Cao |
| 6 | [x] **S8-06** Trợ giúp | Xem lại hướng dẫn và số phiên bản. | "Xem lại hướng dẫn" mở S9 trên T1. |  | Code Đợt 2 (`757a784`). Đạt: S8-AC08, S8-AC09. Đã chốt 10/10: ở S8 chỉ có nút Quay lại, không có nút Cài đặt (như code). | Hoàn thành | Thấp |

### S9 Hướng dẫn lần đầu  (lớp phủ trên T1)

Hướng dẫn 3 bước, chỉ hiện một lần. Nghiệm thu: **5/6** mục đạt. Chức năng hoàn thành: 4/5.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **S9-01** Khi nào hiện | Hướng dẫn hiện một lần sau khi chọn ngôn ngữ lần đầu. | Không hiện khi T1 đang ở trạng thái học hết lộ trình. |  | Code Đợt 1 (`97e85fa`). Đạt: S9-AC01. | Hoàn thành | Trung bình |
| 2 | [ ] **S9-02** Ba bước | 3 bước làm nổi thẻ câu, nút chính, thanh tab. | Mỗi bước có bong bóng chữ ngắn; phần còn lại phủ mờ. |  | Code Đợt 1 (`97e85fa`). Đạt: S9-AC02. Còn mở: S9-AC06 [human]. | Chờ thử thật | Trung bình |
| 3 | [x] **S9-03** Điều khiển | Điều khiển Tiếp / Bỏ qua / Bắt đầu học. | Esc tương đương Bỏ qua; "Bắt đầu học" mở phiên học luôn. |  | Code Đợt 1 (`97e85fa`). Đạt: S9-AC03. | Hoàn thành | Thấp |
| 4 | [x] **S9-04** Không hiện lại | Xong hoặc bỏ qua thì không tự hiện lại. | Kể cả khi đổi ngôn ngữ. |  | Code Đợt 1 (`97e85fa`). Đạt: S9-AC04. | Hoàn thành | Thấp |
| 5 | [x] **S9-05** Xem lại | Xem lại hướng dẫn từ Cài đặt. | Bắt đầu từ bước 1; nút cuối là "Xong". |  | Code Đợt 1 (`97e85fa`). Đạt: S9-AC05. | Hoàn thành | Thấp |

## Khung app và thành phần dùng chung

### APP Khung app

Điều hướng, thanh trên cùng, bố cục, ngoại tuyến, cách trang chính mở app, nút về trang học chính. Nghiệm thu: **17/20** mục đạt. Chức năng hoàn thành: 8/12.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **APP-01** Bốn khu chính | 4 khu chính: Học, Luyện tập, Thư viện, Tiến độ. | Dưới 900 px dùng thanh tab dưới đáy; từ 900 px dùng thanh dọc bên trái 220 px. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC01, APP-AC02. | Hoàn thành | Cao |
| 2 | [x] **APP-02** Thanh trên cùng | Thanh trên cùng: tên ngôn ngữ (chạm để đổi) và nút Cài đặt. | Cao 56 px; tiếng Anh hiện thêm tên bộ ở dòng nhỏ. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC03, APP-AC17. | Hoàn thành | Cao |
| 3 | [x] **APP-03** Màn toàn trang | 3 màn toàn trang: Chọn ngôn ngữ, Phiên học, Kiểm tra nhanh. | Ẩn thanh tab và thanh trên cùng; S3, S5 có nút Thoát. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC04. | Hoàn thành | Trung bình |
| 4 | [x] **APP-04** Bảng route | Bảng route bằng hash (`#/hoc`, `#/thu-vien`...). | Là nguồn chân lý cho điều hướng; không cần cấu hình server. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC02, APP-AC05. | Hoàn thành | Cao |
| 5 | [x] **APP-05** Khởi động | Khởi động: chưa chọn ngôn ngữ thì vào S1, đã chọn thì vào T1. | Có khung xương, không trắng màn quá 300 ms. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC06, APP-AC07. | Hoàn thành | Cao |
| 6 | [x] **APP-06** Sheet Đổi ngôn ngữ | Sheet Đổi ngôn ngữ hoặc bộ nội dung. | Tiếng Anh tách 2 dòng theo 2 bộ; dòng đang dùng được đánh dấu. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC08, APP-AC17. | Hoàn thành | Trung bình |
| 7 | [ ] **APP-07** Bố cục theo khổ màn hình | Responsive, ưu tiên máy tính 1440 và 1280 px. | Các mốc 320 / 600 / 900 px; không cuộn ngang ở khổ nào. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC09. Còn mở: APP-AC13 [human]. | Chờ thử thật | Cao |
| 8 | [x] **APP-08** Trạng thái toàn cục | Trạng thái toàn cục: đang tải, lỗi tải, ngoại tuyến, bộ nhớ bị chặn. | Lỗi có nút Thử lại; không dùng vòng xoay giữa màn. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC07, APP-AC10, APP-AC11. Sửa Đợt 3: câu cảnh báo bộ nhớ bị chặn có hướng xử lý, bỏ chữ "dữ liệu" (FND-12). | Hoàn thành | Trung bình |
| 9 | [ ] **APP-09** Cách trang chính mở app | Trang học chính mở mini app ở trang mới; app vẫn chạy được khi mở trực tiếp và trong iframe. | Không dùng `window.top`, postMessage, không cần đăng nhập, bỏ qua mọi tham số URL. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC12. Còn mở: APP-AC13 [human], APP-AC20 [human]. Đã chốt 10/10: mở trang mới, không nhúng iframe; nút về trang học chính mở trong tab đang xem (APP-12). | Chờ thử thật | Cao |
| 10 | [ ] **APP-10** Ngoại tuyến và cập nhật | Chạy ngoại tuyến và báo khi có bản cập nhật. | Chỉ tải lại khi người dùng bấm "Cập nhật"; không hiện thông báo khi đang ở S3, S5. |  | Code Đợt 2 (`757a784`). Đạt: APP-AC15. Còn mở: APP-AC14 [human]. Đã chốt 10/10: giữ cách kích hoạt bản mới và lưu font ngoại tuyến như code. | Chờ thử thật | Trung bình |
| 11 | [x] **APP-11** Một lớp phủ tại một thời điểm | Tại một thời điểm chỉ có một sheet hoặc hộp thoại. | Mở sheet mới thì sheet cũ đóng trước. |  | Code Đợt 1 (`97e85fa`). Đạt: APP-AC16. | Hoàn thành | Trung bình |
| 12 | [ ] **APP-12** Nút về trang học chính | Nút quay lại để người học về trang học chính. | Ngoài cùng bên trái thanh trên cùng của T1 đến T4 và góc trên S1 bước 1; icon mũi tên trái, nhãn "Quay lại trang học", từ 600 px có chữ "Trang học". Là liên kết thường tới `VITE_HOST_URL` (mặc định `https://language.pomaskhoahocnaobo.com/`), không dùng `history.back()`. Không có ở S1 bước 2, S3, S5, S8. |  | Đạt: APP-AC18, APP-AC19. Còn mở: APP-AC20 [human]. Đã chốt 10/10: về trang chủ, đổi bằng `VITE_HOST_URL` khi có đường dẫn Trung tâm ứng dụng; nếu trang chính mở tab mới thì vẫn mở trang học trong tab của app. Đường kẻ thừa ở S1 đã sửa (PR #8). | Chờ thử thật | Cao |

### C1 Thẻ câu

Nghiệm thu: **7/8** mục đạt. Chức năng hoàn thành: 7/8.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **C1-01** Cấu trúc | Cấu trúc thẻ câu: dải ô, nghĩa, câu gốc, nút Nghe / Nghe lặp. | Nghĩa dùng Literata; câu gốc theo font và cỡ của FND. |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC01. | Hoàn thành | Cao |
| 2 | [x] **C1-02** Trạng thái che câu gốc | Trạng thái che câu gốc, chạm để hiện. | Khi che, nút Nghe bị khóa; Space / Enter cũng hiện được. |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC02. | Hoàn thành | Cao |
| 3 | [x] **C1-03** Trạng thái hiện đầy đủ | Trạng thái hiện đầy đủ. | Đã hiện thì không che lại trong cùng lượt. |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC03. | Hoàn thành | Cao |
| 4 | [ ] **C1-04** Phát âm | Nghe và Nghe lặp bằng giọng của thiết bị. | Nghe lặp cách nhau 1,5 giây tới khi bấm Dừng; rời thẻ thì dừng đọc. |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC04. Còn mở: C1-AC05 [human]. | Chờ thử thật | Cao |
| 5 | [x] **C1-05** Không có giọng đọc | Báo khi thiết bị không có giọng đọc. | Khóa nút Nghe, kèm liên kết "Cài đặt > Giọng đọc". |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC06. Đã chốt 10/10: giữ liên kết trong câu, miễn vùng chạm 44 px (FND-14); dòng báo được giữ chỗ khi đang nạp giọng (PR #8). | Hoàn thành | Thấp |
| 6 | [x] **C1-06** Dòng Cách dùng | Dòng "Cách dùng" khi câu có `noteVi`. | Không có thì không chừa khoảng trống. |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC07. | Hoàn thành | Trung bình |
| 7 | [x] **C1-07** Phiên âm | Phiên âm furigana (tiếng Nhật) hoặc `reading`. | Furigana hiện bằng thẻ `ruby`. |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC07. | Hoàn thành | Trung bình |
| 8 | [x] **C1-08** Thuộc tính ngôn ngữ | Gắn thuộc tính `lang` đúng cho câu gốc và nghĩa. | Để trình đọc màn hình đọc đúng giọng. |  | Code Đợt 1 (`97e85fa`). Đạt: C1-AC08. | Hoàn thành | Trung bình |

### C2 Dải 8 ô

Nghiệm thu: **3/3** mục đạt. Chức năng hoàn thành: 3/3.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **C2-01** Kích thước và số ô | Dải 8 ô: số ô bằng số câu trong nhóm. | Ô 10 x 10 px, cách 4 px. |  | Code Đợt 1 (`97e85fa`). Đạt: C2-AC01. | Hoàn thành | Trung bình |
| 2 | [x] **C2-02** Trạng thái ô | 4 trạng thái ô: Chưa học, Đang học, Đã nhớ, Cần ôn. | Cần ôn có vạch chéo để phân biệt không cần màu. |  | Code Đợt 1 (`97e85fa`). Đạt: C2-AC02. | Hoàn thành | Trung bình |
| 3 | [x] **C2-03** Trợ năng | Nhãn trợ năng cho dải và từng ô. | Ví dụ "Câu 3, đã nhớ"; ô không nhận focus. |  | Code Đợt 1 (`97e85fa`). Đạt: C2-AC03. | Hoàn thành | Thấp |

### C3 Nút

Nghiệm thu: **3/4** mục đạt. Chức năng hoàn thành: 3/4.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **C3-01** Nút chính | Nút chính. | Cao 48 px; mỗi màn tối đa một nút chính. |  | Code Đợt 1 (`97e85fa`). Đạt: C3-AC01. | Hoàn thành | Cao |
| 2 | [x] **C3-02** Nút phụ | Nút phụ và nút dạng chữ. | Viền 1 px; nút chữ cho hành động thứ ba trở đi. |  | Code Đợt 1 (`97e85fa`). Đạt: C3-AC01. | Hoàn thành | Trung bình |
| 3 | [ ] **C3-03** Cặp nút đánh giá | Cặp nút đánh giá "Cần ôn lại" / "Tôi nhớ". | Cao 56 px, chia đều, khác cả màu lẫn icon để không bấm nhầm. |  | Code Đợt 1 (`97e85fa`). Đạt: C3-AC02. Còn mở: C3-AC03 [human]. | Chờ thử thật | Cao |
| 4 | [x] **C3-04** Trạng thái chung | Trạng thái chung của nút. | Hover, nhấn, focus, khóa, đang xử lý; vùng chạm tối thiểu 44 x 44 px. |  | Code Đợt 1 (`97e85fa`). Đạt: C3-AC04. | Hoàn thành | Trung bình |

### C4 Lựa chọn trắc nghiệm

Nghiệm thu: **3/3** mục đạt. Chức năng hoàn thành: 3/3.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **C4-01** Bố cục | Bố cục 4 lựa chọn trắc nghiệm. | Cao tối thiểu 56 px, không cắt chữ; số 1 đến 4 chỉ hiện từ 900 px. |  | Code Đợt 1 (`97e85fa`). Đạt: C4-AC01. | Hoàn thành | Trung bình |
| 2 | [x] **C4-02** Chọn đáp án | Chọn đáp án đúng / sai. | Sai thì khóa riêng lựa chọn đó và cho chọn tiếp. |  | Code Đợt 1 (`97e85fa`). Đạt: C4-AC02. | Hoàn thành | Trung bình |
| 3 | [x] **C4-03** Thông báo kết quả | Đọc kết quả cho trình đọc màn hình. | Qua `aria-live`; luôn có icon kèm màu. |  | Code Đợt 1 (`97e85fa`). Đạt: C4-AC03. | Hoàn thành | Thấp |

### C5 Thanh tab

Nghiệm thu: **4/4** mục đạt. Chức năng hoàn thành: 4/4.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **C5-01** Thanh dưới đáy | Thanh tab dưới đáy (điện thoại). | Cao 64 px cộng vùng an toàn đáy. |  | Code Đợt 1 (`97e85fa`). Đạt: C5-AC01. | Hoàn thành | Trung bình |
| 2 | [x] **C5-02** Thanh dọc | Thanh dọc bên trái (máy tính). | Rộng 220 px, mỗi mục cao 48 px. |  | Code Đợt 1 (`97e85fa`). Đạt: C5-AC02. | Hoàn thành | Trung bình |
| 3 | [x] **C5-03** Mục đang chọn | Đánh dấu mục đang chọn. | Chữ đậm và gạch 2 px; có `aria-current`. |  | Code Đợt 1 (`97e85fa`). Đạt: C5-AC03. | Hoàn thành | Thấp |
| 4 | [x] **C5-04** Mục có số | Mục Luyện tập hiện số câu cần ôn. | Chỉ hiện khi số đó lớn hơn 0. |  | Code Đợt 1 (`97e85fa`). Đạt: C5-AC04. | Hoàn thành | Thấp |

### C6 Sheet

Nghiệm thu: **4/5** mục đạt. Chức năng hoàn thành: 3/4.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **C6-01** Dạng hiển thị | Sheet trượt từ dưới lên (điện thoại) / hộp thoại giữa màn (máy tính). | Cao tối đa 90%, có tay nắm. |  | Code Đợt 1 (`97e85fa`). Đạt: C6-AC01. Đã chốt 10/10: lớp nền `--scrim`, giao diện tối là đen độ mờ 60% (sửa Đợt 3). | Hoàn thành | Thấp |
| 2 | [ ] **C6-02** Tiêu đề và đóng | Tiêu đề và các cách đóng sheet. | Nút x, chạm nền, Esc, vuốt xuống; sheet xác nhận không đóng khi chạm nền. |  | Code Đợt 1 (`97e85fa`). Đạt: C6-AC02. Còn mở: C6-AC03 [human]. | Chờ thử thật | Trung bình |
| 3 | [x] **C6-03** Focus | Giữ focus trong sheet. | Đóng thì trả focus về nút đã mở. |  | Code Đợt 1 (`97e85fa`). Đạt: C6-AC04. | Hoàn thành | Trung bình |
| 4 | [x] **C6-04** Nội dung dài | Nội dung dài cuộn bên trong sheet. | Tiêu đề và nút chính đứng yên. |  | Code Đợt 1 (`97e85fa`). Đạt: C6-AC05. | Hoàn thành | Thấp |

### C7 Thông báo ngắn

Nghiệm thu: **3/3** mục đạt. Chức năng hoàn thành: 3/3.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **C7-01** Vị trí và hiển thị | Thông báo ngắn ở đáy màn. | Ngay trên thanh tab, rộng tối đa 480 px. |  | Code Đợt 1 (`97e85fa`). Đạt: C7-AC01. | Hoàn thành | Thấp |
| 2 | [x] **C7-02** Thời gian và hành động | Thời gian hiện và nút hành động. | Tự ẩn sau 3 giây; có nút thì 6 giây; mỗi lúc một thông báo. |  | Code Đợt 1 (`97e85fa`). Đạt: C7-AC02. | Hoàn thành | Thấp |
| 3 | [x] **C7-03** Trợ năng | Trợ năng thông báo. | `role=status` hoặc `alert`; không lấy focus. |  | Code Đợt 1 (`97e85fa`). Đạt: C7-AC03. | Hoàn thành | Thấp |

## Nền tảng, dữ liệu và mục tiêu sản phẩm

### FND Nền tảng thiết kế

Màu, chữ, khoảng cách, icon, chuyển động, giọng văn, trợ năng. Nghiệm thu: **14/17** mục đạt. Chức năng hoàn thành: 11/14.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **FND-01** Token màu | Token màu sáng và tối. | Chỉ `tokens.css` được chứa mã màu; màu lấy từ logo (navy, đỏ cam). |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC01, FND-AC02. | Hoàn thành | Cao |
| 2 | [x] **FND-02** Quy tắc dùng màu | Quy tắc dùng màu thương hiệu. | Màu brand chỉ cho một nút chính mỗi màn và ô đang học; tương phản tối thiểu 4.5:1. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC02, FND-AC03. | Hoàn thành | Cao |
| 3 | [x] **FND-03** Sáng và tối | Sáng / tối theo hệ thống, ghi đè được trong Cài đặt. | Không nhấp nháy giao diện sai khi mở app. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC04. Đã chốt 10/10: dùng "Theo thiết bị". | Hoàn thành | Thấp |
| 4 | [x] **FND-04** Font | Font Lexend, Literata và Noto theo hệ chữ. | Tự host; Noto chỉ tải khi học ngôn ngữ cần. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC05. | Hoàn thành | Trung bình |
| 5 | [x] **FND-05** Thang chữ | Thang chữ 6 cỡ. | Từ 13 px tới 39 px. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC06. | Hoàn thành | Trung bình |
| 6 | [x] **FND-06** Cỡ câu theo độ dài | Cỡ câu theo độ dài. | Dưới 40 ký tự / 40 đến 90 / trên 90; luôn căn trái. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC07. | Hoàn thành | Trung bình |
| 7 | [x] **FND-07** Khoảng cách và lề | Khoảng cách lưới 4 px. | Lề 16 px dưới 600 px, 24 px từ 600 px. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC08. | Hoàn thành | Thấp |
| 8 | [x] **FND-08** Bo góc theo vai trò | Bo góc theo vai trò. | Ô nhập 6, nút 10, thẻ và sheet 16 px. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC08. | Hoàn thành | Thấp |
| 9 | [x] **FND-09** Đổ bóng | Đổ bóng chỉ cho sheet và hộp thoại. | Thẻ câu không có bóng. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC08. | Hoàn thành | Thấp |
| 10 | [x] **FND-10** Icon | Một bộ icon Phosphor nét Regular. | Không emoji, không ảnh bitmap. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC09. | Hoàn thành | Thấp |
| 11 | [ ] **FND-11** Chuyển động | Chuyển động chỉ để phản hồi thao tác. | 180 / 150 / 220 ms; tắt hết khi bật giảm chuyển động. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC10. Còn mở: FND-AC11 [human]. | Chờ thử thật | Trung bình |
| 12 | [ ] **FND-12** Giọng văn và từ ngữ | Giọng văn và từ ngữ thống nhất. | Gọi người học là "bạn"; lỗi phải nói rõ cần làm gì; có bảng từ dùng / không dùng. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC12. Còn mở: FND-AC13 [human]. Đợt 3 rà lại toàn bộ chuỗi giao diện và sửa 3 chỗ (APP-08, S8-05, T2); danh sách ở `docs/evidence/FND-AC12/chuoi-giao-dien.md`. | Chờ thử thật | Cao |
| 13 | [x] **FND-13** Quy tắc tránh giao diện kiểu AI | Quy tắc tránh giao diện kiểu AI. | Không gradient, kính mờ, emoji, lưới thẻ giống hệt, viết hoa toàn bộ, khẩu hiệu chung chung. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC14. | Hoàn thành | Cao |
| 14 | [ ] **FND-14** Trợ năng chung | Trợ năng chung. | Dùng hết bằng bàn phím, vùng chạm 44 px, `lang` đúng, phóng chữ 200% không mất nội dung. |  | Code Đợt 1 (`97e85fa`). Đạt: FND-AC15, FND-AC16. Còn mở: FND-AC17 [human]. | Chờ thử thật | Cao |

### DATA Dữ liệu và tiến độ

Đọc dữ liệu tĩnh, lưu tiến độ, quy tắc ôn, tìm kiếm. Nghiệm thu: **18/19** mục đạt. Chức năng hoàn thành: 12/13.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [x] **DATA-01** Manifest | Đọc manifest của từng bộ nội dung. | Thiếu `count`, `version` thì lấy từ file ngôn ngữ. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC01, DATA-AC16, DATA-AC19. | Hoàn thành | Cao |
| 2 | [x] **DATA-02** File ngôn ngữ | Đọc file ngôn ngữ. | Trường câu gốc luôn tên `en` ở mọi file, kể cả tiếng Nhật, tiếng Đức. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC01, DATA-AC02, DATA-AC19. | Hoàn thành | Cao |
| 3 | [x] **DATA-03** File unit | Đọc file unit. | `ids` có thể là chuỗi có số 0 đầu hoặc số; phải chạy đúng khi unit dưới 8 câu. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC01, DATA-AC03, DATA-AC16, DATA-AC19. | Hoàn thành | Cao |
| 4 | [x] **DATA-04** Trường tùy chọn | Trường tùy chọn: `noteVi`, `topic`, `situation`, furigana... | Global English có 177 chủ đề, phân bố lệch. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC04, DATA-AC18. | Hoàn thành | Trung bình |
| 5 | [x] **DATA-05** Nguồn dữ liệu thay được | Nguồn dữ liệu thay được (fixture cho test, file tĩnh cho bản build). | Đổi base URL không phải sửa code. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC02, DATA-AC05. | Hoàn thành | Trung bình |
| 6 | [x] **DATA-06** Lưu tiến độ | Lưu tiến độ và cài đặt trong localStorage. | Tiền tố khóa `vitasr2.` để không đụng dữ liệu bản cũ. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC06, DATA-AC07, DATA-AC17. Đã chốt 10/10: ghi các trường lưu thêm vào DATA-06. | Hoàn thành | Cao |
| 7 | [x] **DATA-07** Quy tắc câu cần ôn | Quy tắc câu cần ôn. | Ôn sau 1, 3, 7, 14, 30 ngày; sai hoặc dùng gợi ý thì về 0. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC08, DATA-AC09. Đã chốt 10/10: khoảng ôn 1, 3, 7, 14, 30 ngày; đúng không gợi ý giữ nguyên lịch. | Hoàn thành | Cao |
| 8 | [x] **DATA-08** Đáp án nhiễu | Sinh 3 đáp án nhiễu cho câu trắc nghiệm. | Tất định theo id câu, ưu tiên lấy từ unit khác, không trùng sau chuẩn hóa. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC10. | Hoàn thành | Trung bình |
| 9 | [ ] **DATA-09** Fixture | Bộ dữ liệu test (fixture) và tiến độ mẫu 30 ngày. | Sinh bằng `scripts/make-fixtures.mjs`, không sửa tay; số liệu T4 có bản tính tay để so. |  | Code Đợt 2 (`757a784`). Đạt: DATA-AC11. Còn mở: DATA-AC12 [human]. Chưa thể quyết thay khách: vẫn cần tin nhắn xác nhận của khách (buổi 4 trong `docs/thu-that/README.md`). | Chờ thử thật | Cao |
| 10 | [x] **DATA-10** Không gọi mạng ngoài phạm vi | Không gọi mạng ngoài phạm vi. | Không gọi `/api/sharing/*` hay API nào của bản cũ; không gửi dữ liệu người học đi đâu. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC13. | Hoàn thành | Cao |
| 11 | [x] **DATA-11** Lộ trình học | Lộ trình học theo thứ tự unit. | Câu tiếp theo là câu chưa học đầu tiên của unit đầu tiên còn câu chưa học. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC14. Đã chốt 10/10: không cho chọn trình độ bắt đầu ở bản này; học trình độ khác qua bộ lọc Thư viện. | Hoàn thành | Cao |
| 12 | [x] **DATA-12** Tìm kiếm | Tìm kiếm bỏ dấu, không phân biệt hoa thường. | "dat phong" khớp "đặt phòng"; khớp theo chuỗi con. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC15. | Hoàn thành | Trung bình |
| 13 | [x] **DATA-13** Bộ nội dung | Hai bộ nội dung: Global English và English Fluency. | Global chỉ có tiếng Anh, 6 trình độ; Fluency có 15 ngôn ngữ. |  | Code Đợt 1 (`97e85fa`). Đạt: DATA-AC16, DATA-AC17. | Hoàn thành | Cao |

### G Mục tiêu sản phẩm

Kiểm bằng buổi thử với người học thật, sau khi các khu vực khác đạt. Nghiệm thu: **1/5** mục đạt. Chức năng hoàn thành: 1/5.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | [ ] **G-01** Giao diện dễ hiểu dễ nhìn để sử dụng | Người mới tự dùng được, không cần hướng dẫn. | Thử với 5 người học: không quá 2 lần chạm từ chọn ngôn ngữ tới câu đầu tiên. |  | Còn mở: G-AC01 [human]. | Chờ thử thật | Cao |
| 2 | [ ] **G-02** Hiểu được tiến bộ của mình | Người học hiểu được tiến bộ của mình. | 4/5 người tự tìm được màn Tiến độ và giải thích đúng "câu cần ôn". |  | Còn mở: G-AC02 [human]. | Chờ thử thật | Cao |
| 3 | [ ] **G-03** Không nhầm thao tác đánh giá | Không bấm nhầm "Tôi nhớ" và "Cần ôn lại". | Quan sát trong cả buổi thử. |  | Còn mở: G-AC03 [human]. | Chờ thử thật | Cao |
| 4 | [x] **G-04** Gọn hơn bản cũ | Gọn hơn bản cũ. | Chỉ 4 khu chính, Cài đặt và 3 màn toàn trang; không có hộp thoại chồng hộp thoại. |  | Đạt: G-AC04. | Hoàn thành | Trung bình |
| 5 | [ ] **G-05** Không mang dấu hiệu giao diện do AI dựng mặc định | Không mang dấu hiệu giao diện do AI dựng. | Hai người ngoài nhóm xem ảnh 5 màn chính và không chỉ ra được dấu hiệu nào trong FND-13. |  | Còn mở: G-AC05 [human]. Đã chốt 10/10: nhóm duyệt nội bộ qua ảnh bằng chứng và bản chạy thử; khách duyệt một lần khi bàn giao. | Chờ thử thật | Cao |

## Chức năng của bản cũ chưa có trong bản mới

Các mục dưới đây không nằm trong 135 chức năng ở trên. Đã chốt ngày 10/10/2026 (Claude quyết định theo ủy quyền của nhóm, `docs/new/ui-spec.md` mục 3 và 5); khách cần mục nào thì làm thành đợt riêng.

| STT | Tên chức năng | Mô tả mong muốn | Chi tiết cần lưu ý | Câu hỏi cần trao đổi | Phản hồi Dev | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| 1 | Chia sẻ | Bản cũ có tính năng chia sẻ qua `/api/sharing/*` | Là phần duy nhất của bản cũ cần server; bản mới không có backend (QD-03) | | Không có ở bản này; khách cần thì khách cung cấp backend | Đã chốt | Thấp |
| 2 | Chọn trình độ bắt đầu | Người học Global English chọn bắt đầu từ A1 đến C2 | Lộ trình đi lần lượt từ A1-01 (DATA-11) | | Không có ở bản này; học trình độ khác qua bộ lọc Trình độ ở Thư viện | Đã chốt | Thấp |
| 3 | Chế độ "Tiếng Việt (từ tiếng Anh)" | Đảo chiều câu gốc và nghĩa như bản cũ | Ghi ở bảng Đã trả lời của S1 | | Không có ở bản này | Đã chốt | Thấp |
| 4 | Đọc nghĩa tiếng Việt thành tiếng | Nút nghe nghĩa ở thẻ câu | Giọng tiếng Việt chọn và lưu được ở S8-02 | | Không có ở bản này; giữ lựa chọn giọng để dùng sau | Đã chốt | Thấp |
| 5 | Tải gói âm thanh ngoại tuyến | Dùng âm thanh dựng sẵn thay giọng của máy | Dữ liệu chỉ có gói tiếng Lào; mục S8-03 đang ẩn | | Để bản sau | Đã chốt | Thấp |
| 6 | Đọc lại tiến độ của bản cũ | Chuyển tiến độ người học từ bản cũ sang | Nhóm trả lời không cần (08/10) | | Khóa lưu trữ mới có tiền tố `vitasr2.` để không đụng dữ liệu cũ | Đã chốt | Thấp |
| 7 | Mục pháp lý ở bản cũ 1.9.45 | Mục xuất hiện sau khi nhóm ghi lại bản 1.9.40 | Lần đọc ngày 10/10 không thấy lại | | Không đưa vào bản này vì chưa có nội dung từ khách | Đã chốt | Thấp |

## Công việc tiếp theo

Phần code và câu hỏi mở đã xong. Việc còn lại là của nhóm và khách: bật bản chạy thử, thử thật để đóng 22 mục `[human]`, rồi bàn giao khi đủ 173/173 mục.

| STT | Công việc | Mô tả | Chi tiết cần lưu ý | Người làm | Hạn | Trạng thái | Ưu tiên |
|---|---|---|---|---|---|---|---|
| **1** | **Việc nhỏ** | | | | | | |
| 1.1 | [x] Ghim Ubuntu cho CI | `runs-on: ubuntu-24.04` trong `.github/workflows/ci.yml` | Xong ở PR #8 | Người giữ repo | 19/10 | Hoàn thành | Cao |
| 1.2 | [ ] Quyết repo công khai hay riêng tư | Repo đang công khai và chứa đủ 12 MB dữ liệu của khách trong `fe/public/data/` | Bật GitHub Pages thì dữ liệu có thêm một địa chỉ web công khai; Pages của repo riêng tư cần gói trả phí | Nhóm | Sớm nhất có thể | Chưa làm | Cao |
| 1.3 | [ ] Xin khách xác nhận bằng văn bản | Xác nhận cho dùng bộ dữ liệu khi phát triển và demo | Lưu tin nhắn làm bằng chứng cho DATA-AC12 | Người liên hệ khách | | Chưa làm | Cao |
| 1.4 | [ ] Dọn nhánh | Xóa các nhánh đã gộp: `Khung_du_an`, `dinhdat`, `feature/don-repo`, `feature/dot2-cac-man-con-lai`, `Manh_work_10_10`, `feature/fix-ci-giong-doc` | Mọi người `git checkout main && git pull` trước khi làm tiếp | Người giữ repo | | Chưa làm | Thấp |
| 1.5 | [x] Gộp nhánh `Manh_work_10_10` | APP-09, APP-12 | Xong ở PR #7 | Mạnh | | Hoàn thành | Cao |
| 1.6 | [x] Sửa CI đỏ sau PR #7 | Dòng báo thiếu giọng đẩy nút xuống làm test bấm trượt | Xong ở PR #8 | Claude + người commit | | Hoàn thành | Cao |
| **2** | **Chốt câu hỏi mở** | | | | | | |
| 2.1 | [x] Câu hỏi cho khách | Chia sẻ, chọn trình độ bắt đầu, chế độ đảo chiều, ai duyệt thiết kế, mục pháp lý 1.9.45, cách mở app | Claude quyết định 10/10 theo ủy quyền của nhóm; khách muốn khác thì sửa ở đợt sau | Claude | | Hoàn thành | Cao |
| 2.2 | [x] Các mục "Cần trao đổi" và "Chờ xác nhận" | Ghi quyết định vào bảng "Đã trả lời" cuối từng `spec.md` | Như trên | Claude | | Hoàn thành | Cao |
| **3** | **Thử thật để đóng 23 mục `[human]`** (kịch bản: `docs/thu-that/README.md`) | | | | | | |
| 3.0 | [ ] Bật bản chạy thử trên HTTPS | Workflow `.github/workflows/pages.yml` đã có; chủ repo vào Settings > Pages chọn Source là "GitHub Actions" và thêm biến repo `PAGES_ENABLED` = `true` | Địa chỉ: `https://nguyendinhdat2207.github.io/dangonngu/`; service worker chỉ chạy trên HTTPS hoặc localhost | Chủ repo | | Chưa làm | Cao |
| 3.1 | [ ] Thử trên thiết bị thật (9 mục) | C1-AC05, C3-AC03, C6-AC03, APP-AC13, APP-AC14, FND-AC11, FND-AC17, S8-AC03, S8-AC07 | Buổi 1 trong kịch bản | Nhóm | | Chưa làm | Cao |
| 3.2 | [ ] Thử với người học thật (10 mục) | G-AC01, G-AC02, G-AC03, S1-AC06, S3-AC11, S5-AC10, S9-AC06, T1-AC09, T4-AC10, S8-AC12 | Buổi 2 trong kịch bản, có phiếu ghi | Nhóm | | Chưa làm | Cao |
| 3.3 | [ ] Người ngoài nhóm đọc và xem (2 mục) | FND-AC13, G-AC05 | Buổi 3; danh sách chuỗi ở `docs/evidence/FND-AC12/chuoi-giao-dien.md` | Nhóm | | Chưa làm | Trung bình |
| 3.4 | [ ] Khách xác nhận dữ liệu (1 mục) | DATA-AC12 | Dùng tin nhắn ở việc 1.3 | Người liên hệ khách | | Chưa làm | Cao |
| 3.5 | [ ] Thử trên trang học chính thật (1 mục) | APP-AC20 | Cần tài khoản đăng nhập được và đường dẫn tới bản chạy thử | Nhóm | | Chưa làm | Cao |
| **4** | **Đợt 3 và sau đó** | | | | | | |
| 4.1 | [x] Sửa code theo các quyết định | Kiểm tra nhanh chờ giọng rồi mới hiện lựa chọn; Thoát và Dừng về Luyện tập; nút "Học N câu"; lớp nền sheet tối; ba câu chữ theo FND-12 | Đợt 3, 10/10 | Claude + người commit | | Hoàn thành | Cao |
| 4.2 | [ ] Sửa lỗi tìm thấy khi thử | Lỗi ghi ở mục "Lỗi tìm thấy" của kịch bản thử thật | | Claude + người commit | | Chưa làm | Cao |
| 4.3 | [ ] Test trên WebKit | CI có job WebKit chạy song song, chưa chặn việc gộp | Xem tóm tắt của lần chạy CI; đạt ổn định thì bỏ `continue-on-error` | Claude | | Đang làm | Trung bình |
| 4.4 | [x] Mục pháp lý bản cũ 1.9.45 | Không đưa vào bản này | | Claude | | Hoàn thành | Thấp |
| 4.5 | [x] Sửa dòng bằng chứng | Mọi dòng "chưa commit" đã thay bằng mã commit | | Claude | | Hoàn thành | Thấp |
| 4.6 | [x] Code nút về trang học chính (APP-12) | Liên kết ở thanh trên cùng T1 đến T4 và S1 bước 1 | Xong ở PR #7, sửa đường kẻ thừa ở PR #8 | Claude + Mạnh | | Hoàn thành | Cao |
| 4.7 | [x] Sửa theo phản hồi người dùng (Đợt 4) | Câu sai màu đỏ; rà câu chữ, "Tiến bộ" thành "Tiến độ"; giọng mặc định ưu tiên giọng Google | Đợt 4, 18/10 | Claude + người commit | | Hoàn thành | Cao |
| 4.8 | [x] Rà soát code (Đợt 4) | 12 lỗi đã sửa, mỗi lỗi có test hỏng trên code cũ; chưa sửa: bộ nhớ trình duyệt đầy bị báo như bị chặn (rất hiếm), dữ liệu ngoại tuyến không có hạn chờ khi mạng chậm (cần đánh phiên bản cho file dữ liệu) | Đợt 4, 18/10 | Claude | | Hoàn thành | Trung bình |
| **5** | **Bàn giao** | | | | | | |
| 5.1 | [ ] Thống nhất nơi đặt bản build | Và đường dẫn để trang học chính mở mini app mới | | Nhóm + khách | | Chưa làm | Cao |
| 5.2 | [ ] Kiểm trên trang học chính thật | Chọn ngôn ngữ, học một phiên, xem tiến độ, rồi bấm Quay lại trang học | Dùng chung buổi 4 của kịch bản | Nhóm | | Chưa làm | Cao |
| 5.3 | [ ] Bàn giao | Mã nguồn, bản build, hướng dẫn cập nhật dữ liệu (theo DATA-01 đến DATA-04), báo cáo nghiệm thu 184/184 | Khách duyệt thiết kế một lần ở mốc này | Nhóm | | Chưa làm | Cao |

## Cập nhật file này

Trạng thái trong file lấy từ dấu `[x]` của các `acceptance.md` sau Đợt 4. Sau mỗi đợt, chạy `npm run spec:acceptance` để sinh lại `docs/generated/acceptance-report.md` rồi đối chiếu số liệu ở mục Tổng quan tiến độ.
