import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, field, resource } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminJsonObject, AdminPage } from "./schema";

const navItems: AdminJsonObject[] = [
  { id: "overview", label: "Overview", icon: "⌂", action: action.mutation("nav.overview", "Overview").placement("sidebarNav").toJSON() },
  { id: "services", label: "Services", icon: "▦", action: action.mutation("nav.services", "Services").placement("sidebarNav").toJSON() },
  { id: "calendar", label: "Calendar", icon: "□", action: action.mutation("nav.calendar", "Calendar").placement("sidebarNav").toJSON() },
  { id: "drafts", label: "Drafts", icon: "✎", action: action.mutation("nav.drafts", "Drafts").placement("sidebarNav").toJSON() },
  { id: "requests", label: "Requests", icon: "!", action: action.mutation("nav.requests", "Requests").placement("sidebarNav").toJSON() },
  { id: "media", label: "Media", icon: "▧", action: action.mutation("nav.media", "Media").placement("sidebarNav").toJSON() },
  { id: "settings", label: "Settings", icon: "⚙", action: action.mutation("nav.settings", "Settings").placement("sidebarNav").toJSON() },
  { id: "activity", label: "Activity Log", icon: "↺", action: action.mutation("nav.activity", "Activity Log").placement("sidebarNav").toJSON() },
];

const serviceColumns: AdminJsonObject[] = [
  { id: "handle", kind: "dragHandle", width: 32, label: "" },
  { id: "name", kind: "text", label: "Service", primary: true },
  { id: "description", kind: "text", label: "Description", tone: "muted" },
  { id: "status", kind: "badge", label: "Status", map: { published: { label: "Published", tone: "success" }, draftChanges: { label: "Draft Changes", tone: "warning" }, disabled: { label: "Disabled", tone: "danger" } } },
  { id: "actions", kind: "overflowActions", label: "Actions" },
];

const services: AdminJsonObject[] = [
  { id: "svc_cut", name: "Cut", description: "Trim · restyle · bangs · sort 10", status: "published", actions: [action.open("service.menu", "Open", { id: "svc_cut" }).placement("rowOverflow").toJSON()] },
  { id: "svc_highlights", name: "Highlights", description: "Partial · full · balayage · sort 20", status: "published", actions: [action.open("service.menu", "Open", { id: "svc_highlights" }).placement("rowOverflow").toJSON()] },
  { id: "svc_gloss", name: "Gloss Refresh", description: "Tone · shine · maintenance · sort 30", status: "draftChanges", actions: [action.open("service.menu", "Open", { id: "svc_gloss" }).placement("rowOverflow").toJSON()] },
  { id: "svc_extensions", name: "Extensions", description: "Consultation · quote required · sort 40", status: "disabled", actions: [action.open("service.menu", "Open", { id: "svc_extensions" }).placement("rowOverflow").toJSON()] },
];

const requestColumns: AdminJsonObject[] = [
  { id: "status", kind: "badge", label: "Status", map: { new: { label: "New", tone: "warning" }, needsInfo: { label: "Needs info", tone: "danger" }, approved: { label: "Approved", tone: "success" } } },
  { id: "customer", kind: "text", label: "Customer", primary: true },
  { id: "service", kind: "text", label: "Service" },
  { id: "budget", kind: "money", label: "Budget" },
  { id: "submitted", kind: "relativeTime", label: "Submitted" },
  { id: "actions", kind: "actions", label: "Actions" },
];

const requestRows: AdminJsonObject[] = [
  { id: "req_1001", status: "new", customer: "Maya Chen", service: "Highlights", budget: "$220–$380", submitted: "4m ago", actions: [action.open("request.review", "Review", { id: "req_1001" }).placement("row").toJSON()] },
  { id: "req_1002", status: "needsInfo", customer: "Jules Park", service: "Color correction", budget: "$300+", submitted: "22m ago", actions: [action.open("request.review", "Review", { id: "req_1002" }).placement("row").toJSON()] },
  { id: "req_1003", status: "approved", customer: "Lena Ortiz", service: "Gloss refresh", budget: "$120", submitted: "1h ago", actions: [action.open("request.review", "Review", { id: "req_1003" }).placement("row").toJSON()] },
];

