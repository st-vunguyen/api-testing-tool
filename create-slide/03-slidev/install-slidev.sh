#!/bin/bash

# Kiểm tra Node.js
if ! command -v node &> /dev/null
then
    echo "❌ Node.js chưa được cài đặt. Vui lòng cài đặt Node.js >= 18 trước khi tiếp tục."
    exit 1
fi

# Kiểm tra pnpm
if ! command -v pnpm &> /dev/null
then
    echo "❌ pnpm chưa được cài đặt. Vui lòng cài đặt pnpm (vd: 'corepack enable pnpm' hoặc 'npm i -g pnpm') trước khi tiếp tục."
    exit 1
fi

PROJECT_NAME="my-slides"

echo "=========================================================="
echo "🚀 BẮT ĐẦU CÀI ĐẶT SLIDEV TỰ ĐỘNG (NON-INTERACTIVE)"
echo "=========================================================="

echo "📁 Đang tạo thư mục project: $PROJECT_NAME..."
mkdir -p $PROJECT_NAME
cd $PROJECT_NAME

echo "📝 Đang khởi tạo package.json..."
cat <<EOF > package.json
{
  "name": "my-slides",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "slidev build",
    "dev": "slidev --open",
    "export": "slidev export"
  },
  "dependencies": {
    "@slidev/cli": "^0.49.0",
    "@slidev/theme-default": "^0.25.0",
    "vue": "^3.4.0"
  }
}
EOF

echo "📄 Đang tạo file slides.md mẫu với Animation..."
cat <<EOF > slides.md
---
theme: default
title: Business Flow Overview
info: |
  ## Presentation about Business Flow and Ownership.
---

# Đưa Dự Án Trở Lại Tầm Kiểm Soát

Biến kiến thức trong đầu thành tài sản chung

---

# Hành trình hôm nay

<v-clicks>

- Tribal Knowledge  
  → Cạm bẫy kiến thức bộ lạc

- Sức mạnh của Flow  
  → Nhìn thấy bức tranh lớn

- Artifacts là phương tiện  
  → Giải phóng bộ não

- Ownership  
  → Từ "thực thi" sang "làm chủ"

</v-clicks>

---

# Sẵn sàng!

- Bấm phim **mũi tên Phải (→)** hoặc **Space** để qua slide.
- Bấm phím **O** để bật Presenter Mode xem ghi chú dài.
- Thử sửa file \`slides.md\` để thấy nội dung cập nhật Real-time.
EOF

echo "📦 Đang tải các thư viện cần thiết bằng pnpm (quá trình này mất khoảng vài chục giây)..."
pnpm install

echo "=========================================================="
echo "✅ CÀI ĐẶT THÀNH CÔNG!"
echo "=========================================================="
echo "👉 Để bắt đầu trình chiếu ngay lập tức, hãy chạy 2 lệnh sau:"
echo ""
echo "    cd $PROJECT_NAME"
echo "    pnpm run dev"
echo ""
echo "Trình duyệt sẽ tự động mở tại http://localhost:3030"
echo "Chúc bạn có buổi thuyết trình tuyệt vời!"
echo "=========================================================="
