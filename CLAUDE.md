# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Himla" is a Swedish React weather app that fetches data from the public Open-Meteo API (no API key needed). Uses a glassmorphism visual design. Single-page app with one route (`/`), no backend. All user-facing text is in Swedish.

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

**Data flow:** `useWeather` hook holds the selected `GeoLocation` and calls `fetchWeather()` from `src/lib/weather.ts` on change. On first load, the last searched location is restored from localStorage (falls back to London). `searchLocations()` calls the Open-Meteo geocoding API for city autocomplete. All weather display components are pure/presentational — they receive typed props, except `WeatherIcon` which reads `IconProvider` context to switch icon renderers.

**Key modules:**
- `src/lib/weather.ts` — All types, WMO code-to-label/icon mapping (Swedish labels), wind direction helper (`getWindDirection`), API fetch functions. Wind speed uses m/s (`wind_speed_unit=ms`).
- `src/hooks/useWeather.ts` — Location state + weather data fetching. Manages recent locations in localStorage (key: `himla-recent-locations`, max 5). Exposes `recentLocations` getter and `setLocation` which auto-saves to history.
- `src/pages/Index.tsx` — Composes all weather sections; no day selection state, simple pass-through of data. Shows `WeatherSkeleton` during loading.
- `src/contexts/IconProvider.tsx` — React context providing `iconStyle` (`"lucide" | "meteocons"`) and `toggleIconStyle`. Persisted in localStorage (key: `himla-icon-style`). Wraps the app in `App.tsx`.
- `src/components/Header.tsx` — "Himla" + location with pin icon + local day/time (using timezone from API) + icon style toggle + search icon that toggles a glass-card search field. When search opens with no query, shows recent locations with clock icons. Search results overlay content (absolute positioned). Click outside closes search.
- `src/components/CurrentWeatherCard.tsx` — Current temperature, weather icon with tooltip, condition label, feels-like
- `src/components/WeatherIcon.tsx` — Routes to either Lucide icons or MeteoconIcon based on `IconProvider` context. Lucide path maps WMO icon name strings to Lucide components with `nightMap` for Sun→Moon swaps. Supports `isNight` and `tooltip` props.
- `src/components/MeteoconIcon.tsx` — Renders animated Meteocons SVGs from `public/meteocons/`. Maps WMO icon name strings to meteocon filenames with explicit day/night variants. Applies a 4x scale multiplier and drop-shadow.
- `src/components/WeatherSkeleton.tsx` — Skeleton loading state matching the full page layout
- `src/components/` — Other weather UI components (HourlyForecast, DailyForecast, WeatherDetails, SunCard)
- `src/components/ui/` — Full shadcn/ui component library (most are scaffold, not actively used)

**Simplified layout:** Hourly forecast always shows the next 24 hours from now (`weather.hourly`) with night icons based on sunrise/sunset and per-hour precipitation probability. The 7-day forecast is static/non-interactive. Detail cards (humidity, wind with direction, UV index with 0–11 scale, pressure, cloud cover, rain) and sun card always show current real-time data.

**WMO icon mapping:** Weather codes map through two layers: `WMO_CODES` in `weather.ts` produces an icon name string, then `WeatherIcon.tsx` delegates to either Lucide (via `iconMap`/`nightMap`) or `MeteoconIcon` (via `meteoconMap` with day/night filenames) depending on the `IconProvider` context. Meteocon SVGs live in `public/meteocons/` (44 animated SVGs).

## Conventions

- **Language:** All user-facing text must be in Swedish
- **Units:** Temperature in °C, wind in m/s with Swedish compass directions (N, NO, Ö, SO, S, SV, V, NV), pressure in hPa, precipitation in mm, UV index with one decimal
- **Path alias:** Always use `@/` imports (maps to `src/`), not relative paths
- **Styling:** Tailwind CSS with custom glassmorphism utility classes (`.glass-card`, `.glass-card-hover`, `.sky-gradient`) defined in `src/index.css` under `@layer components`. Light/dark themes via CSS custom properties on `:root` / `.dark`
- **Class merging:** Use the `cn()` helper from `@/lib/utils` (clsx + tailwind-merge)
- **TypeScript:** Strict mode is off (`noImplicitAny: false`). The codebase uses `any` in API response mapping
- **Storage:** localStorage key `himla-recent-locations` stores last 5 searched locations as JSON array of `GeoLocation`. Key `himla-icon-style` stores icon style preference (`"lucide"` or `"meteocons"`)
- **Tests:** Vitest + Testing Library + jsdom. Place tests as `src/**/*.{test,spec}.{ts,tsx}`. Setup file at `src/test/setup.ts` stubs `window.matchMedia`
