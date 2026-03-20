import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { GoalsColorPage } from "./GoalsColorPage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof GoalsColorPage> = {
  title: "Stylist/Pages/GoalsColorPage",
  component: GoalsColorPage,
  decorators: [
    (Story) => (
      <Provider store={createTestStore({
        consultation: {
          screen: "goals-color" as const,
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
type Story = StoryObj<typeof GoalsColorPage>;

export const Default: Story = {};

const withBudgetStore = createTestStore({
  consultation: {
    screen: "goals-color" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "color" as const,
      colorService: "highlight",
      budget: "$300 – $500",
      deadline: "Wedding on April 15",
      dreamResult: "I want to go from brunette to a warm honey blonde without damage",
    },
  },
});

export const WithBudget: Story = {
  decorators: [
    (Story) => (
      <Provider store={withBudgetStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
