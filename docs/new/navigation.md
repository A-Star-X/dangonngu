# Sơ đồ điều hướng: bản mới

Các sơ đồ trong file này là hình minh họa. Nguồn chân lý cho điều hướng là bảng route APP-04 trong `fe/src/app/spec.md` và các yêu cầu điều hướng trong spec của từng trang. Khi hai nơi khác nhau, spec thắng; sửa sơ đồ cho khớp.

Mỗi mũi tên trong sơ đồ có một dòng chú thích `%% @spec <ID>` ngay bên dưới, trỏ tới yêu cầu quy định mũi tên đó (hoặc `%% @none <lý do>` nếu nằm ngoài phạm vi). Dòng chú thích không hiện khi render. `npm run spec:check` báo lỗi khi một mũi tên chưa được gắn yêu cầu hoặc trỏ tới yêu cầu không tồn tại; bảng ánh xạ đầy đủ sinh ra ở `docs/generated/navigation-trace.md`.

File gồm bốn mức, từ khái quát tới chi tiết:

1. Sơ đồ tổng quát: các khối lớn của app.
2. Luồng khởi động: kiểm tra lần đầu, chọn ngôn ngữ, rồi mới vào T1.
3. Điều hướng giữa các màn: mọi đường đi giữa màn, màn toàn trang và sheet.
4. Sơ đồ cửa sổ: từng cửa sổ với các nút bên trong và cửa sổ mà mỗi nút mở ra.

## 1. Sơ đồ tổng quát

```mermaid
flowchart LR
  HOST["Trang học chính<br/>(ngoài phạm vi)"] -->|"chọn Đa ngôn ngữ, mở trang mới"| BOOT["Khởi động<br/>kiểm tra lần đầu"]
  %% @none trang chính ngoài phạm vi, xem docs/legacy/README.md
  BOOT -->|"lần đầu"| S1["S1 Chọn ngôn ngữ<br/>và bộ nội dung"]
  %% @spec APP-05, S1-07
  BOOT -->|"đã chọn ngôn ngữ"| MAIN
  %% @spec APP-05
  S1 --> MAIN
  %% @spec S1-04

  subgraph MAIN["4 khu chính, chuyển bằng thanh tab"]
    T1["T1 Học"]
    T2["T2 Luyện tập"]
    T3["T3 Thư viện"]
    T4["T4 Tiến độ"]
  end

  MAIN <--> FULL["Màn toàn trang<br/>S3 Phiên học, S5 Kiểm tra nhanh"]
  %% @spec APP-03, T1-02, T2-04
  MAIN <--> S8["S8 Cài đặt"]
  %% @spec APP-02, APP-04
  MAIN <--> SHEET["Sheet<br/>đổi ngôn ngữ, từ khóa, chi tiết câu,<br/>chi tiết ngày, giọng đọc, xác nhận"]
  %% @spec APP-11, C6-01
  MAIN -->|"Quay lại trang học"| HOST
  %% @spec APP-12
  S1 -->|"Quay lại trang học"| HOST
  %% @spec APP-12
```

## 2. Luồng khởi động

Người học chỉ vào được T1 sau khi app tải xong danh sách ngôn ngữ và đã có ngôn ngữ đang học. Lần đầu mở app thì phải qua S1 Chọn ngôn ngữ; nếu chọn tiếng Anh thì chọn tiếp bộ nội dung (Global English hoặc English Fluency); rồi T1 hiện kèm hướng dẫn 3 bước (S9). Yêu cầu liên quan: APP-05, APP-08, S1-04, S1-07, DATA-13, S9-01.

