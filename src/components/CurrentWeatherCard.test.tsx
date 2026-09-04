import { describe, it, expect, vi, afterEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
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
    <CurrentWeatherCard
      current={current}
      sunrise="2026-08-30T05:30"
      sunset="2026-08-30T20:00"
      timezone="Europe/Stockholm"
      airQuality={airQuality}
    />,
  );
}

describe("CurrentWeatherCard", () => {
  it("shows now chips including UV and wind gusts", () => {
    renderCard({ aqi: 35, pm25: null, pm10: null, pollen: [] });
    expect(screen.getByText("Klart")).toBeInTheDocument();
    expect(screen.getByText("14°")).toBeInTheDocument();
    expect(screen.getByText("4 m/s")).toBeInTheDocument();
    expect(screen.getByText(/byar 7/)).toBeInTheDocument();
    expect(screen.getByText("0 mm")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Måttlig")).toBeInTheDocument();
    expect(screen.getByText("AQI 35")).toBeInTheDocument();
    expect(screen.getByText("Bra")).toBeInTheDocument();
    expect(screen.getByText("Luft").closest(".box")).toHaveClass("bg-air");
    expect(screen.queryByRole("button", { name: /luft/i })).not.toBeInTheDocument();
    expect(screen.queryByText("1/1")).not.toBeInTheDocument();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows a sun countdown in the poster and leaves the temp card as day and time", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-30T10:00:00.000Z"));
    renderCard({ aqi: 35, pm25: null, pm10: null, pollen: [] });
    expect(screen.getByText("Solen går ner om 8 tim")).toBeInTheDocument();
    expect(screen.queryByText(/Soluppgång/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Solnedgång/)).not.toBeInTheDocument();
  });

  it("falls back to humidity without air data", () => {
    renderCard(null);
    expect(screen.getByText("60%")).toBeInTheDocument();
    expect(screen.getByText("Fuktighet")).toBeInTheDocument();
    expect(screen.queryByText("AQI")).not.toBeInTheDocument();
  });

  it("cycles AQI, particles and present pollen", () => {
    renderCard({
      aqi: 10,
      pm25: 8.2,
      pm10: 14,
      pollen: [
        { type: "Gräs", level: "Hög", value: 40 },
        { type: "Björk", level: "Låg", value: 5 },
      ],
    });

    const card = screen.getByRole("button", { name: /luft, aqi 10, bra, 1 av 5/i });
    expect(screen.getByText("AQI 10")).toBeInTheDocument();
    expect(screen.getByText("Bra")).toBeInTheDocument();
    expect(screen.getByText("1/5")).toBeInTheDocument();
    expect(screen.queryByText("Gräs")).not.toBeInTheDocument();

    fireEvent.click(card);
    expect(screen.getByRole("button", { name: /luft, pm2\.5 8,2/i })).toBeInTheDocument();
    expect(screen.getByText("8,2")).toBeInTheDocument();
    expect(screen.getByText("PM2.5 · µg/m³")).toBeInTheDocument();
    expect(screen.getByText("2/5")).toBeInTheDocument();

    fireEvent.click(card);
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("PM10 · µg/m³")).toBeInTheDocument();
    expect(screen.getByText("3/5")).toBeInTheDocument();

    fireEvent.click(card);
    expect(screen.getByText("Gräs")).toBeInTheDocument();
    expect(screen.getByText("Pollen · Hög")).toBeInTheDocument();
    expect(screen.getByText("4/5")).toBeInTheDocument();

    fireEvent.click(card);
    expect(screen.getByText("Björk")).toBeInTheDocument();
    expect(screen.getByText("Pollen · Låg")).toBeInTheDocument();
    expect(screen.getByText("5/5")).toBeInTheDocument();

    fireEvent.click(card);
    expect(screen.getByRole("button", { name: /luft, aqi 10, bra, 1 av 5/i })).toBeInTheDocument();
    expect(screen.getByText("AQI 10")).toBeInTheDocument();
  });
});
