import type { Meta, StoryObj } from "@storybook/react";
import { AdminPageRenderer } from "./render";
import { AdminScenarioHarness } from "./scenarioHarness";
import { servicesScenarioDefinition, servicesScenarioPage } from "./scenarioFixtures";
import type { AdminPage } from "./schema";

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

export const MswClickThroughSave: StaticStory = {
  render: () => <AdminScenarioHarness definition={servicesScenarioDefinition} initialState="idle" />,
  play: async ({ canvasElement }) => {
    const open = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Open") as HTMLButtonElement | undefined;
    open?.click();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const save = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Save") as HTMLButtonElement | undefined;
    save?.click();
    await new Promise((resolve) => setTimeout(resolve, 320));
  },
};

export const MswClickThroughValidationFailure: StaticStory = {
  render: () => <AdminScenarioHarness definition={{ ...servicesScenarioDefinition, transitions: servicesScenarioDefinition.transitions.map((transition) => transition.target === "service.save" ? { ...transition, to: "error" as const, status: "validation" as const, message: "Validation failed" } : transition) }} initialState="idle" />,
  play: async ({ canvasElement }) => {
    const open = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Open") as HTMLButtonElement | undefined;
    open?.click();
    await new Promise((resolve) => setTimeout(resolve, 120));
    const save = [...canvasElement.querySelectorAll("button")].find((button) => button.textContent === "Save") as HTMLButtonElement | undefined;
    save?.click();
    await new Promise((resolve) => setTimeout(resolve, 320));
  },
};
