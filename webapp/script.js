const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

// ===== ГРАВЕЦЬ =====
let player = {
  x: 100,
  y: 300,
  w: 40,
  h: 60,
  hp: 100,
  speed: 5,
  dy: 0,
  grounded: false
}

// ===== ВОРОГ =====
let enemy = {
  x: 400,
  y: 300,
  w: 40,
  h: 60,
  hp: 50
}

// ===== ЗЕМЛЯ =====
const ground = canvas.height - 100

// ===== РУХ =====
function moveLeft() {
  player.x -= player.speed
}

function moveRight() {
  player.x += player.speed
}

function jump() {
  if (player.grounded) {
    player.dy = -12
    player.grounded = false
  }
}

function attack() {
  const dist = Math.abs(player.x - enemy.x)

  if (dist < 60) {
    enemy.hp -= 10

    if (enemy.hp <= 0) {
      enemy.hp = 50
      enemy.x = Math.random() * (canvas.width - 100)
    }
  }
}

// ===== ФИЗИКА =====
function update() {
  player.dy += 0.5
  player.y += player.dy

  if (player.y + player.h >= ground) {
    player.y = ground - player.h
    player.dy = 0
    player.grounded = true
  }

  // враг бьёт
  const dist = Math.abs(player.x - enemy.x)
  if (dist < 50) {
    player.hp -= 0.1
  }

  document.getElementById('hp').innerText = Math.floor(player.hp)
}

// ===== РЕНДЕР =====
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  // фон
  ctx.fillStyle = '#142a5c'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // земля
  ctx.fillStyle = '#6b4a2b'
  ctx.fillRect(0, ground, canvas.width, 100)

  // игрок
  ctx.fillStyle = 'cyan'
  ctx.fillRect(player.x, player.y, player.w, player.h)

  // враг
  ctx.fillStyle = 'red'
  ctx.fillRect(enemy.x, enemy.y, enemy.w, enemy.h)

  // HP врага
  ctx.fillStyle = 'white'
  ctx.fillText("👹 " + enemy.hp, enemy.x, enemy.y - 10)
}

// ===== ИГРОВОЙ ЦИКЛ =====
function gameLoop() {
  update()
  draw()
  requestAnimationFrame(gameLoop)
}

gameLoop()
