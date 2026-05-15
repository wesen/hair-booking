import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, field, resource, surface } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminPage } from "./schema";

type ResourceScenario = "loading" | "empty" | "error" | "selected" | "dirty" | "pending" | "validation" | "success";

function resourceLifecyclePage(scenario: ResourceScenario): AdminPage {
  const hasRows = !["loading", "empty", "error"].includes(scenario);
  const list = resource.list("services", {
    state: scenario === "loading" || scenario === "empty" || scenario === "error" ? scenario : "idle",
    loadingTitle: "Loading service menu",
    emptyTitle: "No services configured",
    emptyBody: "Create the first service before opening online booking.",
    errorTitle: "Services failed to load",
    errorBody: "The mocked resource query returned an error.",
  },
    ...(hasRows ? [
      resource.row("cut", { title: "Cut", subtitle: "60 min · $80+", badge: "Selected", tone: "plum" }).actions(action.open("service.select", "Open").placement("row")),
      resource.row("color", { title: "Color", subtitle: "90 min · $140+", badge: "Published", tone: "success" }),
    ] : []),
  ).empty(admin.emptyState("No services configured", { body: "Create the first service before opening online booking." }));

  const formState = scenario === "pending" ? "pending" : scenario === "success" ? "success" : scenario === "validation" ? "dirty" : scenario === "dirty" ? "dirty" : "idle";
  const form = admin.form("serviceLifecycleForm", { title: "Service form", state: formState, dirty: scenario === "dirty" || scenario === "validation", pending: scenario === "pending" })
    .values({ name: "Cut", duration: 60, price: 80 })
    .errors(scenario === "validation" ? { name: "Name is required", price: "Price must be at least $1" } : {})
    .children(
      admin.fieldGroup("Basics",
        field.text("name", { label: "Name", value: scenario === "validation" ? "" : "Cut" }),
        field.duration("duration", { label: "Duration", value: "60 min" }),
        field.money("price", { label: "Price", value: scenario === "validation" ? "$0" : "$80+" }),
      ),
    )
    .submit(action.primary("service.save", "Save").placement("footer").loading(scenario === "pending"))
    .cancel(action.secondary("service.cancel", "Cancel").placement("footer").disabled(scenario === "pending"));

  const page = resource.page("resource-lifecycle", "Resource and form lifecycle")
    .shell("resource", { eyebrow: "Admin DSL / Resources" })
    .describe("Scenario catalog for resource query states and lifecycle-aware forms.")
    .toolbar(action.primary("service.create", "Add service").placement("toolbar"), action.refresh("services.refresh", "Refresh").placement("toolbar"))
    .content(admin.section("Services", {}, list));

  if (!["loading", "empty", "error"].includes(scenario)) {
    page.drawers(surface.drawer("serviceLifecycleDrawer", { title: "Edit service", open: true, selectedId: "cut" }, form));
  }

  return page.toJSON();
}

function ResourceLifecycleStory({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("resource lifecycle event", event) }} />;
}

const meta: Meta<typeof ResourceLifecycleStory> = {
  title: "Admin DSL/Resources/Form Lifecycle",
  component: ResourceLifecycleStory,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ResourceLifecycleStory>;

export const Loading: Story = { args: { page: resourceLifecyclePage("loading") } };
export const Empty: Story = { args: { page: resourceLifecyclePage("empty") } };
export const Error: Story = { args: { page: resourceLifecyclePage("error") } };
export const Selected: Story = { args: { page: resourceLifecyclePage("selected") } };
export const Dirty: Story = { args: { page: resourceLifecyclePage("dirty") } };
export const Pending: Story = { args: { page: resourceLifecyclePage("pending") } };
export const ValidationError: Story = { args: { page: resourceLifecyclePage("validation") } };
export const Saved: Story = { args: { page: resourceLifecyclePage("success") } };
