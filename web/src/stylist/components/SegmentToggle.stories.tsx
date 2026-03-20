import type { Meta, StoryObj } from "@storybook/react";
import { SegmentToggle } from "./SegmentToggle";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof SegmentToggle> = {
  title: "Stylist/Portal/SegmentToggle",
  component: SegmentToggle,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof SegmentToggle>;

export const Default: Story = {
  args: {
    options: ["Upcoming", "Past"],
    active: "Upcoming",
  },
};

export const PastActive: Story = {
  args: {
    options: ["Upcoming", "Past"],
    active: "Past",
  },
};
