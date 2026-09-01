import {
  DailyForecast as DailyType,
  HourlyForecast as HourlyType,
  DAY_PARTS,
  aggregateDayParts,
  formatMm,
  precipFillPercent,
  localHourInZone,
  type DayPartSlot,
} from "@/lib/weather";
import { cn } from "@/lib/utils";

interface Props {
  daily: DailyType[];
  allHourly: HourlyType[];
  timezone: string;
}

const DAY_NAMES = ["Sön", "Mån", "Tis", "Ons", "Tors", "Fre", "Lör"];

function SlotCell({
  slot,
  fill,
  past,
  current,
  labeled,
}: {
  slot: DayPartSlot;
  fill: number;
  past: boolean;
  current: boolean;
  labeled?: boolean;
}) {
  const wet = slot.precip > 0;
  return (
    <div
      className={cn(
        "relative overflow-hidden border-[3px] md:border-0 md:border-l-[3px] border-ink min-h-[72px] md:min-h-[86px] min-w-0 px-1 md:px-2 py-2 md:py-3 flex flex-col justify-center items-center gap-0.5",
        current ? "bg-now" : "bg-white",
        past && "opacity-[0.38]",
      )}
    >
      {wet && (
        <div
          className="absolute inset-x-0 bottom-0 bg-rain"
          style={{ height: `${fill}%` }}
          aria-hidden
        />
      )}
      {current && (
        <span className="absolute top-1.5 right-1.5 z-[1] text-[10px] font-bold tracking-[0.1em] bg-ink text-now px-1 py-0.5">
          NU
        </span>
      )}
      {labeled && (
        <span className="relative z-[1] text-[10px] font-bold uppercase tracking-[0.08em]">
          {slot.shortLabel}
        </span>
      )}
      <span className="relative z-[1] text-[22px] md:text-[28px] font-bold tracking-[-0.05em] leading-none">
        {slot.temp == null ? "—" : `${slot.temp}°`}
      </span>
      {wet && (
        <span className="relative z-[1] text-[11px] font-bold">{formatMm(slot.precip)}</span>
      )}
    </div>
  );
}

const DailyForecast = ({ daily, allHourly, timezone }: Props) => {
  const visibleDays = daily.slice(0, 7);
  const nowHour = timezone ? localHourInZone(new Date(), timezone) : new Date().getHours();
  const todayDate = visibleDays[0]?.date;

  const slotsByDay = visibleDays.map((d) => {
    const hours = allHourly.filter((h) => h.time.startsWith(d.date));
    return aggregateDayParts(hours);
  });
  const maxMm = Math.max(
    8,
    ...slotsByDay.flatMap((slots) => slots.map((s) => s.precip)),
  );

  return (
    <div className="box bg-white mt-4 min-w-0 overflow-hidden">
      <div className="hidden md:grid md:grid-cols-[92px_repeat(4,1fr)] bg-ink text-white text-center py-2.5">
        <div className="text-left pl-3.5 flex items-center">
          <strong className="text-xs tracking-[0.08em]">VECKAN</strong>
        </div>
        {DAY_PARTS.map((part) => (
          <div key={part.id} className="flex flex-col gap-0.5 min-w-0 px-0.5">
            <strong className="text-xs tracking-[0.08em] uppercase">{part.label}</strong>
            <span className="text-[11px] font-medium text-white/55">{part.hours}</span>
          </div>
        ))}
      </div>
      <div className="md:hidden bg-ink text-white px-3 py-2.5">
        <strong className="text-xs tracking-[0.08em]">VECKAN</strong>
      </div>

      {visibleDays.map((d, i) => {
        const date = new Date(d.date + "T12:00:00");
        const name = i === 0 ? "IDAG" : DAY_NAMES[date.getDay()].toUpperCase();
        const isToday = d.date === todayDate;
        const slots = slotsByDay[i];

        return (
          <div key={d.date} className="border-t-[3px] border-ink">
            <div className="hidden md:grid md:grid-cols-[92px_repeat(4,1fr)]">
              <div className="flex items-center px-3.5 font-bold tracking-[0.06em] text-sm">
                {name}
              </div>
              {slots.map((slot, si) => {
                const part = DAY_PARTS[si];
                return (
                  <SlotCell
                    key={slot.id}
                    slot={slot}
                    fill={precipFillPercent(slot.precip, maxMm)}
                    past={isToday && nowHour >= part.end}
                    current={isToday && nowHour >= part.start && nowHour < part.end}
                  />
                );
              })}
            </div>

            <div className="md:hidden p-3">
              <div className="font-bold tracking-[0.06em] text-sm mb-2">{name}</div>
              <div className="grid grid-cols-2 gap-2">
                {slots.map((slot, si) => {
                  const part = DAY_PARTS[si];
                  return (
                    <SlotCell
                      key={slot.id}
                      slot={slot}
                      labeled
                      fill={precipFillPercent(slot.precip, maxMm)}
                      past={isToday && nowHour >= part.end}
                      current={isToday && nowHour >= part.start && nowHour < part.end}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DailyForecast;
