import type { Meta, StoryObj } from "@storybook/react";
import { ConfirmCard } from "./ConfirmCard";

const meta: Meta<typeof ConfirmCard> = {
  title: "Stylist/Consultation/ConfirmCard",
  component: ConfirmCard,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    details: [
      { icon: "sparkle", text: "K-tips Consult" },
      { icon: "calendar", text: "Sat, Mar 28 @ 10:00 AM" },
      { icon: "pin", text: "247 Wickenden St, Providence, RI" },
    ],
  },
};

export const WithDeposit: Story = {
  args: {
    details: [
      { icon: "sparkle", text: "K-tips Consult" },
      { icon: "calendar", text: "Sat, Mar 28 @ 10:00 AM" },
      { icon: "pin", text: "247 Wickenden St, Providence, RI" },
      { icon: "dollar", text: "Deposit paid: $75" },
    ],
  },
};
