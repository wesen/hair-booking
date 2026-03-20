import type { Meta, StoryObj } from "@storybook/react";
import { Hint } from "./Hint";

const meta: Meta<typeof Hint> = {
  title: "Stylist/Consultation/Hint",
  component: Hint,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Hint>This is a ballpark based on your photos and info.</Hint>
  ),
};

export const Budget: Story = {
  render: () => (
    <Hint>We'll let you know if this is realistic for your goals. No surprises.</Hint>
  ),
};

export const Deposit: Story = {
  render: () => (
    <Hint>Deposit applies to your first service. Skip the waitlist and lock in your spot.</Hint>
  ),
};
