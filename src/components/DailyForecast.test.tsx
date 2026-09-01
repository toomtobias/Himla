import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import DailyForecast from "@/components/DailyForecast";
import type { DailyForecast as DailyType, HourlyForecast as HourlyType } from "@/lib/weather";

function daily(date: string, i: number): DailyType {
  return {
    date,
    tempMax: 18 - i,
    tempMin: 10 - i,
    weatherCode: 2,
    precipitationProbability: 10,
    precipitationSum: 0,
    windSpeedMax: 4,
    windGustsMax: 8,
    windDirectionDominant: 225,
    uvIndexMax: 3,
  };
}

function hour(date: string, h: number, overrides: Partial<HourlyType> = {}): HourlyType {
  return {
    time: `${date}T${String(h).padStart(2, "0")}:00`,
    temperature: 10 + Math.floor(h / 6),
    weatherCode: 2,
    humidity: 50,
    uvIndex: 3,
    windSpeed: 4,
    windGusts: 7,
    windDirection: 90,
    cloudCover: 20,
    precipitationProbability: 0,
    precipitation: 0,
    ...overrides,
  };
}

describe("DailyForecast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T12:32:00+02:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders a week grid with four day-parts and rain as millimetres", () => {
    const days = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06", "2026-09-07"].map(
      (d, i) => daily(d, i),
    );
    const allHourly = days.flatMap((d) =>
      Array.from({ length: 24 }, (_, h) =>
        hour(d.date, h, d.date === "2026-09-01" && h === 15 ? { precipitation: 2.4 } : {}),
      ),
    );

    render(
      <DailyForecast daily={days} allHourly={allHourly} timezone="Europe/Stockholm" />,
    );

    expect(screen.getAllByText("VECKAN").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Natt").length).toBeGreaterThan(0);
    expect(screen.getByText("Förmiddag")).toBeInTheDocument();
    expect(screen.getByText("Eftermiddag")).toBeInTheDocument();
    expect(screen.getAllByText("FM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("EM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kväll").length).toBeGreaterThan(0);
    expect(screen.getAllByText("IDAG").length).toBeGreaterThan(0);
    expect(screen.getAllByText("NU").length).toBeGreaterThan(0);
    expect(screen.getAllByText("2,4 mm").length).toBeGreaterThan(0);
  });
});