const draftChanges: AdminJsonObject[] = [
  { id: "price", field: "Highlights – Price", current: "$200–$350", draft: "$220–$380", scheduled: "Jun 23", actions: [action.open("draft.review", "Review", { id: "price" }).placement("row").toJSON()] },
  { id: "availability", field: "Highlights – Availability", current: "Jun 23 available", draft: "Jun 23 disabled", scheduled: "Jun 23", actions: [action.open("draft.review", "Review", { id: "availability" }).placement("row").toJSON()] },
  { id: "description", field: "Gloss Refresh – Description", current: "Tone · shine · maintenance · sort 30", draft: "Updated description", scheduled: "Jun 28", actions: [action.open("draft.review", "Review", { id: "description" }).placement("row").toJSON()] },
  { id: "copy", field: "Cut – Copy", current: "Add a few photos", draft: "Upload current hair photos", scheduled: "Jun 28", actions: [action.open("draft.review", "Review", { id: "copy" }).placement("row").toJSON()] },
];

const activityItems: AdminJsonObject[] = [
  { time: "2m ago", title: "Highlights updated", body: "Price changed from $200–$350 to $220–$380" },
  { time: "15m ago", title: "Gloss Refresh updated", body: "Description changed" },
  { time: "1h ago", title: "Draft scheduled", body: "2 changes scheduled for Jun 23" },
  { time: "3h ago", title: "Request approved", body: "Maya Chen moved to approved" },
];

function shell(active = "overview") {
  return {
    variant: "workbench",
    density: "compact",
    sidebar: {
      active,
      items: navItems,
      user: { name: "Admin User", role: "Administrator", initials: "AD" },
    },
  };
}

function pageHeader(title: string, description: string, actions: AdminJsonObject[] = []) {
  return admin.pageHeader({ breadcrumbs: ["Admin DSL", "Workbench v2"], title, description, actions });
}

function workbench(id: string, title: string, active: string, ...nodes: Parameters<ReturnType<typeof admin.page>["content"]>): AdminPage {
  return admin.page(id, title)
    .schemaVersion(2)
    .shell("admin", shell(active))
    .content(...nodes)
    .toJSON();
}

function calendarNode(id = "publishCalendar") {
  return admin.monthCalendar(id, {
    month: "2024-06",
    selectedDate: "2024-06-19",
    markers: [
      { date: "2024-06-17", kind: "published" },
      { date: "2024-06-23", kind: "published" },
      { date: "2024-06-23", kind: "scheduled" },
      { date: "2024-06-24", kind: "scheduled" },
      { date: "2024-06-28", kind: "scheduled" },
    ],
    legend: [
      { kind: "published", label: "Published", tone: "success" },
      { kind: "scheduled", label: "Scheduled", tone: "warning" },
    ],
    actions: { selectDate: action.mutation("calendar.selectDate", "Select date").placement("calendarCell").toJSON() },
  });
}

function targetDashboardPage(): AdminPage {
  return workbench(
    "admin-dsl-v2-workbench-target",
    "Advanced Component Matrix",
    "overview",
    pageHeader("Advanced Component Matrix", "All Phase 5 primitives on one page for screenshot and responsive review.", [action.primary("service.new", "New Service").placement("pageHeader").toJSON()]),
    admin.dashboardGrid({ columns: { desktop: 12, tablet: 8, mobile: 1 }, gap: "compact", density: "compact" },
      admin.metric("Total Services", 24, { caption: "3 draft changes", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 10 } }),
      admin.metric("Upcoming Changes", 2, { caption: "Next: Jun 23", tone: "warning", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 11 } }),
      admin.metric("Last Published", "Jun 19", { caption: "Highlights updated", tone: "success", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 12 } }),
      admin.panel("Phase 5 Services", { density: "compact", padding: "none", layout: { span: { desktop: 8, tablet: 8, mobile: 1 }, order: 20 }, footerActions: [action.open("service.new", "Add new service").placement("panelFooter").toJSON()] },
        resource.table("services", serviceColumns, services),
      ),
      admin.panel("Calendar", { density: "compact", layout: { span: { desktop: 4, tablet: 8, mobile: 1 }, order: 30 } }, calendarNode()),
      admin.panel("Draft Changes", { density: "compact", padding: "none", layout: { span: { desktop: 12, tablet: 8, mobile: 1 }, order: 40 } }, admin.comparisonTable("draftChanges", draftChanges)),
      admin.panel("Recent Activity", { density: "compact", layout: { span: { desktop: 6, tablet: 4, mobile: 1 }, order: 50 }, footerActions: [action.open("activity.viewAll", "View all activity").placement("panelFooter").toJSON()] }, admin.activityFeed(activityItems)),
      admin.panel("Preview", { density: "compact", layout: { span: { desktop: 6, tablet: 4, mobile: 1 }, order: 60 }, footerActions: [action.open("preview.open", "Open preview").placement("panelFooter").toJSON()] }, admin.previewFrame("preview", { placeholder: "Route-level preview bridge", height: 220 })),
    ),
  );
}

