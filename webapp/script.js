const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 400;

const grid = 20;

let snake, dir, food, score, best, speed;
let gameLoop;
let started = false;

// 🔊 звук
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const dieSound = new Audio("https://actions.google.com/sounds/v1/explosions/explosion.ogg");

// 🏆 рекорд
best = localStorage.getItem("snake_best") || 0;
document.getElementById("best").innerText = best;

// старт
function startGame(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  food = randomFood();
  score = 0;
  speed = 180;

  document.getElementById("score").innerText = score;

  started = true;

  clearInterval(gameLoop);
  gameLoop = setInterval(update, speed);
}

// 🍎 еда
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

  dieSound.currentTime = 0;
  dieSound.play();

  // рекорд
  if(score > best){
    best = score;
    localStorage.setItem("snake_best", best);
    document.getElementById("best").innerText = best;
  }

  // вспышка
  document.body.style.background = "white";
  setTimeout(()=> document.body.style.background="#0b1a2a", 100);

  // показать меню
  document.getElementById("menu").style.display = "flex";
}

// 🔁 логика
function update(){
  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // стены
  if(head.x<0 || head.y<0 || head.x>=20 || head.y>=20){
    return die();
  }

  // в себя
  for(let s of snake){
    if(s.x===head.x && s.y===head.y) return die();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    food = randomFood();
    score++;
    document.getElementById("score").innerText = score;

    eatSound.currentTime = 0;
    eatSound.play();

    // ⚡ ускорение
    if(speed > 90){
      speed -= 5;
      clearInterval(gameLoop);
      gameLoop = setInterval(update, speed);
    }

  } else {
    snake.pop();
  }

  draw();
}

// 🎨 рисовка
function draw(){
  ctx.fillStyle = "#1e3a5f";
  ctx.fillRect(0,0,400,400);

  // яблоко
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
  ctx.fill();

  // змейка
  snake.forEach((s,i)=>{
    ctx.fillStyle = i===0 ? "#00ff88" : "#00cc66";
    ctx.fillRect(s.x*20, s.y*20, 18, 18);
  });
}

// 📱 СУПЕР ВАЖНО — БЛОК СКРОЛЛА
document.body.addEventListener("touchmove", e => {
  e.preventDefault();
}, { passive: false });

// 📱 свайпы (работают нормально)
let startX=0,startY=0;

canvas.addEventListener("touchstart", e=>{
  let t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});

canvas.addEventListener("touchend", e=>{
  let t = e.changedTouches[0];

  let dx = t.clientX - startX;
  let dy = t.clientY - startY;

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx>0 && dir.x!==-1) dir={x:1,y:0};
    if(dx<0 && dir.x!==1) dir={x:-1,y:0};
  } else {
    if(dy>0 && dir.y!==-1) dir={x:0,y:1};
    if(dy<0 && dir.y!==1) dir={x:0,y:-1};
  }
});

// 🖥 клавиатура
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
