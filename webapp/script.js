const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const grid = 20;

let snake = [{x:10,y:10}];
let dir = {x:1,y:0};
let food = randomFood();

let score = 0;
let best = localStorage.getItem('snake_best') || 0;
document.getElementById('best').innerText = best;

let gameOver = false;

// 💥 эффект
let shake = 0;
let flash = 0;

// 🔊 звук
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const dieSound = new Audio("https://actions.google.com/sounds/v1/explosions/explosion.ogg");

// 🍎 еда
function randomFood(){
  return {
    x: Math.floor(Math.random()*grid),
    y: Math.floor(Math.random()*grid)
  };
}

//
// 📱 свайп
//
let startX = 0, startY = 0;

canvas.addEventListener("touchstart", e => {
  if(gameOver) return restart();
  e.preventDefault();
  let t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;
});

canvas.addEventListener("touchend", e => {
  e.preventDefault();
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

//
// 🖥 клавиатура
//
document.addEventListener("keydown", e=>{
  if(e.key==="ArrowUp" && dir.y!==1) dir={x:0,y:-1};
  if(e.key==="ArrowDown" && dir.y!==-1) dir={x:0,y:1};
  if(e.key==="ArrowLeft" && dir.x!==1) dir={x:-1,y:0};
  if(e.key==="ArrowRight" && dir.x!==-1) dir={x:1,y:0};
});

//
// 🔁 логика
//
function update(){
  if(gameOver) return;

  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // 💀 стены
  if(head.x<0 || head.y<0 || head.x>=grid || head.y>=grid){
    return die();
  }

  // 💀 в себя
  for(let s of snake){
    if(s.x===head.x && s.y===head.y) return die();
  }

  snake.unshift(head);

  if(head.x===food.x && head.y===food.y){
    food = randomFood();
    score++;

    eatSound.currentTime = 0;
    eatSound.play();

    if(score > best){
      best = score;
      localStorage.setItem('snake_best', best);
      document.getElementById('best').innerText = best;
    }

  } else {
    snake.pop();
  }
}

//
// 🎨 рисовка
//
function draw(){
  ctx.save();

  // 💥 ТРЯСКА
  if(shake > 0){
    let dx = (Math.random()-0.5)*10;
    let dy = (Math.random()-0.5)*10;
    ctx.translate(dx, dy);
    shake--;
  }

  ctx.clearRect(0,0,400,400);

  // фон
  ctx.fillStyle = "#5dbb63";
  ctx.fillRect(0,0,400,400);

  // 🍎 яблоко
  ctx.fillStyle = "red";
  ctx.beginPath();
  ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
  ctx.fill();

  ctx.fillStyle = "green";
  ctx.fillRect(food.x*20+10, food.y*20+2, 3, 6);

  // 🐍 змея
  snake.forEach((s,i)=>{
    let r = 10 - i*0.2;
    if(r < 5) r = 5;

    ctx.fillStyle = i===0 ? "#2e7d32" : "#4caf50";

    ctx.beginPath();
    ctx.arc(s.x*20+10, s.y*20+10, r, 0, Math.PI*2);
    ctx.fill();
  });

  // 👀 глаза
  let head = snake[0];
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(head.x*20+6, head.y*20+8, 2, 0, Math.PI*2);
  ctx.arc(head.x*20+14, head.y*20+8, 2, 0, Math.PI*2);
  ctx.fill();

  ctx.restore();

  // ⚡ ВСПЫШКА
  if(flash > 0){
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0,0,400,400);
    flash -= 0.05;
  }

  // текст
  document.getElementById('score').innerText = score;

  // GAME OVER
  if(gameOver){
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(0,0,400,400);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText("GAME OVER", 110, 180);

    ctx.font = "16px Arial";
    ctx.fillText("Tap to restart", 130, 220);
  }
}

//
// 💀 смерть
//
function die(){
  gameOver = true;

  // 💥 эффекты
  shake = 15;
  flash = 0.8;

  dieSound.currentTime = 0;
  dieSound.play();
}

//
// 🔄 рестарт
//
function restart(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  score = 0;
  food = randomFood();
  gameOver = false;
}

canvas.addEventListener("click", ()=>{
  if(gameOver) restart();
});

canvas.addEventListener("touchstart", ()=>{
  if(gameOver) restart();
});

//
// 🔁 LOOP
//
function loop(){
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
