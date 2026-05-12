import type { Meta, StoryObj } from "@storybook/react";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Stylist/StatusBadge",
  component: StatusBadge,
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Confirmed: Story = {
  args: { status: "confirmed" },
};

export const Pending: Story = {
  args: { status: "pending" },
};

export const Both: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <StatusBadge status="confirmed" />
      <StatusBadge status="pending" />
    </div>
  ),
};
