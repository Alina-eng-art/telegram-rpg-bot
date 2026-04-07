const { Telegraf, Markup } = require('telegraf')

const bot = new Telegraf('ТВОЙ_ТОКЕН')

// ===== ГРАВЦІ =====
const players = {}
const enemies = {}

function getPlayer(id) {
  if (!players[id]) {
    players[id] = {
      hp: 100,
      maxHp: 100,
      attack: 10,
      level: 1,
      exp: 0,
      gold: 0
    }
  }
  return players[id]
}

function createEnemy(level) {
  return {
    hp: 30 + level * 10,
    attack: 5 + level * 2
  }
}

// ===== СТАРТ =====
bot.start((ctx) => {
  const player = getPlayer(ctx.from.id)

  ctx.reply(
    `🎮 Ласкаво просимо в RPG!

Обери дію 👇`,
    Markup.keyboard([
      ['⚔️ Почати гру'],
      ['📊 Статистика']
    ]).resize()
  )
})

// ===== ПОЧАТИ RPG =====
bot.hears('⚔️ Почати гру', (ctx) => {
  const player = getPlayer(ctx.from.id)
  enemies[ctx.from.id] = createEnemy(player.level)

  ctx.reply(
    `🧙 RPG режим

❤️ HP: ${player.hp}
⚔️ Атака: ${player.attack}
⭐ Рівень: ${player.level}`,
    Markup.keyboard([
      ['⚔️ Атакувати'],
      ['❤️ Лікуватись', '📊 Статистика'],
      ['⬅️ Назад']
    ]).resize()
  )
})

// ===== АТАКА =====
bot.hears('⚔️ Атакувати', (ctx) => {
  const player = getPlayer(ctx.from.id)
  const enemy = enemies[ctx.from.id]

  if (!enemy) return ctx.reply('Натисни "Почати гру"')

  enemy.hp -= player.attack

  if (enemy.hp <= 0) {
    player.exp += 10
    player.gold += 5

    if (player.exp >= 20) {
      player.level++
      player.exp = 0
      player.attack += 2
      player.maxHp += 10
      player.hp = player.maxHp
      ctx.reply('🎉 РІВЕНЬ ПІДВИЩЕНО!')
    }

    enemies[ctx.from.id] = createEnemy(player.level)

    return ctx.reply(`👹 Ворог переможений!
+10 досвіду
+5 золота`)
  }

  player.hp -= enemy.attack

  if (player.hp <= 0) {
    player.hp = player.maxHp
    player.gold = Math.max(0, player.gold - 5)
    enemies[ctx.from.id] = createEnemy(player.level)

    return ctx.reply('💀 Ти загинув... -5 золота')
  }

  ctx.reply(`⚔️ Бій!

❤️ Твоє HP: ${player.hp}
👹 HP ворога: ${enemy.hp}`)
})

// ===== ЛІКУВАННЯ =====
bot.hears('❤️ Лікуватись', (ctx) => {
  const player = getPlayer(ctx.from.id)

  player.hp += 20
  if (player.hp > player.maxHp) player.hp = player.maxHp

  ctx.reply(`❤️ Ти відновив HP: ${player.hp}`)
})

// ===== СТАТИСТИКА =====
bot.hears('📊 Статистика', (ctx) => {
  const player = getPlayer(ctx.from.id)

  ctx.reply(`📊 Твій герой:

❤️ ${player.hp}/${player.maxHp}
⚔️ ${player.attack}
⭐ ${player.level}
✨ ${player.exp}/20
💰 ${player.gold}`)
})

// ===== НАЗАД =====
bot.hears('⬅️ Назад', (ctx) => {
  ctx.reply(
    'Головне меню',
    Markup.keyboard([
      ['⚔️ Почати гру'],
      ['📊 Статистика']
    ]).resize()
  )
})

// ===== ЗАПУСК =====
bot.launch()

console.log('🤖 RPG бот запущено!')
