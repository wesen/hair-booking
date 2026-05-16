import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, resource } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminJsonObject, AdminPage } from "./schema";

const availabilityDays: AdminJsonObject[] = [
  { value: "2026-06-18", day: "18", dot: true },
  { value: "2026-06-19", day: "19", dot: true },
  { value: "2026-06-20", day: "20" },
  { value: "2026-06-21", day: "21", dot: true },
  { value: "2026-06-22", day: "22" },
  { value: "2026-06-23", day: "23", disabled: true },
  { value: "2026-06-24", day: "24", disabled: true },
  { value: "2026-06-25", day: "25", dot: true },
  { value: "2026-06-26", day: "26", dot: true },
  { value: "2026-06-27", day: "27" },
  { value: "2026-06-28", day: "28", disabled: true },
  { value: "2026-06-29", day: "29" },
  { value: "2026-06-30", day: "30", dot: true },
];

const serviceItems: AdminJsonObject[] = [
  { id: "svc_cut", title: "Cut", subtitle: "Trim · restyle · bangs · sort 10" },
  { id: "svc_highlights", title: "Highlights", subtitle: "Partial · full · balayage · sort 20" },
  { id: "svc_gloss", title: "Gloss refresh", subtitle: "Tone · shine · maintenance · sort 30" },
];

const changes: AdminJsonObject[] = [
  { field: "Service title", before: "Highlights", after: "Lived-in highlights", tone: "warn" },
  { field: "Budget", before: "$200–$350", after: "$220–$380", tone: "warn" },
  { field: "Availability", before: "Jun 23 available", after: "Jun 23 disabled", tone: "danger" },
  { field: "Copy", before: "Add a few photos", after: "Upload current hair photos", tone: "success" },
];

function page(id: string, title: string, description: string, ...nodes: Parameters<ReturnType<typeof admin.page>["content"]>): AdminPage {
  return admin.page(id, title)
    .shell("admin", { eyebrow: "Admin DSL / Advanced Components" })
    .describe(description)
    .content(...nodes)
    .toJSON();
}

function actionableControlsPage(): AdminPage {
  return page(
    "advanced-actionable-controls",
    "Actionable filters, tabs, and search",
    "Interactive control primitives dispatch backend actions instead of being decorative pills.",
    admin.tabs([
      { id: "new", label: "New" },
      { id: "reviewing", label: "Reviewing" },
      { id: "booked", label: "Booked" },
    ], "new").actions(action.secondary("tabs.change", "Change tab")),
    admin.filterBar([
      { id: "new", label: "New" },
      { id: "needs_info", label: "Needs info" },
      { id: "", label: "All" },
    ], "needs_info").actions(action.secondary("filters.change", "Filter")),
    admin.searchBox("Search customer or service", { value: "Maya" }).actions(action.secondary("search.submit", "Search")),
  );
}

function editableListPage(state: "normal" | "empty" | "dense"): AdminPage {
  const items = state === "empty" ? [] : state === "dense" ? Array.from({ length: 12 }, (_, index) => ({
    id: `svc_${index}`,
    title: `Service ${index + 1}`,
    subtitle: `Sortable item · sort ${index + 1}`,
  })) : serviceItems;
  return page(
    `advanced-editable-list-${state}`,
    `Editable list · ${state}`,
    "Sortable/editable list primitive for service, tone, budget, and time-slot editors.",
    admin.section("Service ordering", { description: "Drag handles are visual for now; row actions dispatch the selected item." },
      admin.editableList("services", items, { emptyTitle: "No services in this category" })
        .actions(action.open("service.edit", "Edit").placement("row")),
    ),
  );
}

function availabilityPage(state: "normal" | "readonly" | "dense"): AdminPage {
  const days = state === "dense" ? [...availabilityDays, ...availabilityDays.map((day, index) => ({ ...day, value: `${day.value}-next`, day: String(index + 1) }))] : availabilityDays;
  const grid = admin.monthAvailabilityGrid("juneAvailability", days, { selected: "2026-06-19" });
  if (state !== "readonly") grid.actions(action.open("availability.selectDay", "Select day").placement("detail"));
  return page(
    `advanced-availability-${state}`,
    `Month availability · ${state}`,
    "Config-level month availability grid for publishable customer booking options.",
    admin.section("June 2026", { description: "Dots indicate availability; warm cells indicate disabled days." }, grid),
  );
}

