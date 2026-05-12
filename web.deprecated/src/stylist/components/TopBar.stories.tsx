import type { Meta, StoryObj } from "@storybook/react";
import { TopBar } from "./TopBar";
import { Button } from "./Button";
import { Icon } from "./Icon";

const meta: Meta<typeof TopBar> = {
  title: "Stylist/TopBar",
  component: TopBar,
};

export default meta;
type Story = StoryObj<typeof TopBar>;

export const Default: Story = {
  args: {
    title: "Good afternoon \u2600\uFE0F",
    subtitle: "Thursday, March 19",
  },
};

export const WithAction: Story = {
  args: {
    title: "Good afternoon \u2600\uFE0F",
    subtitle: "Thursday, March 19",
    right: <Button variant="outline">Add</Button>,
  },
};

export const BookingHeader: Story = {
  args: {
    left: <Icon name="back" size={20} />,
    title: "New Booking",
  },
};

export const JustTitle: Story = {
  args: {
    title: "Schedule",
  },
};
