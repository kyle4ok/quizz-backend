// static/js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBK6c0i350DH5wZ79oYc_85w4jzIhJa3e0",
  authDomain: "quizz-app-d1e5b.firebaseapp.com",
  projectId: "quizz-app-d1e5b",
  storageBucket: "quizz-app-d1e5b.appspot.com",
  messagingSenderId: "644466420348",
  appId: "1:644466420348:web:cf799f3306cd3c7319b7f9",
  measurementId: "G-EKLTY31HKK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();

signInAnonymously(auth)
  .then(() => console.log("✅ 匿名登入成功"))
  .catch((error) => console.error("❌ 匿名登入失敗", error));

onAuthStateChanged(auth, (user) => {
  if (user) {
    sessionStorage.setItem("firebase_uid", user.uid);
  }
});