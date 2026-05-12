import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { StylistApp } from "./StylistApp";
import clientsReducer from "./store/clientsSlice";
import appointmentsReducer from "./store/appointmentsSlice";
import bookingReducer from "./store/bookingSlice";
import uiReducer from "./store/uiSlice";
import "../stylist/styles/stylist.css";
import "../stylist/styles/theme-default.css";

function createStore(overrides?: Record<string, unknown>) {
  return configureStore({
    reducer: {
      clients: clientsReducer,
      appointments: appointmentsReducer,
      booking: bookingReducer,
      ui: uiReducer,
    },
    ...overrides,
  });
}

const meta = {
  title: "Stylist/App",
  component: StylistApp,
  decorators: [
    (Story) => (
      <Provider store={createStore()}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof StylistApp>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DarkTheme: Story = {
  args: {
    themeVars: {
      "--color-bg": "#1a1412",
      "--color-bg2": "#241e1a",
      "--color-surface": "#2a2420",
      "--color-accent": "#d4a080",
      "--color-accent-light": "#3a2e28",
      "--color-accent-dark": "#e8b898",
      "--color-gold": "#d4b878",
      "--color-gold-light": "#3a3428",
      "--color-text": "#f0e8e4",
      "--color-text-secondary": "#b8a89e",
      "--color-text-muted": "#887870",
      "--color-border": "#3a3430",
      "--color-success": "#7bb08a",
      "--color-warning": "#d4935a",
      "--color-danger": "#c97070",
    },
  },
  parameters: {
    backgrounds: { default: "dark" },
  },
};

export const MinimalTheme: Story = {
  args: {
    themeVars: {
      "--color-bg": "#ffffff",
      "--color-surface": "#f8f8f8",
      "--color-accent": "#2563eb",
      "--color-accent-light": "#eff6ff",
      "--color-accent-dark": "#1d4ed8",
      "--color-gold": "#f59e0b",
      "--color-gold-light": "#fffbeb",
      "--color-text": "#111827",
      "--color-text-secondary": "#6b7280",
      "--color-text-muted": "#9ca3af",
      "--color-border": "#e5e7eb",
      "--font-serif": "'DM Sans', sans-serif",
      "--radius-sm": "4px",
      "--radius-md": "6px",
      "--radius-lg": "8px",
      "--radius-xl": "8px",
    },
  },
};

export const Unstyled: Story = {
  args: {
    unstyled: true,
  },
};
