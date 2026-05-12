import type { Meta, StoryObj } from "@storybook/react";
import { LengthSlider } from "./LengthSlider";

const meta: Meta<typeof LengthSlider> = {
  title: "Stylist/Consultation/LengthSlider",
  component: LengthSlider,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 2,
    onChange: () => {},
  },
};

export const Short: Story = {
  args: {
    value: 0,
    onChange: () => {},
  },
};

export const Long: Story = {
  args: {
    value: 4,
    onChange: () => {},
  },
};
