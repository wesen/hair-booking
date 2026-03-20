import type { Meta, StoryObj } from "@storybook/react";
import { AppointmentRow } from "./AppointmentRow";
import { Card } from "./Card";
import { INITIAL_APPOINTMENTS } from "../data/constants";

const meta: Meta<typeof AppointmentRow> = {
  title: "Stylist/AppointmentRow",
  component: AppointmentRow,
};

export default meta;
type Story = StoryObj<typeof AppointmentRow>;

export const Confirmed: Story = {
  args: {
    appointment: INITIAL_APPOINTMENTS[0],
  },
};

export const Pending: Story = {
  args: {
    appointment: INITIAL_APPOINTMENTS[2],
  },
};

export const WithDate: Story = {
  args: {
    appointment: INITIAL_APPOINTMENTS[1],
    showDate: true,
  },
};

export const Multiple: Story = {
  render: () => (
    <Card>
      {INITIAL_APPOINTMENTS.map((appt) => (
        <AppointmentRow key={appt.id} appointment={appt} />
      ))}
    </Card>
  ),
};
