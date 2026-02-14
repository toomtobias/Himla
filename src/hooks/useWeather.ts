import { useState, useEffect } from "react";
import { GeoLocation, WeatherData, fetchWeather } from "@/lib/weather";

const STORAGE_KEY = "himla-recent-locations";
const MAX_RECENT = 5;

const DEFAULT_LOCATION: GeoLocation = {
  name: "London",
  country: "United Kingdom",
  latitude: 51.5074,
  longitude: -0.1278,
};

function getRecentLocations(): GeoLocation[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentLocation(loc: GeoLocation) {
  const recent = getRecentLocations().filter(
    (r) => r.latitude !== loc.latitude || r.longitude !== loc.longitude
  );
  recent.unshift(loc);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function useWeather() {
  const [location, setLocation] = useState<GeoLocation>(() => {
    const recent = getRecentLocations();
    return recent.length > 0 ? recent[0] : DEFAULT_LOCATION;
  });
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSetLocation = (loc: GeoLocation) => {
    saveRecentLocation(loc);
    setLocation(loc);
  };

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
          setError("Kunde inte hämta väderdata");
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [location]);

  return { weather, loading, error, setLocation: handleSetLocation, recentLocations: getRecentLocations };
}
