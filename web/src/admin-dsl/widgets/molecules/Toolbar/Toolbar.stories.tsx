/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 99: Replaced generated same-args stories with distinct Toolbar fixtures, callback probe output, and mobile touch-target coverage.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Toolbar } from "./Toolbar";
import type { ToolbarProps } from "./Toolbar.types";
import type { ActionViewModel } from "../../shared";

const actions: ActionViewModel[] = [
  { type: "refresh", target: "requests.refresh", label: "Refresh", placement: "toolbar" },
  { type: "open", target: "requests.filters", label: "Filters", placement: "toolbar" },
  { type: "mutation", target: "requests.export", label: "Export", placement: "toolbar" },
  { type: "mutation", target: "requests.archive", label: "Archive", intent: "danger", placement: "toolbar" },
];

function Frame({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ padding: 24, maxWidth: narrow ? 360 : 860 }}>{children}</div>;
}

function ToolbarProbe(args: ToolbarProps) {
  const [last, setLast] = useState("No toolbar action clicked yet.");
  return (
    <Frame>
      <Toolbar {...args} onAction={(action, context) => setLast(`${action.label} -> ${action.target}; page=${context.pageId ?? "none"}`)} />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </Frame>
  );
}

const meta = {
  title: "Admin DSL Widgets/Molecules/Toolbar",
  component: Toolbar,
  parameters: { docs: { description: { component: "Toolbar renders page-level action lists through ActionGroup." } } },
} satisfies Meta<typeof Toolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { id: "requests-toolbar", actions: actions.slice(0, 2) },
  render: (args) => <Frame><Toolbar {...args} /></Frame>,
};

export const ManyActionsWrap: Story = {
  args: { id: "many-actions-toolbar", actions },
  render: (args) => <Frame narrow><Toolbar {...args} /></Frame>,
};

export const MobileTouchTargets: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { id: "mobile-toolbar", actions: actions.slice(0, 3) },
  render: (args) => <Frame narrow><Toolbar {...args} style={{ marginBottom: 0 }} /></Frame>,
};

export const ActionDispatch: Story = {
  args: { id: "probe-toolbar", actions: actions.slice(0, 3) },
  render: (args) => <ToolbarProbe {...args} />,
};
