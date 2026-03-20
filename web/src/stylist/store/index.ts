import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import clientsReducer from "./clientsSlice";
import appointmentsReducer from "./appointmentsSlice";
import bookingReducer from "./bookingSlice";
import uiReducer from "./uiSlice";
import consultationReducer from "./consultationSlice";
import authReducer from "./authSlice";
import portalReducer from "./portalSlice";

export const store = configureStore({
  reducer: {
    clients: clientsReducer,
    appointments: appointmentsReducer,
    booking: bookingReducer,
    ui: uiReducer,
    consultation: consultationReducer,
    auth: authReducer,
    portal: portalReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
