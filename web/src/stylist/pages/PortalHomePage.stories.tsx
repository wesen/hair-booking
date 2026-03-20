import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { PortalHomePage } from "./PortalHomePage";
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

const meta: Meta<typeof PortalHomePage> = {
  title: "Stylist/Pages/PortalHomePage",
  component: PortalHomePage,
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
type Story = StoryObj<typeof PortalHomePage>;

export const Default: Story = {};

export const NoUpcoming: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        portal: {
          screen: "home",
          activeTab: "home",
          user: MOCK_USER,
          appointments: MOCK_APPOINTMENTS.map(a =>
            a.status === "confirmed" ? { ...a, status: "cancelled" as const } : a
          ),
          maintenance: MOCK_MAINTENANCE,
          photos: MOCK_PHOTOS,
          pointsHistory: MOCK_POINTS_HISTORY,
          redeemable: MOCK_REDEEMABLE,
          notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
          appointmentFilter: "upcoming",
        },
      })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
