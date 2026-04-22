---
agent: agent
description: "(Index) Tạo tài liệu nghiên cứu và bắt buộc ghi file .md đầy đủ vào documents."
tools: ['runCommands', 'runTasks', 'edit', 'runNotebooks', 'search', 'new', 'todos', 'runSubagent', 'usages', 'vscodeAPI', 'problems', 'changes', 'testFailure', 'openSimpleBrowser', 'fetch', 'githubRepo', 'mermaidchart.vscode-mermaid-chart/get_syntax_docs', 'mermaidchart.vscode-mermaid-chart/mermaid-diagram-validator', 'mermaidchart.vscode-mermaid-chart/mermaid-diagram-preview', 'ms-python.python/configurePythonEnvironment', 'ms-python.python/getPythonEnvironmentInfo', 'ms-python.python/getPythonExecutableCommand', 'ms-python.python/installPythonPackage', 'vscjava.vscode-java-debug/debugJavaApplication', 'vscjava.vscode-java-debug/setJavaBreakpoint', 'vscjava.vscode-java-debug/debugStepOperation', 'vscjava.vscode-java-debug/getDebugVariables', 'vscjava.vscode-java-debug/getDebugStackTrace', 'vscjava.vscode-java-debug/evaluateDebugExpression', 'vscjava.vscode-java-debug/getDebugThreads', 'vscjava.vscode-java-debug/removeJavaBreakpoints', 'vscjava.vscode-java-debug/stopDebugSession', 'vscjava.vscode-java-debug/getDebugSessionInfo']
---

# Generate Research Docs (Business / Hybrid / Technical)

## Workflow khuyến nghị (2 bước)
1) Research tạo kiến thức chuẩn → dùng prompt này (MODE=business|hybrid|technical).
2) Sau khi có report trong `documents/`, tạo tài liệu flow/template phục vụ test strategy → dùng:
  #file:../create-document/create-flow-docs-from-research.prompt.md

## Mục tiêu bắt buộc
- Output cuối cùng phải là **file `.md` đầy đủ nội dung** trong thư mục `documents/`.
- Không kết thúc bằng trả lời chat tóm tắt. Phải tạo file thực tế.

## Chọn mode
Bắt đầu bằng đúng 1 dòng:
- `MODE=business` hoặc `MODE=hybrid` hoặc `MODE=technical`

## Quy tắc định tuyến
- Nếu `MODE=business`: tuân theo `generate-research-docs-business.prompt.md`.
- Nếu `MODE=hybrid`: tuân theo `generate-research-docs-hybrid.prompt.md`.
- Nếu `MODE=technical`: tuân theo `generate-research-docs-technical.prompt.md`.

## Tên file mặc định theo mode (nếu user chưa chỉ định)
- Nếu user không chỉ định tên file, **hãy tự đặt tên theo chủ đề** và ghi vào `documents/`.
- Quy ước khuyến nghị: `<topic_slug>-<mode>-research-report.md`.
  - `business` → `documents/<topic_slug>-business-research-report.md`
  - `hybrid` → `documents/<topic_slug>-hybrid-research-report.md`
  - `technical` → `documents/<topic_slug>-technical-research-report.md`

Trong đó `topic_slug` là tên chủ đề được chuẩn hoá thành dạng file-safe (lowercase, thay khoảng trắng bằng `-`, bỏ ký tự đặc biệt).

## Kết quả trả về sau khi hoàn tất
1. Đường dẫn file `.md` đã tạo
2. Checklist xác nhận đủ tất cả section bắt buộc
3. Danh sách nguồn tham khảo đã dùng
