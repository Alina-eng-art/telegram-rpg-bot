const { Telegraf, Markup } = require('telegraf');

// ⚠️ ВСТАВЬ СВОЙ ТОКЕН
const bot = new Telegraf('8629708298:AAH5ZSfOgwRhi6wqGelgr3oiOXw2VRtf1EM');

// старт
bot.start((ctx) => {
  ctx.reply(
    `🐍 Snake Game\n\nЖми кнопку ниже 👇`,
    Markup.inlineKeyboard([
      [
        Markup.button.webApp(
          '🎮 Играть',
          'https://telegram-snake-game-eight.vercel.app'
        )
      ],
      [
        Markup.button.callback('🏆 Рейтинг', 'rating')
      ]
    ])
  );
});

// обработка кнопки рейтинга (опционально)
bot.action('rating', (ctx) => {
  ctx.answerCbQuery('Открой игру и смотри рейтинг там 😎');
});

// лог ошибок (очень важно)
bot.catch((err) => {
  console.log('❌ Ошибка бота:', err);
});

// graceful stop (чтобы не падал)
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// запуск
bot.launch();

console.log('🤖 Snake бот запущен!');
