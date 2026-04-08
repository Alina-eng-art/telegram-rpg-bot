const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const FILE = "./scores.json";

// 📥 загрузка из файла
function loadPlayers() {
  try {
    const data = fs.readFileSync(FILE, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

// 💾 сохранение в файл
function savePlayers(players) {
  fs.writeFileSync(FILE, JSON.stringify(players, null, 2));
}

// 🧠 теперь данные НЕ пропадут
let players = loadPlayers();

// сохранить скор
app.post("/score", (req, res) => {
  const { user_id, name, score, avatar } = req.body;

  if (!user_id) return res.sendStatus(400);

  if (players[user_id]) {
    if (score > players[user_id].score) {
      players[user_id].score = score;
    }
  } else {
    players[user_id] = { name, score, avatar };
  }

  savePlayers(players); // 🔥 ВАЖНО

  res.sendStatus(200);
});

// получить рейтинг
app.get("/scores", (req, res) => {
  const sorted = Object.values(players)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  res.json(sorted);
});

app.listen(3001, () => {
  console.log("🔥 Server started on port 3001");
});
