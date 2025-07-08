import os
import json
import base64
from flask import Flask, request, jsonify, send_from_directory, render_template
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

# 🔐 Railway base64 解碼 → 寫入 json 憑證
firebase_b64 = os.environ.get("FIREBASE_ADMIN_BASE64")
if firebase_b64:
    with open("firebase_admin_sdk.json", "wb") as f:
        f.write(base64.b64decode(firebase_b64))

# 初始化 Flask App
app = Flask(__name__, static_folder="static", template_folder="templates")
CORS(app)

# 初始化 Firebase Admin SDK
cred = credentials.Certificate("firebase_admin_sdk.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# 預設題庫與規則路徑
QUESTION_FILE = "assets/questions_converted_150_full.json"
RULE_FILE = "assets/rules.json"

# ✅ 首頁 route：對應 index.html，防止 GET / 出現 404
@app.route("/")
def index():
    return render_template("index.html")

# ✅ 題目頁 route（可選）
@app.route("/quiz")
def quiz_page():
    return render_template("quiz.html")

# ✅ 排行榜頁 route（可選）
@app.route("/leaderboard")
def leaderboard_page():
    return render_template("leaderboard.html")

# 取得題目 API
@app.route("/questions", methods=["GET"])
def get_questions():
    try:
        with open(QUESTION_FILE, "r", encoding="utf-8") as f:
            questions = json.load(f)
        return jsonify(questions)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 取得題型規則 API
@app.route("/get_rules", methods=["GET"])
def get_rules():
    try:
        with open(RULE_FILE, "r", encoding="utf-8") as f:
            rules = json.load(f)
        return jsonify(rules)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 上傳成績 API
@app.route("/submit_score", methods=["POST"])
def submit_score():
    try:
        data = request.get_json()
        uid = data.get("uid", "")
        name = data.get("name", "")
        avatar = data.get("avatar", "")
        score = data.get("score", 0)
        challenge_round = data.get("challengeRound", 1)
        elapsed_time = data.get("elapsedTime", 0)

        doc_ref = db.collection("scores").document()
        doc_ref.set({
            "uid": uid,
            "name": name,
            "avatar": avatar,
            "score": score,
            "challengeRound": challenge_round,
            "elapsedTime": elapsed_time,
            "createdAt": SERVER_TIMESTAMP
        })
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 提供 avatars 靜態檔案服務
@app.route("/avatars/<path:filename>")
def serve_avatar(filename):
    return send_from_directory("static/avatars", filename)

# 主程式進入點（支援 Railway PORT）
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port)