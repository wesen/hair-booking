import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";
import { Icon } from "./Icon";

const meta: Meta<typeof Input> = {
  title: "Stylist/Input",
  component: Input,
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithPlaceholder: Story = {
  args: {
    placeholder: "Enter your name...",
  },
};

export const WithIcon: Story = {
  args: {
    icon: <Icon name="search" size={16} />,
    placeholder: "Search clients...",
  },
};

export const Focused: Story = {
  args: {
    placeholder: "Focused input",
    autoFocus: true,
  },
};
