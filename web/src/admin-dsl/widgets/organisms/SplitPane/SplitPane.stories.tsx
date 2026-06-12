/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 99: Replaced generated same-args stories with distinct SplitPane fixtures and mobile viewport coverage.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { SplitPane } from "./SplitPane";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <section style={{ border: "1px solid #dfd2bd", borderRadius: 12, padding: 14, background: "#fffaf0" }}><h3 style={{ margin: "0 0 8px" }}>{title}</h3>{children}</section>;
}

function Frame({ children, narrow = false }: { children: React.ReactNode; narrow?: boolean }) {
  return <div style={{ padding: 24, maxWidth: narrow ? 380 : 980 }}>{children}</div>;
}

const meta = {
  title: "Admin DSL Widgets/Organisms/SplitPane",
  component: SplitPane,
  parameters: { docs: { description: { component: "SplitPane lays out paired admin content and owns its mobile stack behavior." } } },
} satisfies Meta<typeof SplitPane>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MasterDetail: Story = {
  args: {
    leftWidth: "minmax(220px, 0.7fr)",
    rightWidth: "minmax(360px, 1.3fr)",
    children: <><Card title="Requests"><p>Request queue with selected row.</p></Card><Card title="Detail"><p>Selected request notes and actions.</p></Card></>,
  },
  render: (args) => <Frame><SplitPane {...args} /></Frame>,
};

export const TwoPanels: Story = {
  args: {
    gap: 24,
    leftWidth: "1fr",
    rightWidth: "1fr",
    children: <><Card title="Draft"><p>New service configuration.</p></Card><Card title="Preview"><p>Customer-facing preview frame.</p></Card></>,
  },
  render: (args) => <Frame><SplitPane {...args} /></Frame>,
};

export const MobileStacked: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: {
    children: <><Card title="Mobile list"><p>First pane stacks above the detail pane.</p></Card><Card title="Mobile detail"><p>Second pane remains readable in a narrow viewport.</p></Card></>,
  },
  render: (args) => <Frame narrow><SplitPane {...args} /></Frame>,
};
