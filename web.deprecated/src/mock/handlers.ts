// mock/handlers.ts — MSW handlers for Fringe portal + booking app dev
import { http, HttpResponse } from "msw";

// ── Auth / session bootstrap
const mockInfo = {
  authMode: "mock",
  loginPath: "/auth/login",
  logoutPath: "/auth/logout",
};

const mockClient = {
  id: "client_demo_001",
  name: "Mia Chen",
  email: "mia@example.com",
  phone: "+1 401-555-0102",
  tier: "Gold",
  points: 420,
  points_to_next: 180,
  next_tier: "Diamond",
  referral_code: "MIACHEW",
  referral_count: 3,
  service_description: "Balayage + cut",
  perks: ["Priority booking", "10% off next color service", "Free Olaplex after color"],
  created_at: "2023-09-15T00:00:00.000Z",
  updated_at: "2025-06-10T00:00:00.000Z",
};

const mockMe = {
  client: mockClient,
  notification_prefs: [
    { key: "email_reminders", label: "Email reminders", on: true },
    { key: "sms_reminders", label: "SMS reminders", on: false },
    { key: "marketing", label: "Promotions & updates", on: true },
  ],
};

const mockAppointments = [
  {
    id: "appt_001",
    client_id: "client_demo_001",
    service_id: "svc_color_full",
    date: "2026-06-19",
    start_time: "10:30",
    duration_min_snapshot: 195,
    status: "confirmed",
    created_at: "2026-04-15T00:00:00.000Z",
    updated_at: "2026-04-15T00:00:00.000Z",
    service_name: "Full highlights + cut",
    service_category: "Color",
    price_low: 280,
    price_high: 360,
    date_label: "Thursday, Jun 19",
    duration_label: "3h 15m",
  },
  {
    id: "appt_002",
    client_id: "client_demo_001",
    service_id: "svc_color_partial",
    date: "2026-04-10",
    start_time: "11:00",
    duration_min_snapshot: 150,
    status: "completed",
    cancelled_at: null,
    created_at: "2026-03-20T00:00:00.000Z",
    updated_at: "2026-04-10T00:00:00.000Z",
    service_name: "Partial highlights + cut",
    service_category: "Color",
    price_low: 220,
    price_high: 290,
    date_label: "Thursday, Apr 10",
    duration_label: "2h 30m",
  },
  {
    id: "appt_003",
    client_id: "client_demo_001",
    service_id: "svc_color_root",
    date: "2026-01-08",
    start_time: "10:00",
    duration_min_snapshot: 120,
    status: "completed",
    cancelled_at: null,
    created_at: "2025-12-15T00:00:00.000Z",
    updated_at: "2026-01-08T00:00:00.000Z",
    service_name: "Root touch-up + blowout",
    service_category: "Color",
    price_low: 140,
    price_high: 180,
    date_label: "Wednesday, Jan 8",
    duration_label: "2h",
  },
  {
    id: "appt_004",
    client_id: "client_demo_001",
    service_id: "svc_cut",
    date: "2025-10-22",
    start_time: "2:00",
    duration_min_snapshot: 60,
    status: "completed",
    cancelled_at: null,
    created_at: "2025-10-01T00:00:00.000Z",
    updated_at: "2025-10-22T00:00:00.000Z",
    service_name: "Haircut + style",
    service_category: "Cut",
    price_low: 85,
    price_high: 95,
    date_label: "Wednesday, Oct 22",
    duration_label: "1h",
  },
];

// ── Intake
let intakeCounter = 1;
const intakes: Record<string, object> = {};

