import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import clientsReducer from "./clientsSlice";
import appointmentsReducer from "./appointmentsSlice";
import bookingReducer from "./bookingSlice";
import uiReducer from "./uiSlice";
import consultationReducer from "./consultationSlice";
import authReducer from "./authSlice";
import portalReducer from "./portalSlice";
import { stylistApi } from "./api";

export const rootReducer = combineReducers({
  clients: clientsReducer,
  appointments: appointmentsReducer,
  booking: bookingReducer,
  ui: uiReducer,
  consultation: consultationReducer,
  auth: authReducer,
  portal: portalReducer,
  [stylistApi.reducerPath]: stylistApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function createAppStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(stylistApi.middleware),
    preloadedState: preloadedState as RootState | undefined,
  });
}

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore["dispatch"];

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export { stylistApi };