```mermaid
flowchart TD
  A(["Mở mini app"]) --> B["Khởi động<br/>hiện khung xương, tải danh sách ngôn ngữ"]
  %% @spec APP-05
  B --> C{"Tải được?"}
  %% @spec APP-05
  C -->|"Không"| E["Lỗi tải<br/>Không tải được danh sách câu<br/>nút Thử lại"]
  %% @spec APP-08
  E -->|"Thử lại"| B
  %% @spec APP-08
  C -->|"Có"| D{"Đã lưu ngôn ngữ<br/>đang học?"}
  %% @spec APP-05
  D -->|"Chưa: lần đầu"| S1["S1 Chọn ngôn ngữ"]
  %% @spec APP-05
  S1 -->|"chạm một ngôn ngữ"| M{"Ngôn ngữ có<br/>nhiều bộ nội dung?"}
  %% @spec S1-04, DATA-13
  M -->|"Có: tiếng Anh"| PK["S1 bước 2<br/>Chọn bộ nội dung"]
  %% @spec S1-07
  PK -->|"chạm Global English<br/>hoặc English Fluency"| F["Tải câu và unit<br/>của bộ và ngôn ngữ đó"]
  %% @spec S1-07, DATA-05
  M -->|"Không"| F
  %% @spec S1-04
  PK -->|"Quay lại"| S1
  %% @spec S1-07
  D -->|"Rồi"| F
  %% @spec APP-05
  F --> G{"Tải được?"}
  %% @spec APP-05, S1-04
  G -->|"Không"| E
  %% @spec APP-08
  G -->|"Có"| H{"Đã xem<br/>hướng dẫn?"}
  %% @spec S9-01
  H -->|"Chưa: lần đầu"| S9["T1 Học<br/>kèm S9 Hướng dẫn 3 bước"]
  %% @spec S9-01
  S9 -->|"Bỏ qua hoặc Esc"| T1["T1 Học"]
  %% @spec S9-03
  S9 -->|"Bắt đầu học ở bước 3"| S3["S3 Phiên học"]
  %% @spec S9-03
  H -->|"Rồi"| T1
  %% @spec S9-04
```

## 3. Điều hướng giữa các màn

Sơ đồ chỉ vẽ chiều đi tới. Các đường quay về nằm trong bảng ngay dưới.

```mermaid
flowchart TD
  BOOT["Khởi động<br/>kiểm tra lần đầu, xem mục 2"] -->|"lần đầu"| L["S1 Chọn ngôn ngữ"]
  %% @spec APP-05
  L -->|"chạm ngôn ngữ chỉ có một bộ"| TABS
  %% @spec S1-04
  L -->|"chạm Tiếng Anh"| PK["S1 bước 2 Chọn bộ nội dung"]
  %% @spec S1-07
  PK -->|"chạm một bộ"| TABS
  %% @spec S1-07
  BOOT -->|"đã chọn ngôn ngữ"| TABS
  %% @spec APP-05

  subgraph TABS["4 khu chính, chuyển bằng thanh tab"]
    %% @spec APP-01, C5-01
    direction LR
    H["T1 Học"]
    P["T2 Luyện tập"]
    B["T3 Thư viện"]
    G["T4 Tiến độ"]
  end

  TABS -->|"tên ngôn ngữ"| LS["Sheet Đổi ngôn ngữ<br/>hoặc bộ nội dung"]
  %% @spec APP-02, APP-06
  TABS -->|"Cài đặt"| ST["S8 Cài đặt"]
  %% @spec APP-02

  H -->|"Học 8 câu / Tiếp tục<br/>N câu cần ôn hôm nay"| S["S3 Phiên học"]
  %% @spec T1-02, T1-04
  H -->|"Mở Luyện tập, khi học hết lộ trình"| P
  %% @spec T1-05
  P -->|"Ôn tập hôm nay"| S
  %% @spec T2-02
  P -->|"Học theo từ khóa"| C["Sheet Học theo từ khóa"]
  %% @spec T2-03
  C -->|"Học 8 câu đầu"| S
  %% @spec T2-03
  P -->|"Kiểm tra nhanh"| K["S5 Kiểm tra nhanh"]
  %% @spec T2-04
  K -->|"xong bước cuối"| KR["S5 Kết quả"]
  %% @spec S5-07
  B -->|"chạm vào câu"| D["Sheet Chi tiết câu"]
  %% @spec T3-05
  D -->|"Học câu này"| S
  %% @spec T3-05
  G -->|"chạm vào cột ngày"| GD["Sheet Chi tiết ngày"]
  %% @spec T4-07
  G -->|"Học 8 câu, khi chưa có phiên"| S
  %% @spec T4-08
  S -->|"xong câu cuối"| SR["S3c Tổng kết phiên"]
  %% @spec S3-02, S3-06
  ST -->|"Giọng đọc"| V["Sheet Giọng đọc"]
  %% @spec S8-02
  H -->|"Cài đặt > Giọng đọc, khi thiết bị thiếu giọng"| V
  %% @spec C1-05
  ST -->|"Xem lại hướng dẫn"| HD["T1 kèm S9 Hướng dẫn"]
  %% @spec S8-06, S9-05
```

