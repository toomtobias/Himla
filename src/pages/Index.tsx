import Header from "@/components/Header";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import WeatherSkeleton from "@/components/WeatherSkeleton";
import { useWeather } from "@/hooks/useWeather";

const Index = () => {
  const { weather, loading, error, setLocation, recentLocations } = useWeather();

  return (
    <div className="min-h-screen sky-gradient">
      <Header
        location={weather?.location.name ?? ""}
        country={weather?.location.country ?? ""}
        countryCode={weather?.location.countryCode}
        admin1={weather?.location.admin1}
        timezone={weather?.timezone ?? ""}
        onSelectLocation={setLocation}
        recentLocations={recentLocations}
      />
      <div className="max-w-lg md:max-w-3xl mx-auto px-4 py-8 space-y-6">

        {loading && <WeatherSkeleton />}

        {error && (
          <div className="glass-card p-6 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {weather && !loading && (
          <>
            <CurrentWeatherCard
              current={weather.current}
              sunrise={weather.sunrises[0]}
              sunset={weather.sunsets[0]}
              timezone={weather.timezone}
              airQuality={weather.airQuality}
            />
            <HourlyForecast hourly={weather.hourly} sunrises={weather.sunrises} sunsets={weather.sunsets} />
            <div className="pt-6">
              <DailyForecast daily={weather.daily} allHourly={weather.allHourly} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
