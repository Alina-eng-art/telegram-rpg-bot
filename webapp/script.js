const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const size = 20;
let snake = [{x: 10, y: 10}];
let dir = 'right';
let food = randomFood();

let score = 0;
let best = localStorage.getItem('snake_best') || 0;

document.getElementById('best').innerText = best;

function randomFood() {
  return {
    x: Math.floor(Math.random() * 20),
    y: Math.floor(Math.random() * 20)
  };
}

function setDir(d) {
  dir = d;
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') dir = 'up';
  if (e.key === 'ArrowDown') dir = 'down';
  if (e.key === 'ArrowLeft') dir = 'left';
  if (e.key === 'ArrowRight') dir = 'right';
});

function gameLoop() {
  let head = {...snake[0]};

  if (dir === 'right') head.x++;
  if (dir === 'left') head.x--;
  if (dir === 'up') head.y--;
  if (dir === 'down') head.y++;

  // 💀 СМЕРТЬ ОБ СТЕНЫ
  if (head.x < 0 || head.y < 0 || head.x >= 20 || head.y >= 20) {
    return reset();
  }

  // 💀 СМЕРТЬ ОБ СЕБЯ
  for (let s of snake) {
    if (s.x === head.x && s.y === head.y) {
      return reset();
    }
  }

  snake.unshift(head);

  // 🍎 ЕДА
  if (head.x === food.x && head.y === food.y) {
    food = randomFood();
    score++;

    playEatSound();

    if (score > best) {
      best = score;
      localStorage.setItem('snake_best', best);
      document.getElementById('best').innerText = best;
    }

  } else {
    snake.pop();
  }

  draw();
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, 400, 400);

  // 🍎 яблоко (красивое)
  ctx.beginPath();
  ctx.fillStyle = "red";
  ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
  ctx.fill();

  // 🐍 змея (гладкая)
  snake.forEach((s, i) => {
    ctx.fillStyle = i === 0 ? "#00ffcc" : "#00ccaa";
    ctx.beginPath();
    ctx.arc(s.x*20+10, s.y*20+10, 9, 0, Math.PI*2);
    ctx.fill();
  });

  document.getElementById('score').innerText = score;
}

function reset() {
  playDeadSound();

  snake = [{x: 10, y: 10}];
  dir = 'right';
  score = 0;
}

// 🔊 ЗВУКИ
function playEatSound() {
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
  audio.play();
}

function playDeadSound() {
  const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");
  audio.play();
}

setInterval(gameLoop, 120);
