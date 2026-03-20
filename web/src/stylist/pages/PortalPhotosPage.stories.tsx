import type { Meta, StoryObj } from "@storybook/react";
import { Provider } from "react-redux";
import { PortalPhotosPage } from "./PortalPhotosPage";
import { createTestStore } from "../store/test-utils";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof PortalPhotosPage> = {
  title: "Stylist/Pages/PortalPhotosPage",
  component: PortalPhotosPage,
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
type Story = StoryObj<typeof PortalPhotosPage>;

export const Default: Story = {};
