import type { Meta, StoryObj } from "@storybook/react";
import { ProgressBar } from "./ProgressBar";
import { getTier } from "../utils/loyalty";

const meta: Meta<typeof ProgressBar> = {
  title: "Stylist/ProgressBar",
  component: ProgressBar,
};

export default meta;
type Story = StoryObj<typeof ProgressBar>;

export const Empty: Story = {
  args: { progress: 0 },
};

export const Quarter: Story = {
  args: { progress: 25 },
};

export const Half: Story = {
  args: { progress: 50 },
};

export const Full: Story = {
  args: { progress: 100 },
};

export const WithGradient: Story = {
  args: {
    progress: 65,
    color: getTier(500).color,
    gradientTo: "var(--color-accent)",
  },
};

export const CustomColor: Story = {
  args: {
    progress: 75,
    color: "#e74c8b",
  },
};
