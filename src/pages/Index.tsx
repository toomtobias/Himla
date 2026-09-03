import { useEffect, useState } from "react";
import Header from "@/components/Header";
import CurrentWeatherCard from "@/components/CurrentWeatherCard";
import HourlyForecast from "@/components/HourlyForecast";
import DailyForecast from "@/components/DailyForecast";
import WeatherSkeleton from "@/components/WeatherSkeleton";
import { useWeather } from "@/hooks/useWeather";
import {
  formatDayPartTitle,
  hoursForDayPart,
  isSameDayPart,
  type SelectedDayPart,
} from "@/lib/weather";

const Index = () => {
  const { weather, loading, error, location, setLocation, recentLocations } = useWeather();
  const [selectedPeriod, setSelectedPeriod] = useState<SelectedDayPart | null>(null);

  useEffect(() => {
    setSelectedPeriod(null);
  }, [location.latitude, location.longitude]);

  const selectPeriod = (next: SelectedDayPart) => {
    setSelectedPeriod((current) => (isSameDayPart(current, next) ? null : next));
    if (!isSameDayPart(selectedPeriod, next)) {
      document.getElementById("timprognos")?.scrollIntoView?.({
        behavior: "smooth",
        block: "nearest",
      });
    }
  };

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
            <HourlyForecast
              hourly={
                selectedPeriod
                  ? hoursForDayPart(
                      weather.allHourly,
                      selectedPeriod.date,
                      selectedPeriod.partId,
                    )
                  : weather.hourly
              }
              title={
                selectedPeriod
                  ? formatDayPartTitle(
                      selectedPeriod.date,
                      selectedPeriod.partId,
                      weather.daily[0]?.date ?? "",
                    )
                  : "Kommande timmar"
              }
              timezone={weather.timezone}
              todayDate={weather.daily[0]?.date}
              dimPast={Boolean(selectedPeriod)}
            />
            <DailyForecast
              daily={weather.daily}
              allHourly={weather.allHourly}
              timezone={weather.timezone}
              selected={selectedPeriod}
              onSelect={selectPeriod}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
