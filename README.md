# tg-gunya-bot

Telegram bot that posts daily crypto and stock prices to a channel.

- **Crypto** — every day at 09:00 (Europe/Chisinau), prices from CoinMarketCap.
- **Stocks** — weekdays at 16:35 (Europe/Chisinau), prices from Finnhub.

Built with TypeScript, run on [Railway](https://railway.com).

## Requirements

- Node.js >= 24
- pnpm (pinned via the `packageManager` field; Railway provisions it automatically)

## Setup

```bash
pnpm install
cp .env.example .env   # then fill in real values
```

### Environment variables

All four are required — the bot throws on startup if any is missing (see `src/config.ts`).

| Variable         | Description                          |
| ---------------- | ------------------------------------ |
| `BOT_TOKEN`      | Telegram bot token (from @BotFather) |
| `CHAT_ID`        | Target chat/channel id               |
| `API_KEY_CMC`    | CoinMarketCap API key                |
| `API_KEY_STOCKS` | Finnhub API key                      |

## Scripts

| Command          | Description                            |
| ---------------- | -------------------------------------- |
| `pnpm dev`       | Run in watch mode with `tsx`           |
| `pnpm build`     | Compile TypeScript to `dist/`          |
| `pnpm start`     | Run the compiled output (`node dist/`) |
| `pnpm typecheck` | Type-check without emitting            |
| `pnpm lint`      | Lint with ESLint (type-checked rules)  |
| `pnpm format`    | Format with Prettier                   |

## Deployment (Railway)

Pushing to `main` triggers a deploy. The build is pinned in `nixpacks.toml`:

1. `pnpm install --frozen-lockfile --prod=false`
2. `pnpm build`
3. `pnpm start`

Set the four environment variables in the Railway dashboard before the first deploy.

## Project structure

```
src/
  index.ts      # bot wiring, cron schedules, graceful shutdown
  api.ts        # CoinMarketCap + Finnhub fetchers
  utils.ts      # message formatting helpers
  constants.ts  # symbols and social links
  config.ts     # validated environment config
  types.ts      # shared API and domain types
```
