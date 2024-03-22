require("dotenv").config();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const API_KEY_GIF = process.env.API_KEY_GIF;
const API_KEY_CMC = process.env.API_KEY_CMC;

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

async function fetchFromCMCApi() {
  try {
    const res = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "X-CMC_PRO_API_KEY": API_KEY_CMC,
        },
      },
    );

    return res.data.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

const fetchGifs = async (keyword) => {
  try {
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${API_KEY_GIF}&q=${keyword
        .split(" ")
        .join("")}`,
    );

    const data = await response.json();

    const randomIndex = Math.floor(Math.random() * data.data.length);

    return data.data[randomIndex]?.images?.downsized_medium.url;
  } catch (err) {
    console.log(err.message);
  }
};

function sendMessage(chatId, message) {
  bot
    .sendMessage(chatId, message)
    .then(() => console.log("Message sent successfully"))
    .catch((error) => console.error("Error sending message:", error));
}

function sendAnimation(chatId, message, caption) {
  bot
    .sendAnimation(chatId, message, { caption: caption, parse_mode: "HTML" })
    .then(() => console.log("Message sent successfully"))
    .catch((error) => console.error("Error sending message:", error));
}

function getCrypto(allCrypto) {
  const parsedCrypto = allCrypto.filter(
    (item) =>
      item.symbol === "BTC" || item.symbol === "ETH" || item.symbol === "TON",
  );

  return parsedCrypto.map((it) => ({
    ticker: it.symbol,
    name: it.name,
    id: it.id,
    lastPrice: parseFloat(it.quote.USD.price.toFixed(2)) ?? 0,
    percentChange24h:
      parseFloat(it.quote.USD.percent_change_24h.toFixed(2)) ?? 0,
  }));
}

cron.schedule("13 14 * * *", async () => {
  const allCrypto = await fetchFromCMCApi();
  const gif = await fetchGifs("meme");

  const crypto = getCrypto(allCrypto);

  if (crypto) {
    const caption = `👋 <strong>Всем доброе утро!</strong> 
            
👇 Сегодняшние цены на основные криптовалюты:

${crypto[0].name} = $${crypto[0].lastPrice}
Рост за 24ч = ${crypto[0].percentChange24h}%

${crypto[1].name} = $${crypto[1].lastPrice}
Рост за 24ч = ${crypto[1].percentChange24h}%

${crypto[2].name} = $${crypto[2].lastPrice}
Рост за 24ч = ${crypto[2].percentChange24h}%

<a href="https://t.me/gunyainvest">Telegram</a> | <a href="https://www.youtube.com/@gunyainvest">YouTube</a> | <a href="https://t.me/investMoldova">Чат Invest Moldova</a>`;

    sendAnimation(CHAT_ID, gif, caption);
  } else {
    console.log("Value not found");
  }
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, "Test message works!");
});
