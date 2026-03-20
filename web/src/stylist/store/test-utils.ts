import { combineReducers, configureStore } from "@reduxjs/toolkit";
import clientsReducer from "./clientsSlice";
import appointmentsReducer from "./appointmentsSlice";
import bookingReducer from "./bookingSlice";
import uiReducer from "./uiSlice";
import consultationReducer from "./consultationSlice";
import authReducer from "./authSlice";
import portalReducer from "./portalSlice";

const rootReducer = combineReducers({
  clients: clientsReducer,
  appointments: appointmentsReducer,
  booking: bookingReducer,
  ui: uiReducer,
  consultation: consultationReducer,
  auth: authReducer,
  portal: portalReducer,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createTestStore(preloadedState?: any) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}
