import Header from "@/components/Header";
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
      <Header onSelectLocation={setLocation} />
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <CloudRain className="text-foreground/30 animate-pulse" size={48} />
            <p className="text-foreground/40 text-sm">Laddar väder...</p>
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
            <HourlyForecast hourly={weather.hourly} sunrise={weather.sunrises[0]} sunset={weather.sunsets[0]} />
            <DailyForecast daily={weather.daily} />
            <WeatherDetails current={weather.current} />
            <SunCard sunrise={weather.sunrises[0]} sunset={weather.sunsets[0]} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
