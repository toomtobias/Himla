import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper text-ink px-6">
      <div className="box bg-white p-8 text-center max-w-md">
        <h1 className="mb-3 text-6xl font-bold tracking-[-0.06em]">404</h1>
        <p className="mb-6 font-bold uppercase tracking-[0.08em]">Sidan hittades inte</p>
        <a href="/" className="font-bold underline">
          Tillbaka till startsidan
        </a>
      </div>
    </div>
  );
};

export default NotFound;
