# Tableclub

A colorful, mobile-first board game night for family and friends. Built with Node.js, vanilla JavaScript, CSS illustrations, and server-sent events. No runtime packages, account system, API keys, or paid AI services.

## Run

Requires Node.js 22 or newer (tested with 24.22.1).

```sh
npm start
```

The server listens on `0.0.0.0:3000`. Set `PORT` to choose another port. Use `npm run dev` for server watch mode. No dependency installation or build step is required.

For phones on your home network, open the server computer’s LAN address on port 3000. For friends elsewhere, deploy this Node server behind an HTTPS reverse proxy. Forward `/api/events` without buffering, and allow long-lived SSE connections. The app serves its own assets. It needs one server process; rooms currently live in memory.

## Play

Choose a game and enter a guest name. Create a private online room and share its six-character code, or choose shared-device play. The host can add bots and configure supported house rules before starting. Games enforce their player limits; extra online guests spectate. An active participant leaving returns everyone to the lobby, while the host can also reset a stalled table.

A saved browser session reconnects to the same seat after refreshing. When everyone disconnects, the room is removed after a 60-second reconnect window. Explicitly leaving the last human seat closes it immediately. Server restarts clear all rooms. Guest names and room credentials are saved locally on that browser; there is no cross-device account recovery.

Shared-device turns have a concealed handover screen. This is casual physical privacy on a trusted device, not separate authenticated accounts for people sharing that device. Online private fleets, characters, quiz answers, and drawing words are filtered by the server for each player and spectators.

### Games

- **Ludo:** 2–4; four tokens, six to enter, captures, safe squares, exact home finish, extra turns on six, forfeiture on three consecutive sixes.
- **Pocket Estates:** 2–6; an original, shorter property-trading game. Buy streets, collect rent, trade properties, complete districts to build houses, pay taxes, visit picnic, and avoid bankruptcy. A configurable turn limit ends in a wealth comparison. This is not the complete Monopoly ruleset: no auctions, mortgages, or doubles bonuses.
- **Battleship:** 2; place five ships manually or randomly, then fire in turns. Optional extra shot on a hit.
- **Who’s Who?:** 2; original characters with explicit hair/glasses/hat traits. Ask automatic yes/no questions, eliminate candidates, and make a final guess. Incorrect final guesses lose.
- **Quiz Party:** 2–8; a built-in family-friendly bank of 24 questions, shuffled into 5, 10, or 15-question games. Simultaneous online answers and concealed sequential answers on a shared device.
- **Doodle Club:** 2–8, **online humans only**. Choose a word, draw with touch or mouse, guess in a dedicated box, and score across two drawing turns each. 90 seconds per drawing. No bots or external AI.
- **Four in a Row:** 2; gravity-based placements and horizontal, vertical, or diagonal wins.
- **Reversi:** 2; legal flips, automatic passes, and disc-count scoring.
- **Snakes & Ladders:** 2–6; ladders and snakes with optional exact finish.

All games except Doodle Club have bots. Rules are available in each game. Text chat and emoji reactions are available around every table. There is no voice chat, public matchmaking, or automated text moderation; use rooms with people you know.

## Validate

```sh
npm run check
npm test
```

Tests exercise rule validation, full bot games, private views, drawing scoring, room membership, spectator permissions, session reconnection, and room cleanup. The HTTP integration test binds to an ephemeral loopback port.

Browser smoke checks were also run using Chromium and Playwright: responsive layout, shared-device quiz handover, two-device joining and moves, refresh recovery, chat, drawing strokes, guesses, and artist rotation. Browser checks require Playwright and Chromium separately; the application itself has no browser automation dependency. With the app running on port 3000, use `npm run test:browser`. If Playwright is installed outside this checkout, set `PLAYWRIGHT_MODULE` to its module file; set `CHROMIUM_PATH` to your Chromium executable (default `/usr/bin/chromium`). Screenshots are saved to ignored `test-results/`.

## Structure

- `server.js`: HTTP assets, room lifecycle, authenticated actions, SSE, bot scheduling.
- `games.js`: authoritative game rules, bots, private state projection.
- `public/`: mobile-first interface and original CSS illustrations.
- `test/`: Node rule and HTTP integration tests.

For a public production service, add persistent/shared room storage if running multiple processes, operational rate limiting, and moderation appropriate to the audience. This version is intended for private games on a single server.

## Deploy on Render

This repository includes a `render.yaml` Blueprint for one free Node web service. In Render, create a new Blueprint, connect `Dazzlehugo/webboardgames`, and select the `main` branch. Review the single `tableclub` service and deploy it. Render provides its own HTTPS URL after deployment; no API keys or database setup are needed.

The build command is `npm run check`, the start command is `npm start`, and the health check is `/api/catalog`. The server uses Render's injected `PORT`. Keep this as one service instance because rooms are stored in process memory.

The free plan may sleep when idle and has platform usage limits. A restart, deploy, or sleep clears rooms; waking the app may take time. Choose an always-on plan later if needed. Merely adding this Blueprint does not create a service or deploy the app.
