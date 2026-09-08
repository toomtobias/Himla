import { describe, it, expect, vi, afterEach } from "vitest";
import {
  wrapTileX,
  lonToWorldX,
  latToWorldY,
  visibleTiles,
  radarOverlay,
  mapOrigin,
  worldToScreen,
  radarTileUrl,
  basemapTileUrl,
  formatRadarClock,
  formatRadarAge,
  fetchRadarIndex,
  TILE_SIZE,
} from "@/lib/radar";

describe("tile math", () => {
  it("places the equator and prime meridian at the world origin tile", () => {
    expect(lonToWorldX(0, 0)).toBe(TILE_SIZE / 2);
    expect(latToWorldY(0, 0)).toBeCloseTo(TILE_SIZE / 2);
  });

  it("wraps tile x around the date line", () => {
    expect(wrapTileX(-1, 3)).toBe(7);
    expect(wrapTileX(8, 3)).toBe(0);
    expect(wrapTileX(3, 3)).toBe(3);
  });

  it("lists tiles that cover the viewport", () => {
    expect(visibleTiles(0, 0, 256, 256, 3)).toEqual([
      { x: 0, y: 0, left: 0, top: 0 },
    ]);
    expect(visibleTiles(0.5, 0, 256, 256, 3)).toEqual([
      { x: 0, y: 0, left: -0.5, top: 0 },
      { x: 1, y: 0, left: 255.5, top: 0 },
    ]);
  });

  it("returns no tiles for an empty viewport", () => {
    expect(visibleTiles(0, 0, 0, 256, 6)).toEqual([]);
  });

  it("keeps radar overlay 1:1 at RainViewer max zoom", () => {
    const overlay = radarOverlay(0, 0, 256, 256, 7);
    expect(overlay).toEqual({
      zoom: 7,
      scale: 1,
      tiles: [{ x: 0, y: 0, left: 0, top: 0 }],
    });
  });

  it("scales RainViewer tiles 2x when the map is one step closer", () => {
    const overlay = radarOverlay(0, 0, 256, 256, 8);
    expect(overlay.zoom).toBe(7);
    expect(overlay.scale).toBe(2);
    expect(overlay.tiles).toEqual([{ x: 0, y: 0, left: 0, top: 0 }]);
  });

  it("centers the origin on a lon/lat", () => {
    const origin = mapOrigin(0, 0, 0, TILE_SIZE, TILE_SIZE);
    expect(origin.x).toBe(0);
    expect(origin.y).toBeCloseTo(0);
  });

  it("places a location at the viewport center until the map is panned", () => {
    const origin = mapOrigin(59.33, 18.07, 6, 800, 400);
    const pin = worldToScreen(59.33, 18.07, 6, origin.x, origin.y);
    expect(pin.x).toBe(400);
    expect(pin.y).toBe(200);

    const panned = mapOrigin(59.33, 18.07, 6, 800, 400, 80, -30);
    const moved = worldToScreen(59.33, 18.07, 6, panned.x, panned.y);
    expect(moved.x).toBe(320);
    expect(moved.y).toBe(230);
  });
});

describe("tile urls", () => {
  it("builds a RainViewer radar tile url", () => {
    expect(radarTileUrl("https://tiles.example", "/v2/radar/abc", 6, 35, 18)).toBe(
      "https://tiles.example/v2/radar/abc/256/6/35/18/2/1_1.png",
    );
  });

  it("builds OSM basemap urls with z/x/y", () => {
    expect(basemapTileUrl(6, 35, 18)).toBe(
      "https://tile.openstreetmap.org/6/35/18.png",
    );
  });
});

describe("radar copy", () => {
  it("formats the frame clock in 24h Swedish", () => {
    const unix = Date.UTC(2026, 8, 8, 14, 0, 0) / 1000;
    expect(formatRadarClock(unix, "Europe/Stockholm")).toBe("16:00");
  });

  it("labels recent, older and forecast frames", () => {
    const now = 1_700_000_000_000;
    expect(formatRadarAge(1_700_000_000, now)).toBe("Just nu");
    expect(formatRadarAge(1_699_998_200, now)).toBe("30 min sedan");
    expect(formatRadarAge(1_700_000_120, now)).toBe("Prognos");
  });
});

describe("fetchRadarIndex", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("merges past and nowcast frames", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          host: "https://tilecache.rainviewer.com",
          radar: {
            past: [{ time: 10, path: "/v2/radar/a" }],
            nowcast: [{ time: 20, path: "/v2/radar/b" }],
          },
        }),
      }),
    );

    await expect(fetchRadarIndex()).resolves.toEqual({
      host: "https://tilecache.rainviewer.com",
      frames: [
        { time: 10, path: "/v2/radar/a", nowcast: false },
        { time: 20, path: "/v2/radar/b", nowcast: true },
      ],
    });
  });

  it("throws on a failed request", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    await expect(fetchRadarIndex()).rejects.toThrow("Kunde inte hämta radar");
  });
});
