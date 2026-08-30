import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Clock } from "lucide-react";
import { GeoLocation, searchLocations, formatCountry, formatLocationLabel } from "@/lib/weather";
import { cn } from "@/lib/utils";

interface HeaderProps {
  location: string;
  country: string;
  countryCode?: string;
  admin1?: string;
  timezone: string;
  onSelectLocation: (location: GeoLocation) => void;
  recentLocations: () => GeoLocation[];
}

export default function Header({
  location,
  country,
  countryCode,
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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setHighlightedIndex(0);
    setIsSearching(false);
  };

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        closeSearch();
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

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeSearch();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [searchOpen]);

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    closeSearch();
  };

  const recent = recentLocations();
  const showRecent = searchOpen && searchQuery.length < 2 && recent.length > 0;
  const showResults = searchOpen && searchResults.length > 0 && searchQuery.length >= 2;
  const showEmpty =
    searchOpen && searchQuery.length >= 2 && !isSearching && searchResults.length === 0;
  const listItems = showRecent ? recent : showResults ? searchResults : [];

  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery, searchResults, showRecent]);

  useEffect(() => {
    optionRefs.current[highlightedIndex]?.scrollIntoView?.({ block: "nearest" });
  }, [highlightedIndex]);

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      closeSearch();
      return;
    }
    if (!listItems.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((i) => (i + 1) % listItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((i) => (i - 1 + listItems.length) % listItems.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const loc = listItems[highlightedIndex];
      if (loc) handleSelect(loc);
    }
  };

  const countryLabel = formatCountry(country, countryCode);

  return (
    <div ref={searchRef} className="max-w-lg md:max-w-3xl mx-auto px-4 pt-6 pb-3">
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
                {location}{admin1 ? ` - ${admin1}` : ""}{countryLabel ? `, ${countryLabel}` : ""}
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
            onClick={() => (searchOpen ? closeSearch() : setSearchOpen(true))}
            className={`p-1.5 rounded-lg hover:bg-white/20 transition-colors ${searchOpen ? "bg-white/20" : ""}`}
            aria-label="Sök plats"
            aria-expanded={searchOpen}
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
              onKeyDown={handleSearchKeyDown}
              role="combobox"
              aria-expanded={showRecent || showResults || showEmpty}
              aria-controls="location-search-results"
              aria-activedescendant={
                listItems.length > 0 ? `search-option-${highlightedIndex}` : undefined
              }
              aria-autocomplete="list"
              aria-busy={isSearching}
              className="bg-transparent w-full outline-none text-foreground placeholder:text-foreground/40 text-base"
            />
            {isSearching && (
              <div className="w-4 h-4 border-2 rounded-full animate-spin border-slate-300 border-t-slate-600 shrink-0" />
            )}
          </div>

          {(showRecent || showResults || showEmpty) && (
            <div
              id="location-search-results"
              role={showEmpty ? "status" : "listbox"}
              aria-label={showRecent ? "Senaste platser" : "Sökresultat"}
              className="absolute left-0 right-0 mt-2 glass-card overflow-hidden shadow-xl"
            >
              {showRecent && (
                <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/40">
                  Senaste
                </div>
              )}
              {showEmpty && (
                <p className="px-4 py-3 text-sm text-foreground/50">Inga platser hittades</p>
              )}
              {listItems.map((loc, i) => {
                const isHighlighted = highlightedIndex === i;
                return (
                  <button
                    key={`${loc.latitude}-${loc.longitude}-${i}`}
                    id={`search-option-${i}`}
                    ref={(el) => {
                      optionRefs.current[i] = el;
                    }}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setHighlightedIndex(i)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                      isHighlighted ? "bg-foreground/10" : "hover:bg-foreground/5",
                    )}
                  >
                    {showRecent ? (
                      <Clock size={14} className="flex-shrink-0 text-foreground/50" />
                    ) : (
                      <MapPin size={16} className="flex-shrink-0 text-foreground/50" />
                    )}
                    <span className="text-sm text-foreground">{formatLocationLabel(loc)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
