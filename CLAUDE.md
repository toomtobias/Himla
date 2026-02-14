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

**Data flow:** `useWeather` hook holds the selected `GeoLocation` (defaults to London) and calls `fetchWeather()` from `src/lib/weather.ts` on change. `searchLocations()` calls the Open-Meteo geocoding API for city autocomplete. All weather display components are pure/presentational — they receive typed props, no context or global state.

**Key modules:**
- `src/lib/weather.ts` — All types (`GeoLocation`, `CurrentWeather`, `HourlyForecast`, `DailyForecast`, `WeatherData`), WMO code-to-label/icon mapping (Swedish labels), API fetch functions
- `src/hooks/useWeather.ts` — Location state + weather data fetching (uses plain `useEffect`/`useState`, not React Query despite `QueryClientProvider` being wired up)
- `src/pages/Index.tsx` — Composes all weather sections; no day selection state, simple pass-through of data
- `src/components/Header.tsx` — App name "Himla" + inline search bar with debounced geocoding autocomplete
- `src/components/CurrentWeatherCard.tsx` — Location display (pin + city, country) and current temperature/conditions
- `src/components/` — Other weather UI components (HourlyForecast, DailyForecast, WeatherDetails, SunCard, WeatherIcon)
- `src/components/ui/` — Full shadcn/ui component library (most are scaffold, not actively used)

**Simplified layout:** Hourly forecast always shows the next 24 hours from now (`weather.hourly`). The 7-day forecast is static/non-interactive. Detail cards (humidity, wind, UV, pressure, cloud cover, rain) and sun card always show current-day data.

**WMO icon mapping:** Weather codes map through two layers: `WMO_CODES` in `weather.ts` produces an icon name string, then `WeatherIcon.tsx` resolves it to a Lucide React component via its `iconMap`.

## Conventions

- **Language:** All user-facing text must be in Swedish
- **Path alias:** Always use `@/` imports (maps to `src/`), not relative paths
- **Styling:** Tailwind CSS with custom glassmorphism utility classes (`.glass-card`, `.glass-card-hover`, `.sky-gradient`) defined in `src/index.css` under `@layer components`. Light/dark themes via CSS custom properties on `:root` / `.dark`
- **Class merging:** Use the `cn()` helper from `@/lib/utils` (clsx + tailwind-merge)
- **TypeScript:** Strict mode is off (`noImplicitAny: false`). The codebase uses `any` in API response mapping
- **Tests:** Vitest + Testing Library + jsdom. Place tests as `src/**/*.{test,spec}.{ts,tsx}`. Setup file at `src/test/setup.ts` stubs `window.matchMedia`
