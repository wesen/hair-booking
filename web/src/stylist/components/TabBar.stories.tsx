import type { Meta, StoryObj } from "@storybook/react";
import { TabBar } from "./TabBar";

const meta: Meta<typeof TabBar> = {
  title: "Stylist/TabBar",
  component: TabBar,
  decorators: [
    (Story) => (
      <div style={{ position: "relative", height: 200, width: 430 }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
          <Story />
        </div>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TabBar>;

export const HomeActive: Story = {
  args: {
    activeTab: "home",
  },
};

export const ScheduleActive: Story = {
  args: {
    activeTab: "schedule",
  },
};

export const ClientsActive: Story = {
  args: {
    activeTab: "clients",
  },
};

export const LoyaltyActive: Story = {
  args: {
    activeTab: "loyalty",
  },
};
