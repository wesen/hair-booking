import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  PortalTab,
  PortalScreen,
  UserProfile,
  AppointmentDetail,
  MaintenanceItem,
  PhotoEntry,
  PointsHistoryItem,
  RedeemableReward,
  NotificationPref,
} from "../types";
import {
  MOCK_USER,
  MOCK_APPOINTMENTS,
  MOCK_MAINTENANCE,
  MOCK_PHOTOS,
  MOCK_POINTS_HISTORY,
  MOCK_REDEEMABLE,
  DEFAULT_NOTIFICATION_PREFS,
} from "../data/portal-data";

interface PortalState {
  screen: PortalScreen;
  activeTab: PortalTab;
  user: UserProfile;
  appointments: AppointmentDetail[];
  maintenance: MaintenanceItem[];
  photos: PhotoEntry[];
  pointsHistory: PointsHistoryItem[];
  redeemable: RedeemableReward[];
  notificationPrefs: NotificationPref[];
  appointmentFilter: "upcoming" | "past";
}

const initialState: PortalState = {
  screen: "home",
  activeTab: "home",
  user: MOCK_USER,
  appointments: MOCK_APPOINTMENTS,
  maintenance: MOCK_MAINTENANCE,
  photos: MOCK_PHOTOS,
  pointsHistory: MOCK_POINTS_HISTORY,
  redeemable: MOCK_REDEEMABLE,
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  appointmentFilter: "upcoming",
};

const portalSlice = createSlice({
  name: "portal",
  initialState,
  reducers: {
    setPortalTab(state, action: PayloadAction<PortalTab>) {
      state.activeTab = action.payload;
      state.screen = action.payload;
    },
    goToProfile(state) {
      state.screen = "profile";
    },
    goBackFromProfile(state) {
      state.screen = state.activeTab;
    },
    setAppointmentFilter(state, action: PayloadAction<"upcoming" | "past">) {
      state.appointmentFilter = action.payload;
    },
    cancelAppointment(state, action: PayloadAction<number>) {
      const appt = state.appointments.find(a => a.id === action.payload);
      if (appt) appt.status = "cancelled";
    },
    toggleNotificationPref(state, action: PayloadAction<string>) {
      const pref = state.notificationPrefs.find(p => p.key === action.payload);
      if (pref) pref.on = !pref.on;
    },
    redeemReward(state, action: PayloadAction<number>) {
      const reward = state.redeemable.find(r => r.cost === action.payload);
      if (reward && !reward.locked && state.user.points >= action.payload) {
        state.user.points -= action.payload;
        // Recalculate locks
        state.redeemable.forEach(r => {
          r.locked = state.user.points < r.cost;
        });
      }
    },
  },
});

export const {
  setPortalTab,
  goToProfile,
  goBackFromProfile,
  setAppointmentFilter,
  cancelAppointment,
  toggleNotificationPref,
  redeemReward,
} = portalSlice.actions;

export default portalSlice.reducer;
