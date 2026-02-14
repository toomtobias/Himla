import { CurrentWeather, getWindDirection } from "@/lib/weather";
import { Droplets, Wind, Eye, Gauge, Cloud, CloudRain } from "lucide-react";

interface Props {
  current: CurrentWeather;
}

const details = (c: CurrentWeather) => [
  { label: "Luftfuktighet", value: `${c.humidity}%`, icon: Droplets },
  { label: "Vind", value: `${c.windSpeed} m/s ${getWindDirection(c.windDirection)}`, icon: Wind },
  { label: "UV-index (0–11)", value: `${c.uvIndex}`, icon: Eye },
  { label: "Lufttryck", value: `${c.pressure} hPa`, icon: Gauge },
  { label: "Molntäcke", value: `${c.cloudCover}%`, icon: Cloud },
  { label: "Regn", value: `${c.precipitation} mm`, icon: CloudRain },
];

const WeatherDetails = ({ current }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {details(current).map((d) => (
        <div key={d.label} className="glass-card p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-foreground/50">
            <d.icon size={14} />
            <span className="text-xs font-semibold uppercase tracking-wider">{d.label}</span>
          </div>
          <span className="text-2xl font-semibold text-foreground">{d.value}</span>
        </div>
      ))}
    </div>
  );
};

export default WeatherDetails;
