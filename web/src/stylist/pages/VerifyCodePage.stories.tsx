import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { VerifyCodePage } from "./VerifyCodePage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof VerifyCodePage> = {
  title: "Stylist/Pages/VerifyCodePage",
  component: VerifyCodePage,
};

export default meta;
type Story = StoryObj<typeof VerifyCodePage>;

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

export const WithPortalShell: Story = {
  args: {},
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
