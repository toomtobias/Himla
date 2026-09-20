import type {
  CurrentWeather,
  HourlyForecast,
  WeatherData,
} from "@/lib/weather";

const MET_UA = "Himla/1.0 (swedish weather app; github.com/tobiastoom/himla)";

type MetDetails = Record<string, number | undefined>;

interface MetPeriod {
  summary?: { symbol_code?: string };
  details?: MetDetails;
}

interface MetTimeseriesEntry {
  time: string;
  data: {
    instant?: { details?: MetDetails };
    next_1_hours?: MetPeriod;
    next_6_hours?: MetPeriod;
  };
}

export interface MetLocationForecast {
  timeseries: MetTimeseriesEntry[];
}

export interface MetNowcast {
  radarCoverage: string;
  timeseries: MetTimeseriesEntry[];
}

const SYMBOL_SUFFIX = /_(day|night|polarday)$/;

const SYMBOL_TO_WMO: Record<string, number> = {
  clearsky: 0,
  fair: 1,
  partlycloudy: 2,
  cloudy: 3,
  fog: 45,
  lightrain: 61,
  rain: 63,
  heavyrain: 65,
  lightrainshowers: 80,
  rainshowers: 81,
  heavyrainshowers: 82,
  lightsleet: 68,
  sleet: 68,
  heavysleet: 69,
  lightsleetshowers: 80,
  sleetshowers: 81,
  heavysleetshowers: 82,
  lightsnow: 71,
  snow: 73,
  heavysnow: 75,
  lightsnowshowers: 85,
  snowshowers: 86,
  heavysnowshowers: 86,
  lightrainandthunder: 95,
  rainandthunder: 95,
  heavyrainandthunder: 95,
  lightrainshowersandthunder: 95,
  rainshowersandthunder: 95,
  heavyrainshowersandthunder: 95,
  lightsleetandthunder: 95,
  sleetandthunder: 95,
  heavysleetandthunder: 95,
  lightsleetshowersandthunder: 95,
  sleetshowersandthunder: 95,
  heavysleetshowersandthunder: 95,
  lightsnowandthunder: 95,
  snowandthunder: 95,
  heavysnowandthunder: 95,
  lightsnowshowersandthunder: 95,
  snowshowersandthunder: 95,
  heavysnowshowersandthunder: 95,
};

export function truncateCoord(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function metApiRoot(): string {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "/api/met";
  }
  return "https://api.met.no";
}

export function metSymbolToWmo(symbol?: string): number | null {
  if (!symbol) return null;
  const key = symbol
    .replace(SYMBOL_SUFFIX, "")
    .replace("lightssleet", "lightsleet")
    .replace("lightssnow", "lightsnow");
  return SYMBOL_TO_WMO[key] ?? null;
}

