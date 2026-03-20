import type { Meta, StoryObj } from "@storybook/react";
import { TierCard } from "./TierCard";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof TierCard> = {
  title: "Stylist/Portal/TierCard",
  component: TierCard,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TierCard>;

export const Gold: Story = {
  args: {
    tier: "Gold",
    tierIcon: "🥇",
    points: 320,
    pointsToNext: 80,
    nextTier: "Diamond",
    perks: ["15% off all services", "Free deep conditioning"],
  },
};

export const Diamond: Story = {
  args: {
    tier: "Diamond",
    tierIcon: "💎",
    points: 500,
    pointsToNext: 0,
    nextTier: null,
    perks: ["20% off all services", "Free deep conditioning", "Priority booking", "Complimentary blowout"],
  },
};
