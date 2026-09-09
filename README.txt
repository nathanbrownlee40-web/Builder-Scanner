BET TRACKER — ONE BIG NETLIFY-READY BUILD

This is a zero-build static deployment. Upload this folder's contents to Netlify (or drag the ZIP in) — no npm install, Vite build, or server/API is required.

Features:
- Multi-game bet builders: unlimited games, unlimited markets per game.
- Builder screenshot reader with OCR and progress/status handling.
- Value-bet Singles section with its own screenshot reader.
- Singles track stake, odds, implied probability, estimated probability, edge, result, return, profit and ROI.
- Separate Builder and Singles history, charts and analytics.
- Singles breakdowns by market, edge range and sport; builder breakdown by sport.
- Combined dashboard plus separate performance.
- Local browser storage.
- Full JSON export/import backup.
- PWA install support and service worker.

OCR note: Tesseract.js is loaded from jsDelivr on first use. The OCR work runs in the browser. Netlify itself does not process the screenshots.