| Từ | Thao tác | Về | Yêu cầu |
|---|---|---|---|
| S3 Phiên học | Thoát, xác nhận Dừng | Màn đã mở phiên (T1, T2, T3 hoặc T4) | S3-07 |
| S3 Phiên học | Nhóm câu rỗng (ví dụ không còn câu cần ôn) | Màn đã mở phiên, kèm thông báo ngắn | S3-01 |
| S3c Tổng kết phiên | Học tiếp N câu / Nhóm tiếp | S3 Phiên học, nhóm câu mới | S3-06 |
| S3c Tổng kết phiên | Xem tiến độ | T4 Tiến độ | S3-06 |
| S3c Tổng kết phiên | Xong | T1 Học | S3-06 |
| S5 Kiểm tra nhanh | Thoát, xác nhận Dừng | T2 Luyện tập | S5-08 |
| S5 màn bắt đầu | Thoát | T2 Luyện tập | S5-08 |
| S5 Kết quả | Kiểm tra unit tiếp theo | S5 Kiểm tra nhanh, unit sau | S5-07 |
| S5 Kết quả | Xong | T2 Luyện tập | S5-07 |
| Sheet Đổi ngôn ngữ | Chọn ngôn ngữ hoặc bộ nội dung khác | T1 Học của ngôn ngữ hoặc bộ đó | APP-06 |
| S1 bước 2 Chọn bộ nội dung | Quay lại | S1 danh sách ngôn ngữ | S1-07 |
| S8 Cài đặt | Quay lại | Khu chính vừa mở S8 | APP-04 |
| T1 đến T4, S1 bước 1 | Quay lại trang học | Trang học chính (rời app) | APP-12 |
| S8 Cài đặt | Ngôn ngữ đang học | Sheet Đổi ngôn ngữ | S8-01 |
| S8 Cài đặt | Xóa tiến độ, xác nhận | T1 Học | S8-05 |
| Mọi sheet | Đóng | Cửa sổ đã mở sheet | C6-02 |

## 4. Sơ đồ cửa sổ

Ký hiệu, theo kiểu sơ đồ cửa sổ UML:

| Ký hiệu | Nghĩa |
|---|---|
| «window» | Một màn: khu chính, màn toàn trang hoặc S8 |
| «sheet» | Lớp phủ trượt từ dưới lên (C6); từ 900 px là hộp thoại giữa màn |
| «overlay» | Lớp phủ hướng dẫn S9 nằm trên T1 |
| «button», «hyperlink», «tab», «list item», «chart bar» | Phần tử trong cửa sổ |
| Mũi tên Click | Bấm phần tử đó thì mở cửa sổ ở đầu mũi tên |

Chỉ vẽ các phần tử dẫn sang cửa sổ khác và chỉ vẽ chiều đi tới, giống sơ đồ cửa sổ UML thông thường. Đường quay lại (nút Đóng của sheet, Hủy, Học tiếp sau khi xác nhận) ghi bằng chữ dưới mỗi sơ đồ. Mọi sheet có nút Đóng, đóng thì về đúng cửa sổ đã mở nó. Phần tử chỉ đổi trạng thái tại chỗ (Nghe, Xem gợi ý, bộ lọc, phân trang) không vẽ. Thanh tab có ở T1 đến T4 và S8, chỉ vẽ một lần ở mục 4.2.

### 4.1 Chọn ngôn ngữ, bộ nội dung và hướng dẫn lần đầu

