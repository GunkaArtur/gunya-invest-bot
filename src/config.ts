import "dotenv/config";

/**
 * Reads a required environment variable, throwing early at startup if it is
 * missing so the bot never runs in a half-configured state.
 */
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  botToken: required("BOT_TOKEN"),
  chatId: required("CHAT_ID"),
  cmcApiKey: required("API_KEY_CMC"),
  stocksApiKey: required("API_KEY_STOCKS"),
} as const;
