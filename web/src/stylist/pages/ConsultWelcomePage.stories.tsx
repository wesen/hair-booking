import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { ConsultWelcomePage } from "./ConsultWelcomePage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof ConsultWelcomePage> = {
  title: "Stylist/Pages/ConsultWelcomePage",
  component: ConsultWelcomePage,
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

export default meta;
type Story = StoryObj<typeof ConsultWelcomePage>;

export const Default: Story = {};
