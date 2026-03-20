import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { PortalAppointmentsPage } from "./PortalAppointmentsPage";
import { createTestStore } from "../store/test-utils";
import {
  MOCK_USER,
  MOCK_APPOINTMENTS,
  MOCK_MAINTENANCE,
  MOCK_PHOTOS,
  MOCK_POINTS_HISTORY,
  MOCK_REDEEMABLE,
  DEFAULT_NOTIFICATION_PREFS,
} from "../data/portal-data";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PortalAppointmentsPage> = {
  title: "Stylist/Pages/PortalAppointmentsPage",
  component: PortalAppointmentsPage,
  decorators: [
    (Story) => (
      <Provider store={createTestStore()}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof PortalAppointmentsPage>;

export const Upcoming: Story = {};

export const Past: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        portal: {
          screen: "appointments",
          activeTab: "appointments",
          user: MOCK_USER,
          appointments: MOCK_APPOINTMENTS,
          maintenance: MOCK_MAINTENANCE,
          photos: MOCK_PHOTOS,
          pointsHistory: MOCK_POINTS_HISTORY,
          redeemable: MOCK_REDEEMABLE,
          notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
          appointmentFilter: "past",
        },
      })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
