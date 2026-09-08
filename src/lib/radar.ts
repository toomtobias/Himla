export const RADAR_MAPS_URL =
  "https://api.rainviewer.com/public/weather-maps.json";

export const TILE_SIZE = 256;
export const MIN_ZOOM = 5;
/** RainViewer only renders through zoom 7; the map can go one step closer. */
export const RADAR_MAX_ZOOM = 7;
export const MAX_ZOOM = 8;
export const DEFAULT_ZOOM = 6;
/** RainViewer "Universal Blue" — readable on a light map. */
export const RADAR_COLOR = 2;

export interface RadarFrame {
  time: number;
  path: string;
  nowcast: boolean;
}

export interface RadarIndex {
  host: string;
  frames: RadarFrame[];
}

interface RadarApiFrame {
  time: number;
  path: string;
}

interface RadarApiResponse {
  host: string;
  radar?: {
    past?: RadarApiFrame[];
    nowcast?: RadarApiFrame[];
  };
}

export async function fetchRadarIndex(): Promise<RadarIndex> {
  const res = await fetch(RADAR_MAPS_URL);
  if (!res.ok) throw new Error("Kunde inte hämta radar");
  const data = (await res.json()) as RadarApiResponse;
  const past = (data.radar?.past ?? []).map((frame) => ({
    ...frame,
    nowcast: false,
  }));
  const nowcast = (data.radar?.nowcast ?? []).map((frame) => ({
    ...frame,
    nowcast: true,
  }));
  return { host: data.host, frames: [...past, ...nowcast] };
}

export function radarTileUrl(
  host: string,
  path: string,
  z: number,
  x: number,
  y: number,
  color = RADAR_COLOR,
): string {
  return `${host}${path}/${TILE_SIZE}/${z}/${x}/${y}/${color}/1_1.png`;
}

export function basemapTileUrl(z: number, x: number, y: number): string {
  return `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
}

export function lonToWorldX(lon: number, zoom: number): number {
  return ((lon + 180) / 360) * 2 ** zoom * TILE_SIZE;
}

export function latToWorldY(lat: number, zoom: number): number {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const rad = (clamped * Math.PI) / 180;
  const n = 2 ** zoom;
  return (
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
    n *
    TILE_SIZE
  );
}

export function wrapTileX(x: number, zoom: number): number {
  const n = 2 ** zoom;
  return ((x % n) + n) % n;
}

export interface VisibleTile {
  x: number;
  y: number;
  left: number;
  top: number;
}

export function visibleTiles(
  originX: number,
  originY: number,
  width: number,
  height: number,
  zoom: number,
): VisibleTile[] {
  if (width <= 0 || height <= 0) return [];
  const n = 2 ** zoom;
  const minTx = Math.floor(originX / TILE_SIZE);
  const minTy = Math.floor(originY / TILE_SIZE);
  const maxTx = Math.floor((originX + width - 1e-9) / TILE_SIZE);
  const maxTy = Math.floor((originY + height - 1e-9) / TILE_SIZE);
  const tiles: VisibleTile[] = [];
  for (let ty = minTy; ty <= maxTy; ty++) {
    if (ty < 0 || ty >= n) continue;
    for (let tx = minTx; tx <= maxTx; tx++) {
      tiles.push({
        x: wrapTileX(tx, zoom),
        y: ty,
        left: tx * TILE_SIZE - originX,
        top: ty * TILE_SIZE - originY,
      });
    }
  }
  return tiles;
}

export function radarOverlay(
  originX: number,
  originY: number,
  width: number,
  height: number,
  zoom: number,
): { zoom: number; scale: number; tiles: VisibleTile[] } {
  const radarZoom = Math.min(zoom, RADAR_MAX_ZOOM);
  const scale = 2 ** (zoom - radarZoom);
  const tiles = visibleTiles(
    originX / scale,
    originY / scale,
    width / scale,
    height / scale,
    radarZoom,
  ).map((tile) => ({
    ...tile,
    left: tile.left * scale,
    top: tile.top * scale,
  }));
  return { zoom: radarZoom, scale, tiles };
}

export function mapOrigin(
  latitude: number,
  longitude: number,
  zoom: number,
  width: number,
  height: number,
  panX = 0,
  panY = 0,
): { x: number; y: number } {
  return {
    x: lonToWorldX(longitude, zoom) - width / 2 + panX,
    y: latToWorldY(latitude, zoom) - height / 2 + panY,
  };
}

export function formatRadarClock(unix: number, timezone: string): string {
  return new Date(unix * 1000).toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone || undefined,
  });
}

export function formatRadarAge(unix: number, now = Date.now()): string {
  const delta = unix * 1000 - now;
  if (delta > 30_000) return "Prognos";
  const minutes = Math.max(0, Math.round((now - unix * 1000) / 60_000));
  if (minutes <= 1) return "Just nu";
  return `${minutes} min sedan`;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
