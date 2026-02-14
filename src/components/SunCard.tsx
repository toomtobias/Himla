import { Sunrise, Sunset } from "lucide-react";

interface Props {
  sunrise: string;
  sunset: string;
}

const formatTime = (iso: string) => {
  const date = new Date(iso);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const SunCard = ({ sunrise, sunset }: Props) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="glass-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-foreground/50">
          <Sunrise size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Sunrise</span>
        </div>
        <span className="text-2xl font-semibold text-foreground">{formatTime(sunrise)}</span>
      </div>
      <div className="glass-card p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-foreground/50">
          <Sunset size={14} />
          <span className="text-xs font-semibold uppercase tracking-wider">Sunset</span>
        </div>
        <span className="text-2xl font-semibold text-foreground">{formatTime(sunset)}</span>
      </div>
    </div>
  );
};

export default SunCard;
