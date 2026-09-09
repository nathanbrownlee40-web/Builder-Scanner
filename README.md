# Bet Builder Tracker

A GitHub-ready React/Vite PWA for tracking multi-game, multi-market bet builders.

## Included
- Real image file picker and drag/drop bet-slip scanner
- In-browser Tesseract OCR (no image upload to a server)
- Automatic extraction of bookmaker, stake, return, odds, sport and likely legs
- Editable builder legs: game/fixture, market, selection and odds
- Manual bet entry
- Won / Lost / Pending / Void tracking
- Dashboard KPIs and cumulative profit graph
- Bet History graph, filters, search and quick result editing
- Analytics by bookmaker and builder size
- Browser localStorage persistence
- JSON backup export
- Installable PWA

## Run
```bash
npm install
npm run dev
```

For GitHub Pages, build with `npm run build` and deploy the `dist` folder with a static-hosting workflow.

### Scanner note
OCR can only infer what is visible in the screenshot. Different bookmakers use different layouts, so after scanning, review the extracted legs before saving. The app is designed so every extracted field is editable rather than silently saving incorrect selections.
