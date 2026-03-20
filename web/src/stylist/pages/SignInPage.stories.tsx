import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { SignInPage } from "./SignInPage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof SignInPage> = {
  title: "Stylist/Pages/SignInPage",
  component: SignInPage,
};

export default meta;
type Story = StoryObj<typeof SignInPage>;

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

export const PortalContext: Story = {
  args: {
    context: "portal",
  },
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
