import type { Meta, StoryObj } from "@storybook/react";
import { SectionTitle } from "./SectionTitle";

const meta: Meta<typeof SectionTitle> = {
  title: "Stylist/SectionTitle",
  component: SectionTitle,
};

export default meta;
type Story = StoryObj<typeof SectionTitle>;

export const Default: Story = {
  args: {
    children: "Today's Schedule",
  },
};

export const WithIcon: Story = {
  args: {
    icon: "clock",
    children: "Today's Schedule",
  },
};

export const Calendar: Story = {
  args: {
    icon: "calendar",
    children: "Upcoming",
  },
};

export const Gift: Story = {
  args: {
    icon: "gift",
    children: "Rewards Menu",
  },
};
