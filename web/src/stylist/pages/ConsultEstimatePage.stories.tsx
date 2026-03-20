import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ConsultEstimatePage } from "./ConsultEstimatePage";
import { INITIAL_CONSULTATION_DATA } from "../data/consultation-constants";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof ConsultEstimatePage> = {
  title: "Stylist/Pages/ConsultEstimatePage",
  component: ConsultEstimatePage,
};

export default meta;
type Story = StoryObj<typeof ConsultEstimatePage>;

const extStore = createTestStore({
  consultation: {
    screen: "estimate" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "extensions" as const,
      extType: "ktip",
      desiredLength: 2,
      budget: "$800 – $1,200",
      maintenance: "Every 6–8 weeks",
    },
  },
});

export const Extensions: Story = {
  decorators: [
    (Story) => (
      <Provider store={extStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const colorStore = createTestStore({
  consultation: {
    screen: "estimate" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "color" as const,
      colorService: "highlight",
      budget: "$300 – $500",
    },
  },
});

export const Color: Story = {
  decorators: [
    (Story) => (
      <Provider store={colorStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

const bothStore = createTestStore({
  consultation: {
    screen: "estimate" as const,
    data: {
      ...INITIAL_CONSULTATION_DATA,
      serviceType: "both" as const,
      extType: "weft",
      desiredLength: 3,
      colorService: "full",
      budget: "$1,200 – $1,800",
      maintenance: "Every 4–6 weeks (ideal)",
    },
  },
});

export const Both: Story = {
  decorators: [
    (Story) => (
      <Provider store={bothStore}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
