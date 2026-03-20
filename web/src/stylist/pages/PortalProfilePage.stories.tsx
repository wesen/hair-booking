import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { PortalProfilePage } from "./PortalProfilePage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PortalProfilePage> = {
  title: "Stylist/Pages/PortalProfilePage",
  component: PortalProfilePage,
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
type Story = StoryObj<typeof PortalProfilePage>;

export const Default: Story = {};
