import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { StylistWorkspace } from "./StylistWorkspace";

const apiMocks = vi.hoisted(() => ({
  getApiErrorMessage: vi.fn((_error: unknown, fallback: string) => fallback),
  useStylistDashboardView: vi.fn(),
  useStylistIntakesView: vi.fn(),
  useStylistIntakeDetailView: vi.fn(),
  useStylistAppointmentsView: vi.fn(),
  useStylistAppointmentDetailView: vi.fn(),
  useStylistClientsView: vi.fn(),
  useStylistClientDetailView: vi.fn(),
  useUpdateStylistAppointmentMutation: vi.fn(),
  useUpdateStylistIntakeReviewMutation: vi.fn(),
}));

vi.mock("./store/api", () => apiMocks);

function setDefaultHookReturns() {
  apiMocks.useStylistDashboardView.mockReturnValue({
    dashboard: null,
    view: null,
    isLoading: false,
    errorMessage: null,
  });
  apiMocks.useStylistIntakesView.mockReturnValue({
    intakes: [],
    rows: [],
    isLoading: false,
    errorMessage: null,
  });
  apiMocks.useStylistIntakeDetailView.mockReturnValue({
    intake: null,
    view: null,
    isLoading: false,
    errorMessage: null,
  });
  apiMocks.useStylistAppointmentsView.mockReturnValue({
    appointments: [],
    rows: [],
    isLoading: false,
    errorMessage: null,
  });
  apiMocks.useStylistAppointmentDetailView.mockReturnValue({
    appointment: null,
    view: null,
    isLoading: false,
    errorMessage: null,
  });
  apiMocks.useStylistClientsView.mockReturnValue({
    clients: [],
    rows: [],
    isLoading: false,
    errorMessage: null,
  });
  apiMocks.useStylistClientDetailView.mockReturnValue({
    client: null,
    view: null,
    isLoading: false,
    errorMessage: null,
  });
  apiMocks.useUpdateStylistAppointmentMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
  apiMocks.useUpdateStylistIntakeReviewMutation.mockReturnValue([vi.fn(), { isLoading: false }]);
}

describe("StylistWorkspace", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.history.replaceState({}, "", "/stylist");
    setDefaultHookReturns();
  });

  it("renders the dashboard route from mapped dashboard view data", () => {
    apiMocks.useStylistDashboardView.mockReturnValue({
      dashboard: {},
      view: {
        summaryCards: [
          { label: "New Intakes", value: 2 },
          { label: "In Review", value: 3 },
          { label: "Needs Reply", value: 1 },
          { label: "Today", value: 4 },
        ],
        todayRows: [
          { id: "appt-1", title: "Avery Moss", meta: "Consult · Mar 20, 2026 · 10:00 AM", badge: "confirmed" },
        ],
        upcomingRows: [
          { id: "appt-2", title: "Bianca Reed", meta: "Color Refresh · Mar 22, 2026 · 9:30 AM", badge: "pending" },
        ],
      },
      isLoading: false,
      errorMessage: null,
    });

    render(<StylistWorkspace />);

    expect(screen.getAllByText("Stylist Dashboard")).toHaveLength(2);
    expect(screen.getByText("New Intakes")).toBeInTheDocument();
    expect(screen.getByText("Avery Moss")).toBeInTheDocument();
    expect(screen.getByText("Bianca Reed")).toBeInTheDocument();
    expect(screen.getByText("confirmed")).toBeInTheDocument();
  });

  it("renders the intake detail route with mapped summary, photos, and review defaults", () => {
    window.history.replaceState({}, "", "/stylist/intakes/intake-1");
    apiMocks.useStylistIntakeDetailView.mockReturnValue({
      intake: { id: "intake-1" },
      view: {
        summaryItems: [
          { label: "Client", value: "Avery Moss" },
          { label: "Service Type", value: "extensions" },
          { label: "Estimate", value: "$950-$1350" },
        ],
        photoRows: [
          { id: "photo-1", title: "front", meta: "https://example.com/front.jpg" },
        ],
        reviewDefaults: {
          status: "approved_to_book",
          priority: "urgent",
          summary: "Approved after hair history review.",
          internalNotes: "Book consult before ordering hair.",
          quotedPriceLow: "950",
          quotedPriceHigh: "1350",
        },
      },
      isLoading: false,
      errorMessage: null,
    });

    render(<StylistWorkspace />);

    expect(screen.getAllByText("Intake Detail")).toHaveLength(2);
    expect(screen.getByText("Avery Moss")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toHaveValue("approved_to_book");
    expect(screen.getByLabelText("Priority")).toHaveValue("urgent");
    expect(screen.getByLabelText("Summary")).toHaveValue("Approved after hair history review.");
    expect(screen.getByText("front")).toBeInTheDocument();
  });

  it("renders the appointment detail route with mapped detail content and form defaults", () => {
    window.history.replaceState({}, "", "/stylist/appointments/appt-1");
    apiMocks.useStylistAppointmentDetailView.mockReturnValue({
      appointment: { id: "appt-1" },
      view: {
        summaryItems: [
          { label: "Client", value: "Bianca Reed" },
          { label: "Service", value: "Color Refresh" },
          { label: "Status", value: "pending" },
        ],
        formDefaults: {
          status: "pending",
          prepNotes: "Prep with extension shade ring.",
          stylistNotes: "Confirm maintenance timing.",
        },
        linkedIntakeRow: {
          id: "intake-2",
          title: "color",
          meta: "No dream-result note",
        },
      },
      isLoading: false,
      errorMessage: null,
    });

    render(<StylistWorkspace />);

    expect(screen.getAllByText("Appointment Detail")).toHaveLength(2);
    expect(screen.getByText("Bianca Reed")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toHaveValue("pending");
    expect(screen.getByLabelText("Prep Notes")).toHaveValue("Prep with extension shade ring.");
    expect(screen.getByLabelText("Stylist Notes")).toHaveValue("Confirm maintenance timing.");
    expect(screen.getByText("Linked Intake")).toBeInTheDocument();
  });

  it("renders the client detail route with mapped appointment, intake, and maintenance sections", () => {
    window.history.replaceState({}, "", "/stylist/clients/client-1");
    apiMocks.useStylistClientDetailView.mockReturnValue({
      client: {
        maintenance_items: [{ id: "maint-1", appointment_id: "appt-9" }],
      },
      view: {
        summaryItems: [
          { label: "Name", value: "Bianca Reed" },
          { label: "Appointments", value: "3" },
          { label: "Intakes", value: "2" },
        ],
        recentAppointmentRows: [
          { id: "appt-3", title: "Color Refresh", meta: "Mar 18, 2026 · 9:30 AM · confirmed" },
        ],
        recentIntakeRows: [
          { id: "intake-4", title: "extensions", meta: "approved_to_book · Mar 17, 2026 · 3 photos" },
        ],
        maintenanceRows: [
          { id: "maint-1", title: "Move-up", meta: "Apr 14, 2026 · upcoming" },
        ],
      },
      isLoading: false,
      errorMessage: null,
    });

    render(<StylistWorkspace />);

    expect(screen.getAllByText("Client Detail")).toHaveLength(2);
    expect(screen.getByText("Bianca Reed")).toBeInTheDocument();
    expect(screen.getByText("Recent Appointments")).toBeInTheDocument();
    expect(screen.getByText("Color Refresh")).toBeInTheDocument();
    expect(screen.getByText("Recent Intakes")).toBeInTheDocument();
    expect(screen.getByText("Move-up")).toBeInTheDocument();
  });
});
