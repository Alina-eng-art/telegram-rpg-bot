const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// 🧠 вместо массива — объект
let players = {};

// сохранить скор
app.post("/score", (req, res) => {
  const { user_id, name, score, avatar } = req.body;

  if (!user_id) return res.sendStatus(400);

  // если игрок уже есть
  if (players[user_id]) {
    // обновляем только если рекорд выше
    if (score > players[user_id].score) {
      players[user_id].score = score;
    }
  } else {
    players[user_id] = { name, score, avatar };
  }

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
