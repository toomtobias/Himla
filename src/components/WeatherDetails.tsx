import { CurrentWeather } from "@/lib/weather";
import { Droplets, Wind, Eye, Gauge } from "lucide-react";

interface Props {
  current: CurrentWeather;
}

const details = (c: CurrentWeather) => [
  { label: "Humidity", value: `${c.humidity}%`, icon: Droplets },
  { label: "Wind", value: `${c.windSpeed} km/h`, icon: Wind },
  { label: "UV Index", value: `${c.uvIndex}`, icon: Eye },
  { label: "Pressure", value: `${c.pressure} hPa`, icon: Gauge },
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
