import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IntakeExtPage } from "./IntakeExtPage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof IntakeExtPage> = {
  title: "Stylist/Pages/IntakeExtPage",
  component: IntakeExtPage,
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "intake-ext" as const,
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "extensions" as const },
        },
      })}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof IntakeExtPage>;

export const Default: Story = {};

const partialStore = createTestStore({
  consultation: {
    screen: "intake-ext" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      hairLength: "Shoulder length",
      hairDensity: "Medium",
      hairTexture: "",
      prevExtensions: "",
    },
  },
});

export const PartiallyFilled: Story = {
  decorators: [
    (Story) => (
      <Provider store={partialStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
