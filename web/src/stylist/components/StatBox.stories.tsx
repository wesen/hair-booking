import type { Meta, StoryObj } from "@storybook/react";
import { StatBox } from "./StatBox";

const meta: Meta<typeof StatBox> = {
  title: "Stylist/StatBox",
  component: StatBox,
};

export default meta;
type Story = StoryObj<typeof StatBox>;

export const Default: Story = {
  args: { value: 4, label: "Today" },
};

export const Large: Story = {
  args: { value: 42, label: "This Week" },
};

export const ZeroValue: Story = {
  args: { value: 0, label: "Cancelled" },
};

export const StatsRow: Story = {
  render: () => (
    <div data-part="stats-row">
      <StatBox value={4} label="Today" />
      <StatBox value={42} label="This Week" />
      <StatBox value="$3.2k" label="Revenue" />
    </div>
  ),
};
