# API Quality Engineering Kit — Practical Guideline

> Official product name: **API Quality Engineering Kit**  
> Canonical source folder in this repository is `api-quality-engineering/`. Legacy compatibility filenames remain available inside this kit where needed.

This guideline is written for real teams who need a usable way to work, not a poster full of slogans.

---

## 1. Kit này thực sự để làm gì?

Kit này giúp bạn đi theo một chuỗi hợp lý:

```text
Spec → Review → Strategy → Runnable Assets → Execution → Evidence → Decision
```

Mục tiêu không chỉ là “có collection chạy được”.  
Mục tiêu là có **một bộ tài sản test có lý do tồn tại rõ ràng**, bám sát evidence, đủ để:

- hiểu API nhanh và đúng
- biết phần nào đáng test trước
- dựng collection/runnable pack ít lệch spec
- tách bạch asset issue và system issue
- làm performance/security có kiểm soát
- bảo trì lại được khi spec thay đổi

Nếu chỉ tạo collection mà không có mục tiêu, không có traceability, không có runbook, không có evidence, bộ test sẽ xuống cấp rất nhanh.

---

## 2. Vì sao từng nhóm công việc tồn tại?

### `01` — OpenAPI lint / verify

**Mục đích:** kiểm tra chất lượng nguồn chân lý trước khi dựng test.

Nếu spec lỗi, mơ hồ, lệch schema, thiếu response, thì mọi thứ làm sau đó đều dễ sai.  
Prompt này tồn tại để trả lời các câu hỏi như:

- spec có path/method nào thiếu schema không?
- status code có nhất quán không?
- request/response examples có dùng được không?
- field nào chỉ được mô tả sơ sài?

**Kết quả mong muốn:** một danh sách vấn đề về tài liệu/spec, để chiến lược test không xây trên nền sai.

### `02` — Auth / limits analysis

**Mục đích:** hiểu cách API tự bảo vệ và giới hạn truy cập.

Đây là phần rất hay bị làm sơ sài, nhưng lại ảnh hưởng mạnh đến tính chạy được của test:

- token lấy từ đâu?
- scope/role khác nhau tác động thế nào?
- rate-limit có headers hay body report không?
- lockout / retry / throttling có được mô tả không?

**Kết quả mong muốn:** tránh viết collection “đúng cú pháp nhưng sai ngữ cảnh truy cập”.

### `03` — Pagination / filtering / sorting review

**Mục đích:** hiểu semantics của endpoint list.

Nhiều bug production không nằm ở `POST` hay `PUT`, mà nằm ở danh sách:

- page size có trần không?
- sort field nào được phép?
- filter có combinational rule không?
- empty result và out-of-range result trả thế nào?

**Kết quả mong muốn:** không bỏ sót các hành vi list quan trọng.

### `04` — Test patterns review

**Mục đích:** chuẩn hóa cách viết test asset.

Không có pattern, collection sẽ nhanh chóng thành một mớ request rời rạc.  
Prompt này giúp chốt:

- naming folder/request
- cách viết assertions
- convention capture variable
- cách đánh dấu destructive flow
- cách thiết kế fixture/cleanup

**Kết quả mong muốn:** bộ test nhất quán, dễ bảo trì.

### `05` — OAS snapshot

**Mục đích:** tạo ảnh chụp nhanh để review toàn cục.

Đây không phải bản thay thế spec. Nó là “bản đồ nhanh” để team nắm:

- domain nào có bao nhiêu operation
- auth nào áp lên đâu
- schema chính là gì
- endpoint nào nhiều rủi ro nhất

**Kết quả mong muốn:** giúp người mới hoặc reviewer vào việc nhanh.

### `06` — Comprehensive test strategy

**Mục đích:** gom toàn bộ phát hiện trước đó thành chiến lược có thứ tự ưu tiên.

Đây là prompt quan trọng nhất ở pha đầu.  
Không có strategy, các collection sinh ra dễ thành “test cho có”.

**Kết quả mong muốn:**

- scope rõ
- risk rõ
- priority rõ
- cái gì test bây giờ / để sau rõ
- evidence gaps rõ

### `07` — Full API collection

**Mục đích:** tạo baseline pack chạy được cho functional coverage.

Collection không phải mục tiêu cuối. Nó là **công cụ thực thi chiến lược**.

**Kết quả mong muốn:**

- foldering tốt
- request bám spec
- assertions có căn cứ
- env placeholders rõ
- traceability có thể lần ngược

### `08` — Refresh environment files

**Mục đích:** làm cho collection dùng được ở nhiều môi trường mà không nhúng bí mật.

**Kết quả mong muốn:**

- `.example` env files gọn, an toàn
- variable contract rõ required/optional/captured/derived
- giảm lỗi kiểu “collection đúng nhưng env sai”

### `09` — Data-driven samples

**Mục đích:** có dữ liệu mẫu an toàn và có lý do.

Data-driven test không nên là đống JSON nhặt đại.  
Mỗi sample cần có mục tiêu.

**Kết quả mong muốn:** mapping rõ sample ↔ endpoint ↔ scenario.

