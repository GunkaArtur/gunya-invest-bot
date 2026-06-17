import axios from "axios";
import { config } from "./config";
import { CRYPTO_SYMBOLS } from "./constants";
import type { CmcResponseData, FinnhubQuote, StockQuote } from "./types";

/**
 * Fetches a single stock quote from Finnhub. On failure it logs and returns a
 * zeroed quote so a single bad ticker never rejects the whole `Promise.all`.
 */
export async function fetchStockPrice(ticker: string): Promise<StockQuote> {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${config.stocksApiKey}`,
    );

    if (!res.ok) {
      throw new Error(`Finnhub responded with status ${res.status}`);
    }

    const data = (await res.json()) as FinnhubQuote;

    return {
      ticker,
      price: data.c,
      percentChange24h: data.dp,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error(`Error fetching data for ticker ${ticker}:`, message);
    return { ticker, price: 0, percentChange24h: 0 };
  }
}

/** Fetches the latest quotes for the configured crypto symbols from CMC. */
export async function fetchFromCMCApi(): Promise<CmcResponseData | null> {
  try {
    const res = await axios.get<{ data: CmcResponseData }>(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${CRYPTO_SYMBOLS.join(",")}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": config.cmcApiKey,
        },
      },
    );

    return res.data.data;
  } catch (e) {
    console.error(e);
    return null;
  }
}
