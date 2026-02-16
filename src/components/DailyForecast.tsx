import { useState } from "react";
import { DailyForecast as DailyType, HourlyForecast as HourlyType, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Props {
  daily: DailyType[];
  allHourly: HourlyType[];
}

function tempToColor(temp: number, min: number, max: number): string {
  const range = max - min || 1;
  const ratio = (temp - min) / range;
  // Steel blue (cold) → Golden amber (warm) via RGB
  const r = Math.round(140 + ratio * (235 - 140));
  const g = Math.round(175 + ratio * (180 - 175));
  const b = Math.round(215 + ratio * (60 - 215));
  return `rgb(${r},${g},${b})`;
}

const DailyForecast = ({ daily, allHourly }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const dayNames = ["Sön", "Mån", "Tis", "Ons", "Tors", "Fre", "Lör"];
  const visibleDays = expanded ? daily : daily.slice(0, 7);

  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
        {expanded ? "14-dagars prognos" : "7-dagars prognos"}
      </h3>
      {/* Column headers */}
      <div className="flex items-center gap-2 px-2 mb-1">
        <span className="w-20" />
        <span className="w-14 mr-2" />
        <span className="hidden md:block text-[10px] font-medium text-foreground/40 uppercase w-8 ml-2">Min</span>
        <div className="hidden md:block flex-[2] ml-1 mr-4">
          <span className="text-[10px] font-medium text-foreground/40 uppercase text-center block">Temperatur</span>
        </div>
        <span className="hidden md:block text-[10px] font-medium text-foreground/40 uppercase w-14">Max</span>
        <span className="md:hidden text-[10px] font-medium text-foreground/40 uppercase flex-1">Temp</span>
        <span className="text-[10px] font-medium text-foreground/40 uppercase flex-1">Regn</span>
        <span className="text-[10px] font-medium text-foreground/40 uppercase flex-1">Vind</span>
        <span className="text-[10px] font-medium text-foreground/40 uppercase flex-1">UV</span>
      </div>
      <div className="space-y-0">
        {visibleDays.map((d, i) => {
          const info = getWeatherInfo(d.weatherCode);
          const date = new Date(d.date + "T00:00:00");
          const dayLabel = i === 0 ? "Idag" : dayNames[date.getDay()];
          const dateStr = `${date.getDate()}/${date.getMonth() + 1}`;
          const label = i === 0 ? dayLabel : `${dayLabel} ${dateStr}`;

          // Get hourly temps for this day
          const dayHourly = allHourly.filter((h) => h.time.startsWith(d.date));
          const temps = dayHourly.map((h) => h.temperature);

          // 1-hour segments (24 per day)
          const segments = temps.map((t) => Math.round(t));

          return (
            <div
              key={d.date}
              className="flex items-center gap-2 py-1 px-2"
            >
              <span className="text-sm font-medium text-foreground w-20 text-left">{label}</span>
              <WeatherIcon iconName={info.icon} size={56} className="text-foreground/70 w-14 mr-2" tooltip={info.label} />
              <span className="hidden md:block text-sm font-medium text-foreground/50 w-8 ml-2">{d.tempMin}°</span>
              <div className="hidden md:block flex-[2] ml-1 mr-4">
                <div className="flex h-1.5 overflow-hidden rounded-full">
                {segments.length > 0 ? segments.map((t, j) => (
                  <Tooltip key={j} delayDuration={500}>
                    <TooltipTrigger asChild>
                      <div
                        className="flex-1 h-full"
                        style={{ backgroundColor: tempToColor(t, d.tempMin, d.tempMax) }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{`${String(j).padStart(2, "0")}:00 — ${t}°`}</p>
                    </TooltipContent>
                  </Tooltip>
                )) : (
                  <div className="flex-1 h-full bg-foreground/20" />
                )}
                </div>
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground/50 w-14">{d.tempMax}°</span>
              <span className="md:hidden text-sm font-medium text-foreground flex-1">{d.tempMax}°</span>
              <span className="text-sm text-foreground/70 flex-1 relative">
                {d.precipitationProbability}%
                {d.precipitationSum > 0 && <span className="absolute left-0 top-full text-xs text-foreground/40">{d.precipitationSum} mm</span>}
              </span>
              <span className="text-sm text-foreground/70 flex-1">{d.windSpeedMax} m/s</span>
              <span className="text-sm text-foreground/70 flex-1">{d.uvIndexMax}</span>
            </div>
          );
        })}
      </div>
      {daily.length > 7 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-4 border-t border-foreground/10 text-xs font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
        >
          {expanded ? "Visa 7 dagar" : "Visa 14 dagar"}
        </button>
      )}
    </div>
  );
};

export default DailyForecast;
