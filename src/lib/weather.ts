export interface GeoLocation {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  weatherCode: number;
  uvIndex: number;
  visibility: number;
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
  precipitationProbability: number;
}

export interface DailyForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationProbability: number;
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

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { label: "Okänt", icon: "Cloud" };
}

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((r: any) => ({
    name: r.name,
    country: r.country || "",
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function fetchWeather(location: GeoLocation): Promise<WeatherData> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,cloud_cover,precipitation&hourly=temperature_2m,weather_code,relative_humidity_2m,uv_index,wind_speed_10m,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7&wind_speed_unit=ms`;
  const res = await fetch(url);
  const data = await res.json();

  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    windDirection: data.current.wind_direction_10m,
    weatherCode: data.current.weather_code,
    uvIndex: Math.round(data.current.uv_index * 10) / 10,
    visibility: 10,
    pressure: Math.round(data.current.surface_pressure),
    cloudCover: data.current.cloud_cover,
    precipitation: data.current.precipitation,
  };

  const now = new Date();
  const currentHourIndex = data.hourly.time.findIndex(
    (t: string) => new Date(t) >= now
  );

  const allHourly: HourlyForecast[] = data.hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature: Math.round(data.hourly.temperature_2m[i]),
    weatherCode: data.hourly.weather_code[i],
    humidity: data.hourly.relative_humidity_2m[i],
    uvIndex: Math.round(data.hourly.uv_index[i]),
    windSpeed: Math.round(data.hourly.wind_speed_10m[i]),
    precipitationProbability: data.hourly.precipitation_probability[i] || 0,
  }));

  const hourly = allHourly.slice(currentHourIndex, currentHourIndex + 24);

  const daily: DailyForecast[] = data.daily.time.map((d: string, i: number) => ({
    date: d,
    tempMax: Math.round(data.daily.temperature_2m_max[i]),
    tempMin: Math.round(data.daily.temperature_2m_min[i]),
    weatherCode: data.daily.weather_code[i],
    precipitationProbability: data.daily.precipitation_probability_max[i] || 0,
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
  };
}
