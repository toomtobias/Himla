import {
  CurrentWeather,
  AirQuality,
  getPosterCopy,
  getWindDirection,
  getUvInfo,
  getAqiInfo,
  formatMm,
  formatSvNumber,
} from "@/lib/weather";
import { useEffect, useState } from "react";

interface Props {
  current: CurrentWeather;
  sunrise: string;
  sunset: string;
  nextSunrise?: string;
  timezone: string;
  airQuality: AirQuality | null;
  precipProbability?: number;
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const CurrentWeatherCard = ({
  current,
  sunrise,
  sunset,
  nextSunrise,
  timezone,
  airQuality,
  precipProbability = 0,
}: Props) => {
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

  const localNow = new Date(new Date(nowMs).toLocaleString("en-US", { timeZone: timezone }));
  const sunriseMs = new Date(sunrise).getTime();
  const sunsetMs = new Date(sunset).getTime();
  const isNight = localNow.getTime() < sunriseMs || localNow.getTime() >= sunsetMs;
  const poster = getPosterCopy(current.weatherCode, isNight);

  const weekday = localNow.toLocaleDateString("sv-SE", { weekday: "long" });
  const clock = localNow.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  const when = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${clock}`;

  const sunIso = isNight ? (localNow.getTime() >= sunsetMs && nextSunrise ? nextSunrise : sunrise) : sunset;
  const sunLine = isNight ? `Solen går upp ${formatClock(sunIso)}` : `Solen går ner ${formatClock(sunIso)}`;

  const precip = Math.round(current.precipitation * 10) / 10;
  const uv = getUvInfo(current.uvIndex);
  const windDir = getWindDirection(current.windDirection);
  const aqi = airQuality?.aqi;
  const pollen = airQuality?.pollen;

  return (
    <div className="mt-[18px] space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="box bg-white p-[18px] flex flex-col justify-between min-h-[220px]">
          <div className="text-sm font-bold uppercase tracking-[0.08em]">{when}</div>
          <div className="text-[clamp(88px,16vw,180px)] leading-[0.8] font-bold tracking-[-0.07em] my-2">
            {current.temperature}°
          </div>
          <div className="font-bold uppercase">Känns som {current.feelsLike}°</div>
        </div>
        <div className="box bg-now p-[22px] flex flex-col justify-between min-h-[220px]">
          <div className="text-sm font-bold uppercase tracking-[0.08em]">Just nu</div>
          <h1 className="text-[clamp(28px,4.2vw,42px)] leading-[1] font-bold uppercase">
            <span className="block">{poster.line1}</span>
            <span className="block">{poster.line2}</span>
          </h1>
          <div className="font-bold">{sunLine}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="box bg-wind p-4">
          <div className="text-xs font-bold uppercase">Vind</div>
          <div className="text-[32px] font-bold leading-none mt-1.5">{current.windSpeed} m/s</div>
          <div className="mt-1 font-medium">
            {windDir}
            {current.windGusts > current.windSpeed ? ` · byar ${current.windGusts}` : ""}
          </div>
        </div>
        <div className="box bg-rain p-4">
          <div className="text-xs font-bold uppercase">Regn</div>
          <div className="text-[32px] font-bold leading-none mt-1.5">{formatMm(precip)}</div>
          <div className="mt-1 font-medium">
            {precipProbability > 0 ? `${precipProbability}% risk` : "Ingen risk just nu"}
          </div>
        </div>
        <div className="box bg-uv p-4">
          <div className="text-xs font-bold uppercase">UV</div>
          <div className="text-[32px] font-bold leading-none mt-1.5">{formatSvNumber(current.uvIndex)}</div>
          <div className="mt-1 font-medium">{uv.label}</div>
        </div>
        <div className="box bg-tape p-4">
          <div className="text-xs font-bold uppercase">Luft</div>
          {aqi != null ? (
            <>
              <div className="text-[32px] font-bold leading-none mt-1.5">AQI {aqi}</div>
              <div className="mt-1 font-medium">
                {pollen ? `${pollen.level} · ${pollen.type}` : getAqiInfo(aqi).label}
              </div>
            </>
          ) : pollen ? (
            <>
              <div className="text-[32px] font-bold leading-none mt-1.5">{pollen.level}</div>
              <div className="mt-1 font-medium">{pollen.type}</div>
            </>
          ) : (
            <>
              <div className="text-[32px] font-bold leading-none mt-1.5">{current.humidity}%</div>
              <div className="mt-1 font-medium">Fuktighet</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
