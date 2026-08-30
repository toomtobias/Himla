import {
  CurrentWeather,
  AirQuality,
  getWeatherInfo,
  getWindDirection,
  snapWindDegrees,
  getUvInfo,
  getAqiInfo,
  getSunProgress,
} from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";
import type { ReactNode } from "react";
import { Wind, CloudRain, Sun, Leaf, Factory, Sunrise, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  current: CurrentWeather;
  sunrise: string;
  sunset: string;
  timezone: string;
  airQuality: AirQuality | null;
}

function Chip({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Wind;
  label: string;
  value: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("glass-card px-3 py-2 flex items-center justify-center gap-2", className)}>
      <Icon size={14} className="text-foreground/50 shrink-0" />
      <div className="min-w-0 text-center">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground/40">
          {label}
        </div>
        <div className="text-sm font-medium text-foreground leading-tight">{value}</div>
      </div>
    </div>
  );
}

const CurrentWeatherCard = ({ current, sunrise, sunset, timezone, airQuality }: Props) => {
  const info = getWeatherInfo(current.weatherCode);
  const localNow = new Date(new Date().toLocaleString("en-US", { timeZone: timezone })).getTime();
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const isNight = localNow < sunriseMs || localNow >= sunsetMs;
  const sunProgress = getSunProgress(localNow, sunriseMs, sunsetMs);

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("sv-SE", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const precip = Math.round(current.precipitation * 10) / 10;
  const uv = getUvInfo(current.uvIndex);
  const gusts =
    current.windGusts > current.windSpeed ? ` (${current.windGusts})` : "";
  const windDir = getWindDirection(current.windDirection);

  const chipClass = "flex-1 min-w-[9rem]";

  return (
    <div className="pb-6">
      <div className="flex items-center justify-center gap-2 sm:gap-3">
        <WeatherIcon
          iconName={info.icon}
          size={112}
          className="text-foreground/80 shrink-0"
          tooltip={info.label}
          isNight={isNight}
        />
        <span className="text-7xl sm:text-8xl font-extralight tracking-tighter leading-none text-foreground">
          {current.temperature}°
        </span>
        <div className="min-w-0 pl-1 sm:pl-2">
          <p className="text-lg text-foreground/80 font-medium leading-tight">{info.label}</p>
          <p className="text-sm text-foreground/60 mt-0.5">Känns som {current.feelsLike}°</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-sm text-foreground/70">
        <Sunrise size={14} className="text-foreground/50 shrink-0" />
        <span className="tabular-nums whitespace-nowrap">{formatTime(sunrise)}</span>
        <div className="relative flex-1 h-1.5 rounded-full bg-foreground/15 min-w-[4rem]">
          <div
            className="absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-amber-400 shadow-sm"
            style={{ left: `${sunProgress * 100}%` }}
            aria-hidden
          />
        </div>
        <span className="tabular-nums whitespace-nowrap">{formatTime(sunset)}</span>
        <Sunset size={14} className="text-foreground/50 shrink-0" />
      </div>

      <div className="mt-8 flex flex-wrap gap-2">
        <Chip
          className={chipClass}
          icon={Wind}
          label="Vind"
          value={
            <span className="inline-flex items-center gap-1">
              <span
                style={{ transform: `rotate(${snapWindDegrees(current.windDirection)}deg)` }}
                className="inline-block"
                title={windDir}
              >
                ↓
              </span>
              {current.windSpeed}{gusts} m/s
            </span>
          }
        />
        <Chip className={chipClass} icon={CloudRain} label="Nederbörd" value={`${precip} mm`} />
        <Chip className={chipClass} icon={Sun} label="UV-index" value={`${current.uvIndex} · ${uv.label}`} />
        {airQuality?.aqi != null && (
          <Chip
            className={chipClass}
            icon={Factory}
            label="Luft"
            value={`${airQuality.aqi} · ${getAqiInfo(airQuality.aqi).label}`}
          />
        )}
        {airQuality?.pollen && (
          <Chip
            className={chipClass}
            icon={Leaf}
            label="Pollen"
            value={`${airQuality.pollen.level} · ${airQuality.pollen.type}`}
          />
        )}
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
