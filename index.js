require("dotenv").config();
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");
const { parseStocks, convertCryptoToMessage } = require("./utils");
const { fetchFromCMCApi, fetchStockPrice } = require("./api");
const { STOCK_SYMBOLS, socialLinks } = require("./constants");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function sendMessage(chatId, message, options) {
  bot
    .sendMessage(chatId, message, options)
    .then(() => console.log("Message sent successfully"))
    .catch((error) => console.error("Error sending message:", error));
}

function sendAnimation(chatId, message, caption) {
  bot
    .sendAnimation(chatId, message, { caption: caption, parse_mode: "HTML" })
    .then(() => console.log("Message sent successfully"))
    .catch((error) => console.error("Error sending message:", error));
}

function sendVideo(chatId, message, caption) {
  bot
    .sendVideo(chatId, message, { caption: caption, parse_mode: "HTML" })
    .then(() => console.log("Message sent successfully"))
    .catch((error) => console.error("Error sending message:", error));
}

function sentPhoto(chatId, message, caption) {
  bot
    .sendPhoto(chatId, message, { caption: caption, parse_mode: "HTML" })
    .then(() => console.log("Message sent successfully"))
    .catch((error) => console.error("Error sending message:", error));
}

cron.schedule(
  "0 9 * * *",
  async () => {
    sendCryptoToTelegram();
  },
  {
    timezone: "Europe/Chisinau",
  }
);

cron.schedule(
  "35 15 * * 1-5",
  async () => {
    sendStocksToTelegram();
  },
  {
    timezone: "Europe/Chisinau",
  }
);

async function sendStocksToTelegram() {
  const results = await Promise.all(
    STOCK_SYMBOLS.map((id) => fetchStockPrice(id))
  );

  const parsedStocks = parseStocks(results);

  const randomIndex = Math.floor(Math.random() * 55);

  const message = `<strong>👇 Сегодняшние цены на основные акции:</strong> 
  
${parsedStocks.join("\n")}
${socialLinks}`;

  sendVideo(
    CHAT_ID,
    `https://pub-04810c0575bf4bdaabc07ef9d1a3e295.r2.dev/${randomIndex}.mp4`,
    message
  );
}

async function sendCryptoToTelegram() {
  const allCrypto = await fetchFromCMCApi();

  const randomIndex = Math.floor(Math.random() * 55);

  const crypto = convertCryptoToMessage(allCrypto);

  if (crypto) {
    const createdMessage = crypto
      .map(
        (i) =>
          `${i.mainIcon} ${i.name} = ${i.lastPrice}$\n${i.secondIcon} Рост за 24ч = ${i.percentChange24h}%\n`
      )
      .join("\n");
    const caption = `👋 <strong>Всем доброе утро!</strong> 
            
👇 Сегодняшние цены на основные криптовалюты:

${createdMessage}
${socialLinks}`;

    sendAnimation(
      CHAT_ID,
      `https://pub-04810c0575bf4bdaabc07ef9d1a3e295.r2.dev/${randomIndex}.mp4`,
      caption
    );
  } else {
    console.log("Value not found");
  }
}

// Dev mode
// bot.on("message", async (message) => {
//   // sendCryptoToTelegram();
//   sendStocksToTelegram();
// });
