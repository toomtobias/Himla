import { useState } from "react";
import { HourlyForecast as HourlyType, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";
import { Droplets, Wind, Sun } from "lucide-react";

interface Props {
  hourly: HourlyType[];
}

const HourlyForecast = ({ hourly }: Props) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selected = selectedIndex !== null ? hourly[selectedIndex] : null;

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
          const isSelected = selectedIndex === i;
          return (
            <button
              key={h.time}
              onClick={() => setSelectedIndex(isSelected ? null : i)}
              className={`flex flex-col items-center gap-2 min-w-[50px] rounded-xl py-2 px-1 transition-colors ${
                isSelected ? "bg-foreground/10" : "hover:bg-foreground/5"
              }`}
            >
              <span className="text-xs text-foreground/60 font-medium">{label}</span>
              <WeatherIcon iconName={info.icon} size={22} className="text-foreground/70" />
              <span className="text-sm font-semibold text-foreground">{h.temperature}°</span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-foreground/10 grid grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col items-center gap-1">
            <Droplets size={16} className="text-foreground/50" />
            <span className="text-xs text-foreground/50">Humidity</span>
            <span className="text-sm font-semibold text-foreground">{selected.humidity}%</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Wind size={16} className="text-foreground/50" />
            <span className="text-xs text-foreground/50">Wind</span>
            <span className="text-sm font-semibold text-foreground">{selected.windSpeed} km/h</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sun size={16} className="text-foreground/50" />
            <span className="text-xs text-foreground/50">UV Index</span>
            <span className="text-sm font-semibold text-foreground">{selected.uvIndex}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HourlyForecast;
