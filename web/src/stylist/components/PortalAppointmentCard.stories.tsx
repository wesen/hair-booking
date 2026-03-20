import type { Meta, StoryObj } from "@storybook/react";
import { PortalAppointmentCard } from "./PortalAppointmentCard";
import { MOCK_APPOINTMENTS } from "../data/portal-data";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PortalAppointmentCard> = {
  title: "Stylist/Portal/PortalAppointmentCard",
  component: PortalAppointmentCard,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PortalAppointmentCard>;

export const Confirmed: Story = {
  args: {
    appointment: MOCK_APPOINTMENTS[0],
  },
};

export const Pending: Story = {
  args: {
    appointment: MOCK_APPOINTMENTS[1],
  },
};

export const CompleteWithReview: Story = {
  args: {
    appointment: MOCK_APPOINTMENTS[2],
  },
};
