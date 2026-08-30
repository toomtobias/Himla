import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
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
const sunrises = ["2026-08-30T05:30"];
const sunsets = ["2026-08-30T20:00"];

describe("HourlyForecast", () => {
  it("shows 12 hours by default and can expand to 24", () => {
    render(
      <TooltipProvider>
        <HourlyForecast hourly={hours} sunrises={sunrises} sunsets={sunsets} />
      </TooltipProvider>,
    );

    expect(screen.getByText("Närmsta 12 timmarna")).toBeInTheDocument();
    expect(screen.queryByText("Nu")).not.toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(13); // header + 12

    fireEvent.click(screen.getByRole("button", { name: "Visa 24 timmar" }));

    expect(screen.getByText("Närmsta 24 timmarna")).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(25);
    expect(screen.getByRole("button", { name: "Visa 12 timmar" })).toBeInTheDocument();
  });

  it("shows precipitation details without requiring a click", () => {
    const wet = hours.map((h, i) =>
      i === 1 ? { ...h, precipitation: 1.2, precipitationProbability: 60 } : h,
    );
    render(
      <TooltipProvider>
        <HourlyForecast hourly={wet} sunrises={sunrises} sunsets={sunsets} />
      </TooltipProvider>,
    );
    expect(screen.getByText("1.2 mm · 60%")).toBeInTheDocument();
  });

  it("does not show probability when precipitation is zero", () => {
    const dryChance = hours.map((h, i) =>
      i === 1 ? { ...h, precipitation: 0, precipitationProbability: 40 } : h,
    );
    render(
      <TooltipProvider>
        <HourlyForecast hourly={dryChance} sunrises={sunrises} sunsets={sunsets} />
      </TooltipProvider>,
    );
    expect(screen.queryByText("40%")).not.toBeInTheDocument();
  });
});
