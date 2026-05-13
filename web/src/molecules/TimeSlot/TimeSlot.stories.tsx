import type { Meta, StoryObj } from "@storybook/react";
import { TimeSlot } from "./TimeSlot";

const meta: Meta<typeof TimeSlot> = {
  title: "Molecules/TimeSlot",
  component: TimeSlot,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TimeSlot>;

export const Default: Story = {
  args: { label: "10:30a" },
};

export const Selected: Story = {
  args: { label: "2:00p", selected: true },
};

export const Disabled: Story = {
  args: { label: "12:00p", disabled: true },
};
