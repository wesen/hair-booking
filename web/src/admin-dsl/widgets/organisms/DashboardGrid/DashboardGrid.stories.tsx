/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-18 / HAIR-041 Step 76: Replaced generated scenario placeholders with explicit span, gap, mobile, and ordering fixtures.
 */
import type { Meta, StoryObj } from "@storybook/react";
import type { ReactNode } from "react";
import { color, radius, shadow, type } from "../../../../fringe-ui/tokens";
import { DashboardGrid, DashboardGridItem } from "./DashboardGrid";
import type { DashboardGridProps } from "./DashboardGrid.types";

function Card({ title, body, tone = color.paper }: { title: string; body: string; tone?: string }) {
  return (
    <article style={{ minHeight: 112, border: `1px solid ${color.rule}`, borderRadius: radius.lg, background: tone, boxShadow: shadow.sm, padding: 16 }}>
      <div style={{ ...type.eyebrow, color: color.softInk }}>{title}</div>
      <p style={{ ...type.bodySm, margin: "10px 0 0", color: color.ink }}>{body}</p>
    </article>
  );
}

const defaultArgs = {
  columns: { desktop: 12, tablet: 8, mobile: 1 },
  gap: "normal",
  children: (
    <>
      <DashboardGridItem span={{ desktop: 4, tablet: 4, mobile: 1 }}><Card title="New requests" body="4 waiting for triage" /></DashboardGridItem>
      <DashboardGridItem span={{ desktop: 4, tablet: 4, mobile: 1 }}><Card title="Draft config" body="2 unpublished changes" /></DashboardGridItem>
      <DashboardGridItem span={{ desktop: 4, tablet: 8, mobile: 1 }}><Card title="Preview" body="Customer preview is healthy" /></DashboardGridItem>
    </>
  ),
} satisfies DashboardGridProps;

const meta = {
  title: "Admin DSL Widgets/Organisms/DashboardGrid",
  component: DashboardGrid,
  args: defaultArgs,
  parameters: {
    docs: {
      description: {
        component: "DashboardGrid owns responsive dashboard grid layout. The renderer adapter supplies already-rendered children wrapped in DashboardGridItem.",
      },
    },
  },
} satisfies Meta<typeof DashboardGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

function Shell({ children }: { children: ReactNode }) {
  return <div style={{ padding: 24, background: color.creamDeep, maxWidth: 1160 }}>{children}</div>;
}

export const TwelveColumnDesktop: Story = {
  args: defaultArgs,
  render: (args) => <Shell><DashboardGrid {...args} /></Shell>,
};

export const CompactGap: Story = {
  args: { ...defaultArgs, gap: "compact" },
  render: (args) => <Shell><DashboardGrid {...args} /></Shell>,
};

export const MixedSpanCards: Story = {
  args: {
    ...defaultArgs,
    gap: "spacious",
    children: (
      <>
        <DashboardGridItem span={{ desktop: 8, tablet: 8, mobile: 1 }}><Card title="Request triage" body="Wide operational table container." tone={color.paper} /></DashboardGridItem>
        <DashboardGridItem span={{ desktop: 4, tablet: 4, mobile: 1 }}><Card title="Today" body="Compact side metric." tone={color.cream} /></DashboardGridItem>
        <DashboardGridItem span={{ desktop: 6, tablet: 4, mobile: 1 }}><Card title="Audit" body="Recent admin mutations." /></DashboardGridItem>
        <DashboardGridItem span={{ desktop: 6, tablet: 4, mobile: 1 }}><Card title="Health" body="Runtime and preview status." /></DashboardGridItem>
      </>
    ),
  },
  render: (args) => <Shell><DashboardGrid {...args} /></Shell>,
};

export const MobileSingleColumn: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: defaultArgs,
  render: (args) => <Shell><DashboardGrid {...args} /></Shell>,
};

export const Ordering: Story = {
  args: {
    ...defaultArgs,
    children: (
      <>
        <DashboardGridItem order={2} span={{ desktop: 4, tablet: 4, mobile: 1 }}><Card title="Rendered second" body="Order value 2" /></DashboardGridItem>
        <DashboardGridItem order={1} span={{ desktop: 4, tablet: 4, mobile: 1 }}><Card title="Rendered first" body="Order value 1" tone={color.cream} /></DashboardGridItem>
        <DashboardGridItem order={3} span={{ desktop: 4, tablet: 8, mobile: 1 }}><Card title="Rendered third" body="Order value 3" /></DashboardGridItem>
      </>
    ),
  },
  render: (args) => <Shell><DashboardGrid {...args} /></Shell>,
};
