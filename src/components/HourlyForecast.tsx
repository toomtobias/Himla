import { useState } from "react";
import {
  HourlyForecast as HourlyType,
  formatMm,
  formatSvNumber,
  precipFillPercent,
  getHourlyStub,
  hourlyStubVisible,
  getWindDirection,
  getUvInfo,
} from "@/lib/weather";
import { cn } from "@/lib/utils";

interface Props {
  hourly: HourlyType[];
}

const VISIBLE = 8;

const MODES = ["temp", "wind", "uv"] as const;
type HourlyMode = (typeof MODES)[number];

const MODE_ARIA: Record<HourlyMode, string> = {
  temp: "temperatur",
  wind: "vind",
  uv: "UV",
};

const MODE_BG: Record<HourlyMode, string> = {
  temp: "bg-tape",
  wind: "bg-wind",
  uv: "bg-uv",
};

function HourCard({
  hour,
  mode,
  fill,
}: {
  hour: HourlyType;
  mode: HourlyMode;
  fill: number;
}) {
  const wet = hour.precipitation > 0;
  const stub = getHourlyStub(hour.weatherCode);
  const showStub = hourlyStubVisible(hour.weatherCode);

  return (
    <div className="flex flex-col items-center min-w-0">
      <div
        className={cn(
          "relative overflow-hidden border-[3px] border-ink min-h-[96px] md:min-h-[118px] w-full min-w-0 px-1 pt-2 pb-2 flex flex-col items-center text-center",
          MODE_BG[mode],
        )}
      >
        {mode === "temp" && wet && (
          <div
            className="absolute inset-x-0 bottom-0 bg-rain"
            style={{ height: `${fill}%` }}
            aria-hidden
          />
        )}
        <span className="relative z-[1] font-bold text-[13px]">{hour.time.slice(11, 13)}</span>
        {mode === "temp" && (
          <>
            <b className="relative z-[1] block text-[22px] tracking-[-0.04em] mt-0.5">
              {hour.temperature}°
            </b>
            {wet && (
              <span className="relative z-[1] mt-auto flex flex-col items-center leading-tight">
                <span className="text-[11px] font-bold">{formatMm(hour.precipitation)}</span>
                <span className="text-[10px] font-bold">{hour.precipitationProbability}%</span>
              </span>
            )}
          </>
        )}
        {mode === "wind" && (
          <>
            <b className="relative z-[1] block text-[22px] tracking-[-0.04em] mt-0.5 whitespace-nowrap">
              {hour.windSpeed} m/s
            </b>
            <span className="relative z-[1] mt-auto text-[11px] font-bold leading-tight">
              {getWindDirection(hour.windDirection)}
              {hour.windGusts > hour.windSpeed ? ` · byar ${hour.windGusts}` : ""}
            </span>
          </>
        )}
        {mode === "uv" && (
          <>
            <b className="relative z-[1] block text-[22px] tracking-[-0.04em] mt-0.5">
              {formatSvNumber(hour.uvIndex)}
            </b>
            <span className="relative z-[1] mt-auto text-[11px] font-bold">
              {getUvInfo(hour.uvIndex).label}
            </span>
          </>
        )}
      </div>
      <span className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.08em] leading-none min-h-[1em] text-center">
        {showStub ? stub : ""}
      </span>
    </div>
  );
}

const HourlyForecast = ({ hourly }: Props) => {
  const [mode, setMode] = useState<HourlyMode>("temp");
  const visible = hourly.slice(0, VISIBLE);
  const maxMm = Math.max(4, ...visible.map((h) => h.precipitation));

  const cycleMode = () => {
    setMode((current) => MODES[(MODES.indexOf(current) + 1) % MODES.length]);
  };

  return (
    <button
      type="button"
      onClick={cycleMode}
      aria-label={`Kommande timmar, ${MODE_ARIA[mode]}. Klicka för att byta.`}
      className="box bg-white p-4 mt-4 w-full text-left cursor-pointer font-[inherit] text-ink select-none"
    >
      <div className="text-xs font-bold uppercase tracking-[0.08em]">
        Kommande timmar
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mt-2.5 min-w-0">
        {visible.map((hour) => (
          <HourCard
            key={hour.time}
            hour={hour}
            mode={mode}
            fill={precipFillPercent(hour.precipitation, maxMm)}
          />
        ))}
      </div>
    </button>
  );
};

export default HourlyForecast;
