---
agent: agent
description: "Tạo tài liệu hướng dẫn export slides (Slidev/Marp/Reveal/Pandoc/PPT Copilot) dưới dạng Markdown file trong documents/."
tools: ['edit', 'search', 'todos']
---

# Slides Export Recipes

## Output (bắt buộc)
- Tạo file: `documents/slides-export-recipes.md`

## Nội dung bắt buộc trong file
1) Slidev
- Init project
- Run dev
- Export PDF/HTML (nêu lệnh tham khảo)

2) Marp
- VS Code extension workflow
- CLI export PDF/PPTX/HTML (nêu lệnh tham khảo)

3) Reveal.js
- Cách dùng markdown cơ bản
- Export/host HTML (high-level)

4) Pandoc → PPTX
- Command mẫu
- Lưu ý fonts/theme

5) PowerPoint + Copilot
- Cách copy/paste outline
- Cách dùng Copilot để tạo slide

## Rules
- Câu lệnh để trong fenced code block (shell/zsh).
- Nêu rõ “tuỳ môi trường, có thể cần cài đặt” (không khẳng định đã có sẵn).
- Ngắn gọn, theo checklist.
