import Header from "@/components/Header";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import WeatherSkeleton from "@/components/WeatherSkeleton";
import { useWeather } from "@/hooks/useWeather";

const Index = () => {
  const { weather, loading, error, location, setLocation, recentLocations } = useWeather();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-12 min-w-0">
        <Header
          location={weather?.location.name ?? location.name}
          country={weather?.location.country ?? ""}
          countryCode={weather?.location.countryCode}
          admin1={weather?.location.admin1}
          timezone={weather?.timezone ?? ""}
          onSelectLocation={setLocation}
          recentLocations={recentLocations}
        />

        {loading && <WeatherSkeleton />}

        {error && (
          <div className="box bg-white p-6 mt-[18px] text-center font-bold">
            <p>{error}</p>
          </div>
        )}

        {weather && !loading && (
          <>
            <CurrentWeatherCard
              current={weather.current}
              sunrise={weather.sunrises[0]}
              sunset={weather.sunsets[0]}
              nextSunrise={weather.sunrises[1]}
              timezone={weather.timezone}
              airQuality={weather.airQuality}
              precipProbability={weather.hourly[0]?.precipitationProbability ?? 0}
            />
            <HourlyForecast hourly={weather.hourly} />
            <DailyForecast
              daily={weather.daily}
              allHourly={weather.allHourly}
              timezone={weather.timezone}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
