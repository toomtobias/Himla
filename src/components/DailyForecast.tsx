import { DailyForecast as DailyType, HourlyForecast as HourlyType, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";
import { Droplets } from "lucide-react";

interface Props {
  daily: DailyType[];
  allHourly: HourlyType[];
}

function tempToColor(temp: number, min: number, max: number): string {
  const range = max - min || 1;
  const ratio = (temp - min) / range;
  // Light grey (cold) → Dark blue (warm)
  const r = Math.round(210 - ratio * (210 - 30));
  const g = Math.round(220 - ratio * (220 - 64));
  const b = Math.round(230 - ratio * (230 - 175));
  return `rgb(${r},${g},${b})`;
}

const DailyForecast = ({ daily, allHourly }: Props) => {
  const dayNames = ["Sön", "Mån", "Tis", "Ons", "Tor", "Fre", "Lör"];

  // Global min/max across all 7 days for consistent color scale
  const globalMin = Math.min(...daily.map((x) => x.tempMin));
  const globalMax = Math.max(...daily.map((x) => x.tempMax));

  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
        7-dagars prognos
      </h3>
      <div className="space-y-1">
        {daily.map((d, i) => {
          const info = getWeatherInfo(d.weatherCode);
          const date = new Date(d.date + "T00:00:00");
          const label = i === 0 ? "Idag" : dayNames[date.getDay()];

          // Get hourly temps for this day
          const dayHourly = allHourly.filter((h) => h.time.startsWith(d.date));
          const temps = dayHourly.map((h) => h.temperature);

          // Group hourly temps into 2-hour blocks (12 segments)
          const segments: number[] = [];
          for (let j = 0; j < 24; j += 2) {
            const block = temps.slice(j, j + 2);
            if (block.length > 0) {
              segments.push(Math.round(block.reduce((a, b) => a + b, 0) / block.length));
            }
          }

          return (
            <div
              key={d.date}
              className="flex items-center gap-3 py-2 px-2"
            >
              <span className="text-sm font-medium text-foreground w-12 text-left">{label}</span>
              <WeatherIcon iconName={info.icon} size={20} className="text-foreground/70 w-6" tooltip={info.label} />
              <span className="text-xs text-foreground/50 w-7 text-right">{d.tempMin}°</span>
              <div className="flex-1 mx-1">
                <div className="flex h-1.5 overflow-hidden rounded-full">
                {segments.length > 0 ? segments.map((t, j) => (
                  <div
                    key={j}
                    className="flex-1 h-full"
                    style={{ backgroundColor: tempToColor(t, globalMin, globalMax) }}
                    title={`${String(j * 2).padStart(2, "0")}–${String(j * 2 + 2).padStart(2, "0")}: ${t}°`}
                  />
                )) : (
                  <div className="flex-1 h-full bg-foreground/20" />
                )}
                </div>
              </div>
              <span className="text-xs font-semibold text-foreground w-7">{d.tempMax}°</span>
              <div className="flex items-center gap-1 w-14">
                <Droplets size={14} className="text-black" />
                <span className="text-xs text-black">{d.precipitationProbability}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;
