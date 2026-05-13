import type { Meta, StoryObj } from "@storybook/react";
import { BudgetPage } from "./BudgetPage";

const meta: Meta<typeof BudgetPage> = {
  title: "Organisms/BudgetPage",
  component: BudgetPage,
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof BudgetPage>;

export const Default: Story = {
  args: {
    onNext: () => console.log("next"),
    onBack: () => console.log("back"),
  },
};
