# Prompt Usage Guide

## Purpose
File này giải thích **cách sử dụng prompt files** trong `.github/prompts/` mà **không sửa prompt trong lúc chạy**.

## Core rule
- Prompt files là **instruction templates**.
- Khi dùng prompt để tạo output, **không sửa prompt file**.
- Chỉ sửa `.github/prompts/` khi mục tiêu là **bảo trì prompt system**.

## Khi nào dùng prompt trực tiếp
- Khi bạn cần 1 artifact cụ thể.
- Ví dụ:
  - research doc → dùng prompt trong `01-research/`
  - document conversion → dùng prompt trong `02-create-document/`
  - slide deck → dùng prompt trong `03-create-slide/`
  - test strategy → dùng prompt trong `04-create-test-strategy/` hoặc `api-quality-engineering/prompts/01-review-and-strategy/`
  - API quality engineering tooling / CI / runbook → dùng prompt tương ứng trong `api-quality-engineering/prompts/`

## Khi nào dùng prompt meta orchestration
- Chỉ dùng `api-quality-engineering/prompts/00-orchestration/00-run-pipeline.prompt.md` khi cần:
  - nhiều outputs cùng lúc
  - execution plan liên phase
  - run-status tracking cho nhiều prompt outputs

## Output routing
- Docs → `documents/`
- Tooling → `tools/`
- CI workflows → `.github/workflows/`
- Không ghi output vào `.github/prompts/`

## Maintenance vs execution
### Prompt execution
- Đọc prompt
- Tạo output theo contract của prompt
- Không sửa prompt file

### Prompt system maintenance
- User yêu cầu refactor/rename/chuẩn hoá prompt
- Khi đó mới sửa `.github/prompts/`, `.github/instructions/`, README/index liên quan

## Related instructions
- `.github/instructions/qc-prompt-common.instructions.md`
- `.github/instructions/prompt-execution-discipline.instructions.md`
