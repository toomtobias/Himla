import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Clock } from "lucide-react";
import { GeoLocation, searchLocations } from "@/lib/weather";

interface HeaderProps {
  location: string;
  country: string;
  admin1?: string;
  timezone: string;
  onSelectLocation: (location: GeoLocation) => void;
  recentLocations: () => GeoLocation[];
}

export default function Header({
  location,
  country,
  admin1,
  timezone,
  onSelectLocation,
  recentLocations,
}: HeaderProps) {
  const [localTime, setLocalTime] = useState("");

  useEffect(() => {
    if (!timezone) return;
    const update = () => {
      const now = new Date();
      const day = now.toLocaleDateString("sv-SE", { timeZone: timezone, weekday: "long" });
      const time = now.toLocaleTimeString("sv-SE", { timeZone: timezone, hour: "2-digit", minute: "2-digit" });
      setLocalTime(`${day.charAt(0).toUpperCase() + day.slice(1)} ${time}`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [timezone]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
        setSearchQuery("");
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const recent = recentLocations();
  const showRecent = searchOpen && searchQuery.length < 2 && recent.length > 0;
  const showResults = searchOpen && searchResults.length > 0 && searchQuery.length >= 2;

  return (
    <div ref={searchRef} className="max-w-lg md:max-w-2xl mx-auto px-4 pt-6 pb-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base font-semibold whitespace-nowrap text-slate-700">
            Himla
          </span>
          {location && (
            <>
              <span className="text-sm text-slate-800">|</span>
              <MapPin size={14} className="text-slate-800 shrink-0" />
              <span className="text-sm font-medium truncate text-slate-800">
                {location}{admin1 ? ` - ${admin1}` : ""}, {country}
              </span>
              {localTime && (
                <>
                  <span className="text-sm text-slate-800">|</span>
                  <span className="text-sm text-slate-800 whitespace-nowrap">{localTime}</span>
                </>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors ${searchOpen ? "bg-white/20" : ""}`}
            aria-label="Sök plats"
          >
            <Search size={20} className="text-slate-800" />
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="mt-3 relative z-50">
          <div className="glass-card flex items-center gap-3 px-4 py-3">
            <Search className="text-foreground/50 shrink-0" size={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Sök efter plats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent w-full outline-none text-foreground placeholder:text-foreground/40 text-base"
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 rounded-full animate-spin border-slate-300 border-t-slate-600 shrink-0" />
            )}
          </div>

          {showRecent && (
            <div className="absolute left-0 right-0 mt-2 glass-card overflow-hidden shadow-xl">
              <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                Senaste
              </div>
              {recent.map((loc, i) => (
                <button
                  key={`${loc.latitude}-${loc.longitude}-${i}`}
                  onClick={() => handleSelect(loc)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5 transition-colors"
                >
                  <Clock size={14} className="flex-shrink-0 text-foreground/50" />
                  <span className="text-sm text-foreground">
                    {loc.name}{loc.admin1 ? ` - ${loc.admin1}` : ""}, {loc.country}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showResults && (
            <div className="absolute left-0 right-0 mt-2 glass-card overflow-hidden shadow-xl">
              {searchResults.map((result, i) => (
                <button
                  key={`${result.latitude}-${result.longitude}-${i}`}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5 transition-colors"
                >
                  <svg className="w-4 h-4 flex-shrink-0 text-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-foreground">
                    {result.name}{result.admin1 ? ` - ${result.admin1}` : ""}, {result.country}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
