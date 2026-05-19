/**
 * GENERATED SCAFFOLD — REVIEW BEFORE PROMOTING TO FINAL IMPLEMENTATION.
 *
 * Manual edits after generation:
 * - 2026-05-19 / HAIR-041 Step 108: Replaced scaffold diagnostics with distinct metric fixtures and tone scenarios.
 */
import type { Meta, StoryObj } from "@storybook/react";
import { MetricCard } from "./MetricCard";

const meta = {
  title: "Admin DSL Widgets/Molecules/MetricCard",
  component: MetricCard,
  parameters: {
    docs: { description: { component: "Semantic metric card for admin dashboard totals and KPI summaries." } },
  },
} satisfies Meta<typeof MetricCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Open requests", value: 12, caption: "3 require a stylist response" },
};

export const SuccessTone: Story = {
  args: { label: "Booked this week", value: 8, caption: "Up 14% from last week", tone: "success" },
};

export const WarningTone: Story = {
  args: { label: "Draft configs", value: 2, caption: "Publish before opening Friday inventory", tone: "warning" },
};

export const DangerTone: Story = {
  args: { label: "Failed imports", value: 1, caption: "Needs manual review", tone: "danger" },
};

export const LongCaption: Story = {
  args: { label: "Consultation capacity", value: "74%", caption: "Includes holds, confirmed appointments, and pending high-priority intake requests for the current rolling seven-day window.", tone: "neutral" },
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
  args: { label: "Mobile queue", value: 5, caption: "Compact KPI inside a narrow dashboard column", tone: "success" },
};
