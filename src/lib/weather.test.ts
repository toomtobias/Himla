import { describe, it, expect } from "vitest";
import { getWindDirection, snapWindDegrees, getWeatherInfo } from "@/lib/weather";

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
