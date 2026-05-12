import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { BookingData, Service } from "../types";

interface BookingState {
  step: number;
  data: BookingData;
}

const initialState: BookingState = {
  step: 0,
  data: {},
};

const bookingSlice = createSlice({
  name: "booking",
  initialState,
  reducers: {
    setStep(state, action: PayloadAction<number>) {
      state.step = action.payload;
    },
    nextStep(state) {
      state.step += 1;
    },
    prevStep(state) {
      if (state.step > 0) state.step -= 1;
    },
    selectService(state, action: PayloadAction<Service>) {
      state.data.service = action.payload;
    },
    selectDate(state, action: PayloadAction<string>) {
      state.data.date = action.payload;
    },
    selectTime(state, action: PayloadAction<string>) {
      state.data.time = action.payload;
    },
    setClientInfo(state, action: PayloadAction<{ clientName?: string; clientPhone?: string; notes?: string }>) {
      Object.assign(state.data, action.payload);
    },
    resetBooking(state) {
      state.step = 0;
      state.data = {};
    },
  },
});

export const {
  setStep,
  nextStep,
  prevStep,
  selectService,
  selectDate,
  selectTime,
  setClientInfo,
  resetBooking,
} = bookingSlice.actions;
export default bookingSlice.reducer;
