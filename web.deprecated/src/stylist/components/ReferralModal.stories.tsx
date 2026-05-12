import type { Meta, StoryObj } from "@storybook/react";
import { ReferralModal } from "./ReferralModal";
import { INITIAL_CLIENTS } from "../data/constants";

const meta: Meta<typeof ReferralModal> = {
  title: "Stylist/ReferralModal",
  component: ReferralModal,
};

export default meta;
type Story = StoryObj<typeof ReferralModal>;

export const Default: Story = {
  args: {
    clients: INITIAL_CLIENTS,
    referralFrom: "",
    referralTo: "",
  },
};

export const PrefilledReferrer: Story = {
  args: {
    clients: INITIAL_CLIENTS,
    referralFrom: "Sophia Rivera",
    referralTo: "",
  },
};

export const Complete: Story = {
  args: {
    clients: INITIAL_CLIENTS,
    referralFrom: "Sophia Rivera",
    referralTo: "Alexandra Kim",
  },
};
