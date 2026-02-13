import { useState, useEffect } from "react";
import { GeoLocation, WeatherData, fetchWeather } from "@/lib/weather";

const DEFAULT_LOCATION: GeoLocation = {
  name: "London",
  country: "United Kingdom",
  latitude: 51.5074,
  longitude: -0.1278,
};

export function useWeather() {
  const [location, setLocation] = useState<GeoLocation>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchWeather(location)
      .then((data) => {
        if (!cancelled) {
          setWeather(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError("Failed to fetch weather data");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [location]);

  return { weather, loading, error, setLocation };
}