export const handlers = [
  // Auth bootstrap
  http.get("/api/info", () => HttpResponse.json({ data: mockInfo })),
  http.get("/api/me", () => HttpResponse.json({ data: mockMe })),

  // Client portal
  http.get("/api/me/appointments", ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get("status");
    const appointments = status === "past"
      ? mockAppointments.filter(a => a.status === "completed")
      : status === "upcoming"
        ? mockAppointments.filter(a => a.status === "confirmed")
        : mockAppointments;
    return HttpResponse.json({
      data: {
        appointments,
        total: appointments.length,
      },
    });
  }),
  http.get("/api/me/appointments/:id", ({ params }) => {
    const appt = mockAppointments.find(a => a.id === params.id);
    if (!appt) return HttpResponse.json({ error: { code: "not_found", message: "Appointment not found" } }, { status: 404 });
    return HttpResponse.json({ data: { appointment: appt } });
  }),
  http.get("/api/me/maintenance-plan", () =>
    HttpResponse.json({
      data: {
        items: [
          { id: "mp_001", service: "Color refresh", frequency_days: 42, next_due: "2026-07-31", last_done: "2026-06-19" },
          { id: "mp_002", service: "Trim", frequency_days: 91, next_due: "2026-07-15", last_done: "2026-04-10" },
        ],
      },
    })
  ),

  // Intake / booking
  http.post("/api/intake", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const id = `intake_${String(intakeCounter++).padStart(3, "0")}`;
    const intake = { id, ...body, status: "new", created_at: new Date().toISOString() };
    intakes[id] = intake;
    return HttpResponse.json({ data: { id, intake_id: id } }, { status: 201 });
  }),
  http.get("/api/intake/:id", ({ params }) => {
    const intake = intakes[params.id as string];
    if (!intake) return HttpResponse.json({ error: { code: "not_found", message: "Intake not found" } }, { status: 404 });
    return HttpResponse.json({ data: { intake } });
  }),
  http.post("/api/intake/:id/photos", () =>
    HttpResponse.json({ data: { id: "photo_new_001", slot: "front" } }, { status: 201 })
  ),

  http.get("/api/availability", ({ request }) => {
    const url = new URL(request.url);
    const month = url.searchParams.get("month") ?? "2026-06";
    const daysWithSlots = {
      "2026-06": {
        "12": ["10:30", "2:00"],
        "14": ["11:00", "3:30"],
        "17": ["9:00", "12:00", "4:00"],
        "18": ["10:30", "2:00", "5:00"],
        "19": ["11:00", "1:00"],
        "23": ["9:30", "11:00", "3:00"],
        "24": ["10:00", "2:30"],
        "26": ["9:00", "1:30"],
        "30": ["11:00", "4:00"],
      },
    };
    return HttpResponse.json({
      data: {
        availability: (daysWithSlots as unknown as Record<string, Record<string, string[]>>)[month] ?? {},
      },
    });
  }),

  http.post("/api/appointments", async ({ request }) => {
    const body = await request.json() as Record<string, unknown>;
    const id = `appt_${Date.now()}`;
    return HttpResponse.json({
      data: {
        appointment: {
          id,
          ...body,
          status: "pending",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
    }, { status: 201 });
  }),

  // Stylist
  http.get("/api/stylist/dashboard", () =>
    HttpResponse.json({
      data: {
        dashboard: {
          stylist_id: "stylist_001",
          stylist_name: "Nadia Rivera",
          display_name: "Nadia Rivera",
          rating: 4.9,
          review_count: 320,
          today_schedule: [
            {
              appointment_id: "sched_001",
              client_name: "Mia Chen",
              service_name: "Full highlights + cut",
              start_time: "9:00",
              end_time: "12:15",
              status: "confirmed",
              intake_id: "intake_001",
            },
            {
              appointment_id: "sched_002",
              client_name: "Sofia Reyes",
              service_name: "Balayage + toner",
              start_time: "12:30",
              end_time: "3:45",
              status: "confirmed",
              intake_id: null,
            },
            {
              appointment_id: "sched_003",
              client_name: "Priya Nair",
              service_name: "Tape-in extensions",
              start_time: "4:00",
              end_time: "7:15",
              status: "confirmed",
              intake_id: null,
            },
          ],
          intakes: { pending: 2, approved: 5 },
        },
      },
    })
  ),

  http.get("/api/stylist/clients", () =>
    HttpResponse.json({
      data: {
        clients: [
          {
            id: "client_001",
            name: "Mia Chen",
            email: "mia@example.com",
            phone: "+1 401-555-0102",
            scalp_notes: "Sensitive to PPD",
            service_summary: "Balayage + extensions",
            appointment_count: 12,
            intake_count: 4,
            last_appointment_date: "2026-04-10",
            upcoming_appointment_id: "appt_001",
            upcoming_appointment_date: "2026-06-19",
            upcoming_appointment_time: "10:30",
            last_intake_id: "intake_001",
            last_review_status: "approved_to_book",
            created_at: "2023-09-15T00:00:00.000Z",
          },
          {
            id: "client_002",
            name: "Sofia Reyes",
            email: "sofia@example.com",
            service_summary: "Balayage + toner",
            appointment_count: 8,
            intake_count: 2,
            last_appointment_date: "2026-05-22",
            created_at: "2024-01-10T00:00:00.000Z",
          },
          {
            id: "client_003",
            name: "Priya Nair",
            email: "priya@example.com",
            service_summary: "Tape-in extensions",
            appointment_count: 3,
            intake_count: 1,
            last_appointment_date: "2026-03-18",
            created_at: "2024-11-05T00:00:00.000Z",
          },
        ],
      },
    })
  ),

  http.get("/api/stylist/me", () =>
    HttpResponse.json({
      data: {
        id: "stylist_001",
        display_name: "Nadia Rivera",
        email: "nadia@fringe.studio",
        rating: 4.9,
        review_count: 320,
        hire_date: "2021-03-01",
        specialties: ["Balayage", "Lived-in blonde", "Hand-tied extensions"],
      },
    })
  ),
];