function serviceOpsPage(): AdminPage {
  return workbench(
    "admin-dsl-v2-service-ops",
    "Service Operations",
    "services",
    pageHeader("Service Operations", "Table-first resource management with row overflow actions, panel footer CTAs, and compact metrics.", [action.primary("service.new", "New Service").placement("pageHeader").toJSON()]),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.metric("Published", 18, { caption: "Visible to customers", tone: "success", layout: { span: { desktop: 3, mobile: 1 }, order: 10 } }),
      admin.metric("Draft", 4, { caption: "Pending review", tone: "warning", layout: { span: { desktop: 3, mobile: 1 }, order: 11 } }),
      admin.metric("Disabled", 2, { caption: "Hidden services", tone: "danger", layout: { span: { desktop: 3, mobile: 1 }, order: 12 } }),
      admin.metric("Avg ticket", "$244", { caption: "Last 30 days", layout: { span: { desktop: 3, mobile: 1 }, order: 13 } }),
      admin.panel("Services", { density: "compact", padding: "none", layout: { span: { desktop: 12, mobile: 1 }, order: 20 }, toolbarActions: [action.secondary("services.export", "Export").placement("panelToolbar").toJSON()], footerActions: [action.open("service.new", "Add service").placement("panelFooter").toJSON()] },
        resource.table("services", serviceColumns, services),
      ),
    ),
  );
}

function requestTriagePage(): AdminPage {
  return workbench(
    "admin-dsl-v2-request-triage",
    "Request Triage",
    "requests",
    pageHeader("Request Triage", "Review customer intake requests with compact status, customer, service, budget, and submitted columns."),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("Today’s queue", { density: "compact", padding: "none", layout: { span: { desktop: 8, mobile: 1 }, order: 10 } },
        resource.table("requests", requestColumns, requestRows, { bulkLabel: "3 visible requests", bulkActions: [action.secondary("requests.bulkAssign", "Assign").placement("bulkToolbar").toJSON()] }),
      ),
      admin.panel("Queue health", { density: "compact", layout: { span: { desktop: 4, mobile: 1 }, order: 20 } },
        admin.metric("SLA risk", 1, { tone: "danger", caption: "Needs info > 20m" }),
        admin.kvList([{ label: "Oldest new", value: "22m" }, { label: "Photos missing", value: "2" }, { label: "Ready to book", value: "5" }]),
      ),
    ),
  );
}

function draftReviewPage(): AdminPage {
  return workbench(
    "admin-dsl-v2-draft-review",
    "Draft Review Queue",
    "drafts",
    pageHeader("Draft Review Queue", "Review current vs draft values as operational rows instead of a decorative diff block.", [action.primary("draft.publish", "Publish").placement("pageHeader").toJSON()]),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("Scheduled changes", { density: "compact", padding: "none", layout: { span: { desktop: 9, mobile: 1 }, order: 10 } }, admin.comparisonTable("draftChanges", draftChanges)),
      admin.panel("Publish summary", { density: "compact", layout: { span: { desktop: 3, mobile: 1 }, order: 20 }, footerActions: [action.danger("draft.discard", "Discard draft").placement("panelFooter").toJSON()] },
        admin.metric("Changed fields", draftChanges.length, { tone: "warning", caption: "Across 3 services" }),
        admin.kvList([{ label: "Next publish", value: "Jun 23" }, { label: "Reviewer", value: "Admin User" }, { label: "Validation", value: "Passing" }]),
      ),
    ),
  );
}

function calendarPublishingPage(): AdminPage {
  return workbench(
    "admin-dsl-v2-calendar-publishing",
    "Calendar Publishing",
    "calendar",
    pageHeader("Calendar Publishing", "Month calendar markers show published and scheduled admin state in one compact panel."),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("June 2024", { density: "compact", layout: { span: { desktop: 5, mobile: 1 }, order: 10 } }, calendarNode("publishingMonth")),
      admin.panel("Selected date", { density: "compact", layout: { span: { desktop: 7, mobile: 1 }, order: 20 } },
        admin.comparisonTable("dateChanges", [
          { id: "jun23-availability", field: "Jun 23 availability", current: "Open", draft: "Disabled", scheduled: "Jun 23", actions: [action.open("date.review", "Review").placement("row").toJSON()] },
          { id: "jun23-copy", field: "Booking copy", current: "Add a few photos", draft: "Upload current hair photos", scheduled: "Jun 23", actions: [action.open("date.review", "Review").placement("row").toJSON()] },
        ]),
      ),
    ),
  );
}

