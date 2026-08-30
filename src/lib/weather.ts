export interface GeoLocation {
  name: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  weatherCode: number;
  uvIndex: number;
  pressure: number;
  cloudCover: number;
  precipitation: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
  windGusts: number;
  windDirection: number;
  cloudCover: number;
  precipitationProbability: number;
  precipitation: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitationSum: number;
  windSpeedMax: number;
  windGustsMax: number;
  windDirectionDominant: number;
  uvIndexMax: number;
}

export interface PollenSummary {
  type: string;
  level: "Låg" | "Måttlig" | "Hög" | "Mycket hög";
}

export interface AirQuality {
  aqi: number | null;
  pollen: PollenSummary | null;
}

export interface WeatherData {
  location: GeoLocation;
  current: CurrentWeather;
  allHourly: HourlyForecast[];
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  sunrises: string[];
  sunsets: string[];
  timezone: string;
  airQuality: AirQuality | null;
}

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Klart", icon: "Sun" },
  1: { label: "Mestadels klart", icon: "SunMedium" },
  2: { label: "Halvklart", icon: "CloudSun" },
  3: { label: "Mulet", icon: "Cloud" },
  45: { label: "Dimma", icon: "CloudFog" },
  48: { label: "Rimfrost", icon: "CloudFog" },
  51: { label: "Lätt duggregn", icon: "CloudDrizzle" },
  53: { label: "Duggregn", icon: "CloudDrizzle" },
  55: { label: "Kraftigt duggregn", icon: "CloudDrizzle" },
  61: { label: "Lätt regn", icon: "CloudRain" },
  63: { label: "Regn", icon: "CloudRain" },
  65: { label: "Kraftigt regn", icon: "CloudRainWind" },
  71: { label: "Lätt snö", icon: "Snowflake" },
  73: { label: "Snö", icon: "Snowflake" },
  75: { label: "Kraftigt snöfall", icon: "Snowflake" },
  77: { label: "Snökorn", icon: "Snowflake" },
  80: { label: "Lätta skurar", icon: "CloudRain" },
  81: { label: "Skurar", icon: "CloudRain" },
  82: { label: "Kraftiga skurar", icon: "CloudRainWind" },
  85: { label: "Lätta snöbyar", icon: "Snowflake" },
  86: { label: "Kraftiga snöbyar", icon: "Snowflake" },
  95: { label: "Åska", icon: "CloudLightning" },
  96: { label: "Åska med hagel", icon: "CloudLightning" },
  99: { label: "Åska med kraftigt hagel", icon: "CloudLightning" },
};

const WIND_DIRECTIONS = ["N", "NO", "Ö", "SO", "S", "SV", "V", "NV"];

export function getWindDirection(degrees: number): string {
  const index = Math.round(degrees / 45) % 8;
  return WIND_DIRECTIONS[index];
}

export function snapWindDegrees(degrees: number): number {
  return (Math.round(degrees / 45) % 8) * 45;
}

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { label: "Okänt", icon: "Cloud" };
}

const ENGLISH_COUNTRY_SV: Record<string, string> = {
  Sweden: "Sverige",
  Norway: "Norge",
  Denmark: "Danmark",
  Finland: "Finland",
  Iceland: "Island",
  Germany: "Tyskland",
  "United Kingdom": "Storbritannien",
  "United States": "USA",
  France: "Frankrike",
  Spain: "Spanien",
  Italy: "Italien",
  Netherlands: "Nederländerna",
  Switzerland: "Schweiz",
  Austria: "Österrike",
  Belgium: "Belgien",
  Poland: "Polen",
  Ireland: "Irland",
  "Czech Republic": "Tjeckien",
  Czechia: "Tjeckien",
};

const countryDisplay = new Intl.DisplayNames(["sv"], { type: "region" });

export function formatCountry(country: string, countryCode?: string): string {
  if (countryCode) {
    try {
      const name = countryDisplay.of(countryCode.toUpperCase());
      if (name) return name;
    } catch {
      // ignore invalid region codes
    }
  }
  return ENGLISH_COUNTRY_SV[country] ?? country;
}

export function formatLocationLabel(loc: {
  name: string;
  admin1?: string;
  country: string;
  countryCode?: string;
}): string {
  const country = formatCountry(loc.country, loc.countryCode);
  return `${loc.name}${loc.admin1 ? ` - ${loc.admin1}` : ""}, ${country}`;
}

export function getUvInfo(uv: number): { label: string } {
  if (uv < 3) return { label: "Låg" };
  if (uv < 6) return { label: "Måttlig" };
  if (uv < 8) return { label: "Hög" };
  if (uv < 11) return { label: "Mycket hög" };
  return { label: "Extrem" };
}

export function getAqiInfo(aqi: number): { label: string } {
  if (aqi <= 20) return { label: "Bra" };
  if (aqi <= 40) return { label: "Acceptabel" };
  if (aqi <= 60) return { label: "Måttlig" };
  if (aqi <= 80) return { label: "Dålig" };
  if (aqi <= 100) return { label: "Mycket dålig" };
  return { label: "Extremt dålig" };
}

type PollenLevel = PollenSummary["level"];
const POLLEN_RANK: Record<PollenLevel, number> = {
  Låg: 1,
  Måttlig: 2,
  Hög: 3,
  "Mycket hög": 4,
};

