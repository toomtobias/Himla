import { describe, it, expect } from "vitest";
import {
  getWindDirection,
  snapWindDegrees,
  getWeatherInfo,
  formatCountry,
  formatLocationLabel,
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
