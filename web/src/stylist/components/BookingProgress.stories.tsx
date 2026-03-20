import type { Meta, StoryObj } from "@storybook/react";
import { BookingProgress } from "./BookingProgress";

const meta: Meta<typeof BookingProgress> = {
  title: "Stylist/BookingProgress",
  component: BookingProgress,
};

export default meta;
type Story = StoryObj<typeof BookingProgress>;

export const Step1: Story = {
  args: {
    currentStep: 1,
  },
};

export const Step2: Story = {
  args: {
    currentStep: 2,
  },
};

export const Step3: Story = {
  args: {
    currentStep: 3,
  },
};

export const Step4: Story = {
  args: {
    currentStep: 4,
  },
};
