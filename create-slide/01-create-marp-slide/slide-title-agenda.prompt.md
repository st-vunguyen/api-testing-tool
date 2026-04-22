---
agent: agent
description: "Tạo 1–2 slides mở đầu (Title + Agenda) theo FORMAT, dùng từ tài liệu nguồn nếu có."
tools: ['edit', 'search', 'todos']
---

# Slide Type — Title + Agenda

## Inputs
- `FORMAT=slidev|marp|reveal`
- `TITLE=` (bắt buộc)
- `SUBTITLE=` (tuỳ chọn)
- `AUDIENCE=` (tuỳ chọn)
- `TIMEBOX=` (tuỳ chọn)
- `AGENDA_ITEMS=` (3–5 gạch đầu dòng)

## Output
- Trả về **đúng phần Markdown của các slide** (để paste vào deck).
- Không tạo file riêng trừ khi user yêu cầu `OUTPUT_SNIPPET=documents/...`.

## Rules
- Title là thông điệp/insight, không phải nhãn chung chung.
- Agenda 3–5 items, mỗi item ngắn.
- Có speaker notes 2–4 dòng.

## Formatting
- Luôn dùng separator `---` giữa slides.
- Speaker notes dùng HTML comment `<!-- ... -->`.

## Generate
Tạo:
1) Slide Title (Title + subtitle nhỏ)
2) Slide Agenda (bullet list)
