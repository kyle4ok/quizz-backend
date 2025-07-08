#!/bin/bash

# 📁 專案資料夾路徑
DEPLOY_DIR="/Users/work/Desktop/Quizz_App_V1.3  Beckend 2"
PROJECT_NAME="quizz-backend"

echo "🚀 開始部署 Quizz App V1.3 後端至 Railway..."

# Step 1：切換目錄
cd "$DEPLOY_DIR" || { echo "❌ 無法切換至目錄：$DEPLOY_DIR"; exit 1; }

# Step 2：檢查是否已登入 Railway
if ! railway whoami &>/dev/null; then
  echo "⚠️ 尚未登入 Railway，請先執行：railway login"
  exit 1
fi

# Step 3：若尚未初始化 Railway 專案，則執行 init
if [ ! -f ".railway/project.json" ]; then
  echo "📁 尚未初始化 Railway 專案，執行 init..."
  railway init --name "$PROJECT_NAME"
fi

# Step 4：上傳部署
echo "📤 執行 railway up..."
railway up

echo "✅ 部署完成！請前往 Railway 控制台檢查狀態。"

read -p "✅ 部署完成，按 Enter 關閉視窗..." dummy