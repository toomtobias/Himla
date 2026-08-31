import { Skeleton } from "@/components/ui/skeleton";

const WeatherSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="pb-6">
        <div className="flex items-center justify-center gap-3">
          <Skeleton className="h-16 w-16 rounded-full bg-white/20" />
          <Skeleton className="h-16 w-28 bg-white/20" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-24 bg-white/20" />
            <Skeleton className="h-4 w-28 bg-white/20" />
          </div>
        </div>
        <Skeleton className="mt-4 h-8 w-full rounded-full bg-white/20" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-12 flex-1 rounded-2xl bg-white/20" />
          ))}
        </div>
      </div>

      <div className="glass-card p-4">
        <Skeleton className="h-3 w-40 mb-3 bg-white/20" />
        <div className="space-y-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-8 bg-white/20" />
              <Skeleton className="h-5 w-5 rounded-full bg-white/20" />
              <Skeleton className="h-4 w-24 bg-white/20" />
              <Skeleton className="h-4 w-10 bg-white/20" />
              <Skeleton className="h-4 flex-1 bg-white/20" />
            </div>
          ))}
        </div>
      </div>

      <div className="pt-6">
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
      </div>
    </div>
  );
};

export default WeatherSkeleton;
