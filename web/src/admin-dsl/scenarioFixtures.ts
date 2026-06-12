import { action, admin, field, resource, surface } from "./builder";
import type { AdminScenarioDefinition } from "./scenarioHarness";
import type { AdminPage } from "./schema";

export type ServicesScenarioState = "idle" | "selected" | "confirm" | "saving" | "error" | "success" | "stale" | "empty" | "loading" | "permission";

export function nextServicesScenarioState(target: string, options: { failSave?: boolean } = {}): ServicesScenarioState {
  switch (target) {
    case "service.select": return "selected";
    case "service.archive": return "confirm";
    case "service.archive.confirm": return "success";
    case "service.save": return options.failSave ? "error" : "success";
    case "service.cancel": return "idle";
    default: return "selected";
  }
}

export const servicesScenarioDefinition: AdminScenarioDefinition<ServicesScenarioState> = {
  endpoint: "/api/admin-dsl/scenarios/services",
  initialState: "idle",
  renderPage: servicesScenarioPage,
  fallbackState: "selected",
  transitions: [
    { target: "service.select", to: "selected", message: "Opened service editor" },
    { target: "service.archive", to: "confirm", message: "Opened archive confirmation" },
    { target: "service.archive.confirm", to: "success", message: "Archived service" },
    { target: "service.save", to: "success", latencyMs: 180, message: "Saved service" },
    { target: "service.save.validation", to: "error", status: "validation", message: "Validation failed" },
    { target: "service.save.pending", to: "saving", latencyMs: 250, message: "Saving service" },
    { target: "service.cancel", to: "idle", message: "Cancelled edit" },
    { target: "services.refresh", to: "loading", latencyMs: 180, message: "Refreshing services" },
    { target: "service.permission", to: "permission", status: "authorization", message: "Permission denied" },
    { target: "service.stale", to: "stale", status: "stale", message: "Stale page version" },
  ],
};

export function servicesScenarioPage(state: ServicesScenarioState): AdminPage {
  const selected = ["selected", "confirm", "saving", "error", "success"].includes(state);
  const isSaving = state === "saving";
  const tableState = state === "empty" || state === "loading" ? state : state === "stale" ? "error" : "idle";
  const rows = state === "empty" ? [] : [
    { id: "cut", title: "Cut", details: "60 min · $80+", status: selected ? "Selected" : "Published", actions: [action.open("service.select", "Open", { id: "cut" }).placement("row").disabled(state === "permission").toJSON(), action.danger("service.archive", "Archive", { id: "cut" }).placement("rowOverflow").accessibilityLabel("Archive Cut service").disabled(state === "permission").toJSON()] },
    { id: "extensions", title: "Extensions", details: "Consultation required", status: "Draft", actions: [action.open("service.select", "Open", { id: "extensions" }).placement("row").disabled(state === "permission").toJSON()] },
  ];
  const page = admin.page("services-scenario", "Services scenario catalog")
    .shell("admin", { active: "services", eyebrow: "Admin DSL / Services" })
    .describe("Behavior scenario fixture for actions, permissions, stale state, resource states, and save lifecycle review.")
    .content(
      admin.pageHeader({ title: "Services scenario catalog", description: "Behavior scenario fixture for dispatch-driven states." })
        .actions(action.primary("service.create", "Add service").placement("pageHeader").disabled(state === "permission"), action.secondary("services.refresh", "Refresh").placement("pageHeader").loading(isSaving)),
      admin.dashboardGrid({ columns: { desktop: 12, mobile: 1 }, gap: "compact" },
        admin.panel("Service menu", { description: "Rows and actions are intentionally stable for screenshot capture.", padding: "none", layout: { span: { desktop: 8, mobile: 1 }, order: 10 } },
          resource.table("services", [
            { id: "title", label: "Service" },
            { id: "details", label: "Details" },
            { id: "status", label: "Status", type: "badge" },
          ], rows, {
            state: tableState,
            emptyTitle: "No services configured",
            emptyBody: "Create the first service before enabling online booking.",
            errorTitle: state === "stale" ? "Stale action rejected" : "Could not load services",
            errorBody: state === "stale" ? "A newer page version exists in the mocked runtime." : "The mocked query handler returned an error.",
          }),
        ),
        admin.panel("Scenario status", { layout: { span: { desktop: 4, mobile: 1 }, order: 20 } },
          state === "permission" ? admin.inlineError("Permission restricted", { body: "The mocked user can view services but cannot edit them." }) :
            state === "success" ? admin.emptyState("Saved successfully", { body: "The mocked save action completed and returned a success page." }) :
              state === "error" ? admin.inlineError("Save failed", { body: "The mocked handler returned a validation error." }) :
                admin.emptyState("No server response yet", { body: "Use the buttons to exercise dispatch-driven states." }),
        ),
      ),
    );

  if (selected) {
    page.drawers(surface.drawer("serviceEditor", { title: state === "confirm" ? "Archive Cut?" : "Edit Cut", open: true, selectedId: "cut" },
      admin.form("serviceForm", { title: "Service form", dirty: state === "selected" || state === "error", pending: isSaving, state: isSaving ? "pending" : state === "success" ? "success" : state === "error" ? "dirty" : "dirty" },
        admin.fieldGroup("Basics",
          state === "confirm" ? admin.markdown("Confirm archival for Cut.") : field.text("name", { label: "Name", value: "Cut", required: true }),
        ),
      )
        .errors(state === "error" ? { name: "Name is required" } : {})
        .submit(action.primary("service.save", "Save").placement("formFooter").loading(isSaving))
        .cancel(action.secondary("service.cancel", "Cancel").placement("formFooter").disabled(isSaving)),
    ));
  }

  return page.toJSON();
}
