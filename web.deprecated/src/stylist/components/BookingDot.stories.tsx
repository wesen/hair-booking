import type { Meta, StoryObj } from "@storybook/react";
import { BookingDot } from "./BookingDot";

const meta: Meta<typeof BookingDot> = {
  title: "Stylist/BookingDot",
  component: BookingDot,
};

export default meta;
type Story = StoryObj<typeof BookingDot>;

export const Active: Story = {
  args: {
    step: 2,
    currentStep: 2,
  },
};

export const Done: Story = {
  args: {
    step: 1,
    currentStep: 3,
  },
};

export const Inactive: Story = {
  args: {
    step: 4,
    currentStep: 2,
  },
};

export const FullProgress: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <BookingDot step={1} currentStep={3} />
      <BookingDot step={2} currentStep={3} />
      <BookingDot step={3} currentStep={3} />
      <BookingDot step={4} currentStep={3} />
    </div>
  ),
};