function editorWorkbenchPage(): AdminPage {
  return workbench(
    "admin-dsl-v2-editor-workbench",
    "Typed Form Workbench",
    "settings",
    pageHeader("Typed Form Workbench", "Form fields sit inside panels and are ready for v2 typed submit semantics."),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("Service basics", { density: "normal", layout: { span: { desktop: 7, mobile: 1 }, order: 10 }, footerActions: [action.primary("service.save", "Save").placement("panelFooter").toJSON(), action.secondary("service.cancel", "Cancel").placement("panelFooter").toJSON()] },
        admin.form("serviceForm", { title: "Highlights", dirty: true },
          admin.fieldGroup("Identity",
            field.text("label", { label: "Label", value: "Highlights" }),
            field.textarea("description", { label: "Description", value: "Partial · full · balayage" }),
            field.select("status", [{ label: "Published", value: "published" }, { label: "Draft", value: "draft" }], { label: "Status", value: "published" }),
            field.switch("visible", { label: "Visible to customers", value: true }),
          ),
        ),
      ),
      admin.panel("Pricing", { density: "compact", layout: { span: { desktop: 5, mobile: 1 }, order: 20 } },
        admin.form("pricingForm", { title: "Price range" },
          admin.fieldGroup("Money and duration",
            field.money("minCents", { label: "Minimum", value: 22000 }),
            field.money("maxCents", { label: "Maximum", value: 38000 }),
            field.duration("durationMinutes", { label: "Duration", value: 120 }),
          ),
        ),
      ),
    ),
  );
}

function emptyAndErrorsPage(): AdminPage {
  return workbench(
    "admin-dsl-v2-empty-errors",
    "Empty, Loading, and Error States",
    "overview",
    pageHeader("Empty, Loading, and Error States", "Panels can host operational states without inventing custom layout wrappers."),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("No draft changes", { density: "compact", layout: { span: { desktop: 4, mobile: 1 }, order: 10 } }, admin.emptyState("No draft changes", { body: "Create a draft to stage service updates." })),
      admin.panel("Loading requests", { density: "compact", layout: { span: { desktop: 4, mobile: 1 }, order: 20 } }, admin.loadingState("Loading queue", { body: "Fetching the latest intake requests." })),
      admin.panel("Config error", { density: "compact", layout: { span: { desktop: 4, mobile: 1 }, order: 30 } }, admin.inlineError("Config validation failed", { body: "A required service label is missing." })),
    ),
  );
}

function auditWorkbenchPage(): AdminPage {
  return workbench(
    "admin-dsl-v2-audit-workbench",
    "Audit Workbench",
    "activity",
    pageHeader("Audit Workbench", "Recent activity becomes a dashboard primitive and a detailed operations surface."),
    admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
      admin.panel("Recent activity", { density: "compact", layout: { span: { desktop: 5, mobile: 1 }, order: 10 } }, admin.activityFeed(activityItems)),
      admin.panel("Audit event details", { density: "compact", layout: { span: { desktop: 7, mobile: 1 }, order: 20 } },
        admin.kvList([
          { label: "Event", value: "config.service.update" },
          { label: "Actor", value: "Admin User" },
          { label: "Before", value: "$200–$350" },
          { label: "After", value: "$220–$380" },
          { label: "Correlation", value: "audit_01HY..." },
        ]),
      ),
    ),
  );
}

function WorkbenchStory({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("workbench story event", event) }} />;
}

const meta: Meta<typeof WorkbenchStory> = {
  title: "Admin DSL/Workbench v2",
  component: WorkbenchStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof WorkbenchStory>;

export const TargetDesktop: Story = { args: { page: targetDashboardPage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const TargetMobile: Story = { args: { page: targetDashboardPage() }, parameters: { viewport: { defaultViewport: "iphone14" } } };
export const ServiceOperations: Story = { args: { page: serviceOpsPage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const RequestTriage: Story = { args: { page: requestTriagePage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const DraftReviewQueue: Story = { args: { page: draftReviewPage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const CalendarPublishing: Story = { args: { page: calendarPublishingPage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const TypedFormWorkbench: Story = { args: { page: editorWorkbenchPage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const EmptyLoadingErrorStates: Story = { args: { page: emptyAndErrorsPage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const AuditWorkbench: Story = { args: { page: auditWorkbenchPage() }, parameters: { viewport: { defaultViewport: "desktop" } } };
export const DenseMobileOperations: Story = { args: { page: requestTriagePage() }, parameters: { viewport: { defaultViewport: "iphone14" } } };
