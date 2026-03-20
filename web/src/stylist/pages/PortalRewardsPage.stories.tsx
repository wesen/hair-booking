import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { PortalRewardsPage } from "./PortalRewardsPage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PortalRewardsPage> = {
  title: "Stylist/Pages/PortalRewardsPage",
  component: PortalRewardsPage,
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
type Story = StoryObj<typeof PortalRewardsPage>;

export const Default: Story = {};
