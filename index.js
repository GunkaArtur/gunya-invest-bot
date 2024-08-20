require("dotenv").config();
const axios = require("axios");
const TelegramBot = require("node-telegram-bot-api");
const cron = require("node-cron");

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;
const API_KEY_GIF = process.env.API_KEY_GIF;
const API_KEY_CMC = process.env.API_KEY_CMC;
const API_KEY_STOCKS = process.env.API_KEY_STOCKS;
const CRYPTO_SYMBOLS = ["BTC", "ETH", "BNB", "SOL", "XRP", "TON", "NOT"];
const STOCK_SYMBOLS = [
  "MSFT.US",
  "AMZN.US",
  "NVDA.US",
  "GOOGL.US",
  "TSLA.US",
  "META.US",
  "VOO.US",
];

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

function sortBySymbol(arr, order) {
  const orderMap = new Map(order.map((item, index) => [item, index]));
  return arr.sort((a, b) => orderMap.get(a.symbol) - orderMap.get(b.symbol));
}

async function fetchFromCMCApi() {
  try {
    const res = await axios.get(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${CRYPTO_SYMBOLS.join(",")}`,
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

function sentPhoto(chatId, message, caption) {
  bot
    .sendPhoto(chatId, message, { caption: caption, parse_mode: "HTML" })
    .then(() => console.log("Message sent successfully"))
    .catch((error) => console.error("Error sending message:", error));
}

function getIcon(symbol) {
  switch (symbol) {
    case "BTC":
      return "👑";
    case "ETH":
      return "🥛";
    case "BNB":
      return "🤙";
    case "SOL":
      return "🌙";
    case "XRP":
      return "🙏🏽";
    case "TON":
      return "💎";
    case "NOT":
      return "💛";
    case "AAPL":
      return "🍏";
    case "MSFT":
      return "💻";
    case "AMZN":
      return "🛒";
    case "NVDA":
      return "✨";
    case "GOOGL":
      return "🔍";
    case "TSLA":
      return "🚗";
    case "META":
      return "🖼";
    case "VOO":
      return "💰";
  }
}

function getCrypto(allCrypto) {
  const sortedArray = sortBySymbol(Object.values(allCrypto), CRYPTO_SYMBOLS);

  return sortedArray.map((it) => ({
    ticker: it.symbol,
    name: it.name,
    id: it.id,
    lastPrice:
      it.symbol === "NOT"
        ? parseFloat(it.quote.USD.price.toFixed(6))
        : parseFloat(it.quote.USD.price.toFixed(2)) ?? 0,
    percentChange24h:
      parseFloat(it.quote.USD.percent_change_24h.toFixed(2)) ?? 0,
    mainIcon: getIcon(it.symbol),
    secondIcon:
      parseFloat(it.quote.USD.percent_change_24h.toFixed(2)) > 0 ? "🟢" : "🔴",
  }));
}

cron.schedule(
  "0 9 * * *",
  async () => {
    const allCrypto = await fetchFromCMCApi();
    const gif = await fetchGifs("meme");

    const crypto = getCrypto(allCrypto);

    if (crypto) {
      const createdMessage = crypto
        .map(
          (i) =>
            `${i.mainIcon} ${i.name} = ${i.lastPrice}$\n${i.secondIcon} Рост за 24ч = ${i.percentChange24h}%\n`,
        )
        .join("\n");
      const caption = `👋 <strong>Всем доброе утро!</strong> 
            
👇 Сегодняшние цены на основные криптовалюты:

${createdMessage}
<a href="https://t.me/gunyainvest">Telegram</a> | <a href="https://www.youtube.com/@gunyainvest">YouTube</a> | <a href="https://t.me/investMoldova">Чат Invest Moldova</a>`;

      sendAnimation(CHAT_ID, gif, caption);
    } else {
      console.log("Value not found");
    }
  },
  {
    timezone: "Europe/Chisinau",
  },
);

cron.schedule(
  "35 16 * * 1-5",
  async () => {
    sendStocksToTelegram();
  },
  {
    timezone: "Europe/Chisinau",
  },
);

async function fetchStocksData() {
  try {
    const res = await axios.get(
      `https://eodhd.com/api/real-time/AAPL.US?s=${STOCK_SYMBOLS.join(",")}&api_token=${API_KEY_STOCKS}&fmt=json`,
    );

    return res.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function parseStocks(data) {
  return data.map((item) => {
    const code = item.code.slice(0, -3);
    const icon = getIcon(code);
    return `${icon} ${code} = $${item.open}\n${Number(item.change) > 0 ? "🟢" : "🔴"} Рост за 24ч: ${item.change}%\n`;
  });
}

async function sendStocksToTelegram() {
  const data = await fetchStocksData();
  const gif = await fetchGifs("wolf of wall street");

  const x = parseStocks(data);

  const message = `<strong>👇 Сегодняшние цены на основные акции:</strong> 
  
${x.join("\n")}
<a href="https://t.me/gunyainvest">Telegram</a> | <a href="https://www.youtube.com/@gunyainvest">YouTube</a> | <a href="https://t.me/investMoldova">Чат Invest Moldova</a>
`;

  sendAnimation(CHAT_ID, gif, message);
}
