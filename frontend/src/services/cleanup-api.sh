#!/bin/bash

# Script xóa file api.js gốc sau khi đã tách thành các modules
echo "Đang kiểm tra các file API modules mới..."

# Kiểm tra các file cần thiết đã tồn tại chưa
API_DIR="$(dirname "$0")/api"
FILES=(
  "client.js"
  "auth.js" 
  "users.js"
  "proxies.js"
  "proxyPools.js"
  "orders.js"
  "wallet.js"
  "packages.js"
  "admin.js"
  "dashboard.js"
  "index.js"
)

MISSING=0
for file in "${FILES[@]}"; do
  if [ ! -f "$API_DIR/$file" ]; then
    echo "Lỗi: File $API_DIR/$file không tồn tại."
    MISSING=1
  fi
done

if [ $MISSING -eq 1 ]; then
  echo "Có lỗi xảy ra. Không thể xóa file api.js gốc."
  exit 1
fi

# Kiểm tra file api.js gốc có tồn tại không
if [ -f "$(dirname "$0")/api.js" ]; then
  echo "Đang xóa file api.js gốc..."
  rm "$(dirname "$0")/api.js"
  echo "Xóa file api.js thành công!"
else
  echo "File api.js gốc không tồn tại."
fi

echo "Hoàn tất!"
exit 0 