export function summarizePollen(values: {
  alder?: number | null;
  birch?: number | null;
  grass?: number | null;
  mugwort?: number | null;
  olive?: number | null;
  ragweed?: number | null;
}): PollenSummary | null {
  const species: { type: string; value: number; bands: [number, number, number] }[] = [
    { type: "Al", value: values.alder ?? 0, bands: [10, 50, 200] },
    { type: "Björk", value: values.birch ?? 0, bands: [10, 50, 200] },
    { type: "Gräs", value: values.grass ?? 0, bands: [10, 30, 80] },
    { type: "Gråbo", value: values.mugwort ?? 0, bands: [10, 30, 100] },
    { type: "Oliv", value: values.olive ?? 0, bands: [10, 50, 200] },
    { type: "Ambrosia", value: values.ragweed ?? 0, bands: [10, 30, 100] },
  ];

  const present = species.filter((s) => s.value >= 1);
  if (!present.length) return null;

  const ranked = present.map((s) => {
    let level: PollenLevel;
    if (s.value <= s.bands[0]) level = "Låg";
    else if (s.value <= s.bands[1]) level = "Måttlig";
    else if (s.value <= s.bands[2]) level = "Hög";
    else level = "Mycket hög";
    return { type: s.type, level, value: s.value, rank: POLLEN_RANK[level] };
  });

  ranked.sort((a, b) => b.rank - a.rank || b.value - a.value);
  return { type: ranked[0].type, level: ranked[0].level };
}

export function getSunProgress(now: number, sunrise: number, sunset: number): number {
  if (!(sunset > sunrise)) return now < sunrise ? 0 : 1;
  return Math.min(1, Math.max(0, (now - sunrise) / (sunset - sunrise)));
}

async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality | null> {
  try {
    const res = await fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=european_aqi,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen`,
    );
    if (!res.ok) return null;
    const data = await res.json();
    const current = data.current;
    if (!current) return null;
    return {
      aqi: typeof current.european_aqi === "number" ? Math.round(current.european_aqi) : null,
      pollen: summarizePollen({
        alder: current.alder_pollen,
        birch: current.birch_pollen,
        grass: current.grass_pollen,
        mugwort: current.mugwort_pollen,
        olive: current.olive_pollen,
        ragweed: current.ragweed_pollen,
      }),
    };
  } catch {
    return null;
  }
}

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=sv&format=json`
  );
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((r: {
    name: string;
    country?: string;
    country_code?: string;
    admin1?: string;
    latitude: number;
    longitude: number;
  }) => ({
    name: r.name,
    country: formatCountry(r.country || "", r.country_code),
    countryCode: r.country_code,
    admin1: r.admin1 || "",
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function fetchWeather(location: GeoLocation): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,surface_pressure,uv_index,cloud_cover,precipitation&hourly=temperature_2m,weather_code,relative_humidity_2m,uv_index,wind_speed_10m,wind_gusts_10m,wind_direction_10m,cloud_cover,precipitation_probability,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset&timezone=auto&forecast_days=14&wind_speed_unit=ms`;
  const [res, airQuality] = await Promise.all([
    fetch(url),
    fetchAirQuality(location.latitude, location.longitude),
  ]);
  const data = await res.json();

  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: data.current.wind_direction_10m,
    windGusts: Math.round(data.current.wind_gusts_10m),
    weatherCode: data.current.weather_code,
    uvIndex: Math.round(data.current.uv_index * 10) / 10,
    pressure: Math.round(data.current.surface_pressure),
    cloudCover: data.current.cloud_cover,
    precipitation: data.current.precipitation,
  };

  // Convert "now" to the location's local time for correct hourly slicing.
  // Start at the next hour so the table does not repeat the current conditions.
  const localNow = new Date(new Date().toLocaleString("en-US", { timeZone: data.timezone }));
  const nextHourIndex = data.hourly.time.findIndex(
    (t: string) => new Date(t) > localNow
  );
  const hourlyStart = nextHourIndex < 0 ? 0 : nextHourIndex;

  const allHourly: HourlyForecast[] = data.hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature: Math.round(data.hourly.temperature_2m[i]),
    weatherCode: data.hourly.weather_code[i],
    humidity: data.hourly.relative_humidity_2m[i],
    uvIndex: Math.round(data.hourly.uv_index[i] * 10) / 10,
    windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
    windGusts: Math.round(data.hourly.wind_gusts_10m[i]),
    windDirection: data.hourly.wind_direction_10m[i],
    cloudCover: data.hourly.cloud_cover[i],
    precipitationProbability: data.hourly.precipitation_probability[i] || 0,
    precipitation: Math.round((data.hourly.precipitation[i] || 0) * 10) / 10,
  }));

  const hourly = allHourly.slice(hourlyStart, hourlyStart + 24);

  const daily: DailyForecast[] = data.daily.time.map((d: string, i: number) => ({
    date: d,
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    weatherCode: data.daily.weather_code[i],
    precipitationProbability: data.daily.precipitation_probability_max[i] || 0,
    precipitationSum: Math.round((data.daily.precipitation_sum[i] || 0) * 10) / 10,
    windSpeedMax: Math.round(data.daily.wind_speed_10m_max[i]),
    windGustsMax: Math.round(data.daily.wind_gusts_10m_max[i]),
    windDirectionDominant: data.daily.wind_direction_10m_dominant[i],
    uvIndexMax: Math.round(data.daily.uv_index_max[i] * 10) / 10,
  }));

  return {
    location,
    current,
    allHourly,
    hourly,
    daily,
    sunrises: data.daily.sunrise,
    sunsets: data.daily.sunset,
    timezone: data.timezone,
    airQuality,
  };
}
