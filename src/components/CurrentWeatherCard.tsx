import { CurrentWeather, getWeatherInfo } from "@/lib/weather";
import WeatherIcon from "./WeatherIcon";

interface Props {
  current: CurrentWeather;
  sunrise: string;
  sunset: string;
  timezone: string;
}

const CurrentWeatherCard = ({ current, sunrise, sunset, timezone }: Props) => {
  const info = getWeatherInfo(current.weatherCode);
  // Get current time in the location's timezone as a comparable local string
  const localNow = new Date(new Date().toLocaleString("en-US", { timeZone: timezone })).getTime();
  const isNight = localNow < new Date(sunrise).getTime() || localNow >= new Date(sunset).getTime();

  return (
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-1">
        <WeatherIcon iconName={info.icon} size={128} className="text-foreground/80" tooltip={info.label} isNight={isNight} />
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
