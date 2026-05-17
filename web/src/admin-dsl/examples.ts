import { action, admin, field, resource, surface, view } from "./builder";
import type { AdminPage } from "./schema";

const services = [
  { id: "cut", title: "Cut", durationMinutes: 60, priceLabel: "$80+", active: true, description: "Trim, reshape, bangs, or full restyle." },
  { id: "color", title: "Color", durationMinutes: 120, priceLabel: "$140+", active: true, description: "Single-process color, gloss, or root refresh." },
  { id: "extensions", title: "Extensions", durationMinutes: 180, priceLabel: "$400+", active: false, description: "Tape-in or hand-tied consultation and install." },
];

const serviceRows = services.map((service) => ({
  id: service.id,
  title: service.title,
  details: `${service.durationMinutes} min · ${service.priceLabel}`,
  description: service.description,
  active: service.active ? "Visible" : "Hidden",
  actions: [
    action.open("editService", "Edit", { id: service.id }).placement("row").toJSON(),
    action.danger("archiveService", "Archive", { id: service.id }).placement("rowOverflow").toJSON(),
  ],
}));

export const serviceForm = admin.form("serviceForm", { title: "Service", dirty: true },
  admin.fieldGroup("Public service details",
    field.text("title", { label: "Name", value: "Color", required: true }),
    field.textarea("description", { label: "Description", value: "Single-process color, gloss, or root refresh." }),
  ),
  admin.fieldGroup("Pricing and timing",
    field.money("basePrice", { label: "Starting price", value: 140, prefix: "$" }),
    field.duration("durationMinutes", { label: "Duration", value: 120, suffix: "min" }),
    field.switch("active", { label: "Visible on website", value: true }),
  ),
).submit(action.primary("services.save", "Save service", { id: "color" }).placement("formFooter"));

export const servicesAdminPage = admin.page("admin-services", "Services & pricing")
  .describe("Manage the service menu shown in the client booking flow.")
  .shell("admin", { active: "services", eyebrow: "Salon admin", owner: "Mia" })
  .content(
    admin.pageHeader({ title: "Services & pricing", description: "Manage the service menu shown in the client booking flow.", breadcrumbs: ["Salon admin", "Services"] })
      .actions(action.primary("editService", "Add service", { mode: "create" }).placement("pageHeader"), action.refresh("services.list").placement("pageHeader")),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.metric("Published", 2, { caption: "Visible to customers", tone: "success", layout: { span: { desktop: 4, mobile: 1 }, order: 10 } }),
      admin.metric("Draft/hidden", 1, { caption: "Needs review", tone: "warn", layout: { span: { desktop: 4, mobile: 1 }, order: 11 } }),
      admin.metric("Average price", "$207", { caption: "Starting prices", tone: "plum", layout: { span: { desktop: 4, mobile: 1 }, order: 12 } }),
      admin.panel("Service menu", { description: "Visible services become choices in the client intake flow.", padding: "none", layout: { span: { desktop: 12, mobile: 1 }, order: 20 } },
        admin.filterBar([
          view.list("visible", "Visible", { active: true }),
          view.list("hidden", "Hidden", { active: false }),
          view.list("all", "All"),
        ], "visible"),
        resource.table("services", [
          { id: "title", label: "Service" },
          { id: "details", label: "Details" },
          { id: "active", label: "Status", type: "badge" },
          { id: "actions", label: "Actions", kind: "actions" },
        ], serviceRows, { emptyTitle: "No services yet" }),
      ),
    ),
  )
  .modals(
    surface.modal("editService", { title: "Edit service", open: true }, serviceForm),
    surface.confirm("archiveService", {
      title: "Archive this service?",
      body: "Hidden services will not appear in the public booking flow.",
      confirmLabel: "Archive service",
      tone: "danger",
    }),
  )
  .meta({ storyTitle: "Admin DSL/Services", tags: ["admin", "resource", "v2"] })
  .toJSON();

