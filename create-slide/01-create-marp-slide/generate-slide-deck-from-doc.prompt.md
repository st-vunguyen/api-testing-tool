---
agent: agent
description: "Tạo slide deck (Slidev/Marp/Reveal) từ 1 tài liệu trong documents/. Output bắt buộc: 1 file deck + 1 file traceability mapping."
tools: ['edit', 'search', 'todos']
---

# Generate Slide Deck From Document

## 0) Input variables
Bắt buộc:
- `FORMAT=slidev|marp|reveal`
- `SOURCE_DOC=documents/<file>.md`

Tuỳ chọn:
- `AUDIENCE=` (vd: QC, Dev, PO)
- `TIMEBOX=` (vd: 10min)
- `GOAL=` (ONE thing audience must remember)
- `STYLE=consulting|tech-talk|status-update` (default: consulting)
- `SLIDE_COUNT=7|10|12` (default theo TIMEBOX)
- `OUTPUT=` (deck file path)
- `OUTPUT_TRACE=` (trace mapping file path)

Nếu user không cung cấp:
- Tự suy ra `topic_slug` từ `SOURCE_DOC`.
- `OUTPUT` theo quy ước:
  - slidev → `documents/<topic_slug>.slidev.md`
  - marp → `documents/<topic_slug>.marp.md`
  - reveal → `documents/<topic_slug>.reveal.md`
- `OUTPUT_TRACE` mặc định: `documents/<topic_slug>.slides-traceability.md`

## 1) Non-fabrication rule (bắt buộc)
- Chỉ dùng thông tin có trong `SOURCE_DOC`.
- Không thêm số liệu/claim/kiến trúc/flow không có trong nguồn.
- Nếu nguồn thiếu dữ kiện cần thiết:
  - ghi `TBD` trong slide
  - và tạo mục `## Questions` ở cuối deck (tối đa 5 câu)

## 2) Slide design rules (bắt buộc)
- 1 slide = 1 message.
- Title phải là **kết luận/insight**.
- Ưu tiên diagram/table/number.
- Mật độ: tối đa 6 bullets, mỗi bullet tối đa 6 từ.
- Speaker notes: mỗi slide quan trọng có 2–5 dòng.

## 3) Deck flow (mặc định)
Tạo outline theo `SLIDE_COUNT` (chọn gần nhất):
- 7 slides: Title → Context → Problem → Impact → Root cause / Flow → Solution → Plan/Next steps
- 10 slides: Title → Agenda → Context → Problem → Impact → Root cause → Options → Recommended solution → Plan → Risks/Next steps
- 12 slides: như 10 slides + thêm 2 slide (Metrics/Success criteria, Appendix/Backup)

## 4) Format compliance
### 4.1) FORMAT=slidev
- Dùng separator `---`.
- Dùng frontmatter YAML (title/theme nếu cần).
- Speaker notes: dùng comment hoặc notes block (đơn giản: `<!-- notes: ... -->`).

### 4.2) FORMAT=marp
- File bắt đầu bằng frontmatter:
  - `marp: true`
  - `theme: default`
  - `paginate: true`
- Slides tách bằng `---`.
- Speaker notes: dùng HTML comments `<!-- ... -->`.

### 4.3) FORMAT=reveal
- Slides tách bằng `---`.
- Không dùng syntax đặc thù nếu không chắc; ưu tiên markdown thuần.
- Speaker notes: dùng HTML comments `<!-- ... -->`.

## 5) Output requirements (bắt buộc)
Bạn phải tạo **2 files**:
1) Deck file: `OUTPUT`
2) Traceability mapping: `OUTPUT_TRACE`

## 6) Traceability mapping format
Tạo file `OUTPUT_TRACE` với format:

```md
MODE=technical

# Slide Traceability

## Inputs
- SOURCE_DOC: <path>
- FORMAT: <slidev|marp|reveal>

## Mapping
| Slide # | Slide title (insight) | What it says (1 line) | Source (section/heading or excerpt) |
|---:|---|---|---|

## Notes
- Những điểm thiếu trong source được đánh dấu TBD.
```

## 7) What to do now (thực thi)
1) Đọc `SOURCE_DOC` và trích ra:
   - mục tiêu / kết luận chính
   - 3–7 điểm supporting
   - flow/diagram (nếu có), decisions/risks
2) Thiết kế outline theo `SLIDE_COUNT`.
3) Viết deck vào `OUTPUT` theo đúng FORMAT.
4) Viết mapping vào `OUTPUT_TRACE`.
5) Trả về đường dẫn 2 file + checklist.

## 8) Checklist khi trả kết quả
- [ ] Đã tạo deck file trong `documents/`
- [ ] Đã tạo traceability mapping file trong `documents/`
- [ ] Không bịa claims ngoài `SOURCE_DOC`
- [ ] Titles là kết luận, 1 slide = 1 message
- [ ] Format hợp lệ theo `FORMAT`
