import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Tab } from "../types";

interface UiState {
  tab: Tab;
  toast: string | null;
  showReferralModal: boolean;
  referralFrom: string;
  referralTo: string;
}

const initialState: UiState = {
  tab: "home",
  toast: null,
  showReferralModal: false,
  referralFrom: "",
  referralTo: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setTab(state, action: PayloadAction<Tab>) {
      state.tab = action.payload;
    },
    showToast(state, action: PayloadAction<string>) {
      state.toast = action.payload;
    },
    clearToast(state) {
      state.toast = null;
    },
    openReferralModal(state, action: PayloadAction<string | undefined>) {
      state.showReferralModal = true;
      if (action.payload) state.referralFrom = action.payload;
    },
    closeReferralModal(state) {
      state.showReferralModal = false;
      state.referralFrom = "";
      state.referralTo = "";
    },
    setReferralFrom(state, action: PayloadAction<string>) {
      state.referralFrom = action.payload;
    },
    setReferralTo(state, action: PayloadAction<string>) {
      state.referralTo = action.payload;
    },
  },
});

export const {
  setTab,
  showToast,
  clearToast,
  openReferralModal,
  closeReferralModal,
  setReferralFrom,
  setReferralTo,
} = uiSlice.actions;
export default uiSlice.reducer;
