import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, resource } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminJsonObject, AdminPage } from "./schema";

const navItems: AdminJsonObject[] = [
  { id: "overview", label: "Overview", icon: "⌂", action: action.mutation("nav.overview", "Overview").placement("sidebarNav").toJSON() },
  { id: "services", label: "Services", icon: "▦", action: action.mutation("nav.services", "Services").placement("sidebarNav").toJSON() },
  { id: "calendar", label: "Calendar", icon: "□", action: action.mutation("nav.calendar", "Calendar").placement("sidebarNav").toJSON() },
  { id: "drafts", label: "Drafts", icon: "✎", action: action.mutation("nav.drafts", "Drafts").placement("sidebarNav").toJSON() },
  { id: "media", label: "Media", icon: "▧", action: action.mutation("nav.media", "Media").placement("sidebarNav").toJSON() },
  { id: "settings", label: "Settings", icon: "⚙", action: action.mutation("nav.settings", "Settings").placement("sidebarNav").toJSON() },
  { id: "activity", label: "Activity Log", icon: "↺", action: action.mutation("nav.activity", "Activity Log").placement("sidebarNav").toJSON() },
];

const services: AdminJsonObject[] = [
  { id: "svc_cut", name: "Cut", description: "Trim · restyle · bangs · sort 10", status: "published", actions: [action.open("service.menu", "Open", { id: "svc_cut" }).placement("rowOverflow").toJSON()] },
  { id: "svc_highlights", name: "Highlights", description: "Partial · full · balayage · sort 20", status: "published", actions: [action.open("service.menu", "Open", { id: "svc_highlights" }).placement("rowOverflow").toJSON()] },
  { id: "svc_gloss", name: "Gloss Refresh", description: "Tone · shine · maintenance · sort 30", status: "draftChanges", actions: [action.open("service.menu", "Open", { id: "svc_gloss" }).placement("rowOverflow").toJSON()] },
];

const serviceColumns: AdminJsonObject[] = [
  { id: "handle", kind: "dragHandle", width: 32, label: "" },
  { id: "name", kind: "text", label: "Service", primary: true },
  { id: "description", kind: "text", label: "Description", tone: "muted" },
  { id: "status", kind: "badge", label: "Status", map: { published: { label: "Published", tone: "success" }, draftChanges: { label: "Draft Changes", tone: "warning" } } },
  { id: "actions", kind: "overflowActions", label: "Actions" },
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
];

function workbenchPage(): AdminPage {
  return admin.page("admin-dsl-v2-workbench-target", "Advanced Component Matrix")
    .schemaVersion(2)
    .shell("admin", {
      variant: "workbench",
      density: "compact",
      sidebar: {
        active: "overview",
        items: navItems,
        user: { name: "Admin User", role: "Administrator", initials: "AD" },
      },
    })
    .content(
      admin.pageHeader({
        breadcrumbs: ["Admin DSL", "Advanced Components"],
        title: "Advanced Component Matrix",
        description: "All Phase 5 primitives on one page for screenshot and responsive review.",
        actions: [action.primary("service.new", "New Service").placement("pageHeader").toJSON()],
      }),
      admin.dashboardGrid({ columns: { desktop: 12, tablet: 8, mobile: 1 }, gap: "compact", density: "compact" },
        admin.metric("Total Services", 24, { caption: "3 draft changes", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 10 } }),
        admin.metric("Upcoming Changes", 2, { caption: "Next: Jun 23", tone: "warning", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 11 } }),
        admin.metric("Last Published", "Jun 19", { caption: "Highlights updated", tone: "success", layout: { span: { desktop: 4, tablet: 4, mobile: 1 }, order: 12 } }),
        admin.panel("Phase 5 Services", { density: "compact", padding: "none", layout: { span: { desktop: 8, tablet: 8, mobile: 1 }, order: 20 }, footerActions: [action.open("service.new", "Add new service").placement("panelFooter").toJSON()] },
          resource.table("services", serviceColumns, services),
        ),
        admin.panel("Calendar", { density: "compact", layout: { span: { desktop: 4, tablet: 8, mobile: 1 }, order: 30 } },
          admin.monthCalendar("publishCalendar", {
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
          }),
        ),
        admin.panel("Draft Changes", { density: "compact", padding: "none", layout: { span: { desktop: 12, tablet: 8, mobile: 1 }, order: 40 } },
          admin.comparisonTable("draftChanges", draftChanges),
        ),
        admin.panel("Recent Activity", { density: "compact", layout: { span: { desktop: 6, tablet: 4, mobile: 1 }, order: 50 }, footerActions: [action.open("activity.viewAll", "View all activity").placement("panelFooter").toJSON()] },
          admin.activityFeed(activityItems),
        ),
        admin.panel("Preview", { density: "compact", layout: { span: { desktop: 6, tablet: 4, mobile: 1 }, order: 60 }, footerActions: [action.open("preview.open", "Open preview").placement("panelFooter").toJSON()] },
          admin.previewFrame("preview", { placeholder: "Route-level preview bridge", height: 220 }),
        ),
      ),
    )
    .toJSON();
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

export const TargetDesktop: Story = {
  args: { page: workbenchPage() },
  parameters: { viewport: { defaultViewport: "desktop" } },
};

export const TargetMobile: Story = {
  args: { page: workbenchPage() },
  parameters: { viewport: { defaultViewport: "iphone14" } },
};
