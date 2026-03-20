import type { Meta, StoryObj } from "@storybook/react";
import { PortalTabBar } from "./PortalTabBar";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PortalTabBar> = {
  title: "Stylist/Portal/PortalTabBar",
  component: PortalTabBar,
  decorators: [
    (Story) => (
      <div data-widget="stylist">
        <div style={{ position: "relative", height: 200, width: 430 }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PortalTabBar>;

export const HomeActive: Story = {
  args: {
    activeTab: "home",
  },
};

export const AppointmentsActive: Story = {
  args: {
    activeTab: "appointments",
  },
};

export const PhotosActive: Story = {
  args: {
    activeTab: "photos",
  },
};

export const RewardsActive: Story = {
  args: {
    activeTab: "rewards",
  },
};
