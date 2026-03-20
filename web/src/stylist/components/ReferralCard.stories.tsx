import type { Meta, StoryObj } from "@storybook/react";
import { ReferralCard } from "./ReferralCard";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof ReferralCard> = {
  title: "Stylist/Portal/ReferralCard",
  component: ReferralCard,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ReferralCard>;

export const Default: Story = {
  args: {
    code: "LUXE-MIA",
    discount: "$25 off for you & them",
    referralCount: 2,
  },
};
