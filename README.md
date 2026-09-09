# Bet Builder Tracker

A Vite + React starter dashboard for tracking multi-game bet builders.

## Run
1. Install Node.js 18+.
2. `npm install`
3. `npm run dev`
4. Open the local URL Vite prints.

## Included
- Dashboard KPI cards
- Monthly P/L visualisation
- Bet history with search/filter
- Add-bet screen
- Screenshot upload demo hook
- Analytics by bookmaker and builder size
- Bankroll calculation

The screenshot scanner is deliberately a front-end demo hook: connect an OCR/vision backend before treating extracted slip data as production data.

## New in this version
- Client-side Tesseract.js screenshot OCR workflow
- Extracted text review panel
- Editable multi-game/multi-market selection legs
- Bet-history cumulative P/L graph with win/loss colours
- PWA manifest + service worker + installable app shell
