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
  weatherCode: number;
  uvIndex: number;
  visibility: number;
  pressure: number;
}

export interface HourlyForecast {
  time: string;
  temperature: number;
  weatherCode: number;
  humidity: number;
  uvIndex: number;
  windSpeed: number;
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
}

const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "Sun" },
  1: { label: "Mainly clear", icon: "Sun" },
  2: { label: "Partly cloudy", icon: "CloudSun" },
  3: { label: "Overcast", icon: "Cloud" },
  45: { label: "Foggy", icon: "CloudFog" },
  48: { label: "Rime fog", icon: "CloudFog" },
  51: { label: "Light drizzle", icon: "CloudDrizzle" },
  53: { label: "Moderate drizzle", icon: "CloudDrizzle" },
  55: { label: "Dense drizzle", icon: "CloudDrizzle" },
  61: { label: "Slight rain", icon: "CloudRain" },
  63: { label: "Moderate rain", icon: "CloudRain" },
  65: { label: "Heavy rain", icon: "CloudRainWind" },
  71: { label: "Slight snow", icon: "Snowflake" },
  73: { label: "Moderate snow", icon: "Snowflake" },
  75: { label: "Heavy snow", icon: "Snowflake" },
  77: { label: "Snow grains", icon: "Snowflake" },
  80: { label: "Slight showers", icon: "CloudRain" },
  81: { label: "Moderate showers", icon: "CloudRain" },
  82: { label: "Violent showers", icon: "CloudRainWind" },
  85: { label: "Slight snow showers", icon: "Snowflake" },
  86: { label: "Heavy snow showers", icon: "Snowflake" },
  95: { label: "Thunderstorm", icon: "CloudLightning" },
  96: { label: "Thunderstorm w/ hail", icon: "CloudLightning" },
  99: { label: "Thunderstorm w/ heavy hail", icon: "CloudLightning" },
};

export function getWeatherInfo(code: number) {
  return WMO_CODES[code] || { label: "Unknown", icon: "Cloud" };
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
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,uv_index&hourly=temperature_2m,weather_code,relative_humidity_2m,uv_index,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  const data = await res.json();

  const current: CurrentWeather = {
    temperature: Math.round(data.current.temperature_2m),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: data.current.relative_humidity_2m,
    windSpeed: Math.round(data.current.wind_speed_10m),
    weatherCode: data.current.weather_code,
    uvIndex: Math.round(data.current.uv_index),
    visibility: 10,
    pressure: Math.round(data.current.surface_pressure),
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
  };
}