export function utcIsoToLocalHour(iso: string, timezone: string): string {
  const date = new Date(iso);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:00`;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function roundTenths(value: number): number {
  return Math.round(value * 10) / 10;
}

function weatherCodeFromMet(entry: MetTimeseriesEntry): number | null {
  const period = entry.data.next_1_hours ?? entry.data.next_6_hours;
  let code = metSymbolToWmo(period?.summary?.symbol_code);
  const thunder = asNumber(entry.data.next_1_hours?.details?.probability_of_thunder);
  if (thunder != null && thunder >= 20) code = 95;
  const fog = asNumber(entry.data.instant?.details?.fog_area_fraction);
  const precip = asNumber(entry.data.next_1_hours?.details?.precipitation_amount) ?? 0;
  if (fog != null && fog >= 40 && precip <= 0 && (code == null || code <= 3)) {
    code = 45;
  }
  return code;
}

async function fetchMetJson(path: string): Promise<unknown | null> {
  try {
    const headers: HeadersInit = {};
    if (typeof window === "undefined") {
      headers["User-Agent"] = MET_UA;
    }
    const res = await fetch(`${metApiRoot()}${path}`, { headers });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function readTimeseries(payload: unknown): MetTimeseriesEntry[] {
  const series = (payload as { properties?: { timeseries?: MetTimeseriesEntry[] } })
    ?.properties?.timeseries;
  return Array.isArray(series) ? series : [];
}

export async function fetchMetForecast(lat: number, lon: number): Promise<MetLocationForecast | null> {
  const data = await fetchMetJson(
    `/weatherapi/locationforecast/2.0/complete?lat=${truncateCoord(lat)}&lon=${truncateCoord(lon)}`,
  );
  const timeseries = readTimeseries(data);
  if (!timeseries.length) return null;
  return { timeseries };
}

export async function fetchMetNowcast(lat: number, lon: number): Promise<MetNowcast | null> {
  const data = await fetchMetJson(
    `/weatherapi/nowcast/2.0/complete?lat=${truncateCoord(lat)}&lon=${truncateCoord(lon)}`,
  );
  const timeseries = readTimeseries(data);
  if (!timeseries.length) return null;
  const radarCoverage =
    (data as { properties?: { meta?: { radar_coverage?: string } } })?.properties?.meta
      ?.radar_coverage ?? "";
  return { radarCoverage, timeseries };
}

function overlayHour(hour: HourlyForecast, entry: MetTimeseriesEntry): HourlyForecast {
  const instant = entry.data.instant?.details ?? {};
  const next = entry.data.next_1_hours?.details ?? {};
  const temperature = asNumber(instant.air_temperature);
  const humidity = asNumber(instant.relative_humidity);
  const windSpeed = asNumber(instant.wind_speed);
  const windGusts = asNumber(instant.wind_speed_of_gust);
  const windDirection = asNumber(instant.wind_from_direction);
  const cloudCover = asNumber(instant.cloud_area_fraction);
  const precipitation = asNumber(next.precipitation_amount);
  const pop = asNumber(next.probability_of_precipitation);
  const weatherCode = weatherCodeFromMet(entry);

  return {
    ...hour,
    temperature: temperature == null ? hour.temperature : Math.round(temperature),
    humidity: humidity == null ? hour.humidity : Math.round(humidity),
    windSpeed: windSpeed == null ? hour.windSpeed : Math.round(windSpeed),
    windGusts: windGusts == null ? hour.windGusts : Math.round(windGusts),
    windDirection: windDirection == null ? hour.windDirection : windDirection,
    cloudCover: cloudCover == null ? hour.cloudCover : Math.round(cloudCover),
    precipitation: precipitation == null ? hour.precipitation : roundTenths(precipitation),
    precipitationProbability: pop == null ? hour.precipitationProbability : Math.round(pop),
    weatherCode: weatherCode == null ? hour.weatherCode : weatherCode,
  };
}

function overlayCurrent(
  current: CurrentWeather,
  entry: MetTimeseriesEntry | undefined,
  nowcast: MetNowcast | null,
): CurrentWeather {
  if (!entry) return current;
  const instant = entry.data.instant?.details ?? {};
  const next = entry.data.next_1_hours?.details ?? {};
  const temperature = asNumber(instant.air_temperature);
  const feelsLike = asNumber(instant.apparent_air_temperature);
  const humidity = asNumber(instant.relative_humidity);
  const windSpeed = asNumber(instant.wind_speed);
  const windGusts = asNumber(instant.wind_speed_of_gust);
  const windDirection = asNumber(instant.wind_from_direction);
  const pressure = asNumber(instant.air_pressure_at_sea_level);
  const cloudCover = asNumber(instant.cloud_area_fraction);
  const weatherCode = weatherCodeFromMet(entry);

  let precipitation = asNumber(next.precipitation_amount);
  const nowcastHour = nowcast?.timeseries[0];
  const nowcastAmount = asNumber(nowcastHour?.data.next_1_hours?.details?.precipitation_amount);
  const nowcastRate = asNumber(nowcastHour?.data.instant?.details?.precipitation_rate);
  if (nowcast?.radarCoverage === "ok") {
    precipitation = nowcastAmount ?? nowcastRate ?? precipitation;
  }

  return {
    ...current,
    temperature: temperature == null ? current.temperature : Math.round(temperature),
    feelsLike: feelsLike == null ? current.feelsLike : Math.round(feelsLike),
    humidity: humidity == null ? current.humidity : Math.round(humidity),
    windSpeed: windSpeed == null ? current.windSpeed : Math.round(windSpeed),
    windGusts: windGusts == null ? current.windGusts : Math.round(windGusts),
    windDirection: windDirection == null ? current.windDirection : windDirection,
    pressure: pressure == null ? current.pressure : Math.round(pressure),
    cloudCover: cloudCover == null ? current.cloudCover : Math.round(cloudCover),
    precipitation: precipitation == null ? current.precipitation : roundTenths(precipitation),
    weatherCode: weatherCode == null ? current.weatherCode : weatherCode,
  };
}

export function applyMetOverlay(
  weather: WeatherData,
  forecast: MetLocationForecast | null,
  nowcast: MetNowcast | null,
): WeatherData {
  if (!forecast?.timeseries.length) return weather;

  const byHour = new Map<string, MetTimeseriesEntry>();
  for (const entry of forecast.timeseries) {
    if (!entry.data.next_1_hours) continue;
    byHour.set(utcIsoToLocalHour(entry.time, weather.timezone), entry);
  }

  const allHourly = weather.allHourly.map((hour) => {
    const entry = byHour.get(hour.time);
    return entry ? overlayHour(hour, entry) : hour;
  });

  const nowKey = utcIsoToLocalHour(new Date().toISOString(), weather.timezone);
  const currentEntry = byHour.get(nowKey) ?? forecast.timeseries.find((entry) => entry.data.next_1_hours);

  const hourlyStart = weather.allHourly.length
    ? weather.allHourly.findIndex((hour) => hour.time === weather.hourly[0]?.time)
    : 0;
  const start = hourlyStart < 0 ? 0 : hourlyStart;

  return {
    ...weather,
    current: overlayCurrent(weather.current, currentEntry, nowcast),
    allHourly,
    hourly: allHourly.slice(start, start + weather.hourly.length),
  };
}
