import { useState, useMemo } from "react";
import SearchBar from "@/components/SearchBar";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import WeatherDetails from "@/components/WeatherDetails";
import SunCard from "@/components/SunCard";
import { useWeather } from "@/hooks/useWeather";
import { CloudRain } from "lucide-react";

const Index = () => {
  const { weather, loading, error, setLocation } = useWeather();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  const filteredHourly = useMemo(() => {
    if (!weather) return [];
    if (selectedDayIndex === null) return weather.hourly;
    const selectedDate = weather.daily[selectedDayIndex]?.date;
    if (!selectedDate) return weather.hourly;
    return weather.allHourly.filter((h) => h.time.startsWith(selectedDate));
  }, [weather, selectedDayIndex]);

  const selectedSunrise = weather
    ? weather.sunrises[selectedDayIndex ?? 0]
    : "";
  const selectedSunset = weather
    ? weather.sunsets[selectedDayIndex ?? 0]
    : "";

  const detailsForDay = useMemo(() => {
    if (!weather) return weather?.current;
    if (selectedDayIndex === null) return weather.current;
    // Compute averages from the day's hourly data
    if (filteredHourly.length === 0) return weather.current;
    const avg = (arr: number[]) => Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
    return {
      ...weather.current,
      humidity: avg(filteredHourly.map((h) => h.humidity)),
      windSpeed: avg(filteredHourly.map((h) => h.windSpeed)),
      uvIndex: Math.max(...filteredHourly.map((h) => h.uvIndex)),
    };
  }, [weather, selectedDayIndex, filteredHourly]);

  return (
    <div className="min-h-screen sky-gradient">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Himla
          </h1>
        </div>
        <SearchBar onSelect={(loc) => { setLocation(loc); setSelectedDayIndex(null); }} />

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <CloudRain className="text-foreground/30 animate-pulse" size={48} />
            <p className="text-foreground/40 text-sm">Loading weather...</p>
          </div>
        )}

        {error && (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {weather && !loading && (
          <>
            <CurrentWeatherCard current={weather.current} location={weather.location} />
            <HourlyForecast hourly={filteredHourly} selectedDayIndex={selectedDayIndex} />
            <DailyForecast
              daily={weather.daily}
              selectedIndex={selectedDayIndex}
              onSelectDay={setSelectedDayIndex}
            />
            {detailsForDay && <WeatherDetails current={detailsForDay} />}
            <SunCard sunrise={selectedSunrise} sunset={selectedSunset} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
