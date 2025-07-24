require("dotenv").config();
const axios = require("axios");
const { CRYPTO_SYMBOLS } = require("./constants");

const API_KEY_GIF = process.env.API_KEY_GIF;
const API_KEY_CMC = process.env.API_KEY_CMC;
const API_KEY_STOCKS = process.env.API_KEY_STOCKS;

async function fetchStockPrice(ticker) {
  try {
    const res = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${ticker}&token=${API_KEY_STOCKS}`,
    );

    const data = await res.json();

    return {
      ticker,
      price: data.c,
      percentChange24h: data.dp,
    };
  } catch (e) {
    console.error(`Error fetching data for ID ${id}:`, error.message);
  }
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

module.exports = {
  fetchGifs,
  fetchFromCMCApi,
  fetchStockPrice,
};
