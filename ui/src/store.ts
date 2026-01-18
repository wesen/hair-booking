import { configureStore, createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  isNavOpen: boolean
}

const initialState: UiState = {
  isNavOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setNavOpen(state, action: PayloadAction<boolean>) {
      state.isNavOpen = action.payload
    },
    toggleNav(state) {
      state.isNavOpen = !state.isNavOpen
    },
  },
})

export const { setNavOpen, toggleNav } = uiSlice.actions

export const store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