```mermaid
flowchart TB
  classDef el fill:#d9d9d9,stroke:#333,color:#000
  classDef win fill:#fff,stroke:#333,color:#000

  subgraph W_S1["«window» S1 Chọn ngôn ngữ"]
    s1_en["«list item»<br/>Tiếng Anh"]
    s1_other["«list item»<br/>Ngôn ngữ khác"]
  end
  subgraph W_PACK["«window» S1 bước 2: Chọn bộ nội dung"]
    pk_global["«list item»<br/>Global English"]
    pk_fluency["«list item»<br/>English Fluency"]
  end
  subgraph W_S9["«overlay» S9 Hướng dẫn trên T1"]
    s9_skip["«button»<br/>Bỏ qua"]
    s9_start["«button»<br/>Bắt đầu học"]
  end
  subgraph W_T1["«window» T1 Học"]
    W_T1_x[" "]
  end
  subgraph W_S3["«window» S3 Phiên học"]
    W_S3_x[" "]
  end

  s1_en -->|"Click"| W_PACK
  %% @spec S1-04, S1-07
  pk_global -->|"Click"| W_S9
  %% @spec S1-07, S9-01
  pk_fluency -->|"Click"| W_S9
  %% @spec S1-07, S9-01
  s1_other -->|"Click"| W_S9
  %% @spec S1-04, S9-01
  s9_skip -->|"Click"| W_T1
  %% @spec S9-03
  s9_start -->|"Click"| W_S3
  %% @spec S9-03

  class s1_en,s1_other,pk_global,pk_fluency,s9_skip,s9_start el
  class W_S1,W_PACK,W_S9,W_T1,W_S3 win
  style W_T1_x fill:none,stroke:none
  style W_S3_x fill:none,stroke:none
```

Nút Quay lại ở bước chọn bộ về danh sách ngôn ngữ (S1-07). Nút Tiếp chuyển giữa bước 1/3, 2/3, 3/3 trong cùng lớp phủ; ở bước 3/3 nút chính là Bắt đầu học (S9-03). Hướng dẫn không hiện khi T1 đang ở trạng thái học hết lộ trình (S9-01) và không tự hiện lại sau khi xong hoặc bỏ qua (S9-04).

### 4.2 T1 Học và thanh tab

```mermaid
flowchart TB
  classDef el fill:#d9d9d9,stroke:#333,color:#000
  classDef win fill:#fff,stroke:#333,color:#000

  subgraph W_T1["«window» T1 Học"]
    t1_lang["«button»<br/>Tên ngôn ngữ ▾"]
    t1_set["«button»<br/>Cài đặt"]
    t1_start["«button»<br/>Học 8 câu / Tiếp tục"]
    t1_due["«hyperlink»<br/>N câu cần ôn hôm nay"]
    t1_tab2["«tab»<br/>Luyện tập"]
    t1_tab3["«tab»<br/>Thư viện"]
    t1_tab4["«tab»<br/>Tiến độ"]
    t1_done["«button»<br/>Mở Luyện tập, khi học hết"]
    t1_voice["«hyperlink»<br/>Cài đặt > Giọng đọc, khi thiếu giọng"]
  end
  subgraph W_LANG["«sheet» Đổi ngôn ngữ hoặc bộ nội dung"]
    lang_item["«list item»<br/>Ngôn ngữ hoặc bộ khác"]
  end
  subgraph W_S8["«window» S8 Cài đặt"]
    W_S8_x[" "]
  end
  subgraph W_S3["«window» S3 Phiên học"]
    W_S3_x[" "]
  end
  subgraph W_T2["«window» T2 Luyện tập"]
    W_T2_x[" "]
  end
  subgraph W_T3["«window» T3 Thư viện"]
    W_T3_x[" "]
  end
  subgraph W_T4["«window» T4 Tiến độ"]
    W_T4_x[" "]
  end
  subgraph W_VOICE["«sheet» Giọng đọc"]
    W_VOICE_x[" "]
  end
  subgraph W_T1n["«window» T1 Học, ngôn ngữ hoặc bộ mới"]
    W_T1n_x[" "]
  end

  t1_lang -->|"Click"| W_LANG
  %% @spec APP-02, APP-06
  t1_set -->|"Click"| W_S8
  %% @spec APP-02
  t1_start -->|"Click"| W_S3
  %% @spec T1-02
  t1_due -->|"Click"| W_S3
  %% @spec T1-04
  t1_tab2 -->|"Click"| W_T2
  %% @spec APP-01, C5-01
  t1_tab3 -->|"Click"| W_T3
  %% @spec APP-01, C5-01
  t1_tab4 -->|"Click"| W_T4
  %% @spec APP-01, C5-01
  lang_item -->|"Click"| W_T1n
  %% @spec APP-06
  t1_done -->|"Click"| W_T2
  %% @spec T1-05
  t1_voice -->|"Click"| W_VOICE
  %% @spec C1-05

  class t1_lang,t1_set,t1_start,t1_due,t1_tab2,t1_tab3,t1_tab4,t1_done,t1_voice,lang_item el
  class W_T1,W_LANG,W_S8,W_S3,W_T2,W_T3,W_T4,W_VOICE,W_T1n win
  style W_S8_x fill:none,stroke:none
  style W_S3_x fill:none,stroke:none
  style W_T2_x fill:none,stroke:none
  style W_T3_x fill:none,stroke:none
  style W_T4_x fill:none,stroke:none
  style W_VOICE_x fill:none,stroke:none
  style W_T1n_x fill:none,stroke:none
```

