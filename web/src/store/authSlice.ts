import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  showDepositSheet: boolean;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardZip: string;
  paymentError: string | null;
  paymentProcessing: boolean;
}

const initialState: AuthState = {
  showDepositSheet: false,
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  cardZip: "",
  paymentError: null,
  paymentProcessing: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuth() {
      return initialState;
    },
    // Payment
    openDepositSheet(state) {
      state.showDepositSheet = true;
      state.paymentError = null;
    },
    closeDepositSheet(state) {
      state.showDepositSheet = false;
      state.paymentError = null;
    },
    setCardNumber(state, action: PayloadAction<string>) {
      state.cardNumber = action.payload;
    },
    setCardExpiry(state, action: PayloadAction<string>) {
      state.cardExpiry = action.payload;
    },
    setCardCvc(state, action: PayloadAction<string>) {
      state.cardCvc = action.payload;
    },
    setCardZip(state, action: PayloadAction<string>) {
      state.cardZip = action.payload;
    },
    startPayment(state) {
      state.paymentProcessing = true;
      state.paymentError = null;
    },
    paymentSuccess(state) {
      state.paymentProcessing = false;
      state.showDepositSheet = false;
    },
    paymentFail(state, action: PayloadAction<string>) {
      state.paymentProcessing = false;
      state.paymentError = action.payload;
    },
  },
});

export const {
  resetAuth,
  openDepositSheet,
  closeDepositSheet,
  setCardNumber,
  setCardExpiry,
  setCardCvc,
  setCardZip,
  startPayment,
  paymentSuccess,
  paymentFail,
} = authSlice.actions;

export default authSlice.reducer;
