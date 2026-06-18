/** Shared domain and external-API types. */

// region CoinMarketCap
/** Per-currency quote in the configured fiat (we only request USD). */
export interface CmcQuote {
  USD: {
    price: number;
    percent_change_24h: number;
  };
}

/** A single currency entry from the CMC `quotes/latest` response. */
export interface CmcCurrency {
  id: number;
  name: string;
  symbol: string;
  quote: CmcQuote;
}

/** `data` payload of `quotes/latest`, keyed by ticker symbol. */
export type CmcResponseData = Record<string, CmcCurrency>;
// endregion

// region Finnhub
/** Shape of the Finnhub `quote` endpoint response. */
export interface FinnhubQuote {
  /** Current price. */
  c: number;
  /** Change. */
  d: number;
  /** Percent change. */
  dp: number;
  /** High price of the day. */
  h: number;
  /** Low price of the day. */
  l: number;
  /** Open price of the day. */
  o: number;
  /** Previous close price. */
  pc: number;
  /** Unix timestamp. */
  t: number;
}
// endregion

// region Bot domain models
/** A single stock price ready to be rendered into a message. */
export interface StockQuote {
  ticker: string;
  price: number;
  percentChange24h: number;
}

/** A single crypto price ready to be rendered into a message. */
export interface CryptoMessageItem {
  ticker: string;
  name: string;
  id: number;
  lastPrice: number;
  percentChange24h: number;
  mainIcon: string;
  secondIcon: string;
}
// endregion
