import type { Meta, StoryObj } from "@storybook/react";
import { LoyaltyBadgeCompact } from "./LoyaltyBadgeCompact";
import "../styles/stylist.css";
import "../styles/theme-default.css";

const meta: Meta<typeof LoyaltyBadgeCompact> = {
  title: "Stylist/Portal/LoyaltyBadgeCompact",
  component: LoyaltyBadgeCompact,
  decorators: [
    (Story) => (
      <div data-widget="stylist" style={{ maxWidth: 430 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof LoyaltyBadgeCompact>;

export const Gold: Story = {
  args: {
    tier: "Gold",
    tierIcon: "🥇",
    points: 320,
    pointsToNext: 80,
    nextTier: "Diamond",
  },
};

export const Diamond: Story = {
  args: {
    tier: "Diamond",
    tierIcon: "💎",
    points: 500,
    pointsToNext: 0,
    nextTier: null,
  },
};

export const Bronze: Story = {
  args: {
    tier: "Bronze",
    tierIcon: "🥉",
    points: 45,
    pointsToNext: 155,
    nextTier: "Silver",
  },
};
