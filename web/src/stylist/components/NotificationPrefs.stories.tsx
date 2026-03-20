import type { Meta, StoryObj } from "@storybook/react";
import { NotificationPrefs } from "./NotificationPrefs";
import { DEFAULT_NOTIFICATION_PREFS } from "../data/portal-data";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof NotificationPrefs> = {
  title: "Stylist/Portal/NotificationPrefs",
  component: NotificationPrefs,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NotificationPrefs>;

export const Default: Story = {
  args: {
    prefs: DEFAULT_NOTIFICATION_PREFS,
  },
};
