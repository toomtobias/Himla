import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const meteoconMap: Record<string, { day: string; night: string }> = {
  Sun:            { day: "clear-day",                    night: "clear-night" },
  SunMedium:      { day: "mostly-clear-day",             night: "mostly-clear-night" },
  CloudSun:       { day: "partly-cloudy-day",            night: "partly-cloudy-night" },
  Cloud:          { day: "overcast",                     night: "overcast" },
  CloudFog:       { day: "fog-day",                      night: "fog-night" },
  CloudDrizzle:   { day: "partly-cloudy-day-drizzle",    night: "partly-cloudy-night-drizzle" },
  CloudRain:      { day: "overcast-day-rain",            night: "overcast-night-rain" },
  CloudRainWind:  { day: "extreme-day-rain",             night: "extreme-night-rain" },
  Snowflake:      { day: "overcast-day-snow",            night: "overcast-night-snow" },
  CloudLightning: { day: "thunderstorms-day-rain",       night: "thunderstorms-night-rain" },
};

interface Props {
  iconName: string;
  className?: string;
  size?: number;
  tooltip?: string;
  isNight?: boolean;
}

const MeteoconIcon = ({ iconName, className = "", size = 24, tooltip, isNight = false }: Props) => {
  const entry = meteoconMap[iconName];
  const filename = entry
    ? isNight ? entry.night : entry.day
    : "overcast";

  const img = (
    <img
      src={`/meteocons/${filename}.svg`}
      alt={tooltip || iconName}
      width={size}
      height={size}
      className={`drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${className}`}
    />
  );

  if (!tooltip) return img;

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <span>{img}</span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default MeteoconIcon;
