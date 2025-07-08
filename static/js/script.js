import { saveScore } from "./firestore.js";

// 初始化參數
let currentPhaseIndex = 0;
let phases = [];
let usedQuestionIds = new Set(JSON.parse(sessionStorage.getItem("usedIds") || "[]"));
let retryCount = parseInt(sessionStorage.getItem("retryCount") || "0");
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let answers = [];
let allQuestions = [];

// 載入規則與題目
async function loadPhasesAndQuestions() {
  try {
    const rulesRes = await fetch("/get_rules");
    const rulesData = await rulesRes.json();
    const questionRes = await fetch("/questions");
    allQuestions = await questionRes.json();  // ✅ 補上 .json()

    phases = Object.values(rulesData)
      .filter(p => p.id)
      .sort((a, b) => parseInt(a.id.split("_")[1]) - parseInt(b.id.split("_")[1]));

    startPhase(phases[currentPhaseIndex]);
  } catch (err) {
    console.error("載入錯誤：", err);
  }
}

// 開始階段
function startPhase(phase) {
  currentQuestions = drawQuestionsForPhase(phase);
  currentQuestionIndex = 0;
  renderQuestion();
}

// 抽題邏輯
function drawQuestionsForPhase(phase) {
  let selected = [];

  if (phase.type === "choice") {
    for (const [category, count] of Object.entries(phase.distribution)) {
      const pool = allQuestions.filter(q => q.category === category && !usedQuestionIds.has(q.id));
      const usedPool = allQuestions.filter(q => q.category === category && usedQuestionIds.has(q.id));
      let chosen = [];

      if (pool.length >= count) {
        chosen = shuffle(pool).slice(0, count);
      } else {
        chosen = shuffle(pool.concat(usedPool)).slice(0, count);
      }

      chosen.forEach(q => usedQuestionIds.add(q.id));
      selected = selected.concat(chosen);
    }
  } else if (phase.type === "match") {
    const pool = allQuestions.filter(q => !usedQuestionIds.has(q.id));
    const usedPool = allQuestions.filter(q => usedQuestionIds.has(q.id));
    let chosen = [];

    if (pool.length >= 20) {
      chosen = shuffle(pool).slice(0, 20);
    } else {
      chosen = shuffle(pool.concat(usedPool)).slice(0, 20);
    }

    chosen.forEach(q => usedQuestionIds.add(q.id));
    selected = chosen;
  }

  sessionStorage.setItem("usedIds", JSON.stringify(Array.from(usedQuestionIds)));
  return shuffle(selected);
}

// 顯示題目
function renderQuestion() {
  const container = document.getElementById("quiz-container");
  container.innerHTML = "";

  const q = currentQuestions[currentQuestionIndex];
  if (!q) {
    container.innerHTML = "<p>⚠️ 找不到題目，請重新開始</p>";
    return;
  }

  const img = document.createElement("img");
  img.src = q.image;
  img.alt = "題目圖片";
  container.appendChild(img);

  const questionText = document.createElement("p");
  questionText.innerText = "以下圖示代表什麼意思？";
  container.appendChild(questionText);

  const options = generateOptions(q);
  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.innerText = opt;
    btn.onclick = () => handleAnswer(opt, q);
    container.appendChild(btn);
  });
}

// 選項產生器：從同類中抽三個混淆選項
function generateOptions(question) {
  const correct = question.answer;
  const candidates = allQuestions
    .filter(q => q.category === question.category && q.answer !== correct)
    .map(q => q.answer);

  const shuffled = shuffle(candidates).slice(0, 3);
  const allOpts = shuffle([correct, ...shuffled]);
  return allOpts;
}

// 答題處理
function handleAnswer(selected, question) {
  const correct = selected === question.answer;
  answers.push({
    id: question.id,
    selected,
    correct,
    phase: phases[currentPhaseIndex]?.id
  });

  if (correct) score++;
  currentQuestionIndex++;

  if (currentQuestionIndex < currentQuestions.length) {
    renderQuestion();
  } else {
    endPhase();
  }
}

// 階段結束處理
function endPhase() {
  currentPhaseIndex++;
  if (currentPhaseIndex < phases.length) {
    startPhase(phases[currentPhaseIndex]);
  } else {
    retryCount++;
    sessionStorage.setItem("retryCount", retryCount.toString());
    showSummary();
  }
}

// 結算畫面
function showSummary() {
  const container = document.getElementById("quiz-container");
  const totalScore = calculateScore();
  const remaining = allQuestions.length - usedQuestionIds.size;

  container.innerHTML = `<h2>測驗完成！</h2><p>得分：${totalScore} 分</p>`;
  sessionStorage.setItem("last_score", totalScore.toString());  // ✅ 為 leaderboard.html / quiz.html 登錄使用

  if (remaining >= 50) {
    const btn1 = document.createElement("button");
    btn1.innerText = "再挑戰一次（不重複）";
    btn1.onclick = () => {
      currentPhaseIndex = 0;
      startPhase(phases[0]);
    };
    container.appendChild(btn1);
  } else {
    const info = document.createElement("p");
    info.innerText = "你已完成所有題目，是否要重置選題並重新挑戰？";
    container.appendChild(info);

    const btn2 = document.createElement("button");
    btn2.innerText = "重置選題並重新挑戰";
    btn2.onclick = () => {
      usedQuestionIds = new Set();
      sessionStorage.removeItem("usedIds");
      sessionStorage.setItem("retryCount", "0");
      currentPhaseIndex = 0;
      startPhase(phases[0]);
    };
    container.appendChild(btn2);
  }

  const btn3 = document.createElement("button");
  btn3.innerText = "登錄成績並離開";
  btn3.onclick = async () => {
    const uid = sessionStorage.getItem("uid") || "unknown";
    const name = sessionStorage.getItem("name") || "未知玩家";
    const avatar = sessionStorage.getItem("avatar") || "avatar_001.svg";

    await saveScore(totalScore, uid, name, avatar, retryCount, 0);
    window.location.href = "/leaderboard";
  };
  container.appendChild(btn3);
}

// 計算總得分
function calculateScore() {
  return answers.reduce((acc, a) => acc + (a.correct ? 2 : 0), 0);
}

// 陣列洗牌
function shuffle(arr) {
  return arr.map(a => [Math.random(), a])
            .sort((a, b) => a[0] - b[0])
            .map(a => a[1]);
}

// 頁面載入觸發
window.onload = loadPhasesAndQuestions;