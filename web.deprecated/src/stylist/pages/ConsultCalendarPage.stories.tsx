import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ConsultCalendarPage } from "./ConsultCalendarPage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof ConsultCalendarPage> = {
  title: "Stylist/Pages/ConsultCalendarPage",
  component: ConsultCalendarPage,
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "calendar" as const,
          data: {
            ...INITIAL_CONSULTATION_DATA,
            serviceType: "extensions" as const,
            depositPaid: false,
          },
        },
      })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ConsultCalendarPage>;

export const Default: Story = {};

const withDateStore = createTestStore({
  consultation: {
    screen: "calendar" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      selectedDate: "2026-03-28",
      selectedTime: null,
      depositPaid: false,
    },
  },
});

export const WithDateSelected: Story = {
  decorators: [
    (Story) => (
      <Provider store={withDateStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const withDepositStore = createTestStore({
  consultation: {
    screen: "calendar" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      selectedDate: "2026-03-28",
      selectedTime: "10:00 AM",
      depositPaid: true,
    },
  },
});

export const WithDeposit: Story = {
  decorators: [
    (Story) => (
      <Provider store={withDepositStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
