/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 99: Replaced generated same-args stories with distinct Panel fixtures, callback probes, and mobile viewport coverage.
 */
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Panel } from "./Panel";
import type { PanelProps } from "./Panel.types";
import type { ActionViewModel } from "../../shared";

const refreshAction: ActionViewModel = { type: "refresh", target: "panel.refresh", label: "Refresh", placement: "panelToolbar" };
const exportAction: ActionViewModel = { type: "mutation", target: "panel.export", label: "Export", placement: "panelToolbar" };
const cancelAction: ActionViewModel = { type: "close", target: "panel.cancel", label: "Cancel", placement: "panelFooter" };
const saveAction: ActionViewModel = { type: "mutation", target: "panel.save", label: "Save changes", intent: "primary", priority: "primary", placement: "panelFooter" };

function StoryFrame({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ padding: 24, maxWidth: narrow ? 360 : 960 }}>{children}</div>;
}

function DemoRows() {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {[
        ["9:00", "Mia — Color consultation"],
        ["10:30", "Noah — Extension move-up"],
        ["12:00", "Ava — Gloss refresh"],
      ].map(([time, label]) => <div key={time} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: 6 }}><strong>{time}</strong><span>{label}</span></div>)}
    </div>
  );
}

function CallbackProbe(args: PanelProps) {
  const [last, setLast] = useState("No panel action clicked yet.");
  return (
    <StoryFrame>
      <Panel
        {...args}
        onToolbarAction={(action, context) => setLast(`toolbar:${action.target}:${context.panelId ?? "none"}`)}
        onFooterAction={(action, context) => setLast(`footer:${action.target}:${context.panelId ?? "none"}`)}
      />
      <output style={{ display: "block", marginTop: 12, padding: 10, border: "1px solid #dfd2bd" }}>{last}</output>
    </StoryFrame>
  );
}

const meta = {
  title: "Admin DSL Widgets/Organisms/Panel",
  component: Panel,
  parameters: {
    docs: {
      description: {
        component: "Central admin surface primitive for dense workbench content. It owns header/body/footer chrome, padding, density, and action placement.",
      },
    },
  },
} satisfies Meta<typeof Panel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: "queue-panel",
    eyebrow: "Today",
    title: "Appointment queue",
    subtitle: "Three requests need review before lunch.",
    density: "normal",
    children: <DemoRows />,
  },
  render: (args) => <StoryFrame><Panel {...args} /></StoryFrame>,
};

export const CompactNoPadding: Story = {
  args: {
    id: "compact-table-panel",
    title: "Dense table shell",
    density: "compact",
    padding: "none",
    children: <div style={{ padding: 12, background: "#f6efe4" }}>Table content owns its own inner padding.</div>,
  },
  render: (args) => <StoryFrame><Panel {...args} /></StoryFrame>,
};

export const WithToolbarAction: Story = {
  args: {
    id: "toolbar-panel",
    title: "Needs refresh",
    subtitle: "Toolbar actions stay in the panel header.",
    toolbarActions: [refreshAction, exportAction],
    children: <DemoRows />,
  },
  render: (args) => <CallbackProbe {...args} />,
};

export const WithFooterActions: Story = {
  args: {
    id: "footer-panel",
    title: "Publish draft",
    body: "Footer actions represent the next step in a panel-local workflow.",
    footerActions: [cancelAction, saveAction],
  },
  render: (args) => <CallbackProbe {...args} />,
};

export const BodyOnly: Story = {
  args: {
    id: "body-only-panel",
    body: "This panel has no header or footer. It renders body copy using the shared Panel body treatment.",
    density: "spacious",
  },
  render: (args) => <StoryFrame><Panel {...args} /></StoryFrame>,
};

export const NestedResourceTable: Story = {
  args: {
    id: "nested-panel",
    title: "Nested content",
    padding: "normal",
    children: <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8 }}><span>Request #1842</span><strong>Ready</strong><span>Request #1843</span><strong>Waiting</strong></div>,
  },
  render: (args) => <StoryFrame><Panel {...args} /></StoryFrame>,
};

export const MobilePanelPadding: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    id: "mobile-panel",
    title: "Mobile review",
    subtitle: "Narrow container verifies header wrapping and padding.",
    toolbarActions: [refreshAction],
    children: <DemoRows />,
  },
  render: (args) => <StoryFrame narrow><Panel {...args} /></StoryFrame>,
};
