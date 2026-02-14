import {
  Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudRainWind,
  CloudLightning, CloudFog, Snowflake, Moon, CloudMoon,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudRainWind,
  CloudLightning, CloudFog, Snowflake, Moon, CloudMoon,
};

const nightMap: Record<string, string> = {
  Sun: "Moon",
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
  const resolvedName = isNight && nightMap[iconName] ? nightMap[iconName] : iconName;
  const Icon = iconMap[resolvedName] || Cloud;
  return (
    <span title={tooltip}>
      <Icon className={className} size={size} />
    </span>
  );
};

export default WeatherIcon;