Thanh tab giống nhau ở T1 đến T4 và S8 (APP-01, S8). Nút Tên ngôn ngữ và Cài đặt có ở mọi khu chính (APP-02). Liên kết tới sheet Giọng đọc khi thiết bị thiếu giọng nằm trong thẻ câu (C1-05), nên cũng có ở S3 và sheet Chi tiết câu của T3.

### 4.3 S3 Phiên học

```mermaid
flowchart TB
  classDef el fill:#d9d9d9,stroke:#333,color:#000
  classDef win fill:#fff,stroke:#333,color:#000

  subgraph W_S3a["«window» S3a Ghi nhớ"]
    a_exit["«button»<br/>Thoát"]
    a_review["«button»<br/>Cần ôn lại"]
    a_known["«button»<br/>Tôi nhớ"]
  end
  subgraph W_S3b["«window» S3b Kiểm tra"]
    b_exit["«button»<br/>Thoát"]
    b_sum["«button»<br/>Xem tổng kết, ở câu cuối"]
  end
  subgraph W_STOP["«sheet» Dừng phiên học?"]
    stop_stop["«button»<br/>Dừng"]
  end
  subgraph W_S3c["«window» S3c Tổng kết phiên"]
    c_prog["«hyperlink»<br/>Xem tiến độ"]
    c_done["«hyperlink»<br/>Xong"]
  end
  subgraph W_ORIG["«window» Màn đã mở phiên"]
    W_ORIG_x[" "]
  end
  subgraph W_T4["«window» T4 Tiến độ"]
    W_T4_x[" "]
  end
  subgraph W_T1["«window» T1 Học"]
    W_T1_x[" "]
  end

  a_review -->|"Click"| W_S3b
  %% @spec S3-03, C3-03
  a_known -->|"Click"| W_S3b
  %% @spec S3-03, C3-03
  b_sum -->|"Click"| W_S3c
  %% @spec S3-04
  a_exit -->|"Click"| W_STOP
  %% @spec S3-07
  b_exit -->|"Click"| W_STOP
  %% @spec S3-07
  stop_stop -->|"Click"| W_ORIG
  %% @spec S3-07
  c_prog -->|"Click"| W_T4
  %% @spec S3-06
  c_done -->|"Click"| W_T1
  %% @spec S3-06

  class a_exit,a_review,a_known,b_exit,b_sum,stop_stop,c_prog,c_done el
  class W_S3a,W_S3b,W_STOP,W_S3c,W_ORIG,W_T4,W_T1 win
  style W_ORIG_x fill:none,stroke:none
  style W_T4_x fill:none,stroke:none
  style W_T1_x fill:none,stroke:none
```

Đường quay lại: ở S3b, nút Câu tiếp về S3a của câu sau (S3-02, S3-04). Ở sheet Dừng phiên, nút Học tiếp đóng sheet và giữ nguyên câu đang dở (S3-07). Ở S3c, nút Học tiếp N câu (hoặc Nhóm tiếp khi học theo từ khóa) bắt đầu phiên mới ở S3a (S3-06).

### 4.4 T2 Luyện tập và S5 Kiểm tra nhanh

