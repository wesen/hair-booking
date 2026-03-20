import type { Meta, StoryObj } from "@storybook/react";
import { PortalTopBar } from "./PortalTopBar";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PortalTopBar> = {
  title: "Stylist/Portal/PortalTopBar",
  component: PortalTopBar,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PortalTopBar>;

export const Default: Story = {
  args: {
    initials: "MK",
  },
};

export const CustomInitials: Story = {
  args: {
    initials: "SR",
  },
};
