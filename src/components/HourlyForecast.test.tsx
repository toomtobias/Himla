import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import HourlyForecast from "@/components/HourlyForecast";
import type { HourlyForecast as HourlyType } from "@/lib/weather";

function hour(index: number, overrides: Partial<HourlyType> = {}): HourlyType {
  const h = String(index).padStart(2, "0");
  return {
    time: `2026-08-30T${h}:00`,
    temperature: 14,
    weatherCode: 0,
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

const hours = Array.from({ length: 24 }, (_, i) => hour(i));

describe("HourlyForecast", () => {
  it("shows the next 8 hours", () => {
    render(<HourlyForecast hourly={hours} />);

    expect(screen.getByText("Nästa timmar")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
    expect(screen.getByText("07")).toBeInTheDocument();
    expect(screen.queryByText("08")).not.toBeInTheDocument();
  });

  it("shows precipitation amount without probability", () => {
    const wet = hours.map((h, i) =>
      i === 1 ? { ...h, precipitation: 1.2, precipitationProbability: 60 } : h,
    );
    render(<HourlyForecast hourly={wet} />);
    expect(screen.getByText("1,2 mm")).toBeInTheDocument();
    expect(screen.queryByText(/60%/)).not.toBeInTheDocument();
  });

  it("does not show millimetres when precipitation is zero", () => {
    const dryChance = hours.map((h, i) =>
      i === 1 ? { ...h, precipitation: 0, precipitationProbability: 40 } : h,
    );
    render(<HourlyForecast hourly={dryChance} />);
    expect(screen.queryByText("40%")).not.toBeInTheDocument();
    expect(screen.queryByText(/\d.*mm/)).not.toBeInTheDocument();
  });
});
