import MeteoconIcon from "@/components/MeteoconIcon";

interface Props {
  iconName: string;
  className?: string;
  size?: number;
  tooltip?: string;
  isNight?: boolean;
}

const WeatherIcon = ({ iconName, className = "", size = 24, tooltip, isNight = false }: Props) => {
  return <MeteoconIcon iconName={iconName} className={className} size={size} tooltip={tooltip} isNight={isNight} />;
};

export default WeatherIcon;
