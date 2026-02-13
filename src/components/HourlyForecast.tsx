import { HourlyForecast as HourlyType, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";

interface Props {
  hourly: HourlyType[];
}

const HourlyForecast = ({ hourly }: Props) => {
  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
        Hourly Forecast
      </h3>
      <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-none">
        {hourly.map((h, i) => {
          const info = getWeatherInfo(h.weatherCode);
          const hour = new Date(h.time);
          const label = i === 0 ? "Now" : hour.toLocaleTimeString([], { hour: "numeric" });
          return (
            <div key={h.time} className="flex flex-col items-center gap-2 min-w-[50px]">
              <span className="text-xs text-foreground/60 font-medium">{label}</span>
              <WeatherIcon iconName={info.icon} size={22} className="text-foreground/70" />
              <span className="text-sm font-semibold text-foreground">{h.temperature}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;
