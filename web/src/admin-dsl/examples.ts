import { action, admin, field, resource, view } from "./builder";
import type { AdminPage } from "./schema";

const services = [
  { id: "cut", title: "Cut", durationMinutes: 60, priceLabel: "$80+", active: true, description: "Trim, reshape, bangs, or full restyle." },
  { id: "color", title: "Color", durationMinutes: 120, priceLabel: "$140+", active: true, description: "Single-process color, gloss, or root refresh." },
  { id: "extensions", title: "Extensions", durationMinutes: 180, priceLabel: "$400+", active: true, description: "Tape-in or hand-tied consultation and install." },
  { id: "treatment", title: "Bond treatment", durationMinutes: 45, priceLabel: "$60+", active: false, description: "Repair and gloss add-on." },
];

const appointments = [
  { id: "apt-1001", clientName: "Lena Ortiz", service: "Color + cut", status: "confirmed", startsAt: "09:30", endsAt: "12:00", column: 1, span: 3 },
  { id: "apt-1002", clientName: "Maya Chen", service: "Consultation", status: "pending", startsAt: "13:00", endsAt: "13:45", column: 1, span: 1 },
  { id: "apt-1003", clientName: "Jules Park", service: "Extensions", status: "confirmed", startsAt: "15:00", endsAt: "18:00", column: 1, span: 4 },
];

const serviceRows = services.map((service) => resource.row(service.id, {
  title: service.title,
  subtitle: `${service.durationMinutes} min · ${service.priceLabel}`,
  description: service.description,
  badge: service.active ? "Visible" : "Hidden",
  tone: service.active ? "success" : "muted",
}).actions(
  action.open("editService", "Edit", { id: service.id }),
  action.confirm("archiveService", "Archive", { id: service.id }),
));

export const serviceForm = admin.form("serviceForm", { submitLabel: "Save service" },
  admin.fieldGroup("Public service details",
    field.text("title", { label: "Name", value: "Color", required: true }),
    field.textarea("description", { label: "Description", value: "Single-process color, gloss, or root refresh." }),
  ),
  admin.fieldGroup("Pricing and timing",
    field.money("basePrice", { label: "Starting price", value: 140, prefix: "$" }),
    field.duration("durationMinutes", { label: "Duration", value: 120, suffix: "min" }),
    field.switch("active", { label: "Visible on website", value: true }),
  ),
  admin.saveBar({ status: "draft", primary: action.mutation("services.save", "Save service", { id: "color" }).toJSON() }),
);

export const servicesAdminPage = resource.page("admin-services", "Services & pricing")
  .describe("Manage the service menu shown in the client booking flow.")
  .shell("resource", { active: "services", eyebrow: "Salon admin", owner: "Mia" })
  .toolbar(
    action.open("editService", "Add service", { mode: "create" }),
    action.refresh("services.list"),
  )
  .content(
    admin.section("Service menu", { description: "Visible services become choices in the client intake flow." },
      admin.filterBar([
        view.list("visible", "Visible", { active: true }),
        view.list("hidden", "Hidden", { active: false }),
        view.list("all", "All"),
      ], "visible"),
      resource.list("services", { query: { id: "services.list", params: { includeHidden: true } } }, ...serviceRows)
        .empty(admin.emptyState("No services yet", {
          body: "Add the services clients can request from the booking flow.",
          action: action.open("editService", "Add first service", { mode: "create" }).toJSON(),
        })),
    ),
  )
  .modals(
    admin.modal("editService", { title: "Edit service", open: true }, serviceForm),
    admin.confirm("archiveService", {
      title: "Archive this service?",
      body: "Hidden services will not appear in the public booking flow.",
      confirmLabel: "Archive service",
      tone: "danger",
    }),
  )
  .meta({ storyTitle: "Admin DSL/Services", tags: ["admin", "resource", "mvp"] })
  .toJSON();

