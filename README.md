# Himla

Swedish weather app. Near-term forecast from [MET Norway](https://api.met.no/) (locationforecast + nowcast), with UV, sun times, air quality and the longer horizon from the public [Open-Meteo](https://open-meteo.com/) API.

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

Vite, React, TypeScript, Tailwind CSS.

Last searched locations are stored in `localStorage` under `himla-recent-locations` (max 5). Default location is Stockholm.
