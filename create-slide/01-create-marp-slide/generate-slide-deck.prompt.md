---
agent: agent
description: "(Index/Router) Tạo slide deck từ 1 tài liệu bất kỳ trong documents/ theo FORMAT (slidev/marp/reveal), bắt buộc ghi file output."
tools: ['edit', 'search', 'todos']
---
---
agent: agent
description: "(Index/Router) Tạo slide deck từ 1 tài liệu bất kỳ trong documents/ theo FORMAT (slidev/marp/reveal), bắt buộc ghi file output."
tools: ['edit', 'search', 'todos']
---

# Generate Slide Deck (Router)

## Input bắt buộc từ user
- `FORMAT=slidev|marp|reveal`
- `SOURCE_DOC=documents/<file>.md` (bắt buộc)

## Input tuỳ chọn
- `AUDIENCE=` (vd: QC, Dev, PO)
- `TIMEBOX=` (vd: 5min, 10min, 15min)
- `GOAL=` (1 câu: audience cần nhớ gì)
- `STYLE=consulting|tech-talk|status-update` (default: `consulting`)
- `SLIDE_COUNT=7|10|12` (default theo TIMEBOX)
- `OUTPUT=` (nếu không có, tự đặt theo quy ước ở dưới)

## Quy ước file output
- `FORMAT=slidev` → `documents/<topic_slug>.slidev.md`
- `FORMAT=marp` → `documents/<topic_slug>.marp.md`
- `FORMAT=reveal` → `documents/<topic_slug>.reveal.md`

Trong đó `topic_slug` lấy từ tiêu đề tài liệu hoặc tên file `SOURCE_DOC` (lowercase, thay khoảng trắng bằng `-`, bỏ ký tự đặc biệt).

## Quy tắc bắt buộc
- Deck phải bám sát `SOURCE_DOC` (không bịa claims/số liệu ngoài nguồn).
- Output cuối cùng phải là **file** trong `documents/`.
- Nếu thiếu thông tin quan trọng: hỏi tối đa 5 câu, hoặc ghi `TBD`.

## Routing
- Luôn gọi prompt chính để tạo deck:
  - #file:./generate-slide-deck-from-doc.prompt.md

## Bạn phải làm gì
1) Đọc `SOURCE_DOC`.
2) Suy ra outline theo `SLIDE_COUNT`.
3) Gọi prompt `generate-slide-deck-from-doc.prompt.md` và truyền các biến cần thiết (FORMAT, SOURCE_DOC, OUTPUT, AUDIENCE, TIMEBOX, GOAL, STYLE, SLIDE_COUNT).
