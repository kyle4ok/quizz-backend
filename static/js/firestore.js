// firestore.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

// 初始化 Firebase 應用
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 儲存玩家資料
export async function savePlayerProfile(uid, name, avatarId) {
  try {
    await addDoc(collection(db, "players"), {
      uid: uid,
      name: name,
      avatar: avatarId,
      createdAt: Timestamp.now()
    });
    console.log("✅ 玩家資料已儲存");
  } catch (e) {
    console.error("❌ 玩家資料儲存失敗:", e);
  }
}

// 儲存分數（UID 版本）
export async function saveScore(score, uid, name, avatar, challengeRound = 1, elapsedTime = 0) {
  try {
    await addDoc(collection(db, "scores"), {
      uid: uid,
      name: name,
      avatar: avatar,
      score: score,
      challengeRound: challengeRound,
      elapsedTime: elapsedTime,
      createdAt: Timestamp.now()
    });
    console.log("✅ 成績已儲存");
  } catch (e) {
    console.error("❌ 成績儲存失敗:", e);
  }
}