import { describe, it, expect, vi, afterEach } from "vitest";
import {
  applyMetOverlay,
  metSymbolToWmo,
  truncateCoord,
  utcIsoToLocalHour,
  type MetLocationForecast,
} from "@/lib/met";
import type { WeatherData } from "@/lib/weather";

describe("metSymbolToWmo", () => {
  it("strips day/night suffixes and maps MET symbols", () => {
    expect(metSymbolToWmo("clearsky_day")).toBe(0);
    expect(metSymbolToWmo("partlycloudy_night")).toBe(2);
    expect(metSymbolToWmo("cloudy")).toBe(3);
    expect(metSymbolToWmo("lightrainshowers_day")).toBe(80);
    expect(metSymbolToWmo("heavyrainandthunder")).toBe(95);
    expect(metSymbolToWmo("lightsnow")).toBe(71);
    expect(metSymbolToWmo("fog")).toBe(45);
  });

  it("accepts MET typo variants for sleet/snow showers with thunder", () => {
    expect(metSymbolToWmo("lightssleetshowersandthunder_day")).toBe(95);
    expect(metSymbolToWmo("lightssnowshowersandthunder")).toBe(95);
  });
});

describe("truncateCoord", () => {
  it("keeps four decimals as required by MET", () => {
    expect(truncateCoord(59.3293231)).toBe(59.3293);
    expect(truncateCoord(18.0686)).toBe(18.0686);
  });
});

describe("utcIsoToLocalHour", () => {
  it("formats a UTC instant as the location-local hour key", () => {
    expect(utcIsoToLocalHour("2026-09-20T06:00:00Z", "Europe/Stockholm")).toBe(
      "2026-09-20T08:00",
    );
  });
});

function sampleWeather(): WeatherData {
  const hours = ["2026-09-20T08:00", "2026-09-20T09:00", "2026-09-21T12:00"].map(
    (time, i) => ({
      time,
      temperature: 10 + i,
      weatherCode: 0,
      humidity: 40,
      uvIndex: 2.4,
      windSpeed: 2,
      windGusts: 3,
      windDirection: 90,
      cloudCover: 10,
      precipitationProbability: 90,
      precipitation: 0,
    }),
  );
  return {
    location: { name: "Stockholm", country: "Sverige", latitude: 59.33, longitude: 18.07 },
    current: {
      temperature: 10,
      feelsLike: 9,
      humidity: 40,
      windSpeed: 2,
      windDirection: 90,
      windGusts: 3,
      weatherCode: 0,
      uvIndex: 1.2,
      pressure: 1010,
      cloudCover: 10,
      precipitation: 0,
    },
    allHourly: hours,
    hourly: hours.slice(0, 2),
    daily: [
      {
        date: "2026-09-20",
        tempMax: 12,
        tempMin: 8,
        weatherCode: 0,
        precipitationProbability: 90,
        precipitationSum: 0,
        windSpeedMax: 4,
        windGustsMax: 6,
        windDirectionDominant: 90,
        uvIndexMax: 3.1,
      },
    ],
    sunrises: ["2026-09-20T06:30"],
    sunsets: ["2026-09-20T19:00"],
    timezone: "Europe/Stockholm",
    airQuality: { aqi: 20, pm25: 4, pm10: 8, pollen: [] },
  };
}

function metHour(time: string, extra: {
  temp: number;
  symbol: string;
  precip: number;
  pop: number;
  thunder?: number;
  fog?: number;
}): MetLocationForecast["timeseries"][number] {
  return {
    time,
    data: {
      instant: {
        details: {
          air_temperature: extra.temp,
          apparent_air_temperature: extra.temp - 1,
          relative_humidity: 68.3,
          wind_speed: 6.1,
          wind_speed_of_gust: 11.6,
          wind_from_direction: 252,
          air_pressure_at_sea_level: 1001,
          cloud_area_fraction: 99.2,
          fog_area_fraction: extra.fog ?? 0,
        },
      },
      next_1_hours: {
        summary: { symbol_code: extra.symbol },
        details: {
          precipitation_amount: extra.precip,
          probability_of_precipitation: extra.pop,
          probability_of_thunder: extra.thunder ?? 0,
        },
      },
    },
  };
}

describe("applyMetOverlay", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("overlays MET near-term fields but keeps Open-Meteo UV, sun and later hours", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-20T06:10:00.000Z"));

    const weather = sampleWeather();
    const merged = applyMetOverlay(
      weather,
      {
        timeseries: [
          metHour("2026-09-20T06:00:00Z", {
            temp: 13.9,
            symbol: "cloudy",
            precip: 0,
            pop: 0,
          }),
          metHour("2026-09-20T07:00:00Z", {
            temp: 14.2,
            symbol: "lightrain",
            precip: 0.4,
            pop: 22.6,
          }),
        ],
      },
      {
        radarCoverage: "ok",
        timeseries: [
          {
            time: "2026-09-20T06:10:00Z",
            data: {
              instant: { details: { precipitation_rate: 0.2 } },
              next_1_hours: { details: { precipitation_amount: 0.2 } },
            },
          },
        ],
      },
    );

    expect(merged.current.temperature).toBe(14);
    expect(merged.current.feelsLike).toBe(13);
    expect(merged.current.weatherCode).toBe(3);
    expect(merged.current.precipitation).toBe(0.2);
    expect(merged.current.uvIndex).toBe(1.2);
    expect(merged.sunrises).toEqual(weather.sunrises);
    expect(merged.airQuality).toEqual(weather.airQuality);

    expect(merged.allHourly[0].temperature).toBe(14);
    expect(merged.allHourly[0].precipitationProbability).toBe(0);
    expect(merged.allHourly[0].uvIndex).toBe(2.4);
    expect(merged.allHourly[1].weatherCode).toBe(61);
    expect(merged.allHourly[1].precipitationProbability).toBe(23);
    expect(merged.allHourly[2].temperature).toBe(12);
    expect(merged.allHourly[2].precipitationProbability).toBe(90);
    expect(merged.hourly).toHaveLength(2);
    expect(merged.hourly[0].time).toBe("2026-09-20T08:00");
  });

  it("promotes thunder probability to the åska weather code", () => {
    const merged = applyMetOverlay(sampleWeather(), {
      timeseries: [
        metHour("2026-09-20T06:00:00Z", {
          temp: 16,
          symbol: "rain",
          precip: 1.2,
          pop: 70,
          thunder: 40,
        }),
      ],
    }, null);
    expect(merged.allHourly[0].weatherCode).toBe(95);
  });

  it("leaves Open-Meteo data unchanged when MET is missing", () => {
    const weather = sampleWeather();
    expect(applyMetOverlay(weather, null, null)).toEqual(weather);
  });
});
