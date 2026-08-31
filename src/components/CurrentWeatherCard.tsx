import {
  CurrentWeather,
  AirQuality,
  getWeatherInfo,
  getWindDirection,
  snapWindDegrees,
  getUvInfo,
  getAqiInfo,
  getTimeOfDayFraction,
  formatRelativeToNow,
} from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Wind, CloudRain, Sun, Leaf, Factory, Sunrise, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  current: CurrentWeather;
  sunrise: string;
  sunset: string;
  timezone: string;
  airQuality: AirQuality | null;
}

/** Same steel-blue → golden-amber scale as the hourly/daily temperature bars. */
const SUNRISE_COLOR = "rgb(235, 180, 60)";
const SUNSET_COLOR = "rgb(224, 179, 79)";

function eventAnchorStyle(fraction: number): CSSProperties {
  if (fraction <= 0.08) {
    return { left: 0, transform: "none" };
  }
  if (fraction >= 0.92) {
    return { left: "100%", transform: "translateX(-100%)" };
  }
  return { left: `${fraction * 100}%`, transform: "translateX(-50%)" };
}

function SunEventLabel({
  fraction,
  icon: Icon,
  time,
  relative,
}: {
  fraction: number;
  icon: typeof Sunrise;
  time: string;
  relative: string;
}) {
  return (
    <div
      className="absolute top-0 z-10 flex flex-col items-center gap-0.5 text-slate-800 whitespace-nowrap pointer-events-none"
      style={eventAnchorStyle(fraction)}
    >
      <div className="flex items-center gap-1 text-xs font-medium tabular-nums">
        <Icon size={14} className="shrink-0" />
        {time}
      </div>
      <span className="text-[10px] text-foreground/55 leading-none">{relative}</span>
    </div>
  );
}

function DaylightBar({
  now,
  sunrise,
  sunset,
  sunriseLabel,
  sunsetLabel,
}: {
  now: Date;
  sunrise: Date;
  sunset: Date;
  sunriseLabel: string;
  sunsetLabel: string;
}) {
  const nowFrac = getTimeOfDayFraction(now);
  const sunriseFrac = getTimeOfDayFraction(sunrise);
  const sunsetFrac = getTimeOfDayFraction(sunset);
  const sunriseRelative = formatRelativeToNow(sunrise, now);
  const sunsetRelative = formatRelativeToNow(sunset, now);

  return (
    <div
      className="relative pt-12"
      role="img"
      aria-label={`Soluppgång ${sunriseLabel} ${sunriseRelative}, solnedgång ${sunsetLabel} ${sunsetRelative}`}
    >
      <div className="relative h-8 rounded-full overflow-hidden border border-white/30 bg-white/20">
        <div
          className="absolute inset-y-0 left-0 bg-sky-900/25"
          style={{ width: `${nowFrac * 100}%` }}
        />
        <div
          className="absolute inset-y-0 w-1 -translate-x-1/2"
          style={{ left: `${sunriseFrac * 100}%`, backgroundColor: SUNRISE_COLOR }}
        />
        <div
          className="absolute inset-y-0 w-1 -translate-x-1/2"
          style={{ left: `${sunsetFrac * 100}%`, backgroundColor: SUNSET_COLOR }}
        />
      </div>

      <SunEventLabel
        fraction={sunriseFrac}
        icon={Sunrise}
        time={sunriseLabel}
        relative={sunriseRelative}
      />
      <SunEventLabel
        fraction={sunsetFrac}
        icon={Sunset}
        time={sunsetLabel}
        relative={sunsetRelative}
      />
    </div>
  );
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
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!timezone) return;
    const tick = () => setNowMs(Date.now());
    tick();
    let intervalId: ReturnType<typeof setInterval> | undefined;
    const timeoutId = setTimeout(() => {
      tick();
      intervalId = setInterval(tick, 60_000);
    }, 60_000 - (Date.now() % 60_000));
    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [timezone]);

  const info = getWeatherInfo(current.weatherCode);
  const localNow = new Date(new Date(nowMs).toLocaleString("en-US", { timeZone: timezone })).getTime();
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const isNight = localNow < sunriseMs || localNow >= sunsetMs;

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

      <div className="mt-8">
        <DaylightBar
          now={new Date(localNow)}
          sunrise={new Date(sunrise)}
          sunset={new Date(sunset)}
          sunriseLabel={formatTime(sunrise)}
          sunsetLabel={formatTime(sunset)}
        />
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
