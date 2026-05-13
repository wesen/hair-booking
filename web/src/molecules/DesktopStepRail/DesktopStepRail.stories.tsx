import type { Meta, StoryObj } from "@storybook/react";
import { DesktopStepRail } from "./DesktopStepRail";
import { color } from "../../fringe-ui/tokens";

const meta: Meta<typeof DesktopStepRail> = {
  title: "Molecules/DesktopStepRail",
  component: DesktopStepRail,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DesktopStepRail>;

const steps = [
  "01 Service", "02 Color", "03 Length", "04 Photos",
  "05 History", "06 Budget", "07 Estimate", "08 Booking", "09 Confirm",
];

export const Step1: Story = {
  name: "Step 1 — Service",
  args: { steps, current: 0, accent: color.plum },
};

export const Step7Butter: Story = {
  name: "Step 7 — Estimate (Butter)",
  args: { steps, current: 6, accent: color.butter },
};

export const Step8Sage: Story = {
  name: "Step 8 — Booking (Sage)",
  args: { steps, current: 7, accent: color.sage },
};

export const Step9Butter: Story = {
  name: "Step 9 — Confirm (Butter)",
  args: { steps, current: 8, accent: color.butter },
};
