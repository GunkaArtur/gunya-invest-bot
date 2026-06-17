// region Crypto
const { CRYPTO_SYMBOLS } = require("./constants");

function sortBySymbol(arr, order) {
  const orderMap = new Map(order.map((item, index) => [item, index]));
  return arr.sort((a, b) => orderMap.get(a.symbol) - orderMap.get(b.symbol));
}

function convertCryptoToMessage(allCrypto) {
  const sortedArray = sortBySymbol(Object.values(allCrypto), CRYPTO_SYMBOLS);

  return sortedArray.map((it) => ({
    ticker: it.symbol,
    name: it.name,
    id: it.id,
    lastPrice:
      it.symbol === "NOT" || it.symbol === "DOGS"
        ? parseFloat(it.quote.USD.price.toFixed(6))
        : parseFloat(it.quote.USD.price.toFixed(2)) ?? 0,
    percentChange24h:
      parseFloat(it.quote.USD.percent_change_24h.toFixed(2)) ?? 0,
    mainIcon: getIcon(it.symbol),
    secondIcon:
      parseFloat(it.quote.USD.percent_change_24h.toFixed(2)) > 0 ? "🟢" : "🔴",
  }));
}
// endregion

// region Stocks
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
      return "🇨🇳";
    case "BZUN":
      return "🇨🇳";
    case "BIDU":
      return "🇨🇳";
    case "INTC":
      return "🔵";
  }
}

function parseStocks(data) {
  return data.map(({ ticker, price, percentChange24h }) => {
    const icon = getIcon(ticker);
    return `${icon} ${ticker} = $${price}\n${Number(percentChange24h) > 0 ? "🟢" : "🔴"} Рост за 24ч: ${percentChange24h}%\n`;
  });
}
// endregion

module.exports = { parseStocks, getIcon, sortBySymbol, convertCryptoToMessage };
