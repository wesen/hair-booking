import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BookingPage } from "./BookingPage";
import { INITIAL_CLIENTS, SERVICES } from "../data/constants";
import clientsReducer from "../store/clientsSlice";
import appointmentsReducer from "../store/appointmentsSlice";
import bookingReducer from "../store/bookingSlice";
import uiReducer from "../store/uiSlice";
import "../styles/stylist.css";
import "../styles/theme-default.css";

function makeStore(bookingState: { step: number; data: Record<string, unknown> }) {
  return configureStore({
    reducer: {
      clients: clientsReducer,
      appointments: appointmentsReducer,
      booking: bookingReducer,
      ui: uiReducer,
    },
    preloadedState: {
      clients: {
        clients: INITIAL_CLIENTS,
        search: "",
        selectedClientId: null,
      },
      appointments: { appointments: [] },
      booking: bookingState as never,
      ui: { tab: "book" as const, toast: null, showReferralModal: false, referralFrom: "", referralTo: "" },
    },
  });
}

const meta: Meta<typeof BookingPage> = {
  title: "Stylist/Pages/BookingPage",
  component: BookingPage,
};

export default meta;
type Story = StoryObj<typeof BookingPage>;

const step1Store = makeStore({ step: 1, data: {} });

export const Step1_ServiceSelection: Story = {
  decorators: [
    (Story) => (
      <Provider store={step1Store}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const step2Store = makeStore({
  step: 2,
  data: {
    service: SERVICES[0],
  },
});

export const Step2_DateAndTime: Story = {
  decorators: [
    (Story) => (
      <Provider store={step2Store}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const step3Store = makeStore({
  step: 3,
  data: {
    service: SERVICES[0],
    date: "Mar 22",
    time: "10:00 AM",
  },
});

export const Step3_ClientInfo: Story = {
  decorators: [
    (Story) => (
      <Provider store={step3Store}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const step4Store = makeStore({
  step: 4,
  data: {
    service: SERVICES[0],
    date: "Mar 22",
    time: "10:00 AM",
    clientName: "Mia Chen",
    clientPhone: "(555) 234-5678",
    notes: "Prefers layers",
  },
});

export const Step4_Confirmation: Story = {
  decorators: [
    (Story) => (
      <Provider store={step4Store}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
