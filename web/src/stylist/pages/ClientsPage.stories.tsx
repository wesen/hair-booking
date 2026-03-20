import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { ClientsPage } from "./ClientsPage";
import { store } from "../store";
import { INITIAL_CLIENTS } from "../data/constants";
import clientsReducer from "../store/clientsSlice";
import appointmentsReducer from "../store/appointmentsSlice";
import bookingReducer from "../store/bookingSlice";
import uiReducer from "../store/uiSlice";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof ClientsPage> = {
  title: "Stylist/Pages/ClientsPage",
  component: ClientsPage,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ClientsPage>;

export const Default: Story = {};

const withSearchStore = configureStore({
  reducer: {
    clients: clientsReducer,
    appointments: appointmentsReducer,
    booking: bookingReducer,
    ui: uiReducer,
  },
  preloadedState: {
    clients: {
      clients: INITIAL_CLIENTS,
      search: "Mia",
      selectedClientId: null,
    },
    appointments: { appointments: [] },
    booking: { step: 0, data: {} },
    ui: { tab: "clients" as const, toast: null, showReferralModal: false, referralFrom: "", referralTo: "" },
  },
});

export const WithSearch: Story = {
  decorators: [
    (Story) => (
      <Provider store={withSearchStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const selectedClientStore = configureStore({
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
      selectedClientId: 4,
    },
    appointments: { appointments: [] },
    booking: { step: 0, data: {} },
    ui: { tab: "clients" as const, toast: null, showReferralModal: false, referralFrom: "", referralTo: "" },
  },
});

export const SelectedClient: Story = {
  decorators: [
    (Story) => (
      <Provider store={selectedClientStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
