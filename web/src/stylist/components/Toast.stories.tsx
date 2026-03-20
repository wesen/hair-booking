import type { Meta, StoryObj } from "@storybook/react";
import { Toast } from "./Toast";

const meta: Meta<typeof Toast> = {
  title: "Stylist/Toast",
  component: Toast,
};

export default meta;
type Story = StoryObj<typeof Toast>;

export const Default: Story = {
  args: { message: "Appointment booked! \u2728" },
};

export const Referral: Story = {
  args: { message: "Referral recorded! +100 pts for referrer, +50 pts for friend \ud83c\udf89" },
};

export const VisitLogged: Story = {
  args: { message: "Visit logged! +40 points \u2728" },
};
