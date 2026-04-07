const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

let snake, dir, food, score, best, speed;
let gameLoop;
let started = false;

// 💥 эффекты
let shake = 0;
let flash = 0;
let boomPower = 0;

// 🔊 звуки
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const dieSound = new Audio("https://actions.google.com/sounds/v1/explosions/explosion.ogg");

// 📳 вибрация
function vibrate(pattern){
  if(navigator.vibrate){
    navigator.vibrate(pattern);
  }
}

// ===== TELEGRAM =====
const tg = window.Telegram?.WebApp;
tg?.expand();

const user = tg?.initDataUnsafe?.user || {};
const user_id = user.id || "guest_" + Math.random();
const playerName = user.first_name || "Player";
const avatar = user.photo_url || "";

// 🏆 рекорд
best = localStorage.getItem("snake_best") || 0;
document.getElementById("best").innerText = best;

// ===== UI =====
window.addEventListener("load", () => {
  document.getElementById("topBtn").onclick = openRating;

  document.getElementById("closeRating").onclick = () => {
    document.getElementById("ratingModal").classList.add("hidden");
  };
});

function openRating(){
  document.getElementById("ratingModal").classList.remove("hidden");
  loadLeaderboard();
}

// ===== API =====
const API = "https://snake-server-5swh.onrender.com";

function sendScore(score){
  fetch(API + "/score", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id,
      name: playerName,
      score,
      avatar
    })
  }).catch(()=>{});
}

function loadLeaderboard(){
  fetch(API + "/scores")
    .then(res => res.json())
    .then(data => {

      const div = document.getElementById("ratingList");
      div.innerHTML = "";

      data.forEach((p,i)=>{

        let cls = "";
        if(i===0) cls="gold";
        else if(i===1) cls="silver";
        else if(i===2) cls="bronze";

        div.innerHTML += `
        <div class="player ${cls}">
          <div class="player-left">
            <img class="avatar"
              src="${p.avatar || 'https://ui-avatars.com/api/?name='+p.name}">
            <span>#${i+1} ${p.name}</span>
          </div>
          <span>${p.score}</span>
        </div>
        `;
      });
    })
    .catch(()=>{});
}

// ===== GAME =====

function startGame(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  food = randomFood();
  score = 0;

  speed = 180;

  shake = 0;
  flash = 0;
  boomPower = 0;

  document.getElementById("score").innerText = score;

  started = true;

  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

function randomFood(){
  return {
    x: Math.floor(Math.random()*20),
    y: Math.floor(Math.random()*20)
  };
}

// 💀 смерть
function die(){
  clearInterval(gameLoop);
  started = false;

  shake = 25;
  flash = 1;
  boomPower = 20;

  dieSound.currentTime = 0;
  dieSound.play().catch(()=>{});

  vibrate([200,100,200]);

  document.body.classList.add("shake");
  setTimeout(()=> document.body.classList.remove("shake"), 400);

  sendScore(score);

  setTimeout(()=>{
    openRating();
    document.getElementById("menu").style.display = "flex";
  }, 400);
}

// 🔁 логика
function update(){
  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  if(head.x<0 || head.y<0 || head.x>=20 || head.y>=20){
    return die();
  }

  for(let s of snake){
    if(s.x===head.x && s.y===head.y) return die();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    food = randomFood();
    score++;

    eatSound.currentTime = 0;
    eatSound.play();

    vibrate(50);

    // плавное ускорение
    if(speed > 90){
      speed -= 3;
      clearInterval(gameLoop);
      gameLoop = setInterval(update, speed);
    }

    if(score > best){
      best = score;
      localStorage.setItem("snake_best", best);
      document.getElementById("best").innerText = best;
    }

  } else {
    snake.pop();
  }

  draw();
}

// 🎨 РИСОВКА
function draw(){
  ctx.save();

  // 💥 тряска
  if(shake > 0){
    let power = shake * 0.8;
    ctx.translate(
      (Math.random()-0.5)*power,
      (Math.random()-0.5)*power
    );
    shake--;
  }

  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(0,0,400,400);

  // 🍎 яблоко
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "green";
  ctx.fillRect(food.x*20+9, food.y*20+2, 3, 6);

  // 🐍 змейка
  for(let i = snake.length - 1; i >= 0; i--){
    let s = snake[i];

    let wave = Math.sin((Date.now()/100) + i) * 2;

    let x = s.x * 20 + 10 + wave;
    let y = s.y * 20 + 10;

    let radius = 10 - i * 0.2;
    if(radius < 5) radius = 5;

    let gradient = ctx.createRadialGradient(x, y, 2, x, y, radius);
    gradient.addColorStop(0, "#00ff88");
    gradient.addColorStop(1, "#007744");

    ctx.fillStyle = gradient;

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI*2);
    ctx.fill();
  }

  // 👀 глаза
  let head = snake[0];
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(head.x*20+6, head.y*20+8, 2, 0, Math.PI*2);
  ctx.arc(head.x*20+14, head.y*20+8, 2, 0, Math.PI*2);
  ctx.fill();

  // 💥 взрыв
  if(boomPower > 0){
    ctx.beginPath();
    ctx.arc(200, 200, boomPower * 3, 0, Math.PI*2);
    ctx.fillStyle = `rgba(255,100,0,${boomPower/20})`;
    ctx.fill();
    boomPower--;
  }

  ctx.restore();

  // вспышка
  if(flash > 0){
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0,0,400,400);
    flash -= 0.07;
  }

  document.getElementById("score").innerText = score;
}

// ===== 📱 СУПЕР ФИКС СВАЙПОВ =====

let startX=0,startY=0;

canvas.addEventListener("touchstart", e=>{
  const t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
}, { passive:true });

canvas.addEventListener("touchmove", e=>{
  e.preventDefault(); // ❗ фикс скролла
}, { passive:false });

canvas.addEventListener("touchend", e=>{
  const t = e.changedTouches[0];

  let dx = t.clientX - startX;
  let dy = t.clientY - startY;

  if(Math.abs(dx) < 20 && Math.abs(dy) < 20) return; // ❗ анти-лаг

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx>0 && dir.x!==-1) dir={x:1,y:0};
    if(dx<0 && dir.x!==1) dir={x:-1,y:0};
  } else {
    if(dy>0 && dir.y!==-1) dir={x:0,y:1};
    if(dy<0 && dir.y!==1) dir={x:0,y:-1};
  }
});

// клавиатура
document.addEventListener("keydown", e=>{
  if(!started) return;

  if(e.key==="ArrowUp" && dir.y!==1) dir={x:0,y:-1};
  if(e.key==="ArrowDown" && dir.y!==-1) dir={x:0,y:1};
  if(e.key==="ArrowLeft" && dir.x!==1) dir={x:-1,y:0};
  if(e.key==="ArrowRight" && dir.x!==-1) dir={x:1,y:0};
});

// ▶️ кнопка
document.getElementById("startBtn").onclick = ()=>{
  document.getElementById("menu").style.display = "none";
  startGame();
};
