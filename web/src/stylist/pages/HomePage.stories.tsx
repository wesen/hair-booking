import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { HomePage } from "./HomePage";
import { store } from "../store";
import clientsReducer from "../store/clientsSlice";
import appointmentsReducer from "../store/appointmentsSlice";
import bookingReducer from "../store/bookingSlice";
import uiReducer from "../store/uiSlice";
import { INITIAL_CLIENTS } from "../data/constants";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof HomePage> = {
  title: "Stylist/Pages/HomePage",
  component: HomePage,
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
type Story = StoryObj<typeof HomePage>;

export const Default: Story = {};

const emptyDayStore = configureStore({
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
    appointments: {
      appointments: [
        { id: 1, client: "Mia Chen", service: "Haircut & Style", date: "Mar 22", time: "10:00 AM", status: "confirmed" as const },
        { id: 2, client: "Jasmine Taylor", service: "Color Full", date: "Mar 20", time: "2:00 PM", status: "confirmed" as const },
      ],
    },
    booking: { step: 0, data: {} },
    ui: { tab: "home" as const, toast: null, showReferralModal: false, referralFrom: "", referralTo: "" },
  },
});

export const EmptyDay: Story = {
  decorators: [
    (Story) => (
      <Provider store={emptyDayStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
