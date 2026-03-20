import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { IntakeColorPage } from "./IntakeColorPage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof IntakeColorPage> = {
  title: "Stylist/Pages/IntakeColorPage",
  component: IntakeColorPage,
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "intake-color" as const,
          data: { ...INITIAL_CONSULTATION_DATA, serviceType: "color" as const },
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
type Story = StoryObj<typeof IntakeColorPage>;

export const Default: Story = {};

const colorSelectedStore = createTestStore({
  consultation: {
    screen: "intake-color" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "color" as const,
      colorService: "highlight",
      naturalLevel: "6",
      currentColor: "Medium brown with some highlights",
      chemicalHistory: ["Salon color", "Bleach / highlights"],
      lastChemical: "Highlights, 3 months ago",
    },
  },
});

export const WithColorSelected: Story = {
  decorators: [
    (Story) => (
      <Provider store={colorSelectedStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
