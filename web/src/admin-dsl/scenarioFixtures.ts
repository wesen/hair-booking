import { action, admin, resource } from "./builder";
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

export function servicesScenarioPage(state: ServicesScenarioState): AdminPage {
  const selected = ["selected", "confirm", "saving", "error", "success"].includes(state);
  const isSaving = state === "saving";
  const listState = state === "empty" || state === "loading" ? state : state === "stale" ? "error" : "idle";
  const page = resource.page("services-scenario", "Services scenario catalog")
    .shell("resource", { active: "services", eyebrow: "Admin DSL / Services" })
    .describe("Behavior scenario fixture for actions, permissions, stale state, resource states, and save lifecycle review.")
    .toolbar(
      action.primary("service.create", "Add service").placement("toolbar").disabled(state === "permission"),
      action.secondary("services.refresh", "Refresh").placement("toolbar").loading(isSaving),
    )
    .content(
      admin.section("Service menu", { description: "Rows and actions are intentionally stable for screenshot capture." },
        resource.list("services", {
          state: listState,
          emptyTitle: "No services configured",
          emptyBody: "Create the first service before enabling online booking.",
          errorTitle: state === "stale" ? "Stale action rejected" : "Could not load services",
          errorBody: state === "stale" ? "A newer page version exists in the mocked runtime." : "The mocked query handler returned an error.",
        },
          resource.row("cut", { title: "Cut", subtitle: "60 min · $80+", badge: selected ? "Selected" : "Published", tone: selected ? "plum" : "success" }).actions(
            action.open("service.select", "Open", { id: "cut" }).placement("row").disabled(state === "permission"),
            action.danger("service.archive", "Archive", { id: "cut" }).placement("row").accessibilityLabel("Archive Cut service").disabled(state === "permission"),
          ),
          resource.row("extensions", { title: "Extensions", subtitle: "Consultation required", badge: "Draft", tone: "warn" }).actions(
            action.open("service.select", "Open", { id: "extensions" }).placement("row").disabled(state === "permission"),
            action.ghost("service.preview", "Preview", { id: "extensions" }).placement("overflow"),
          ),
        ),
      ),
      state === "permission" ? admin.inlineError("Permission restricted", { body: "The mocked user can view services but cannot edit them." }) : state === "success" ? admin.emptyState("Saved successfully", { body: "The mocked save action completed and returned a success page." }) : state === "error" ? admin.inlineError("Save failed", { body: "The mocked handler returned a validation error." }) : admin.emptyState("No server response yet", { body: "Use the buttons to exercise dispatch-driven states." }),
    );

  if (selected) {
    page.drawers(admin.drawer("serviceEditor", { title: state === "confirm" ? "Archive Cut?" : "Edit Cut", open: true, selectedId: "cut" },
      admin.form("serviceForm", { title: "Service form", dirty: state === "selected" || state === "error", pending: isSaving, state: isSaving ? "pending" : state === "success" ? "success" : state === "error" ? "dirty" : "dirty" })
        .errors(state === "error" ? { name: "Name is required" } : {})
        .children(admin.fieldGroup("Basics", admin.markdown(state === "confirm" ? "Confirm archival for Cut." : "Name: Cut\nDuration: 60 min\nPrice: $80+")))
        .submit(action.primary("service.save", "Save").placement("footer").loading(isSaving))
        .cancel(action.secondary("service.cancel", "Cancel").placement("footer").disabled(isSaving)),
    ));
  }

  return page.toJSON();
}
