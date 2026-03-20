import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type {
  PortalTab,
  PortalScreen,
  UserProfile,
  PhotoEntry,
  PointsHistoryItem,
  RedeemableReward,
} from "../types";
import {
  MOCK_USER,
  MOCK_PHOTOS,
  MOCK_POINTS_HISTORY,
  MOCK_REDEEMABLE,
} from "../data/portal-data";

interface PortalState {
  screen: PortalScreen;
  activeTab: PortalTab;
  user: UserProfile;
  photos: PhotoEntry[];
  pointsHistory: PointsHistoryItem[];
  redeemable: RedeemableReward[];
  appointmentFilter: "upcoming" | "past";
}

const initialState: PortalState = {
  screen: "home",
  activeTab: "home",
  user: MOCK_USER,
  photos: MOCK_PHOTOS,
  pointsHistory: MOCK_POINTS_HISTORY,
  redeemable: MOCK_REDEEMABLE,
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
  redeemReward,
} = portalSlice.actions;

export default portalSlice.reducer;