### `10`–`17` — Scenario packs

**Mục đích:** chia sâu theo mục đích test.

- `10`–`11`: E2E journeys khi cần chuỗi nhiều bước
- `12`–`13`: contract coverage khi cần bao bề mặt spec
- `14`–`15`: integration flows khi có side-effect/chuỗi phụ thuộc
- `16`–`17`: regression pack cho rerun nhanh và ổn định

**Kết quả mong muốn:** không nhét tất cả logic vào một collection duy nhất.

### `18`–`19` — Performance planning / starter pack

**Mục đích:** tạo workload có suy nghĩ, không bắn tải mù quáng.

**Kết quả mong muốn:**

- biết endpoint nào đáng load
- biết ngưỡng nào là evidence, ngưỡng nào là assumption
- có starter assets cho k6 / Newman / JMeter

### `20` — ZAP security baseline

**Mục đích:** có baseline security scan có kiểm soát.

Không phải để “chứng minh hệ thống an toàn”.  
Mục tiêu là:

- tạo ra cảnh báo sớm
- lưu được evidence
- có report đọc được
- không phá luồng delivery vì false positive chưa triage

### `21` — Fully performance testing

**Mục đích:** chạy performance workload đã được chuẩn bị và công bố evidence có trách nhiệm.

Đây là prompt execution. Nó cần environment an toàn và output rõ ràng.

### `23`–`26` — JMeter professional flow

**Mục đích:** hỗ trợ JMeter bài bản hơn cho các tình huống cần:

- plugin ecosystem chuẩn
- test plan `.jmx` rõ cấu trúc
- convert collection/performance intent sang JMeter
- xuất standard JMeter HTML report
- phân tích sâu và sinh dashboard HTML executive style

Đây là lớp mở rộng dành cho performance depth, không bắt buộc cho mọi repo.

### `22` — Maintenance

**Mục đích:** làm cho bộ kit sống được sau khi spec đổi.

Một bộ test tốt không chỉ là bộ test “làm lần đầu đẹp”.  
Nó phải được refresh đúng thứ tự khi source of truth đổi.

---

## 3. Nên dùng flow nào trong thực tế?

## Flow A — Dùng full pipeline

Dùng khi:

- repo mới chưa có nền tảng API QA bài bản
- cần đầy đủ strategy + pack + performance + security baseline
- muốn team khác vào sau vẫn hiểu bộ tài sản test

**Flow khuyến nghị:**

1. `00-orchestration/00-run-pipeline.prompt.md`
2. để orchestrator đi qua `01` → `21`
3. nếu cần JMeter sâu, chạy thêm `23` → `26`
4. khi spec đổi, dùng `22`

## Flow B — Chỉ tập trung API functional

Dùng khi:

- mục tiêu chính là smoke / regression / contract
- chưa có điều kiện làm performance ngay

**Bộ prompt nên ưu tiên:**

- `01` → `06`
- `07` → `09`
- nếu cần business journeys: `10` → `17`

**Bạn chưa cần làm ngay:**

- `18` → `21`
- `23` → `26`
- `20` nếu security chưa trong scope hiện tại

## Flow C — Chỉ tập trung performance

Dùng khi:

- functional pack đã có nền tảng
- cần chuẩn bị workload và report performance rõ ràng

**Bộ prompt nên ưu tiên:**

- `18` performance scenarios
- `19` performance collection/starter assets
- `21` execution baseline
- `23` setup JMeter stack
- `24` convert collection → JMeter
- `25` execute JMeter + publish outputs
- `26` analyze report + dashboard HTML

## Flow D — Chỉ làm security baseline bằng ZAP

Dùng khi:

- cần baseline security scan sớm
- chưa đủ thời gian cho security test sâu

**Bộ prompt nên ưu tiên:**

- `01`, `02`, `06`
- `20`

## Flow E — Chỉ làm maintenance

Dùng khi:

- spec mới đến
- collections cũ bắt đầu lệch
- env/data/auth thay đổi
- report trước đó không còn tin cậy

**Bộ prompt nên ưu tiên:**

- `22-maintenance-fully-api-quality-engineering.prompt.md`
- và chỉ rerun các nhóm bị impact sau change analysis

---

## 4. Step by step — cách làm thực dụng nhất

### Bước 1 — Xác định source of truth

Bạn cần biết rõ:

- spec nào là chuẩn nhất
- docs phụ nào đáng tin
- env nào được phép test
- destructive flows có bị cấm không

**Evidence nên có:**

- đường dẫn spec cụ thể
- docs business/engineering liên quan
- note về target env
- auth model mô tả ở mức không lộ secret

### Bước 2 — Đừng nhảy thẳng vào viết collection

Rất nhiều team mở spec ra và viết request ngay.  
Cách này nhanh lúc đầu nhưng tốn tiền lúc bảo trì.

Hãy làm tối thiểu:

- lint / verify
- auth & limits review
- list semantics review
- strategy synthesis

### Bước 3 — Chỉ sinh runnable pack sau khi strategy đã chốt được hướng

Khi đã có strategy, hãy sinh:

