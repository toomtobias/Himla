import {
  CurrentWeather,
  AirQuality,
  AirSlide,
  getPosterCopy,
  getSunNowInfo,
  getWindDirection,
  getUvInfo,
  getAqiInfo,
  formatMm,
  formatSvNumber,
  listAirSlides,
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

function airSlideCopy(slide: AirSlide): { value: string; detail: string; aria: string } {
  if (slide.kind === "aqi") {
    const label = getAqiInfo(slide.aqi).label;
    return {
      value: `AQI ${slide.aqi}`,
      detail: label,
      aria: `AQI ${slide.aqi}, ${label}`,
    };
  }
  if (slide.kind === "pm25") {
    const value = formatSvNumber(slide.value);
    return {
      value,
      detail: "PM2.5 · µg/m³",
      aria: `PM2.5 ${value} mikrogram per kubikmeter`,
    };
  }
  if (slide.kind === "pm10") {
    const value = formatSvNumber(slide.value);
    return {
      value,
      detail: "PM10 · µg/m³",
      aria: `PM10 ${value} mikrogram per kubikmeter`,
    };
  }
  return {
    value: slide.type,
    detail: `Pollen · ${slide.level}`,
    aria: `Pollen ${slide.type}, ${slide.level}`,
  };
}

function AirCard({
  airQuality,
  humidity,
}: {
  airQuality: AirQuality | null;
  humidity: number;
}) {
  const slides = listAirSlides(airQuality);
  const slideKey = slides
    .map((s) => (s.kind === "pollen" ? `pollen:${s.type}` : s.kind))
    .join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slideKey]);

  const canCycle = slides.length > 1;
  const slide = slides[Math.min(index, Math.max(0, slides.length - 1))];
  const copy = slide ? airSlideCopy(slide) : null;

  const body = (
    <>
      <div className="text-xs font-bold uppercase">Luft</div>
      {copy ? (
        <>
          <div className="text-[32px] font-bold leading-none mt-1.5">{copy.value}</div>
          <div className="mt-1 flex items-end justify-between gap-2">
            <div className="font-medium min-w-0">{copy.detail}</div>
            {canCycle && (
              <span className="text-[10px] font-bold tabular-nums shrink-0" aria-hidden>
                {Math.min(index, slides.length - 1) + 1}/{slides.length}
              </span>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="text-[32px] font-bold leading-none mt-1.5">{humidity}%</div>
          <div className="mt-1 font-medium">Fuktighet</div>
        </>
      )}
    </>
  );

  if (canCycle && copy) {
    return (
      <button
        type="button"
        onClick={() => setIndex((current) => (current + 1) % slides.length)}
        aria-label={`Luft, ${copy.aria}, ${Math.min(index, slides.length - 1) + 1} av ${slides.length}. Klicka för att byta.`}
        className="box bg-air p-4 w-full min-w-0 text-left cursor-pointer font-[inherit] text-ink select-none"
      >
        {body}
      </button>
    );
  }

  return <div className="box bg-air p-4">{body}</div>;
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
  const sun = getSunNowInfo({ sunrise, sunset, nextSunrise, now: localNow });
  const poster = getPosterCopy(current.weatherCode, sun.isNight);

  const weekday = localNow.toLocaleDateString("sv-SE", { weekday: "long" });
  const clock = localNow.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
  const when = `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${clock}`;

  const precip = Math.round(current.precipitation * 10) / 10;
  const uv = getUvInfo(current.uvIndex);
  const windDir = getWindDirection(current.windDirection);

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
          {sun.countdown && <div className="font-bold">{sun.countdown}</div>}
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
        <AirCard airQuality={airQuality} humidity={current.humidity} />
      </div>
    </div>
  );
};

export default CurrentWeatherCard;
