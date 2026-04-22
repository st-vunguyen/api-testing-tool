---
agent: agent
description: "Tạo slide Flow/Architecture (diagram-first) + slide QC testing angle từ SOURCE_DOC, hỗ trợ Mermaid nếu FORMAT phù hợp."
tools: ['edit', 'search', 'todos']
---

# Slide Type — Flow / Architecture (+ QC Testing Angle)

## Inputs
- `FORMAT=slidev|marp|reveal`
- `SOURCE_DOC=` (tuỳ chọn)
- `DIAGRAM_MODE=mermaid|text` (default: mermaid)
- `DIAGRAM_TITLE=` (1 câu)
- `MERMAID=` (optional mermaid flowchart code block; nếu không có thì sinh text diagram từ nguồn)
- `KEY_POINTS=` (2–3 bullets)
- `QC_ANGLE=` (2–3 bullets: what to test, risks, decisions)

## Output
- Trả về **2 slides** (Diagram slide, QC testing slide) dạng Markdown.

## Rules
- Không bịa nodes/steps không có trong nguồn.
- Diagram ưu tiên gọn: 5–9 nodes.
- Nếu `DIAGRAM_MODE=mermaid` nhưng môi trường render không chắc (nhất là Marp): vẫn output Mermaid, đồng thời thêm fallback bullets mô tả flow.
- Title là insight.

## Formatting
- Separator `---`.
- Notes dùng `<!-- ... -->`.

## Generate
1) Diagram slide: title + diagram (mermaid hoặc text) + 1–2 bullets.
2) QC slide: title + QC_ANGLE bullets.
