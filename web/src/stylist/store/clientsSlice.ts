import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Client } from "../types";
import { INITIAL_CLIENTS } from "../data/constants";

interface ClientsState {
  clients: Client[];
  search: string;
  selectedClientId: number | null;
}

const initialState: ClientsState = {
  clients: INITIAL_CLIENTS,
  search: "",
  selectedClientId: null,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },
    selectClient(state, action: PayloadAction<number | null>) {
      state.selectedClientId = action.payload;
    },
    addClient(state, action: PayloadAction<Client>) {
      state.clients.push(action.payload);
    },
    updateClient(state, action: PayloadAction<{ id: number; changes: Partial<Client> }>) {
      const client = state.clients.find(c => c.id === action.payload.id);
      if (client) Object.assign(client, action.payload.changes);
    },
    logVisit(state, action: PayloadAction<number>) {
      const client = state.clients.find(c => c.id === action.payload);
      if (client) {
        client.points += 40;
        client.visits += 1;
      }
    },
    addReferralPoints(state, action: PayloadAction<{ referrerId: number; friendName: string }>) {
      const referrer = state.clients.find(c => c.id === action.payload.referrerId);
      if (referrer) {
        referrer.points += 100;
        referrer.referrals += 1;
      }
      const friend = state.clients.find(c => c.name === action.payload.friendName);
      if (friend) {
        friend.points += 50;
      } else {
        state.clients.push({
          id: Math.max(...state.clients.map(c => c.id)) + 1,
          name: action.payload.friendName,
          phone: "",
          visits: 0,
          points: 50,
          referrals: 0,
          lastVisit: "—",
          notes: `Referred by ${referrer?.name ?? "unknown"}`,
          upcoming: null,
        });
      }
    },
    addBookingPoints(state, action: PayloadAction<{ clientName: string; servicePrice: number; upcoming: string }>) {
      const client = state.clients.find(c => c.name === action.payload.clientName);
      if (client) {
        client.points += Math.floor(action.payload.servicePrice * 0.4);
        client.upcoming = action.payload.upcoming;
      }
    },
  },
});

export const {
  setSearch,
  selectClient,
  addClient,
  updateClient,
  logVisit,
  addReferralPoints,
  addBookingPoints,
} = clientsSlice.actions;

export default clientsSlice.reducer;
