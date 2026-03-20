import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  loginIdentifier: string;
  codeSentTo: string;
  codeDigits: string[];
  isVerifying: boolean;
  isAuthenticated: boolean;
  error: string | null;
  resendCooldown: number;
  showDepositSheet: boolean;
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardZip: string;
  paymentError: string | null;
  paymentProcessing: boolean;
}

const initialState: AuthState = {
  loginIdentifier: "",
  codeSentTo: "",
  codeDigits: ["", "", "", "", "", ""],
  isVerifying: false,
  isAuthenticated: false,
  error: null,
  resendCooldown: 0,
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
    setLoginIdentifier(state, action: PayloadAction<string>) {
      state.loginIdentifier = action.payload;
      state.error = null;
    },
    sendCode(state) {
      state.codeSentTo = state.loginIdentifier;
      state.isVerifying = true;
      state.resendCooldown = 60;
      state.error = null;
    },
    setCodeDigit(state, action: PayloadAction<{ index: number; value: string }>) {
      state.codeDigits[action.payload.index] = action.payload.value;
      state.error = null;
    },
    clearCode(state) {
      state.codeDigits = ["", "", "", "", "", ""];
      state.error = null;
    },
    verifySuccess(state) {
      state.isAuthenticated = true;
      state.isVerifying = false;
    },
    verifyFail(state) {
      state.error = "Invalid code. Please try again.";
    },
    decrementCooldown(state) {
      if (state.resendCooldown > 0) state.resendCooldown -= 1;
    },
    resendCode(state) {
      state.codeDigits = ["", "", "", "", "", ""];
      state.resendCooldown = 60;
      state.error = null;
    },
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
  setLoginIdentifier,
  sendCode,
  setCodeDigit,
  clearCode,
  verifySuccess,
  verifyFail,
  decrementCooldown,
  resendCode,
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
