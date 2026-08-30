import { useState } from "react";
import {
  HourlyForecast as HourlyType,
  getWeatherInfo,
  getWindDirection,
  snapWindDegrees,
} from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";

interface Props {
  hourly: HourlyType[];
  sunrises: string[];
  sunsets: string[];
}

function tempToColor(temp: number, min: number, max: number): string {
  const range = max - min || 1;
  const ratio = (temp - min) / range;
  const r = Math.round(140 + ratio * (235 - 140));
  const g = Math.round(175 + ratio * (180 - 175));
  const b = Math.round(215 + ratio * (60 - 215));
  return `rgb(${r},${g},${b})`;
}

function isNightAt(time: string, sunrises: string[], sunsets: string[]): boolean {
  const hourTime = new Date(time).getTime();
  const dayStr = time.slice(0, 10);
  const dayIndex = sunrises.findIndex((s) => s.startsWith(dayStr));
  const sr = new Date(sunrises[dayIndex >= 0 ? dayIndex : 0]).getTime();
  const ss = new Date(sunsets[dayIndex >= 0 ? dayIndex : 0]).getTime();
  return hourTime < sr || hourTime >= ss;
}

function formatPrecip(h: HourlyType): string {
  if (h.precipitation > 0) {
    return `${h.precipitation} mm · ${h.precipitationProbability}%`;
  }
  if (h.precipitationProbability >= 30) {
    return `${h.precipitationProbability}%`;
  }
  return "–";
}

const HourlyForecast = ({ hourly, sunrises, sunsets }: Props) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? hourly : hourly.slice(0, 12);
  const temps = visible.map((h) => h.temperature);
  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);

  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
        {expanded ? "Närmsta 24 timmarna" : "Närmsta 12 timmarna"}
      </h3>
      <div className="overflow-x-auto px-2">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-[10px] font-medium text-foreground/40 uppercase">
              <th className="p-0 pb-2 pr-3 text-left font-medium w-12">Tid</th>
              <th className="p-0 pb-2 pr-3 text-left font-medium">Väder</th>
              <th className="p-0 pb-2 pr-3 text-left font-medium">Temp</th>
              <th className="p-0 pb-2 pr-3 text-left font-medium">Nederbörd</th>
              <th className="p-0 pb-2 pr-3 text-left font-medium">Vind m/s</th>
              <th className="p-0 pb-2 text-left font-medium hidden md:table-cell">UV</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((h) => {
              const info = getWeatherInfo(h.weatherCode);
              const hour = new Date(h.time);
              const label = hour.toLocaleTimeString("sv-SE", { hour: "2-digit" });
              const night = isNightAt(h.time, sunrises, sunsets);
              const windDir = getWindDirection(h.windDirection);
              return (
                <tr key={h.time} className="border-t border-foreground/5">
                  <td className="p-0 py-1.5 pr-3 text-left font-medium text-foreground tabular-nums whitespace-nowrap">
                    {label}
                  </td>
                  <td className="p-0 py-1.5 pr-3 text-left">
                    <div className="flex items-center gap-2 min-w-0">
                      <WeatherIcon
                        iconName={info.icon}
                        size={48}
                        className="text-foreground/70 shrink-0"
                        isNight={night}
                      />
                      <span className="truncate text-foreground/80">
                        {info.label}
                      </span>
                    </div>
                  </td>
                  <td className="p-0 py-1.5 pr-3 text-left">
                    <div className="flex items-center gap-2">
                      <div
                        className="hidden md:block w-8 h-1.5 rounded-full"
                        style={{ backgroundColor: tempToColor(h.temperature, minT, maxT) }}
                        aria-hidden
                      />
                      <span className="font-medium text-foreground tabular-nums">{h.temperature}°</span>
                    </div>
                  </td>
                  <td className="p-0 py-1.5 pr-3 text-left text-foreground/80 tabular-nums whitespace-nowrap">
                    {formatPrecip(h)}
                  </td>
                  <td className="p-0 py-1.5 pr-3 text-left text-foreground/80 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1">
                      <span
                        style={{ transform: `rotate(${snapWindDegrees(h.windDirection)}deg)` }}
                        className="inline-block"
                        title={windDir}
                      >
                        ↓
                      </span>
                      {h.windSpeed}
                      {h.windGusts > h.windSpeed && (
                        <span className="text-foreground/40"> ({h.windGusts})</span>
                      )}
                    </span>
                  </td>
                  <td className="p-0 py-1.5 text-left text-foreground/80 tabular-nums hidden md:table-cell">
                    {h.uvIndex}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {hourly.length > 12 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 pt-4 border-t border-foreground/10 text-xs font-medium text-foreground/50 hover:text-foreground/70 transition-colors"
        >
          {expanded ? "Visa 12 timmar" : "Visa 24 timmar"}
        </button>
      )}
    </div>
  );
};

export default HourlyForecast;
