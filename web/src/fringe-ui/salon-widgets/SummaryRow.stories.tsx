import type { Meta, StoryObj } from "@storybook/react";
import { SummaryRow } from "./SummaryRow";

const meta: Meta<typeof SummaryRow> = {
  title: "Fringe/Salon/SummaryRow",
  component: SummaryRow,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SummaryRow>;

export const WithEdit: Story = {
  args: {
    label: "Service",
    value: "Partial highlights + cut",
    onEdit: () => {},
  },
};

export const NoEdit: Story = {
  args: { label: "Estimate", value: "$245 · 3h 15m" },
};

export const ColorLevel: Story = {
  args: { label: "Color level", value: "Level 7 — dark blonde" },
};

export const Budget: Story = {
  args: { label: "Budget", value: "$220 – $280" },
};

export const Stylist: Story = {
  args: { label: "With", value: "Nadia Rivera" },
};

export const When: Story = {
  args: { label: "When", value: "Tue, Jun 18 · 2:00p" },
};

export const Deposit: Story = {
  args: { label: "Deposit", value: "$50 held" },
};

export const EstimateDetail: Story = {
  name: "Estimate detail (stacked)",
  render: () => (
    <div style={{ maxWidth: 480 }}>
      <SummaryRow label="Service"     value="Partial highlights + cut" onEdit={() => {}} />
      <SummaryRow label="Color level" value="Level 7 → Level 8" onEdit={() => {}} />
      <SummaryRow label="Length"       value="Mid-back · no extensions" onEdit={() => {}} />
      <SummaryRow label="Add-ons"     value="Olaplex bond treatment · $45" />
      <SummaryRow label="Estimate"   value="$245 · 3h 15m" />
    </div>
  ),
};

export const Unstyled: Story = {
  args: { label: "Unstyled", value: "value" },
  decorators: [
    () => (
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "#888" }}>
        (base div row)
      </div>
    ),
  ],
};