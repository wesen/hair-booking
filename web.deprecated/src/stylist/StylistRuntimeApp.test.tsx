import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StylistRuntimeApp } from "./StylistRuntimeApp";

const apiMocks = vi.hoisted(() => ({
  useSessionBootstrap: vi.fn(),
  useGetStylistMeQuery: vi.fn(),
}));

vi.mock("./store/api", () => apiMocks);
vi.mock("./StylistWorkspace", () => ({
  StylistWorkspace: () => <div>live-stylist-workspace</div>,
}));

describe("StylistRuntimeApp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.useSessionBootstrap.mockReturnValue({
      isLoading: false,
      hasError: false,
      isAuthenticated: true,
      logoutPath: "/auth/logout",
      errorMessage: null,
    });
    apiMocks.useGetStylistMeQuery.mockReturnValue({
      isLoading: false,
      error: null,
      data: { email: "stylist@example.com" },
    });
  });

  it("redirects authenticated non-stylists to the portal", async () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, origin: "https://hair-booking.app.scapegoat.dev", assign },
    });

    apiMocks.useGetStylistMeQuery.mockReturnValue({
      isLoading: false,
      error: { status: 403, message: "forbidden" },
      data: null,
    });

    render(<StylistRuntimeApp />);

    expect(screen.getByText("Redirecting to your client portal...")).toBeInTheDocument();
    await waitFor(() => {
      expect(assign).toHaveBeenCalledWith("https://hair-booking.app.scapegoat.dev/portal");
    });
  });
});
