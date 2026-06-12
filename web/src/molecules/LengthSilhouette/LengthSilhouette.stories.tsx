import type { Meta, StoryObj } from "@storybook/react";
import { LengthSilhouette } from "./LengthSilhouette";

const meta: Meta<typeof LengthSilhouette> = {
  title: "Molecules/LengthSilhouette",
  component: LengthSilhouette,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LengthSilhouette>;

export const Pixie: Story = {
  args: { label: "Pixie" },
};

export const Bob: Story = {
  args: { label: "Bob" },
};

export const Shoulder: Story = {
  args: { label: "Shoulder" },
};

export const MidBackSelected: Story = {
  args: { label: "Mid-back", selected: true },
};
