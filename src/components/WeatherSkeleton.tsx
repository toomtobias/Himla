const WeatherSkeleton = () => {
  return (
    <div className="mt-[18px] space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-4">
        <div className="box bg-white p-[18px] min-h-[220px]" />
        <div className="box bg-now p-[22px] min-h-[220px]" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="box bg-wind h-[110px]" />
        <div className="box bg-rain h-[110px]" />
        <div className="box bg-white h-[110px]" />
        <div className="box bg-tape h-[110px]" />
      </div>
      <div className="box bg-white p-4 h-[168px]" />
      <div className="box bg-white h-[520px]" />
    </div>
  );
};

export default WeatherSkeleton;
