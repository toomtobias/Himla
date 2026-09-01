import { describe, it, expect } from "vitest";
import {
  getWindDirection,
  snapWindDegrees,
  getWeatherInfo,
  formatCountry,
  formatLocationLabel,
  getUvInfo,
  getAqiInfo,
  summarizePollen,
  getTimeOfDayFraction,
  formatRelativeToNow,
  getPosterCopy,
  formatMm,
  aggregateDayParts,
  precipFillPercent,
} from "@/lib/weather";

describe("getWindDirection", () => {
  it("maps degrees to Swedish compass points", () => {
    expect(getWindDirection(0)).toBe("N");
    expect(getWindDirection(45)).toBe("NO");
    expect(getWindDirection(90)).toBe("Ö");
    expect(getWindDirection(180)).toBe("S");
    expect(getWindDirection(270)).toBe("V");
    expect(getWindDirection(360)).toBe("N");
  });
});

describe("snapWindDegrees", () => {
  it("snaps to the nearest 45° compass step", () => {
    expect(snapWindDegrees(20)).toBe(0);
    expect(snapWindDegrees(50)).toBe(45);
    expect(snapWindDegrees(350)).toBe(0);
  });
});

describe("getWeatherInfo", () => {
  it("returns Swedish labels for known WMO codes", () => {
    expect(getWeatherInfo(0).label).toBe("Klart");
    expect(getWeatherInfo(63).label).toBe("Regn");
    expect(getWeatherInfo(95).label).toBe("Åska");
  });

  it("falls back for unknown codes", () => {
    expect(getWeatherInfo(999)).toEqual({ label: "Okänt", icon: "Cloud" });
  });
});

describe("formatCountry", () => {
  it("uses Swedish region names from country codes", () => {
    expect(formatCountry("Sweden", "SE")).toBe("Sverige");
    expect(formatCountry("Germany", "DE")).toBe("Tyskland");
    expect(formatCountry("United Kingdom", "GB")).toBe("Storbritannien");
  });

  it("maps stored English country names without a code", () => {
    expect(formatCountry("Sweden")).toBe("Sverige");
    expect(formatCountry("Norway")).toBe("Norge");
  });

  it("leaves already-Swedish names unchanged", () => {
    expect(formatCountry("Sverige")).toBe("Sverige");
  });
});

describe("formatLocationLabel", () => {
  it("includes region and Swedish country", () => {
    expect(
      formatLocationLabel({
        name: "Stockholm",
        admin1: "Stockholms län",
        country: "Sweden",
        countryCode: "SE",
      }),
    ).toBe("Stockholm - Stockholms län, Sverige");
  });
});

describe("getUvInfo", () => {
  it("uses WHO-style Swedish bands", () => {
    expect(getUvInfo(0).label).toBe("Låg");
    expect(getUvInfo(2.9).label).toBe("Låg");
    expect(getUvInfo(3).label).toBe("Måttlig");
    expect(getUvInfo(6).label).toBe("Hög");
    expect(getUvInfo(8).label).toBe("Mycket hög");
    expect(getUvInfo(11).label).toBe("Extrem");
  });
});

describe("getAqiInfo", () => {
  it("uses European AQI bands in Swedish", () => {
    expect(getAqiInfo(20).label).toBe("Bra");
    expect(getAqiInfo(35).label).toBe("Acceptabel");
    expect(getAqiInfo(50).label).toBe("Måttlig");
    expect(getAqiInfo(90).label).toBe("Mycket dålig");
    expect(getAqiInfo(120).label).toBe("Extremt dålig");
  });
});

describe("summarizePollen", () => {
  it("hides trace amounts", () => {
    expect(summarizePollen({ grass: 0.3, birch: 0 })).toBeNull();
  });

  it("picks the highest species", () => {
    expect(summarizePollen({ grass: 40, birch: 5 })).toEqual({
      type: "Gräs",
      level: "Hög",
    });
  });
});

describe("getTimeOfDayFraction", () => {
  it("maps midnight, noon and evening across a 24h day", () => {
    expect(getTimeOfDayFraction(new Date(2026, 7, 30, 0, 0, 0, 0))).toBe(0);
    expect(getTimeOfDayFraction(new Date(2026, 7, 30, 12, 0, 0, 0))).toBe(0.5);
    expect(getTimeOfDayFraction(new Date(2026, 7, 30, 18, 0, 0, 0))).toBe(0.75);
  });
});

describe("formatRelativeToNow", () => {
  const now = new Date(2026, 7, 30, 12, 0, 0);

  it("describes future and past events in Swedish", () => {
    expect(formatRelativeToNow(new Date(2026, 7, 30, 15, 20, 0), now)).toBe("om 3 tim 20 min");
    expect(formatRelativeToNow(new Date(2026, 7, 30, 9, 0, 0), now)).toBe("för 3 tim sedan");
    expect(formatRelativeToNow(new Date(2026, 7, 30, 12, 0, 20), now)).toBe("nu");
  });
});

describe("getPosterCopy", () => {
  it("pairs the WMO label with a poster line", () => {
    expect(getPosterCopy(2)).toEqual({ line1: "Halvklart", line2: "Ingen brådska." });
    expect(getPosterCopy(0, true)).toEqual({ line1: "Klart", line2: "Stjärnor." });
  });
});

describe("formatMm", () => {
  it("uses a Swedish decimal comma and drops trailing zeros", () => {
    expect(formatMm(0)).toBe("0 mm");
    expect(formatMm(1.2)).toBe("1,2 mm");
    expect(formatMm(3)).toBe("3 mm");
  });
});

describe("aggregateDayParts", () => {
  it("pins temperature to 03/09/15/21 and sums precipitation", () => {
    const hours = [3, 9, 15, 21].map((h, i) => ({
      time: `2026-09-01T${String(h).padStart(2, "0")}:00`,
      temperature: 10 + i,
      weatherCode: 2,
      humidity: 50,
      uvIndex: 1,
      windSpeed: 2,
      windGusts: 3,
      windDirection: 0,
      cloudCover: 10,
      precipitationProbability: 0,
      precipitation: i === 2 ? 2.4 : 0,
    }));
    const parts = aggregateDayParts(hours);
    expect(parts.map((p) => p.temp)).toEqual([10, 11, 12, 13]);
    expect(parts[2].precip).toBe(2.4);
    expect(parts[0].precip).toBe(0);
  });
});

describe("precipFillPercent", () => {
  it("is silent when dry and capped when wet", () => {
    expect(precipFillPercent(0)).toBe(0);
    expect(precipFillPercent(8)).toBe(90);
    expect(precipFillPercent(0.2)).toBe(16);
  });
});
