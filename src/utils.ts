import { CRYPTO_SYMBOLS } from "./constants";
import type {
  CmcCurrency,
  CmcResponseData,
  CryptoMessageItem,
  StockQuote,
} from "./types";

// region Crypto
/** Sorts items by the position of their `symbol` in `order`. */
export function sortBySymbol<T extends { symbol: string }>(
  arr: T[],
  order: readonly string[],
): T[] {
  const orderMap = new Map(order.map((item, index) => [item, index]));
  return [...arr].sort(
    (a, b) =>
      (orderMap.get(a.symbol) ?? Number.MAX_SAFE_INTEGER) -
      (orderMap.get(b.symbol) ?? Number.MAX_SAFE_INTEGER),
  );
}

export function convertCryptoToMessage(
  allCrypto: CmcResponseData,
): CryptoMessageItem[] {
  const sortedArray = sortBySymbol<CmcCurrency>(
    // Guard against CMC omitting a requested symbol (would crash on it.quote.USD).
    Object.values(allCrypto).filter((it) => it.quote?.USD),
    CRYPTO_SYMBOLS,
  );

  return sortedArray.map((it) => {
    const percentChange24h = parseFloat(
      it.quote.USD.percent_change_24h.toFixed(2),
    );
    const isMicroPriced = it.symbol === "NOT" || it.symbol === "DOGS";

    return {
      ticker: it.symbol,
      name: it.name,
      id: it.id,
      lastPrice: parseFloat(it.quote.USD.price.toFixed(isMicroPriced ? 6 : 2)),
      percentChange24h,
      mainIcon: getIcon(it.symbol),
      secondIcon: percentChange24h > 0 ? "🟢" : "🔴",
    };
  });
}
// endregion

// region Stocks
export function getIcon(symbol: string): string {
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
    case "GRAM":
      return "💎";
    case "NOT":
      return "💛";
    case "DOGS":
    case "DOGE":
      return "🐶";
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
    case "SPCX":
      return "🚀";
    case "META":
      return "🖼";
    case "VOO":
      return "💰";
    case "KWEB":
    case "BZUN":
    case "BIDU":
      return "🇨🇳";
    case "INTC":
      return "🔵";
    default:
      return "";
  }
}

export function parseStocks(data: StockQuote[]): string[] {
  return data.map(({ ticker, price, percentChange24h }) => {
    const icon = getIcon(ticker);
    return `${icon} ${ticker} = $${price}\n${Number(percentChange24h) > 0 ? "🟢" : "🔴"} Рост за 24ч: ${percentChange24h}%\n`;
  });
}
// endregion
