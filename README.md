# Himla

Swedish weather app. Single-page React client that fetches forecasts from the public [Open-Meteo](https://open-meteo.com/) API (no API key).

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build |
| `npm run lint` | ESLint |
| `npm run test` | Vitest, once |
| `npm run test:watch` | Vitest, watch mode |

## Stack

Vite, React, TypeScript, Tailwind CSS. Weather icons are animated [Meteocons](https://bas.dev/work/meteocons) in `public/meteocons/`.

Last searched locations are stored in `localStorage` under `himla-recent-locations` (max 5). Default location is Stockholm.