export const dashboardAdminPage = admin.page("admin-dashboard", "Today")
  .describe("A one-stylist operating dashboard for the current day.")
  .shell("admin", { active: "dashboard", eyebrow: "Salon admin", owner: "Mia" })
  .content(
    admin.pageHeader({ title: "Today", description: "A one-stylist operating dashboard for the current day.", breadcrumbs: ["Salon admin", "Dashboard"] })
      .actions(action.open("blockTimeOff", "Block time off").placement("pageHeader"), action.navigate("admin-services", "Edit services").placement("pageHeader")),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.metric("Appointments", 3, { caption: "Scheduled today", tone: "plum", layout: { span: { desktop: 4, mobile: 1 }, order: 10 } }),
      admin.metric("Pending", 2, { caption: "Consultations to review", tone: "warn", layout: { span: { desktop: 4, mobile: 1 }, order: 11 } }),
      admin.metric("Booked", "$420", { caption: "Estimated revenue", tone: "success", layout: { span: { desktop: 4, mobile: 1 }, order: 12 } }),
      admin.panel("Needs attention", { padding: "none", layout: { span: { desktop: 8, mobile: 1 }, order: 20 } },
        resource.table("pendingIntakes", [
          { id: "client", label: "Client" },
          { id: "request", label: "Request" },
          { id: "status", label: "Status", type: "badge" },
        ], [
          { id: "intake-1", client: "Ari Wells", request: "Balayage request · $250-$400", status: "Photos ready", actions: [action.open("intakeDetail", "Review", { id: "intake-1" }).placement("row").toJSON()] },
          { id: "intake-2", client: "Nora Lee", request: "Extensions consultation", status: "Needs estimate", actions: [action.open("intakeDetail", "Review", { id: "intake-2" }).placement("row").toJSON()] },
        ]),
      ),
      admin.panel("Quick actions", { layout: { span: { desktop: 4, mobile: 1 }, order: 30 }, footerActions: [action.navigate("availability", "Open availability").placement("panelFooter").toJSON(), action.navigate("website", "Open website content").placement("panelFooter").toJSON()] },
        admin.markdown("Update working hours, buffers, blackout dates, homepage copy, policies, and gallery images."),
      ),
    ),
  )
  .drawers(surface.drawer("intakeDetail", { title: "Consultation request", open: true },
    admin.kvList([{ label: "Client", value: "Ari Wells" }, { label: "Request", value: "Balayage with face frame" }, { label: "Budget", value: "$250-$400" }]),
    admin.markdown("Client uploaded three photos and is available next Thursday afternoon."),
  ))
  .meta({ storyTitle: "Admin DSL/Dashboard", tags: ["admin", "dashboard", "v2"] })
  .toJSON();

export const calendarAdminPage = admin.calendarPage("admin-calendar", "Calendar")
  .describe("Month view for appointments, consultations, and time-off blocks.")
  .shell("admin", { active: "calendar", eyebrow: "Salon admin", range: "month" })
  .content(
    admin.pageHeader({ title: "Calendar", description: "Month view for appointments, consultations, and time-off blocks.", breadcrumbs: ["Salon admin", "Calendar"] })
      .actions(action.open("newAppointment", "New appointment").placement("pageHeader"), action.open("blockTimeOff", "Block time off").placement("pageHeader")),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("June 2026", { layout: { span: { desktop: 5, mobile: 1 }, order: 10 } },
        admin.monthCalendar("calendar-month", { month: "2026-06", markers: [{ date: "2026-06-18", kind: "booked" }, { date: "2026-06-20", kind: "timeOff" }], legend: [{ kind: "booked", label: "Booked", tone: "success" }, { kind: "timeOff", label: "Time off", tone: "warning" }] }),
      ),
      admin.panel("Selected day", { padding: "none", layout: { span: { desktop: 7, mobile: 1 }, order: 20 } },
        resource.table("appointments", [{ id: "client", label: "Client" }, { id: "service", label: "Service" }, { id: "time", label: "Time" }], [
          { id: "apt-1001", client: "Lena Ortiz", service: "Color + cut", time: "09:30 – 12:00" },
          { id: "apt-1002", client: "Maya Chen", service: "Consultation", time: "13:00 – 13:45" },
        ]),
      ),
    ),
  )
  .modals(surface.modal("newAppointment", { title: "New appointment" },
    admin.form("appointmentForm", { title: "Create appointment" }, field.text("clientName", { label: "Client name" }), field.select("service", services.map((service) => ({ value: service.id, label: service.title })), { label: "Service" }), field.date("date", { label: "Date" }), field.time("startsAt", { label: "Start time" })),
  ))
  .meta({ storyTitle: "Admin DSL/Calendar", tags: ["admin", "calendar", "v2"] })
  .toJSON();

export const adminDslExamples: Record<string, AdminPage> = {
  services: servicesAdminPage,
  dashboard: dashboardAdminPage,
  calendar: calendarAdminPage,
};
