import { useState, useRef, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import { searchLocations, GeoLocation } from "@/lib/weather";

interface Props {
  onSelect: (location: GeoLocation) => void;
}

const SearchBar = ({ onSelect }: Props) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    clearTimeout(timeoutRef.current);
    if (val.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timeoutRef.current = setTimeout(async () => {
      const locs = await searchLocations(val);
      setResults(locs);
      setOpen(locs.length > 0);
      setLoading(false);
    }, 300);
  };

  const handleSelect = (loc: GeoLocation) => {
    onSelect(loc);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-md mx-auto">
      <div className="glass-card flex items-center gap-3 px-4 py-3">
        <Search className="text-foreground/50 shrink-0" size={20} />
        <input
          type="text"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-transparent w-full outline-none text-foreground placeholder:text-foreground/40 text-base"
        />
      </div>
      {open && (
        <div className="absolute top-full mt-2 w-full glass-card overflow-hidden z-50">
          {results.map((loc, i) => (
            <button
              key={`${loc.latitude}-${loc.longitude}-${i}`}
              onClick={() => handleSelect(loc)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-foreground/5 transition-colors"
            >
              <MapPin size={16} className="text-primary shrink-0" />
              <span className="text-sm text-foreground">
                {loc.name}, {loc.country}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
