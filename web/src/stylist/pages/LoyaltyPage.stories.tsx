import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { LoyaltyPage } from "./LoyaltyPage";
import { store } from "../store";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof LoyaltyPage> = {
  title: "Stylist/Pages/LoyaltyPage",
  component: LoyaltyPage,
  decorators: [
    (Story) => (
      <Provider store={store}>
        <div data-widget="stylist" style={{ maxWidth: 430 }}>
          <Story />
        </div>
      </Provider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoyaltyPage>;

export const Default: Story = {};
