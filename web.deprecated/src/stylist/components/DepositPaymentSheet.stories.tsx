import type { Meta, StoryObj } from "@storybook/react";
import { DepositPaymentSheet } from "./DepositPaymentSheet";

const meta: Meta<typeof DepositPaymentSheet> = {
  title: "Stylist/Consultation/DepositPaymentSheet",
  component: DepositPaymentSheet,
};

export default meta;
type Story = StoryObj<typeof DepositPaymentSheet>;

export const Default: Story = {
  args: {
    amount: 50,
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardZip: "",
  },
};

export const Filled: Story = {
  args: {
    amount: 50,
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "03/28",
    cardCvc: "123",
    cardZip: "02903",
  },
};

export const Processing: Story = {
  args: {
    amount: 50,
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "03/28",
    cardCvc: "123",
    cardZip: "02903",
    processing: true,
  },
};

export const WithError: Story = {
  args: {
    amount: 50,
    cardNumber: "4242 4242 4242 4242",
    cardExpiry: "03/28",
    cardCvc: "123",
    cardZip: "02903",
    error: "Your card was declined. Please try a different card.",
  },
};
