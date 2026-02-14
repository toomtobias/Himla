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

  return (
    <div className="min-h-screen sky-gradient">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        <div className="mb-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Himla
          </h1>
        </div>
        <SearchBar onSelect={setLocation} />

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
            <HourlyForecast hourly={weather.hourly} />
            <DailyForecast daily={weather.daily} />
            <WeatherDetails current={weather.current} />
            <SunCard sunrise={weather.sunrise} sunset={weather.sunset} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
