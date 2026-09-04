import { describe, it, expect } from "vitest";
import {
  getWindDirection,
  snapWindDegrees,
  getWeatherInfo,
  formatCountry,
  formatLocationLabel,
  getUvInfo,
  getAqiInfo,
  listPollen,
  listAirSlides,
  getTimeOfDayFraction,
  formatRelativeToNow,
  formatDurationSv,
  getSunNowInfo,
  getPosterCopy,
  formatMm,
  aggregateDayParts,
  formatSlotTemp,
  precipFillPercent,
  hoursForDayPart,
  formatDayPartTitle,
  isHourPast,
  getHourlyStub,
  hourlyStubVisible,
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
  it("uses US AQI bands in Swedish", () => {
    expect(getAqiInfo(20).label).toBe("Bra");
    expect(getAqiInfo(50).label).toBe("Bra");
    expect(getAqiInfo(76).label).toBe("Måttlig");
    expect(getAqiInfo(120).label).toBe("Känsliga grupper");
    expect(getAqiInfo(180).label).toBe("Ohälsosam");
    expect(getAqiInfo(250).label).toBe("Mycket ohälsosam");
    expect(getAqiInfo(320).label).toBe("Farlig");
  });
});

describe("listPollen", () => {
  it("hides trace amounts", () => {
    expect(listPollen({ grass: 0.3, birch: 0 })).toEqual([]);
  });

  it("returns present species, worst first", () => {
    expect(listPollen({ grass: 40, birch: 5 })).toEqual([
      { type: "Gräs", level: "Hög", value: 40 },
      { type: "Björk", level: "Låg", value: 5 },
    ]);
  });
});

