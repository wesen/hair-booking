import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ClientBookingApp } from "./ClientBookingApp";
import { createTestStore } from "./store/test-utils";
import { INITIAL_CONSULTATION_DATA } from "./data/consultation-constants";
import "./styles/stylist.css";
import "./styles/theme-default.css";

const meta = {
  title: "Stylist/ClientBookingApp",
  component: ClientBookingApp,
  decorators: [
    (Story) => (
      <Provider store={createTestStore()}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof ClientBookingApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ExtensionsFlow: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "intake-ext",
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "extensions" },
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
};

export const ColorFlow: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "intake-color",
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "color" },
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
};

export const EstimateScreen: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "estimate",
          data: {
            ...INITIAL_CONSULTATION_DATA,
            serviceType: "extensions",
            extType: "ktip",
            desiredLength: 3,
            budget: "$800 – $1,200",
            maintenance: "Every 6–8 weeks",
          },
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
};

export const ConfirmationScreen: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "confirm",
          data: {
            ...INITIAL_CONSULTATION_DATA,
            serviceType: "extensions",
            extType: "ktip",
            selectedDate: "2026-03-28",
            selectedTime: "10:00 AM",
            depositPaid: true,
          },
        },
      })}>
        <Story />
      </Provider>
    ),
  ],
};
