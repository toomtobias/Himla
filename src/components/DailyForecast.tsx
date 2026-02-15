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
  const dayNames = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];

  return (
    <div className="glass-card p-4">
      <h3 className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
        7-dagars prognos
      </h3>
      {/* Column headers */}
      <div className="flex items-center gap-2 px-2 mb-1">
        <span className="w-[4.5rem]" />
        <span className="w-14" />
        <span className="text-[10px] font-medium text-foreground/40 uppercase w-8 text-right">Min</span>
        <div className="flex-1 mx-1">
          <span className="text-[10px] font-medium text-foreground/40 uppercase text-center block">Temperatur</span>
        </div>
        <span className="text-[10px] font-medium text-foreground/40 uppercase w-8">Max</span>
        <span className="text-[10px] font-medium text-foreground/40 uppercase w-12 text-center">Regn</span>
        <span className="text-[10px] font-medium text-foreground/40 uppercase w-12 text-center">Vind</span>
        <span className="text-[10px] font-medium text-foreground/40 uppercase w-10 text-center">UV</span>
      </div>
      <div className="space-y-0">
        {daily.map((d, i) => {
          const info = getWeatherInfo(d.weatherCode);
          const date = new Date(d.date + "T00:00:00");
          const label = i === 0 ? "Idag" : dayNames[date.getDay()];

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
              <span className="text-sm font-medium text-foreground w-[4.5rem] text-left">{label}</span>
              <WeatherIcon iconName={info.icon} size={44} className="text-foreground/70 w-14" tooltip={info.label} />
              <span className="text-sm font-medium text-foreground/50 w-8 text-right">{d.tempMin}°</span>
              <div className="flex-1 mx-1">
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
              <span className="text-sm font-medium text-foreground/50 w-8">{d.tempMax}°</span>
              <span className="text-xs text-foreground/70 w-12 text-center">{d.precipitationProbability}%</span>
              <span className="text-xs text-foreground/70 w-12 text-center">{d.windSpeedMax} m/s</span>
              <span className="text-xs text-foreground/70 w-10 text-center">{d.uvIndexMax}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DailyForecast;
