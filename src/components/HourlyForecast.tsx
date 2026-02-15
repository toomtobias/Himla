import { useState } from "react";
import { HourlyForecast as HourlyType, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";
import { Droplets, Wind, Sun } from "lucide-react";

interface Props {
  hourly: HourlyType[];
  sunrise: string;
  sunset: string;
}

const HourlyForecast = ({ hourly, sunrise, sunset }: Props) => {
  const sunriseTime = new Date(sunrise).getTime();
  const sunsetTime = new Date(sunset).getTime();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex !== null ? hourly[selectedIndex] : null;

  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
        Timprognos
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-4 glass-scrollbar">
        {hourly.map((h, i) => {
          const info = getWeatherInfo(h.weatherCode);
          const hour = new Date(h.time);
          const hourTime = hour.getTime();
          const isNight = hourTime < sunriseTime || hourTime >= sunsetTime;
          const label = hour.toLocaleTimeString([], { hour: "numeric" });
          const isSelected = selectedIndex === i;
          return (
            <button
              key={h.time}
              onClick={() => setSelectedIndex(isSelected ? null : i)}
              className={`flex flex-col items-center gap-1 min-w-[75px] rounded-xl py-1 px-0 transition-colors ${
                isSelected ? "bg-foreground/10" : "hover:bg-foreground/5"
              }`}
            >
              <span className="text-xs text-foreground/60 font-medium">{label}</span>
              <WeatherIcon iconName={info.icon} size={20} className="text-foreground/70" tooltip={info.label} isNight={isNight} />
              <span className="text-sm font-semibold text-foreground">{h.temperature}°</span>
              {h.precipitationProbability > 10 && (
                <span className="text-xs text-slate-800 flex items-center gap-0.5">
                  <Droplets size={10} />
                  {h.precipitationProbability}%
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-foreground/10 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col items-center gap-1">
            <Droplets size={16} className="text-foreground/50" />
            <span className="text-xs text-foreground/50">Luftfuktighet</span>
            <span className="text-sm font-semibold text-foreground">{selected.humidity}%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind size={16} className="text-foreground/50" />
            <span className="text-xs text-foreground/50">Vind</span>
            <span className="text-sm font-semibold text-foreground">{selected.windSpeed} m/s</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sun size={16} className="text-foreground/50" />
            <span className="text-xs text-foreground/50">UV-index</span>
            <span className="text-sm font-semibold text-foreground">{selected.uvIndex}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HourlyForecast;
