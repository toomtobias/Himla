import { useState } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DailyForecast from "@/components/DailyForecast";
import HourlyForecast from "@/components/HourlyForecast";
import {
  formatDayPartTitle,
  hoursForDayPart,
  isSameDayPart,
  type DailyForecast as DailyType,
  type HourlyForecast as HourlyType,
  type SelectedDayPart,
} from "@/lib/weather";

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

  it("shows a temperature range when a day-part spans several degrees", () => {
    const days = [daily("2026-09-01", 0)];
    const allHourly = Array.from({ length: 6 }, (_, h) =>
      hour("2026-09-01", h, { temperature: h === 0 ? 10 : h === 5 ? 15 : 12 }),
    );

    render(
      <DailyForecast daily={days} allHourly={allHourly} timezone="Europe/Stockholm" />,
    );

    expect(screen.getAllByText("10–15°").length).toBeGreaterThan(0);
  });

  it("notifies when a day-part is chosen and marks it as pressed", () => {
    const onSelect = vi.fn();
    const days = ["2026-09-01", "2026-09-02"].map((d, i) => daily(d, i));
    const allHourly = days.flatMap((d) =>
      Array.from({ length: 24 }, (_, h) => hour(d.date, h)),
    );

    const { rerender } = render(
      <DailyForecast
        daily={days}
        allHourly={allHourly}
        timezone="Europe/Stockholm"
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /idag eftermiddag/i })[0]);
    expect(onSelect).toHaveBeenCalledWith({ date: "2026-09-01", partId: "eftermiddag" });

    rerender(
      <DailyForecast
        daily={days}
        allHourly={allHourly}
        timezone="Europe/Stockholm"
        selected={{ date: "2026-09-01", partId: "eftermiddag" }}
        onSelect={onSelect}
      />,
    );

    expect(screen.getAllByRole("button", { name: /idag eftermiddag, vald/i }).length).toBeGreaterThan(0);
    fireEvent.click(screen.getAllByRole("button", { name: /onsdag förmiddag/i })[0]);
    expect(onSelect).toHaveBeenCalledWith({ date: "2026-09-02", partId: "formiddag" });
  });

  it("fills the hourly strip from the chosen day-part and restores upcoming hours on a second click", () => {
    const days = ["2026-09-01", "2026-09-02"].map((d, i) => daily(d, i));
    const allHourly = days.flatMap((d) =>
      Array.from({ length: 24 }, (_, h) =>
        hour(d.date, h, { temperature: d.date === "2026-09-02" && h === 7 ? 21 : 10 }),
      ),
    );
    const upcoming = allHourly.filter((h) => h.time >= "2026-09-01T13:00");

    function Pair() {
      const [selected, setSelected] = useState<SelectedDayPart | null>(null);
      const title = selected
        ? formatDayPartTitle(selected.date, selected.partId, days[0].date)
        : "Kommande timmar";
      const hours = selected
        ? hoursForDayPart(allHourly, selected.date, selected.partId)
        : upcoming;
      return (
        <>
          <HourlyForecast hourly={hours} title={title} />
          <DailyForecast
            daily={days}
            allHourly={allHourly}
            timezone="Europe/Stockholm"
            selected={selected}
            onSelect={(next) =>
              setSelected((current) => (isSameDayPart(current, next) ? null : next))
            }
          />
        </>
      );
    }

    render(<Pair />);
    expect(screen.getByText("Kommande timmar")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
    expect(screen.queryByText("21°")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /onsdag förmiddag/i })[0]);
    expect(screen.getByText("Onsdag förmiddag")).toBeInTheDocument();
    expect(screen.getByText("21°")).toBeInTheDocument();
    expect(screen.getByText("06")).toBeInTheDocument();
    expect(screen.queryByText("13")).not.toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: /onsdag förmiddag, vald/i })[0]);
    expect(screen.getByText("Kommande timmar")).toBeInTheDocument();
    expect(screen.getByText("13")).toBeInTheDocument();
  });
});
