import { CurrentWeather, snapWindDegrees } from "@/lib/weather";
import { Droplets, Wind, Eye, Gauge, Cloud, CloudRain, Sunrise, Sunset } from "lucide-react";

interface Props {
  current: CurrentWeather;
  sunrise: string;
  sunset: string;
}

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const details = (c: CurrentWeather) => [
  { label: "Molntäcke", value: `${c.cloudCover}%`, icon: Cloud },
  { label: "UV-index (0–11)", value: `${c.uvIndex}`, icon: Eye },
  { label: "Luftfuktighet", value: `${c.humidity}%`, icon: Droplets },
  { label: "Lufttryck", value: `${c.pressure} hPa`, icon: Gauge },
];

const WeatherDetails = ({ current, sunrise, sunset }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Regnkort */}
      <div className="glass-card p-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-foreground/50">
          <CloudRain size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Regn</span>
        </div>
        <span className="text-2xl font-semibold text-foreground">{current.precipitation} mm</span>
      </div>
      {/* Vindkort */}
      <div className="glass-card p-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-foreground/50">
          <Wind size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
            Vind <span style={{ transform: `rotate(${snapWindDegrees(current.windDirection)}deg)` }} className="inline-block">↓</span>
          </span>
        </div>
        <span className="text-2xl font-semibold text-foreground">{current.windSpeed} m/s</span>
      </div>
      {details(current).map((d) => (
        <div key={d.label} className="glass-card p-4 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-foreground/50">
            <d.icon size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">{d.label}</span>
          </div>
          <span className="text-2xl font-semibold text-foreground">{d.value}</span>
        </div>
      ))}
      {/* Solkort */}
      <div className="glass-card p-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-foreground/50">
          <Sunrise size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Soluppgång</span>
        </div>
        <span className="text-2xl font-semibold text-foreground">{formatTime(sunrise)}</span>
      </div>
      <div className="glass-card p-4 flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 text-foreground/50">
          <Sunset size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Solnedgång</span>
        </div>
        <span className="text-2xl font-semibold text-foreground">{formatTime(sunset)}</span>
      </div>
    </div>
  );
};

export default WeatherDetails;
