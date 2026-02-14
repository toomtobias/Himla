import { useState, useEffect, useRef } from "react";
import { GeoLocation, searchLocations } from "@/lib/weather";

interface HeaderProps {
  onSelectLocation: (location: GeoLocation) => void;
}

export default function Header({
  onSelectLocation,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchLocations(searchQuery);
        setSearchResults(results);
        setShowDropdown(results.length > 0);
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
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (loc: GeoLocation) => {
    onSelectLocation(loc);
    setSearchQuery("");
    setShowDropdown(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-3">
      <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <span className="text-base font-semibold whitespace-nowrap text-slate-700">
              Himla
            </span>

            {/* Search */}
            <div ref={searchRef} className="relative flex-shrink-0">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-800">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <input
                type="text"
                placeholder="Sök plats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
                className="w-40 sm:w-48 pl-6 pr-3 py-1.5 bg-transparent border-b border-slate-800 placeholder:text-slate-600 text-sm text-slate-800 focus:outline-none focus:border-black"
                aria-label="Sök efter plats"
              />

              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 rounded-full animate-spin border-slate-300 border-t-slate-600" />
                </div>
              )}

              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-sky-100 border border-white/30 rounded-xl shadow-xl overflow-hidden">
                  {searchResults.map((result, i) => (
                    <button
                      key={`${result.latitude}-${result.longitude}-${i}`}
                      onClick={() => handleSelect(result)}
                      className="w-full px-4 py-3 text-left hover:bg-white/20 transition-colors flex items-center gap-3"
                    >
                      <svg className="w-4 h-4 flex-shrink-0 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0">
                        <div className="font-medium text-sm truncate text-slate-900">{result.name}</div>
                        <div className="text-xs truncate text-slate-700">
                          {result.country}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
      </div>
    </div>
  );
}
