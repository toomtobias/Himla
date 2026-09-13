import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ZOOM,
  MAX_ZOOM,
  MIN_ZOOM,
  TILE_SIZE,
  basemapTileUrl,
  fetchRadarIndex,
  formatRadarAge,
  formatRadarClock,
  mapOrigin,
  radarOverlay,
  radarTileUrl,
  visibleTiles,
  worldToScreen,
  type RadarIndex,
} from "@/lib/radar";

interface Props {
  latitude: number;
  longitude: number;
  locationName: string;
  timezone: string;
}

const REFRESH_MS = 2 * 60 * 1000;
const FRAME_MS = 420;

function PlayGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <path d="M3 1.5v11L12 7 3 1.5Z" fill="currentColor" />
    </svg>
  );
}

function PauseGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
      <rect x="2.5" y="1.5" width="3.5" height="11" fill="currentColor" />
      <rect x="8" y="1.5" width="3.5" height="11" fill="currentColor" />
    </svg>
  );
}

const RadarView = ({ latitude, longitude, locationName, timezone }: Props) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);

  const [index, setIndex] = useState<RadarIndex | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [dragging, setDragging] = useState(false);

  const frames = index?.frames ?? [];
  const current = frames[Math.min(frame, Math.max(0, frames.length - 1))];
  const panned = pan.x !== 0 || pan.y !== 0;
  const origin = useMemo(
    () => mapOrigin(latitude, longitude, zoom, size.w, size.h, pan.x, pan.y),
    [latitude, longitude, zoom, size.w, size.h, pan.x, pan.y],
  );
  const tiles = useMemo(
    () => visibleTiles(origin.x, origin.y, size.w, size.h, zoom),
    [origin.x, origin.y, size.w, size.h, zoom],
  );
  const overlay = useMemo(
    () => radarOverlay(origin.x, origin.y, size.w, size.h, zoom),
    [origin.x, origin.y, size.w, size.h, zoom],
  );
  const pin = useMemo(
    () => worldToScreen(latitude, longitude, zoom, origin.x, origin.y),
    [latitude, longitude, zoom, origin.x, origin.y],
  );

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const next = await fetchRadarIndex();
        if (cancelled) return;
        if (next.frames.length === 0) throw new Error("Kunde inte hämta radar");
        setIndex(next);
        setError(null);
        setFrame(next.frames.length - 1);
      } catch {
        if (!cancelled) setError("Kunde inte hämta radar");
      }
    };
    load();
    const id = window.setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    setPan({ x: 0, y: 0 });
    setZoom(DEFAULT_ZOOM);
  }, [latitude, longitude]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || frames.length < 2) return;
    if (frame >= frames.length - 1) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setFrame((currentFrame) => currentFrame + 1);
    }, FRAME_MS);
    return () => window.clearTimeout(timer);
  }, [playing, frame, frames.length]);

  const zoomBy = (delta: number) => {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom + delta));
    if (next === zoom) return;
    const factor = 2 ** (next - zoom);
    setZoom(next);
    setPan((currentPan) => ({ x: currentPan.x * factor, y: currentPan.y * factor }));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    setPan({
      x: drag.panX - (e.clientX - drag.startX),
      y: drag.panY - (e.clientY - drag.startY),
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
    setDragging(false);
  };

  const clock = current ? formatRadarClock(current.time, timezone) : "—";
  const age = current ? formatRadarAge(current.time) : "";

  return (
    <section className="box bg-white mt-4 overflow-hidden" aria-label="Regnradar">
      <div className="px-3.5 py-2.5 border-b-[3px] border-ink">
        <div className="text-xs font-bold uppercase tracking-[0.08em]">Regnradar</div>
        <div className="text-[11px] font-semibold text-ink/70 truncate">
          {current?.nowcast ? "Prognos" : age}
          {current ? ` · ${clock}` : ""}
        </div>
      </div>

      <div
        ref={viewportRef}
        className={cn(
          "relative h-[260px] md:h-[340px] bg-[#e8e4dc] overflow-hidden touch-none select-none",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {tiles.map((tile) => (
          <img
            key={`map-${tile.x}-${tile.y}`}
            alt=""
            draggable={false}
            src={basemapTileUrl(zoom, tile.x, tile.y)}
            className="absolute pointer-events-none"
            style={{
              width: TILE_SIZE,
              height: TILE_SIZE,
              left: tile.left,
              top: tile.top,
            }}
          />
        ))}
        {index &&
          current &&
          overlay.tiles.map((tile) => (
            <img
              key={`radar-${tile.x}-${tile.y}`}
              alt=""
              draggable={false}
              src={radarTileUrl(
                index.host,
                current.path,
                overlay.zoom,
                tile.x,
                tile.y,
              )}
              className="absolute pointer-events-none"
              style={{
                width: TILE_SIZE * overlay.scale,
                height: TILE_SIZE * overlay.scale,
                left: tile.left,
                top: tile.top,
              }}
            />
          ))}

        <div
          className="pointer-events-none absolute z-10 flex flex-col items-center"
          style={{ left: pin.x, top: pin.y, transform: "translate(-50%, -50%)" }}
        >
          <span className="absolute bottom-[calc(100%+6px)] bg-tape border-[3px] border-ink px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] whitespace-nowrap">
            {locationName}
          </span>
          <span className="block w-3.5 h-3.5 bg-brand border-[3px] border-ink shadow-[3px_3px_0_#111]" />
        </div>

        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => zoomBy(1)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Zooma in"
            className="w-9 h-9 border-[3px] border-ink bg-white font-bold text-lg leading-none disabled:opacity-35"
          >
            +
          </button>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => zoomBy(-1)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Zooma ut"
            className="w-9 h-9 border-[3px] border-ink bg-white font-bold text-lg leading-none disabled:opacity-35"
          >
            −
          </button>
        </div>

        {panned && (
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setPan({ x: 0, y: 0 })}
            className="absolute top-3 left-[3.25rem] z-10 border-[3px] border-ink bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
          >
            Centrera
          </button>
        )}

        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 font-bold">
            {error}
          </div>
        )}

        <div className="pointer-events-none absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3 z-10">
          <div className="bg-white/90 border-[3px] border-ink px-2 py-1">
            <div className="h-1.5 w-[88px] bg-[linear-gradient(90deg,#9ad8ff,#3b82f6,#22c55e,#eab308,#ef4444,#7f1d1d)]" />
            <div className="mt-0.5 flex justify-between text-[9px] font-bold uppercase tracking-[0.06em]">
              <span>Lätt</span>
              <span>Kraftigt</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-3.5 py-2.5 border-t-[3px] border-ink">
        {frames.length > 1 && (
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <button
              type="button"
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                  return;
                }
                setFrame(0);
                setPlaying(true);
              }}
              aria-label={playing ? "Pausa radarn" : "Spela radarn"}
              className="h-9 w-9 border-[3px] border-ink bg-now inline-flex items-center justify-center shrink-0"
            >
              {playing ? <PauseGlyph /> : <PlayGlyph />}
            </button>
            <input
              type="range"
              min={0}
              max={frames.length - 1}
              step={1}
              value={Math.min(frame, frames.length - 1)}
              aria-label="Tid på radarn"
              onChange={(e) => {
                setPlaying(false);
                setFrame(Number(e.target.value));
              }}
              className="flex-1 min-w-0 accent-ink h-2 cursor-pointer"
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.06em] shrink-0">
              {clock}
            </span>
          </div>
        )}
        <p className="text-[10px] font-semibold text-ink/50">
          Karta OpenStreetMap · Radar RainViewer
        </p>
      </div>
    </section>
  );
};

export default RadarView;
