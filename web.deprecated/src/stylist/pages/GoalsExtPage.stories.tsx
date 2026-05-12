import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { GoalsExtPage } from "./GoalsExtPage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof GoalsExtPage> = {
  title: "Stylist/Pages/GoalsExtPage",
  component: GoalsExtPage,
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "goals-ext" as const,
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
type Story = StoryObj<typeof GoalsExtPage>;

export const Default: Story = {};

const partialStore = createTestStore({
  consultation: {
    screen: "goals-ext" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      desiredLength: 3,
      extType: "ktip",
      budget: "",
      maintenance: "",
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
