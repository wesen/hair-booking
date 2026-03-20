import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ConsultConfirmPage } from "./ConsultConfirmPage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof ConsultConfirmPage> = {
  title: "Stylist/Pages/ConsultConfirmPage",
  component: ConsultConfirmPage,
};

export default meta;
type Story = StoryObj<typeof ConsultConfirmPage>;

const extState = {
  consultation: {
    screen: "confirm" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      extType: "ktip",
      selectedDate: "2026-03-28",
      selectedTime: "10:00 AM",
      depositPaid: false,
    },
  },
};

export const Default: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore(extState)}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const depositState = {
  consultation: {
    screen: "confirm" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      extType: "weft",
      selectedDate: "2026-03-30",
      selectedTime: "2:00 PM",
      depositPaid: true,
    },
  },
};

export const WithDeposit: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore(depositState)}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const colorState = {
  consultation: {
    screen: "confirm" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "color" as const,
      colorService: "highlight",
      selectedDate: "2026-04-02",
      selectedTime: "11:30 AM",
      depositPaid: false,
    },
  },
};

export const ColorConsult: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore(colorState)}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