```mermaid
flowchart TB
  classDef el fill:#d9d9d9,stroke:#333,color:#000
  classDef win fill:#fff,stroke:#333,color:#000

  subgraph W_T2["«window» T2 Luyện tập"]
    t2_review["«list item»<br/>Ôn tập hôm nay"]
    t2_kw["«list item»<br/>Học theo từ khóa"]
    t2_test["«list item»<br/>Kiểm tra nhanh"]
  end
  subgraph W_KW["«sheet» Học theo từ khóa"]
    kw_start["«button»<br/>Học 8 câu đầu"]
  end
  subgraph W_S5s["«window» S5 Bắt đầu kiểm tra"]
    s5_all["«button»<br/>Làm cả 3 bước"]
    s5_one["«hyperlink»<br/>Chỉ làm một bước"]
  end
  subgraph W_S3["«window» S3 Phiên học"]
    W_S3_x[" "]
  end
  subgraph W_S5r["«window» S5 Đang kiểm tra"]
    run_exit["«button»<br/>Thoát"]
    run_last["«button»<br/>Câu tiếp, ở câu cuối"]
  end
  subgraph W_STOP5["«sheet» Dừng kiểm tra?"]
    st5_stop["«button»<br/>Dừng"]
  end
  subgraph W_S5k["«window» S5 Kết quả"]
    res_done["«hyperlink»<br/>Xong"]
  end
  subgraph W_T2b["«window» T2 Luyện tập"]
    W_T2b_x[" "]
  end

  t2_review -->|"Click"| W_S3
  %% @spec T2-02
  t2_kw -->|"Click"| W_KW
  %% @spec T2-03
  kw_start -->|"Click"| W_S3
  %% @spec T2-03
  t2_test -->|"Click"| W_S5s
  %% @spec T2-04, S5-01
  s5_all -->|"Click"| W_S5r
  %% @spec S5-01
  s5_one -->|"Click"| W_S5r
  %% @spec S5-01
  run_exit -->|"Click"| W_STOP5
  %% @spec S5-08
  st5_stop -->|"Click"| W_T2b
  %% @spec S5-08
  run_last -->|"Click"| W_S5k
  %% @spec S5-07
  res_done -->|"Click"| W_T2b
  %% @spec S5-07

  class t2_review,t2_kw,t2_test,kw_start,s5_all,s5_one,run_exit,run_last,st5_stop,res_done el
  class W_T2,W_KW,W_S5s,W_S3,W_S5r,W_STOP5,W_S5k,W_T2b win
  style W_S3_x fill:none,stroke:none
  style W_T2b_x fill:none,stroke:none
```

Đường quay lại: ở S5 Kết quả, nút Kiểm tra unit tiếp theo về S5 Bắt đầu kiểm tra với unit sau (S5-07). Ở sheet Dừng kiểm tra, nút Làm tiếp đóng sheet (S5-08).

### 4.5 T3 Thư viện

```mermaid
flowchart TB
  classDef el fill:#d9d9d9,stroke:#333,color:#000
  classDef win fill:#fff,stroke:#333,color:#000

  subgraph W_T3["«window» T3 Thư viện"]
    t3_row["«list item»<br/>Dòng câu"]
  end
  subgraph W_DET["«sheet» Chi tiết câu"]
    det_learn["«button»<br/>Học câu này"]
  end
  subgraph W_S3["«window» S3 Phiên học"]
    W_S3_x[" "]
  end

  t3_row -->|"Click"| W_DET
  %% @spec T3-05
  det_learn -->|"Click"| W_S3
  %% @spec T3-05

  class t3_row,det_learn el
  class W_T3,W_DET,W_S3 win
  style W_S3_x fill:none,stroke:none
```

Từ 900 px, chi tiết câu hiện ở cột phải của T3 thay cho sheet (T3-07).

### 4.6 T4 Tiến độ

```mermaid
flowchart TB
  classDef el fill:#d9d9d9,stroke:#333,color:#000
  classDef win fill:#fff,stroke:#333,color:#000

  subgraph W_T4["«window» T4 Tiến độ"]
    t4_bar["«chart bar»<br/>Cột ngày"]
    t4_empty["«button»<br/>Học 8 câu, khi chưa có phiên"]
  end
  subgraph W_DAY["«sheet» Chi tiết ngày"]
    W_DAY_x[" "]
  end
  subgraph W_S3["«window» S3 Phiên học"]
    W_S3_x[" "]
  end

  t4_bar -->|"Click"| W_DAY
  %% @spec T4-07
  t4_empty -->|"Click"| W_S3
  %% @spec T4-08

  class t4_bar,t4_empty el
  class W_T4,W_DAY,W_S3 win
  style W_DAY_x fill:none,stroke:none
  style W_S3_x fill:none,stroke:none
```

