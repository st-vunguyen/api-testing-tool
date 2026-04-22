---
agent: agent
description: "Tạo slide Comparison + Decision/Recommendation theo tiêu chí, không bịa dữ kiện ngoài SOURCE_DOC."
tools: ['edit', 'search', 'todos']
---

# Slide Type — Comparison + Decision

## Inputs
- `FORMAT=slidev|marp|reveal`
- `SOURCE_DOC=` (tuỳ chọn)
- `OPTIONS=` (2–4 options)
- `CRITERIA=` (3–6 tiêu chí)
- `RECOMMENDATION=` (1 câu)
- `CONDITIONS=` (2–3 điều kiện/assumptions; nếu không có trong nguồn thì phải gắn nhãn assumption)

## Output
- Trả về **2 slides**:
  1) Comparison table slide
  2) Decision slide (recommendation + next steps)

## Rules
- So sánh dựa trên tiêu chí; nếu thiếu dữ kiện thì dùng `TBD`.
- Title là insight.
- Bullets ngắn.
- Notes 2–5 dòng/slide.

## Formatting
- Separator `---`.
- Notes dùng `<!-- ... -->`.

## Generate
1) Slide Comparison: table + 1 dòng kết luận.
2) Slide Decision: recommendation + conditions + next steps.