- collection baseline
- env templates
- variable contract
- data-driven samples
- helpers / runbook

### Bước 4 — Nếu có non-functional scope, phải chốt safety trước

Performance và security không nên chạy kiểu thử đại.

**Cần biết rõ:**

- env nào được phép
- giới hạn nào phải tôn trọng
- có cần rate cap không
- raw outputs sẽ lưu ở đâu
- report curated sẽ publish ở đâu

### Bước 5 — Luôn tách 3 loại kết quả

1. **Asset issue** — lỗi ở collection/env/script/report wiring  
2. **System issue** — lỗi thực của hệ thống, đã có evidence  
3. **Evidence gap / blocker** — chưa đủ thông tin để kết luận

Nếu trộn 3 loại này vào một chỗ, report sẽ mất giá trị.

---

## 5. Các lỗi rất thường gặp

### Lỗi 1 — Xem collection là mục tiêu cuối

Collection chỉ là công cụ.  
Nếu không có strategy, collection rất dễ phủ sai chỗ.

### Lỗi 2 — Assert những thứ spec không chứng minh

Ví dụ:

- assume sort default
- assume error schema luôn giống nhau
- assume rate-limit header luôn có
- assume eventual consistency là bug

Nếu spec không chứng minh, hãy ghi là gap.

### Lỗi 3 — Env file nhìn có vẻ đầy đủ nhưng không có contract

Người sau sẽ không biết:

- biến nào set tay
- biến nào capture động
- biến nào derived
- biến nào bắt buộc theo flow nào

### Lỗi 4 — Chạy performance trên env không được phép

Đây là lỗi nguy hiểm nhất.  
Prompt performance trong kit đều phải giữ `SAFE_TO_RUN=no` mặc định vì lý do này.

### Lỗi 5 — Có raw output nhưng không có curated evidence

Một đống log, CSV, HTML raw chưa đủ cho decision.  
Bạn vẫn cần report đã được giải thích:

- test plan là gì
- chạy ở đâu
- limit nào đã bật
- số liệu nào đáng tin
- số liệu nào chỉ là assumption

---

## 6. JMeter nên được dùng khi nào?

JMeter nên vào cuộc khi bạn cần một hoặc nhiều điều sau:

- cần `.jmx` tiêu chuẩn để team performance quen dùng
- cần plugin ecosystem như BlazeMeter Plugins / JMeter Plugins
- cần HTML dashboard chuẩn JMeter cho handoff
- cần nhiều kiểu thread group/timer/listener hơn baseline đơn giản
- cần convert từ existing collections sang test plan có cấu trúc ổn định hơn

Nếu chỉ cần smoke/perf calibration rất nhẹ, `k6` hoặc `Newman` có thể đủ.  
Nếu cần bài bản hơn, JMeter là nhánh đáng đầu tư.

---

## 7. Evidence nào nên có trong report tốt?

Một report đáng tin thường có:

- build/run metadata
- input sources (spec, docs, env, commit/ref)
- scope đã chạy và scope bị loại trừ
- config an toàn đã bật
- raw output path cụ thể
- summary số liệu
- transaction breakdown
- error hotspots
- asset fixes nếu có rerun
- blockers / assumptions / next steps

Nếu report chỉ có “pass/fail” thì chưa đủ.

---

## 8. Pipeline dùng từng phần thế nào?

## Nếu chỉ focus kiểm thử API chức năng

Đi theo:

- `01` → `06`
- `07` → `09`
- `10` → `17` khi cần thêm scenario depth

## Nếu chỉ focus performance

Đi theo:

- `18`
- `19`
- `21`
- nếu cần JMeter chuẩn: `23` → `26`

## Nếu chỉ focus ZAP

Đi theo:

- `01`
- `02`
- `06`
- `20`

## Nếu đang bảo trì bộ cũ

Đi theo:

- `22`
- và rerun theo impact thay vì build lại cả thế giới

---

## 9. Một nguyên tắc rất quan trọng

Bộ kit này không cố làm bạn “trông chuyên nghiệp”.  
Nó cố giúp bạn **ra quyết định đúng hơn**.

Vì vậy:

- cái gì biết thì nói biết
- cái gì chưa chắc thì nói chưa chắc
- cái gì cần evidence thì chỉ ra evidence
- cái gì chưa nên chạy thì dừng đúng chỗ

Đó mới là cách để API Quality Engineering có giá trị thật.

---

## 10. Điểm bắt đầu khuyên dùng

- Muốn đi trọn vẹn: `prompts/00-orchestration/00-run-pipeline.prompt.md`
- Muốn functional core: `prompts/01-review-and-strategy/` + `prompts/02-core-pack/`
- Muốn performance sâu với JMeter: `prompts/04-non-functional/18`, `19`, `21`, `23`, `24`, `25`, `26`
- Muốn maintenance: `prompts/05-maintenance/22-maintenance-fully-api-quality-engineering.prompt.md`

Nếu muốn, bước tiếp theo hợp lý là đồng bộ guideline này vào `README.md`, `prompts/README.md`, và orchestrator để người dùng không bị lạc khi chọn flow.
