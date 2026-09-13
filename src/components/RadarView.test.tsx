import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RadarView from "@/components/RadarView";
import { fetchRadarIndex, formatRadarClock } from "@/lib/radar";

vi.mock("@/lib/radar", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/radar")>();
  return {
    ...actual,
    fetchRadarIndex: vi.fn(),
  };
});

const TIME_A = 1_788_880_200;
const TIME_B = 1_788_880_800;

function mockIndex() {
  vi.mocked(fetchRadarIndex).mockResolvedValue({
    host: "https://tilecache.rainviewer.com",
    frames: [
      { time: TIME_A, path: "/v2/radar/a", nowcast: false },
      { time: TIME_B, path: "/v2/radar/b", nowcast: false },
    ],
  });
}

describe("RadarView", () => {
  beforeEach(() => {
    mockIndex();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("loads the latest radar frame and starts playback from the beginning", async () => {
    render(
      <RadarView
        latitude={59.3293}
        longitude={18.0686}
        locationName="Stockholm"
        timezone="Europe/Stockholm"
      />,
    );

    expect(screen.getByText("Regnradar")).toBeInTheDocument();
    const latest = formatRadarClock(TIME_B, "Europe/Stockholm");
    expect(await screen.findAllByText(latest)).not.toHaveLength(0);
    expect(screen.getByText("Stockholm")).toBeInTheDocument();
    expect(screen.getByText(/RainViewer/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Spela radarn" }));
    expect(screen.getByRole("button", { name: "Pausa radarn" })).toBeInTheDocument();
    const earliest = formatRadarClock(TIME_A, "Europe/Stockholm");
    expect(screen.getAllByText(earliest).length).toBeGreaterThan(0);
  });

  it("shows an error when the radar index fails", async () => {
    vi.mocked(fetchRadarIndex).mockRejectedValue(new Error("fail"));
    render(
      <RadarView
        latitude={59.3293}
        longitude={18.0686}
        locationName="Stockholm"
        timezone="Europe/Stockholm"
      />,
    );

    expect(await screen.findByText("Kunde inte hämta radar")).toBeInTheDocument();
  });

  it("scrubs to an earlier frame", async () => {
    render(
      <RadarView
        latitude={59.3293}
        longitude={18.0686}
        locationName="Göteborg"
        timezone="Europe/Stockholm"
      />,
    );

    const slider = await screen.findByLabelText("Tid på radarn");
    fireEvent.change(slider, { target: { value: "0" } });
    const earlier = formatRadarClock(TIME_A, "Europe/Stockholm");
    await waitFor(() => {
      expect(screen.getAllByText(earlier).length).toBeGreaterThan(0);
    });
    expect(screen.getByRole("button", { name: "Spela radarn" })).toBeInTheDocument();
  });
});
