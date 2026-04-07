const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// ===== ИЗОБРАЖЕНИЯ =====
const playerImg = new Image()
playerImg.src = "https://i.imgur.com/4LGAZ8t.png" // персонаж

const enemyImg = new Image()
enemyImg.src = "https://i.imgur.com/Q9qFt3m.png" // враг

// ===== ИГРОК =====
let player = {
  x: 100,
  y: 300,
  w: 60,
  h: 60,
  hp: 100,
  dy: 0,
  grounded: false,
  attacking: false
}

// ===== ВРАГ =====
let enemy = {
  x: 500,
  y: 300,
  w: 60,
  h: 60,
  hp: 100,
  dir: -1
}

const ground = canvas.height - 120

// ===== УПРАВЛЕНИЕ =====
function moveLeft() {
  player.x -= 6
}

function moveRight() {
  player.x += 6
}

function jump() {
  if (player.grounded) {
    player.dy = -13
    player.grounded = false
  }
}

function attack() {
  player.attacking = true

  setTimeout(() => {
    player.attacking = false
  }, 200)

  let dist = Math.abs(player.x - enemy.x)
  if (dist < 80) {
    enemy.hp -= 15
  }
}

// ===== ОБНОВЛЕНИЕ =====
function update() {
  // гравитация
  player.dy += 0.6
  player.y += player.dy

  if (player.y + player.h >= ground) {
    player.y = ground - player.h
    player.dy = 0
    player.grounded = true
  }

  // враг идет к игроку
  if (enemy.x > player.x) {
    enemy.x -= 2
  } else {
    enemy.x += 2
  }

  // враг атакует
  let dist = Math.abs(player.x - enemy.x)
  if (dist < 60) {
    player.hp -= 0.3
  }

  // респавн врага
  if (enemy.hp <= 0) {
    enemy.hp = 100
    enemy.x = Math.random() * (canvas.width - 100)
  }

  document.getElementById('hp').innerText = Math.floor(player.hp)
}

// ===== РЕНДЕР =====
function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height)

  // фон
  ctx.fillStyle = "#142a5c"
  ctx.fillRect(0,0,canvas.width,canvas.height)

  // земля
  ctx.fillStyle = "#6b4a2b"
  ctx.fillRect(0, ground, canvas.width, 120)

  // игрок
  ctx.drawImage(playerImg, player.x, player.y, player.w, player.h)

  // удар (эффект)
  if (player.attacking) {
    ctx.fillStyle = "yellow"
    ctx.fillRect(player.x + 50, player.y + 20, 30, 10)
  }

  // враг
  ctx.drawImage(enemyImg, enemy.x, enemy.y, enemy.w, enemy.h)

  // HP врага
  ctx.fillStyle = "white"
  ctx.fillText("👹 " + enemy.hp, enemy.x, enemy.y - 10)
}

// ===== ЦИКЛ =====
function gameLoop() {
  update()
  draw()
  requestAnimationFrame(gameLoop)
}

gameLoop()