describe("listAirSlides", () => {
  it("orders AQI, particles, then pollen and skips missing values", () => {
    expect(
      listAirSlides({
        aqi: 35,
        pm25: 8.2,
        pm10: null,
        pollen: [{ type: "Gräs", level: "Hög", value: 40 }],
      }),
    ).toEqual([
      { kind: "aqi", aqi: 35 },
      { kind: "pm25", value: 8.2 },
      { kind: "pollen", type: "Gräs", level: "Hög", value: 40 },
    ]);
  });

  it("is empty without air data", () => {
    expect(listAirSlides(null)).toEqual([]);
    expect(listAirSlides({ aqi: null, pm25: null, pm10: null, pollen: [] })).toEqual([]);
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

describe("formatDurationSv", () => {
  it("drops zero minutes and keeps compact Swedish units", () => {
    expect(formatDurationSv(8 * 3600000)).toBe("8 tim");
    expect(formatDurationSv(14 * 3600000 + 30 * 60000)).toBe("14 tim 30 min");
    expect(formatDurationSv(12 * 60000)).toBe("12 min");
    expect(formatDurationSv(60000)).toBe("1 min");
  });
});

describe("getSunNowInfo", () => {
  const sunrise = "2026-08-30T05:30";
  const sunset = "2026-08-30T20:00";

  it("counts down to sunset during the day", () => {
    expect(
      getSunNowInfo({
        sunrise,
        sunset,
        now: new Date(2026, 7, 30, 12, 0, 0),
      }),
    ).toEqual({
      isNight: false,
      countdown: "Solen går ner om 8 tim",
    });
  });

  it("counts down to sunrise before dawn", () => {
    const info = getSunNowInfo({
      sunrise,
      sunset,
      now: new Date(2026, 7, 30, 4, 0, 0),
    });
    expect(info.isNight).toBe(true);
    expect(info.countdown).toBe("Solen går upp om 1 tim 30 min");
  });

  it("points at the next sunrise after sunset", () => {
    const info = getSunNowInfo({
      sunrise,
      sunset,
      nextSunrise: "2026-08-31T05:32",
      now: new Date(2026, 7, 30, 21, 0, 0),
    });
    expect(info.isNight).toBe(true);
    expect(info.countdown).toBe("Solen går upp om 8 tim 32 min");
  });

  it("handles polar day and polar night", () => {
    expect(
      getSunNowInfo({
        sunrise: "2026-06-15T00:00",
        sunset: "2026-06-16T00:00",
        now: new Date(2026, 5, 15, 12, 0, 0),
      }),
    ).toEqual({
      isNight: false,
      countdown: "Solen går inte ner idag",
    });

    expect(
      getSunNowInfo({
        sunrise: "2025-12-15T00:00",
        sunset: "2025-12-15T00:00",
        now: new Date(2025, 11, 15, 12, 0, 0),
      }),
    ).toEqual({
      isNight: true,
      countdown: "Solen går inte upp idag",
    });
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

describe("formatSlotTemp", () => {
  it("shows a range only when min and max differ", () => {
    expect(formatSlotTemp(null, null)).toBe("—");
    expect(formatSlotTemp(13, 13)).toBe("13°");
    expect(formatSlotTemp(10, 15)).toBe("10–15°");
  });
});

describe("aggregateDayParts", () => {
  it("uses min–max temperature in each slot and sums precipitation", () => {
    const hours = [0, 3, 5, 9, 15, 21].map((h) => ({
      time: `2026-09-01T${String(h).padStart(2, "0")}:00`,
      temperature: h === 0 ? 10 : h === 5 ? 15 : 13,
      weatherCode: 2,
      humidity: 50,
      uvIndex: 1,
      windSpeed: 2,
      windGusts: 3,
      windDirection: 0,
      cloudCover: 10,
      precipitationProbability: 0,
      precipitation: h === 15 ? 2.4 : 0,
    }));
    const parts = aggregateDayParts(hours);
    expect(parts[0].tempMin).toBe(10);
    expect(parts[0].tempMax).toBe(15);
    expect(parts[1].tempMin).toBe(13);
    expect(parts[1].tempMax).toBe(13);
    expect(parts[2].precip).toBe(2.4);
    expect(parts[0].precip).toBe(0);
  });
});

describe("hoursForDayPart", () => {
  it("returns the six hours that belong to a day-part", () => {
    const hours = Array.from({ length: 24 }, (_, h) => ({
      time: `2026-09-04T${String(h).padStart(2, "0")}:00`,
      temperature: h,
      weatherCode: 0,
      humidity: 50,
      uvIndex: 1,
      windSpeed: 2,
      windGusts: 3,
      windDirection: 0,
      cloudCover: 10,
      precipitationProbability: 0,
      precipitation: 0,
    }));
    const morning = hoursForDayPart(hours, "2026-09-04", "formiddag");
    expect(morning.map((h) => h.time.slice(11, 13))).toEqual(["06", "07", "08", "09", "10", "11"]);
  });
});

describe("formatDayPartTitle", () => {
  it("names today, a later weekday, and night towards a calendar day", () => {
    expect(formatDayPartTitle("2026-09-04", "formiddag", "2026-09-04")).toBe("Idag förmiddag");
    expect(formatDayPartTitle("2026-09-04", "eftermiddag", "2026-09-03")).toBe("Fredag eftermiddag");
    expect(formatDayPartTitle("2026-09-05", "natt", "2026-09-04")).toBe("Natt mot lördag");
    expect(formatDayPartTitle("2026-09-04", "natt", "2026-09-04")).toBe("Natt mot idag");
  });
});

describe("isHourPast", () => {
  it("treats earlier hours on today as past", () => {
    expect(isHourPast("2026-09-04T10:00", "2026-09-04", 12)).toBe(true);
    expect(isHourPast("2026-09-04T12:00", "2026-09-04", 12)).toBe(false);
    expect(isHourPast("2026-09-03T23:00", "2026-09-04", 12)).toBe(true);
    expect(isHourPast("2026-09-05T00:00", "2026-09-04", 12)).toBe(false);
  });
});

describe("precipFillPercent", () => {
  it("is silent when dry and scales linearly with millimetres", () => {
    expect(precipFillPercent(0)).toBe(0);
    expect(precipFillPercent(0.2, 8)).toBe(2.25);
    expect(precipFillPercent(1, 8)).toBe(11.25);
    expect(precipFillPercent(2, 8)).toBe(22.5);
    expect(precipFillPercent(4, 8)).toBe(45);
    expect(precipFillPercent(8, 8)).toBe(90);
    expect(precipFillPercent(20, 8)).toBe(90);
  });
});

describe("getHourlyStub", () => {
  it("uses short Swedish sky words", () => {
    expect(getHourlyStub(0)).toBe("Klart");
    expect(getHourlyStub(1)).toBe("Klart");
    expect(getHourlyStub(2)).toBe("Halvklart");
    expect(getHourlyStub(3)).toBe("Mulet");
    expect(getHourlyStub(45)).toBe("Dimma");
    expect(getHourlyStub(51)).toBe("Dugg");
    expect(getHourlyStub(63)).toBe("Regn");
    expect(getHourlyStub(81)).toBe("Regn");
    expect(getHourlyStub(73)).toBe("Snö");
    expect(getHourlyStub(95)).toBe("Åska");
  });
});

describe("hourlyStubVisible", () => {
  it("shows a stub for known sky and precip codes", () => {
    expect(hourlyStubVisible(63)).toBe(true);
    expect(hourlyStubVisible(3)).toBe(true);
    expect(hourlyStubVisible(73)).toBe(true);
    expect(hourlyStubVisible(999)).toBe(false);
  });
});
