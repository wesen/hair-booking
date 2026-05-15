import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { AdminPageRenderer } from "./render";
import { servicesScenarioPage, type ServicesScenarioState } from "./scenarioFixtures";
import type { AdminPage, AdminRenderEvent } from "./schema";

function StaticScenario({ page }: { page: AdminPage }) {
  return <AdminPageRenderer page={page} context={{ dispatch: (event) => console.log("static service scenario", event) }} />;
}

const staticMeta: Meta<typeof StaticScenario> = {
  title: "Admin DSL/Services/Scenarios",
  component: StaticScenario,
  parameters: { layout: "fullscreen" },
};

export default staticMeta;
type StaticStory = StoryObj<typeof StaticScenario>;

export const Default: StaticStory = { args: { page: servicesScenarioPage("idle") } };
export const SelectedRow: StaticStory = { args: { page: servicesScenarioPage("selected") } };
export const DrawerOpen: StaticStory = { args: { page: servicesScenarioPage("selected") } };
export const ConfirmOpen: StaticStory = { args: { page: servicesScenarioPage("confirm") } };
export const ValidationError: StaticStory = { args: { page: servicesScenarioPage("error") } };
export const SavePending: StaticStory = { args: { page: servicesScenarioPage("saving") } };
export const SaveSuccess: StaticStory = { args: { page: servicesScenarioPage("success") } };
export const Empty: StaticStory = { args: { page: servicesScenarioPage("empty") } };
export const Loading: StaticStory = { args: { page: servicesScenarioPage("loading") } };
export const PermissionRestricted: StaticStory = { args: { page: servicesScenarioPage("permission") } };
export const StaleAction: StaticStory = { args: { page: servicesScenarioPage("stale") } };

function MswScenario({ initialState = "idle", failSave = false }: { initialState?: ServicesScenarioState; failSave?: boolean }) {
  const [state, setState] = useState<ServicesScenarioState>(initialState);
  const [page, setPage] = useState(() => servicesScenarioPage(initialState));
  const [events, setEvents] = useState<AdminRenderEvent[]>([]);
  const context = useMemo(() => ({
    dispatch: async (event: AdminRenderEvent) => {
      setEvents((current) => [event, ...current].slice(0, 6));
      const response = await fetch("/api/admin-dsl/scenarios/services/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, action: event.action, failSave, latencyMs: event.action.target === "service.save" ? 180 : 0 }),
      });
      const result = await response.json() as { state: ServicesScenarioState; page: AdminPage };
      setState(result.state);
      setPage(result.page);
    },
  }), [failSave, state]);

  return (
    <div>
      <AdminPageRenderer page={page} context={context} />
      <aside style={{ position: "fixed", right: 12, bottom: 12, zIndex: 10, maxWidth: 390, background: "rgba(255,255,255,0.96)", border: "1px solid #ddd", borderRadius: 12, padding: 12, fontFamily: "monospace", fontSize: 11 }}>
        <strong>MSW Admin DSL scenario</strong>
        <div>state: {state}</div>
        <pre style={{ whiteSpace: "pre-wrap", margin: "8px 0 0" }}>{JSON.stringify(events.map((event) => ({ nodeKind: event.nodeKind, target: event.action.target })), null, 2)}</pre>
      </aside>
    </div>
  );
}

export const MswClickThroughSave: StaticStory = {
  render: () => <MswScenario initialState="idle" />,
  play: async ({ canvasElement }) => {
    const open = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Open") as HTMLButtonElement | undefined;
    open?.click();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const save = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Save") as HTMLButtonElement | undefined;
    save?.click();
    await new Promise((resolve) => setTimeout(resolve, 260));
  },
};

export const MswClickThroughValidationFailure: StaticStory = {
  render: () => <MswScenario initialState="idle" failSave />,
  play: async ({ canvasElement }) => {
    const open = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Open") as HTMLButtonElement | undefined;
    open?.click();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const save = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Save") as HTMLButtonElement | undefined;
    save?.click();
    await new Promise((resolve) => setTimeout(resolve, 260));
  },
};
