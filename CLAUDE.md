# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Himla" is a Swedish React weather app. Near-term forecast (temperature, wind, precipitation, symbols, rain probability) comes from MET Norway (`api.met.no` locationforecast + nowcast). UV, sunrise/sunset, 14-day hourly backbone, geocoding and air quality come from the public Open-Meteo API (no API key). Poster-like visual design: ink boxes, hard shadows, Space Grotesk. Single-page app with one route (`/`). All user-facing text is in Swedish.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server on port 8080 |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run test` | Run all tests once (Vitest) |
| `npm run test:watch` | Tests in watch mode |
| `npx vitest run src/path/to/file.test.ts` | Run a single test file |
| `npx vitest run -t "pattern"` | Run tests matching a name |

## Architecture

**Data flow:** `useWeather` hook holds the selected `GeoLocation` and calls `fetchWeather()` from `src/lib/weather.ts` on change. On first load, the last searched location is restored from localStorage (falls back to Stockholm). `searchLocations()` calls the Open-Meteo geocoding API for city autocomplete. All weather display components are pure/presentational — they receive typed props.

**Weather merge:** `fetchWeather()` loads Open-Meteo first (skeleton including UV and sun times), then overlays MET Norway on matching local hours that have `next_1_hours` (~55 hours). Nowcast supplies current precipitation when radar coverage is `ok`. If MET fails, the Open-Meteo forecast is shown unchanged. Dev/preview proxy `/api/met` → `api.met.no` adds the required User-Agent; production uses a simple CORS GET to `https://api.met.no`.

**Key modules:**
- `src/lib/weather.ts` — Types, WMO code-to-Swedish-label mapping, wind direction helper (`getWindDirection`), Open-Meteo fetch. Wind speed uses m/s (`wind_speed_unit=ms`). Returns `timezone` from API. Hourly slicing uses location-local time (via `toLocaleString` with timezone) to correctly offset for remote locations.
- `src/lib/met.ts` — MET locationforecast/nowcast client, symbol-to-WMO mapping, overlay onto `WeatherData`.
- `src/hooks/useWeather.ts` — Location state + weather data fetching. Manages recent locations in localStorage (key: `himla-recent-locations`, max 5). Exposes `recentLocations` getter and `setLocation` which auto-saves to history.
- `src/pages/Index.tsx` — Composes header, current weather, hourly forecast and week grid. Shows `WeatherSkeleton` during loading. Selecting a day-part in the week grid filters the hourly row.
- `src/components/Header.tsx` — "Himla" wordmark + location search. When search opens with no query, shows recent locations. Search results overlay content. Click outside closes search.
- `src/components/CurrentWeatherCard.tsx` — Temperature, feels-like, WMO condition label, sun countdown, plus wind/rain/UV/air cards.
- `src/components/HourlyForecast.tsx` — Next 24 hours (or a selected six-hour day-part). Cycles temp / wind / UV. Short WMO stubs (`getHourlyStub`) under each hour.
- `src/components/DailyForecast.tsx` — 7-day grid of four day-parts (natt/morgon/dag/kväll). Current slot stamped `NU`.
- `src/components/WeatherSkeleton.tsx` — Skeleton loading state matching the full page layout

**WMO labels:** Weather codes map to Swedish labels in `WMO_LABELS` (`getWeatherInfo`). Hourly cards use a shorter stub via `getHourlyStub`.

## Conventions

- **Language:** All user-facing text must be in Swedish
- **Units:** Temperature in °C, wind in m/s with Swedish compass directions (N, NO, Ö, SO, S, SV, V, NV), pressure in hPa, precipitation in mm, UV index with one decimal
- **Path alias:** Always use `@/` imports (maps to `src/`), not relative paths
- **Styling:** Tailwind CSS with a `.box` utility in `src/index.css` (3px ink border + hard shadow). Theme colors are CSS custom properties on `:root` (`paper`, `ink`, `brand`, `now`, `rain`, `wind`, `uv`, `tape`, `air`)
- **Class merging:** Use the `cn()` helper from `@/lib/utils` (clsx + tailwind-merge)
- **TypeScript:** Strict mode is off (`noImplicitAny: false`). The codebase uses `any` in API response mapping
- **Storage:** localStorage key `himla-recent-locations` stores last 5 searched locations as JSON array of `GeoLocation`
- **Tests:** Vitest + Testing Library + jsdom. Place tests as `src/**/*.{test,spec}.{ts,tsx}`. Setup file at `src/test/setup.ts` stubs `window.matchMedia`
