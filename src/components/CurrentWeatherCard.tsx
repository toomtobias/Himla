import { CurrentWeather, GeoLocation, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";
import { MapPin } from "lucide-react";

interface Props {
  current: CurrentWeather;
  location: GeoLocation;
}

const CurrentWeatherCard = ({ current, location }: Props) => {
  const info = getWeatherInfo(current.weatherCode);

  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-1.5 text-foreground/70">
        <MapPin size={14} />
        <span className="text-sm font-medium">{location.name}, {location.country}</span>
      </div>
      <div className="flex items-center justify-center gap-4">
        <WeatherIcon iconName={info.icon} size={64} className="text-foreground/80" />
        <span className="text-8xl font-extralight tracking-tighter text-foreground">
          {current.temperature}°
        </span>
      </div>
      <p className="text-lg text-foreground/70 font-medium">{info.label}</p>
      <p className="text-sm text-foreground/50">
        Känns som {current.feelsLike}°
      </p>
    </div>
  );
};

export default CurrentWeatherCard;