export const dashboardAdminPage = admin.dashboard("admin-dashboard", "Today")
  .describe("A one-stylist operating dashboard for the current day.")
  .shell("dashboard", { active: "dashboard", eyebrow: "Salon admin", owner: "Mia" })
  .toolbar(
    action.open("blockTimeOff", "Block time off"),
    action.navigate("admin-services", "Edit services"),
  )
  .content(
    admin.cardGrid(
      admin.metric("Appointments", 3, { caption: "Scheduled today", tone: "plum" }),
      admin.metric("Pending", 2, { caption: "Consultations to review", tone: "warn" }),
      admin.metric("Booked", "$420", { caption: "Estimated revenue", tone: "success" }),
    ),
    admin.section("Needs attention", {},
      admin.resourceList("pendingIntakes", {},
        resource.row("intake-1", { title: "Ari Wells", subtitle: "Balayage request · $250-$400", badge: "Photos ready", tone: "success" })
          .actions(action.open("intakeDetail", "Review", { id: "intake-1" })),
        resource.row("intake-2", { title: "Nora Lee", subtitle: "Extensions consultation", badge: "Needs estimate", tone: "warn" })
          .actions(action.open("intakeDetail", "Review", { id: "intake-2" })),
      ),
    ),
    admin.section("Quick actions", {},
      admin.cardGrid(
        admin.summary("Edit availability", { body: "Update working hours, buffers, or blackout dates." }).actions(action.navigate("availability", "Open")),
        admin.summary("Website content", { body: "Change homepage copy, policies, and gallery images." }).actions(action.navigate("website", "Open")),
      ),
    ),
  )
  .drawers(
    admin.drawer("intakeDetail", { title: "Consultation request", open: true },
      admin.kvList([
        { label: "Client", value: "Ari Wells" },
        { label: "Request", value: "Balayage with face frame" },
        { label: "Budget", value: "$250-$400" },
      ]),
      admin.markdown("Client uploaded three photos and is available next Thursday afternoon."),
    ),
  )
  .meta({ storyTitle: "Admin DSL/Dashboard", tags: ["admin", "dashboard", "mvp"] })
  .toJSON();

export const calendarAdminPage = admin.calendarPage("admin-calendar", "Calendar")
  .describe("Week view for appointments, consultations, and time-off blocks.")
  .shell("calendar", { active: "calendar", eyebrow: "Salon admin", range: "week" })
  .toolbar(
    action.open("newAppointment", "New appointment"),
    action.open("blockTimeOff", "Block time off"),
  )
  .content(
    admin.section("This week", { description: "Appointment blocks are JSON nodes, not custom React callbacks." },
      admin.calendarWeek("week-2026-05-18", {
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        hours: ["9a", "10a", "11a", "12p", "1p", "2p", "3p", "4p", "5p"],
      },
        ...appointments.map((appointment) => admin.appointmentBlock(appointment.id, appointment)
          .action("open", action.open("appointmentDetail", "Open", { id: appointment.id }))),
        admin.timeOffBlock("time-off-1", { title: "Personal errand", startsAt: "12:00", endsAt: "13:00", column: 2, span: 1 }),
      ),
    ),
  )
  .modals(
    admin.modal("newAppointment", { title: "New appointment" },
      admin.form("appointmentForm", { submitLabel: "Create appointment" },
        field.text("clientName", { label: "Client name" }),
        field.select("service", services.map((service) => ({ value: service.id, label: service.title })), { label: "Service" }),
        field.date("date", { label: "Date" }),
        field.time("startsAt", { label: "Start time" }),
      ),
    ),
  )
  .drawers(
    admin.drawer("appointmentDetail", { title: "Appointment", open: true },
      admin.kvList([
        { label: "Client", value: "Lena Ortiz" },
        { label: "Service", value: "Color + cut" },
        { label: "Time", value: "09:30 – 12:00" },
      ]),
    ),
  )
  .meta({ storyTitle: "Admin DSL/Calendar", tags: ["admin", "calendar", "mvp"] })
  .toJSON();

export const adminDslExamples: Record<string, AdminPage> = {
  services: servicesAdminPage,
  dashboard: dashboardAdminPage,
  calendar: calendarAdminPage,
};
