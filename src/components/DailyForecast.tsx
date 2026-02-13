import { DailyForecast as DailyType, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";

interface Props {
  daily: DailyType[];
}

const DailyForecast = ({ daily }: Props) => {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
        7-Day Forecast
      </h3>
      <div className="space-y-1">
        {daily.map((d, i) => {
          const info = getWeatherInfo(d.weatherCode);
          const date = new Date(d.date + "T00:00:00");
          const label = i === 0 ? "Today" : dayNames[date.getDay()];
          const range = d.tempMax - d.tempMin;
          const allMin = Math.min(...daily.map((x) => x.tempMin));
          const allMax = Math.max(...daily.map((x) => x.tempMax));
          const totalRange = allMax - allMin || 1;
          const left = ((d.tempMin - allMin) / totalRange) * 100;
          const width = (range / totalRange) * 100;

          return (
            <div key={d.date} className="flex items-center gap-3 py-2">
              <span className="text-sm font-medium text-foreground w-12">{label}</span>
              <WeatherIcon iconName={info.icon} size={20} className="text-foreground/70 w-6" />
              <span className="text-sm text-foreground/50 w-8 text-right">{d.tempMin}°</span>
              <div className="flex-1 h-1.5 rounded-full bg-foreground/10 relative mx-2">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-primary/60 to-accent/80"
                  style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-foreground w-8">{d.tempMax}°</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;
