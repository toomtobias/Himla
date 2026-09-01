import { useState, useEffect, useRef } from "react";
import { GeoLocation, searchLocations, formatLocationLabel } from "@/lib/weather";
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
  onSelectLocation,
  recentLocations,
}: HeaderProps) {
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
    inputRef.current?.blur();
  };

  useEffect(() => {
    if (!searchOpen || searchQuery.length < 2) {
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
  }, [searchQuery, searchOpen]);

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
  const showList = showRecent || showResults || showEmpty || (searchOpen && isSearching);

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

  return (
    <div className="flex items-stretch gap-3 md:gap-4">
      <div className="box bg-brand px-4 py-3 text-[22px] font-bold leading-none shrink-0 flex items-center">
        HIMLA
      </div>
      <div ref={searchRef} className="relative flex-1 min-w-0 z-50">
        <div className={cn("box overflow-hidden", showList && "relative")}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Sök plats"
            value={searchOpen ? searchQuery : location}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              setSearchOpen(true);
              setSearchQuery("");
            }}
            onKeyDown={handleSearchKeyDown}
            role="combobox"
            aria-label="Sök plats"
            aria-expanded={showRecent || showResults || showEmpty}
            aria-controls="location-search-results"
            aria-activedescendant={
              listItems.length > 0 ? `search-option-${highlightedIndex}` : undefined
            }
            aria-autocomplete="list"
            aria-busy={isSearching}
            className={cn(
              "w-full bg-transparent px-4 py-3 text-lg font-semibold outline-none placeholder:text-ink/40",
              !searchOpen && "uppercase",
            )}
          />

          {showList && (
            <div
              id="location-search-results"
              role={showEmpty || isSearching ? "status" : "listbox"}
              aria-label={showRecent ? "Senaste platser" : "Sökresultat"}
              className="border-t-[3px] border-ink"
            >
              {showRecent && (
                <div className="bg-ink px-4 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-white">
                  Senaste
                </div>
              )}
              {isSearching && (
                <p className="px-4 py-3 text-sm font-semibold">Söker…</p>
              )}
              {showEmpty && (
                <p className="px-4 py-3 text-sm font-semibold">Inga platser hittades</p>
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
                      "w-full px-4 py-3 text-left text-sm font-semibold border-t-[3px] border-ink",
                      isHighlighted ? "bg-ink text-white" : "bg-white text-ink",
                    )}
                  >
                    {formatLocationLabel(loc)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