function previewFramePage(state: "placeholder" | "iframe" | "mobile"): AdminPage {
  return page(
    `advanced-preview-${state}`,
    `Preview frame · ${state}`,
    "Draft customer-intake preview primitive. The real route bridge can attach a URL when available.",
    admin.previewFrame("customerPreview", {
      title: "Customer intake preview",
      body: "Preview draft config cfg_2026_summer before publishing.",
      placeholder: "Customer DSL preview route not connected in this fixture.",
      height: state === "mobile" ? 640 : 360,
      ...(state === "iframe" ? { url: "/booking" } : {}),
    }).actions(action.open("preview.openRoute", "Open full preview")),
  );
}

function diffViewPage(state: "publish" | "conflict" | "empty"): AdminPage {
  return page(
    `advanced-diff-${state}`,
    `Diff view · ${state}`,
    "Before/after change summary for publishing drafts and resolving save conflicts.",
    admin.diffView("configDiff", state === "empty" ? [] : changes, {
      title: state === "conflict" ? "Save conflict" : "Publish changes",
      body: state === "conflict" ? "This draft changed in another session." : "Review config changes before publish.",
    }),
  );
}

function tableAdvancedPage(): AdminPage {
  return page(
    "advanced-table-pagination-bulk",
    "Resource table pagination and bulk actions",
    "resourceTable fixture with pagination metadata, visible-row bulk action bar, and selectable rows.",
    admin.section("Requests", {},
      resource.table("requests", [
        { id: "status", label: "Status" },
        { id: "customer", label: "Customer" },
        { id: "service", label: "Service" },
      ], [
        { id: "req_1", status: "new", customer: "Maya", service: "Highlights" },
        { id: "req_2", status: "new", customer: "Jules", service: "Cut" },
      ], {
        selectable: true,
        bulkLabel: "2 visible rows",
        bulkActions: [action.secondary("requests.bulkReview", "Mark reviewed").toJSON(), action.danger("requests.bulkArchive", "Archive").toJSON()],
        pagination: { page: 1, pageSize: 25, total: 86 },
      }).actions(action.open("request.open", "Open").placement("row"), action.secondary("page.next", "Next page").placement("footer")),
    ),
  );
}

function matrixPage(): AdminPage {
  return page(
    "advanced-component-matrix",
    "Advanced component matrix",
    "All Phase 5 primitives on one page for screenshot and responsive review.",
    admin.filterBar([{ id: "new", label: "New" }, { id: "", label: "All" }], "new").actions(action.secondary("filters.change", "Filter")),
    admin.editableList("services", serviceItems).actions(action.open("service.edit", "Edit").placement("row")),
    admin.monthAvailabilityGrid("availability", availabilityDays, { selected: "2026-06-19" }).actions(action.open("availability.select", "Select")),
    admin.diffView("diff", changes, { title: "Draft changes" }),
    admin.previewFrame("preview", { title: "Preview", placeholder: "Route-level preview bridge", height: 220 }),
  );
}

function AdvancedStory({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("advanced component story event", event) }} />;
}

const meta: Meta<typeof AdvancedStory> = {
  title: "Admin DSL/Advanced Components",
  component: AdvancedStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof AdvancedStory>;

export const ActionableControls: Story = { args: { page: actionableControlsPage() } };
export const EditableList: Story = { args: { page: editableListPage("normal") } };
export const EditableListDense: Story = { args: { page: editableListPage("dense") } };
export const EditableListEmpty: Story = { args: { page: editableListPage("empty") } };
export const MonthAvailabilityGrid: Story = { args: { page: availabilityPage("normal") } };
export const MonthAvailabilityReadOnly: Story = { args: { page: availabilityPage("readonly") } };
export const MonthAvailabilityDense: Story = { args: { page: availabilityPage("dense") } };
export const PreviewFramePlaceholder: Story = { args: { page: previewFramePage("placeholder") } };
export const PreviewFrameIframe: Story = { args: { page: previewFramePage("iframe") } };
export const PreviewFrameMobile: Story = { args: { page: previewFramePage("mobile") }, parameters: { viewport: { defaultViewport: "iphone14" } } };
export const DiffViewPublish: Story = { args: { page: diffViewPage("publish") } };
export const DiffViewConflict: Story = { args: { page: diffViewPage("conflict") } };
export const DiffViewEmpty: Story = { args: { page: diffViewPage("empty") } };
export const ResourceTablePaginationBulk: Story = { args: { page: tableAdvancedPage() } };
export const AdvancedMatrix: Story = { args: { page: matrixPage() } };
export const AdvancedMatrixMobile: Story = { args: { page: matrixPage() }, parameters: { viewport: { defaultViewport: "iphone14" } } };
