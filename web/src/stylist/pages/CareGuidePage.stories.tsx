import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { CareGuidePage } from "./CareGuidePage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof CareGuidePage> = {
  title: "Stylist/Pages/CareGuidePage",
  component: CareGuidePage,
};

export default meta;
type Story = StoryObj<typeof CareGuidePage>;

export const Default: Story = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore()}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};
