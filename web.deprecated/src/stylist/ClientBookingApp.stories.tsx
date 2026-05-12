import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import type { ReactElement } from "react";
import { ClientBookingApp } from "./ClientBookingApp";
import { createTestStore } from "./store/test-utils";
import { INITIAL_CONSULTATION_DATA } from "./data/consultation-constants";
import "./styles/stylist.css";
import "./styles/theme-default.css";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withProvider = (store = createTestStore()): ((Story: any) => ReactElement) => {
  return (Story) => (
    <Provider store={store}>
      <Story />
    </Provider>
  );
};

const meta: Meta<typeof ClientBookingApp> = {
  title: "Stylist/ClientBookingApp",
  component: ClientBookingApp,
  decorators: [withProvider()],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof ClientBookingApp>;

export const Default: Story = {};

export const ExtensionsFlow: Story = {
  decorators: [
    withProvider(
      createTestStore({
        consultation: {
          screen: "intake-ext",
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "extensions" },
        },
      })
    ),
  ],
};

export const ColorFlow: Story = {
  decorators: [
    withProvider(
      createTestStore({
        consultation: {
          screen: "intake-color",
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "color" },
        },
      })
    ),
  ],
};

export const Confirm: Story = {
  decorators: [
    withProvider(
      createTestStore({
        consultation: {
          screen: "confirm",
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "color" },
        },
      })
    ),
  ],
};