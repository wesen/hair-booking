import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ConsultationData, ConsultationScreen, ConsultationServiceType } from "../types";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";

interface ConsultationState {
  screen: ConsultationScreen;
  data: ConsultationData;
}

const initialState: ConsultationState = {
  screen: "welcome",
  data: INITIAL_CONSULTATION_DATA,
};

function getSteps(serviceType: ConsultationServiceType | null): ConsultationScreen[] {
  if (serviceType === "extensions") return ["intake-ext", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  if (serviceType === "color") return ["intake-color", "photos", "goals-color", "estimate", "calendar", "confirm"];
  if (serviceType === "both") return ["intake-ext", "intake-color", "photos", "goals-ext", "estimate", "calendar", "confirm"];
  return [];
}

const consultationSlice = createSlice({
  name: "consultation",
  initialState,
  reducers: {
    goToScreen(state, action: PayloadAction<ConsultationScreen>) {
      state.screen = action.payload;
    },
    goNext(state) {
      const steps = getSteps(state.data.serviceType);
      const idx = steps.indexOf(state.screen);
      if (idx >= 0 && idx < steps.length - 1) {
        state.screen = steps[idx + 1];
      }
    },
    goBack(state) {
      const steps = getSteps(state.data.serviceType);
      const idx = steps.indexOf(state.screen);
      if (idx > 0) {
        state.screen = steps[idx - 1];
      } else {
        state.screen = "welcome";
      }
    },
    updateData(state, action: PayloadAction<Partial<ConsultationData>>) {
      Object.assign(state.data, action.payload);
    },
    selectServiceType(state, action: PayloadAction<ConsultationServiceType>) {
      state.data.serviceType = action.payload;
    },
    toggleChemicalHistory(state, action: PayloadAction<string>) {
      const arr = state.data.chemicalHistory;
      const idx = arr.indexOf(action.payload);
      if (idx >= 0) {
        arr.splice(idx, 1);
      } else {
        arr.push(action.payload);
      }
    },
    simulatePhoto(state, action: PayloadAction<"photoFront" | "photoBack" | "photoHairline">) {
      (state.data as Record<string, unknown>)[action.payload] = `photo_${Date.now()}`;
    },
    addInspoPhoto(state) {
      state.data.inspoPhotos.push(`inspo_${Date.now()}`);
    },
    setDepositPaid(state, action: PayloadAction<boolean>) {
      state.data.depositPaid = action.payload;
    },
    resetConsultation() {
      return initialState;
    },
  },
  selectors: {
    selectSteps: (state) => getSteps(state.data.serviceType),
    selectCurrentStepIndex: (state) => {
      const steps = getSteps(state.data.serviceType);
      return steps.indexOf(state.screen);
    },
    selectTotalSteps: (state) => getSteps(state.data.serviceType).length,
  },
});

export const {
  goToScreen,
  goNext,
  goBack,
  updateData,
  selectServiceType,
  toggleChemicalHistory,
  simulatePhoto,
  addInspoPhoto,
  setDepositPaid,
  resetConsultation,
} = consultationSlice.actions;

export const { selectSteps, selectCurrentStepIndex, selectTotalSteps } = consultationSlice.selectors;

export default consultationSlice.reducer;
