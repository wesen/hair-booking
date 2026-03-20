import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { SchedulePage } from "./SchedulePage";
import { store } from "../store";
import clientsReducer from "../store/clientsSlice";
import appointmentsReducer from "../store/appointmentsSlice";
import bookingReducer from "../store/bookingSlice";
import uiReducer from "../store/uiSlice";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof SchedulePage> = {
  title: "Stylist/Pages/SchedulePage",
  component: SchedulePage,
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
type Story = StoryObj<typeof SchedulePage>;

export const Default: Story = {};

const manyAppointmentsStore = configureStore({
  reducer: {
    clients: clientsReducer,
    appointments: appointmentsReducer,
    booking: bookingReducer,
    ui: uiReducer,
  },
  preloadedState: {
    clients: { clients: [], search: "", selectedClientId: null },
    appointments: {
      appointments: [
        { id: 1, client: "Mia Chen", service: "Haircut & Style", date: "Mar 19", time: "9:00 AM", status: "confirmed" as const },
        { id: 2, client: "Jasmine Taylor", service: "Color Full", date: "Mar 19", time: "10:30 AM", status: "confirmed" as const },
        { id: 3, client: "Olivia Park", service: "Blowout", date: "Mar 19", time: "12:00 PM", status: "pending" as const },
        { id: 4, client: "Sophia Rivera", service: "Highlights/Balayage", date: "Mar 20", time: "9:00 AM", status: "confirmed" as const },
        { id: 5, client: "Emma Williams", service: "Deep Conditioning", date: "Mar 20", time: "11:00 AM", status: "pending" as const },
        { id: 6, client: "Mia Chen", service: "Trim", date: "Mar 21", time: "2:00 PM", status: "confirmed" as const },
        { id: 7, client: "Jasmine Taylor", service: "Keratin Treatment", date: "Mar 22", time: "10:00 AM", status: "pending" as const },
        { id: 8, client: "Sophia Rivera", service: "Updo/Special Event", date: "Mar 23", time: "3:00 PM", status: "confirmed" as const },
        { id: 9, client: "Olivia Park", service: "Haircut & Style", date: "Mar 24", time: "1:00 PM", status: "pending" as const },
      ],
    },
    booking: { step: 0, data: {} },
    ui: { tab: "schedule" as const, toast: null, showReferralModal: false, referralFrom: "", referralTo: "" },
  },
});

export const ManyAppointments: Story = {
  decorators: [
    (Story) => (
      <Provider store={manyAppointmentsStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
