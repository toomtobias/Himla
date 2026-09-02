import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

    expect(screen.getByText("Kommande timmar")).toBeInTheDocument();
    expect(screen.getByText("00")).toBeInTheDocument();
    expect(screen.getByText("07")).toBeInTheDocument();
    expect(screen.queryByText("08")).not.toBeInTheDocument();
  });

  it("shows a short sky label under dry hours", () => {
    const mixed = hours.map((h, i) =>
      i === 0 ? { ...h, weatherCode: 3 } : i === 1 ? { ...h, weatherCode: 2 } : h,
    );
    render(<HourlyForecast hourly={mixed} />);
    expect(screen.getByText("Mulet")).toBeInTheDocument();
    expect(screen.getByText("Halvklart")).toBeInTheDocument();
  });

  it("shows precipitation amount with probability under it", () => {
    const wet = hours.map((h, i) =>
      i === 1 ? { ...h, weatherCode: 63, precipitation: 1.2, precipitationProbability: 60 } : h,
    );
    render(<HourlyForecast hourly={wet} />);
    expect(screen.getByText("1,2 mm")).toBeInTheDocument();
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("Regn")).toBeInTheDocument();
  });

  it("keeps Snö under a wet snow hour", () => {
    const snow = hours.map((h, i) =>
      i === 0 ? { ...h, weatherCode: 73, precipitation: 1 } : h,
    );
    render(<HourlyForecast hourly={snow} />);
    expect(screen.getByText("Snö")).toBeInTheDocument();
    expect(screen.getByText("1 mm")).toBeInTheDocument();
  });

  it("does not show millimetres when precipitation is zero", () => {
    const dryChance = hours.map((h, i) =>
      i === 1 ? { ...h, precipitation: 0, precipitationProbability: 40 } : h,
    );
    render(<HourlyForecast hourly={dryChance} />);
    expect(screen.queryByText("40%")).not.toBeInTheDocument();
    expect(screen.queryByText(/\d.*mm/)).not.toBeInTheDocument();
  });

  it("cycles the whole strip through wind and UV", () => {
    const mixed = hours.map((h, i) =>
      i === 1
        ? { ...h, weatherCode: 63, precipitation: 1.2, precipitationProbability: 60, windSpeed: 9, windGusts: 12, windDirection: 225, uvIndex: 7.4 }
        : h,
    );
    render(<HourlyForecast hourly={mixed} />);

    const strip = screen.getByRole("button", { name: /kommande timmar, temperatur/i });
    expect(screen.getAllByText("14°").length).toBe(8);
    expect(screen.getByText("1,2 mm")).toBeInTheDocument();

    fireEvent.click(strip);
    expect(screen.getByRole("button", { name: /kommande timmar, vind/i })).toBeInTheDocument();
    expect(screen.getByText("Kommande timmar")).toBeInTheDocument();
    expect(screen.queryByText("14°")).not.toBeInTheDocument();
    expect(screen.queryByText("1,2 mm")).not.toBeInTheDocument();
    expect(screen.getByText("9 m/s")).toBeInTheDocument();
    expect(screen.getByText("SV · byar 12")).toBeInTheDocument();
    expect(screen.getAllByText("4 m/s").length).toBe(7);
    expect(screen.getAllByText("Ö · byar 7").length).toBe(7);

    fireEvent.click(strip);
    expect(screen.getByRole("button", { name: /kommande timmar, uv/i })).toBeInTheDocument();
    expect(screen.queryByText("SV · byar 12")).not.toBeInTheDocument();
    expect(screen.queryByText("9 m/s")).not.toBeInTheDocument();
    expect(screen.getByText("7,4")).toBeInTheDocument();
    expect(screen.getByText("Hög")).toBeInTheDocument();
    expect(screen.getAllByText("Måttlig").length).toBe(7);

    fireEvent.click(strip);
    expect(screen.getByRole("button", { name: /kommande timmar, temperatur/i })).toBeInTheDocument();
    expect(screen.getAllByText("14°").length).toBe(8);
    expect(screen.getByText("1,2 mm")).toBeInTheDocument();
  });
});
