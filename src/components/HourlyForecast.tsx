import {
  HourlyForecast as HourlyType,
  formatMm,
  precipFillPercent,
} from "@/lib/weather";

interface Props {
  hourly: HourlyType[];
}

const VISIBLE = 8;

const HourlyForecast = ({ hourly }: Props) => {
  const visible = hourly.slice(0, VISIBLE);
  const maxMm = Math.max(4, ...visible.map((h) => h.precipitation));

  return (
    <div className="box bg-white p-4 mt-4">
      <div className="text-xs font-bold uppercase tracking-[0.08em]">Nästa timmar</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 mt-2.5 min-w-0">
        {visible.map((h) => {
          const wet = h.precipitation > 0;
          const fill = precipFillPercent(h.precipitation, maxMm);
          return (
            <div
              key={h.time}
              className="relative overflow-hidden border-[3px] border-ink bg-tape min-h-[96px] md:min-h-[118px] min-w-0 px-1 pt-2 pb-2 flex flex-col items-center text-center"
            >
              {wet && (
                <div
                  className="absolute inset-x-0 bottom-0 bg-rain"
                  style={{ height: `${fill}%` }}
                  aria-hidden
                />
              )}
              <span className="relative z-[1] font-bold text-[13px]">{h.time.slice(11, 13)}</span>
              <b className="relative z-[1] block text-[22px] tracking-[-0.04em] mt-0.5">{h.temperature}°</b>
              {wet && (
                <span className="relative z-[1] mt-auto text-[11px] font-bold">{formatMm(h.precipitation)}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HourlyForecast;
