# 📦 Quizz_App_V1.3 資料夾結構說明

```
Quizz_App_V1.3/
├── app.py                     # Flask 主程式（含 Firestore API）
├── requirements.txt           # 依賴列表（flask, firebase-admin, 等）
├── Procfile                   # Railway 部署啟動點
├── .env.sample                # PORT 與 Firebase 金鑰 JSON 路徑設定
├── railway.json               # Railway 環境與部署設定
├── firebase_admin_sdk.json    # Firebase Admin 金鑰（部署前加入，勿上傳 Git）

├── /templates/                # HTML 畫面
│   ├── index.html             # Landing Page（角色選擇）
│   ├── quiz.html              # 測驗與結算
│   └── leaderboard.html       # 排行榜查詢

├── /static/
│   ├── /images/               # 題庫圖片（150 張）
│   ├── /avatars/              # 玩家頭像（avatar_001~050.svg）
│   ├── /css/                  # 樣式表
│   └── /js/
│       ├── script.js          # 主邏輯（含抽題 / 分數 / sessionStorage 控制）
│       ├── firestore.js       # Firestore 成績寫入模組
│       └── firebase-config.js # Firebase 客戶端 config（前端記名用途）

├── /assets/（可選備份）
│   ├── questions.json         # 題庫檔（150 題）
│   ├── rules.json             # 抽題規則
│   └── score_log.json         # 本地成績記錄（非必要）
```
