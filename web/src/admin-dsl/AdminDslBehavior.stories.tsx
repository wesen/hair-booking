import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { action, admin, resource } from "./builder";
import { AdminPageRenderer } from "./render";
import type { AdminActionRef, AdminPage, AdminRenderEvent } from "./schema";

type ServicesBehaviorState = "idle" | "selected" | "confirm" | "saving" | "error" | "success" | "stale";

function servicesBehaviorPage(state: ServicesBehaviorState): AdminPage {
  const selected = state !== "idle";
  const isSaving = state === "saving";
  const page = resource.page("services-behavior", "Services behavior scenarios")
    .shell("resource", { active: "services", eyebrow: "Admin DSL / Services / Behavior" })
    .describe("Scenario fixture for semantic actions, row placement, confirmation, pending, and error/success behavior.")
    .toolbar(
      action.primary("service.create", "Add service").placement("toolbar"),
      action.secondary("services.refresh", "Refresh").placement("toolbar").loading(isSaving),
    )
    .content(
      admin.section("Service menu", { description: "Click row actions to move this Storybook fixture through behavior states." },
        resource.list("services", { density: "comfortable" },
          resource.row("cut", {
            title: "Cut",
            subtitle: "60 min · $80+",
            badge: selected ? "Selected" : "Published",
            tone: selected ? "plum" : "success",
          }).actions(
            action.open("service.select", "Open", { id: "cut" }).placement("row").disabled(state === "stale"),
            action.danger("service.archive", "Archive", { id: "cut" }).placement("row").accessibilityLabel("Archive Cut service").disabled(state === "stale"),
          ),
          resource.row("extensions", {
            title: "Extensions",
            subtitle: "Consultation required",
            badge: "Draft",
            tone: "warn",
          }).actions(
            action.open("service.select", "Open", { id: "extensions" }).placement("row"),
            action.ghost("service.preview", "Preview", { id: "extensions" }).placement("overflow"),
          ),
        ),
      ),
      state === "error" ? admin.inlineError("Save failed", { body: "The mocked handler returned a validation error." }) : state === "stale" ? admin.inlineError("Stale page version", { body: "The mocked runtime rejected this page's actions because a newer page version exists." }) : admin.emptyState(state === "success" ? "Saved successfully" : "No server response yet", {
        body: state === "success" ? "The mocked save action completed and returned a success page." : "Use the buttons to exercise dispatch-driven states.",
      }),
    )
;

  if (selected) {
    page.drawers(admin.drawer("serviceEditor", {
      title: state === "confirm" ? "Archive Cut?" : "Edit Cut",
      open: true,
      selectedId: "cut",
    },
      admin.form("serviceForm", { dirty: state === "selected" || state === "error" || state === "saving" },
        admin.fieldGroup("Basics",
          admin.markdown(state === "confirm" ? "This confirmation surface is represented as an open drawer state for screenshot review." : "Name: Cut\nDuration: 60 min\nPrice: $80+"),
        ),
        admin.saveBar({
          status: isSaving ? "Saving…" : state === "error" ? "Validation error" : "Unsaved changes",
          primary: action.primary("service.save", "Save").placement("footer").loading(isSaving).toJSON(),
        }),
      ).actions(
        action.secondary("service.cancel", "Cancel").placement("footer").disabled(isSaving),
        action.danger("service.archive.confirm", "Archive now").placement("footer").disabled(isSaving),
      ),
    ));
  }

  return page.toJSON();
}

function nextStateForAction(target: string): ServicesBehaviorState {
  switch (target) {
    case "service.select": return "selected";
    case "service.archive": return "confirm";
    case "service.archive.confirm": return "success";
    case "service.save": return "saving";
    case "service.cancel": return "idle";
    default: return "selected";
  }
}

function ServicesBehaviorFixture({ initialState = "idle", failNextSave = false }: { initialState?: ServicesBehaviorState; failNextSave?: boolean }) {
  const [state, setState] = useState(initialState);
  const [events, setEvents] = useState<AdminRenderEvent[]>([]);
  const page = useMemo(() => servicesBehaviorPage(state), [state]);

  function dispatch(event: AdminRenderEvent) {
    setEvents((current) => [event, ...current].slice(0, 5));
    const target = (event.action as AdminActionRef).target;
    if (target === "service.save") {
      setState("saving");
      window.setTimeout(() => setState(failNextSave ? "error" : "success"), 250);
      return;
    }
    setState(nextStateForAction(target));
  }

  return (
    <div>
      <AdminPageRenderer page={page} context={{ dispatch }} />
      <aside style={{ position: "fixed", right: 12, bottom: 12, maxWidth: 360, background: "rgba(255,255,255,0.94)", border: "1px solid #ddd", borderRadius: 12, padding: 12, fontFamily: "monospace", fontSize: 11 }}>
        <strong>Mock action log</strong>
        <pre style={{ whiteSpace: "pre-wrap", margin: "8px 0 0" }}>{JSON.stringify(events.map((event) => ({ nodeKind: event.nodeKind, target: event.action.target })), null, 2)}</pre>
      </aside>
    </div>
  );
}

const meta: Meta<typeof ServicesBehaviorFixture> = {
  title: "Admin DSL/Services/Behavior Actions",
  component: ServicesBehaviorFixture,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ServicesBehaviorFixture>;

export const Idle: Story = { args: { initialState: "idle" } };
export const DrawerOpen: Story = { args: { initialState: "selected" } };
export const ConfirmOpen: Story = { args: { initialState: "confirm" } };
export const SavePending: Story = { args: { initialState: "saving" } };
export const SaveError: Story = { args: { initialState: "error", failNextSave: true } };
export const SaveSuccess: Story = { args: { initialState: "success" } };
export const StaleAction: Story = { args: { initialState: "stale" } };

export const ClickThroughSave: Story = {
  args: { initialState: "idle" },
  play: async ({ canvasElement }) => {
    const open = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Open") as HTMLButtonElement | undefined;
    open?.click();
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    const save = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Save") as HTMLButtonElement | undefined;
    save?.click();
    await new Promise((resolve) => window.setTimeout(resolve, 320));
  },
};

export const ClickThroughArchive: Story = {
  args: { initialState: "idle" },
  play: async ({ canvasElement }) => {
    const archive = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Archive") as HTMLButtonElement | undefined;
    archive?.click();
    await new Promise((resolve) => window.setTimeout(resolve, 80));
    const confirm = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Archive now") as HTMLButtonElement | undefined;
    confirm?.click();
    await new Promise((resolve) => window.setTimeout(resolve, 120));
  },
};
