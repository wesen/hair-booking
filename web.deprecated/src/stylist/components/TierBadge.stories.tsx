import type { Meta, StoryObj } from "@storybook/react";
import { TierBadge } from "./TierBadge";
import { getTier } from "../utils/loyalty";

const meta: Meta<typeof TierBadge> = {
  title: "Stylist/TierBadge",
  component: TierBadge,
};

export default meta;
type Story = StoryObj<typeof TierBadge>;

export const Bronze: Story = {
  args: { tier: getTier(50) },
};

export const Silver: Story = {
  args: { tier: getTier(200) },
};

export const Gold: Story = {
  args: { tier: getTier(500) },
};

export const Diamond: Story = {
  args: { tier: getTier(900) },
};

export const AllTiers: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8 }}>
      <TierBadge tier={getTier(50)} />
      <TierBadge tier={getTier(200)} />
      <TierBadge tier={getTier(500)} />
      <TierBadge tier={getTier(900)} />
    </div>
  ),
};
