import {
  Sun, SunMedium, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudRainWind,
  CloudLightning, CloudFog, Snowflake, Moon, MoonStar, CloudMoon,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useIconStyle } from "@/contexts/IconProvider";
import MeteoconIcon from "@/components/MeteoconIcon";

const iconMap: Record<string, React.ComponentType<any>> = {
  Sun, SunMedium, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudRainWind,
  CloudLightning, CloudFog, Snowflake, Moon, MoonStar, CloudMoon,
};

const nightMap: Record<string, string> = {
  Sun: "Moon",
  SunMedium: "MoonStar",
  CloudSun: "CloudMoon",
};

interface Props {
  iconName: string;
  className?: string;
  size?: number;
  tooltip?: string;
  isNight?: boolean;
}

const WeatherIcon = ({ iconName, className = "", size = 24, tooltip, isNight = false }: Props) => {
  const { iconStyle } = useIconStyle();

  if (iconStyle === "meteocons") {
    return <MeteoconIcon iconName={iconName} className={className} size={size} tooltip={tooltip} isNight={isNight} />;
  }

  const resolvedName = isNight && nightMap[iconName] ? nightMap[iconName] : iconName;
  const Icon = iconMap[resolvedName] || Cloud;

  if (!tooltip) {
    return <Icon className={className} size={size} />;
  }

  return (
    <Tooltip delayDuration={500}>
      <TooltipTrigger asChild>
        <span>
          <Icon className={className} size={size} />
        </span>
      </TooltipTrigger>
      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default WeatherIcon;
