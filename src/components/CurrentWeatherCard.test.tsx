import { describe, it, expect } from "vitest";
import type { ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import type { CurrentWeather } from "@/lib/weather";

const current: CurrentWeather = {
  temperature: 14,
  feelsLike: 12,
  humidity: 60,
  windSpeed: 4,
  windDirection: 90,
  windGusts: 7,
  weatherCode: 0,
  uvIndex: 3,
  pressure: 1012,
  cloudCover: 20,
  precipitation: 0,
};

function renderCard(
  airQuality: ComponentProps<typeof CurrentWeatherCard>["airQuality"],
) {
  render(
    <TooltipProvider>
      <CurrentWeatherCard
        current={current}
        sunrise="2026-08-30T05:30"
        sunset="2026-08-30T20:00"
        timezone="Europe/Stockholm"
        airQuality={airQuality}
      />
    </TooltipProvider>,
  );
}

describe("CurrentWeatherCard", () => {
  it("shows now chips including UV and wind gusts", () => {
    renderCard({ aqi: 35, pollen: null });
    expect(screen.getByText("Klart")).toBeInTheDocument();
    expect(screen.getByText(/4 \(7\) m\/s/)).toBeInTheDocument();
    expect(screen.getByText("0 mm")).toBeInTheDocument();
    expect(screen.getByText("3 · Måttlig")).toBeInTheDocument();
    expect(screen.getByText("35 · Acceptabel")).toBeInTheDocument();
    expect(screen.queryByText("Pollen")).not.toBeInTheDocument();
  });

  it("shows pollen only when it is actually present", () => {
    renderCard({ aqi: 10, pollen: { type: "Gräs", level: "Hög" } });
    expect(screen.getByText("Hög · Gräs")).toBeInTheDocument();
  });
});
