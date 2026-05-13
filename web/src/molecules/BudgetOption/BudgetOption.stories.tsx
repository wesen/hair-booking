import type { Meta, StoryObj } from "@storybook/react";
import { BudgetOption } from "./BudgetOption";

const meta: Meta<typeof BudgetOption> = {
  title: "Molecules/BudgetOption",
  component: BudgetOption,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BudgetOption>;

export const Default: Story = {
  args: { label: "$150 – $250", description: "Partial color + cut" },
};

export const Selected: Story = {
  args: { label: "$150 – $250", description: "Partial color + cut", selected: true },
};

export const HighEnd: Story = {
  args: { label: "$400+", description: "Extensions · correction · balayage" },
};
