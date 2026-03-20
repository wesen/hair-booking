import type { Meta, StoryObj } from "@storybook/react";
import { RewardItem } from "./RewardItem";
import { REWARDS } from "../data/constants";

const meta: Meta<typeof RewardItem> = {
  title: "Stylist/RewardItem",
  component: RewardItem,
};

export default meta;
type Story = StoryObj<typeof RewardItem>;

export const Default: Story = {
  args: {
    pts: 100,
    name: "Free Conditioning Add-on",
    desc: "With any service",
  },
};

export const Expensive: Story = {
  args: {
    pts: 750,
    name: "Free Color Service",
    desc: "Up to $150 value",
  },
};

export const AllRewards: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {REWARDS.map((reward) => (
        <RewardItem
          key={reward.pts}
          pts={reward.pts}
          name={reward.name}
          desc={reward.desc}
        />
      ))}
    </div>
  ),
};
