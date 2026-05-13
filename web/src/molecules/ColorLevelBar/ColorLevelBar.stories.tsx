import type { Meta, StoryObj } from "@storybook/react";
import { ColorLevelBar } from "./ColorLevelBar";

const meta: Meta<typeof ColorLevelBar> = {
  title: "Molecules/ColorLevelBar",
  component: ColorLevelBar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ColorLevelBar>;

export const Level7: Story = {
  args: { current: 7 },
};

export const WithTarget: Story = {
  args: { current: 5, target: 8 },
};

export const Level1: Story = {
  args: { current: 1 },
};
