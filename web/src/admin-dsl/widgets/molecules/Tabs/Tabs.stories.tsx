/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 99: Replaced generated same-args stories with active/read-only/wrapping fixtures and tab callback probe output.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs } from "./Tabs";
import type { TabsProps } from "./Tabs.types";
import type { ActionViewModel } from "../../shared";

const tabAction: ActionViewModel = { type: "navigate", target: "requests.tab", label: "Switch tab", placement: "toolbar" };
const tabs = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "needs-review", label: "Needs review" },
  { id: "scheduled", label: "Scheduled" },
  { id: "archived", label: "Archived" },
];

function Frame({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ padding: 24, maxWidth: narrow ? 320 : 760 }}>{children}</div>;
}

function TabsProbe(args: TabsProps) {
  const [last, setLast] = useState("No tab selected yet.");
  return (
    <Frame>
      <Tabs {...args} onTabChange={(action, context) => setLast(`${context.tab.id}:${context.tab.label}:${action?.target ?? "no-action"}`)} />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </Frame>
  );
}

const meta = {
  title: "Admin DSL Widgets/Molecules/Tabs",
  component: Tabs,
  parameters: { docs: { description: { component: "Tabs represents tab choice as a compact selection control with optional action dispatch." } } },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { tabs: tabs.slice(0, 3), value: "all", action: tabAction },
  render: (args) => <Frame><Tabs {...args} /></Frame>,
};

export const ActiveTab: Story = {
  args: { tabs: tabs.slice(0, 4), value: "needs-review", action: tabAction },
  render: (args) => <Frame><Tabs {...args} /></Frame>,
};

export const NoActionReadonly: Story = {
  args: { tabs: tabs.slice(0, 3), value: "open" },
  render: (args) => <Frame><Tabs {...args} /></Frame>,
};

export const WrappingMobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { tabs, value: "scheduled", action: tabAction },
  render: (args) => <Frame narrow><Tabs {...args} /></Frame>,
};

export const TabDispatch: Story = {
  args: { tabs: tabs.slice(0, 4), value: "all", action: tabAction },
  render: (args) => <TabsProbe {...args} />,
};
