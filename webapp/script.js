const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 400;

const grid = 20;

// 🎮 состояния
let state = "menu"; // menu | game | over

let snake, dir, food, score, speed;
let best = localStorage.getItem('snake_best') || 0;
document.getElementById('best').innerText = best;

// эффекты
let shake = 0;
let flash = 0;

// звук
const eatSound = new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg");
const dieSound = new Audio("https://actions.google.com/sounds/v1/explosions/explosion.ogg");

// 🍎 еда
function randomFood(){
  return {
    x: Math.floor(Math.random()*grid),
    y: Math.floor(Math.random()*grid)
  };
}

// ▶️ старт
function startGame(){
  snake = [{x:10,y:10}];
  dir = {x:1,y:0};
  food = randomFood();
  score = 0;
  speed = 200; // 🔥 медленно сначала
  state = "game";
}

// 💀 смерть
function die(){
  state = "over";
  shake = 15;
  flash = 0.8;
  dieSound.currentTime = 0;
  dieSound.play();
}

// 📱 свайп
let startX = 0, startY = 0;

canvas.addEventListener("touchstart", e => {
  let t = e.touches[0];
  startX = t.clientX;
  startY = t.clientY;

  if(state === "menu") startGame();
  if(state === "over") startGame();
});

canvas.addEventListener("touchend", e => {
  let t = e.changedTouches[0];
  let dx = t.clientX - startX;
  let dy = t.clientY - startY;

  if(state !== "game") return;

  if(Math.abs(dx) > Math.abs(dy)){
    if(dx>0 && dir.x!==-1) dir={x:1,y:0};
    if(dx<0 && dir.x!==1) dir={x:-1,y:0};
  } else {
    if(dy>0 && dir.y!==-1) dir={x:0,y:1};
    if(dy<0 && dir.y!==1) dir={x:0,y:-1};
  }
});

// 🖥 клавиши
document.addEventListener("keydown", e=>{
  if(state === "menu") return startGame();
  if(state === "over") return startGame();

  if(e.key==="ArrowUp" && dir.y!==1) dir={x:0,y:-1};
  if(e.key==="ArrowDown" && dir.y!==-1) dir={x:0,y:1};
  if(e.key==="ArrowLeft" && dir.x!==1) dir={x:-1,y:0};
  if(e.key==="ArrowRight" && dir.x!==-1) dir={x:1,y:0};
});

// 🔁 логика
function update(){
  if(state !== "game") return;

  let head = {
    x: snake[0].x + dir.x,
    y: snake[0].y + dir.y
  };

  // стены
  if(head.x<0 || head.y<0 || head.x>=grid || head.y>=grid){
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

    // 🔊 звук без лага
    eatSound.currentTime = 0;
    eatSound.play();

    // ⚡ ускорение постепенно
    if(speed > 80){
      speed -= 5;
    }

    if(score > best){
      best = score;
      localStorage.setItem('snake_best', best);
      document.getElementById('best').innerText = best;
    }

  } else {
    snake.pop();
  }
}

// 🎨 рисовка
function draw(){
  ctx.save();

  // 💥 тряска
  if(shake > 0){
    ctx.translate((Math.random()-0.5)*10,(Math.random()-0.5)*10);
    shake--;
  }

  ctx.clearRect(0,0,400,400);

  // фон
  ctx.fillStyle = "#4caf50";
  ctx.fillRect(0,0,400,400);

  // 🍎 яблоко
  if(state !== "menu"){
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(food.x*20+10, food.y*20+10, 8, 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle = "green";
    ctx.fillRect(food.x*20+10, food.y*20+2, 3, 6);
  }

  // 🐍 змея
  if(snake){
    snake.forEach((s,i)=>{
      let r = 10 - i*0.2;
      if(r < 5) r = 5;

      ctx.fillStyle = i===0 ? "#2e7d32" : "#66bb6a";

      ctx.beginPath();
      ctx.arc(s.x*20+10, s.y*20+10, r, 0, Math.PI*2);
      ctx.fill();
    });

    // глаза
    let head = snake[0];
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(head.x*20+6, head.y*20+8, 2, 0, Math.PI*2);
    ctx.arc(head.x*20+14, head.y*20+8, 2, 0, Math.PI*2);
    ctx.fill();
  }

  ctx.restore();

  // ⚡ вспышка
  if(flash > 0){
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0,0,400,400);
    flash -= 0.05;
  }

  // UI
  ctx.fillStyle = "white";
  ctx.font = "18px Arial";
  ctx.fillText("Score: "+score, 10, 20);

  // 🎮 МЕНЮ
  if(state === "menu"){
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0,0,400,400);

    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText("🐍 SNAKE", 120, 160);

    ctx.font = "18px Arial";
    ctx.fillText("Tap to Start", 130, 220);
  }

  // 💀 GAME OVER
  if(state === "over"){
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(0,0,400,400);

    ctx.fillStyle = "white";
    ctx.font = "28px Arial";
    ctx.fillText("GAME OVER", 110, 180);

    ctx.font = "16px Arial";
    ctx.fillText("Tap to Restart", 120, 220);
  }
}

// 🔁 LOOP (ВАЖНО — норм скорость)
function loop(){
  update();
  draw();
  setTimeout(loop, speed);
}

loop();
