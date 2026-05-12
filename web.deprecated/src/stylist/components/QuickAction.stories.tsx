import type { Meta, StoryObj } from "@storybook/react";
import { QuickAction } from "./QuickAction";

const meta: Meta<typeof QuickAction> = {
  title: "Stylist/QuickAction",
  component: QuickAction,
};

export default meta;
type Story = StoryObj<typeof QuickAction>;

export const BookAppointment: Story = {
  args: {
    icon: "calendar",
    label: "Book Appointment",
  },
};

export const LogVisit: Story = {
  args: {
    icon: "check",
    label: "Log Visit",
  },
};

export const AddReferral: Story = {
  args: {
    icon: "users",
    label: "Add Referral",
  },
};

export const Message: Story = {
  args: {
    icon: "send",
    label: "Message",
  },
};

export const AllActions: Story = {
  render: () => (
    <div data-part="quick-actions">
      <QuickAction icon="calendar" label="Book Appointment" />
      <QuickAction icon="check" label="Log Visit" />
      <QuickAction icon="users" label="Add Referral" />
      <QuickAction icon="send" label="Message" />
    </div>
  ),
};
