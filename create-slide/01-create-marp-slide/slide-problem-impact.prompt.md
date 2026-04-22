---
agent: agent
description: "Tạo slide Problem + Impact (numbers-first) theo FORMAT, ưu tiên trích đúng từ SOURCE_DOC, không bịa số liệu."
tools: ['edit', 'search', 'todos']
---

# Slide Type — Problem + Impact

## Inputs
- `FORMAT=slidev|marp|reveal`
- `SOURCE_DOC=` (tuỳ chọn; nếu có thì phải bám sát)
- `PROBLEM_STATEMENT=` (1 câu)
- `IMPACT_METRIC=` (vd: 35% failure, +2s latency) hoặc `TBD`
- `IMPACT_BULLETS=` (2–3 bullets)

## Output
- Trả về **2 slides** (Problem, Impact) dưới dạng Markdown, để paste vào deck.

## Rules
- 1 slide = 1 message.
- Title là kết luận.
- Nếu `IMPACT_METRIC` không có trong nguồn → dùng `TBD` và thêm 1 câu hỏi.
- Bullets ngắn (rule 6–6).
- Mỗi slide có speaker notes.

## Formatting
- Separator `---`.
- Notes dùng `<!-- ... -->`.

## Generate
1) Problem slide: title + 2–3 bullets.
2) Impact slide: title + big metric (hoặc TBD) + 2 bullets.
