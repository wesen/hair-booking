import type { Meta, StoryObj } from "@storybook/react";
import { RedeemList } from "./RedeemList";
import { MOCK_REDEEMABLE } from "../data/portal-data";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof RedeemList> = {
  title: "Stylist/Portal/RedeemList",
  component: RedeemList,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof RedeemList>;

export const Default: Story = {
  args: {
    rewards: MOCK_REDEEMABLE,
    userPoints: 320,
  },
};
