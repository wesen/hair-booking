import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Appointment } from "../types";
import { INITIAL_APPOINTMENTS } from "../data/constants";

interface AppointmentsState {
  appointments: Appointment[];
}

const initialState: AppointmentsState = {
  appointments: INITIAL_APPOINTMENTS,
};

const appointmentsSlice = createSlice({
  name: "appointments",
  initialState,
  reducers: {
    addAppointment(state, action: PayloadAction<Omit<Appointment, "id">>) {
      const id = state.appointments.length > 0
        ? Math.max(...state.appointments.map(a => a.id)) + 1
        : 1;
      state.appointments.push({ ...action.payload, id });
    },
  },
});

export const { addAppointment } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
