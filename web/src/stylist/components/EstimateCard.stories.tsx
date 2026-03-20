import type { Meta, StoryObj } from "@storybook/react";
import { EstimateCard } from "./EstimateCard";
import { estimatePrice } from "../utils/estimate";

const meta: Meta<typeof EstimateCard> = {
  title: "Stylist/Consultation/EstimateCard",
  component: EstimateCard,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Extensions: Story = {
  args: {
    estimate: estimatePrice({ serviceType: "extensions", extType: "tape", desiredLength: 2, colorService: "" }),
    serviceLabel: "Tape-in Extensions",
    maintenance: "every 6–8 weeks",
  },
};

export const Color: Story = {
  args: {
    estimate: estimatePrice({ serviceType: "color", extType: "", desiredLength: 2, colorService: "highlight" }),
    serviceLabel: "Highlights / Balayage",
  },
};

export const Both: Story = {
  args: {
    estimate: estimatePrice({ serviceType: "both", extType: "ktip", desiredLength: 3, colorService: "highlight" }),
    serviceLabel: "K-tips + Highlights",
    maintenance: "every 6–8 weeks",
  },
};

export const NoMoveUps: Story = {
  args: {
    estimate: estimatePrice({ serviceType: "color", extType: "", desiredLength: 2, colorService: "full" }),
    serviceLabel: "Full Color",
  },
};
