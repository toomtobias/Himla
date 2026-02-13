import {
  Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudRainWind,
  CloudLightning, CloudFog, Snowflake,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<any>> = {
  Sun, Cloud, CloudSun, CloudRain, CloudDrizzle, CloudRainWind,
  CloudLightning, CloudFog, Snowflake,
};

interface Props {
  iconName: string;
  className?: string;
  size?: number;
}

const WeatherIcon = ({ iconName, className = "", size = 24 }: Props) => {
  const Icon = iconMap[iconName] || Cloud;
  return <Icon className={className} size={size} />;
};

export default WeatherIcon;
