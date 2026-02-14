import { Skeleton } from "@/components/ui/skeleton";

const WeatherSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Current weather */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="h-4 w-40 bg-white/20" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
          <Skeleton className="h-20 w-32 bg-white/20" />
        </div>
        <Skeleton className="h-5 w-28 bg-white/20" />
        <Skeleton className="h-4 w-24 bg-white/20" />
      </div>

      {/* Hourly forecast */}
      <div className="glass-card p-4">
        <Skeleton className="h-3 w-24 mb-3 bg-white/20" />
        <div className="flex gap-5 overflow-hidden">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[50px]">
              <Skeleton className="h-3 w-8 bg-white/20" />
              <Skeleton className="h-6 w-6 rounded-full bg-white/20" />
              <Skeleton className="h-4 w-8 bg-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Daily forecast */}
      <div className="glass-card p-4">
        <Skeleton className="h-3 w-32 mb-3 bg-white/20" />
        <div className="space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-10 bg-white/20" />
              <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
              <Skeleton className="h-4 w-6 bg-white/20" />
              <Skeleton className="h-1.5 flex-1 bg-white/20" />
              <Skeleton className="h-4 w-6 bg-white/20" />
              <Skeleton className="h-4 w-10 bg-white/20" />
            </div>
          ))}
        </div>
      </div>

      {/* Detail cards */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card p-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-20 bg-white/20" />
            <Skeleton className="h-7 w-16 bg-white/20" />
          </div>
        ))}
      </div>

      {/* Sun card */}
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="glass-card p-4 flex flex-col gap-2">
            <Skeleton className="h-3 w-20 bg-white/20" />
            <Skeleton className="h-7 w-16 bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherSkeleton;
