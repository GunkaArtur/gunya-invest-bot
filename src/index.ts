import TelegramBot from "node-telegram-bot-api";
import cron from "node-cron";
import { config } from "./config";
import { fetchFromCMCApi, fetchStockPrice } from "./api";
import { parseStocks, convertCryptoToMessage } from "./utils";
import { STOCK_SYMBOLS, socialLinks } from "./constants";

const VIDEO_BASE_URL = "https://pub-04810c0575bf4bdaabc07ef9d1a3e295.r2.dev";
const VIDEO_COUNT = 55;
const TIMEZONE = "Europe/Chisinau";

const bot = new TelegramBot(config.botToken, { polling: true });

bot.on("polling_error", (error) =>
  console.error("Polling error:", error.message),
);

function randomVideoUrl(): string {
  const randomIndex = Math.floor(Math.random() * VIDEO_COUNT);
  return `${VIDEO_BASE_URL}/${randomIndex}.mp4`;
}

function sendVideo(
  chatId: TelegramBot.ChatId,
  video: string,
  caption: string,
): void {
  void bot
    .sendVideo(chatId, video, { caption, parse_mode: "HTML" })
    .then(() => console.log("Message sent successfully"))
    .catch((error: unknown) => console.error("Error sending message:", error));
}

async function sendStocksToTelegram(): Promise<void> {
  const results = await Promise.all(
    STOCK_SYMBOLS.map((ticker) => fetchStockPrice(ticker)),
  );

  const parsedStocks = parseStocks(results);

  const message = `<strong>👇 Сегодняшние цены на основные акции:</strong>

${parsedStocks.join("\n")}
${socialLinks}`;

  sendVideo(config.chatId, randomVideoUrl(), message);
}

async function sendCryptoToTelegram(): Promise<void> {
  const allCrypto = await fetchFromCMCApi();

  if (!allCrypto) {
    console.log("Value not found");
    return;
  }

  const crypto = convertCryptoToMessage(allCrypto);

  const createdMessage = crypto
    .map(
      (i) =>
        `${i.mainIcon} ${i.name} = ${i.lastPrice}$\n${i.secondIcon} Рост за 24ч = ${i.percentChange24h}%\n`,
    )
    .join("\n");

  const caption = `👋 <strong>Всем доброе утро!</strong>

👇 Сегодняшние цены на основные криптовалюты:

${createdMessage}
${socialLinks}`;

  sendVideo(config.chatId, randomVideoUrl(), caption);
}

// Daily crypto post at 09:00
cron.schedule("0 9 * * *", () => void sendCryptoToTelegram(), {
  timezone: TIMEZONE,
});

// Stock post at 16:35 on weekdays
cron.schedule("35 16 * * 1-5", () => void sendStocksToTelegram(), {
  timezone: TIMEZONE,
});

// Dev mode: react to any incoming message
// bot.on("message", () => {
//   // void sendCryptoToTelegram();
//   void sendStocksToTelegram();
// });

// Graceful shutdown: stop polling cleanly on Railway redeploys (SIGTERM)
// to avoid 409 conflicts between the old and new instance.
async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down...`);
  try {
    await bot.stopPolling();
  } finally {
    process.exit(0);
  }
}

process.once("SIGTERM", () => void shutdown("SIGTERM"));
process.once("SIGINT", () => void shutdown("SIGINT"));
