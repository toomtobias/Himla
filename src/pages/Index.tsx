import Header from "@/components/Header";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import WeatherDetails from "@/components/WeatherDetails";
import SunCard from "@/components/SunCard";
import WeatherSkeleton from "@/components/WeatherSkeleton";
import { useWeather } from "@/hooks/useWeather";

const Index = () => {
  const { weather, loading, error, setLocation, recentLocations } = useWeather();

  return (
    <div className="min-h-screen sky-gradient">
      <Header
        location={weather?.location.name ?? ""}
        country={weather?.location.country ?? ""}
        timezone={weather?.timezone ?? ""}
        onSelectLocation={setLocation}
        recentLocations={recentLocations}
      />
      <div className="max-w-lg md:max-w-2xl mx-auto px-4 py-8 space-y-6">

        {loading && <WeatherSkeleton />}

        {error && (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {weather && !loading && (
          <>
            <CurrentWeatherCard current={weather.current} sunrise={weather.sunrises[0]} sunset={weather.sunsets[0]} timezone={weather.timezone} />
            <HourlyForecast hourly={weather.hourly} sunrise={weather.sunrises[0]} sunset={weather.sunsets[0]} />
            <DailyForecast daily={weather.daily} allHourly={weather.allHourly} />
            <WeatherDetails current={weather.current} />
            <SunCard sunrise={weather.sunrises[0]} sunset={weather.sunsets[0]} />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
