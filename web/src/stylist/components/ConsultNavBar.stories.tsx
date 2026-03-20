import type { Meta, StoryObj } from "@storybook/react";
import { ConsultNavBar } from "./ConsultNavBar";

const meta: Meta<typeof ConsultNavBar> = {
  title: "Stylist/Consultation/ConsultNavBar",
  component: ConsultNavBar,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Step1of6: Story = {
  args: {
    title: "Extensions Consult",
    stepNum: 1,
    totalSteps: 6,
    onBack: () => {},
  },
};

export const Step3of6: Story = {
  args: {
    title: "Photo Upload",
    stepNum: 3,
    totalSteps: 6,
    onBack: () => {},
  },
};

export const Step6of7: Story = {
  args: {
    title: "Book Consult",
    stepNum: 6,
    totalSteps: 7,
    onBack: () => {},
  },
};

export const WithDeposit: Story = {
  args: {
    title: "Book + Deposit",
    stepNum: 7,
    totalSteps: 7,
    onBack: () => {},
  },
};
