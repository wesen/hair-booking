import type { Meta, StoryObj } from "@storybook/react";
import { TimeSlot } from "./TimeSlot";
import { TIME_SLOTS } from "../data/constants";

const meta: Meta<typeof TimeSlot> = {
  title: "Stylist/TimeSlot",
  component: TimeSlot,
};

export default meta;
type Story = StoryObj<typeof TimeSlot>;

export const Default: Story = {
  args: {
    time: "10:00 AM",
  },
};

export const Selected: Story = {
  args: {
    time: "10:00 AM",
    selected: true,
  },
};

export const TimeGrid: Story = {
  render: () => (
    <div data-part="time-grid">
      {TIME_SLOTS.map((time) => (
        <TimeSlot key={time} time={time} selected={time === "10:00 AM"} />
      ))}
    </div>
  ),
};
