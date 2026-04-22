---
agent: agent
description: "(Index) Convert 1 deck Marp Markdown (`documents/*.marp.md`) sang Slidev (`documents/*.slidev.md`) với animation + presenter notes, không mất nội dung."
tools: ['edit', 'search', 'todos']
---

# Convert Marp Deck → Slidev Deck (Index)

## Input bắt buộc từ user
- `SOURCE_MARP=documents/<name>.marp.md`

## Input tuỳ chọn
- `OUTPUT_SLIDEV=documents/<name>.slidev.md`
- `OUTPUT_MAPPING=documents/<name>.marp-to-slidev-mapping.md`
- `ANIMATION_LEVEL=light|standard|rich` (default: `standard`)
- `TONE=consulting|tech-talk|training|status-update` (default: `tech-talk`)
- `LANG=vi|en` (default: `vi`)

## Quy định quan trọng: KHÔNG ĐƯỢC MẤT CONTENT
- Không được xoá ý, số liệu, code block, bảng, hình ảnh, link.
- Được phép **chia lại slide** hoặc **đổi layout** để tăng hiệu quả trình bày nhưng phải bảo toàn ý nghĩa.

## Routing
- Luôn dùng prompt chính để convert + tạo mapping:
  - `convert-marp-deck-to-slidev-with-animation.prompt.md`

## Bạn phải làm gì
1) Đọc `SOURCE_MARP`.
2) Chuẩn hoá nội dung theo Slidev (frontmatter + slide separators).
3) Thêm animation chuẩn Slidev (ưu tiên `<v-clicks>` cho bullet lists) và speaker notes (HTML comments).
4) Ghi 2 file: `OUTPUT_SLIDEV` + `OUTPUT_MAPPING`.
