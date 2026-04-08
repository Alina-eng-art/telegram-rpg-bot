const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// 📁 файл
const FILE = "scores.json";

// загрузка
let players = {};

if (fs.existsSync(FILE)) {
  try {
    players = JSON.parse(fs.readFileSync(FILE));
  } catch (e) {
    console.log("❌ ошибка чтения файла");
    players = {};
  }
}

// 💾 сохранить
function save() {
  fs.writeFileSync(FILE, JSON.stringify(players, null, 2));
}

// 📤 СОХРАНИТЬ СЧЁТ
app.post("/score", (req, res) => {
  const { user_id, name, score, avatar } = req.body;

  if (!user_id) return res.sendStatus(400);

  if (players[user_id]) {
    if (score > players[user_id].score) {
      players[user_id].score = score;
      players[user_id].name = name;
      players[user_id].avatar = avatar;
    }
  } else {
    players[user_id] = { name, score, avatar };
  }

  save(); // 🔥 ВАЖНО

  res.sendStatus(200);
});

// 📥 ПОЛУЧИТЬ РЕЙТИНГ
app.get("/scores", (req, res) => {
  const sorted = Object.values(players)
    .sort((a, b) => b.score - a.score)
    .slice(0, 50);

  res.json(sorted);
});

// 🚀 старт
app.listen(PORT, () => {
  console.log(`🔥 Server started on port ${PORT}`);
});
