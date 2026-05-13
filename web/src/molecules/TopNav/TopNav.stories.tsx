import type { Meta, StoryObj } from "@storybook/react";
import { TopNav } from "./TopNav";
import { color } from "../../fringe-ui/tokens";

const meta: Meta<typeof TopNav> = {
  title: "Molecules/TopNav",
  component: TopNav,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TopNav>;

export const Default: Story = {
  args: { accent: color.plum, activeItem: "Book" },
};

export const ButterAccent: Story = {
  name: "Butter Accent",
  args: { accent: color.butter, activeItem: "Book" },
};

export const SageAccent: Story = {
  name: "Sage Accent",
  args: { accent: color.sage, activeItem: "Stylists" },
};
