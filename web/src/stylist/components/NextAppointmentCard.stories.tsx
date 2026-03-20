import type { Meta, StoryObj } from "@storybook/react";
import { NextAppointmentCard } from "./NextAppointmentCard";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof NextAppointmentCard> = {
  title: "Stylist/Portal/NextAppointmentCard",
  component: NextAppointmentCard,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NextAppointmentCard>;

export const Default: Story = {
  args: {
    service: "K-Tip Move-Up",
    date: "Mar 24",
    time: "10:00 AM",
  },
};
