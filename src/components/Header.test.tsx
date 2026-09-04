import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { ComponentProps } from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import Header from "@/components/Header";
import { searchLocations } from "@/lib/weather";

vi.mock("@/lib/weather", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/weather")>();
  return {
    ...actual,
    searchLocations: vi.fn(),
  };
});

const gothenburg = {
  name: "Göteborg",
  country: "Sverige",
  countryCode: "SE",
  admin1: "Västra Götaland",
  latitude: 57.7,
  longitude: 11.97,
};

const gavle = {
  name: "Gävle",
  country: "Sverige",
  countryCode: "SE",
  latitude: 60.67,
  longitude: 17.14,
};

function renderHeader(
  overrides: Partial<ComponentProps<typeof Header>> = {},
) {
  const onSelectLocation = vi.fn();
  act(() => {
    render(
      <Header
        location="Stockholm"
        country="Sweden"
        countryCode="SE"
        timezone="Europe/Stockholm"
        onSelectLocation={onSelectLocation}
        recentLocations={() => []}
        {...overrides}
      />,
    );
  });
  return { onSelectLocation };
}

function searchInput() {
  return screen.getByRole("combobox", { name: "Sök plats" });
}

describe("Header search", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.mocked(searchLocations).mockReset();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("shows city and country when a place is selected", () => {
    renderHeader();

    expect(searchInput()).toHaveValue("Stockholm, Sverige");
    expect(screen.getByText("Stockholm")).toBeInTheDocument();
    expect(screen.getByText(", Sverige")).toBeInTheDocument();
  });

  it("hides the country visually on small screens", () => {
    renderHeader();

    expect(screen.getByText(", Sverige")).toHaveClass("hidden", "sm:inline");
  });

  it("shows an empty state when no places are found", async () => {
    vi.mocked(searchLocations).mockResolvedValue([]);
    renderHeader();

    fireEvent.focus(searchInput());
    fireEvent.change(searchInput(), { target: { value: "xyzxyz" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    expect(screen.getByText("Inga platser hittades")).toBeInTheDocument();
  });

  it("closes search on Escape", () => {
    renderHeader({
      recentLocations: () => [gothenburg],
    });

    fireEvent.focus(searchInput());
    expect(screen.getByText("Göteborg - Västra Götaland, Sverige")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByText("Göteborg - Västra Götaland, Sverige")).not.toBeInTheDocument();
    expect(searchInput()).toBeInTheDocument();
  });

  it("navigates results with arrow keys and selects with Enter", async () => {
    vi.mocked(searchLocations).mockResolvedValue([gothenburg, gavle]);
    const { onSelectLocation } = renderHeader();

    fireEvent.focus(searchInput());
    fireEvent.change(searchInput(), { target: { value: "ga" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    fireEvent.keyDown(searchInput(), { key: "ArrowDown" });
    fireEvent.keyDown(searchInput(), { key: "Enter" });

    expect(onSelectLocation).toHaveBeenCalledWith(gavle);
  });

  it("navigates recent locations with arrow keys", () => {
    const oslo = {
      name: "Oslo",
      country: "Norway",
      countryCode: "NO",
      latitude: 59.9,
      longitude: 10.7,
    };
    const { onSelectLocation } = renderHeader({
      recentLocations: () => [oslo, gothenburg],
    });

    fireEvent.focus(searchInput());
    fireEvent.keyDown(searchInput(), { key: "ArrowDown" });
    fireEvent.keyDown(searchInput(), { key: "Enter" });

    expect(onSelectLocation).toHaveBeenCalledWith(gothenburg);
  });

  it("selects the first result with Enter", async () => {
    vi.mocked(searchLocations).mockResolvedValue([gothenburg, gavle]);
    const { onSelectLocation } = renderHeader();

    fireEvent.focus(searchInput());
    fireEvent.change(searchInput(), { target: { value: "gö" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(300);
    });

    fireEvent.keyDown(searchInput(), { key: "Enter" });
    expect(onSelectLocation).toHaveBeenCalledWith(gothenburg);
  });

  it("shows Swedish country names in the recent list", () => {
    renderHeader({
      recentLocations: () => [
        { name: "Oslo", country: "Norway", countryCode: "NO", latitude: 59.9, longitude: 10.7 },
      ],
    });

    expect(searchInput()).toHaveValue("Stockholm, Sverige");
    fireEvent.focus(searchInput());
    expect(screen.getByText("Oslo, Norge")).toBeInTheDocument();
    expect(screen.queryByText(/Norway/)).not.toBeInTheDocument();
  });
});