### 4.7 S8 Cài đặt

```mermaid
flowchart TB
  classDef el fill:#d9d9d9,stroke:#333,color:#000
  classDef win fill:#fff,stroke:#333,color:#000

  subgraph W_S8["«window» S8 Cài đặt"]
    s8_back["«button»<br/>Quay lại"]
    s8_lang["«list item»<br/>Ngôn ngữ đang học"]
    s8_voice["«list item»<br/>Giọng đọc"]
    s8_import["«list item»<br/>Nhập tiến độ"]
    s8_delete["«list item»<br/>Xóa tiến độ"]
    s8_guide["«hyperlink»<br/>Xem lại hướng dẫn"]
  end
  subgraph W_PREV["«window» Màn trước đó"]
    W_PREV_x[" "]
  end
  subgraph W_LANG["«sheet» Đổi ngôn ngữ hoặc bộ nội dung"]
    W_LANG_x[" "]
  end
  subgraph W_VOICE["«sheet» Giọng đọc"]
    W_VOICE_x[" "]
  end
  subgraph W_IMP["«sheet» Xác nhận nhập tiến độ"]
    W_IMP_x[" "]
  end
  subgraph W_DEL["«sheet» Xác nhận xóa tiến độ"]
    del_ok["«button»<br/>Xóa"]
  end
  subgraph W_S9["«overlay» S9 Hướng dẫn trên T1"]
    W_S9_x[" "]
  end
  subgraph W_T1["«window» T1 Học"]
    W_T1_x[" "]
  end

  s8_back -->|"Click"| W_PREV
  %% @spec APP-04
  s8_lang -->|"Click"| W_LANG
  %% @spec S8-01
  s8_voice -->|"Click"| W_VOICE
  %% @spec S8-02
  s8_import -->|"Click, sau khi chọn file"| W_IMP
  %% @spec S8-05
  s8_delete -->|"Click"| W_DEL
  %% @spec S8-05
  del_ok -->|"Click, khi gõ đúng tên ngôn ngữ"| W_T1
  %% @spec S8-05
  s8_guide -->|"Click"| W_S9
  %% @spec S8-06, S9-05

  class s8_back,s8_lang,s8_voice,s8_import,s8_delete,s8_guide,del_ok el
  class W_S8,W_PREV,W_LANG,W_VOICE,W_IMP,W_DEL,W_S9,W_T1 win
  style W_PREV_x fill:none,stroke:none
  style W_LANG_x fill:none,stroke:none
  style W_VOICE_x fill:none,stroke:none
  style W_IMP_x fill:none,stroke:none
  style W_S9_x fill:none,stroke:none
  style W_T1_x fill:none,stroke:none
```

Đường quay lại: sheet Giọng đọc (nút Xong, S8-02), Xác nhận nhập tiến độ và Xác nhận xóa tiến độ (đóng theo C6-02) đều về S8.

## 5. So sánh với bản cũ

| | Bản cũ | Bản mới |
|---|---|---|
| Số cửa sổ người dùng gặp | Màn chính và 15 hộp thoại | 4 tab, màn Cài đặt, 3 màn toàn trang, 6 loại sheet (đổi ngôn ngữ, từ khóa, chi tiết câu, chi tiết ngày, giọng đọc, xác nhận) |
| Hộp thoại chồng hộp thoại | Có (Tổng kết mở Tiến bộ trong cùng hộp thoại; Chia sẻ mở hộp quản lý bên trong hộp chia sẻ) | Không |
| Lối vào luyện tập | Rải rác: Học 8 câu, TEST NOW, Học theo chủ đề nằm ở 3 chỗ | Gom vào tab Luyện tập; T1 chỉ giữ lối vào học tiếp |

Sơ đồ bản cũ: `docs/legacy/navigation.md`.
